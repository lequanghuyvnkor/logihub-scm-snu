// LogiHub v2 — shell + flow state + StepFooter
const { useState: useStateV2, useEffect: useEffectV2, useContext, createContext, useMemo: useMemoV2 } = React;

// ════════════════════════════════════════════════════════════
// Flow state — gating + persistence
// ════════════════════════════════════════════════════════════
const DEFAULT_FLOW = {
  profileSaved: false,
  uploadValidated: false,
  ownedWHDeclared: "idle",
  optimizationStatus: "idle",
  selectedScenario: null,
  visitedSteps: ["overview"],
  resumeStep: "profile",
};

const FlowContext = createContext(DEFAULT_FLOW);
window.FlowContext = FlowContext;
window.useFlow = () => useContext(FlowContext);

const FLOW_LS_KEY = "logihub.v3.flow";
function loadFlow() {
  try {
    const raw = localStorage.getItem(FLOW_LS_KEY);
    if (!raw) return DEFAULT_FLOW;
    return { ...DEFAULT_FLOW, ...JSON.parse(raw), visitedSteps: JSON.parse(raw).visitedSteps || DEFAULT_FLOW.visitedSteps };
  } catch { return DEFAULT_FLOW; }
}
function saveFlow(flow) {
  try { localStorage.setItem(FLOW_LS_KEY, JSON.stringify(flow)); } catch {}
}
window.loadFlow = loadFlow;
window.saveFlow = saveFlow;

// ════════════════════════════════════════════════════════════
// NAV v2 — 3 tiers
// ════════════════════════════════════════════════════════════
const NAV_V2 = [
  { tier: "A", label: "Setup", subtitle: "Required",
    items: [
      { id: "profile", num: "01", name: "Company Profile",     icon: "doc" },
      { id: "upload",  num: "02", name: "Data Upload",         icon: "upload" },
      { id: "owned",   num: "03", name: "Existing Warehouses", icon: "layers", optional: true },
    ]
  },
  { tier: "B", label: "Decision", subtitle: "Core flow",
    items: [
      { id: "optimize", num: "04", name: "Run Optimization",   icon: "target" },
      { id: "map",      num: "05", name: "Warehouse Map",      icon: "search" },
      { id: "roles",    num: "06", name: "Warehouse Roles",    icon: "layers" },
    ]
  },
  { tier: "C", label: "Explore", subtitle: "Drill-down · scenarios",
    items: [
      { id: "forecast", num: "07", name: "Demand Forecast",    icon: "chart",       tabpill: true },
      { id: "events",   num: "08", name: "Seasonal Events",    icon: "calendar",    tabpill: true },
      { id: "scenarios",num: "09", name: "Scenarios",          icon: "tune",        tabpill: true },
      { id: "playbook", num: "10", name: "Event Playbook",     icon: "spark",       tabpill: true },
      { id: "case",     num: "11", name: "Business Case",      icon: "money",       tabpill: true },
      { id: "roadmap",  num: "12", name: "Roadmap",            icon: "arrow-right", tabpill: true },
      { id: "export",   num: "13", name: "Export",             icon: "download",    tabpill: true },
    ]
  },
];
window.NAV_V2 = NAV_V2;

// Order map used by StepFooter to find prev/next
const STEP_ORDER = ["overview","profile","upload","owned","optimize","map","roles","forecast","events","scenarios","playbook","case","roadmap","export"];
window.STEP_ORDER = STEP_ORDER;

