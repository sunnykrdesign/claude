/**
 * The content model. Everything in the app reads terms in this shape — the
 * bundled seed, the remote update payload and the SQLite rows all normalise
 * to `Term` before any UI sees them.
 */

export const CATEGORIES = [
  'Research',
  'UX Laws & Principles',
  'Design Process',
  'Deliverables & Artifacts',
  'Interaction & UI Patterns',
  'Visual & Typography',
  'Accessibility',
  'Product & Business',
  'Tech & Development',
  'Roles & Career',
  'Metrics & Analytics',
  'AI & Emerging',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES = ['core', 'intermediate', 'advanced'] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export type Source = {
  label: string;
  url: string;
};

export type Term = {
  id: string;
  term: string;
  aliases: string[];
  categories: Category[];
  /** One sentence, under 15 words. Rendered in list rows. */
  shortDef: string;
  /** 2–4 sentences of plain language. */
  longDef: string;
  example: string;
  /** "Commonly confused with" copy. Optional — only where it earns its place. */
  misuse?: string;
  relatedIds: string[];
  difficulty: Difficulty;
  sources: Source[];
};

/** The bundled/remote file format: a version stamp plus the terms. */
export type TermCollection = {
  /** Monotonic integer. The app only applies a remote payload with a higher version. */
  version: number;
  /** ISO date, for display in Settings. */
  generatedAt: string;
  terms: Term[];
};

/** The trimmed shape kept in memory for fuzzy search and list rendering. */
export type TermSummary = {
  id: string;
  term: string;
  aliases: string[];
  categories: Category[];
  shortDef: string;
  difficulty: Difficulty;
};

export function toSummary(term: Term): TermSummary {
  return {
    id: term.id,
    term: term.term,
    aliases: term.aliases,
    categories: term.categories,
    shortDef: term.shortDef,
    difficulty: term.difficulty,
  };
}

/**
 * Sort key for the A–Z index: case-folded, punctuation-stripped, and with a
 * leading article removed so "The Fold" files under F… nothing does that here
 * today, but "A/B test" must file under A rather than under punctuation.
 */
export function sortKey(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

/** The A–Z bucket a term belongs to. Anything not a–z lands in "#". */
export function indexLetter(term: string): string {
  const first = sortKey(term).charAt(0).toUpperCase();
  return first >= 'A' && first <= 'Z' ? first : '#';
}
