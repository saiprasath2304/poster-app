import { writable, get } from 'svelte/store';
import type {
  PosterData,
  ScheduleEvent,
  FooterSection,
  RecurrenceRule,
  LogoConfig,
  PosterJsonExport
} from '$lib/types';
import { generateId } from '$lib/utils/id';
import {
  monthIndexToName,
  monthNameToIndex,
  getDatesForWeekday,
  formatShortDate,
  dayName,
  toIsoDate,
  sortByIsoDate
} from '$lib/utils/dateUtils';
import { themes } from '$lib/themes/themes';

const STORAGE_KEY = 'poster-data-v1';
const MAX_HISTORY = 50;

export function createDefaultPoster(): PosterData {
  const now = new Date();
  const month = monthIndexToName(now.getMonth());
  return {
    id: generateId(),
    organization: 'Your Organization Name',
    month,
    year: now.getFullYear(),
    tableTitle: `${month} Regular Offerings`,
    dateColumnLabel: 'Date',
    events: [],
    recurrenceRules: [],
    footerSections: [],
    themeId: themes[0].id,
    logo: { dataUrl: null, position: 'top-left', size: 64, opacity: 1 },
    fontScale: 1,
    updatedAt: now.toISOString()
  };
}

function loadInitial(): PosterData {
  if (typeof localStorage === 'undefined') return createDefaultPoster();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPoster();
    return JSON.parse(raw) as PosterData;
  } catch {
    return createDefaultPoster();
  }
}

function persist(data: PosterData) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Reactive flags the UI (undo/redo toolbar buttons) can subscribe to directly.
export const canUndo = writable(false);
export const canRedo = writable(false);

