import { useState, useEffect, useRef, useCallback } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import type { CodeFile, TerminalTab } from '../../types';
import { SYNTAX_REF } from '../../lib/syntaxRef';

interface IDEViewProps {
  files: Record<string, CodeFile>;
  activeFile: string;
  onSetActiveFile: (name: string) => void;
  onUpdateFileContent: (name: string, content: string) => void;
  onCreateFile: (name: string) => boolean;
  onDeleteFile: (name: string) => boolean;
  onRunCode: () => void;
  terminalLines: Array<{ text: string; type: string; ts: string }>;
  activeTerminalTab: TerminalTab;
  onSetActiveTerminalTab: (tab: TerminalTab) => void;
  onClearTerminal: () => void;
}

export function IDEView({
  files,
  activeFile,
  onSetActiveFile,
  onUpdateFileContent,
  onCreateFile,
  onDeleteFile,
  onRunCode,
  terminalLines,
  activeTerminalTab,
  onSetActiveTerminalTab,
  onClearTerminal,
}: IDEViewProps) {
  const [syntaxOpen, setSyntaxOpen] = useState(false);
  const [aiOpen, setAIOpen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const [saveStatus, setSaveStatus] = useState('Synced');

  // AI Chat state
  const [aiMessages, setAIMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'system', content: 'Vik AI — Ask me to explain, write, or fix your Vik Script code.' },
  ]);
  const [aiInput, setAIInput] = useState('');

  const currentContent = files[activeFile]?.content || '';

  // Sync gutter with editor content
  useEffect(() => {
    if (gutterRef.current) {
      const count = currentContent.split('\n').length;
      gutterRef.current.innerHTML = Array.from({ length: count }, (_, i) => `${i + 1}<br/>`).join('');
    }
  }, [currentContent]);

  const handleEditorChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdateFileContent(activeFile, e.target.value);
      setSaveStatus('Saving…');
      setTimeout(() => setSaveStatus('Synced'), 1400);
      updateGutter(e.target.value);
    },
    [activeFile, onUpdateFileContent]
  );

  const handleEditorKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const el = e.currentTarget;
        const s = el.selectionStart;
        const newVal =
          el.value.substring(0, s) + '  ' + el.value.substring(el.selectionEnd);
        onUpdateFileContent(activeFile, newVal);
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = s + 2;
        }, 0);
      }
    },
    [activeFile, onUpdateFileContent]
  );

  const updateCursorPos = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const lines = el.value.substring(0, s).split('\n');
    setCursorPos({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  }, []);

  const updateGutter = useCallback((val: string) => {
    if (gutterRef.current) {
      const count = val.split('\n').length;
      gutterRef.current.innerHTML = Array.from({ length: count }, (_, i) => `${i + 1}<br/>`).join('');
    }
  }, []);

  const syncGutterScroll = useCallback(() => {
    if (gutterRef.current && editorRef.current) {
      gutterRef.current.scrollTop = editorRef.current.scrollTop;
    }
  }, []);

  const insertSnippet = useCallback(
    (snippet: string) => {
      const el = editorRef.current;
      if (!el) return;
      const s = el.selectionStart;
      const newVal =
        el.value.substring(0, s) + snippet + el.value.substring(el.selectionEnd);
      onUpdateFileContent(activeFile, newVal);
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = s + snippet.length;
        el.focus();
      }, 0);
    },
    [activeFile, onUpdateFileContent]
  );

  const sendAIMessage = useCallback(async () => {
    if (!aiInput.trim()) return;
    const msg = aiInput;
    setAIInput('');
    setAIMessages(prev => [...prev, { role: 'user', content: msg }]);
    setAIMessages(prev => [...prev, { role: 'assistant', content: 'Thinking…' }]);

    try {
      const response = await mockGemini(msg, currentContent);
      setAIMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', content: response };
        return next;
      });
    } catch {
      setAIMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', content: 'Connection error.' };
        return next;
      });
    }
  }, [aiInput, currentContent]);

  const fileNames = Object.keys(files).sort();

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: '48px 1fr 200px',
      }}
    >
      {/* Tab Bar */}
      <div
        style={{
          padding: '0 1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(5,5,8,0.8)',
          height: 48,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', overflowX: 'auto', flex: 1 }}>
          <button
            style={{
              padding: '0 14px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 14,
              background: 'none',
              border: 'none',
            }}
            onClick={() => {
              const name = prompt('File name:', 'new.vik');
              if (name) onCreateFile(name);
            }}
          >
            ＋
          </button>
          {fileNames.map(name => (
            <button
              key={name}
              onClick={() => onSetActiveFile(name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 14px',
                height: '100%',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: name === activeFile ? 'var(--neon)' : 'var(--text-muted)',
                cursor: 'pointer',
                borderRight: '1px solid var(--border)',
                borderBottom: name === activeFile ? '2px solid var(--neon)' : '2px solid transparent',
                whiteSpace: 'nowrap',
                background: name === activeFile ? 'rgba(57,255,20,0.04)' : 'none',
                borderTop: 'none',
                borderLeft: 'none',
                fontFamily: 'inherit',
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <ToolbarButton onClick={onRunCode} neon>
            ▶ Run
          </ToolbarButton>
          <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 3px' }} />
          <ToolbarButton onClick={() => setSyntaxOpen(!syntaxOpen)}>
            ⌨ Syntax
          </ToolbarButton>
          <ToolbarButton onClick={() => setAIOpen(!aiOpen)}>
            ◆ AI
          </ToolbarButton>
          <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 3px' }} />
          <span
            style={{
              fontSize: 9,
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0 8px',
            }}
          >
            {saveStatus}
          </span>
        </div>
      </div>

      {/* IDE Body */}
      <Group style={{ overflow: 'hidden', flex: 1 }}>
        {/* Sidebar */}
        <Panel defaultSize={18} minSize={10} maxSize={30}>
          <div
            style={{
              height: '100%',
              background: 'rgba(8,10,16,0.7)',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                fontSize: 8,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--text-dim)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              Filesystem
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                  onClick={() => {
                    const name = prompt('File name:', 'new.vik');
                    if (name) onCreateFile(name);
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </button>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                  onClick={() => onDeleteFile(activeFile)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
              {fileNames.map(name => (
                <div
                  key={name}
                  onClick={() => onSetActiveFile(name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    fontSize: 10,
                    cursor: 'pointer',
                    borderLeft: `2px solid ${name === activeFile ? 'var(--neon)' : 'transparent'}`,
                    background: name === activeFile ? 'rgba(57,255,20,0.06)' : 'transparent',
                    color: name === activeFile ? 'var(--neon)' : 'rgba(255,255,255,0.45)',
                    transition: 'all 0.2s',
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span
                    style={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {name}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                borderTop: '1px solid var(--border)',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  background: 'var(--neon)',
                  animation: 'pulse 2s infinite',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                Active Client
              </span>
            </div>
          </div>
        </Panel>

        <Separator style={{ width: 1, background: 'var(--border)', cursor: 'col-resize' }} />

        {/* Editor */}
        <Panel defaultSize={55} minSize={30}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Status Bar */}
            <div
              style={{
                padding: '0 14px',
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(8,10,16,0.8)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  className="status-item active"
                  style={{
                    fontSize: 9,
                    color: 'var(--neon)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  </svg>
                  {activeFile}
                </span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                  Ln {cursorPos.line}, Col {cursorPos.col}
                </span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>VIK_SCRIPT</span>
              </div>
              <button className="btn-run" onClick={onRunCode}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                RUN
              </button>
            </div>

            {/* Editor */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
              <div
                ref={gutterRef}
                style={{
                  padding: '1.25rem 10px 1.25rem 0',
                  background: 'rgba(0,0,0,0.3)',
                  borderRight: '1px solid var(--border)',
                  minWidth: 44,
                  textAlign: 'right',
                  fontSize: 11,
                  lineHeight: 1.85,
                  color: 'var(--text-dim)',
                  overflowY: 'hidden',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              />
              <textarea
                ref={editorRef}
                value={currentContent}
                onChange={handleEditorChange}
                onKeyDown={handleEditorKeydown}
                onKeyUp={updateCursorPos}
                onClick={updateCursorPos}
                onScroll={syncGutterScroll}
                spellCheck={false}
                placeholder="// Start writing Vik Script here…"
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: 'var(--neon)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  lineHeight: 1.85,
                  padding: '1.25rem 1.5rem',
                  outline: 'none',
                  resize: 'none',
                  border: 'none',
                  tabSize: 2,
                  overflowY: 'auto',
                  caretColor: 'var(--neon)',
                }}
              />
            </div>
          </div>
        </Panel>

        <Separator style={{ width: 1, background: 'var(--border)', cursor: 'col-resize' }} />

        {/* Right Panels (Syntax / AI) */}
        {syntaxOpen || aiOpen ? (
          <Panel defaultSize={27} minSize={15} maxSize={40} style={{ overflow: 'hidden' }}>
            {syntaxOpen ? (
              <SyntaxPanelContent onInsert={insertSnippet} onClose={() => setSyntaxOpen(false)} />
            ) : (
              <AIPanelContent
                messages={aiMessages}
                input={aiInput}
                onInputChange={setAIInput}
                onSend={sendAIMessage}
                onClose={() => setAIOpen(false)}
              />
            )}
          </Panel>
        ) : null}
      </Group>

      {/* Terminal */}
      <TerminalPanel
        lines={terminalLines}
        activeTab={activeTerminalTab}
        onSetTab={onSetActiveTerminalTab}
        onClear={onClearTerminal}
      />
    </div>
  );
}

/* ── SUB-COMPONENTS ── */

function ToolbarButton({
  children,
  onClick,
  neon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  neon?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: neon ? 'var(--neon)' : 'var(--text-muted)',
        cursor: 'pointer',
        padding: '5px 10px',
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

function SyntaxPanelContent({
  onInsert,
  onClose,
}: {
  onInsert: (snippet: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        height: '100%',
        background: 'rgba(8,10,16,0.8)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '9px 14px',
          borderBottom: '1px solid var(--border)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        Vik Script Syntax
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        {SYNTAX_REF.map(group => (
          <div key={group.group} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 8,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--neon)',
                marginBottom: 6,
                opacity: 0.7,
              }}
            >
              {group.group}
            </div>
            {group.items.map((item, i) => (
              <div
                key={i}
                onClick={() => onInsert(item.insert)}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border)',
                  padding: '7px 10px',
                  marginBottom: 4,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--neon)';
                  e.currentTarget.style.background = 'rgba(57,255,20,0.04)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ fontSize: 11, color: '#e0af68', fontWeight: 700 }}>
                  {item.cmd}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>
                  {item.desc}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: 'var(--neon)',
                    opacity: 0.5,
                    marginTop: 2,
                  }}
                >
                  Click to insert
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AIPanelContent({
  messages,
  input,
  onInputChange,
  onSend,
  onClose,
}: {
  messages: Array<{ role: string; content: string }>;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        height: '100%',
        background: 'rgba(8,10,16,0.8)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '9px 14px',
          borderBottom: '1px solid var(--border)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span>Vik AI Assistant</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              padding: '9px 11px',
              fontSize: 10,
              lineHeight: 1.7,
              background:
                m.role === 'system'
                  ? 'var(--neon-dim)'
                  : m.role === 'user'
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(57,255,20,0.04)',
              border:
                m.role === 'system'
                  ? '1px solid var(--border-bright)'
                  : m.role === 'user'
                  ? '1px solid rgba(255,255,255,0.06)'
                  : '1px solid var(--border)',
              color: 'rgba(255,255,255,0.7)',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <strong>{m.role === 'user' ? 'You' : 'Vik AI'}</strong><br />
            {m.content}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: 9,
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <input
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSend()}
          placeholder="Ask about your code…"
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 10,
            padding: '7px 10px',
            outline: 'none',
          }}
        />
        <button className="btn-run" style={{ padding: '7px 12px' }} onClick={onSend}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function TerminalPanel({
  lines,
  activeTab,
  onSetTab,
  onClear,
}: {
  lines: Array<{ text: string; type: string; ts: string }>;
  activeTab: TerminalTab;
  onSetTab: (tab: TerminalTab) => void;
  onClear: () => void;
}) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const tabs: TerminalTab[] = ['output', 'problems', 'log'];

  const typeColors: Record<string, string> = {
    out: 'rgba(255,255,255,0.7)',
    err: '#f87171',
    success: 'var(--neon)',
    warn: '#facc15',
    log: 'rgba(255,255,255,0.55)',
    prompt: '#7dcfff',
  };

  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        background: 'rgba(6,7,10,0.85)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onSetTab(tab)}
            style={{
              padding: '7px 14px',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: activeTab === tab ? 'var(--neon)' : 'var(--text-muted)',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid var(--neon)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              fontFamily: 'inherit',
            }}
          >
            {tab}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, padding: '0 8px' }}>
          <button
            onClick={onClear}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px 6px',
              fontSize: 10,
              fontFamily: 'inherit',
            }}
          >
            ✕ Clear
          </button>
        </div>
      </div>
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '10px 14px',
          fontSize: 11,
          lineHeight: 1.7,
          overflowY: 'auto',
          color: 'rgba(255,255,255,0.55)',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{ display: 'flex', gap: 10, marginBottom: 1, wordBreak: 'break-all' }}
          >
            <span style={{ color: 'var(--neon)', flexShrink: 0 }}>▶</span>
            <span style={{ color: typeColors[line.type] || 'rgba(255,255,255,0.7)' }}>
              {line.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mock Gemini (placeholder - real API integration later) ── */
async function mockGemini(prompt: string, _code: string): Promise<string> {
  await new Promise(r => setTimeout(r, 500));
  const lower = prompt.toLowerCase();
  if (lower.includes('explain') || lower.includes('what does')) {
    return 'This code uses Vik Script commands. `get` reads user input, `say` prints output, `calc` does math.';
  }
  if (lower.includes('fix') || lower.includes('bug') || lower.includes('error')) {
    return 'Looking at your code, make sure all blocks (if/enif, rep/enrep) are properly closed and variable names are consistent.';
  }
  return 'I can help with Vik Script! Try asking me to explain, generate, or fix your code.';
}
