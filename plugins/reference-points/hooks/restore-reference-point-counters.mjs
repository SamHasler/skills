// Highest issued reference-point codes, read from a Claude Code session transcript.
//
// Compaction replaces the conversation with a summary, so a code the summary does not
// name is gone from context and its number would be reissued. The transcript on disk
// is not truncated by compaction, so the codes issued before it are still there.
//
// Pure: transcript text in, counts out. session-start.mjs does the I/O.
//
// Scope: assistant text only, and within it, lines carrying the kind's own emoji.
// Assistant-only stops the rules text itself, which reaches the transcript as hook or
// user content, from setting a permanent floor. Whole-line rather than next-to-the-
// emoji, because codes are issued as often in a tally line ("- 👣 1 Todo: S02") as in a
// heading. An example quoted back inside an assistant turn still counts; taking the
// maximum can only skip a number, never reuse one, so that is the safe direction.

// The single definition of the code kinds. A test checks every row is in SKILL.md's
// code table. Every kind, options included, is one sequence that never restarts.
export const CODES = [
  { letter: 'Q', emoji: '❓', name: 'Question' },
  { letter: 'S', emoji: '\u{1F463}', name: 'Step' },
  { letter: 'A', emoji: '\u{1F3C3}', name: 'Action' },
  { letter: 'D', emoji: '\u{1F91D}', name: 'Decision' },
  { letter: 'O', emoji: '\u{1F52E}', name: 'Option' },
  { letter: 'F', emoji: '\u{1F50D}', name: 'Finding' },
  { letter: 'R', emoji: '⚠', name: 'Risk' },
]

function assistantTexts(transcriptText) {
  const texts = []
  for (const line of transcriptText.split(/\r?\n/)) {
    if (!line.trim()) continue
    let entry
    try {
      entry = JSON.parse(line)
    } catch {
      continue
    }
    if (entry?.type !== 'assistant') continue
    const content = entry.message?.content
    if (typeof content === 'string') texts.push(content)
    else if (Array.isArray(content))
      for (const block of content)
        if (block?.type === 'text' && typeof block.text === 'string') texts.push(block.text)
  }
  return texts
}

// Returns { Q: 14, S: 2, ... } for each counted kind seen; kinds never issued are absent.
export function highestIssuedCodes(transcriptText) {
  const counts = {}
  const patterns = CODES.map(c => ({
    ...c,
    pattern: new RegExp(`\\b${c.letter}(\\d{1,3})\\b`, 'g'),
  }))
  for (const text of assistantTexts(transcriptText))
    for (const line of text.split('\n'))
      for (const { letter, emoji, pattern } of patterns) {
        if (!line.includes(emoji)) continue
        for (const match of line.matchAll(pattern)) {
          const n = Number(match[1])
          if (!(counts[letter] >= n)) counts[letter] = n
        }
      }
  return counts
}

// The text appended to the injected rules after a compaction; empty when nothing was issued.
export function formatCounts(counts) {
  const marks = CODES.filter(c => counts[c.letter] !== undefined).map(
    c => `${c.letter}${String(counts[c.letter]).padStart(2, '0')}`,
  )
  if (marks.length === 0) return ''
  return [
    `Highest reference-point codes issued before this compaction, read from the session transcript: ${marks.join(' ')}.`,
    'Continue numbering above these and never reissue a number, options included.',
  ].join('\n')
}
