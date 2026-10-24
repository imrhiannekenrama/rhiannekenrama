/* =====================================================================
   kit.js: plain JavaScript, no libraries. Add <script src="js/kit.js" defer>.
   Switch features on with data attributes (see README):
   data-split, data-reveal, data-tilt, data-magnetic, data-count, data-glow,
   data-progress, data-theme-toggle, data-nav, data-accordion, a[data-curtain]
   ===================================================================== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const speed = () => parseFloat(getComputedStyle(root).getPropertyValue('--speed')) || 1;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms * speed()));

  /* ---------- Theme (dark/light) with circular reveal ---------- */
  function setTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch {}
  }
  function initTheme() {
    if (!root.dataset.theme) {
      let t; try { t = localStorage.getItem('theme'); } catch {}
      root.dataset.theme = t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    $$('[data-theme-toggle]').forEach((b) =>
      b.addEventListener('click', (e) => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        const r = b.getBoundingClientRect();
        root.style.setProperty('--x', r.left + r.width / 2 + 'px');
        root.style.setProperty('--y', r.top + r.height / 2 + 'px');
        if (document.startViewTransition && !reduce()) document.startViewTransition(() => setTheme(next));
        else setTheme(next);
      })
    );
  }
  function setPalette(name) {
    if (name) root.dataset.palette = name; else delete root.dataset.palette;
    try { localStorage.setItem('palette', name || ''); } catch {}
  }
  function setSpeed(n) { root.style.setProperty('--speed', n); }

  /* ---------- Scroll-triggered classes (reveal, split headings, bars, counters) ---------- */
  function initInView() {
    $$('[data-split]').forEach((el) => {
      if (el.dataset.ready) return;
      el.dataset.ready = 1;
      const text = el.textContent.trim();
      el.setAttribute('aria-label', text);
      el.innerHTML = text.split(/\s+/).map((w, i) =>
        `<span class="mask" aria-hidden="true"><span class="word" style="--i:${i}">${w}</span></span>`).join(' ');
      el.style.setProperty('--split-delay', (el.dataset.delay || 0) * speed() + 's');
    });
    $$('[data-reveal]').forEach((el) => el.style.setProperty('--dl', (el.dataset.delay || 0) + 's'));
    $$('[data-progress]').forEach((el) => {
      el.classList.add('bar');
      if (!el.firstElementChild) el.innerHTML = '<i></i>';
      el.style.setProperty('--w', el.dataset.progress + '%');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        if (e.target.dataset.count != null) countUp(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-split],[data-reveal],[data-progress],[data-count]').forEach((el) => io.observe(el));
  }
  function countUp(el) {
    const to = +el.dataset.count, dur = 1800 * speed(), t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Pointer effects ---------- */
  function initPointer() {
    $$('[data-tilt]').forEach((el) => {
      const max = +el.dataset.tilt || 9;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * max * 2}deg) rotateX(${-((e.clientY - r.top) / r.height - 0.5) * max * 2}deg)`;
      });
      el.addEventListener('pointerleave', () => (el.style.transform = ''));
    });
    $$('[data-magnetic]').forEach((el) => {
      const s = +el.dataset.magnetic || 0.3;
      el.style.transition = 'transform .35s cubic-bezier(.22,1,.36,1)';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * s}px, ${(e.clientY - (r.top + r.height / 2)) * s}px)`;
      });
      el.addEventListener('pointerleave', () => (el.style.transform = ''));
    });
    $$('[data-glow]').forEach((el) =>
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
      })
    );
  }

  /* ---------- Nav: hide on scroll down, scroll progress, sliding indicator ---------- */
  function initNav() {
    const nav = $('[data-nav]'), bar = $('.scroll-progress');
    let last = 0;
    addEventListener('scroll', () => {
      const y = scrollY, h = root.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      if (nav) nav.classList.toggle('is-hidden', y > last && y > 140);
      last = y;
    }, { passive: true });
    const links = $('.nav-links');
    if (links) {
      let ind = $('.nav-indicator', links);
      if (!ind) { ind = document.createElement('span'); ind.className = 'nav-indicator'; links.prepend(ind); }
      const place = (a) => { if (!a) { ind.style.width = 0; return; } ind.style.left = a.offsetLeft + 'px'; ind.style.width = a.offsetWidth + 'px'; };
      const here = () => $('a.is-active', links) || $$('a', links).find((a) => a.pathname === location.pathname);
      const active = here(); if (active) active.classList.add('is-active');
      place(active);
      $$('a', links).forEach((a) => a.addEventListener('mouseenter', () => place(a)));
      links.addEventListener('mouseleave', () => place($('a.is-active', links)));
      addEventListener('resize', () => place($('a.is-active', links)));
    }
  }

  function initAccordion() {
    $$('[data-accordion] .acc-head').forEach((b) => b.addEventListener('click', () => b.parentElement.classList.toggle('open')));
  }

  /* ---------- Page curtain ----------
     Multi-page sites: <a href="page.html" data-curtain="Page name">
     Single-page apps: await Kit.curtain('Name', () => renderNewView())  */
  function curtainEl() {
    let c = $('.curtain');
    if (!c) {
      c = document.createElement('div');
      c.className = 'curtain';
      c.setAttribute('aria-hidden', 'true');
      c.innerHTML = '<div class="curtain-panel curtain-a"></div><div class="curtain-panel curtain-b"><span class="curtain-label"></span></div>';
      document.body.append(c);
    }
    return c;
  }
  async function curtain(label, whileCovered) {
    const c = curtainEl();
    if (reduce()) { whileCovered && (await whileCovered()); return; }
    $('.curtain-label', c).textContent = label || '';
    c.className = 'curtain is-in';
    await wait(900);
    whileCovered && (await whileCovered());
    c.className = 'curtain is-out';
    await wait(950);
    c.className = 'curtain';
  }
  function initCurtainLinks() {
    // Arriving from a curtain link: start covered, then lift away
    let flag, label; try { flag = sessionStorage.getItem('kit-curtain'); label = sessionStorage.getItem('kit-label'); sessionStorage.removeItem('kit-curtain'); } catch {}
    if (flag && !reduce()) {
      const c = curtainEl();
      $('.curtain-label', c).textContent = label || '';
      c.className = 'curtain is-covered';
      requestAnimationFrame(() => requestAnimationFrame(async () => {
        c.className = 'curtain is-out';
        await wait(950);
        c.className = 'curtain';
      }));
    }
    document.addEventListener('click', async (e) => {
      const a = e.target.closest('a[data-curtain]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.origin !== location.origin || reduce()) return;
      e.preventDefault();
      const c = curtainEl();
      $('.curtain-label', c).textContent = a.dataset.curtain || '';
      c.className = 'curtain is-in';
      try { sessionStorage.setItem('kit-curtain', '1'); sessionStorage.setItem('kit-label', a.dataset.curtain || ''); } catch {}
      await wait(900);
      location.href = a.href;
    });
  }

  function init() {
    initTheme();
    try { const p = localStorage.getItem('palette'); if (p) root.dataset.palette = p; } catch {}
    initInView(); initPointer(); initNav(); initAccordion(); initCurtainLinks();
  }
  window.Kit = { init, setTheme, setPalette, setSpeed, curtain, refresh: () => { initInView(); initPointer(); } };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
