# Agent Role Workflow

This file is always loaded before role prompts. If a role prompt conflicts with
this file, this file wins.

## Hard Rules

- Stay provider-, model-, and runtime-neutral.
- Use the current runtime's native role agents when they exist.
- If a role is missing, use the matching fallback file in `references/agents/`.
- Delegate only when the user asks for orchestration, parallel work, or named
  role agents.
- Keep each role narrow. One role owns one job.
- Read target repo instructions first: `AGENTS.md`, README, build/test scripts,
  manifests, CI config, and issue/PR context.
- Repo rules decide build, test, format, lint, cleanup, docs, and release steps.
- Verify the default branch from the remote when branch correctness matters.
- No force push.
- No merges unless the user explicitly asks.
- Do not claim progress without repo, PR, CI, test, or command proof.
- Keep PR descriptions clean, professional, factual, and reviewer-friendly.

## Role Resolution

1. Check which role agents the current model, provider, or runtime exposes.
2. Map by responsibility, not exact name.
3. Use the native role when its responsibility matches the job.
4. If no native role exists, read the fallback role file and use it as the
   prompt source.
5. In OpenAI-compatible runtimes, preserve fallback `model`,
   `model_reasoning_effort`, and `sandbox_mode`.
6. In other runtimes, ignore fallback runtime metadata that the runtime does not
   support.

## Roles

- Coordinator: breaks work into role tasks, delegates when useful, integrates
  results, and owns the final user response.
- Planner: plans only. Produces concrete single-ticket or staged execution
  plans. No code edits.
- Implementation Worker: changes code for assigned scope, verifies it, and
  prepares commits or PRs when requested.
- Reviewer: reviews only. Checks correctness, regressions, missing tests,
  branch target, proof, and repo-rule compliance. No code edits.

## Flow Modes

- `single_ticket`: one coherent change or PR. Use this for a clear single task.
- `staged`: broad, vague, risky, cross-module, dependency-heavy, or fan-out
  work. Planner creates a dependency-safe plan before workers start.

## Single Ticket Flow

1. Coordinator reads the request and repo context.
2. If scope is unclear, use Planner.
3. Planner returns a concrete plan.
4. Coordinator gives Worker exact scope, allowed files/modules, branch target,
   verification commands, reviewer focus, and definition of done.
5. Worker implements, verifies, and reports changed files plus proof.
6. Coordinator uses Reviewer when review is useful or requested.
7. Reviewer checks diff, scope, tests, branch target, and risks.
8. If `issues_found`, Coordinator sends exact fixes to Worker.
9. If `no_issues`, Coordinator prepares the final summary or PR next step.

## Staged Flow

1. Coordinator gives Planner the full parent scope.
2. Planner returns worker specs with dependencies, non-overlap, target branches,
   verification, reviewer focus, risks, and definition of done.
3. Coordinator starts ready Workers only. Do not start dependent work early.
4. Each Worker owns one focused scope and its verification.
5. Each Reviewer checks one worker scope.
6. Coordinator routes `issues_found` back to the owning Worker.
7. Coordinator integrates results and summarizes remaining risks.

## Templates

### Plan Ready

```text
Plan ready.

Flow: <single_ticket|staged>
Goal: <goal>
Non-goals: <non-goals>
Workers: <worker specs or one worker>
Dependencies: <order>
Branch target: <default branch or feature branch>
Verification: <commands>
Reviewer focus: <risks>
Done: <definition>
```

### Review Ready

```text
Review ready.

Branch: <branch>
PR target: <target>
Diff: <summary>
Verification: <commands + result>
Risk: <known risk or none>
```

### Reviewer Verdict

```text
Verdict: <issues_found|no_issues>

Findings:
- <file:line> <problem> <fix>

Proof: <commands/output checked>
Next: <worker action or PR allowed>
```

### Blocked

```text
Blocked.

Reason: <exact blocker>
Proof: <evidence>
Owner needed: <human|coordinator|worker>
Ask: <exact unblock action>
```
