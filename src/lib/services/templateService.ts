import type { PosterData, PosterTemplate } from '$lib/types';
import { generateId } from '$lib/utils/id';

const STORAGE_KEY = 'poster-templates-v1';

function readAll(): PosterTemplate[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PosterTemplate[]) : [];
  } catch {
    return [];
  }
}

function writeAll(templates: PosterTemplate[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export const templateService = {
  list(): PosterTemplate[] {
    return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  save(name: string, data: PosterData): PosterTemplate {
    const templates = readAll();
    const now = new Date().toISOString();
    const template: PosterTemplate = {
      id: generateId(),
      name,
      data,
      createdAt: now,
      updatedAt: now
    };
    templates.push(template);
    writeAll(templates);
    return template;
  },

  update(id: string, data: PosterData, name?: string): PosterTemplate | null {
    const templates = readAll();
    const idx = templates.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    templates[idx] = {
      ...templates[idx],
      data,
      name: name ?? templates[idx].name,
      updatedAt: new Date().toISOString()
    };
    writeAll(templates);
    return templates[idx];
  },

  duplicate(id: string): PosterTemplate | null {
    const templates = readAll();
    const source = templates.find((t) => t.id === id);
    if (!source) return null;
    const now = new Date().toISOString();
    const copy: PosterTemplate = {
      ...source,
      id: generateId(),
      name: `${source.name} (copy)`,
      createdAt: now,
      updatedAt: now
    };
    templates.push(copy);
    writeAll(templates);
    return copy;
  },

  remove(id: string): void {
    writeAll(readAll().filter((t) => t.id !== id));
  },

  get(id: string): PosterTemplate | null {
    return readAll().find((t) => t.id === id) ?? null;
  }
};
