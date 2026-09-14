import { useState, useEffect, useCallback } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, show, onClose, duration = 2500 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 350);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 999,
        background: 'var(--panel)',
        border: '1px solid var(--border-bright)',
        padding: '11px 18px',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--neon)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(70px) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
        pointerEvents: visible ? 'auto' : 'none',
        maxWidth: 300,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4), 0 8px 40px rgba(0,0,0,0.6)',
        clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
      }}
    >
      {message}
    </div>
  );
}

let toastListener: ((msg: string) => void) | null = null;

export function showToast(msg: string) {
  if (toastListener) toastListener(msg);
}

export function useToast() {
  const [toastMsg, setToastMsg] = useState('');
  const [showToastState, setShowToast] = useState(false);

  useEffect(() => {
    toastListener = (msg: string) => {
      setToastMsg(msg);
      setShowToast(true);
    };
    return () => {
      toastListener = null;
    };
  }, []);

  const closeToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return { toastMsg, showToast: showToastState, closeToast };
}
