'use client';
/* =====================================================================
   KitMotion — React port of design-kit/js/kit.js (scroll reveals, word
   reveals, cursor glow, 3D tilt). No libraries. Respects reduced motion.
   Mount once in the root layout; it re-scans on route change.
   ===================================================================== */
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function KitMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const reduce = reduced();
    if (reduce) root.style.setProperty('--speed', '0');

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).classList.add('is-in');
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -8% 0px' });

    const cleanups: Array<() => void> = [];
    const scan = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        el.style.setProperty('--dl', (el.dataset.delay || '0') + 's');
        if (reduce) el.classList.add('is-in'); else io.observe(el);
      });
      document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
        if (el.dataset.kitTilt) return;
        el.dataset.kitTilt = '1';
        if (reduce) return;
        const max = +(el.dataset.tilt || 9);
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          el.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - .5) * max * 2}deg) rotateX(${-((e.clientY - r.top) / r.height - .5) * max * 2}deg)`;
        };
        const leave = () => { el.style.transform = ''; };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
      });
      document.querySelectorAll<HTMLElement>('[data-glow]').forEach((el) => {
        if (el.dataset.kitGlow) return;
        el.dataset.kitGlow = '1';
        if (reduce) return;
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
          el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
          el.classList.add('glowing');
        };
        const leave = () => el.classList.remove('glowing');
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
      });
      document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        if (reduce) el.classList.add('is-in'); else requestAnimationFrame(() => el.classList.add('is-in'));
      });
    };
    scan();

    // Content added later (editor blocks, galleries, studio lists) gets scanned too.
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); cleanups.forEach((fn) => fn()); };
  }, [pathname]);
  return null;
}

/* =====================================================================
   SplitHeading — headline words rise out of a mask, staggered.
   SSR-rendered (no layout shift). Wrap a plain string or an inline element:
     <SplitHeading delay={0.2}>Hi, I’m <span className="gradient-text">Rhianne.</span></SplitHeading>
   ===================================================================== */
export function SplitHeading({ children, delay = 0, as: Tag = 'h1' }: { children: ReactNode; delay?: number; as?: 'h1' | 'h2' | 'h3' }) {
  const ref = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timer = window.setTimeout(() => el.classList.add('is-in'), 30 + delay * 1000 * (reduced() ? 0 : 1));
    return () => window.clearTimeout(timer);
  }, [delay]);
  let i = 0;
  const words = (Array.isArray(children) ? children : [children]).map((child, ci) => {
    if (typeof child === 'string') {
      return child.split(/\s+/).filter(Boolean).map((w, wi) => {
        const idx = i++;
        return (
          <span className="mask" aria-hidden="true" key={`${ci}-${wi}`}>
            <span className="word" style={{ '--i': idx } as React.CSSProperties}>{w}</span>
          </span>
        );
      }).reduce<ReactNode[]>((acc, w, wi) => (wi ? [...acc, ' ', w] : [...acc, w]), []);
    }
    const idx = i++;
    return (
      <span className="mask" aria-hidden="true" key={ci}>
        <span className="word" style={{ '--i': idx } as React.CSSProperties}>{child}</span>
      </span>
    );
  }).reduce<ReactNode[]>((acc, part, pi) => (pi ? [...acc, ' ', part] : [...acc, part]), []);
  return <Tag ref={ref as never} data-split aria-label={typeof children === 'string' ? children : undefined}>{words}</Tag>;
}
