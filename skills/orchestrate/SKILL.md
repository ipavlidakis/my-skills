---
name: orchestrate
description: Use when the user invokes /orchestrate or asks to coordinate agent roles, delegate planning/implementation/review, shape single-ticket or staged work, babysit a PR lifecycle, or enforce proof-first handoffs across any provider, model, or agent runtime.
---

# Orchestrate

## Load Order

Always read the workflow first:

- `references/WORKFLOW.md`

Then resolve role instructions:

- Prefer matching roles built into the current model, provider, or agent runtime.
- If a matching role is not available, read the fallback file for that role:
  - `references/agents/coordinator.toml` for coordination
  - `references/agents/planner.toml` for planning
  - `references/agents/implementation-worker.toml` for implementation
  - `references/agents/reviewer.toml` for review
- Use `references/PERSONALITY.md` only when the runtime role or fallback file does not already define tone.

## Core Behavior

- Stay provider-, model-, and agent-runtime agnostic. Do not assume any specific provider, product, or model.
- `references/WORKFLOW.md` is mandatory and wins over role prompts when there is a conflict.
- Use native runtime roles when available. Map by job, not by exact name:
  - Coordinator: orchestrates, delegates, integrates, and answers the user.
  - Planner: plans only; no edits.
  - Implementation Worker: changes code and verifies assigned scope.
  - Reviewer: reviews only; no edits.
- If native roles are unavailable, build executable prompts from the fallback role files in `references/agents/`.
- In OpenAI-compatible runtimes, preserve fallback `model`, `model_reasoning_effort`, and `sandbox_mode`.
- In other runtimes, ignore fallback runtime metadata that the runtime does not support.
- Read target repo instructions before delegation: `AGENTS.md`, README, build/test scripts, manifests, CI config, and issue/PR context.
- Verify the default branch from the remote when branch correctness matters.
- Use `single_ticket` for one coherent change.
- Use `staged` for vague, broad, risky, cross-module, dependency-heavy, or fan-out work.
- Prefer grouped PRs or stacked branches when they reduce review noise and keep changes understandable.
- Do not default to one PR per item.
- After a Worker opens a PR, keep that Worker responsible for CI, review comments, approvals, mergeability, and merged status until terminal state or explicit handoff.
- No force push. No merge unless the user explicitly asks.
- Do not claim progress without repo, PR, CI, test, or command proof.

## Delegation Rules

When delegation is available and the user asked for orchestration, parallel work, or named role agents:

1. Use the Planner role for unclear, broad, or staged work.
2. Use the Implementation Worker role for implementation with exact scope, files/modules, branch base, PR target, verification, and definition of done.
3. Use the Reviewer role for read-only validation after the Worker reports proof.
4. Route `issues_found` back to the owning Worker.
5. Accept `no_issues` only with proof checked.

If delegation is unavailable, output executable prompts derived from the matching fallback role files instead of pretending agents ran.

## Output Shapes

Use the templates in `references/WORKFLOW.md`.

Keep status updates short:

```text
State: `<state>`. Proof: `<evidence>`. Fix: `<action>`. Owner: `<role>`.
```

For final answers, include only:

- What changed or what was delegated.
- Proof checked.
- Exact blocker and owner, if blocked.
