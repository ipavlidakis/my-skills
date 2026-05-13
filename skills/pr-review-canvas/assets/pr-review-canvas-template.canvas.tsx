type DiffTone = "add" | "del" | "ctx";

type DiffLine = {
  tone: DiffTone;
  text: string;
};

type DiffBlock = {
  file: string;
  title: string;
  note: string;
  risk?: string;
  lines: DiffLine[];
};

type RiskItem = {
  title: string;
  detail: string;
  section?: "Core logic" | "Wiring & integration" | "Boilerplate & mechanical";
  tone?: "warning" | "danger";
};

type FlowStep = {
  label: string;
  detail?: string;
  tone?: "primary" | "muted" | "strong";
};

type TraceRow = {
  step: string;
  before: string;
  after: string;
};

type MechanicalItem = {
  label: string;
  value: string;
};

const summary = {
  title: "PR Review Canvas",
  subtitle:
    "Replace this with the one-sentence reviewer framing: what changed, why it matters, and where attention should go first."
};

const mechanical: MechanicalItem[] = [
  { label: "PR", value: "owner/repo#123" },
  { label: "Base", value: "main" },
  { label: "Head", value: "feature/example" },
  { label: "Files", value: "0" },
  { label: "Diff", value: "+0 / -0" }
];

const coreDiffs: DiffBlock[] = [
  {
    file: "Sources/CoreExample.ts",
    title: "Core behavior changed",
    note: "Explain the behavior change in reviewer language.",
    risk: "Optional: call out a subtle correctness or regression risk.",
    lines: [
      { tone: "ctx", text: "function update(input) {" },
      { tone: "del", text: "-  return oldPath(input)" },
      { tone: "add", text: "+  return newPath(input)" },
      { tone: "ctx", text: "}" }
    ]
  }
];

const wiringDiffs: DiffBlock[] = [
  {
    file: "Sources/WiringExample.ts",
    title: "Call site now uses the new path",
    note: "Explain how the core behavior is reached.",
    lines: [
      { tone: "del", text: "-await service.oldUpdate()" },
      { tone: "add", text: "+await service.newUpdate()" }
    ]
  }
];

const boilerplateItems: MechanicalItem[] = [
  { label: "Generated files", value: "None identified" },
  { label: "Formatting-only files", value: "None identified" },
  { label: "Rename/import churn", value: "None identified" }
];

const risks: RiskItem[] = [
  {
    title: "None identified",
    detail: "Replace this item when the diff has correctness, regression, migration, security, performance, observability, or test coverage risk."
  }
];

const flowSteps: FlowStep[] = [
  { label: "Input", detail: "Concrete user/system action", tone: "primary" },
  { label: "Core change", detail: "New branch or state transition", tone: "strong" },
  { label: "Observable result", detail: "What reviewer should verify" }
];

const traceRows: TraceRow[] = [
  {
    step: "Concrete input",
    before: "Old behavior.",
    after: "New behavior."
  }
];

function lineClass(tone: DiffTone) {
  if (tone === "add") return "line add";
  if (tone === "del") return "line del";
  return "line ctx";
}

