'use client';
// Page-wipe transition for Next.js (App Router) using framer-motion.
// Usage in app/layout.js:  <Providers labels={{ '/about': 'About', '/books': 'Books' }}>{children}</Providers>
// Then use <TLink href="/about"> instead of <Link>.
import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const Ctx = createContext({ go: () => {} });
export const useNav = () => useContext(Ctx);

// ---- SPEED: multiply every duration. 1 = default, 0.6 = snappy, 1.5 = slow ----
const SPEED = 1;
const ease = [0.22, 1, 0.36, 1];
const mk = (cover, reveal) => ({
  idle: { y: '100%', transition: { duration: 0 } },
  cover: { y: '0%', transition: { duration: 0.7 * SPEED, ease, delay: cover * SPEED } },
  reveal: { y: '-100%', transition: { duration: 0.75 * SPEED, ease, delay: reveal * SPEED } },
});
const A = mk(0, 0.1);
const B = mk(0.1, 0);

export default function Providers({ children, labels = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState('idle');
  const [label, setLabel] = useState('');
  const target = useRef(null);

  const go = useCallback((href) => {
    if (phase !== 'idle' || href === pathname) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return router.push(href);
    target.current = href;
    setLabel(labels[href] || '');
    setPhase('in');
  }, [phase, pathname, router, labels]);

  useEffect(() => {
    if (phase === 'in' && pathname === target.current) { window.scrollTo(0, 0); setPhase('out'); }
  }, [pathname, phase]);
  useEffect(() => { // safety net
    if (phase !== 'in') return;
    const t = setTimeout(() => setPhase('out'), 5000);
    return () => clearTimeout(t);
  }, [phase]);

  const state = phase === 'in' ? 'cover' : phase === 'out' ? 'reveal' : 'idle';
  return (
    <Ctx.Provider value={{ go }}>
      {children}
      <div className="curtain" aria-hidden="true" style={{ pointerEvents: phase === 'idle' ? 'none' : 'auto' }}>
        <motion.div className="curtain-panel curtain-a" variants={A} initial="idle" animate={state}
          onAnimationComplete={(d) => d === 'reveal' && setPhase('idle')} />
        <motion.div className="curtain-panel curtain-b" variants={B} initial="idle" animate={state}
          onAnimationComplete={(d) => d === 'cover' && target.current && router.push(target.current)}>
          <span className="curtain-label" style={{ opacity: phase === 'in' ? 1 : 0 }}>{label}</span>
        </motion.div>
      </div>
    </Ctx.Provider>
  );
}
