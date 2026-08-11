/** Saved terms. Stored separately from the corpus so content updates never touch them. */

import { getDb } from './db';

export async function listBookmarkIds(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ term_id: string }>(
    'SELECT term_id FROM bookmarks ORDER BY created_at DESC',
  );
  return rows.map((row) => row.term_id);
}

export async function addBookmark(termId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO bookmarks (term_id, created_at) VALUES (?, ?)',
    [termId, Date.now()],
  );
}

export async function removeBookmark(termId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM bookmarks WHERE term_id = ?', [termId]);
}

export async function clearBookmarks(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM bookmarks');
}
