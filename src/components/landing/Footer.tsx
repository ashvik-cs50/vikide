interface FooterProps {
  onViewChange: (view: 'hero' | 'dashboard' | 'workspace') => void;
  onAnon: () => void;
}

export function Footer({ onViewChange, onAnon }: FooterProps) {
  const linkStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 9,
    color: 'var(--text-muted)',
    padding: '4px 0',
    transition: 'color 0.2s',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
    textAlign: 'left',
    textDecoration: 'none',
  };

  const externalLinkStyle: React.CSSProperties = {
    ...linkStyle,
    display: 'block',
  };

  const hoverLink = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = 'var(--neon)';
  };

  const leaveLink = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = 'var(--text-muted)';
  };

  return (
    <footer
      id="site-footer"
      className="site-footer"
      style={{
        borderTop: '1px solid var(--border)',
        padding: '3.5rem 2rem 2rem',
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
          opacity: 0.2,
        }}
      />

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '2.5rem',
        }}
      >
        {/* Brand */}
        <div>
          <ColTitle>VIK_PRO</ColTitle>

          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: '-0.08em',
              color: 'var(--neon)',
              marginBottom: 8,
            }}
          >
            VIK
          </div>

          <div
            style={{
              maxWidth: 210,
              fontSize: 8,
              lineHeight: 1.8,
              color: 'var(--text-dim)',
              letterSpacing: '0.06em',
            }}
          >
            A friendly cloud IDE built around Vik Script.
          </div>
        </div>

        {/* Sitemap */}
        <div>
          <ColTitle>Sitemap</ColTitle>

          <button
            style={linkStyle}
            onClick={() => onViewChange('hero')}
            onMouseEnter={hoverLink}
            onMouseLeave={leaveLink}
          >
            Home
          </button>

          <button
            style={linkStyle}
            onClick={() =>
              document
                .getElementById('features-section')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            onMouseEnter={hoverLink}
            onMouseLeave={leaveLink}
          >
            Features
          </button>

          <button
            style={linkStyle}
            onClick={() => onViewChange('dashboard')}
            onMouseEnter={hoverLink}
            onMouseLeave={leaveLink}
          >
            Dashboard
          </button>

          <button
            style={linkStyle}
            onClick={() => onViewChange('workspace')}
            onMouseEnter={hoverLink}
            onMouseLeave={leaveLink}
          >
            IDE / Workspace
          </button>

          <button
            style={linkStyle}
            onClick={onAnon}
            onMouseEnter={hoverLink}
            onMouseLeave={leaveLink}
          >
            Sandbox
          </button>
        </div>

        {/* Languages */}
        <div>
          <ColTitle>Languages</ColTitle>

          <span style={{ ...linkStyle, cursor: 'default' }}>
            Python · Java · Web
          </span>

          <span style={{ ...linkStyle, cursor: 'default' }}>
            C++ · Algorithms
          </span>

          <span
            style={{
              ...linkStyle,
              cursor: 'default',
              color: 'var(--neon)',
            }}
          >
            Vik Script
          </span>
        </div>

        {/* Resources */}
        <div>
          <ColTitle>Resources</ColTitle>

          <button
            style={linkStyle}
            onClick={() => onViewChange('workspace')}
            onMouseEnter={hoverLink}
            onMouseLeave={leaveLink}
          >
            Syntax Reference
          </button>

          <a
            style={externalLinkStyle}
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            onMouseEnter={hoverLink}
            onMouseLeave={leaveLink}
          >
            Gemini API
          </a>

          <a
            style={externalLinkStyle}
            href="https://github.com/ashvik-cs50/vikide"
            target="_blank"
            rel="noreferrer"
            onMouseEnter={hoverLink}
            onMouseLeave={leaveLink}
          >
            GitHub Repository
          </a>
        </div>

        {/* Connect */}
        <div>
          <ColTitle>Connect</ColTitle>

          <a
            style={externalLinkStyle}
            href="https://www.instagram.com/timmi_dev_1/"
            target="_blank"
            rel="noreferrer"
            onMouseEnter={hoverLink}
            onMouseLeave={leaveLink}
          >
            Instagram
          </a>

          <a
            style={externalLinkStyle}
            href="https://www.youtube.com/@TimmiDev1"
            target="_blank"
            rel="noreferrer"
            onMouseEnter={hoverLink}
            onMouseLeave={leaveLink}
          >
            YouTube
          </a>

          <a
            style={externalLinkStyle}
            href="https://discord.gg/cFqCXHWSp"
            target="_blank"
            rel="noreferrer"
            onMouseEnter={hoverLink}
            onMouseLeave={leaveLink}
          >
            Discord Server
          </a>
        </div>

        {/* System */}
        <div>
          <ColTitle>System</ColTitle>

          <span style={{ ...linkStyle, cursor: 'default' }}>
            v4.0.2
          </span>

          <span style={{ ...linkStyle, cursor: 'default' }}>
            Engine: Active
          </span>

          <span style={{ ...linkStyle, cursor: 'default' }}>
            Cloud Sync: Local
          </span>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: '2.5rem auto 0',
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
        opacity: 0.75,
      }}
    >
      {children}
    </div>
  );
}