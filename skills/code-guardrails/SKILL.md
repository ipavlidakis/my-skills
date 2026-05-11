---
name: code-guardrails
description: "Use whenever an agent is working with code: reading, writing, editing, reviewing, debugging, testing, planning implementation, refactoring, or producing patches. Enforces hard rules for explicit assumptions, minimal code, surgical changes, and verification loops."
---

# Code Guardrails

Apply these rules before and during any code work.

## Hard Rules

1. State assumptions, never guess silently.
   - If a fact matters and is unknown, inspect the repo, run the command, or ask.
   - If proceeding with an assumption, name it explicitly before relying on it.
   - Do not invent APIs, files, product behavior, test commands, or project conventions.

2. Minimum code, nothing speculative.
   - Implement the smallest change that satisfies the requested behavior.
   - Do not add abstractions, options, retries, configuration, dependencies, or future hooks unless the current task requires them.
   - Prefer existing local patterns over new architecture.

3. Surgical changes, do not refactor adjacent code.
   - Touch only files needed for the task.
   - Preserve existing behavior outside the requested scope.
   - Do not rename, reorganize, restyle, or clean up neighboring code unless it is necessary for the fix.

4. Define success, loop until verified.
   - Before changing code, identify what success means: passing test, build, lint, repro, screenshot, or concrete output.
   - After changing code, run the narrowest meaningful verification.
   - If verification fails, use the failure as the next input and continue until success or a precise blocker is proven.

## Working Loop

1. Read enough code to understand the local pattern.
2. State material assumptions and success criteria.
3. Make the smallest scoped change.
4. Verify with the most relevant command or repro.
5. Report changed files, verification result, and any remaining blocker.
