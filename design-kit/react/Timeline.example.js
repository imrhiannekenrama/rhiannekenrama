// EXAMPLE: shows how the kit pieces are combined in a React page. It imports from your own project (site.config, Art), so adjust the imports.
'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ease } from './Motion';

// The line draws itself as you scroll through the milestones.
export default function Timeline({ items }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const h = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <div className="tl" ref={ref}>
      <div className="tl-line"><motion.i style={{ scaleY: h }} /></div>
      {items.map((m) => (
        <motion.div key={m.id} className="tl-item" initial={{ opacity: 0, x: 36 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-15%' }} transition={{ duration: 0.9, ease }}>
          <span className="tl-dot" />
          <span className="tl-year">{m.year}</span>
          <h3>{m.title}</h3>
          <p>{m.text}</p>
        </motion.div>
      ))}
    </div>
  );
}
