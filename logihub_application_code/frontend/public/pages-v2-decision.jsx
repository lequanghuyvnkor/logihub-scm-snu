// LogiHub v2 — Tier B · Decision pages
// 04 Run Optimization, 05 Warehouse Map, 06 Warehouse Roles
const { useState: useStateDec } = React;

// ─── Helper: wraps a v1 page with a v2 StepFooter ──────────────────────────
function withV2Footer(V1Page, stepId, tier, num, name) {
  return function V2PageWrapper({ navigate, flow, setFlow }) {
    return (
      <div className="page">
        <window.StepHeader tier={tier} num={num} name={name} />
        <V1Page />
        <window.StepFooter stepId={stepId} onNavigate={navigate} flow={flow} />
      </div>
    );
  };
}

// ════════════════════════════════════════════════════════════
// 04 — RUN OPTIMIZATION (wraps v1 PageOptimize)
// ════════════════════════════════════════════════════════════
window.PageOptimize2 = withV2Footer(window.PageOptimize, "optimize", "B", "04", "Run Optimization");

// ════════════════════════════════════════════════════════════
// 05 — WAREHOUSE MAP
// ════════════════════════════════════════════════════════════
function PageWarehouseMap({ navigate, flow, setFlow }) {
  const [activeScenario, setActiveScenario] = useStateDec(() => {
    const best = window.SCENARIOS ? window.SCENARIOS.find(s => s.rank === 1) : null;
    return best ? best.id : 2;
  });

  const scenario = window.SCENARIO_BY_ID[activeScenario] || window.SCENARIOS[2];
  const hubs = window.HUBS || [];
  const alloc = window.ALLOCATION || {};
  const health = window.NETWORK_HEALTH || {};

  const ACTION_LABEL = { keep: "Keep", open: "Open", downgrade: "Downgrade", close: "Close" };
  const ACTION_CLS   = { keep: "healthy", open: "info", downgrade: "warn", close: "critical" };

  return (
    <div className="page">
      <window.StepHeader tier="B" num="05" name="Warehouse Map"
        sub="Review which sites to keep, open, downgrade or close based on the recommended scenario." />
      <window.PipelineV2 stepId="map" flow={flow} />

      <window.KPIStrip>
        <window.KPI label="Active hubs"     value={hubs.length}            foot="Candidate network" />
        <window.KPI label="Recommended"     value={"S" + scenario.id}      foot={scenario.name} />
        <window.KPI label="Monthly cost"    value={"₩" + window.fmtKRW(scenario.totalCost * 1_000_000)}
                                            foot="Optimized total" />
        <window.KPI label="Coverage"        value={window.fmtPct(scenario.coveragePct || 0.91)}
                                            foot="Within 150 km" />
        <window.KPI label="Overloaded hubs" value={health.overloadedHubs || 0}
                                            foot="Utilization > 90%" />
      </window.KPIStrip>

      {/* Scenario selector */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">Scenario</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(window.SCENARIOS || []).map(s => (
            <button key={s.id}
              className={"btn" + (s.id === activeScenario ? " next" : "")}
              onClick={() => setActiveScenario(s.id)}>
              S{s.id} · {s.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Hub table */}
      <div className="card">
        <div className="card-head">Hub Network · {scenario.name}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Hub ID","City","Type","Capacity (t)","Action","Utilisation"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontWeight: 600,
                                     color: "var(--text-2)", textTransform: "uppercase", fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hubs.map((hub, i) => {
              const action = (scenario.hubActions || {})[hub.id] || "keep";
              const util = alloc[hub.id] ? (alloc[hub.id].util || 0) : Math.random() * 0.4 + 0.5;
              return (
                <tr key={hub.id} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                  <td style={{ padding: "6px 8px", fontFamily: "var(--mono)", fontWeight: 600 }}>{hub.id}</td>
                  <td style={{ padding: "6px 8px" }}>{hub.city}</td>
                  <td style={{ padding: "6px 8px", color: "var(--text-2)", textTransform: "capitalize" }}>{hub.type}</td>
                  <td style={{ padding: "6px 8px" }}>{(hub.capacity || 0).toLocaleString()}</td>
                  <td style={{ padding: "6px 8px" }}>
                    <span className={"badge " + (ACTION_CLS[action] || "info")}>
                      <span className="dot"></span>{ACTION_LABEL[action] || action}
                    </span>
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    <window.Spark data={[0.5, 0.6, 0.65, util, util * 1.1, util * 1.05, util * 1.2]}
                      width={60} height={20} color={util > 0.9 ? "#f59e0b" : "#22c55e"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <window.StepFooter stepId="map" onNavigate={navigate} flow={flow} />
    </div>
  );
}
window.PageWarehouseMap = PageWarehouseMap;

// ════════════════════════════════════════════════════════════
// 06 — WAREHOUSE ROLES (wraps v1 PageRoles)
// ════════════════════════════════════════════════════════════
window.PageRoles2 = withV2Footer(window.PageRoles, "roles", "B", "06", "Warehouse Roles");
