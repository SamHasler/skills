# reference-points

For people who have the plugin installed. The rules the agent follows are in [`SKILL.md`](SKILL.md); the design notes below are about Claude Code.

## What it does

Short codes for the things a coding agent and its user need to refer back to: questions, decisions, options, findings, risks, steps and actions. The agent numbers them (`Q01`, `D01`, `F01`, ...), renders choices as options under a question with a recommendation marked ➡️, and ends each hand-back with a status update listing what is open, shut and outstanding. The numbering survives context compaction.

## Example

A made-up reply from the middle of a session, each line describing itself. Before it, the session had already issued F01–F06, R01–R03, D01–D02, A01, S01–S04, Q01–Q11 and O01–O25, and the user had just answered `Q11 O24`.

The reply is deliberately noisy, because it uses every kind of code at once to show them all. Real replies are more sparing: a code appears only when there are three or more of something, or two or more items the user might approve separately, and a short answer carries none.

> Q11 is settled with O24, so S04 is done, and S04 is what mitigates R02.
>
> 🔍 F07 — this is a new finding: its number follows F06, the last one issued this session\
> ⚠️ R04 — this is a new risk: something that could go wrong\
> 🤝 D03 — this is a new decision only the user can make, and it is also written into a document\
> 🏃 A02 — this is a new action only the user can perform, such as installing something\
> 👣 S05 — this is a step the agent will perform once the user approves it\
> 👣 S06 — this is another step, and it needs S05
>
> ❓ Q12 (F07, R04) — this is a new question, citing the finding and risk it is about:\
> 🔮 O26 — this is an option: its number follows O25, the last option issued this session\
> 🔮 O27 ➡️ this is another option, and the arrow marks it as recommended\
> 🔮 O28 — this is a third option
>
> ➡️ O27. This line says why O27 is recommended.
>
> ❓ Q13 (D03) — this is a second new question, and its options carry on from O28:\
> 🔮 O29 ➡️ this is the recommended option\
> 🔮 O30 — this is the alternative
>
> ➡️ O29. This line says why O29 is recommended.
>
> - ⚠️ Mitigated: R02
> - ⚠️ Unmitigated: R01, R04
> - ❓ 1 Shut: Q11
> - ❓ 3 Open: Q09, Q12, Q13
> - 👣 1 Done: S04
> - 👣 2 Todo: S05, S06
> - 🏃 2 Todo: A01, A02

The list at the end of the reply is the status update:

- **Mitigated: R02** — closed by this message: S04 dealt with it.
- **Unmitigated: R01, R04** — every risk still open. R01 is from earlier in the session, R04 is new. R03 was mitigated in an earlier message, so it is left out.
- **Shut: Q11** — the question this message closed. Questions shut in earlier messages are not repeated.
- **Open: Q09, Q12, Q13** — every question still waiting for an answer, old and new. Q09 was asked several messages ago and is still open.
- **Done: S04** — the step completed in this message, once Q11 approved it.
- **Todo: S05, S06 and A01, A02** — work still outstanding: steps for the agent, actions for the user. A01 is from earlier in the session.

Every number is listed individually rather than as a range, so each one can be copied and searched for. The user can then answer in a few characters: `Q12 Agreed, Q13 O30, S05 yes`. "Agreed" accepts the recommended option (O27); naming an option (O30) picks a different one.

## How it works

A `SessionStart` hook runs on `startup`, `clear` and `compact`. It injects the body of `SKILL.md` into the main agent's context, so the rules are present from the first turn and come back after every compaction without the agent having to invoke anything. On `compact` it also reads the session transcript and appends the highest code issued so far for each kind, so the agent continues numbering instead of reissuing a number.

Hook output is delivered as `additionalContext`, which reaches the main agent and not its subagents. A subagent that loads the skill some other way is told by its first line to set it aside: a subagent's final message is a return value, and codes or status updates there misfire.

## If the rules don't appear

Ask the agent to quote the line in its context that starts "The reference-points plugin injected these rules". If it has none:

- Run `node --version`. The hook is a Node script; Claude Code's native installer does not install Node, and without it the hook fails.
- Look for a hook error at the start of the session.
- Check the plugin is enabled: `claude plugin list`.

## Design notes

**Why a hook and not a Claude Code mod.** A mod's `prompt.compose` and `prompt.context` events would put the rules in the system prompt or the first message without a shell or Node. Measured on Claude Code 2.1.293 on 2026-10-09: both fire in a headless `claude -p` session, and neither fires in the Claude Desktop app's Code tab, even in a session started with the mod already installed. A command hook is the channel that works in both.

**Why not an agent started with `claude --agent`.** An agent definition would carry the rules in its own system prompt, but it only applies when a session is started as that agent, which the Claude Desktop app cannot do ([anthropics/claude-code#50585](https://github.com/anthropics/claude-code/issues/50585), closed for inactivity rather than implemented), and nothing stops the same agent being spawned as a subagent.

**Why codes have a leading zero.** The Claude Desktop app's in-conversation search (Ctrl+F in the Code tab) does nothing for queries shorter than three characters ([anthropics/claude-code#92634](https://github.com/anthropics/claude-code/issues/92634)), so `Q1` cannot be searched for and `Q01` can. The zero goes once that is fixed.

## Credits

Reference Points started as section 2 of [`sr_opus_5_system_prompt.md`](https://github.com/disler/fixing-smartass-opus-5/blob/main/sr_opus_5_system_prompt.md) in IndyDevDan's [fixing-smartass-opus-5](https://github.com/disler/fixing-smartass-opus-5), presented in his video [FIXING Opus 5: PROOF that Prompt Engineering IS NOT DEAD](https://www.youtube.com/watch?v=S_QdQ1G4GlU&t=802s) (from 13:22). It has since been heavily modified. Used under the MIT License, Copyright (c) 2026 IndyDevDan.
