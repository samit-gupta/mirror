/**
 * Mirror Constitutional Test Runner
 *
 * Executes every chapter test sequentially and reports consolidated results.
 * Returns exit code 1 if any chapter has failures or errors.
 *
 * Usage:
 *   node scripts/runConstitutionTests.mjs              -- all chapters, keyword checks
 *   node scripts/runConstitutionTests.mjs --judge      -- all chapters, AI batch judge
 *   node scripts/runConstitutionTests.mjs --chapter 18 -- single chapter
 *   node scripts/runConstitutionTests.mjs --chapter 18 --judge
 *
 * Adding a new chapter:
 *   1. Create tests/chapterN.test.mjs following the existing pattern.
 *   2. Add an entry to the CHAPTERS array below.
 *   3. No other changes needed.
 */

import { run as runCh17 } from '../tests/chapter17.test.mjs'
import { run as runCh18 } from '../tests/chapter18.test.mjs'
import { run as runCh19 } from '../tests/chapter19.test.mjs'

// Registry — add new chapters here only
const CHAPTERS = [
  { n: 17, label: 'Safety & Ethical Boundaries',  run: runCh17 },
  { n: 18, label: 'Difficult Conversations',       run: runCh18 },
  { n: 19, label: 'Mirror Response Engine',        run: runCh19 },
]

// --- CLI argument parsing ---
const args = process.argv.slice(2)
const useJudge = args.includes('--judge')
const chapterFlag = (() => {
  const idx = args.indexOf('--chapter')
  if (idx >= 0 && args[idx + 1]) return parseInt(args[idx + 1], 10)
  const eq = args.find((a) => a.startsWith('--chapter='))
  return eq ? parseInt(eq.split('=')[1], 10) : null
})()

const toRun = chapterFlag
  ? CHAPTERS.filter((c) => c.n === chapterFlag)
  : CHAPTERS

if (chapterFlag && toRun.length === 0) {
  console.error(`No chapter ${chapterFlag} registered. Add it to the CHAPTERS array in runConstitutionTests.mjs.`)
  process.exit(1)
}

// --- Run ---
const timestamp = new Date().toISOString()
console.log('\n' + '#'.repeat(60))
console.log('Mirror Constitution Test Suite')
console.log(`${timestamp}`)
console.log(`Chapters: ${toRun.map((c) => c.n).join(', ')}   Judge: ${useJudge ? 'yes (AI batch)' : 'no (keyword)'}`)
console.log('#'.repeat(60))

const allResults = []
for (const chapter of toRun) {
  const result = await chapter.run({ useJudge })
  allResults.push(result)
}

// --- Consolidated summary ---
const totalPassed = allResults.reduce((s, r) => s + r.passed, 0)
const totalFailed = allResults.reduce((s, r) => s + r.failed, 0)
const totalErrors = allResults.reduce((s, r) => s + r.errors, 0)
const totalTests  = allResults.reduce((s, r) => s + r.total,  0)

console.log('\n' + '#'.repeat(60))
console.log('CONSOLIDATED SUMMARY')
console.log('#'.repeat(60))

for (const r of allResults) {
  const status = r.failed + r.errors === 0 ? 'PASS' : 'FAIL'
  console.log(`  Chapter ${r.chapter}: [${status}]  ${r.passed}/${r.total} passed`)
}

console.log(`\nTotal: ${totalPassed} passed / ${totalFailed} failed / ${totalErrors} errors — out of ${totalTests} tests.`)

const overallPass = totalFailed === 0 && totalErrors === 0
console.log(overallPass ? '\nOVERALL: PASS' : '\nOVERALL: FAIL')

process.exit(overallPass ? 0 : 1)
