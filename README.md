# Monthly Schedule Poster Studio

A SvelteKit + TypeScript + TailwindCSS app for building, editing, and
exporting monthly event schedule posters (like a spiritual organization's
monthly offerings board), rendered entirely in HTML/CSS — no canvas — so
every piece of text stays clickable and editable.

## Quick start

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

```bash
npm run build      # production build
npm run preview    # serve the production build locally
npm run check       # svelte-check + TypeScript diagnostics
```

## What's included

- **Live, editable poster preview** — click any text on the poster itself
  (organization name, table heading, event title/description, footer
  titles/dates/items) to edit it in place; changes sync back to the sidebar
  forms and vice versa.
- **Event management** — add, duplicate, delete, and drag-to-reorder events;
  toggle a "highlight" state for special occasions.
- **Recurring events** — define a weekly rule (e.g. "Every Thursday, Evening
  Bhajan: 06:00 PM Vedam / 06:30 PM Ashtothram / 06:45 PM Bhajan") and click
  **Auto-generate** to populate every matching date in the selected month,
  without touching manually-added one-off events.
- **Footer schedule blocks** — reusable left/right footer sections with
  their own dates and timed items, hideable and drag-reorderable.
- **4 built-in themes** — Default Spiritual (purple), Sai (orange/gold),
  Temple (maroon/cream), Modern Corporate (blue/white) — swap instantly.
- **Logo / watermark upload** — top-left, top-right, or center watermark
  with adjustable size/opacity.
- **Font scale slider**, **zoom control** (50/75/100/150%), and full
  **undo/redo** (`Ctrl+Z` / `Ctrl+Y`, also in the toolbar).
- **Export** — PNG, JPG, and print-ready PDF (via `html-to-image` + `jsPDF`,
  rendered from the real DOM, not a canvas snapshot), plus browser Print.
- **Templates** — save the current poster, then load/duplicate/delete it
  later from `localStorage`.
- **Import/Export JSON** matching the brief's schema
  (`organization`, `month`, `year`, `events`, `footerSections`).
- **AI architecture (unimplemented)** — `src/lib/services/aiService.ts`
  defines the future `generatePosterFromPrompt` / `generateEventsFromText` /
  `generateThemeFromImage` contract so a real implementation is a drop-in
  swap later.

See `docs/architecture.md` for the full component/store breakdown and
`docs/database-schema.md` for the schema to migrate to once a backend is
added (everything currently lives in `localStorage`).

## Tech stack

SvelteKit 2 · Svelte 4 · TypeScript · TailwindCSS 3 · Vite 5 ·
`html-to-image` · `jsPDF`

## Notes

- Nothing is rendered to `<canvas>` — the poster is a real `<table>` +
  flex/grid DOM tree styled with CSS custom properties per theme, sized to
  an A4-landscape aspect ratio (1200×849 intrinsic px) and scaled with
  `transform: scale()` for zoom/responsive fit.
- No backend is required to run this; all data persists to the browser's
  `localStorage`.