function createPosterStore() {
  const { subscribe, update } = writable<PosterData>(loadInitial());
  let undoStack: PosterData[] = [];
  let redoStack: PosterData[] = [];

  function syncFlags() {
    canUndo.set(undoStack.length > 0);
    canRedo.set(redoStack.length > 0);
  }

  function snapshot(current: PosterData) {
    undoStack.push(JSON.parse(JSON.stringify(current)));
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];
    syncFlags();
  }

  /** Every mutating action goes through commit() so history + persistence stay correct. */
  function commit(mutator: (data: PosterData) => PosterData) {
    update((current) => {
      snapshot(current);
      const next = { ...mutator(current), updatedAt: new Date().toISOString() };
      persist(next);
      return next;
    });
  }

  return {
    subscribe,

    // ---------------- org / meta ----------------
    setOrganization: (organization: string) => commit((d) => ({ ...d, organization })),
    setMonthYear: (month: string, year: number) =>
      commit((d) => ({ ...d, month, year, tableTitle: `${month} Regular Offerings` })),
    setTableTitle: (tableTitle: string) => commit((d) => ({ ...d, tableTitle })),
    setDateColumnLabel: (dateColumnLabel: string) => commit((d) => ({ ...d, dateColumnLabel })),
    setTheme: (themeId: string) => commit((d) => ({ ...d, themeId })),
    setFontScale: (fontScale: number) => commit((d) => ({ ...d, fontScale })),
    setLogo: (logo: LogoConfig) => commit((d) => ({ ...d, logo })),

    // ---------------- events ----------------
    addEvent: (event: Omit<ScheduleEvent, 'id' | 'order'>) =>
      commit((d) => ({
        ...d,
        events: [...d.events, { ...event, id: generateId(), order: d.events.length }]
      })),

    updateEvent: (id: string, patch: Partial<ScheduleEvent>) =>
      commit((d) => ({
        ...d,
        events: d.events.map((e) => (e.id === id ? { ...e, ...patch } : e))
      })),

    removeEvent: (id: string) =>
      commit((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) })),

    duplicateEvent: (id: string) =>
      commit((d) => {
        const src = d.events.find((e) => e.id === id);
        if (!src) return d;
        const copy: ScheduleEvent = { ...src, id: generateId(), order: d.events.length };
        return { ...d, events: [...d.events, copy] };
      }),

    reorderEvents: (orderedIds: string[]) =>
      commit((d) => ({
        ...d,
        events: orderedIds
          .map((id, idx) => {
            const e = d.events.find((ev) => ev.id === id);
            return e ? { ...e, order: idx } : null;
          })
          .filter((e): e is ScheduleEvent => e !== null)
      })),

    // ---------------- recurrence ----------------
    addRecurrenceRule: (rule: Omit<RecurrenceRule, 'id'>) =>
      commit((d) => ({
        ...d,
        recurrenceRules: [...d.recurrenceRules, { ...rule, id: generateId() }]
      })),

    removeRecurrenceRule: (id: string) =>
      commit((d) => ({
        ...d,
        recurrenceRules: d.recurrenceRules.filter((r) => r.id !== id),
        events: d.events.filter((e) => e.recurrenceId !== id)
      })),

    /** Auto-generates dated events for the current month from all weekly recurrence rules. */
    generateFromRecurrenceRules: () =>
      commit((d) => {
        const monthIndex = monthNameToIndex(d.month);
        const manualEvents = d.events.filter((e) => !e.recurrenceId);
        const generatedByDate = new Map<string, ScheduleEvent>();

        d.recurrenceRules.forEach((rule) => {
          if (rule.type !== 'weekly' || rule.dayOfWeek === undefined) return;
          const dates = getDatesForWeekday(d.year, monthIndex, rule.dayOfWeek);
          dates.forEach((date) => {
            const isoDate = toIsoDate(date);
            const description = rule.items.map((i) => `${i.time} ${i.label}`).join(', ');
            const existing = generatedByDate.get(isoDate);

            if (existing) {
              // Same date already has a generated event (from another rule) -
              // merge into one row instead of creating a duplicate.
              existing.title = `${existing.title}\n${rule.title}`;
              existing.description = `${existing.description ?? ''}\n${description}`.trim();
              existing.highlight = existing.highlight || !!rule.highlight;
            } else {
              generatedByDate.set(isoDate, {
                id: generateId(),
                date: formatShortDate(date),
                day: dayName(date),
                isoDate,
                title: rule.title,
                description,
                highlight: rule.highlight,
                order: 0,
                recurrenceId: rule.id
              });
            }
          });
        });

        const merged = sortByIsoDate([...manualEvents, ...generatedByDate.values()]).map(
          (e, idx) => ({ ...e, order: idx })
        );
        return { ...d, events: merged };
      }),

    // ---------------- footer sections ----------------
    addFooterSection: (section: Omit<FooterSection, 'id' | 'order'>) =>
      commit((d) => ({
        ...d,
        footerSections: [
          ...d.footerSections,
          { ...section, id: generateId(), order: d.footerSections.length }
        ]
      })),

    updateFooterSection: (id: string, patch: Partial<FooterSection>) =>
      commit((d) => ({
        ...d,
        footerSections: d.footerSections.map((f) => (f.id === id ? { ...f, ...patch } : f))
      })),

    removeFooterSection: (id: string) =>
      commit((d) => ({ ...d, footerSections: d.footerSections.filter((f) => f.id !== id) })),

    toggleFooterVisibility: (id: string) =>
      commit((d) => ({
        ...d,
        footerSections: d.footerSections.map((f) =>
          f.id === id ? { ...f, visible: !f.visible } : f
        )
      })),

    reorderFooterSections: (orderedIds: string[]) =>
      commit((d) => ({
        ...d,
        footerSections: orderedIds
          .map((id, idx) => {
            const f = d.footerSections.find((sec) => sec.id === id);
            return f ? { ...f, order: idx } : null;
          })
          .filter((f): f is FooterSection => f !== null)
      })),

    // ---------------- templates / import-export ----------------
    loadData: (data: PosterData) => commit(() => data),

    importJson: (json: PosterJsonExport) =>
      commit((d) => ({
        ...d,
        organization: json.organization,
        month: json.month,
        year: json.year,
        events: json.events,
        footerSections: json.footerSections
      })),

    reset: () => commit(() => createDefaultPoster()),

    // ---------------- undo / redo ----------------
    undo: () => {
      if (undoStack.length === 0) return;
      update((current) => {
        redoStack.push(JSON.parse(JSON.stringify(current)));
        const prev = undoStack.pop() as PosterData;
        persist(prev);
        syncFlags();
        return prev;
      });
    },

    redo: () => {
      if (redoStack.length === 0) return;
      update((current) => {
        undoStack.push(JSON.parse(JSON.stringify(current)));
        const next = redoStack.pop() as PosterData;
        persist(next);
        syncFlags();
        return next;
      });
    }
  };
}

export const posterStore = createPosterStore();

export function exportPosterJson(data: PosterData): PosterJsonExport {
  return {
    organization: data.organization,
    month: data.month,
    year: data.year,
    events: data.events,
    footerSections: data.footerSections
  };
}

/** Non-reactive snapshot helper, useful inside event handlers / export code. */
export function currentPosterData(): PosterData {
  return get(posterStore);
}
