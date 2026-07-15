// Nprogress-style loading indicator for lazy chunk fetching
// Shows a neon green bar sliding across the top of the page
// while Suspense catches a lazy-loaded view chunk

export function LoadingBar() {
  return (
    <>
      <style>{`
        @keyframes loadingSlide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(500%); }
        }
        @keyframes loadingFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes loadingSlide {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          @keyframes loadingFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 99999,
          overflow: 'hidden',
          animation: 'loadingFadeIn 0.15s cubic-bezier(0.22,1,0.36,1) forwards',
        }}
      >
        {/* Main bar */}
        <div
          style={{
            height: '100%',
            width: '30%',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(57,255,20,0.3) 30%, #39FF14 50%, rgba(57,255,20,0.3) 70%, transparent 100%)',
            boxShadow:
              '0 0 10px rgba(57,255,20,0.6), 0 0 20px rgba(57,255,20,0.3)',
            animation: 'loadingSlide 1.2s cubic-bezier(0.22,1,0.36,1) infinite',
          }}
        />
      </div>
    </>
  );
}