// Tier-A and tier-B require gating; tier-C uses a softer "available" state.
function getStepStatus(stepId, flow) {
  const visited = new Set(flow.visitedSteps);
  // Tier A:
  if (stepId === "profile")  return flow.profileSaved ? "done" : (visited.has(stepId) ? "inprogress" : "available");
  if (stepId === "upload")   {
    if (!flow.profileSaved) return "locked";
    return flow.uploadValidated ? "done" : (visited.has(stepId) ? "inprogress" : "available");
  }
  if (stepId === "owned")    {
    if (!flow.uploadValidated) return "locked";
    return flow.ownedWHDeclared !== "idle" ? "done" : (visited.has(stepId) ? "inprogress" : "available");
  }
  // Tier B:
  if (stepId === "optimize") {
    if (!flow.uploadValidated) return "locked";
    return flow.optimizationStatus === "done" ? "done"
         : flow.optimizationStatus === "running" ? "inprogress"
         : (visited.has(stepId) ? "inprogress" : "available");
  }
  if (stepId === "map" || stepId === "roles") {
    if (flow.optimizationStatus !== "done") return "locked";
    return visited.has(stepId) ? "done" : "available";
  }
  // Tier C — soft, forecast/events viewable any time, others need optimisation
  if (["forecast","events"].includes(stepId)) return visited.has(stepId) ? "done" : "available";
  if (flow.optimizationStatus !== "done") return "locked";
  return visited.has(stepId) ? "done" : "available";
}
window.getStepStatus = getStepStatus;

function getTierProgress(tier, flow) {
  const items = NAV_V2.find(t => t.tier === tier).items;
  const done = items.filter(it => getStepStatus(it.id, flow) === "done").length;
  return { done, total: items.length };
}
window.getTierProgress = getTierProgress;

function findStepInfo(stepId) {
  for (const t of NAV_V2) {
    for (const it of t.items) if (it.id === stepId) return { tier: t.tier, tierLabel: t.label, ...it };
  }
  if (stepId === "overview") return { tier: null, tierLabel: "Overview", id: "overview", num: "00", name: "Overview", icon: "home" };
  return null;
}
window.findStepInfo = findStepInfo;

