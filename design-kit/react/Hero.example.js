// EXAMPLE: shows how the kit pieces are combined in a React page. It imports from your own project (site.config, Art), so adjust the imports.
'use client';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { SplitHeading, Magnetic, CountUp, ease } from './Motion';
import TLink from './TLink';
import { site } from '@/site.config';

const rise = (delay) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.9, ease },
});

export default function Hero({ stats }) {
  const mx = useMotionValue(72);
  const my = useMotionValue(28);
  const sx = useSpring(mx, { stiffness: 70, damping: 20 });
  const sy = useSpring(my, { stiffness: 70, damping: 20 });
  const bg = useMotionTemplate`radial-gradient(620px circle at ${sx}% ${sy}%, color-mix(in srgb, var(--accent) 26%, transparent), transparent 65%)`;

  return (
    <section
      className="hero"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 100);
        my.set(((e.clientY - r.top) / r.height) * 100);
      }}
    >
      <motion.div className="hero-glow" style={{ backgroundImage: bg }} aria-hidden="true" />
      <div className="wrap">
        <motion.p className="hello" {...rise(0.3)}>
          <span className="dot" />
          Hi, I’m {site.name}
        </motion.p>
        <SplitHeading text={site.headline} className="h-xl" delay={0.45} />
        <motion.p className="lead hero-lead" {...rise(1.1)}>{site.tagline}</motion.p>
        <motion.div className="hero-actions" {...rise(1.25)}>
          <Magnetic><TLink className="btn" href="/books"><span>Explore my work</span></TLink></Magnetic>
          <Magnetic><TLink className="btn ghost" href="/about"><span>About me</span></TLink></Magnetic>
        </motion.div>
        <motion.div className="stats" {...rise(1.45)}>
          {stats.map((s) => (
            <div key={s.label}>
              <b><CountUp to={s.n} /></b>
              <span>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
