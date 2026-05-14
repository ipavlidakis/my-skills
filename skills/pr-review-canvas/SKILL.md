---
name: pr-review-canvas
description: >-
  Render a PR diff review as an HTML canvas that groups changes by
  reviewer importance, separates boilerplate from core logic, and
  highlights tricky or unexpected code. Use when reviewing a pull
  request, summarizing a diff for review, or when the user asks for a
  PR review canvas, diff walkthrough, or change-set overview.
---

# PR Review Canvas

Build a standalone HTML canvas that presents a PR diff reorganized for reviewer comprehension - not in file-tree order.

## Prerequisites

Read `references/agent-canvas.md` first. It contains the HTML canvas policy, design guidance, flow-diagram guidance, slop rules, self-check, preview server requirements, and link-return requirements you must follow. The delivered review canvas must be a `.html` file served through a local HTTP preview path. Return a Markdown link that targets the in-app browser when the runtime exposes one; otherwise fall back to the plain local web address. Do not open Chrome, the in-app browser, screenshots, or browser automation just to test the generated file.

Start from `assets/pr-review-canvas-template.html`. Copy it to the output canvas path, replace the placeholders, and extend the included HTML components only where the specific PR needs it. Keep the required sections and style system intact unless the diff clearly needs a different representation.

The template uses plain HTML/CSS components (`section`, `.grid`, `.card`,
`.review-panel`, `.diff-view`, `table`, `.callout`, etc.). Preserve that
structure when generating canvases. Do not generate TSX by default.

The rendered preview should match the reference canvas theme: editorial serif
typography, light neutral page background, flat white panels, thin neutral
borders, restrained blue accents, and dark monospace diff panes.
Use `scripts/serve-html.js <review.html> --port <port> --route /<name>.html`
instead of rewriting a one-off server.

The template is intentionally overflow-safe. Preserve the `minmax(0, ...)`,
`min-width: 0`, panel overflow, diff scrolling, table scrolling, and responsive
media-query rules unless you replace them with equivalent containment. Long code
lines, branch names, file paths, and prose must never resize a grid column or
cover the side rail.

## Gather the diff

Expect a GitHub PR link (a full URL like `https://github.com/<owner>/<repo>/pull/<n>`, or an equivalent `gh`-resolvable reference). Use `gh pr diff <pr>` to collect every file's path, additions, deletions, and hunks.

**If the user didn't provide a PR link, stop and ask.** Do not guess at the current branch, infer from recent history, or fall back to a local `git diff`. Ask the user which diff they want to review - a specific PR URL or number - and wait for their reply before continuing.

## Group changes for comprehension

Do **not** present files in alphabetical or tree order. Reorganize into sections ordered by reviewer value:

1. **Reviewer path** - The scan order through the PR.
2. **Core logic** - New behavior, algorithm changes, state transitions, API surface changes. Show full diffs with surrounding context. Put wiring and integration details inside this section as supporting subsections, not as a top-level group.
3. **Risks** - A separate standalone list of correctness, regression, compatibility, migration, security, performance, observability, and test coverage risks. Keep this section concise and link each risk back to the relevant core/mechanical section when possible.
4. **Test coverage** - Focused automated and manual validation signals.
5. **Boilerplate & mechanical** - Import reordering, renames, generated code, formatting, type re-exports, project metadata. Summarize as a list of file names and stats. No inline diffs unless specifically relevant. This group is always last.

These five top-level sections are mandatory and must appear in exactly that order:
Reviewer Path, Core Logic, Risks, Test Coverage, Boilerplate & Mechanical. Keep
the exact section concepts visible even if you add summaries, diagrams,
timelines, tabs, or other creative views. Lead with core logic after the reviewer
path. The reviewer's attention is freshest at the top.

If a section is empty, keep the section and state `None identified` so the reviewer knows the category was considered. Do not replace these sections with only a file list, diagram, narrative summary, or risk table.

The **Risks** section must be its own visible top-level list. Inline callouts near
diff hunks are useful, but they do not satisfy the risk requirement by
themselves. Each real risk should name the category, the failure mode, where to
review it, and the reviewer action or validation needed.

## Distill complex logic into pseudocode

When a core change involves dense or intricate logic - deeply nested conditions, state machines, retry/backoff flows, multi-step transformations - add a short pseudocode summary next to the diff. The pseudocode should strip away language syntax, error handling, and boilerplate to expose the essential algorithm or control flow in a few lines. This lets the reviewer confirm intent before reading the real code.

Only do this when the actual diff is hard to scan. Straightforward changes don't need a pseudocode mirror.

## Trace tricky logic on a concrete example

Pseudocode shows the shape of the change; an example trace shows it executing. When a hunk changes behavior in a way that's hard to predict from reading it - reordered effects, new short-circuits, altered edge cases - pick a concrete input and walk it through both the old and new code paths side-by-side, highlighting the step where they diverge and what the observable outcome is. Keep the input small and realistic.

Use this for genuinely surprising behavior changes, not every core hunk.

## Add flow diagrams when they help

When the diff changes a state transition, request pipeline, event ordering, dependency direction, retry path, permission gate, data transformation, or old-vs-new control flow, add a small flow diagram near the relevant diff. The diagram should make the review faster than prose alone. Keep it focused: a few nodes, clear arrows, and one sentence explaining the key path or divergence.

Do not diagram obvious straight-line code. Reserve diagrams for places where reviewers would otherwise have to reconstruct flow mentally. Diagrams are supporting material; they must not replace the required core/wiring/mechanical/risk sections.

## Call attention to tricky things

When a hunk contains something surprising, risky, or easy to miss, visually separate it from the surrounding diff and pair it with a short tag (e.g. "Subtle", "Breaking", "Race condition", "Perf") and a one-sentence explanation so the reviewer sees the concern and the code together.

Reserve these callouts for genuinely tricky items - overuse destroys signal. If the callout is a real review risk, also include it in the top-level **Risks** section.

## Tone and content

Write reviewer-facing commentary, not a changelog. Focus on:

- **Why** something changed, not just what changed.
- Interactions between files - e.g. "The new validator in `core.ts` is invoked by the route added in `routes.ts`."
- Anything the diff alone doesn't make obvious.

Keep commentary terse. One or two sentences per note.

## Be creative

The sections above are a floor, not a ceiling. The goal is the fastest possible path for the reviewer to understand this specific change - so look at the diff in front of you and ask what representation would actually help. A tiny state diagram, a before/after call graph, a table of input->output pairs, a timeline of commits, a confidence annotation per file, a single large callout with everything else collapsed - whatever fits the change.

The HTML template can express charts, tables, diff views, DAG layouts, cards, stats, and focused review panels. Reach for whichever representation best serves the change at hand. A review of a refactor looks different from a review of a bug fix looks different from a review of a new feature - let the canvas reflect that.
