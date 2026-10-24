# Modern UI Design Kit

The colours, layout and motion from your personal website, packaged so you can
reuse them in any future project. Works with plain HTML, or with React/Next.js.

**See it first:** open `demo/index.html` in your browser (double-click it, or use
the VS Code "Live Server" extension). Use the palette menu and speed slider at the bottom.

```
design-kit/
  css/
    tokens.css       colours, fonts, spacing, SPEED dial   <- edit this first
    palettes.css     5 ready-made palettes (ocean, forest, ember, rose, mono)
    layout.css       reset, containers, grids, bento gallery, rows
    components.css   buttons, nav pill, cards, covers, forms, accordion, chips
    motion.css       page curtain, theme reveal, word reveal, marquee, glow
  js/
    kit.js           plain JavaScript, no libraries (data-attribute powered)
    head-snippet.html  paste in <head> to avoid a dark/light flash
  react/             framer-motion versions for Next.js (see below)
  demo/              working example pages
```

## 1. Use it in plain HTML

In `<head>` (order matters):

```html
<!-- contents of js/head-snippet.html first, then: -->
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/palettes.css">   <!-- optional -->
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/motion.css">
```

Before `</body>`: `<script src="js/kit.js"></script>`

### Switch effects on with attributes

| Add this | What it does |
| --- | --- |
| `data-split` on a heading | Words rise out of a mask. `data-delay="0.3"` waits 0.3s |
| `data-reveal` | Blur-in when scrolled into view. `data-reveal="clip"` wipes in instead |
| `data-tilt` | 3D tilt following the cursor (great on book covers) |
| `data-magnetic` | Element leans toward the cursor (wrap a button) |
| `data-count="128"` | Number counts up when visible |
| `data-progress="64"` | Progress bar that fills when visible |
| `data-glow` on a section | Soft accent glow follows the cursor |
| `data-theme-toggle` on a button | Dark/light switch with a circular reveal |
| `data-nav` on the header | Hides on scroll down, returns on scroll up |
| `data-accordion` on a wrapper | Smooth expand/collapse (`.acc` markup in components.css) |
| `<a href="x.html" data-curtain="Page name">` | Page-wipe transition between pages |

Single-page apps: `await Kit.curtain('Name', () => showNewView())`

### JavaScript controls

```js
Kit.setTheme('dark')       // or 'light'
Kit.setPalette('ocean')    // or '' for the default
Kit.setSpeed(0.7)          // snappier;  1.6 = slow and cinematic
Kit.refresh()              // after adding new elements dynamically
```

## 2. Change the look

**Colours**: edit the variables in `css/tokens.css` (`--bg`, `--surface`, `--text`,
`--accent` ...). Light values live under `:root`, dark values under
`:root[data-theme='dark']`. To invent a palette, copy a block in `palettes.css`.

**Speed**: one number controls everything: `--speed: 1;` in `tokens.css`.
Or set the individual timings: `--t-fast` (hovers), `--t-base` (cards, buttons),
`--t-slow` (reveals), `--t-curtain` (page wipe), `--stagger` (word delay).
The easing curve is `--ease`; it is what makes the motion feel smooth rather than mechanical.

**Layout**: width `--wrap`, section spacing `--section`, corner radius `--r-*`.
Grids are `.cards`, `.books`, `.bento`, `.feature`, `.split-2`, `.row`.

**Fonts**: Bricolage Grotesque (headings) and Instrument Sans (text), from Google Fonts.
Change `--font-display` and `--font-body`, and the `<link>` in `head-snippet.html`.

## 3. Use it in React / Next.js

1. `npm install framer-motion`
2. Copy `react/Motion.js`, `react/TLink.js`, `react/Providers.js` into `components/`
   and `react/template.js` to `app/template.js`.
3. Import the five CSS files in `app/layout.js` (or `globals.css` with `@import`).
4. Wrap your layout in `<Providers labels={{'/about':'About'}}>` and use `<TLink>` for links.
5. Components in `Motion.js`: `SplitHeading`, `Reveal`, `Tilt`, `Magnetic`, `CountUp`, `Bar`.
   Speed: edit `SPEED` at the top of `Providers.js`, and `ease` in `Motion.js`.

`react/*.example.js` show full pieces (hero with glow, gallery lightbox, timeline).
They import from the original website project, so adjust those imports.

## Good to know

- Motion switches off automatically for visitors who enable "reduce motion".
- The dark/light circular reveal uses the View Transitions API (Chrome, Edge, Safari 18+);
  other browsers switch instantly.
- Colours use `color-mix()`, supported by all current browsers.
