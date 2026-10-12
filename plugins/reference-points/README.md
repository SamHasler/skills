# reference-points

Short codes for questions, decisions, options, findings, risks, steps and actions, an end-of-turn status update, and numbering that survives context compaction. What it does, how it works, design notes and credits: [`skills/reference-points/README.md`](skills/reference-points/README.md).

## Install

### Claude Code

```
/plugin marketplace add SamHasler/skills
/plugin install reference-points@samhasler
```

or from a shell:

```bash
claude plugin marketplace add SamHasler/skills
claude plugin install reference-points@samhasler
```

**Requires Node.js 18 or later on `PATH`.** The plugin's hook is a Node script. Claude Code's native installer does not install Node, so check `node --version` first. Without Node the hook fails with a visible error and the rules are not injected.

### Other agents (Codex, Copilot, Gemini, skills.sh)

Install the `reference-points` skill by your agent's usual route, then add this line to your `AGENTS.md`:

```
At the start of every session, and again after any context compaction, load the reference-points skill and follow it.
```

These agents get the rules but not the compaction counters: nothing restores the highest issued codes, so numbering may restart after compaction.

## Development

```bash
node --test "plugins/reference-points/test/*.test.mjs"
claude plugin validate plugins/reference-points --strict
```

Bump `version` in `.claude-plugin/plugin.json` and add a `CHANGELOG.md` entry for every release: installed copies update only when the version changes.
