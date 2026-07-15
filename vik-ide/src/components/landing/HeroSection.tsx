import { lazy, Suspense } from 'react';
import { AuthCard } from '../auth/AuthCard';

// Lazy-load Hero3D (which contains three.js) so it's only fetched when hero view loads
const Hero3D = lazy(() => import('./Hero3D').then(m => ({ default: m.Hero3D })));

interface HeroSectionProps {
  user: unknown;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  onAnon: () => Promise<void>;
  onLaunchIDE: () => void;
  authError: string | null;
}

export function HeroSection({
  user,
  onLogin,
  onRegister,
  onAnon,
  onLaunchIDE,
  authError,
}: HeroSectionProps) {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}
    >
      <p
        className="hero-eyebrow"
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          color: 'var(--neon)',
          opacity: 0.7,
          marginBottom: '2rem',
        }}
      >
        Version 4.0.2 — Vik Script Powered
      </p>

      <Suspense fallback={<div style={{ width: 220, height: 220, margin: '0 auto 2.5rem' }} />}>
        <Hero3D />
      </Suspense>

      <h1 className="hero-headline">
        <span className="hero-headline-line">BUILD.</span>
        <span
          className="hero-headline-line"
          style={{
            color: 'var(--neon)',
            textShadow:
              '0 0 40px var(--neon), 0 0 100px rgba(57,255,20,0.4)',
          }}
        >
          CREATE.
        </span>
        <span className="hero-headline-line">SHIP.</span>
      </h1>
      <p
        className="hero-sub"
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          maxWidth: 480,
          lineHeight: 2,
          margin: '2rem auto 3rem',
        }}
      >
        The cloud IDE built for Vik Script — a friendly language with plain
        English commands. Write, run, and ship from anywhere.
      </p>

      {!user && (
        <div
          style={{
            width: '100%',
            maxWidth: 360,
            opacity: 0,
            transform: 'translateY(32px)',
            animation: 'viewFadeIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.6s forwards',
          }}
        >
          <AuthCard
            onLogin={onLogin}
            onRegister={onRegister}
            onAnon={onAnon}
            error={authError}
          />
        </div>
      )}

      <div className="hero-cta-group" style={{ marginTop: user ? '2rem' : 0 }}>
        <button className="btn-primary" onClick={onLaunchIDE}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Launch IDE
        </button>
        <button
          className="btn-outline"
          onClick={() =>
            document
              .getElementById('features-section')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          View Demo
        </button>
        <button
          className="btn-outline"
          onClick={() => window.open('https://github.com', '_blank')}
        >
          GitHub
        </button>
      </div>
    </div>
  );
}
