# reference-points

For people who have the plugin installed. The rules the agent follows are in [`SKILL.md`](SKILL.md); the design notes below are about Claude Code.

## What it does

Short codes for the things a coding agent and its user need to refer back to: questions, decisions, options, findings, risks, steps and actions. The agent numbers them (`Q01`, `D01`, `F01`, ...), renders choices as options under a question with a recommendation marked ➡️, and ends each hand-back with a status update listing what is open, shut and outstanding. The numbering survives context compaction.

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
