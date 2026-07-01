// Architecture-only placeholders for future AI-assisted poster generation.
// None of these are implemented yet - they define the contract the UI
// (and a future backend) will code against, so wiring in a real model
// later is a drop-in change rather than a redesign.

import type { PosterData, ScheduleEvent, PosterTheme } from '$lib/types';

export interface AIService {
  /** Generate a full poster (org, month, events, footers) from a free-text prompt. */
  generatePosterFromPrompt(prompt: string): Promise<Partial<PosterData>>;

  /** Parse loosely-structured text (e.g. pasted WhatsApp schedule) into events. */
  generateEventsFromText(text: string): Promise<ScheduleEvent[]>;

  /** Derive a theme's color palette from an uploaded reference image. */
  generateThemeFromImage(imageDataUrl: string): Promise<PosterTheme>;
}

class NotImplementedAIService implements AIService {
  async generatePosterFromPrompt(): Promise<Partial<PosterData>> {
    throw new Error(
      'AI poster generation is not implemented yet. This is an architecture placeholder.'
    );
  }

  async generateEventsFromText(): Promise<ScheduleEvent[]> {
    throw new Error(
      'AI event extraction is not implemented yet. This is an architecture placeholder.'
    );
  }

  async generateThemeFromImage(): Promise<PosterTheme> {
    throw new Error(
      'AI theme generation is not implemented yet. This is an architecture placeholder.'
    );
  }
}

// Swap this export for a real implementation (e.g. one that calls your
// backend's /api/ai/* routes) once the feature is built.
export const aiService: AIService = new NotImplementedAIService();
