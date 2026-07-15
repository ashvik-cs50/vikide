import { useState, useEffect } from 'react';
import type { User } from '../../types';

interface NavProps {
  user: User | null;
  onLogout: () => void;
  onViewChange: (view: 'hero' | 'dashboard' | 'workspace') => void;
  currentView: string;
}

export function Nav({ user, onLogout, onViewChange, currentView }: NavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        height: scrolled ? 52 : 64,
        background: 'var(--bg)',
        borderBottom: `1px solid ${scrolled ? 'var(--neon-mid)' : 'var(--border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        boxShadow: scrolled
          ? '0 1px 0 rgba(57,255,20,0.15), 0 8px 32px rgba(0,0,0,0.6)'
          : '0 1px 0 rgba(57,255,20,0.06), 0 8px 32px rgba(0,0,0,0.4)',
        transition: 'height 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <style>{`
        nav::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 5%, var(--neon) 50%, transparent 95%);
          opacity: ${scrolled ? 0.6 : 0.3};
          transition: opacity 0.3s cubic-bezier(0.22,1,0.36,1);
        }
      `}</style>

      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        onClick={() => onViewChange('hero')}
      >
        <div
          style={{
            background: 'var(--neon)',
            color: '#000',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 18,
            padding: '2px 10px',
            clipPath: 'polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)',
            boxShadow: '0 0 12px rgba(57,255,20,0.5)',
            transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          V
        </div>
        <span
          style={{
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 16,
            letterSpacing: '-0.04em',
            color: '#fff',
            textTransform: 'uppercase',
          }}
        >
          VIK_PRO <span style={{ color: 'var(--neon)' }}>IDE</span>
        </span>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {(['dashboard', 'workspace'] as const).map(view => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                opacity: currentView === view ? 1 : 0.5,
                color: currentView === view ? 'var(--neon)' : '#fff',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                paddingBottom: 2,
                position: 'relative',
                transition: 'opacity 0.3s cubic-bezier(0.22,1,0.36,1), color 0.3s',
              }}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
              <span
                style={{
                  position: 'absolute',
                  bottom: -2,
                  left: 0,
                  width: currentView === view ? '100%' : 0,
                  height: 1,
                  background: 'var(--neon)',
                  transition: 'width 0.3s cubic-bezier(0.22,1,0.36,1)',
                }}
              />
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--neon)',
                background: 'var(--neon-dim)',
                padding: '3px 10px',
              }}
            >
              ● SYNCED
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 999,
                padding: '4px 4px 4px 14px',
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {user.username.toUpperCase()}
              </span>
              <button
                onClick={onLogout}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: 5,
                  borderRadius: 999,
                  display: 'flex',
                  transition: 'background 0.2s',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
