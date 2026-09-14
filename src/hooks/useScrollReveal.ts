import { useEffect, useRef } from 'react';

export function useScrollReveal() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const selectors = [
      '.reveal',
      '.reveal-rotate',
      '.reveal-scale',
      '.reveal-blur',
    ];

    const observers: IntersectionObserver[] = [];

    selectors.forEach(sel => {
      const els = document.querySelectorAll(sel);
      if (!els.length) return;

      const obs = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      els.forEach(el => obs.observe(el));
      observers.push(obs);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, []);
}
