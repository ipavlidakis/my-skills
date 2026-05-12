# Agent Canvas Reference

This reference adapts a canvas-generation policy into agent-runtime-neutral terms. Follow the active agent runtime's exact canvas paths, SDK module names, and generated type definitions when they differ from the names below.

A canvas is a single `.canvas.tsx` file the agent runtime compiles so the user can open it beside the chat. Follow the workflow below in order.

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

### 2. Write the canvas

**Location.** Canvases live in the active agent runtime's managed canvas directory. The runtime may only detect canvases written directly inside that exact directory; subfolders, alternate extensions, and other locations may not be picked up. For a new canvas, write the `.canvas.tsx` file at the runtime's required canvas path. Do not stop after telling the user the path or showing code in chat. If you cannot determine the workspace directory from absolute paths already in your environment, inspect the runtime's known project or workspace registry rather than guessing. Use a descriptive kebab-case filename ending in `.canvas.tsx`; preserve acronym capitalization and lowercase the rest.

**File rules:**

- Exactly one `.canvas.tsx` file per canvas. Never create helper files, style files, or supporting modules.
- Import only from the active runtime's canvas SDK module. No relative imports, no npm packages, no Node built-ins.
- Default-export the top-level component.
- Embed all data inline. **No `fetch()`, no network calls.**

**Component discovery:** prefer built-in canvas SDK components over hand-rolled markup. The full public surface (components, hooks, prop types, tokens) should be declared by the active runtime's SDK type definitions. Read them when you need exact exports, prop shapes, or hook signatures rather than guessing. Referencing an export that does not exist is the most common runtime error.

Apply the canvas generation policy below as you write, and complete its pre-delivery self-check before returning the canvas.

## Design guidance

Be creative. The SDK gives you expressive building blocks - use them in whatever combination best serves the content. But avoid slop: no gradients, no emojis, no box-shadows, no rainbow coloring. Agent canvases are flat, minimal, and purposeful.

### Visual hierarchy

Not everything deserves equal treatment. Primary content gets more space, larger headings, and accent color. Supporting content stays compact. Squint test: blur your eyes - can you tell what matters?

**Color.** Use colors from the runtime theme tokens. Read the theme hook JSDoc in the SDK declarations for the return shape and usage pattern. No hardcoded hex. Use accent color deliberately, not on everything.

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

Before returning canvas code, verify:

1. Does the layout have visual hierarchy? One thing should stand out.
2. Is there variety in the composition? Not just a single column of uniform blocks.
3. Slop check: scan for the forbidden patterns above.

## Introducing the canvas

When you create a canvas, add a short note in your chat response telling the user you created a canvas they can open beside the chat:

- **First canvas** - if no other `.canvas.tsx` files exist in the workspace's canvas directory, include one sentence explaining what a canvas is.
- **Unsolicited canvas** - if the user did not ask for a canvas, include one sentence explaining why you chose it over plain text.

Both can apply at once; one or two sentences total is enough. Skip the intro for subsequent canvases.

## Troubleshooting

If a canvas appears blank or missing, the most common cause is that it was not written under the runtime's managed canvas directory exactly. Re-save it to that path. Do not debug this by trying to create the managed directory manually; focus on correcting the file path instead. Users can click the canvas file path in the response to open it, just like any other file path. When present, the canvas server may write a `<name>.canvas.status.json` sidecar after each build with `status`, `diagnostics`, or `error` fields you can read; the file is best-effort and may not exist, so do not block on it.

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
          ["billing", "Operational", "99.8%", "45ms"],
        ]}
        rowTone={[undefined, "warning", undefined]}
      />
      <Divider />
      <H2>Recent Changes</H2>
      <Text>Auth service latency increased after the 14:30 deploy.</Text>
      <Text tone="secondary" size="small">Last checked: Apr 7, 2026 14:52 UTC</Text>
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
