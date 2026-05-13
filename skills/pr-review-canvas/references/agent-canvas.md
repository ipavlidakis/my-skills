# Agent Canvas Reference

This reference defines an agent-runtime-neutral TSX canvas policy. The durable output is a single `.canvas.tsx` or runtime-equivalent `.tsx` file served through the active runtime's canvas preview path and opened directly in the in-app browser.

A canvas is a standalone TSX artifact the runtime compiles or renders so the user can open it beside the chat. Follow the workflow below in order.

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

### 2. Write the TSX canvas

**Location.** Prefer the active agent runtime's managed canvas directory when one exists. If no such directory exists, write outside the reviewed repository under `~/.agent-artifacts/pr-review-canvas/<workspace-slug>/<name>.canvas.tsx`. Do not dirty the reviewed repository with generated review artifacts unless the user explicitly asks. Use a descriptive kebab-case filename ending in `.canvas.tsx`, or the active runtime's required TSX extension.

**Template.** Start from `assets/pr-review-canvas-template.canvas.tsx` unless the active runtime requires a different component shape. Copy the template to the output canvas path and replace the data arrays first. Reuse its components for summary stats, required sections, diff panels, flow diagrams, trace tables, mechanical lists, risks, empty states, and shared styling. Extend it only for PR-specific needs.

**File rules:**

- Exactly one TSX canvas file. Never create helper files, style files, or supporting modules.
- Import only from the active runtime's canvas SDK module when one exists. No relative imports, no npm packages, no Node built-ins.
- Default-export the top-level component when the runtime supports React-style canvases.
- Embed all review data inline. **No `fetch()`, no network calls, no external CDNs.**

**Component discovery:** prefer built-in canvas SDK components over hand-rolled markup. The full public surface should be declared by the active runtime's SDK type definitions. Read them when you need exact exports, prop shapes, or hook signatures rather than guessing.

Apply the canvas generation policy below as you write, and complete its pre-delivery self-check before returning the canvas.

### Required review sections

Every PR review canvas must include these visible top-level sections in this order:

1. **Core logic** - behavior, algorithms, state transitions, API surface, tricky business rules. Show the richest diff/context here.
2. **Wiring & integration** - routes, dependency injection, config, call sites, app lifecycle hooks, build/test plumbing that connects the core logic.
3. **Boilerplate & mechanical** - generated code, formatting, import churn, renames, type re-exports, project metadata. Summarize file names and stats; expand only when relevant.
4. **Risks** - correctness, regression, compatibility, migration, security, performance, observability, and test coverage risks. Keep this concise and point each risk to the relevant section or hunk.

If one section has no entries, render it with `None identified`. Do not omit it. Other views such as summary cards, inline risk callouts, flow diagrams, or file stats are additive and must not replace these sections. If you add inline risk callouts near code, also summarize them in the top-level **Risks** section.

### 3. Serve and open the canvas

Do not use `file://` links for the primary open path; many in-app browsers block them and raw TSX will not render that way.

After writing the TSX file:

1. Start or reuse the active runtime's TSX canvas preview server.
2. Get the browser URL for the generated canvas from that runtime or preview server.
3. Verify the URL is reachable with an HTTP request or runtime status check.
4. If the runtime has an in-app browser or browser automation tool, open the verified URL yourself. Do not ask the user whether they can see or access the file first.
5. Include the verified preview URL as a Markdown link in the final response.

Example response link:

```markdown
[Open PR review canvas](http://127.0.0.1:8765/pr-review-canvas)
```

Keep the preview server running for the session when possible. If the first port is busy, choose another free localhost port. Do not return only the path. Do not return only source code. The user must get a clickable HTTP link to the rendered TSX canvas, and the agent should have already opened that link in the in-app browser when the runtime permits it.

## Design guidance

