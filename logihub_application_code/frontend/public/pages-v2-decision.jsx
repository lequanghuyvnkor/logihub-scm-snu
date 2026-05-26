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
    return best ? best.id : "S2";
  });

  const scenario = window.SCENARIO_BY_ID[activeScenario] || window.SCENARIOS[2];
  const hubs = window.HUBS || [];
  const health = window.NETWORK_HEALTH || {};

  const ACTION_LABEL = { keep: "Keep", open: "Open", downgrade: "Downgrade", close: "Close" };
  const ACTION_CLS   = { keep: "healthy", open: "info", downgrade: "warn", close: "critical" };

  return (
    <div className="page">
      <window.StepHeader tier="B" num="05" name="Warehouse Map"
        sub="Review which sites to keep, open, downgrade or close based on the recommended scenario." />
      <window.PipelineV2 stepId="map" flow={flow} />

      <window.KPIStrip>
        <window.KPI label="Active hubs"     value={hubs.filter(h => scenario.selectedHubs?.includes(h.id)).length}            foot="Active in scenario" />
        <window.KPI label="Recommended"     value={scenario.id}      foot={scenario.name} />
        <window.KPI label="Monthly cost"    value={"₩" + window.fmtKRW(scenario.totalCost * 1_000_000)}
                                            foot="Optimized total" />
        <window.KPI label="Coverage"        value={window.fmtPct(scenario.coveragePct || 0.91)}
                                            foot="Within 150 km" />
        <window.KPI label="Overloaded hubs" value={scenario.overloaded || 0}
                                            foot="Utilization > 90%" />
      </window.KPIStrip>

      {/* Scenario selector */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">Scenario Selector</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(window.SCENARIOS || []).map(s => (
            <button key={s.id}
              className={"btn" + (s.id === activeScenario ? " next" : "")}
              onClick={() => setActiveScenario(s.id)}>
              {s.id} · {s.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column Layout: Map & Hub Table */}
      <div className="two-col">
        {/* Left: Map */}
        <window.Card title={`Network Allocation Map · ${scenario.name}`} sub="Dotted lines show region-to-hub assignments. Regions shaded by demand.">
          <div style={{ height: 440 }}>
            <window.KoreaMap
              showHubs={true}
              hubs={hubs.filter(h => scenario.selectedHubs?.includes(h.id))}
              flowLines={Object.entries(window.ALLOCATION[scenario.id] || {}).map(([regionId, hubId]) => ({
                regionId,
                hubId,
                weight: 0.6
              }))}
              highlightRegions={Object.fromEntries(window.REGIONS.map(r => [r.id, r.demand / 200000]))}
            />
          </div>
        </window.Card>

        {/* Right: Hub table */}
        <window.Card title={`Hub Network Details · ${scenario.name}`}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Hub ID","City","Type","Capacity (t)","Status","Peak Util"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontWeight: 600,
                                       color: "var(--text-2)", textTransform: "uppercase", fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hubs.map((hub) => {
                const isSelected = scenario.selectedHubs?.includes(hub.id);
                const action = isSelected ? "keep" : "close";
                const util = window.UTILIZATION[hub.id] ? window.UTILIZATION[hub.id][10] : 0.0; // November peak (index 10)
                
                return (
                  <tr key={hub.id} style={{ borderBottom: "1px solid var(--border-faint)", opacity: isSelected ? 1 : 0.45 }}>
                    <td style={{ padding: "6px 8px", fontFamily: "var(--mono)", fontWeight: 600 }}>{hub.id}</td>
                    <td style={{ padding: "6px 8px" }}>{window.REGION_BY_ID[hub.region]?.name || hub.region}</td>
                    <td style={{ padding: "6px 8px", color: "var(--text-2)", textTransform: "capitalize" }}>{hub.type}</td>
                    <td style={{ padding: "6px 8px" }}>{((hub.base || 0) + (hub.flex || 0)).toLocaleString()}</td>
                    <td style={{ padding: "6px 8px" }}>
                      <span className={"badge " + (isSelected ? "healthy" : "critical")}>
                        <span className="dot"></span>{isSelected ? "Active" : "Closed"}
                      </span>
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      {isSelected ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <window.Spark values={window.UTILIZATION[hub.id] || [0.5, 0.6, 0.7]}
                            width={50} height={16} color={util > 0.9 ? "#f59e0b" : "#22c55e"} />
                          <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: util > 0.9 ? "var(--danger)" : "var(--ok)" }}>{window.fmtPct(util)}</span>
                        </div>
                      ) : (
                        <span style={{ color: "var(--ink-4)", fontStyle: "italic" }}>Decommissioned</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </window.Card>
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
