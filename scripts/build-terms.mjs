#!/usr/bin/env node
/**
 * Compiles `content/*.json` into the single `assets/terms.json` the app bundles.
 *
 *   npm run content:build
 *
 * Runs the same checks as the validator. Errors stop the build; pass
 * `--allow-dangling` to drop unresolved `relatedIds` and carry on, which is
 * useful while a category is half-written but should never be used in CI.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkTerms, loadTerms, readMeta, sortKey, toShippedTerm } from './lib/terms.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const allowDangling = process.argv.includes('--allow-dangling');

const meta = readMeta(root);
const terms = loadTerms(root);
const { errors, warnings, dangling, ids } = checkTerms(terms);

const fatal = allowDangling
  ? errors.filter((message) => !message.includes('points at missing'))
  : errors;

for (const warning of warnings) {
  console.warn(`  warn  ${warning}`);
}

if (fatal.length > 0) {
  for (const error of fatal) {
    console.error(`  error ${error}`);
  }
  console.error(`\n✗ ${fatal.length} error(s). Nothing written.`);
  process.exit(1);
}

if (allowDangling && dangling.length > 0) {
  console.warn(`\n  warn  dropping ${dangling.length} unresolved relatedIds:`);
  for (const link of dangling) {
    console.warn(`          ${link.from} → ${link.to}`);
  }
}

const shipped = terms
  .map(toShippedTerm)
  .map((term) => ({ ...term, relatedIds: term.relatedIds.filter((id) => ids.has(id)) }))
  .sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term)));

const collection = {
  version: meta.version,
  generatedAt: new Date().toISOString().slice(0, 10),
  terms: shipped,
};

const outPath = join(root, 'assets', 'terms.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(collection, null, 2)}\n`, 'utf8');

const byCategory = new Map();
for (const term of shipped) {
  for (const category of term.categories) {
    byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
  }
}

console.log(`\n✓ assets/terms.json — ${shipped.length} terms, content version ${meta.version}`);
for (const [category, count] of [...byCategory].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(count).padStart(4)}  ${category}`);
}
if (warnings.length > 0) {
  console.log(`\n  ${warnings.length} warning(s) above.`);
}
