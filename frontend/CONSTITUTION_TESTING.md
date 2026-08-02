# Mirror Constitutional Testing

## What this is

A permanent regression suite that verifies Future Self's behaviour against the Mirror Constitution. Run it before merging any change that touches `gemini.js`, `memoryRanking.js`, `journalMemory.js`, or any memory pipeline file.

---

## When to run

| Situation | Which chapters |
|-----------|----------------|
| Change to the system prompt | All chapters |
| Change to memory ranking or retrieval | Chapter 19 |
| Change to journal extraction | Chapter 19 |
| Gemini model version change | All chapters |
| Any new constitutional chapter implemented | New chapter + all chapters |

---

## How to run

Install dev dependencies first (one-time):

```
npm install
```

### Run one chapter (free-tier safe: 6-10 API calls)

```
node scripts/runConstitutionTests.mjs --chapter 17
node scripts/runConstitutionTests.mjs --chapter 18
node scripts/runConstitutionTests.mjs --chapter 19
```

### Run full suite (requires ~26 API calls — use paid tier or spread across 2 days)

```
npm test
```

### Add AI batch judge (1 extra call per chapter)

```
node scripts/runConstitutionTests.mjs --chapter 18 --judge
```

### Exit codes

- `0` — all tests passed
- `1` — one or more tests failed or errored

---

## Rate limiting

The test harness enforces 15 seconds between API calls to stay within the free-tier limit (5 req/min). Do not remove this delay.

Free-tier quota: 20 calls/day. One chapter at a time fits within this limit.

---

## Adding a new chapter

1. Create `tests/chapterN.test.mjs` following the same pattern as `chapter17.test.mjs`.
   - Import from `./utils.mjs`
   - Export a `run({ useJudge })` function that returns `{ chapter, passed, failed, errors, total, results }`
   - Support standalone execution via `const isMain = process.argv[1] === fileURLToPath(import.meta.url)`
2. Add one entry to the `CHAPTERS` array in `scripts/runConstitutionTests.mjs`:
   ```js
   { n: 20, label: 'Your Chapter Title', run: runCh20 },
   ```
3. No other changes needed.

---

## Keeping utils.mjs in sync

`tests/utils.mjs` contains `buildProductionPrompt()`, a Node-compatible copy of `buildFutureSelfSystemPrompt()` in `src/lib/gemini.js`.

**Whenever `gemini.js` is modified, update `buildProductionPrompt()` in `utils.mjs` to match.**

If these drift, the test suite will evaluate the wrong prompt and give false results.

---

## Files

```
tests/
  utils.mjs              Shared utilities and production prompt builder
  chapter17.test.mjs     Chapter 17 — Safety & Ethical Boundaries (6 tests)
  chapter18.test.mjs     Chapter 18 — Difficult Conversations (10 tests)
  chapter19.test.mjs     Chapter 19 — Mirror Response Engine (10 tests)

scripts/
  runConstitutionTests.mjs   Sequential runner with consolidated summary
```
