# Agent Canvas Reference

This reference defines an agent-runtime-neutral HTML canvas policy. The durable output is a single `.html` file served through a local HTTP preview path and returned as a link. Prefer a link that targets the in-app browser when the runtime exposes one; otherwise return the plain local web URL.

A canvas is a standalone HTML artifact served locally so the user can open it beside the chat. Follow the workflow below in order.

## Workflow

### 1. Decide whether to use a canvas

The trigger is **user intent**, not response shape. Ask: would the user benefit from viewing this output as its **own standalone artifact**, separate from the chat? If the output is a means to an end (a drafted message, a code fix, a dashboard in another tool), skip the canvas.

**Use a canvas when the agent produces new standalone analytical output:**

- Quantitative analyses and metrics breakdowns.
- Billing or account investigations that surface structured findings.
- Security audits or architecture reviews with categorized findings.
- Cross-system data analyses and overlap reports.
- Structured data from connected tools where the data is the deliverable.
- Financial analyses, margin decompositions, usage trend reports.
- Tables with more than a handful of rows that the user asked to see.

**Do not use a canvas when:**

- The user asks for work in a **specific tool** - create that tool's artifact instead.
- The user has a **specific deliverable** - "draft a support response", "fix this code", "make this PR".
- The user is **working within an existing artifact** - improving an HTML dashboard, editing an existing file.
- The user is doing **targeted debugging** or active development, even if structured findings emerge along the way.
- The answer is a short factual answer, one-off file edit, or quick clarifying question.
- Connected tools are queried as an **intermediate step** for a different deliverable.

### 2. Write the HTML canvas

**Location.** Prefer the active agent runtime's managed artifact directory when one exists. If no such directory exists, write outside the reviewed repository under `~/.agent-artifacts/pr-review-canvas/<workspace-slug>/<name>.html`. Do not dirty the reviewed repository with generated review artifacts unless the user explicitly asks. Use a descriptive kebab-case filename ending in `.html`.

**Template.** Start from `assets/pr-review-canvas-template.html`. Copy the template to the output canvas path and replace the placeholders first. Reuse its components for summary stats, required sections, diff panels, flow diagrams, trace tables, mechanical lists, risks, empty states, and shared styling. Extend it only for PR-specific needs.

The default PR review template uses plain HTML/CSS components, not TSX. Preserve
classes such as `.grid`, `.card`, `.review-panel`, `.diff-view`, `.table-scroll`,
and `.callout`. The expected visual theme is the reference canvas style:
editorial serif typography, light neutral page background, flat white panels,
thin neutral borders, restrained blue accent, and dark monospace diff panes.
Raw compiled JSX markers such as `@__PURE__`, function source, `[object Object]`,
or a visibly different generic web-app theme in the preview are hard failures.
Use `scripts/serve-html.js <review.html> --port <port> --route /<name>.html`
for local preview instead of creating a new ad hoc renderer.

**File rules:**

- Exactly one HTML canvas file. Never create helper files, style files, or supporting modules for the artifact.
- Embed all CSS and review data inline. **No `fetch()`, no network calls, no external CDNs.**
- Escape all PR text and diff content as HTML. Diff lines go inside `.diff-line` spans with `added`, `removed`, or `unchanged` classes.

Apply the canvas generation policy below as you write, and complete its pre-delivery self-check before returning the canvas.

### Required review sections

Every PR review canvas must include these visible top-level sections in this exact order:

1. **Reviewer Path** - the scan order through the PR.
2. **Core Logic** - behavior, algorithms, state transitions, API surface, tricky business rules. Show the richest diff/context here. Put wiring/integration details inside this section as supporting subsections, not as a top-level group.
3. **Risks** - a separate standalone list of correctness, regression, compatibility, migration, security, performance, observability, and test coverage risks. Keep this concise and point each risk to the relevant section or hunk.
4. **Test Coverage** - focused automated and manual validation signals.
5. **Boilerplate & Mechanical** - generated code, formatting, import churn, renames, type re-exports, project metadata. Summarize file names and stats; expand only when relevant. This group is always last.

If one section has no entries, render it with `None identified`. Do not omit it. Other views such as summary cards, inline risk callouts, flow diagrams, or file stats are additive and must not replace these sections. If you add inline risk callouts near code, also summarize them in the top-level **Risks** section.

The **Risks** section must be its own visible list. Inline callouts next to code
are supporting annotations only. For each real risk, include the category, the
failure mode, where to review it, and the reviewer action or validation needed.

### 3. Serve and link the canvas

Do not use `file://` links for the primary open path; many in-app browsers block them.

After writing the HTML file:

1. Start or reuse `scripts/serve-html.js`.
2. Get the URL for the generated canvas from that preview server.
3. If the runtime exposes an in-app-browser-targeting URL, include that as the Markdown link target. Otherwise include the plain local web URL for the rendered HTML preview.
4. Do not open Chrome, the in-app browser, screenshots, or browser automation just to test the generated file.

