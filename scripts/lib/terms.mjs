/**
 * Shared loading and rule-checking for the authored content.
 *
 * `build-terms.mjs` and `validate-terms.mjs` both run against this so the
 * build can never produce a file the validator would have rejected.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

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
];

export const DIFFICULTIES = ['core', 'intermediate', 'advanced'];

/** `shortDef` has to fit one list row at large text sizes. */
export const SHORT_DEF_MAX_WORDS = 15;

export const REQUIRED_STRING_FIELDS = ['id', 'term', 'shortDef', 'longDef', 'example'];

export function contentDir(root) {
  return join(root, 'content');
}

export function readMeta(root) {
  const raw = readFileSync(join(contentDir(root), '_meta.json'), 'utf8');
  const meta = JSON.parse(raw);
  if (!Number.isInteger(meta.version) || meta.version < 1) {
    throw new Error('content/_meta.json needs an integer `version` of at least 1.');
  }
  return meta;
}

/** Every authored file, in a stable order, each entry tagged with its source. */
export function loadTerms(root) {
  const dir = contentDir(root);
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_'))
    .sort();

  const terms = [];
  for (const file of files) {
    const raw = readFileSync(join(dir, file), 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error(`content/${file} is not valid JSON: ${error.message}`);
    }
    if (!Array.isArray(parsed)) {
      throw new Error(`content/${file} must contain an array of terms.`);
    }
    for (const term of parsed) {
      terms.push({ ...term, __file: file });
    }
  }
  return terms;
}

export function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function sortKey(term) {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

/**
 * Applies every authoring rule and returns problems rather than throwing, so
 * one run reports everything wrong instead of only the first thing.
 */
export function checkTerms(terms) {
  const errors = [];
  const warnings = [];

  const ids = new Set();
  const aliasOwners = new Map();

  for (const term of terms) {
    const where = `${term.__file}: ${term.id ?? term.term ?? '(unnamed entry)'}`;

    for (const field of REQUIRED_STRING_FIELDS) {
      if (typeof term[field] !== 'string' || term[field].trim() === '') {
        errors.push(`${where} — \`${field}\` is missing or empty.`);
      }
    }

    if (typeof term.id === 'string') {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(term.id)) {
        errors.push(`${where} — \`id\` must be kebab-case (a–z, 0–9 and hyphens).`);
      }
      if (ids.has(term.id)) {
        errors.push(`${where} — duplicate \`id\`.`);
      }
      ids.add(term.id);
    }

    if (typeof term.shortDef === 'string') {
      const words = wordCount(term.shortDef);
      if (words > SHORT_DEF_MAX_WORDS) {
        errors.push(
          `${where} — \`shortDef\` is ${words} words, over the ${SHORT_DEF_MAX_WORDS}-word limit.`,
        );
      }
      if ((term.shortDef.match(/[.!?](\s|$)/g) ?? []).length > 1) {
        warnings.push(`${where} — \`shortDef\` looks like more than one sentence.`);
      }
      if (/!$/.test(term.shortDef.trim())) {
        errors.push(`${where} — no exclamation marks in copy.`);
      }
    }

    if (typeof term.longDef === 'string') {
      const sentences = (term.longDef.match(/[.!?](\s|$)/g) ?? []).length;
      if (sentences < 2 || sentences > 5) {
        warnings.push(`${where} — \`longDef\` reads as ${sentences} sentences; aim for 2–4.`);
      }
    }

    if (!Array.isArray(term.categories) || term.categories.length === 0) {
      errors.push(`${where} — needs at least one category.`);
    } else {
      for (const category of term.categories) {
        if (!CATEGORIES.includes(category)) {
          errors.push(`${where} — unknown category "${category}".`);
        }
      }
    }

    if (!DIFFICULTIES.includes(term.difficulty)) {
      errors.push(`${where} — \`difficulty\` must be one of ${DIFFICULTIES.join(', ')}.`);
    }

    if (!Array.isArray(term.aliases)) {
      errors.push(`${where} — \`aliases\` must be an array (use [] for none).`);
    } else {
      for (const alias of term.aliases) {
        const key = String(alias).toLowerCase().trim();
        if (key === String(term.term ?? '').toLowerCase().trim()) {
          errors.push(`${where} — alias "${alias}" repeats the term itself.`);
        }
        const owner = aliasOwners.get(key);
        if (owner && owner !== term.id) {
          errors.push(`${where} — alias "${alias}" is already used by "${owner}".`);
        }
        aliasOwners.set(key, term.id);
      }
    }

    if (!Array.isArray(term.relatedIds)) {
      errors.push(`${where} — \`relatedIds\` must be an array (use [] for none).`);
    } else if (term.relatedIds.includes(term.id)) {
      errors.push(`${where} — \`relatedIds\` links to itself.`);
    }

    if (!Array.isArray(term.sources) || term.sources.length === 0) {
      warnings.push(`${where} — no \`sources\`; add at least one link for further reading.`);
    } else {
      for (const source of term.sources) {
        if (!source || typeof source.label !== 'string' || typeof source.url !== 'string') {
          errors.push(`${where} — every source needs a \`label\` and a \`url\`.`);
        } else if (!source.url.startsWith('https://')) {
          errors.push(`${where} — source "${source.label}" must use https.`);
        }
      }
    }
  }

  // Dead cross-links are the failure mode that shows up as a dead end in the
  // app, so they are errors rather than warnings.
  const dangling = [];
  for (const term of terms) {
    for (const relatedId of term.relatedIds ?? []) {
      if (!ids.has(relatedId)) {
        dangling.push({ from: term.id, to: relatedId, file: term.__file });
        errors.push(`${term.__file}: ${term.id} — \`relatedIds\` points at missing "${relatedId}".`);
      }
    }
  }

  // A term nothing links to is reachable only by search or A–Z. Not fatal, but
  // the cross-link network is the point of the product.
  const linkedTo = new Set(terms.flatMap((term) => term.relatedIds ?? []));
  for (const term of terms) {
    if (term.id && !linkedTo.has(term.id)) {
      warnings.push(`${term.__file}: ${term.id} — no other term links to it.`);
    }
  }

  return { errors, warnings, dangling, ids };
}

/** Strips authoring-only fields and orders keys for a stable diff. */
export function toShippedTerm(term) {
  const shipped = {
    id: term.id,
    term: term.term,
    aliases: term.aliases ?? [],
    categories: term.categories,
    shortDef: term.shortDef,
    longDef: term.longDef,
    example: term.example,
    relatedIds: term.relatedIds ?? [],
    difficulty: term.difficulty,
    sources: term.sources ?? [],
  };
  if (typeof term.misuse === 'string' && term.misuse.trim() !== '') {
    shipped.misuse = term.misuse;
  }
  return shipped;
}