Be creative. The canvas SDK may provide charts, tables, diff views, DAG layout, cards, stats, interactive state, and more. Use whichever components best serve the content. Avoid slop: no gradients, no emojis, no box-shadows, no rainbow coloring. Agent canvases are flat, minimal, and purposeful.

### Visual hierarchy

Not everything deserves equal treatment. Primary content gets more space, larger headings, and accent color. Supporting content stays compact. Squint test: blur your eyes - can you tell what matters?

**Color.** Prefer runtime theme tokens when available. If none exist, use a restrained neutral palette with one accent color. Use accent color deliberately, not on everything.

### Flow diagrams

Use flow diagrams when they make review faster: state transitions, request pipelines, event ordering, dependency direction, retry paths, permission gates, data transformations, or old-vs-new control flow. Keep diagrams small and close to the relevant diff. Prefer runtime DAG or flow components when available; otherwise use simple TSX/SVG primitives inside the single canvas file.

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

Before returning the canvas link, verify:

1. Does the layout have visual hierarchy? One thing should stand out.
2. Is there variety in the composition? Not just a single column of uniform blocks.
3. Are `Core logic`, `Wiring & integration`, `Boilerplate & mechanical`, and `Risks` present as visible top-level sections in that order?
4. Did you add a flow diagram only when it improves review comprehension, and does it support rather than replace a required section?
5. Slop check: scan for the forbidden patterns above.
6. Does the preview URL render the TSX canvas successfully?
7. Did you open the verified preview URL in the in-app browser yourself when the runtime provides a browser tool?
8. Did you include a clickable localhost HTTP link to the rendered canvas?

## Introducing the canvas

When you create a canvas, add a short note in your chat response telling the user you created a canvas and opened it in the in-app browser, and include the verified preview link:

- **First canvas** - if no other TSX canvases exist in the workspace's artifact directory, include one sentence explaining what a canvas is.
- **Unsolicited canvas** - if the user did not ask for a canvas, include one sentence explaining why you chose it over plain text.

Both can apply at once; one or two sentences total is enough. Skip the intro for subsequent canvases.

## Troubleshooting

If a canvas appears blank or missing, first verify that the preview server is still running, the URL points to the generated canvas route, and the URL returns success. If the page renders blank, inspect the runtime diagnostics, browser console, invalid imports, missing SDK exports, missing inline data, or invalid TSX. Do not fall back to asking the user to find the file manually.

## Good example

```tsx
import { Divider, Grid, H1, H2, Stack, Stat, Table, Text } from 'agent/canvas';

export default function ServiceOverview() {
  return (
    <Stack gap={20}>
      <H1>Service Overview</H1>
      <Grid columns={3} gap={16}>
        <Stat value="6" label="Total Services" />
        <Stat value="5" label="Healthy" tone="success" />
        <Stat value="1" label="Degraded" tone="warning" />
      </Grid>
      <Divider />
      <H2>Service Status</H2>
      <Table
        headers={["Service", "Status", "Uptime", "Latency"]}
        rows={[
          ["api-gateway", "Operational", "99.99%", "12ms"],
          ["auth-service", "Degraded", "99.2%", "340ms"],
        ]}
        rowTone={[undefined, "warning"]}
      />
      <Text tone="secondary" size="small">
        Auth service latency increased after the 14:30 deploy.
      </Text>
    </Stack>
  );
}
```

Stats in a grid, table directly under H2, text sections without cards.

## Bad example - do not imitate

```tsx
// BAD - every section wrapped in Card, no hierarchy, Table unnecessarily boxed
<Stack gap={12}>
  <Card><CardHeader>Summary</CardHeader><CardBody><Text>6 services.</Text></CardBody></Card>
  <Card><CardHeader>Status</CardHeader><CardBody><Table headers={[...]} rows={[...]} /></CardBody></Card>
  <Card><CardHeader>Changes</CardHeader><CardBody><Text>Latency increased.</Text></CardBody></Card>
</Stack>
```
