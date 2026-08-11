/**
 * Category tints.
 *
 * Rather than twelve unrelated colours, each category's hue is the accent hue
 * rotated by a fixed amount. The sweep runs blue → violet → magenta, so chips
 * always read as members of one family. Saturation and lightness are constant
 * per scheme, which keeps contrast predictable without hand-tuning twelve pairs.
 *
 * Colour is never the only signal: every chip carries its category name.
 */

import { ACCENT_HUE, ColorScheme } from './tokens';
import { CATEGORIES, Category } from '../types/term';

/** Total hue sweep across the taxonomy, in degrees. */
const SWEEP = 112;

const START = -46;

const STEP = SWEEP / (CATEGORIES.length - 1);

export function categoryHue(category: string): number {
  const index = (CATEGORIES as readonly string[]).indexOf(category);
  if (index < 0) return ACCENT_HUE;
  return Math.round(ACCENT_HUE + START + index * STEP);
}

export type CategoryTint = {
  /** Chip background. */
  surface: string;
  /** Chip hairline. */
  border: string;
  /** Chip label, and the accent rule on category headers. */
  text: string;
};

export function categoryTint(category: string, scheme: ColorScheme): CategoryTint {
  const h = categoryHue(category);
  if (scheme === 'dark') {
    return {
      surface: `hsl(${h}, 26%, 17%)`,
      border: `hsl(${h}, 24%, 27%)`,
      text: `hsl(${h}, 58%, 78%)`,
    };
  }
  return {
    surface: `hsl(${h}, 46%, 95%)`,
    border: `hsl(${h}, 38%, 87%)`,
    text: `hsl(${h}, 44%, 33%)`,
  };
}

/**
 * One line per category, used on the browse grid so the taxonomy explains
 * itself rather than relying on the label alone.
 */
export const CATEGORY_BLURBS: Record<Category, string> = {
  Research: 'Finding out what people actually do.',
  'UX Laws & Principles': 'The named rules people cite in critique.',
  'Design Process': 'How the work moves from problem to shipped.',
  'Deliverables & Artifacts': 'The things you hand to someone else.',
  'Interaction & UI Patterns': 'Controls, flows and the conventions behind them.',
  'Visual & Typography': 'Type, colour, grid and hierarchy.',
  Accessibility: 'Designing so more people can use it.',
  'Product & Business': 'The commercial frame around the design work.',
  'Tech & Development': 'What engineers mean in the same meeting.',
  'Roles & Career': 'Job titles, ladders and ways of working.',
  'Metrics & Analytics': 'How teams measure whether it worked.',
  'AI & Emerging': 'The vocabulary arriving with new interfaces.',
};
