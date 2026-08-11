# UX Dictionary

A fast, offline-first dictionary of UX/UI terminology, built with Expo and React Native.

The promise the whole app is built around: **find any UX term and understand it in
under ten seconds.** Search is focused on launch, every term is two taps from
cold start, and nothing waits on the network.

334 terms across twelve categories, all written from scratch.

---

## Running it

```bash
npm install
npx expo start
```

Then scan the QR code with **Expo Go** (SDK 57), or press `i` / `a` for a
simulator. No API keys, no accounts, no network required after install.

| Command | What it does |
| --- | --- |
| `npm start` | Expo dev server |
| `npm test` | Jest — scheduler, search ranking, session queue, payload validation, corpus integrity |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run content:build` | Compiles `content/*.json` → `assets/terms.json` |
| `npm run content:validate` | Checks the authored content without writing |

**Note on the daily reminder:** local notifications need a development build.
In Expo Go the toggle fails gracefully with an explanation rather than
silently doing nothing.

---

## How it fits together

```
App.tsx                 Fonts, DB open, seed, then hand off to navigation
src/
  config.ts             Build-time config (EXPO_PUBLIC_* env)
  types/term.ts         The content model — everything normalises to `Term`
  theme/
    tokens.ts           Every colour, size, space, radius and duration
    categories.ts       Category tints, derived from the accent hue
    useTheme.ts         Resolved scheme, reduce-motion, large-text hooks
  data/
    db.ts               SQLite schema, seeding, queries
    search.ts           Three-pass search (lexical → FTS5 → fuzzy)
    leitner.ts          Spaced repetition + streaks (pure)
    session.ts          Revision queue building (pure)
    validate.ts         Runtime validation for remote payloads
    updates.ts          Versioned content updates, off the critical path
    bookmarks.ts revision.ts history.ts reminders.ts
  store/
    library.ts          Corpus, bookmarks, revision state, streak
    settings.ts         Theme preference, reminder
  components/           TermRow, Chip, CategoryFilter, DefinitionBlock,
                        FlashCard, EmptyState, SearchBar, Screen, Toast, AppText
  screens/              Search, Term, Connections, Browse, Saved,
                        Revise, ReviseSession, Settings
  navigation/           Tabs + stack, tab marks drawn from views
content/                Authored source — one file per category
assets/terms.json       Generated. Do not hand-edit.
scripts/                Content build + validation
```

### Offline-first, concretely

`assets/terms.json` is bundled into the app. On first run it is validated and
written into SQLite; after that every read goes to the database and a light
in-memory index. The app is fully usable in airplane mode from a cold start —
search, browse, save, revise, all of it. The update check is the only thing
that touches the network, and it runs after first paint.

### Search

Three passes, cheapest first, merged by score:

1. **Lexical** — a scan of the in-memory index. Exact headword → headword
   prefix → alias → word boundary inside the headword → one-line definition.
   Sub-millisecond at this corpus size.
2. **Full text** — SQLite FTS5 across long definitions, so *"the law about
   thumbs"* finds something even with no headword match. FTS5 availability is
   probed at migration; if it is missing the app degrades rather than failing.
3. **Fuzzy** — Fuse.js, only when the first two came up thin. This is what
   makes `affordence` and `hueristic` resolve. Its hits always sort below the
   exact passes.

### Spaced repetition

Leitner, four boxes at 1 / 3 / 7 / 21 days. "Got it" promotes one box, "Review
again" resets to box one *and* re-queues the card later in the same sitting.
Box four counts as learned. Streaks follow the user's local midnight and
survive a same-day second session. All of it is pure functions in
`data/leitner.ts`, tested directly.

---

## Adding a term

1. Open the right file in `content/` (one per category).
2. Add an entry:

```json
{
  "id": "affordance",
  "term": "Affordance",
  "aliases": ["perceived affordance"],
  "categories": ["UX Laws & Principles", "Interaction & UI Patterns"],
  "shortDef": "What an object makes possible for the person using it.",
  "longDef": "2–4 sentences of plain language. No circular definitions.",
  "example": "A raised, rounded rectangle with a label reads as pressable.",
  "misuse": "Optional. Only where a real confusion is worth naming.",
  "relatedIds": ["signifier", "mental-model"],
  "difficulty": "core",
  "sources": [{ "label": "IxDF", "url": "https://..." }]
}
```

3. Add at least one `relatedIds` link **from** an existing term, so the new one
   is reachable through the network and not only through search.
4. Bump `version` in `content/_meta.json`.
5. Run `npm run content:build`, then `npm test`.

### The rules, and what enforces them

| Rule | Enforced by |
| --- | --- |
| `id` is kebab-case and unique | validator |
| `shortDef` is one sentence, under 15 words | validator (error / warning) |
| `longDef` is 2–4 sentences | validator (warning) |
| Every term has a concrete example | validator + test |
| `relatedIds` all resolve, and none self-link | validator + test |
| Aliases are unique across the corpus, never repeating their own term | validator + test |
| Categories and difficulties are from the known lists | validator + test |
| Sources use https | validator + test |
| No term is an orphan — something links to it | validator (warning) + test |
| No exclamation marks | validator |

`content:build` runs the same checks and refuses to write on error. Pass
`--allow-dangling` to drop unresolved links while a category is half-written —
useful locally, never in CI.

### Writing style

- **Every definition is written from scratch.** Sources are pointers for
  further reading, not text that was copied. Use them to decide *which* terms
  belong, then write the entry fresh.
- `shortDef` must survive being read at a glance in a list row.
- The example should be concrete, and from a recognisable product where one
  fits.
- `misuse` earns its place when two terms are genuinely confused in practice —
  affordance and signifier, findability and discoverability, wireframe and
  mockup. Skip it otherwise.
- Sentence case. No exclamation marks.

---

## Content updates

Set a manifest URL and the app will check for newer content once per launch,
after first paint, on an eight-second timeout:

```bash
cp .env.example .env
# EXPO_PUBLIC_CONTENT_MANIFEST_URL=https://example.com/ux-dictionary/manifest.json
```

```jsonc
// manifest.json
{ "version": 3, "generatedAt": "2026-04-01", "url": "https://.../terms-3.json" }
```

The payload is `assets/terms.json` in the same shape. It is applied only when
its version is higher than the stored one, only over https, only after passing
`data/validate.ts`, and only if it holds at least 20 usable terms — a truncated
or corrupt payload can never empty the dictionary. Bookmarks and revision
progress live in separate tables keyed by term id, so an update never touches
them. Leave the variable unset and the app simply never checks.

---

## Design

Tokens live in `src/theme/tokens.ts` and every component reads from them. There
is nowhere else a colour, size, radius or duration is defined.

- **Typography is the product.** Fraunces (serif) for headwords, Inter for
  everything else. Five sizes — 13 / 15 / 17 / 22 / 34 — with deliberate line
  heights, and definitions capped near 65 characters per line.
- **One accent.** A single violet for interactive elements. The twelve category
  tints are that accent's hue rotated across a 112° sweep, so they read as one
  family rather than twelve unrelated colours.
- **Motion is rationed.** Two orchestrated moments: search results settling in,
  and the flashcard flip. Related-term chips rise in as the definition settles —
  the signature gesture, since moving sideways through connected terms is what
  the app is for. Nothing else animates, and all of it is skipped under
  reduce-motion.
- **Density.** List rows show the term and one line of definition, so scanning
  beats tapping.

## Accessibility

Non-negotiable for a design tool, so it is built in rather than audited on:

- Labels, roles and hints on every interactive element; headings marked as such.
- 44pt minimum targets, extended with `hitSlop` where the visible mark is smaller.
- Dynamic Type honoured everywhere, with truncation dropped and rows relaxed
  past 135% scale.
- `prefers-reduced-motion` respected by every animation.
- Swipe-to-remove mirrored as a screen-reader rotor action — no gesture is the
  only route to an action.
- Result counts announced through a live region without stealing focus from the
  search field; toasts announced rather than only shown.
- No colour-only meaning: category chips carry their name, selection carries
  weight and border as well as fill, progress bars are paired with their numbers.
- Dark and light themes, following the system by default.

## Privacy

Everything stays on the device. There is no account, no analytics service and no
upload. Searches that return nothing are logged locally — that is the backlog of
terms worth writing next — and are visible and clearable in Settings.

---

## Known gaps

- Share is text only. The share-as-image card in the brief was scoped out.
- The daily reminder needs a development build; Expo Go cannot schedule it.
- The connections view is a grouped list, not a rendered graph.
