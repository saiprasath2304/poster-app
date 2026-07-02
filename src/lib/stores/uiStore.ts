import { writable } from 'svelte/store';

export type ZoomLevel = 0.5 | 0.75 | 1 | 1.5;
export const ZOOM_LEVELS: ZoomLevel[] = [0.5, 0.75, 1, 1.5];

export type SidebarTab =
  | 'org'
  | 'events'
  | 'recurring'
  | 'footer'
  | 'theme'
  | 'templates'
  | 'export';

export const zoom = writable<ZoomLevel>(1);
export const activeTab = writable<SidebarTab>('org');
export const selectedEventId = writable<string | null>(null);
export const isExporting = writable(false);
