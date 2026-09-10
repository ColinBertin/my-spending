---
name: review
description: Review a diff, PR, or branch of changes to My Spending by delegating to the reviewer subagent. Use when the user says "/review" or asks for a code review of already-written changes — not for implementing features or debugging failures.
---

Delegate the requested review to the `reviewer` subagent (`.claude/agents/reviewer.md`) using the Agent tool with `subagent_type: "reviewer"`.

Target: $ARGUMENTS — if no explicit target is given, default to the current uncommitted changes plus any commits on this branch not yet on `main` (i.e. the working tree diff and `git diff main...HEAD`).

Before launching, write a self-contained prompt for the subagent — it starts with no memory of this conversation. Include:

- The exact scope to review, resolved from the target above (uncommitted diff, branch vs `main`, a specific PR number, or specific files).
- Any context already established in this conversation that's relevant to judging the change (what it's supposed to do, prior findings, constraints already discussed).

Run the agent in the foreground, since you'll relay its result immediately. When it finishes, relay its findings to the user verbatim in the `[must]`/`[ask]`/`[fyi]`/`[imo]` format it produced — don't summarize away the prefixes, merge comments together, or silently drop any of them. If it reports no findings, say so plainly rather than inventing something to report.
