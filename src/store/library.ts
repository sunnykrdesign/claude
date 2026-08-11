/**
 * The app's single source of truth for content and progress.
 *
 * SQLite is the durable store; this keeps a light mirror in memory — a summary
 * per term for search and list rendering, plus bookmarks and revision state —
 * so screens render synchronously and search never awaits a query it does not
 * need to.
 */

import Fuse from 'fuse.js';
import { create } from 'zustand';

import seed from '../../assets/terms.json';
import {
  clearBookmarks as clearBookmarksRow,
  addBookmark,
  listBookmarkIds,
  removeBookmark,
} from '../data/bookmarks';
import {
  CONTENT_VERSION_KEY,
  getAllTerms,
  getCategoryCounts,
  getDb,
  getMeta,
  hasContentAtLeast,
  replaceTerms,
} from '../data/db';
import { clearRecentSearches, listRecentSearches, recordSearch } from '../data/history';
import {
  EMPTY_STREAK,
  RevisionState,
  ReviewOutcome,
  Streak,
  applyOutcome,
  dayKey,
  initialState,
} from '../data/leitner';
import { listRevisionStates, recordReviewDay, resetRevisionProgress, saveRevisionState } from '../data/revision';
import { buildFuse } from '../data/search';
import { parseCollection } from '../data/validate';
import { TermSummary, toSummary } from '../types/term';
import { termOfTheDay } from '../utils/termOfTheDay';

export type LibraryStatus = 'idle' | 'loading' | 'ready' | 'error';

type LibraryState = {
  status: LibraryStatus;
  error: string | null;
  contentVersion: number;

  /** Sorted A–Z. The order every list relies on. */
  index: TermSummary[];
  byId: Record<string, TermSummary>;
  fuse: Fuse<TermSummary> | null;
  categoryCounts: Record<string, number>;

  /** Newest first. */
  bookmarks: string[];
  revision: Record<string, RevisionState>;
  streak: Streak;
  recentSearches: string[];

  init: () => Promise<void>;
  reloadIndex: () => Promise<void>;
  isBookmarked: (termId: string) => boolean;
  toggleBookmark: (termId: string) => Promise<boolean>;
  clearBookmarks: () => Promise<void>;
  reviewTerm: (termId: string, outcome: ReviewOutcome) => Promise<void>;
  resetProgress: () => Promise<void>;
  noteSearch: (query: string) => Promise<void>;
  clearRecent: () => Promise<void>;
  termOfTheDay: () => TermSummary | null;
};

let initPromise: Promise<void> | null = null;

export const useLibrary = create<LibraryState>((set, get) => ({
  status: 'idle',
  error: null,
  contentVersion: 0,
  index: [],
  byId: {},
  fuse: null,
  categoryCounts: {},
  bookmarks: [],
  revision: {},
  streak: EMPTY_STREAK,
  recentSearches: [],

  async init() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      set({ status: 'loading', error: null });
      try {
        const db = await getDb();

        // First run, or a bundled corpus newer than what is stored.
        const parsed = parseCollection(seed);
        if (!parsed.ok) {
          throw new Error(`Bundled content is unusable: ${parsed.reason}`);
        }
        if (!(await hasContentAtLeast(db, parsed.collection.version))) {
          await replaceTerms(db, parsed.collection.terms, parsed.collection.version);
        }

        await get().reloadIndex();

        const [bookmarks, revisionStates, recentSearches] = await Promise.all([
          listBookmarkIds(),
          listRevisionStates(),
          listRecentSearches(),
        ]);

        const { loadStreak } = await import('../data/revision');
        set({
          bookmarks,
          revision: Object.fromEntries(revisionStates.map((state) => [state.termId, state])),
          recentSearches,
          streak: await loadStreak(),
          status: 'ready',
        });
      } catch (error) {
        initPromise = null;
        set({
          status: 'error',
          error: error instanceof Error ? error.message : 'The dictionary could not be opened.',
        });
      }
    })();

    return initPromise;
  },

  /** Re-reads the corpus. Called at launch and again after a content update. */
  async reloadIndex() {
    const db = await getDb();
    const terms = await getAllTerms();
    const index = terms.map(toSummary);

    set({
      index,
      byId: Object.fromEntries(index.map((term) => [term.id, term])),
      fuse: buildFuse(index),
      categoryCounts: await getCategoryCounts(),
      contentVersion: Number((await getMeta(db, CONTENT_VERSION_KEY)) ?? 0),
    });
  },

  isBookmarked(termId) {
    return get().bookmarks.includes(termId);
  },

  /** Returns the state after toggling, so callers can word their toast. */
  async toggleBookmark(termId) {
    const saved = get().bookmarks.includes(termId);

    // Update first: a bookmark tap should never feel like it is waiting on disk.
    set((state) => ({
      bookmarks: saved
        ? state.bookmarks.filter((id) => id !== termId)
        : [termId, ...state.bookmarks],
    }));

    try {
      if (saved) {
        await removeBookmark(termId);
      } else {
        await addBookmark(termId);
      }
    } catch {
      set({ bookmarks: await listBookmarkIds() });
    }
    return !saved;
  },

  async clearBookmarks() {
    set({ bookmarks: [] });
    await clearBookmarksRow();
  },

  async reviewTerm(termId, outcome) {
    const now = Date.now();
    const current = get().revision[termId] ?? initialState(termId, now);
    const next = applyOutcome(current, outcome, now);

    set((state) => ({ revision: { ...state.revision, [termId]: next } }));

    await saveRevisionState(next);
    set({ streak: await recordReviewDay(now) });
  },

  async resetProgress() {
    set({ revision: {}, streak: EMPTY_STREAK });
    await resetRevisionProgress();
  },

  async noteSearch(query) {
    await recordSearch(query);
    set({ recentSearches: await listRecentSearches() });
  },

  async clearRecent() {
    set({ recentSearches: [] });
    await clearRecentSearches();
  },

  termOfTheDay() {
    return termOfTheDay(get().index, dayKey(Date.now()));
  },
}));

/** Test seam — drops the memoised init so a fresh store can be built. */
export function resetLibraryForTests(): void {
  initPromise = null;
}
