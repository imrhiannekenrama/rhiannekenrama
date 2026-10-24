// EXAMPLE: shows how the kit pieces are combined in a React page. It imports from your own project (site.config, Art), so adjust the imports.
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import Art from './Art';
import { ease } from './Motion';

// Filterable photo grid. Clicking a photo zooms it into a lightbox
// using a shared-element transition.
export default function Gallery({ photos }) {
  const albums = ['All', ...new Set(photos.map((p) => p.album).filter(Boolean))];
  const [album, setAlbum] = useState('All');
  const [sel, setSel] = useState(null);
  const list = photos.filter((p) => album === 'All' || p.album === album);
  const idx = sel ? list.findIndex((p) => p.id === sel.id) : -1;
  const step = (d) => list.length && setSel(list[(idx + d + list.length) % list.length]);

  useEffect(() => {
    if (!sel) return;
    const k = (e) => {
      if (e.key === 'Escape') setSel(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  return (
    <LayoutGroup>
      <div className="filters">
        {albums.map((a) => (
          <button key={a} className={'chip' + (a === album ? ' on' : '')} onClick={() => setAlbum(a)}>
            {a === album && <motion.span layoutId="chip" className="chip-bg" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
            <span>{a}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.figure
              layout
              key={p.id}
              className={'ph' + (i % 5 === 0 ? ' big' : '')}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease }}
              onClick={() => setSel(p)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSel(p)}
            >
              <motion.div layoutId={'img-' + p.id} className="fill"><Art item={p} /></motion.div>
              <figcaption>{p.caption}</figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {sel && (
          <motion.div className="lb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(null)} role="dialog" aria-modal="true">
            <div className="lb-card" onClick={(e) => e.stopPropagation()}>
              <motion.div layoutId={'img-' + sel.id} className="lb-img"><Art item={sel} /></motion.div>
              <motion.div className="lb-cap" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
                <div>
                  <b>{sel.caption}</b>
                  <span>{sel.album}{sel.taken_at ? `, ${String(sel.taken_at).slice(0, 4)}` : ''}</span>
                </div>
                <div className="lb-actions">
                  <button onClick={() => step(-1)} aria-label="Previous photo">←</button>
                  <button onClick={() => step(1)} aria-label="Next photo">→</button>
                  <button onClick={() => setSel(null)}>Close</button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
