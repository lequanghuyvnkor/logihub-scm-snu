// LogiHub v2 — Tier C · Explore pages
// 07 Forecast, 08 Events, 09 Scenarios, 10 Playbook, 11 Business Case, 12 Roadmap, 13 Export
const { useState: useStateExp } = React;

// ─── Helper: wraps a v1 page with a v2 StepFooter ──────────────────────────
function withV2FooterC(V1Page, stepId, num, name) {
  return function V2ExploreWrapper({ navigate, flow, setFlow }) {
    return (
      <div className="page">
        <window.StepHeader tier="C" num={num} name={name} />
        <V1Page />
        <window.StepFooter stepId={stepId} onNavigate={navigate} flow={flow} />
      </div>
    );
  };
}

// ════════════════════════════════════════════════════════════
// 07 — DEMAND FORECAST (wraps v1 PageForecast)
// ════════════════════════════════════════════════════════════
window.PageForecast2 = withV2FooterC(window.PageForecast, "forecast", "07", "Demand Forecast");

// ════════════════════════════════════════════════════════════
// 08 — SEASONAL EVENTS (wraps v1 PageEvents)
// ════════════════════════════════════════════════════════════
window.PageEvents2 = withV2FooterC(window.PageEvents, "events", "08", "Seasonal Events");

// ════════════════════════════════════════════════════════════
// 09 — SCENARIOS (9-scenario comparison matrix)
// ════════════════════════════════════════════════════════════
function PageScenarios({ navigate, flow, setFlow }) {
  const [selected, setSelected] = useStateExp(null);
  const scenarios = window.SCENARIOS || [];
  const best = scenarios.find(s => s.rank === 1) || scenarios[0];

  const COLS = ["ID","Name","Solver","Hubs","Cost / mo","Coverage","SLA","CO₂","Rank"];

  return (
    <div className="page">
      <window.StepHeader tier="C" num="09" name="Scenarios"
        sub="Compare all 9 solver scenarios side-by-side. Click a row to pin the detail panel, then click Next to carry it forward." />
      <window.PipelineV2 stepId="scenarios" flow={flow} />

      <window.KPIStrip>
        <window.KPI label="Scenarios run"   value={scenarios.length}          foot="S0 – S8 completed" />
        <window.KPI label="Recommended"     value={"S" + (best?.id ?? "—")}   foot={best?.name || "—"} />
        <window.KPI label="Best cost / mo"  value={"₩" + window.fmtKRW((best?.totalCost || 0) * 1_000_000)}
                                            foot="Optimized transport" />
        <window.KPI label="Best coverage"   value={window.fmtPct(best?.coveragePct || 0.91)}
                                            foot="Within 150 km" />
        <window.KPI label="Best CO₂"        value={((best?.co2 || 0) / 1000).toFixed(1) + "t"}
                                            foot="Monthly emissions" />
      </window.KPIStrip>

      {/* Comparison table */}
      <div className="card" style={{ overflowX: "auto" }}>
        <div className="card-head">9-Scenario Comparison Matrix</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {COLS.map(c => (
                <th key={c} style={{ textAlign: "left", padding: "6px 10px", fontWeight: 600,
                                     color: "var(--text-2)", textTransform: "uppercase", fontSize: 10 }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map(s => {
              const isSelected = selected === s.id;
              const isBest = s.rank === 1;
              return (
                <tr key={s.id}
                  onClick={() => setSelected(isSelected ? null : s.id)}
                  style={{
                    borderBottom: "1px solid var(--border-faint)",
                    cursor: "pointer",
                    background: isSelected ? "var(--surface-2)" : isBest ? "rgba(34,197,94,0.05)" : "transparent"
                  }}>
                  <td style={{ padding: "7px 10px", fontFamily: "var(--mono)", fontWeight: 700 }}>S{s.id}</td>
                  <td style={{ padding: "7px 10px" }}>
                    {isBest && <span className="badge healthy" style={{ marginRight: 6 }}>
                      <span className="dot"></span>Recommended
                    </span>}
                    {s.name}
                  </td>
                  <td style={{ padding: "7px 10px", color: "var(--text-2)" }}>{s.solver || s.tag}</td>
                  <td style={{ padding: "7px 10px" }}>{s.hubs}</td>
                  <td style={{ padding: "7px 10px", fontFamily: "var(--mono)" }}>
                    ₩{window.fmtKRW((s.totalCost || 0) * 1_000_000)}
                  </td>
                  <td style={{ padding: "7px 10px" }}>
                    <span className={"badge " + ((s.coveragePct || 0.9) >= 0.9 ? "healthy" : "warn")}>
                      {window.fmtPct(s.coveragePct || 0.9)}
                    </span>
                  </td>
                  <td style={{ padding: "7px 10px" }}>
                    <span className={"badge " + ((s.slaPct || 0.95) >= 0.95 ? "healthy" : "warn")}>
                      {window.fmtPct(s.slaPct || 0.95)}
                    </span>
                  </td>
                  <td style={{ padding: "7px 10px", color: "var(--text-2)" }}>
                    {((s.co2 || 0) / 1000).toFixed(1)}t
                  </td>
                  <td style={{ padding: "7px 10px", fontWeight: 700 }}>#{s.rank}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail panel for selected scenario */}
      {selected !== null && (() => {
        const s = window.SCENARIO_BY_ID[selected];
        if (!s) return null;
        return (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-head">S{s.id} · {s.name} — Detail</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: 8 }}>
              {[
                ["Solver",       s.solver || s.tag],
                ["Hubs selected",s.hubs],
                ["Total cost/mo","₩" + window.fmtKRW((s.totalCost || 0) * 1_000_000)],
                ["Coverage",     window.fmtPct(s.coveragePct || 0.9)],
                ["SLA",          window.fmtPct(s.slaPct || 0.95)],
                ["CO₂ / mo",     ((s.co2 || 0) / 1000).toFixed(1) + " t"],
                ["Lead time",    (s.leadTime || 12) + " h avg"],
                ["Rank",         "#" + s.rank],
                ["Tag",          s.tag],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "var(--surface-1)", borderRadius: 6, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontWeight: 600, fontFamily: "var(--mono)", fontSize: 13 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <window.StepFooter stepId="scenarios" onNavigate={navigate} flow={flow} />
    </div>
  );
}
window.PageScenarios = PageScenarios;

// ════════════════════════════════════════════════════════════
// 10 — EVENT PLAYBOOK (wraps v1 PagePlaybook)
// ════════════════════════════════════════════════════════════
window.PagePlaybook2 = withV2FooterC(window.PagePlaybook, "playbook", "10", "Event Playbook");

// ════════════════════════════════════════════════════════════
// 11 — BUSINESS CASE (wraps v1 PageBusinessCase)
// ════════════════════════════════════════════════════════════
window.PageBusinessCase2 = withV2FooterC(window.PageBusinessCase, "case", "11", "Business Case");

// ════════════════════════════════════════════════════════════
// 12 — ROADMAP (wraps v1 PageRoadmap)
// ════════════════════════════════════════════════════════════
window.PageRoadmap2 = withV2FooterC(window.PageRoadmap, "roadmap", "12", "Roadmap");

// ════════════════════════════════════════════════════════════
// 13 — EXPORT (wraps v1 PageExport)
// ════════════════════════════════════════════════════════════
window.PageExport2 = withV2FooterC(window.PageExport, "export", "13", "Export");
