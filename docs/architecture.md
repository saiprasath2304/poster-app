# Architecture & component breakdown

## Folder structure

```
src/
├── app.html                 # HTML shell, Google Fonts, favicon
├── app.css                  # Tailwind layers + shared component classes
├── app.d.ts                 # SvelteKit ambient types
├── routes/
│   ├── +layout.svelte       # imports app.css, wraps every page
│   └── +page.svelte         # main app shell: toolbar + sidebar + preview
└── lib/
    ├── types/index.ts       # ScheduleEvent, FooterSection, PosterData, etc.
    ├── stores/
    │   ├── posterStore.ts   # single source of truth + undo/redo + persistence
    │   └── uiStore.ts       # zoom level, active sidebar tab, selection
    ├── themes/themes.ts     # 4 built-in PosterTheme definitions
    ├── utils/
    │   ├── id.ts             # crypto.randomUUID() wrapper
    │   ├── dateUtils.ts       # month/weekday math, date formatting
    │   └── exportUtils.ts     # html-to-image + jsPDF export/print
    ├── services/
    │   ├── templateService.ts # localStorage CRUD for saved templates
    │   └── aiService.ts       # unimplemented interface for future AI features
    └── components/
        ├── EditableText.svelte      # generic contenteditable → dispatches 'change'
        ├── PosterPreview.svelte     # the poster itself (HTML/CSS, not canvas)
        ├── PosterHeader.svelte      # org name + logo/watermark
        ├── EventRow.svelte          # one <tr> in the schedule table
        ├── FooterSectionView.svelte # one footer block (left or right column)
        ├── ImageUpload.svelte       # shared logo/watermark file picker
        ├── Toolbar/
        │   ├── ZoomControl.svelte   # 50/75/100/150% buttons
        │   └── UndoRedo.svelte      # ↶ / ↷ buttons wired to posterStore
        └── Sidebar/
            ├── OrgForm.svelte          # org name, month/year, logo, font scale
            ├── EventList.svelte        # add/edit/duplicate/delete/drag-reorder events
            ├── RecurringEventForm.svelte # weekly rules + "auto-generate month"
            ├── FooterEditor.svelte     # add/edit/reorder/hide footer sections
            ├── ThemeSelector.svelte    # 4 theme swatches
            ├── TemplateManager.svelte  # save/load/duplicate/delete templates
            └── ExportPanel.svelte      # PNG/JPG/PDF/Print + JSON import/export
```

## State management

Everything the poster needs lives in **one** Svelte store: `posterStore`
(`src/lib/stores/posterStore.ts`). It's a plain `writable<PosterData>` wrapped
in an object of named actions (`addEvent`, `updateFooterSection`, `setTheme`,
...) — the "Zustand-like" pattern the brief asked for, just built on Svelte's
native store primitive instead of an external library.

Every mutating action funnels through an internal `commit()` helper that:

1. Pushes a deep-cloned snapshot of the *current* state onto an undo stack
   (capped at 50 entries) and clears the redo stack.
2. Applies the mutation, stamps `updatedAt`, and writes the result to
   `localStorage`.

`posterStore.undo()` / `.redo()` pop from those stacks and two exported
stores, `canUndo` / `canRedo`, let the toolbar reactively enable/disable its
buttons. `+page.svelte` wires `Ctrl+Z` / `Ctrl+Y` (and `Ctrl+Shift+Z`) to
these via a `svelte:window on:keydown` listener.

`uiStore.ts` holds view-only state that shouldn't be undoable or persisted —
zoom level and which sidebar tab is active.

## Inline editing

`EditableText.svelte` is the one component every editable poster string goes
through. It renders a `contenteditable` element, and on `blur` compares the
new text to the `value` prop; if it changed, it dispatches a `change` event
with the new string. Every poster component (`EventRow`, `FooterSectionView`,
`PosterHeader`, the table headers in `PosterPreview`) listens for that event
and calls the matching `posterStore` action — so typing directly on the
poster and typing in the sidebar form both write to the exact same store, and
both take part in undo/redo.

## Rendering strategy (no canvas)

`PosterPreview.svelte` renders the poster as **real HTML**: a `<table>` for
the schedule grid, a flex/grid footer, and CSS custom properties
(`--bg-from`, `--table-header-bg`, `--highlight`, `--font-scale`, ...) driven
by the active `PosterTheme` and `fontScale`. Nothing is drawn to a `<canvas>`
at any point, so every element stays selectable, inspectable, and editable.

The poster has a **fixed intrinsic size** of 1200×849px (A4 landscape ratio).
A wrapper computes a `fitScale` from the available container width via
`bind:clientWidth`, multiplies it by the user's chosen `zoom` level from
`uiStore`, and applies both as a single CSS `transform: scale(...)` — so the
DOM structure and font sizes never change, only the on-screen scale. This is
also exactly the node that gets captured on export.

## Export pipeline

`exportUtils.ts` wraps `html-to-image` (`toPng` / `toJpeg`) and `jsPDF`:

- **PNG/JPG** — `toPng`/`toJpeg` rasterize the *actual* preview DOM node at
  3x pixel ratio for print-quality output, then trigger a download.
- **PDF** — takes the same high-res PNG data URL and drops it onto a single
  A4-landscape `jsPDF` page sized exactly to the page dimensions.
- **Print** — opens a new window with `@page { size: A4 landscape; margin:0 }`
  and an `<img>` of the same high-res PNG, then calls `window.print()`.

Because export always reads the live preview node (not a re-render), the
exported file is guaranteed to match whatever is on screen, including any
in-place edits, theme, zoom-independent scale, and logo placement.

## Recurring events & auto-generate

`RecurringEventForm.svelte` collects a weekly rule (day of week + a list of
timed items, e.g. "06:00 PM Vedam"). `posterStore.generateFromRecurrenceRules()`
uses `dateUtils.getDatesForWeekday(year, monthIndex, dayOfWeek)` to find every
matching date in the poster's current month/year, builds one `ScheduleEvent`
per date tagged with `recurrenceId`, and merges those with manually-added
events (identified by the *absence* of a `recurrenceId`) so re-running
"auto-generate" never clobbers one-off entries like "Guru Purnima
Celebrations".

## Templates & Import/Export JSON

`templateService.ts` is a thin CRUD wrapper around a single `localStorage`
key holding an array of `PosterTemplate` (id, name, full `PosterData`
snapshot, timestamps). `ExportPanel.svelte` additionally exposes raw
Export/Import JSON using the smaller `PosterJsonExport` shape from the brief
(`organization`, `month`, `year`, `events`, `footerSections`) for
interchange with other tools or a future backend.

## AI architecture (not implemented)

`aiService.ts` defines the `AIService` interface
(`generatePosterFromPrompt`, `generateEventsFromText`,
`generateThemeFromImage`) and exports a `NotImplementedAIService` that throws
descriptive errors. No UI currently calls it. When AI generation is built,
swap the exported `aiService` singleton for a real implementation (e.g. one
that calls backend `/api/ai/*` routes) — no other file needs to change.
