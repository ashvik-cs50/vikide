import { useState } from 'react';

interface AuthCardProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  onAnon: () => Promise<void>;
  error?: string | null;
}

export function AuthCard({ onLogin, onRegister, onAnon, error }: AuthCardProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(loginEmail, loginPassword);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onRegister(regUsername, regEmail, regPassword);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAnon = async () => {
    setLoading(true);
    try {
      await onAnon();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div
      className="industrial-panel industrial-panel-cut"
      id="auth-card"
      style={{
        width: '100%',
        maxWidth: 360,
        margin: '0 auto',
        padding: '2rem',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, border-color 0.3s',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(57,255,20,0.06)',
      }}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const inCard = Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5;
        e.currentTarget.style.transform = inCard
          ? `perspective(600px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateZ(10px)`
          : 'perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
      }}
    >
      {/* Tab buttons */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {(['login', 'register'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              padding: '8px 0',
              fontFamily: 'inherit',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: tab === t ? 'var(--neon)' : 'var(--text-muted)',
              cursor: 'pointer',
              borderBottom: tab === t ? '2px solid var(--neon)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {t === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            fontSize: 9,
            color: 'var(--danger)',
            marginBottom: '0.75rem',
            letterSpacing: '0.08em',
          }}
        >
          {error}
        </div>
      )}

      {tab === 'login' ? (
        <form onSubmit={handleLogin}>
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="your@email.com"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            required
          />
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: 12,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '...' : 'SIGN IN'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <Label htmlFor="reg-username">Username</Label>
          <Input
            id="reg-username"
            type="text"
            placeholder="alice"
            value={regUsername}
            onChange={e => setRegUsername(e.target.value)}
            required
            minLength={3}
            pattern="[a-zA-Z0-9_]+"
          />
          <Label htmlFor="reg-email">Email</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="your@email.com"
            value={regEmail}
            onChange={e => setRegEmail(e.target.value)}
            required
          />
          <Label htmlFor="reg-password">Password</Label>
          <Input
            id="reg-password"
            type="password"
            placeholder="••••••••"
            value={regPassword}
            onChange={e => setRegPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: 12,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '...' : 'CREATE ACCOUNT'}
          </button>
        </form>
      )}

      <div
        style={{
          textAlign: 'center',
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '0.2em',
          margin: '14px 0',
        }}
      >
        — OR —
      </div>
      <button
        onClick={handleAnon}
        disabled={loading}
        style={{
          background: 'none',
          border: 'none',
          width: '100%',
          fontFamily: 'inherit',
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          cursor: loading ? 'default' : 'pointer',
          padding: 8,
          opacity: loading ? 0.5 : 1,
        }}
      >
        Enter Anonymous Sandbox
      </button>
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        display: 'block',
        marginBottom: 4,
      }}
    >
      {children}
    </label>
  );
}

function Input({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border)',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: 12,
        padding: '9px 12px',
        outline: 'none',
        marginBottom: 12,
        transition: 'border-color 0.2s',
        ...style,
      }}
    />
  );
}
