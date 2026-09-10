---
name: implement
description: Implement a scoped feature/change by delegating to the implementer subagent. Use when the user says "/implement" or asks to implement a specific, already-scoped requirement (a plan, an issue, a described change) rather than exploring, debugging, or reviewing code.
---

Delegate the requested implementation task to the `implementer` subagent (`.claude/agents/implementer.md`) using the Agent tool with `subagent_type: "implementer"`.

Before launching, write a self-contained prompt for the subagent — it starts with no memory of this conversation. Include:

- The exact requirement/scope, taken from the user's request and anything already established earlier in this conversation (a plan, an issue description, specific file paths or line numbers already identified) — don't make the subagent re-derive what's already known.
- Any constraints or decisions already discussed that go beyond what's already codified in the agent's own persona/boundaries.

Run the agent in the foreground, since you'll act on its result immediately. When it finishes, verify the actual diff yourself rather than relaying the subagent's summary uncritically, then report to the user what changed and whether type-check/lint/tests passed.
