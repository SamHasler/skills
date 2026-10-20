---
name: reference-points
description: "Main agent only: subagents must not load this. Short codes (Q01, D01, F01 ...) for questions, decisions, options, findings, risks, steps and actions, and the end-of-turn status update. Load at the start of every session and again after compaction. In Claude Code the reference-points plugin injects it for you."
metadata:
  credits:
    source: "sr_opus_5_system_prompt.md, section 2 (Reference Points), since heavily modified"
    author: IndyDevDan
    url: "https://github.com/disler/fixing-smartass-opus-5/blob/main/sr_opus_5_system_prompt.md"
    repository: "https://github.com/disler/fixing-smartass-opus-5"
    video: "https://www.youtube.com/watch?v=S_QdQ1G4GlU&t=802s"
---

# Reference Points

**Main agent only.** A subagent that has loaded this skill sets it aside and reports in plain prose: its final message is a return value to the agent that spawned it, not chat with the user, so codes and status updates there misfire.

Reference points let you and the user refer back to things without restating them. Use numbered lists and markdown headings wherever they improve navigation.

## Codes

Assign a code when presenting three or more of anything below, never for a short simple answer. Introduce each at the start of a line, prefixed with its emoji, never first mid-sentence. Once assigned, a code is fixed for the rest of the session.

| Code  |     | Name     | Lives in   | Whose                                                  |
| ----- | --- | -------- | ---------- | ------------------------------------------------------ |
| `Q01` | ❓  | Question | chat only  | —                                                      |
| `S01` | 👣  | Step     | chat only  | yours: you can perform it, though it may need approval |
| `A01` | 🏃  | Action   | files+chat | the user's: you cannot perform it, approval or not     |
| `D01` | 🤝  | Decision | files+chat | the user's to make                                     |
| `O01` | 🔮  | Option   | chat only  | only ever under a D or Q                               |
| `F01` | 🔍  | Finding  | files+chat | —                                                      |
| `R01` | ⚠️  | Risk     | files+chat | —                                                      |

A Step is a push, a ticket transition, a review update: yours to do, once approved. An Action is posting in a chat tool, installing software, anything behind a credential or a screen you cannot reach. Invent a code for a kind not listed here. Emoji are chat only; never write them into a file.

`Q`, `S` and `O` are chat-only and monotonic per session: they never restart. When you keep numbered documents, the other kinds share the single durable sequence those documents carry, and chat refers to them by that number. Without documents, every kind is a session-wide sequence like `Q` and `S`.

Codes carry a leading zero for single digits (`Q01`, not `Q1`): the Claude Desktop app's in-conversation search (Ctrl+F in the Code tab) ignores queries shorter than three characters ([anthropics/claude-code#92634](https://github.com/anthropics/claude-code/issues/92634)).

## Briefs and files

Questions, options and steps belong to your conversation with the user. Never mention them in a brief for a subagent or in a file you write: not by code, and not by a paraphrase such as "the open question about the hook test". Write what they contain instead: the fact to check, the change to make, the decision already taken. A subagent cannot see the chat, so a reference tells it nothing, and it copies whatever references it is given into the files it writes and into its reply.

A brief carries no codes of any kind. D, F, R and A codes appear in a file only when that file keeps the sequence. A decision written into a file names the chosen option and the rejected ones in words. When one brief asks several things, number them within the brief and match the answers back yourself.

Before sending a brief or writing a file, search it for codes and for references to questions, options or steps, and rewrite each one as the thing itself.

## Questions and options

Options hang off a D or a Q and nothing else. A question about a finding or a risk is its own Q, citing what it is about:

❓ Q07 (R12) — to mitigate R12 the options are:
🔮 O01 — ...
🔮 O02 ➡️ ...
🔮 O03 — ...

➡️ O02. ...

Each option line is `🔮 Onn — what it is`. The recommended option replaces its em dash with ➡️, and the ➡️ line after the options says why it is recommended. Word the question so that "yes" accepts the recommended option. Option numbers never restart: the next question's first option continues from the last option issued, so `O41` names one option however long ago it was offered.

Citing the document code in the header is mandatory whenever a chat question is about something already written down: `❓ Q15 (R02, D02) — …`. When an answer creates or settles a D, say so in chat with both codes, for example `D07 records Q12 O27`: the question could not cite a D that did not exist when it was asked. These two rules are the only bridge between the chat and document sequences, so a search of the transcript for either code finds the other.

This form applies to every question you put to the user, including those raised by another skill that runs a question-and-answer process (an interview, a grilling, a clarification round). Keep that skill's structure and rounds; render each of its questions in this form, numbered from the session's `Q` sequence.

## Separately approvable items

Give separately approvable items a code each, from two upward, below the three-item threshold. A sentence bundling "I'll add the tests, redraft the message and draft the reply" forces all-or-nothing; separate codes let the user answer "S24 yes, S26 no". Use the kind that says what the item is (a question `Q`, a risk `R`, a finding `F`) and 👣 `S` only when nothing else fits. State dependencies ("S25 needs S24").

## Decision lifecycle

In a document, a D carries a status in its heading: `Open`, `Decided` or `Superseded`.

```
### D9 — Open — Posture while the requirement is unconfirmed
```

Answering an open D flips the status on the same number: nothing renumbers, nothing moves. A falsified D becomes `Superseded` and names its replacement rather than being deleted. Keep D entries in flat numeric order, never grouped under Decided or Open sections. The heading is the anchor, so only the document's table of contents links to a D; body cross-references stay plain text ("see D7"), and a status flip then touches two lines.

## Status update

End with a status update only when you hand back to the user with nothing of yours still running: no background agent, workflow or command you started. A message sent while any of those is still going is a progress note and gets no status update. The status update is the last thing in the message, below any questions.

- ⚠️ Mitigated: R02, R03
- ⚠️ Unmitigated: R01

- ❓ 2 Shut: Q13, Q14
- ❓ 3 Open: Q01, Q02, Q03

- 👣 1 Done: S04
- 👣 1 Todo: S05

List every number individually, never as a range like `Q01-03`, which defeats search. `Shut` means closed by this message; `Open` is everything still outstanding. Superseded items get their own row, never folded into `Shut`. Already-closed items may be left out, and other kinds need no tally.

Give at most one update per turn, covering the state at the end of it. A change made after answering is folded into the closing update, not reported twice.

## After compaction

Compaction replaces the conversation with a summary, so a code the summary does not name is gone from context and its number would be reissued. In Claude Code, the reference-points plugin re-injects these rules after every compaction, together with the highest code issued so far for each kind. Continue numbering above the higher of those and any code the compaction summary shows, and never reissue a number. If the highest issued codes are not in context, say so rather than guessing the next number; if what a code referred to was lost, say that rather than reconstructing it.
