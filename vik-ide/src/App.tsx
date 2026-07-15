import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { Background } from './components/common/Background';
import { Nav } from './components/common/Nav';
import { Toast, useToast } from './components/common/Toast';
import { LoadingBar } from './components/common/LoadingBar';
import { useAuth } from './hooks/useAuth';
import { useFiles } from './hooks/useFiles';
import { useScrollReveal } from './hooks/useScrollReveal';
import type { ViewType } from './types';

// ── Lazy-loaded view chunks ──
// Each view component is split into its own chunk, loaded only when navigated to.
// This removes three.js, IDE components, dashboard components from the initial bundle.

const HeroSection = lazy(() =>
  import('./components/landing/HeroSection').then(m => ({ default: m.HeroSection }))
);

const LandingView = lazy(() =>
  import('./components/landing/LandingView').then(m => ({ default: m.default }))
);

const Footer = lazy(() =>
  import('./components/landing/Footer').then(m => ({ default: m.Footer }))
);

const DashboardView = lazy(() =>
  import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView }))
);

const IDEView = lazy(() =>
  import('./components/ide/IDEView').then(m => ({ default: m.IDEView }))
);

export default function App() {
  const { user, loading, login, register, loginAnon, logout } = useAuth();
  const {
    files,
    activeFile,
    setActiveFile,
    updateFileContent,
    createFile,
    deleteFile,
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
  } = useFiles();

  const { toastMsg, showToast, closeToast } = useToast();
  const [currentView, setCurrentView] = useState<ViewType>('hero');
  const [authError, setAuthError] = useState<string | null>(null);

  useScrollReveal();

  // Mouse parallax for background layers
  useEffect(() => {
    const grid = document.getElementById('bg-grid');
    const radial = document.getElementById('bg-radial');
    if (!grid) return;

    const handleMouse = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;
      grid.style.transform = `translate(${mx * 4}px, ${my * 4}px)`;
      if (radial) radial.style.transform = `translate(${mx * 8}px, ${my * 8}px)`;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // ── Immediate preload: Hero3D (three.js) ──
  // Starts fetching the three.js chunk on mount so the holographic cube
  // is ready by the time HeroSection renders it (no visible loading delay)
  useEffect(() => {
    import('./components/landing/Hero3D').catch(() => {});
  }, []);

  // ── Deferred preload: Dashboard + IDE ──
  // While user browses hero view, preload Dashboard and IDE chunks in background
  // so navigation to those views feels instant (no loading flash)
  const preloadedRef = useRef(false);
  useEffect(() => {
    if (currentView !== 'hero') {
      preloadedRef.current = false;
      return;
    }
    if (preloadedRef.current) return;

    const timer = setTimeout(() => {
      preloadedRef.current = true;
      // Trigger Vite to fetch the lazy chunks before user navigates
      import('./components/dashboard/DashboardView');
      import('./components/ide/IDEView');
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentView]);

  const handleViewChange = useCallback(
    (view: ViewType) => {
      const nav = document.getElementById('main-nav');
      if (nav) nav.classList.remove('scrolled');
      setCurrentView(view);
    },
    []
  );

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      try {
        await login(email, password);
        handleViewChange('dashboard');
      } catch (err: unknown) {
        setAuthError(err instanceof Error ? err.message : 'Login failed');
      }
    },
    [login, handleViewChange]
  );

  const handleRegister = useCallback(
    async (username: string, email: string, password: string) => {
      setAuthError(null);
      try {
        await register(username, email, password);
        handleViewChange('dashboard');
      } catch (err: unknown) {
        setAuthError(err instanceof Error ? err.message : 'Registration failed');
      }
    },
    [register, handleViewChange]
  );

  const handleAnon = useCallback(async () => {
    setAuthError(null);
    try {
      await loginAnon();
      handleViewChange('dashboard');
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Anonymous login failed');
    }
  }, [loginAnon, handleViewChange]);

  const handleLogout = useCallback(() => {
    logout();
    handleViewChange('hero');
  }, [logout, handleViewChange]);

  const handleCreateFile = useCallback(() => {
    const name = prompt('File name:', 'new.vik');
    if (name) {
      createFile(name);
      handleViewChange('workspace');
    }
  }, [createFile, handleViewChange]);

  const handleOpenFile = useCallback(
    (name: string) => {
      setActiveFile(name);
      handleViewChange('workspace');
    },
    [setActiveFile, handleViewChange]
  );

  const handleLoadExample = useCallback(() => {
    const name = 'demo.vik';
    try {
      const existingFiles = JSON.parse(localStorage.getItem('vik_pro_files') || '{}');
      existingFiles[name] = { 
        name, 
        content: `// Vik Script - Example Program\nget name What is your name?\ngetIn age How old are you?\nsay Hello vari,name! Welcome to Vik Script!\ni age >= 18\n  say You are an adult.\nenif\ni age >= 13\n  say Hey there, teenager!\nenif\nar colors = red,green,blue\nsay Your color list: vari,colors\ncalc double_age = age a age\nsay Your age doubled is: vari,double_age\nfun greet\n  say Welcome vari,name to Vik Script!\nendf\ncall greet\n` 
      };
      localStorage.setItem('vik_pro_files', JSON.stringify(existingFiles));
    } catch {}
    handleViewChange('workspace');
  }, [handleViewChange]);

  if (loading) {
    return (
      <div
        style={{
          background: 'var(--bg)',
          color: 'var(--neon)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: 9,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
        }}
      >
        BOOTING_CORE_SYSTEMS…
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Background />

      <Nav
        user={user}
        onLogout={handleLogout}
        onViewChange={handleViewChange}
        currentView={currentView}
      />

      {/* Hero View */}
      <section
        id="hero-view"
        style={{
          display: currentView === 'hero' ? 'flex' : 'none',
          minHeight: 'calc(100vh - 64px)',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          alignItems: 'stretch',
        }}
      >
        <Suspense fallback={<LoadingBar />}>
          <HeroSection
            user={user}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAnon={handleAnon}
            onLaunchIDE={() => handleViewChange('workspace')}
            authError={authError}
          />
          <LandingView />
          <Footer onViewChange={handleViewChange} onAnon={handleAnon} />
        </Suspense>
      </section>

      {/* Dashboard View */}
      <section
        id="dashboard-view"
        style={{
          display: currentView === 'dashboard' ? 'flex' : 'none',
          position: 'relative',
          zIndex: 1,
          overflowY: 'auto',
        }}
      >
        <Suspense fallback={<LoadingBar />}>
          <DashboardView
            stats={stats}
            files={files}
            activityLog={activityLog}
            userName={user?.displayName || user?.username}
            onCreateFile={handleCreateFile}
            onOpenFile={handleOpenFile}
            onOpenIDE={() => handleViewChange('workspace')}
            onLoadExample={handleLoadExample}
            onOpenSyntax={() => handleViewChange('workspace')}
          />
        </Suspense>
      </section>

      {/* Workspace / IDE View */}
      <section
        id="workspace-view"
        style={{
          display: currentView === 'workspace' ? 'block' : 'none',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Suspense fallback={<LoadingBar />}>
          <IDEView
            files={files}
            activeFile={activeFile}
            onSetActiveFile={setActiveFile}
            onUpdateFileContent={updateFileContent}
            onCreateFile={(name: string) => {
              const result = createFile(name);
              addActivity(`Created ${name}`);
              return result;
            }}
            onDeleteFile={(name: string) => {
              const result = deleteFile(name);
              if (result) addActivity(`Deleted ${name}`);
              return result;
            }}
            onRunCode={runCode}
            terminalLines={terminalLines}
            activeTerminalTab={activeTerminalTab}
            onSetActiveTerminalTab={setActiveTerminalTab}
            onClearTerminal={clearTerminal}
          />
        </Suspense>
      </section>

      {/* Input Modal for Vik Script */}
      <div
        id="input-modal"
        style={{
          display: inputModalOpen ? 'flex' : 'none',
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 600,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border-bright)',
            padding: '2rem',
            minWidth: 340,
            position: 'relative',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4), 0 24px 80px rgba(0,0,0,0.8)',
            clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -1,
              left: 10,
              right: 10,
              height: 1,
              background: 'var(--edge-gradient)',
            }}
          />
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 8,
            }}
          >
            Vik Script — User Input Required
          </div>
          <div
            style={{
              fontSize: 14,
              color: '#fff',
              fontWeight: 700,
              marginBottom: '1.25rem',
              lineHeight: 1.5,
            }}
          >
            {inputQuestion}
          </div>
          <form
            onSubmit={e => {
              e.preventDefault();
              const input = (e.currentTarget.elements[0] as HTMLInputElement).value;
              resolveInput(input);
            }}
          >
            <input
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                color: 'var(--neon)',
                fontFamily: 'inherit',
                fontSize: 13,
                padding: '10px 14px',
                outline: 'none',
                marginBottom: '1rem',
              }}
            />
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Submit
            </button>
          </form>
        </div>
      </div>

      <Toast message={toastMsg} show={showToast} onClose={closeToast} />
    </div>
  );
}