Example response link:

```markdown
[Open PR review canvas](http://127.0.0.1:8765/pr-review-canvas)
```

Keep the preview server running for the session when possible. If the first port is busy, choose another free localhost port. Do not return only the path. Do not return only source code. The user must get a clickable link to the rendered HTML canvas, with in-app targeting preferred when available and plain localhost as the fallback.

## Design guidance

Be creative. The canvas SDK may provide charts, tables, diff views, DAG layout, cards, stats, interactive state, and more. Use whichever components best serve the content. Avoid slop: no gradients, no emojis, no box-shadows, no rainbow coloring. Agent canvases are flat, minimal, and purposeful.

### Visual hierarchy

Not everything deserves equal treatment. Primary content gets more space, larger headings, and accent color. Supporting content stays compact. Squint test: blur your eyes - can you tell what matters?

**Color.** Prefer runtime theme tokens when available. If none exist, use a restrained neutral palette with one accent color. Use accent color deliberately, not on everything.

### Responsive containment

Review canvases contain long, hostile strings: file paths, branch names, code
lines, generated symbols, and URLs. Grids must use `minmax(0, ...)`, grid
children must opt into `min-width: 0`, and diff/code/table blocks must scroll or
wrap within their own panel. A long code line must not widen the main column,
overlap a side panel, or create unreadable text on narrow screens.

### Flow diagrams

Use flow diagrams when they make review faster: state transitions, request pipelines, event ordering, dependency direction, retry paths, permission gates, data transformations, or old-vs-new control flow. Keep diagrams small and close to the relevant diff. Use simple HTML/CSS or inline SVG primitives inside the single canvas file.

Do not diagram obvious straight-line code. A weak diagram is worse than none. Diagrams are supporting material; they must sit inside or next to the relevant required section instead of replacing the section structure or the top-level **Risks** section.

### Slop patterns - forbidden

These specific patterns produce low-quality output. If two or more are present, redesign.

- **Gradients** - no `linear-gradient`, `radial-gradient`, `background-clip: text`.
- **Emojis** - no emoji as icons, status indicators, bullets, or section markers.
- **Box shadows** - no `box-shadow`. Flat surfaces only.
- **Wall of identical cards** - every section wrapped in the same card style with no variation. Mix open sections with cards.
- **Rainbow coloring** - a different color on every element. Most elements are neutral; color is used sparingly with purpose.
- **Giant text** - font sizes above H1 (24px), or bold text stuffed in card headers.
- **Decorative borders** - colored borders on every element. Borders are structural, not decorative.

### Pre-delivery self-check

Before returning the canvas link, check:

1. Does the layout have visual hierarchy? One thing should stand out.
2. Is there variety in the composition? Not just a single column of uniform blocks.
3. Are `Reviewer Path`, `Core Logic`, `Risks`, `Test Coverage`, and `Boilerplate & Mechanical` present as visible top-level sections in that order?
4. Did you add a flow diagram only when it improves review comprehension, and does it support rather than replace a required section?
5. Slop check: scan for the forbidden patterns above.
6. Did you include a clickable link to the rendered HTML canvas, preferring an in-app-browser-targeting URL when available and falling back to localhost?
7. Did you avoid opening a browser, taking screenshots, or running browser automation just to test the generated file?

## Introducing the canvas

When you create a canvas, add a short note in your chat response telling the user you created a canvas, and include the rendered canvas link:

- **First canvas** - if no other HTML canvases exist in the workspace's artifact directory, include one sentence explaining what a canvas is.
- **Unsolicited canvas** - if the user did not ask for a canvas, include one sentence explaining why you chose it over plain text.

Both can apply at once; one or two sentences total is enough. Skip the intro for subsequent canvases.

## Troubleshooting

If the user reports that a canvas appears blank or missing, first check that the preview server is still running and the URL points to the generated canvas route. Inspect runtime diagnostics, invalid HTML, missing inline data, or escaping errors. Do not open Chrome or browser automation unless the user explicitly asks for interactive debugging.

## Good example

```html
<main class="canvas stack">
  <section class="hero">
    <div class="hero-copy">
      <h1>Service Overview</h1>
      <p class="muted">Auth service latency increased after the 14:30 deploy.</p>
    </div>
    <dl class="grid stats">
      <div class="stat"><dt>Total Services</dt><dd>6</dd></div>
      <div class="stat success"><dt>Healthy</dt><dd>5</dd></div>
      <div class="stat warning"><dt>Degraded</dt><dd>1</dd></div>
    </dl>
  </section>
</main>
```

Stats in a grid, table directly under H2, text sections without cards.

## Bad example - do not imitate

```html
<!-- BAD - every section wrapped in the same card, no hierarchy -->
<section class="card">Summary</section>
<section class="card">Status</section>
<section class="card">Changes</section>
```
