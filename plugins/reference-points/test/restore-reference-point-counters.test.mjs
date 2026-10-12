import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { formatCounts, highestIssuedCodes } from '../hooks/restore-reference-point-counters.mjs'

const fixture = await readFile(new URL('./fixtures/transcript.jsonl', import.meta.url), 'utf8')

test('takes the highest code per kind from assistant text lines carrying that kind’s emoji', () => {
  assert.deepEqual(highestIssuedCodes(fixture), { Q: 14, S: 2, D: 2, O: 7, F: 10, R: 1 })
})

test('ignores user and attachment content, tool calls and emoji-less prose', () => {
  const counts = highestIssuedCodes(fixture)
  assert.notEqual(counts.Q, 99, 'user content counted')
  assert.notEqual(counts.Q, 77, 'tool call counted')
  assert.notEqual(counts.F, 88, 'attachment counted')
})

test('counts option codes, which never restart', () => {
  const lines = [
    JSON.stringify({ type: 'assistant', message: { content: '\u{1F52E} O40 — an option\n\u{1F52E} O41 ➡️ the recommended one' } }),
    JSON.stringify({ type: 'assistant', message: { content: '\u{1F52E} O03 — an option quoted from earlier' } }),
  ].join('\n')
  assert.equal(highestIssuedCodes(lines).O, 41)
})

test('reads codes from tally lines, not only from headings', () => {
  const line = JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: '- ❓ 3 Open: Q05, Q09, Q21' }] } })
  assert.equal(highestIssuedCodes(line).Q, 21)
})

test('accepts CRLF transcripts and string content', () => {
  const lines = [
    JSON.stringify({ type: 'assistant', message: { content: '\u{1F3C3} A04 — an action' } }),
    JSON.stringify({ type: 'assistant', message: { content: '\u{1F3C3} A02 — another' } }),
  ].join('\r\n')
  assert.deepEqual(highestIssuedCodes(lines), { A: 4 })
})

test('returns no counts for an empty transcript', () => {
  assert.deepEqual(highestIssuedCodes(''), {})
  assert.equal(formatCounts({}), '')
})

test('formats counts with a leading zero, in code-table order', () => {
  const text = formatCounts({ R: 3, O: 41, Q: 14, S: 6 })
  assert.match(text, /: Q14 S06 O41 R03\./)
  assert.match(text, /never reissue/)
})
