# Castle Chess Academy — website ZIP

**A ready-to-host, static chess website with a playable game and an original lesson database.** The package was designed for simple upload to an existing website and works without third-party CDNs, API keys, a server database, or a build step.

## What's included

| Feature | Details |
| --- | --- |
| Chess game | 2-player local chess or play versus a built-in, offline chess computer with 3 practical skill settings |
| Legal move engine | Castling, en passant, all 4 promotions, checks, checkmate, stalemate, repetition and move-counter draw rules |
| Chess interface | 64-square interactive board, legal-move highlights, desktop drag-and-drop and mobile click/tap-to-move, move history, board flip and 4 board themes |
| Learning library | **204 original lessons** grouped into **17 courses** (fundamentals, rules, openings, tactics, strategy, endgames, calculation and more) |
| Lesson interaction | Guided legal move walkthroughs, practice mode, interactive knowledge checks and completion tracking |
| Puzzle trainer | **52 original legal positions** with correct-move validation, hints and answer explanations; 36 are mate-in-one positions |
| Database formats | `data/lessons.json`, `data/puzzles.json`, CSV exports, and a real relational SQLite database `data/chess_academy.sqlite` |
| Progress | Saved locally in the current browser with `localStorage` (no account or data transfer) |
| Publishing | Standalone HTML/CSS/JS/SVG; no installer or build process required |

**Scope note:** This is a broad, original chess curriculum. It is **not a copy of Chess.com's proprietary lessons, videos, game engine, or entire catalog**, and it cannot claim to cover every chess concept ever taught. The included chess AI is a lightweight training opponent, **not an Elo-calibrated or grandmaster-strength Stockfish engine**. The site does not include online multiplayer, user accounts, or cloud progress sync.

## Publish on your website

1. Extract this ZIP.
2. Upload the **contents of the `chess_academy_website` folder** into a directory such as `public_html/chess/` or your hosting provider's equivalent.
3. Preserve all subfolders (`assets/`, `js/`, `data/`, `docs/`). **Do not upload only `index.html`.**
4. Open `https://YOUR-DOMAIN.com/chess/` in a browser.

To embed it into another page on the same website:

```html
<iframe
  src="/chess/"
  title="Castle Chess Academy"
  style="display:block;width:100%;height:1000px;border:0;border-radius:16px"
  loading="lazy"
></iframe>
```

The entire site may also be opened locally by double-clicking `index.html`; the lesson data is loaded from accompanying JS rather than requiring `fetch()` (which is frequently restricted for `file://` pages).

## Directory map

```text
chess_academy_website/
├── index.html                  # Website entry point
├── assets/
│   ├── styles.css              # Responsive design, colors and board themes
│   ├── favicon.svg
│   └── pieces/                 # 12 bundled white/black SVG chess-piece assets
├── js/
│   ├── chess-engine.js         # Original legal chess implementation
│   └── app.js                  # UI, computer opponent, puzzles and progress
├── data/
│   ├── lessons.json            # Source JSON curriculum (204 lessons / 17 courses)
│   ├── puzzles.json            # Source JSON training positions (52)
│   ├── lessons.js              # Offline-ready website copy of lessons.json
│   ├── puzzles.js              # Offline-ready website copy of puzzles.json
│   ├── lessons.csv             # Spreadsheet/database import
│   ├── puzzles.csv
│   └── chess_academy.sqlite    # Relational database with courses/lessons/puzzles tables
├── docs/
│   ├── DATABASE_GUIDE.md
│   └── THIRD_PARTY_LICENSES.md
├── build_data.py              # Rebuild curated curriculum JSON/JS
├── generate_puzzles.js        # Regenerate seeded practice puzzles JSON/JS
├── export_database.py         # Regenerate CSV and SQLite from JSON
├── test_integrity.js          # Test legal moves and content integrity
└── LICENSE                    # Original content/code terms; asset attribution separate
```

## Customize

- **Brand or title:** edit `index.html` and brand labels in `js/app.js`.
- **Colors/theme:** edit CSS variables in `assets/styles.css`.
- **Lessons:** edit `data/lessons.json`. For the web app to show edits, update `data/lessons.js` to set `window.CHESS_LESSONS` to that JSON object; alternatively edit the catalog entries in `build_data.py`, then run `python build_data.py` to regenerate both.
- **Puzzles:** edit `data/puzzles.json` and update the corresponding `data/puzzles.js`, or re-run `node generate_puzzles.js` to rebuild the example puzzle bank.
- **CSV/SQLite:** after updating JSON, run `python export_database.py`.
- **Game:** `js/chess-engine.js` provides the rules; `js/app.js` provides the bot, UI and gameplay controls.

## Test

If Node.js is installed, run:

```bash
node test_integrity.js
```

This checks 20/400/8902 standard move-generation counts for the first three depths, checkmate, castling and undo, en passant, underpromotion, all 204 lesson sequences and the 52 puzzle solutions.

## Dependencies, rights and attribution

No network requests are needed to run the website. Original application code and original lesson content are included for customization and use on your site (see `LICENSE`). The chess-piece silhouettes are adapted from Font Awesome Free (CC BY 4.0), with attribution and modification information in `docs/THIRD_PARTY_LICENSES.md`. Retain that attribution file when publishing.

The look is an original modern dark chess workspace informed by the general conventions of online chess interfaces. It is not endorsed by, associated with, or a reproduction of Chess.com.
