export interface InterpreterState {
  variables: Record<string, string | number | boolean | string[]>;
  functions: Record<string, string[]>;
  output: string[];
  problems: string[];
  logs: string[];
  inputResolver: ((val: string) => void) | null;
}

export type OutputCallback = (text: string, type: string) => void;
export type InputRequestCallback = (question: string, numberOnly: boolean) => Promise<string>;
export type StateChangeCallback = (state: InterpreterState) => void;

export function createInterpreter(
  onOutput: OutputCallback,
  onInputRequest: InputRequestCallback
) {
  const state: InterpreterState = {
    variables: {},
    functions: {},
    output: [],
    problems: [],
    logs: [],
    inputResolver: null,
  };

  function getVal(v: string): number | string {
    if (v === undefined) return 0;
    if (state.variables[v] !== undefined) return state.variables[v] as number | string;
    const n = parseFloat(v);
    return isNaN(n) ? v : n;
  }

  function replaceVars(s: string): string {
    return s.replace(/vari,(\w+)/g, (_, n) => {
      const v = state.variables[n];
      return v !== undefined
        ? Array.isArray(v)
          ? v.join(',')
          : String(v)
        : n;
    });
  }

  async function executeInstructions(lines: string[]): Promise<void> {
    let index = 0;

    // First pass: collect functions
    while (index < lines.length) {
      const line = lines[index].trim();
      if (line.startsWith('fun ')) {
        const funcName = line.split(' ')[1];
        if (!funcName) throw new Error(`Missing function name at line ${index + 1}`);
        const body: string[] = [];
        index++;
        while (index < lines.length && lines[index].trim() !== 'endf') {
          body.push(lines[index].trim());
          index++;
        }
        if (index >= lines.length) throw new Error(`Unclosed function ${funcName}`);
        state.functions[funcName] = body;
      }
      index++;
    }

    // Second pass: execute
    index = 0;
    while (index < lines.length) {
      const line = lines[index].trim();
      if (!line || line.startsWith('//') || line.startsWith('fun ') || line === 'endf') {
        index++;
        continue;
      }
      index = await parseLine(line, lines, index);
    }
  }

  async function parseLine(line: string, lines: string[], idx: number): Promise<number> {
    const parts = line.split(' ');
    const cmd = parts[0];

    if (cmd === 'say') {
      const text = replaceVars(line.substring(4));
      onOutput(text, 'out');
      state.output.push(text);
      return idx + 1;
    }

    if (cmd === 'get' || cmd === 'getIn') {
      const varName = parts[1];
      if (!varName) throw new Error(`Missing variable on line ${idx + 1}`);
      const q = replaceVars(parts.slice(2).join(' '));
      onOutput(`[Prompt]: ${q}`, 'warn');
      state.variables[varName] = await onInputRequest(q, cmd === 'getIn');
      onOutput(`${varName} = ${state.variables[varName]}`, 'log');
      return idx + 1;
    }

    if (cmd === 'set') {
      const eq = line.indexOf('=');
      if (eq === -1) throw new Error(`Syntax error on line ${idx + 1}`);
      const vn = line.substring(3, eq).trim();
      let val = line.substring(eq + 1).trim();
      if (val === 'true') state.variables[vn] = true;
      else if (val === 'false') state.variables[vn] = false;
      else if (!isNaN(parseFloat(val))) state.variables[vn] = parseFloat(val);
      else state.variables[vn] = replaceVars(val);
      return idx + 1;
    }

    if (cmd === 'calc') {
      const eq = line.indexOf('=');
      if (eq === -1) throw new Error(`Syntax error on line ${idx + 1}`);
      const vn = line.substring(4, eq).trim();
      const expr = line.substring(eq + 1).trim().split(' ');
      const a = getVal(expr[0]);
      const op = expr[1];
      const b = getVal(expr[2]);
      const numA = typeof a === 'number' ? a : parseFloat(a) || 0;
      const numB = typeof b === 'number' ? b : parseFloat(b) || 0;
      let res =
        op === 'a' ? numA + numB :
        op === 's' ? numA - numB :
        op === 'm' ? numA * numB :
        op === 'd' ? (numB !== 0 ? numA / numB : 0) :
        0;
      state.variables[vn] = res;
      return idx + 1;
    }

    if (cmd === 'i') {
      const [, v1, op, v2] = parts;
      const val1 = getVal(v1);
      const val2 = getVal(v2);
      const ok =
        op === '==' ? val1 == val2 :
        op === '!=' ? val1 != val2 :
        op === '>=' ? val1 >= val2 :
        op === '<=' ? val1 <= val2 :
        op === '>' ? val1 > val2 :
        val1 < val2;
      if (ok) return idx + 1;
      let depth = 1;
      let ti = idx + 1;
      while (ti < lines.length) {
        if (lines[ti].trim().startsWith('i ')) depth++;
        if (lines[ti].trim() === 'enif') depth--;
        if (depth === 0) break;
        ti++;
      }
      return ti + 1;
    }

    if (cmd === 'enif') return idx + 1;

    if (cmd === 'ar') {
      const eq = line.indexOf('=');
      if (eq === -1) throw new Error(`Array syntax on line ${idx + 1}`);
      state.variables[line.substring(2, eq).trim()] = line
        .substring(eq + 1)
        .trim()
        .split(',')
        .map((x) => x.trim());
      return idx + 1;
    }

    if (cmd === 'rep') {
      const n = getVal(parts[1]) as number;
      const body: string[] = [];
      let depth = 1;
      let ti = idx + 1;
      while (ti < lines.length) {
        if (lines[ti].trim().startsWith('rep ')) depth++;
        if (lines[ti].trim() === 'enrep') depth--;
        if (depth === 0) break;
        body.push(lines[ti].trim());
        ti++;
      }
      for (let r = 0; r < n; r++) await executeInstructions(body);
      return ti + 1;
    }

    if (cmd === 'whi') {
      const [, v1, op, v2str] = parts;
      const body: string[] = [];
      let depth = 1;
      let ti = idx + 1;
      while (ti < lines.length) {
        if (lines[ti].trim().startsWith('whi ')) depth++;
        if (lines[ti].trim() === 'enwhi') depth--;
        if (depth === 0) break;
        body.push(lines[ti].trim());
        ti++;
      }
      let safety = 5000;
      while (true) {
        const a = getVal(v1);
        const b = getVal(v2str);
        const ok =
          op === '==' ? a == b :
          op === '!=' ? a != b :
          op === '>=' ? a >= b :
          op === '<=' ? a <= b :
          op === '>' ? a > b :
          a < b;
        if (!ok) break;
        await executeInstructions(body);
        if (--safety <= 0) throw new Error('Infinite loop safety limit reached');
      }
      return ti + 1;
    }

    if (cmd === 'enrep' || cmd === 'enwhi') return idx + 1;

    if (cmd === 'call') {
      const fn = parts[1];
      if (!state.functions[fn]) throw new Error(`Undefined function '${fn}'`);
      await executeInstructions(state.functions[fn]);
      return idx + 1;
    }

    if (cmd.startsWith('joi,')) {
      const t = cmd.substring(4);
      const s = parts[1];
      if (state.variables[t] !== undefined && state.variables[s] !== undefined) {
        state.variables[t] = String(state.variables[t]) + ' ' + String(state.variables[s]);
      }
      return idx + 1;
    }

    if (cmd === 'upp') {
      if (state.variables[parts[1]] !== undefined)
        state.variables[parts[1]] = String(state.variables[parts[1]]).toUpperCase();
      return idx + 1;
    }

    if (cmd === 'low') {
      if (state.variables[parts[1]] !== undefined)
        state.variables[parts[1]] = String(state.variables[parts[1]]).toLowerCase();
      return idx + 1;
    }

    if (cmd === 'len') {
      const s = parts[1];
      const d = parts[2];
      if (state.variables[s] !== undefined && d) {
        state.variables[d] = Array.isArray(state.variables[s])
          ? (state.variables[s] as string[]).length
          : String(state.variables[s]).length;
      }
      return idx + 1;
    }

    if (cmd === 'rnd') {
      const t = parts[1];
      const mn = getVal(parts[2]) as number;
      const mx = getVal(parts[3]) as number;
      if (t) state.variables[t] = Math.floor(Math.random() * (mx - mn + 1)) + mn;
      return idx + 1;
    }

    return idx + 1;
  }

  return {
    state,
    executeInstructions,
    reset: () => {
      state.variables = {};
      state.functions = {};
      state.output = [];
      state.problems = [];
      state.logs = [];
    },
  };
}
