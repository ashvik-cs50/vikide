const features = [
  {
    icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    name: 'Vik Script Language',
    desc: 'A plain-English scripting language made for beginners. Use say, get, calc and more — no semicolons, no confusion.',
  },
  {
    icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    name: 'Real Interpreter',
    desc: 'Hit Run and watch your Vik Script execute live — variables, conditions, loops, functions, arrays, and user input all work.',
  },
  {
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    name: 'Cloud Sync',
    desc: 'Every file auto-saves locally instantly. Multi-file storage is always persistent and safe.',
  },
  {
    icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    name: 'Syntax Reference',
    desc: 'The built-in syntax panel shows every command with examples. Click any snippet to insert it straight into your editor.',
  },
  {
    icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
    name: 'Multi-File Projects',
    desc: 'Tab-based file management, a full sidebar tree, and per-file autosave. Organize your Vik Script projects like a pro.',
  },
  {
    icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M12 6v6l4 2',
    name: 'AI Co-Pilot',
    desc: 'Stuck? Ask Vik AI to help you fix bugs, explain code, or write new Vik Script — right inside the editor panel powered by Gemini.',
  },
];

export function FeaturesSection() {
  return (
    <div className="features-section" id="features-section" style={{ padding: '6rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p className="section-label reveal">Why Vik Pro</p>
        <h2 className="section-title reveal reveal-delay-1">
          Built for everyone.<br />Ships fast.
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
            gap: '1px',
            background: 'var(--border)',
            marginTop: '4rem',
          }}
        >
          {features.map((f) => (
            <div
              key={f.name}
              className="feature-card reveal"
              style={{
                background: 'var(--bg)',
                padding: '2.5rem 2rem',
                transition: 'background 0.3s, transform 0.3s, box-shadow 0.3s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(57,255,20,0.025)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(57,255,20,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: 'var(--neon-dim)',
                  border: '1px solid var(--border-bright)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  transition: 'box-shadow 0.3s, border-color 0.3s, transform 0.2s',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--neon)"
                  strokeWidth="2"
                  width={18}
                  height={18}
                >
                  <path d={f.icon} />
                </svg>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#fff',
                  marginBottom: '0.75rem',
                }}
              >
                {f.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  lineHeight: 1.8,
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