// ════════════════════════════════════════════════════════════
// Sidebar v2 — 3 tiers with state indicators
// ════════════════════════════════════════════════════════════
function SidebarV2({ route, onNavigate, dataMode, onDataModeChange, flow }) {
  const mode = window.DATA_MODES.find(m => m.id === dataMode) || window.DATA_MODES[1];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"></div>
        <div>
          <div className="brand-name">LogiHub</div>
          <div className="brand-sub">Decision Engine · v2</div>
        </div>
      </div>

      <div
        className={"nav-item" + (route === "overview" ? " active" : "") + " done"}
        onClick={() => onNavigate("overview")}
        style={{ marginBottom: 6 }}>
        <span className="nav-num">00</span>
        <window.Icon name="home"/>
        <span>Overview</span>
      </div>

      {NAV_V2.map((t) => {
        const prog = getTierProgress(t.tier, flow);
        return (
          <React.Fragment key={t.tier}>
            <div className={"nav-section tier " + t.tier}>
              <span className="tier-letter">{t.tier}</span>
              <span className="tier-label">{t.label}</span>
              <span className="tier-progress">{prog.done}/{prog.total}</span>
            </div>
            {t.items.map(it => {
              const status = getStepStatus(it.id, flow);
              const locked = status === "locked";
              const cls = "nav-item"
                + (route === it.id ? " active" : "")
                + " " + status
                + (it.tabpill ? " tabpill" : "");
              return (
                <div key={it.id} className={cls}
                  onClick={() => !locked && onNavigate(it.id)}
                  title={locked ? "Locked — finish prior gate first" : ""}>
                  <span className="nav-state"><span className="state-circle"></span></span>
                  <span className="nav-num">{it.num}</span>
                  <window.Icon name={it.icon}/>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</span>
                  {it.optional && status !== "done" && <span className="opt-badge">Opt</span>}
                  {it.optional && flow.ownedWHDeclared === "skip" && status === "done" && <span className="opt-badge skip">Skip</span>}
                </div>
              );
            })}
          </React.Fragment>
        );
      })}

      <div className="sidebar-foot">
        <div className="mode-block">
          <div className="mode-block-head">
            <span>Data Mode</span>
            <span className={"mode-tag " + mode.tone}>{mode.sub}</span>
          </div>
          <div className="mode-switch">
            {window.DATA_MODES.map(m => (
              <button key={m.id}
                className={"mode-opt" + (m.id === dataMode ? " active" : "")}
                onClick={() => onDataModeChange?.(m.id)}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="mode-foot">
            {mode.id === "mock" && "Self-generated dataset — pipeline smoke test."}
            {mode.id === "proxy" && "Public KOSTAT + MOLIT + CJ waybill-derived demand index."}
            {mode.id === "enterprise" && "Enterprise-origin CJ sample. Hub/cost/capacity still proxy."}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#6B7480", lineHeight: 1.4 }}>
          v0.5 · gated linear flow<br/>
          State persists across reload
        </div>
      </div>
    </aside>
  );
}
window.SidebarV2 = SidebarV2;

// ════════════════════════════════════════════════════════════
// TopBar v2 — tier breadcrumb + step counter + resume action
// ════════════════════════════════════════════════════════════
function TopBarV2({ stepId, dataMode = "proxy", flow, onResume }) {
  const co = window.COMPANY;
  const info = findStepInfo(stepId) || findStepInfo("overview");
  const stepIdx = STEP_ORDER.indexOf(stepId);
  const tierClass = info.tier ? "stage-pill " + info.tier : "stage-pill";
  const engineRan = flow.optimizationStatus === "done";

  return (
    <div className="topbar">
      <div className="crumbs-v2">
        <span style={{ color: "var(--ink-3)" }}>LogiHub</span>
        <span className="sep">/</span>
        {info.tier && (
          <span className={tierClass}>
            <span className="pip-dot"></span>{info.tier} · {info.tierLabel}
          </span>
        )}
        {!info.tier && <span className="stage-pill">Overview</span>}
        <span className="sep">/</span>
        {stepIdx >= 0 && <span className="crumb-count">Step {stepIdx} of 13</span>}
        <span className="crumb-step">{info.name}</span>
      </div>
      <div className="topbar-right">
        <button className="btn ghost"><window.Icon name="search"/> Search</button>
        <div className="scenario-chip">
          <span className="lbl">Company</span>
          <span className="val">{co?.name || "—"}</span>
          <span style={{ color: "var(--ink-4)" }}>·</span>
          <span style={{ color: "var(--ink-3)" }}>{window.INDUSTRY_BY_ID?.[co?.industry]?.en}</span>
        </div>
        {!engineRan && stepId !== "overview" && (
          <button className="btn" onClick={() => onResume?.()}>
            <window.Icon name="arrow-right"/> Resume from {findStepInfo(flow.resumeStep)?.name || "start"}
          </button>
        )}
        <button className="btn"><window.Icon name="download"/> Export</button>
        {engineRan
          ? <button className="btn primary"><window.Icon name="play"/> Re-run engine</button>
          : <button className="btn primary"><window.Icon name="play"/> Run engine</button>}
      </div>
    </div>
  );
}
window.TopBarV2 = TopBarV2;

// ════════════════════════════════════════════════════════════
// Pipeline v2 — 5 stages
// ════════════════════════════════════════════════════════════
function PipelineV2({ stepId, flow }) {
  const stageFor = (id) => {
    if (["profile","upload","owned"].includes(id)) return 0;
    if (id === "optimize") return 1;
    if (["map","roles"].includes(id)) return 2;
    if (["forecast","events","scenarios","playbook","case","roadmap"].includes(id)) return 3;
    if (id === "export") return 4;
    return -1;
  };
  const currentStage = stageFor(stepId);

  const stages = [
    { num: "01", name: "Setup",    meta: "Profile · Upload · Owned WH",
      doneCheck: f => f.profileSaved && f.uploadValidated },
    { num: "02", name: "Optimize", meta: "9 Scenarios · S0–S8 in parallel",
      doneCheck: f => f.optimizationStatus === "done" },
    { num: "03", name: "Decide",   meta: "Map · Roles · pick scenario",
      doneCheck: f => f.optimizationStatus === "done" && (f.visitedSteps.includes("map") || f.visitedSteps.includes("roles")) },
    { num: "04", name: "Explore",  meta: "Forecast · Scenarios · Case",
      doneCheck: f => ["forecast","scenarios","case"].some(s => f.visitedSteps.includes(s)) },
    { num: "05", name: "Export",   meta: "PDF · PPTX · CSV bundle",
      doneCheck: f => f.visitedSteps.includes("export") },
  ];

  return (
    <div className="pipeline-v2">
      {stages.map((s, i) => {
        const done = s.doneCheck(flow) && i !== currentStage;
        const curr = i === currentStage;
        const locked = i > 0 && !stages[i-1].doneCheck(flow) && !curr;
        const cls = "stage" + (done ? " done" : "") + (curr ? " current" : "") + (locked ? " locked" : "");
        return (
          <div key={s.num} className={cls}>
            <div className="stage-eyebrow">
              <span>{s.num}</span>
              {done && <span style={{ marginLeft: "auto", color: "var(--ok)" }}>✓ Complete</span>}
              {curr && <span style={{ marginLeft: "auto" }}>● Current</span>}
              {locked && <span style={{ marginLeft: "auto", color: "var(--ink-4)" }}>○ Locked</span>}
            </div>
            <div className="stage-name">{s.name}</div>
            <div className="stage-meta">{s.meta}</div>
          </div>
        );
      })}
    </div>
  );
}
window.PipelineV2 = PipelineV2;

// ════════════════════════════════════════════════════════════
// StepFooter — sticky bottom Back / Save / Next CTA
// ════════════════════════════════════════════════════════════
function StepFooter({ stepId, flow, onNavigate, gate, customNext, customBack }) {
  const idx = STEP_ORDER.indexOf(stepId);
  const prevId = idx > 0 ? STEP_ORDER[idx - 1] : null;
  const nextId = idx >= 0 && idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : null;
  const prevInfo = prevId ? findStepInfo(prevId) : null;
  const nextInfo = nextId ? findStepInfo(nextId) : null;

  const gateOk = gate ? gate.ok : true;
  const gateMsg = gate ? gate.msg : null;

  return (
    <div className="step-footer">
      <div className="step-footer-left">
        {prevInfo
          ? <button className="btn" onClick={() => (customBack || onNavigate)(prevId)}>
              <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><window.Icon name="arrow-right" size={12}/></span>
              Back · {prevInfo.name}
            </button>
          : <span></span>}
      </div>
      <div className="step-footer-center">
        <div className="step-progress">
          <span>Step {idx} of 13</span>
          <div className="dots">
            {STEP_ORDER.slice(1).map((s, i) => {
              const st = getStepStatus(s, flow);
              const cls = (s === stepId) ? "current" : (st === "done" ? "done" : "");
              return <span key={s} className={cls}></span>;
            })}
          </div>
        </div>
      </div>
      <div className="step-footer-right">
        <button className="btn ghost"><window.Icon name="check" size={12}/> Save draft</button>
        {!gateOk && gateMsg && (
          <span className="gate-tooltip"><window.Icon name="warn" size={11}/> {gateMsg}</span>
        )}
        {nextInfo
          ? <button className={"btn next" + (gateOk ? "" : " disabled")}
              disabled={!gateOk}
              onClick={() => gateOk && (customNext || onNavigate)(nextId)}>
              Next · {nextInfo.name} <window.Icon name="arrow-right" size={12}/>
            </button>
          : <button className="btn next"><window.Icon name="check" size={12}/> Done</button>}
      </div>
    </div>
  );
}
window.StepFooter = StepFooter;

// Page header helper used across all v2 pages — tier eyebrow + title + sub
function StepHeader({ tier, num, name, sub, badges }) {
  const tierMeta = tier === "A" ? { letter: "A", label: "Setup", cls: "A" }
                 : tier === "B" ? { letter: "B", label: "Decision", cls: "B" }
                 : tier === "C" ? { letter: "C", label: "Explore", cls: "C" }
                 : null;
  return (
    <div className="page-head">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {tierMeta && (
          <span className={"stage-pill " + tierMeta.cls}>
            <span className="pip-dot"></span>{tierMeta.letter} · {tierMeta.label}
          </span>
        )}
        <div className="page-eyebrow" style={{ margin: 0 }}>
          Step {num} of 13 · {name}
        </div>
        {badges}
      </div>
      <h1 className="page-title">{name}</h1>
      {sub && <div className="page-sub">{sub}</div>}
    </div>
  );
}
window.StepHeader = StepHeader;
