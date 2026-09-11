---
name: fix
description: Diagnose and fix a specific bug or failure by delegating to the debugger subagent. Use when the user says "/fix" or reports a bug, stack trace, failing test, or incorrect behavior to fix — not for open-ended feature implementation or code review.
---

Delegate the requested bug fix to the `debugger` subagent (`.claude/agents/debugger.md`) using the Agent tool with `subagent_type: "debugger"`.

Task: $ARGUMENTS

Before launching, write a self-contained prompt for the subagent — it starts with no memory of this conversation. Include:

- The exact symptom being reported, taken from the task above and anything already established earlier in this conversation (an error message, a stack trace, a failing test name, steps to reproduce, relevant file paths — don't make the subagent re-derive what's already known).
- Any constraints or decisions already discussed that go beyond what's already codified in the agent's own persona/boundaries.

Run the agent in the foreground, since you'll act on its result immediately. When it finishes, verify the actual diff and re-run the fix's test yourself rather than relaying the subagent's summary uncritically, then report to the user what the root cause was, what changed, and whether type-check/lint/tests passed. If the subagent reports it couldn't find or apply a fix and needs input, relay its question to the user rather than guessing on its behalf.