function SummaryHeader() {
  return (
    <header className="top">
      <div className="summary">
        <h1>{summary.title}</h1>
        <p>{summary.subtitle}</p>
      </div>
      <dl className="stats">
        {mechanical.map((item) => (
          <div className="stat" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

function RequiredSection({
  title,
  intro,
  children
}: {
  title: string;
  intro?: string;
  children: any;
}) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {intro ? <p className="intro">{intro}</p> : null}
      {children}
    </section>
  );
}

function EmptyState() {
  return <div className="empty">None identified</div>;
}

function DiffPanel({ block }: { block: DiffBlock }) {
  return (
    <article className="diff-panel">
      <p className="eyebrow">{block.file}</p>
      <h3>{block.title}</h3>
      <p className="note">{block.note}</p>
      {block.risk ? <p className="callout">{block.risk}</p> : null}
      <pre className="diff">
        {block.lines.map((line, index) => (
          <span key={`${block.file}-${index}`} className={lineClass(line.tone)}>
            {line.text}
          </span>
        ))}
      </pre>
    </article>
  );
}

function DiffStack({ blocks }: { blocks: DiffBlock[] }) {
  if (blocks.length === 0) return <EmptyState />;
  return (
    <div className="diff-stack">
      {blocks.map((block) => (
        <DiffPanel block={block} key={`${block.file}-${block.title}`} />
      ))}
    </div>
  );
}

function FlowDiagram({ steps }: { steps: FlowStep[] }) {
  if (steps.length === 0) return null;
  return (
    <div className="flow" aria-label="Flow diagram">
      {steps.map((step, index) => (
        <div className="flow-item" key={`${step.label}-${index}`}>
          <div className={`flow-node ${step.tone ?? ""}`}>
            <strong>{step.label}</strong>
            {step.detail ? <span>{step.detail}</span> : null}
          </div>
          {index < steps.length - 1 ? <div className="flow-arrow">to</div> : null}
        </div>
      ))}
    </div>
  );
}

function TraceTable({ rows }: { rows: TraceRow[] }) {
  if (rows.length === 0) return null;
  return (
    <table className="trace">
      <thead>
        <tr>
          <th>Concrete input</th>
          <th>Old path</th>
          <th>New path</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.step}>
            <td>{row.step}</td>
            <td>{row.before}</td>
            <td>{row.after}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MechanicalList({ items }: { items: MechanicalItem[] }) {
  if (items.length === 0) return <EmptyState />;
  return (
    <div className="mechanical-list">
      {items.map((item) => (
        <div className="mechanical-item" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function RiskList({ items }: { items: RiskItem[] }) {
  if (items.length === 0) return <EmptyState />;
  return (
    <div className="risk-list">
      {items.map((risk) => (
        <article className={`risk ${risk.tone ?? "warning"}`} key={risk.title}>
          <h3>{risk.title}</h3>
          <p>{risk.detail}</p>
          {risk.section ? <p className="risk-section">Related: {risk.section}</p> : null}
        </article>
      ))}
    </div>
  );
}

function CanvasStyles() {
  return (
    <style>{`
      :root {
        color: #1d2026;
        background: #f7f8fa;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: #f7f8fa; }
      .canvas { max-width: 1180px; margin: 0 auto; padding: 32px 28px 56px; }
      .top {
        display: grid;
        grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.8fr);
        gap: 24px;
        align-items: start;
        margin-bottom: 28px;
      }
      .summary { border-left: 4px solid #235789; padding-left: 16px; }
      h1 { margin: 0 0 10px; font-size: 24px; line-height: 1.2; letter-spacing: 0; }
      h2 { margin: 0 0 16px; font-size: 21px; line-height: 1.25; letter-spacing: 0; }
      h3 { margin: 0 0 8px; font-size: 15px; line-height: 1.35; letter-spacing: 0; }
      p { margin: 0; line-height: 1.5; }
      .summary p, .intro, .note { color: #4b5563; }
      .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border: 1px solid #d7dce2; background: #fff; padding: 12px; }
      .stat { border: 1px solid #e2e6eb; padding: 9px 10px; min-height: 54px; }
      .stat dt { margin: 0 0 4px; color: #667085; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; }
      .stat dd { margin: 0; font-size: 13px; font-weight: 650; overflow-wrap: anywhere; }
      .section { margin-top: 30px; padding-top: 22px; border-top: 1px solid #d7dce2; }
      .intro { margin-bottom: 16px; max-width: 860px; }
      .core-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 18px; align-items: start; }
      .side { display: grid; gap: 16px; }
      .diff-stack, .risk-list, .mechanical-list { display: grid; gap: 16px; }
      .diff-panel, .panel, .risk, .mechanical-item, .empty {
        background: #fff;
        border: 1px solid #d7dce2;
        padding: 16px;
      }
      .eyebrow { color: #667085; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; overflow-wrap: anywhere; }
      .note { font-size: 13px; margin-bottom: 10px; }
      .callout { border: 1px solid #c6a15b; background: #fff8e8; color: #5c430f; padding: 9px 10px; font-size: 13px; margin-bottom: 10px; }
      .diff { margin: 0; padding: 12px; background: #101418; color: #e7eaee; overflow-x: auto; font-size: 12px; line-height: 1.55; tab-size: 4; }
      .line { display: block; min-height: 18px; white-space: pre; }
      .line.add { color: #9ce2b3; }
      .line.del { color: #ffb2b2; }
      .line.ctx { color: #d8dde3; }
      .flow { display: grid; gap: 8px; }
      .flow-node { border: 1px solid #cfd6de; background: #fff; padding: 9px 10px; font-size: 13px; text-align: center; }
      .flow-node strong { display: block; margin-bottom: 3px; }
      .flow-node span { display: block; color: #667085; font-size: 12px; }
      .flow-node.primary { border-color: #235789; color: #123c63; }
      .flow-node.strong { border-color: #235789; background: #eef5fb; }
      .flow-node.muted { background: #f3f4f6; color: #4b5563; }
      .flow-arrow { color: #667085; font-size: 11px; text-transform: uppercase; text-align: center; }
      .trace { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #d7dce2; }
      .trace th, .trace td { border: 1px solid #d7dce2; padding: 10px 12px; text-align: left; vertical-align: top; font-size: 13px; line-height: 1.45; }
      .trace th { background: #eef3f7; color: #344054; font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; }
      .mechanical-item { display: grid; grid-template-columns: minmax(160px, 0.45fr) minmax(0, 1fr); gap: 12px; }
      .mechanical-item span, .risk-section { color: #667085; font-size: 12px; }
      .mechanical-item strong { font-size: 13px; overflow-wrap: anywhere; }
      .risk.warning { border-left: 4px solid #c6a15b; }
      .risk.danger { border-left: 4px solid #9f2f2f; }
      .risk p { color: #4b5563; font-size: 13px; }
      .risk-section { margin-top: 8px; }
      .empty { color: #667085; border-style: dashed; }
      @media (max-width: 880px) {
        .top, .core-layout { grid-template-columns: 1fr; }
        .mechanical-item { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}

export default function PrReviewCanvasTemplate() {
  return (
    <main className="canvas">
      <CanvasStyles />
      <SummaryHeader />

      <RequiredSection
        title="Core logic"
        intro="Behavioral changes, algorithms, state transitions, API surface, and tricky business rules."
      >
        <div className="core-layout">
          <DiffStack blocks={coreDiffs} />
          <aside className="side">
            <div className="panel">
              <h3>Flow</h3>
              <FlowDiagram steps={flowSteps} />
            </div>
            <div className="panel">
              <h3>Concrete trace</h3>
              <TraceTable rows={traceRows} />
            </div>
          </aside>
        </div>
      </RequiredSection>

      <RequiredSection
        title="Wiring & integration"
        intro="Call sites, routing, dependency injection, lifecycle hooks, config, and tests that connect the core change."
      >
        <DiffStack blocks={wiringDiffs} />
      </RequiredSection>

      <RequiredSection
        title="Boilerplate & mechanical"
        intro="Generated code, formatting, import churn, renames, type re-exports, and project metadata."
      >
        <MechanicalList items={boilerplateItems} />
      </RequiredSection>

      <RequiredSection
        title="Risks"
        intro="Correctness, regression, compatibility, migration, security, performance, observability, and test coverage risks."
      >
        <RiskList items={risks} />
      </RequiredSection>
    </main>
  );
}
