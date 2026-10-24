'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useInView, animate } from 'framer-motion';

export const ease = [0.22, 1, 0.36, 1];

// Headline where each word rises out of a mask.
export function SplitHeading({ text, as = 'h1', className = '', delay = 0 }) {
  const M = motion[as];
  return (
    <M
      className={className}
      aria-label={text}
      initial="h"
      whileInView="v"
      viewport={{ once: true, margin: '-10%' }}
      variants={{ h: {}, v: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
    >
      {text.split(' ').map((w, i) => (
        <span key={i} className="mask" aria-hidden="true">
          <motion.span
            className="word"
            variants={{ h: { y: '115%', rotate: 5 }, v: { y: '0%', rotate: 0, transition: { duration: 1, ease } } }}
          >
            {w}
          </motion.span>{' '}
        </span>
      ))}
    </M>
  );
}

// Blur-in, or clip-path wipe for images.
export function Reveal({ children, className, delay = 0, variant = 'blur', as = 'div' }) {
  const M = motion[as];
  const clip = variant === 'clip';
  return (
    <M
      className={className}
      initial={clip ? { clipPath: 'inset(100% 0 0 0)' } : { opacity: 0, filter: 'blur(10px)', y: 26 }}
      whileInView={clip ? { clipPath: 'inset(0% 0 0 0)' } : { opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 1, delay, ease }}
    >
      {children}
    </M>
  );
}

// 3D hover tilt that follows the pointer.
export function Tilt({ children, className, max = 9 }) {
  const ref = useRef(null);
  const rx = useSpring(0, { stiffness: 220, damping: 18 });
  const ry = useSpring(0, { stiffness: 220, damping: 18 });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
    >
      {children}
    </motion.div>
  );
}

// Element that leans toward the cursor.
export function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 220, damping: 14 });
  const y = useSpring(0, { stiffness: 220, damping: 14 });
  return (
    <motion.span
      ref={ref}
      style={{ x, y, display: 'inline-block' }}
      onPointerMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.span>
  );
}

export function CountUp({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease, onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{v}</span>;
}

// Progress bar that fills when scrolled into view.
export function Bar({ value }) {
  return (
    <div className="bar">
      <motion.i
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: value / 100 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease, delay: 0.1 }}
      />
    </div>
  );
}
