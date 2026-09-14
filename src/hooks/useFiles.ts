import { useState, useCallback, useEffect, useRef } from 'react';
import type { CodeFile, DashboardStats } from '../types';
import { createInterpreter } from '../lib/vikInterpreter';
import type { TerminalLine, TerminalTab } from '../types';

const STORAGE_KEY_FILES = 'vik_pro_files';

export const EXAMPLE_CODE = `// Vik Script — Example Program
get name What is your name?
getIn age How old are you?
say Hello vari,name! Welcome to Vik Script!
i age >= 18
  say You are an adult.
enif
i age >= 13
  say Hey there, teenager!
enif
ar colors = red,green,blue
say Your color list: vari,colors
calc double_age = age a age
say Your age doubled is: vari,double_age
fun greet
  say Welcome vari,name to Vik Script!
endf
call greet
`;

function loadFiles(): Record<string, CodeFile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILES);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Convert plain strings to CodeFile objects if needed
      const files: Record<string, CodeFile> = {};
      for (const [name, content] of Object.entries(parsed)) {
        if (typeof content === 'string') {
          files[name] = { name, content };
        } else {
          files[name] = content as CodeFile;
        }
      }
      return files;
    }
  } catch {}
  return {
    'main.vik': { name: 'main.vik', content: EXAMPLE_CODE },
    'config.vik': {
      name: 'config.vik',
      content: `// Project config\nset project_name = MyProject\nset version = 1\nsay Project vari,project_name is running!\n`,
    },
  };
}

export function useFiles() {
  const [files, setFiles] = useState<Record<string, CodeFile>>(loadFiles);
  const [activeFile, setActiveFile] = useState<string>(() => {
    const f = loadFiles();
    return Object.keys(f)[0] || 'main.vik';
  });
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { text: 'VIK_PRO Engine v4.0.2 — Vik Script interpreter ready.', type: 'out', ts: new Date().toLocaleTimeString() },
    { text: 'Type your code and hit RUN. Use get/getIn for user input.', type: 'out', ts: new Date().toLocaleTimeString() },
  ]);
  const [activeTerminalTab, setActiveTerminalTab] = useState<TerminalTab>('output');
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [inputQuestion, setInputQuestion] = useState('');
  const inputResolveRef = useRef<((val: string) => void) | null>(null);
  const [activityLog, setActivityLog] = useState<string[]>([]);

  const saveFiles = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
  }, [files]);

  const addActivity = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setActivityLog(prev => [`${ts} — ${msg}`, ...prev].slice(0, 30));
  }, []);

  const updateFileContent = useCallback(
    (name: string, content: string) => {
      setFiles(prev => ({
        ...prev,
        [name]: { ...prev[name], name, content },
      }));
    },
    []
  );

  const createFile = useCallback(
    (name: string) => {
      const fileName = name.endsWith('.vik') ? name : name + '.vik';
      if (files[fileName]) return false;
      setFiles(prev => ({
        ...prev,
        [fileName]: {
          name: fileName,
          content: `// ${fileName} initiated\nsay Starting development on ${fileName}…\n`,
        },
      }));
      setActiveFile(fileName);
      addActivity(`Created ${fileName}`);
      return true;
    },
    [files, addActivity]
  );

  const deleteFile = useCallback(
    (name: string) => {
      const keys = Object.keys(files);
      if (keys.length <= 1) return false;
      setFiles(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      if (activeFile === name) {
        const nextFile = Object.keys(files).find(k => k !== name);
        if (nextFile) setActiveFile(nextFile);
      }
      addActivity(`Deleted ${name}`);
      return true;
    },
    [files, activeFile, addActivity]
  );

  const addTerminalLine = useCallback((text: string, type: TerminalLine['type'] = 'out') => {
    const ts = new Date().toLocaleTimeString();
    setTerminalLines(prev => [...prev, { text, type, ts }]);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminalLines([]);
  }, []);

  const appendToOutput = useCallback(
    (text: string, type: string) => {
      addTerminalLine(text, type as TerminalLine['type']);
    },
    [addTerminalLine]
  );

  const requestInput = useCallback(
    async (question: string, _numberOnly: boolean): Promise<string> => {
      setInputQuestion(question);
      setInputModalOpen(true);
      return new Promise(resolve => {
        inputResolveRef.current = resolve;
      });
    },
    []
  );

  const resolveInput = useCallback(
    (val: string) => {
      setInputModalOpen(false);
      if (inputResolveRef.current) {
        inputResolveRef.current(val);
        inputResolveRef.current = null;
      }
    },
    []
  );

  const runCode = useCallback(async () => {
    const code = files[activeFile]?.content || '';
    if (!code) return;

    setActiveTerminalTab('output');
    appendToOutput('Initializing Vik Script…', 'log');

    const interpreter = createInterpreter(appendToOutput, async (q, numOnly) => {
      const val = await requestInput(q, numOnly);
      return val;
    });

    try {
      const lines = code.split('\n');
      await interpreter.executeInstructions(lines);
      appendToOutput('Execution complete.', 'success');
      addActivity('Ran code');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      appendToOutput(`Runtime error: ${msg}`, 'err');
      setActiveTerminalTab('problems');
    }
  }, [files, activeFile, appendToOutput, requestInput, addActivity]);

  // Auto-save with debounce using a save counter
  const [saveCounter, setSaveCounter] = useState(0);
  
  useEffect(() => {
    if (saveCounter === 0) return;
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
    }, 1400);
    return () => clearTimeout(timer);
  }, [saveCounter]);
  
  // Update save counter when files change (debounced via state batching)
  useEffect(() => {
    const timer = setTimeout(() => setSaveCounter(c => c + 1), 300);
    return () => clearTimeout(timer);
  }, [files]);

  const stats: DashboardStats = {
    files: Object.keys(files).length,
    lines: Object.values(files).reduce(
      (acc, f) => acc + f.content.split('\n').length,
      0
    ),
    functions: Object.values(files).reduce(
      (acc, f) =>
        acc + (f.content.match(/^fun\s/gm) || []).length,
      0
    ),
  };

  return {
    files,
    activeFile,
    setActiveFile,
    updateFileContent,
    createFile,
    deleteFile,
    saveFiles,
    terminalLines,
    activeTerminalTab,
    setActiveTerminalTab,
    clearTerminal,
    runCode,
    inputModalOpen,
    inputQuestion,
    resolveInput,
    activityLog,
    addActivity,
    stats,
  };
}
