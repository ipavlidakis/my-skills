# Agent Canvas Reference

This reference defines an agent-runtime-neutral canvas policy. The durable output is a self-contained `.html` file that opens directly in the in-app browser. Runtime-specific `.tsx` canvases, SDK components, or build steps may be useful while authoring, but they are implementation details, not the user-facing deliverable.

A canvas is a single standalone HTML file the user can open beside the chat. Follow the workflow below in order.

## Workflow

### 1. Decide whether to use a canvas

The trigger is **user intent**, not response shape. Ask: would the user benefit from viewing this output as its **own standalone artifact**, separate from the chat? If the output is a means to an end (a drafted message, a code fix, a dashboard in another tool), skip the canvas.

**Use a canvas when the agent produces new standalone analytical output:**

- Quantitative analyses and metrics breakdowns (e.g. "send 500 requests and tell me how many fail")
- Billing or account investigations that surface structured findings from database queries
- Security audits or architecture reviews with categorized findings
- Cross-system data analyses and overlap reports
- Structured data from connected tools where the data is the deliverable
- Financial analyses, margin decompositions, usage trend reports
- Tables with more than a handful of rows that the user asked to see

**Do not use a canvas when:**

- The user asks for work in a **specific tool** - create that tool's artifact instead.
- The user has a **specific deliverable** - "draft a support response", "fix this code", "make this PR".
- The user is **working within an existing artifact** - improving an HTML dashboard, editing an existing file.
- The user is doing **targeted debugging** or active development, even if structured findings emerge along the way.
- The answer is a short factual answer, one-off file edit, or quick clarifying question.
- Connected tools are queried as an **intermediate step** for a different deliverable.

### 2. Write the HTML canvas

**Location.** Prefer the active agent runtime's managed artifact directory when one exists. If no such directory exists, write outside the reviewed repository under `~/.agent-artifacts/pr-review-canvas/<workspace-slug>/<name>.html`. Do not dirty the reviewed repository with generated review artifacts unless the user explicitly asks. Use a descriptive kebab-case filename ending in `.html`; preserve acronym capitalization and lowercase the rest.

**File rules:**

- Exactly one `.html` file per canvas. Never create helper files, style files, or supporting modules.
- Embed all CSS in a `<style>` tag and any behavior in a small inline `<script>` tag.
- Embed all review data inline. **No `fetch()`, no network calls, no external CDNs.**
- Do not require TypeScript, Node, a bundler, a dev server, or a canvas runtime to view the final artifact.

**Optional runtime SDK use:** if the active runtime exposes a canvas SDK, you may use its components and type definitions while designing the artifact. If you author `.tsx`, convert or render it to a standalone `.html` file before delivery. The final link must open the HTML file natively in the in-app browser.

Apply the canvas generation policy below as you write, and complete its pre-delivery self-check before returning the canvas.

### 3. Return an in-app browser link

After writing the HTML file, include a Markdown link that opens the generated file in the in-app browser. Use the runtime's local-file link format when one is documented. Otherwise use a `file://` URL built from the absolute path:

```markdown
[Open PR review canvas](file:///absolute/path/to/pr-review-canvas.html)
```

Do not return only the path. Do not return only source code. The user must get a clickable link to the generated HTML artifact.

## Design guidance

Be creative. HTML, CSS, SVG, and lightweight inline JavaScript give you enough expressive building blocks - use them in whatever combination best serves the content. But avoid slop: no gradients, no emojis, no box-shadows, no rainbow coloring. Agent canvases are flat, minimal, and purposeful.

### Visual hierarchy

Not everything deserves equal treatment. Primary content gets more space, larger headings, and accent color. Supporting content stays compact. Squint test: blur your eyes - can you tell what matters?

**Color.** Prefer runtime theme CSS variables when available. If none exist, use a restrained neutral palette with one accent color. Use accent color deliberately, not on everything.

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

Before returning the canvas link, verify:

1. Does the layout have visual hierarchy? One thing should stand out.
2. Is there variety in the composition? Not just a single column of uniform blocks.
3. Slop check: scan for the forbidden patterns above.
4. Does the file open without TypeScript, Node, a bundler, a dev server, or network access?
5. Did you include a clickable in-app browser link to the generated `.html` file?

## Introducing the canvas

When you create a canvas, add a short note in your chat response telling the user you created a canvas they can open beside the chat, and include the openable HTML link:

- **First canvas** - if no other HTML canvases exist in the workspace's artifact directory, include one sentence explaining what a canvas is.
- **Unsolicited canvas** - if the user did not ask for a canvas, include one sentence explaining why you chose it over plain text.

Both can apply at once; one or two sentences total is enough. Skip the intro for subsequent canvases.

## Troubleshooting

If a canvas appears blank or missing, first verify that the response link points to the generated `.html` file's absolute path and that the file exists. If the browser refuses the link format, provide the runtime's preferred local-file link format. If the page renders blank, open the HTML file directly and check for JavaScript errors, missing inline data, or invalid markup. Do not introduce a dev server or build step to fix a viewing problem.

## Good example

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Service Overview</title>
  <style>
    :root { color-scheme: light dark; --accent: #2563eb; }
    body { margin: 0; font: 14px system-ui, sans-serif; }
    main { max-width: 1100px; margin: 0 auto; padding: 24px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .stat { border: 1px solid color-mix(in srgb, currentColor 16%, transparent); padding: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border-bottom: 1px solid color-mix(in srgb, currentColor 14%, transparent); padding: 8px; text-align: left; }
    .warning { color: #b45309; }
  </style>
</head>
<body>
  <main>
    <h1>Service Overview</h1>
    <section class="stats" aria-label="Service stats">
      <div class="stat"><strong>6</strong><br>Total Services</div>
      <div class="stat"><strong>5</strong><br>Healthy</div>
      <div class="stat warning"><strong>1</strong><br>Degraded</div>
    </section>
    <h2>Service Status</h2>
    <table>
      <thead><tr><th>Service</th><th>Status</th><th>Uptime</th><th>Latency</th></tr></thead>
      <tbody>
        <tr><td>api-gateway</td><td>Operational</td><td>99.99%</td><td>12ms</td></tr>
        <tr><td>auth-service</td><td class="warning">Degraded</td><td>99.2%</td><td>340ms</td></tr>
      </tbody>
    </table>
  </main>
</body>
</html>
```

Stats in a grid, table directly under H2, text sections without cards, no runtime required.

## Bad example - do not imitate

```html
<!-- BAD - every section wrapped in the same boxed div, no hierarchy, table unnecessarily boxed -->
<main>
  <div class="card"><h2>Summary</h2><p>6 services.</p></div>
  <div class="card"><h2>Status</h2><div class="card"><table>...</table></div></div>
  <div class="card"><h2>Changes</h2><p>Latency increased.</p></div>
</main>
```
