import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { CODES } from '../hooks/restore-reference-point-counters.mjs'

const SCRIPT = fileURLToPath(new URL('../hooks/session-start.mjs', import.meta.url))
const FIXTURE = fileURLToPath(new URL('./fixtures/transcript.jsonl', import.meta.url))
const SKILL_MD = new URL('../skills/reference-points/SKILL.md', import.meta.url)

// Claude Code's documented cap on a hook's additionalContext.
const CAP = 10_000

function run(payload) {
  const result = spawnSync(process.execPath, [SCRIPT], { input: JSON.stringify(payload), encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  const output = JSON.parse(result.stdout)
  assert.equal(output.hookSpecificOutput.hookEventName, 'SessionStart')
  return output.hookSpecificOutput.additionalContext
}

test('startup injects the rules without frontmatter and without counts', () => {
  const context = run({ source: 'startup' })
  assert.match(context, /^The reference-points plugin injected these rules \(SessionStart: startup\)\./)
  assert.match(context, /# Reference Points/)
  assert.doesNotMatch(context, /^name: reference-points/m)
  assert.doesNotMatch(context, /Highest reference-point codes issued/)
})

test('compact appends the highest issued codes from the transcript', () => {
  const context = run({ source: 'compact', transcript_path: FIXTURE })
  assert.match(context, /: Q14 S02 D02 O07 F10 R01\./)
})

test('compact with an unreadable transcript says the counts are unavailable', () => {
  const context = run({ source: 'compact', transcript_path: `${FIXTURE}.missing` })
  assert.match(context, /Highest issued codes are unavailable after this compaction/)
})

test('the injected text stays under the additionalContext cap with every kind counted', async () => {
  const lines = CODES.map(c => JSON.stringify({ type: 'assistant', message: { content: `${c.emoji} ${c.letter}999` } }))
  const dir = await mkdtemp(join(tmpdir(), 'reference-points-'))
  const transcript = join(dir, 'transcript.jsonl')
  await writeFile(transcript, lines.join('\n'))
  const context = run({ source: 'compact', transcript_path: transcript })
  assert.ok(context.length < CAP, `${context.length} characters is over the ${CAP} cap`)
})

test('every code kind in the hook is a row of SKILL.md’s code table, with the same emoji', async () => {
  const skill = await readFile(SKILL_MD, 'utf8')
  for (const { letter, emoji, name } of CODES) {
    const row = new RegExp(`^\\| \`${letter}01\` \\| ${emoji}\\S*\\s*\\| ${name} `, 'mu')
    assert.match(skill, row, `${letter} (${name}) missing from the code table`)
  }
})

test('the description opens with the subagent guard', async () => {
  const skill = await readFile(SKILL_MD, 'utf8')
  assert.match(skill, /^description: "Main agent only: subagents must not load this\./m)
})
