#!/usr/bin/env node
/**
 * Checks the authored content without writing anything.
 *
 *   npm run content:validate
 *
 * Checks: required fields, kebab-case unique ids, `shortDef` word limit and
 * single-sentence shape, `longDef` length, known categories and difficulties,
 * aliases that are unique across the corpus and never repeat their own term,
 * https sources, self-links, and `relatedIds` that point at nothing.
 *
 * Exits non-zero on any error, so it can gate a build.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkTerms, loadTerms, readMeta } from './lib/terms.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const meta = readMeta(root);
const terms = loadTerms(root);
const { errors, warnings } = checkTerms(terms);

for (const warning of warnings) {
  console.warn(`  warn  ${warning}`);
}
for (const error of errors) {
  console.error(`  error ${error}`);
}

// The bundled file is what actually ships, so check it has not drifted behind
// the authored source.
const builtPath = join(root, 'assets', 'terms.json');
if (!existsSync(builtPath)) {
  console.warn('\n  warn  assets/terms.json has not been built yet — run `npm run content:build`.');
} else {
  const built = JSON.parse(readFileSync(builtPath, 'utf8'));
  if (built.terms.length !== terms.length) {
    console.warn(
      `\n  warn  assets/terms.json holds ${built.terms.length} terms but content/ holds ${terms.length} — rebuild.`,
    );
  }
  if (built.version !== meta.version) {
    console.warn(
      `\n  warn  assets/terms.json is version ${built.version} but content/_meta.json says ${meta.version} — rebuild.`,
    );
  }
}

const summary = `${terms.length} terms, ${errors.length} error(s), ${warnings.length} warning(s)`;

if (errors.length > 0) {
  console.error(`\n✗ ${summary}`);
  process.exit(1);
}

console.log(`\n✓ ${summary}`);
