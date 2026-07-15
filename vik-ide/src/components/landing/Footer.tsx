interface FooterProps {
  onViewChange: (view: 'hero' | 'dashboard' | 'workspace') => void;
  onAnon: () => void;
}

export function Footer({ onViewChange, onAnon }: FooterProps) {
  const linkStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 9,
    color: 'var(--text-muted)',
    padding: '3px 0',
    transition: 'color 0.2s',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
    textAlign: 'left',
  };

  return (
    <footer
      className="site-footer"
      style={{
        borderTop: '1px solid var(--border)',
        padding: '3rem 2rem',
        background: 'var(--bg)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -1,
          left: '5%',
          right: '5%',
          height: 1,
          background: 'var(--edge-gradient)',
          opacity: 0.15,
        }}
      />
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '2rem',
        }}
      >
        <div>
          <ColTitle>VIK_PRO</ColTitle>
          <button style={linkStyle} onClick={() => onViewChange('hero')}>Home</button>
          <button style={linkStyle} onClick={onAnon}>Sandbox</button>
          <a style={linkStyle} href="https://vikco.qzz.io" target="_blank">Visit Site</a>
        </div>
        <div>
          <ColTitle>Languages</ColTitle>
          <span style={{ ...linkStyle, cursor: 'default' }}>Python · Java · Web</span>
          <span style={{ ...linkStyle, cursor: 'default' }}>C++ · Algorithms</span>
          <span style={{ ...linkStyle, cursor: 'default' }}>Vik Script</span>
        </div>
        <div>
          <ColTitle>Resources</ColTitle>
          <button style={linkStyle} onClick={() => onViewChange('workspace')}>Syntax Reference</button>
          <button style={linkStyle} onClick={() => {
            // Load example code into localStorage and navigate
            var files = JSON.parse(localStorage.getItem('vik_pro_files') || '{}');
            files['demo.vik'] = { name: 'demo.vik', content: `// Vik Script - Example Program
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
` };
            localStorage.setItem('vik_pro_files', JSON.stringify(files));
            onViewChange('workspace');
          }}>Example Code</button>
          <a style={linkStyle} href="https://aistudio.google.com/" target="_blank">Gemini API</a>
        </div>
        <div>
          <ColTitle>System</ColTitle>
          <span style={{ ...linkStyle, cursor: 'default' }}>v4.0.2</span>
          <span style={{ ...linkStyle, cursor: 'default' }}>Engine: Active</span>
          <span style={{ ...linkStyle, cursor: 'default' }}>Cloud Sync: Local</span>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1100,
          margin: '2rem auto 0',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border)',
          fontSize: 8,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <span>© 2026 VIKco — Vik Pro Cloud IDE</span>
        <span>Built with Vik Script · Powered by Gemini</span>
      </div>
    </footer>
  );
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: 'var(--neon)',
        marginBottom: '1rem',
        opacity: 0.7,
      }}
    >
      {children}
    </div>
  );
}
