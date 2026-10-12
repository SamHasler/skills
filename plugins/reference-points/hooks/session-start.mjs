// SessionStart hook (startup | clear | compact): inject the Reference Points rules from
// SKILL.md, the single source of the rules, and after a compaction the highest codes
// issued so far.
//
// additionalContext reaches the main agent only, which is what the rules need. Claude
// Code caps it at 10,000 characters and silently replaces anything longer with a file
// path and a 2,000-character preview; a test keeps the injected text under the cap.

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { formatCounts, highestIssuedCodes } from './restore-reference-point-counters.mjs'

const SKILL_MD = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'reference-points', 'SKILL.md')

function stripFrontmatter(markdown) {
  const text = markdown.replace(/\r\n/g, '\n')
  if (!text.startsWith('---\n')) return text.trim()
  const end = text.indexOf('\n---\n', 4)
  return end === -1 ? text.trim() : text.slice(end + 5).trim()
}

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

let payload = {}
try {
  payload = JSON.parse(await readStdin())
} catch {
  // No payload: still deliver the rules, without counters.
}

const source = payload.source ?? 'unknown'
const parts = [
  `The reference-points plugin injected these rules (SessionStart: ${source}).`,
  stripFrontmatter(await readFile(SKILL_MD, 'utf8')),
]

if (source === 'compact') {
  try {
    if (!payload.transcript_path) throw new Error('the hook payload named no transcript')
    const counts = formatCounts(highestIssuedCodes(await readFile(payload.transcript_path, 'utf8')))
    if (counts) parts.push(counts)
  } catch (error) {
    parts.push(
      `Highest issued codes are unavailable after this compaction (${error.message}). Say so before issuing a code rather than guessing the next number.`,
    )
  }
}

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: parts.join('\n\n') },
  }),
)
