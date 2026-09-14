import type { DashboardStats } from '../../types';

interface DashboardViewProps {
  stats: DashboardStats;
  files: Record<string, { name: string; content: string }>;
  activityLog: string[];
  userName?: string;
  onCreateFile: () => void;
  onOpenFile: (name: string) => void;
  onOpenIDE: () => void;
  onLoadExample: () => void;
  onOpenSyntax: () => void;
}

export function DashboardView({
  stats,
  files,
  activityLog,
  userName,
  onCreateFile,
  onOpenFile,
  onOpenIDE,
  onLoadExample,
  onOpenSyntax,
}: DashboardViewProps) {
  const quickActions = [
    {
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
      label: 'New File',
      desc: 'Start a fresh .vik file',
      onClick: onCreateFile,
    },
    {
      icon: 'M16 18 22 12 16 6 M8 6 2 12 8 18',
      label: 'Open Editor',
      desc: 'Jump into the full IDE',
      onClick: onOpenIDE,
    },
    {
      icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
      label: 'Syntax Guide',
      desc: 'All Vik Script commands',
      onClick: onOpenSyntax,
    },
    {
      icon: 'M5 3 19 12 5 21 5 3',
      label: 'Load Example',
      desc: 'Start with a sample program',
      onClick: onLoadExample,
    },
  ];

  return (
    <div
      className="dashboard-content"
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '3rem 2rem 6rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '3rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 'clamp(1.8rem,4vw,3rem)',
              fontWeight: 900,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              color: '#fff',
              lineHeight: 0.9,
              letterSpacing: '-0.03em',
            }}
          >
            {userName ? `Welcome, ${userName}` : 'Command_Center'}
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              display: 'block',
              marginTop: '0.75rem',
            }}
          >
            System operational — V4.0.2
          </span>
        </div>
        <button className="btn-primary" onClick={onOpenIDE}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Open IDE
        </button>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
          gap: '1px',
          background: 'var(--border)',
          marginBottom: '3rem',
        }}
      >
        {[
          { num: stats.files, label: 'Total Files' },
          { num: stats.lines > 999 ? `${(stats.lines / 1000).toFixed(1)}k` : stats.lines, label: 'Lines Written' },
          { num: stats.functions, label: 'Functions Defined' },
          { num: '● ACTIVE', label: 'Engine Status' },
        ].map((s, i) => (
          <div
            key={i}
            className="stat-card"
            style={{
              background: 'var(--panel)',
              padding: '1.5rem',
              transition: 'background 0.3s, transform 0.3s',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                fontStyle: 'italic',
                color: 'var(--neon)',
                lineHeight: 1,
              }}
            >
              {s.num}
            </div>
            <div
              style={{
                fontSize: 8,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--text-muted)',
                marginTop: 6,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <p
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
        }}
      >
        Quick Actions
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
          gap: '1rem',
          marginBottom: '3rem',
        }}
      >
        {quickActions.map(qa => (
          <div
            key={qa.label}
            onClick={qa.onClick}
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition:
                'border-color 0.25s, background 0.25s, transform 0.25s, box-shadow 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--neon)';
              e.currentTarget.style.background = 'var(--neon-dim)';
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(57,255,20,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--panel)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--neon)"
              strokeWidth="2"
              width={20}
              height={20}
            >
              <path d={qa.icon} />
            </svg>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#fff',
              }}
            >
              {qa.label}
            </div>
            <div
              style={{
                fontSize: 9,
                color: 'var(--text-muted)',
                lineHeight: 1.7,
              }}
            >
              {qa.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Files Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <p
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Your Files
          </p>
          <button
            className="btn-outline"
            onClick={onCreateFile}
            style={{ fontSize: 8, padding: '7px 14px' }}
          >
            + New File
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
            gap: '1rem',
          }}
        >
          {Object.keys(files).length === 0 && (
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                padding: '1.5rem 0',
              }}
            >
              No files yet.
            </div>
          )}
          {Object.keys(files)
            .sort()
            .map(name => {
              const lines = (files[name].content.match(/\n/g) || []).length + 1;
              return (
                <div
                  key={name}
                  onClick={() => onOpenFile(name)}
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition:
                      'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--neon)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 6px 24px rgba(57,255,20,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: 'var(--neon-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--neon)"
                      strokeWidth="2"
                      width={14}
                      height={14}
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#fff',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {name}
                    </div>
                    <div
                      style={{
                        fontSize: 8,
                        color: 'var(--text-muted)',
                        marginTop: 3,
                      }}
                    >
                      {lines} lines · local workspace
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Activity Feed */}
      <div style={{ marginBottom: '1rem' }}>
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
          }}
        >
          Activity Log
        </p>
      </div>
      <div
        style={{
          border: '1px solid var(--border)',
          background: 'var(--panel)',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              background: 'var(--neon)',
              animation: 'pulse 2s infinite',
            }}
          />
          Live Events
        </div>
        {activityLog.length === 0 && (
          <div
            style={{
              padding: '12px 16px',
              fontSize: 10,
              color: 'var(--text-muted)',
            }}
          >
            No activity yet.
          </div>
        )}
        {activityLog.slice(0, 10).map((a, i) => (
          <div
            key={i}
            style={{
              padding: '8px 16px',
              fontSize: 10,
              color: 'var(--text-muted)',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              display: 'flex',
              gap: 12,
            }}
          >
            <span style={{ color: 'var(--neon)', opacity: 0.5, fontSize: 9, flexShrink: 0 }}>
              {a.slice(0, 8)}
            </span>
            <span>{a.slice(10)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
