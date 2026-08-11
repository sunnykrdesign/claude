/**
 * Content updates.
 *
 * A versioned manifest is checked once per launch, after first paint, on a
 * timeout. Nothing here is ever awaited by the UI: if the network is slow,
 * absent or lying, the app keeps running on the content it already has.
 *
 * Manifest shape:
 *   { "version": 3, "generatedAt": "2026-01-04", "url": "https://…/terms-3.json" }
 */

import { CONTENT_FETCH_TIMEOUT_MS, CONTENT_MANIFEST_URL, CONTENT_MAX_BYTES } from '../config';
import { CONTENT_VERSION_KEY, getDb, getMeta, replaceTerms, setMeta } from './db';
import { parseCollection } from './validate';
import type { TermCollection } from '../types/term';

export const LAST_CHECKED_KEY = 'content_last_checked_at';

export type UpdateResult =
  | { status: 'disabled' }
  | { status: 'up-to-date'; version: number }
  | { status: 'updated'; version: number; termCount: number }
  | { status: 'failed'; reason: string };

async function fetchJson(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    signal,
    headers: { accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}.`);
  }

  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > CONTENT_MAX_BYTES) {
    throw new Error('Payload is larger than the allowed size.');
  }

  const text = await response.text();
  if (text.length > CONTENT_MAX_BYTES) {
    throw new Error('Payload is larger than the allowed size.');
  }
  return JSON.parse(text) as unknown;
}

function manifestUrl(manifest: unknown, base: string): { version: number; url: string } | null {
  if (typeof manifest !== 'object' || manifest === null) return null;
  const record = manifest as Record<string, unknown>;
  const version = Number(record.version);
  if (!Number.isInteger(version) || version < 1) return null;

  const raw = typeof record.url === 'string' ? record.url : null;
  if (!raw) return null;

  try {
    // Relative URLs in the manifest resolve against the manifest itself.
    const resolved = new URL(raw, base);
    if (resolved.protocol !== 'https:') return null;
    return { version, url: resolved.toString() };
  } catch {
    return null;
  }
}

/**
 * Checks for and applies newer content. Safe to call on every launch; safe to
 * call while the user is reading. Returns a result rather than throwing.
 */
export async function checkForContentUpdate(
  onApplied?: (collection: TermCollection) => void | Promise<void>,
): Promise<UpdateResult> {
  if (!CONTENT_MANIFEST_URL) return { status: 'disabled' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONTENT_FETCH_TIMEOUT_MS);

  try {
    const db = await getDb();
    const localVersion = Number((await getMeta(db, CONTENT_VERSION_KEY)) ?? 0);

    const manifest = manifestUrl(
      await fetchJson(CONTENT_MANIFEST_URL, controller.signal),
      CONTENT_MANIFEST_URL,
    );
    if (!manifest) return { status: 'failed', reason: 'Manifest was not readable.' };

    await setMeta(db, LAST_CHECKED_KEY, String(Date.now()));

    if (manifest.version <= localVersion) {
      return { status: 'up-to-date', version: localVersion };
    }

    const parsed = parseCollection(await fetchJson(manifest.url, controller.signal));
    if (!parsed.ok) return { status: 'failed', reason: parsed.reason };

    // The payload's own version wins over the manifest's, so a mismatched pair
    // can never leave the local version stamp ahead of the content.
    const version = Math.min(parsed.collection.version, manifest.version);
    await replaceTerms(db, parsed.collection.terms, version);
    await onApplied?.(parsed.collection);

    return { status: 'updated', version, termCount: parsed.collection.terms.length };
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.name === 'AbortError'
          ? 'The check timed out.'
          : error.message
        : 'The check failed.';
    return { status: 'failed', reason };
  } finally {
    clearTimeout(timer);
  }
}

export async function getLastCheckedAt(): Promise<number | null> {
  const db = await getDb();
  const raw = await getMeta(db, LAST_CHECKED_KEY);
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}
