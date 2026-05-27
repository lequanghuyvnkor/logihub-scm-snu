// LogiHub PRD v1.0 — Report pages: Diagnosis, Warehouse Roles, Event Playbook, Business Case, Roadmap, Export
const { useState: useStateR } = React;

// ════════════════════════════════════════════════════════════
// 08 — NETWORK DIAGNOSIS (F-10)
// ════════════════════════════════════════════════════════════
function PageDiagnosis() {
  const d = window.DIAGNOSIS_V2;
  const burns = window.OWNED_WAREHOUSES.filter(w => w.flag === "burns-money");
  const totalOwned = window.OWNED_WAREHOUSES.length;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">08 · Network Diagnosis · F-10</div>
        <h1 className="page-title">What's wrong with the current network?</h1>
        <div className="page-sub">
          Four classic problems: overloaded warehouses (load_ratio), delivery blind zones, money-burning warehouses
          (cost/m³ ≫ median + usage ≪ median) and congested corridors.
        </div>
      </div>

      <window.KPIStrip>
        <window.KPI label="Network health"   value="64" unit="/ 100" foot={<><span className="badge warn"><span className="dot"></span>Improvement possible</span></>}/>
        <window.KPI label="Bursting (>130%)" value={d.loadBuckets[0].count} foot={<><span className="badge danger"><span className="dot"></span>WH-BSN-01 · 104%</span></>}/>
        <window.KPI label="Overflow (100–130%)"  value={d.loadBuckets[1].count} foot="Nov peak window"/>
        <window.KPI label="Blind zones"        value={d.blindZones.length} foot="Provinces breaching SLA"/>
        <window.KPI label="Money-burning WHs"  value={burns.length} foot={"₩" + window.fmtKRW(burns.reduce((a,b) => a + b.fixedCostKRW, 0)) + " saving potential"}/>
        <window.KPI label="Congested corridors" value={d.corridors.length} foot="≥ 97% forecast utilisation"/>
      </window.KPIStrip>

      <window.Card title="Load-ratio distribution · 13 warehouses (6 owned + 7 ranked in directory)"
        sub="load_ratio = demand_peak / capacity">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {d.loadBuckets.map(b => (
            <div key={b.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14, background: "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: b.color }}></span>
                <span style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{b.en}</span>
              </div>
              <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600, marginTop: 6 }}>{b.name}</div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{b.range}</div>
              <div className="mono" style={{ fontSize: 32, fontWeight: 600, color: "var(--ink)", marginTop: 10, letterSpacing: "-0.02em" }}>{b.count}</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>warehouses</div>
            </div>
          ))}
        </div>
      </window.Card>

      <div className="two-col">
        <window.Card title="Blind zones · provinces violating SLA"
          sub="Each province → nearest warehouse → compared to SLA → flagged if exceeded"
          actions={<button className="btn"><window.Icon name="filter"/></button>}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Province</th>
                <th>Nearest WH</th>
                <th className="num">Drive hrs</th>
                <th className="num">% late</th>
                <th>SLA gap</th>
              </tr>
            </thead>
            <tbody>
              {d.blindZones.map((z, i) => (
                <tr key={i} className="hoverable">
                  <td style={{ color: "var(--ink)", fontWeight: 500 }}>{window.REGION_BY_ID[z.region].name}</td>
                  <td style={{ fontSize: 12 }}>{z.nearest}</td>
                  <td className="num">{z.driveHrs.toFixed(1)}</td>
                  <td className="num" style={{ color: z.pctLate > 0.10 ? "var(--danger)" : "var(--warn)", fontWeight: 600 }}>
                    {window.fmtPct(z.pctLate)}
                  </td>
                  <td><span className={"badge " + (z.pctLate > 0.10 ? "danger" : "warn")}><span className="dot"></span>{z.slaGap}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>

        <window.Card title="Money-burning warehouses"
          sub="Cost/m³ > 150% median AND usage < 70% median">
          <table className="tbl">
            <thead><tr><th>Warehouse</th><th>Reason</th><th className="num">Saving / yr</th></tr></thead>
            <tbody>
              {d.burnsMoney.map((b, i) => {
                const wh = window.OWNED_WAREHOUSES.find(w => w.code === b.code);
                return (
                  <tr key={i} className="hoverable">
                    <td>
                      <div style={{ color: "var(--ink)", fontWeight: 500 }}>{b.code}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{wh?.addr}</div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--ink-2)" }}>{b.reason}</td>
                    <td className="num" style={{ color: "var(--ok)", fontWeight: 600 }}>₩{window.fmtKRW(b.saving)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </window.Card>
      </div>

      <window.Card title="Corridor congestion"
        sub="Forecast volume exceeds corridor capacity · alternate-corridor recommended">
        <table className="tbl">
          <thead>
            <tr>
              <th>Corridor</th>
              <th className="num">Forecast util</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {d.corridors.map(c => {
              const corridor = window.CORRIDORS.find(cc => cc.id === c.id);
              return (
                <tr key={c.id} className="hoverable">
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      <span style={{ color: "var(--ink-2)" }}>{window.REGION_BY_ID[corridor.origin].name}</span>
                      <window.Icon name="arrow-right" size={12}/>
                      <span style={{ color: "var(--ink)" }}>{window.REGION_BY_ID[corridor.dest].name}</span>
                    </div>
                  </td>
                  <td className="num" style={{ color: c.forecastUtil >= 1 ? "var(--danger)" : "var(--warn)", fontWeight: 600 }}>
                    {window.fmtPct(c.forecastUtil)}
                  </td>
                  <td style={{ fontSize: 12 }}>{c.recommend}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </window.Card>

      <window.RecPanel
        what="4 independent problems, 4 separate fixes — none of them block the engine."
        why="Bursting (Busan) is driven by November peak volume + 16.4k m³ capacity being insufficient. The Jeju blind zone has no warehouse within a 5-hour drive. WH-GWJ-01 burns money because Gwangju demand is small but its cost stays high."
        action="Open Anseong DC (Plan P2 selection); lease a Blind-zone Relief station on Jeju (see Roles); decommission WH-GWJ-01 in T+1–2 (see Roadmap)."
        impact="Potential savings of ₩508M / yr from diagnosis alone (excluding other cost optimisation inside P2)."/>
    </div>
  );
}
window.PageDiagnosis = PageDiagnosis;

// ════════════════════════════════════════════════════════════
// 09 — WAREHOUSE ROLES (F-11)
// ════════════════════════════════════════════════════════════
function PageRoles() {
  const [activeScenario, setActiveScenario] = useStateR(() => {
    const best = window.SCENARIOS ? window.SCENARIOS.find(s => s.rank === 1) : null;
    return best ? best.id : "S2";
  });
  const [active, setActive] = useStateR(null); // active role

  const scenario = window.SCENARIO_BY_ID[activeScenario] || window.SCENARIOS[2];
  const hubs = window.HUBS || [];

  // Classify warehouses dynamically based on active scenario
  const selectedHubIds = scenario.selectedHubs || [];
  
  // Find the National Anchor: the active warehouse with the maximum capacity
  let nationalAnchorId = null;
  let maxCapacity = -1;
  hubs.forEach(h => {
    if (selectedHubIds.includes(h.id)) {
      const cap = (h.base || 0) + (h.flex || 0);
      if (cap > maxCapacity) {
        maxCapacity = cap;
        nationalAnchorId = h.id;
      }
    }
  });

  const roles = [
    {
      id: "national",
      name: "National Anchor",
      en: "National Anchor",
      rule: "P1 output — largest warehouse, nationwide service",
      whs: nationalAnchorId ? [nationalAnchorId] : []
    },
    {
      id: "regional",
      name: "Regional Hub",
      en: "Regional Hub",
      rule: "P2 output — warehouse covering a macro-region",
      whs: hubs.filter(h => selectedHubIds.includes(h.id) && h.id !== nationalAnchorId && (h.type === "regional" || h.type === "metro")).map(h => h.id)
    },
    {
      id: "cold",
      name: "Cold Distribution Station",
      en: "Cold Distribution",
      rule: "Cold + FNB > 50% & top 30% capacity",
      whs: hubs.filter(h => selectedHubIds.includes(h.id) && (h.type === "port" || h.type === "crossdock" || h.name.toLowerCase().includes("cold"))).map(h => h.id)
    },
    {
      id: "secure",
      name: "Security Bay",
      en: "Security Bay",
      rule: "Electronics + premium > 60% with high-security",
      whs: hubs.filter(h => selectedHubIds.includes(h.id) && h.type === "secure").map(h => h.id)
    },
    {
      id: "lastmile",
      name: "Last-mile Relief",
      en: "Last-mile Relief",
      rule: "Small site within 30 km urban radius",
      whs: hubs.filter(h => selectedHubIds.includes(h.id) && (h.type === "launch" || (h.base || 0) < 10000) && h.id !== nationalAnchorId).map(h => h.id)
    },
    {
      id: "port",
      name: "Port Trans-shipment",
      en: "Port Trans-shipment",
      rule: "< 50 km to port & top 50% capacity",
      whs: hubs.filter(h => selectedHubIds.includes(h.id) && (h.type === "port" || h.region === "incheon" || h.region === "busan")).map(h => h.id)
    },
    {
      id: "relief",
      name: "Blind-zone Relief",
      en: "Blind-zone Relief",
      rule: "Newly-leased site covering a blind zone",
      whs: hubs.filter(h => selectedHubIds.includes(h.id) && (h.region === "jeju" || h.region === "gangwon" || h.region === "jeonnam")).map(h => h.id)
    },
    {
      id: "standby",
      name: "Standby Warehouse",
      en: "Standby (downgrade)",
      rule: "Money-burning warehouse downgraded; opens only when load > 95%",
      whs: hubs.filter(h => !selectedHubIds.includes(h.id)).map(h => h.id)
    }
  ];

  const anchorHub = hubs.find(h => h.id === nationalAnchorId);
  const regionalHubsList = hubs.filter(h => roles.find(r => r.id === "regional").whs.includes(h.id));
  const regionalHubNames = regionalHubsList.length > 0 
    ? regionalHubsList.map(h => h.name).join(", ")
    : "No other regional hubs";
  const standbyCount = roles.find(r => r.id === "standby").whs.length;

  const recWhat = anchorHub 
    ? `${anchorHub.name} becomes the National Anchor; ${regionalHubNames} become Regional Hubs.`
    : "No hubs active in this scenario.";
  
  const recWhy = `Engine output for ${scenario.name}: National Anchor has the largest capacity (${anchorHub ? ((anchorHub.base || 0) + (anchorHub.flex || 0)).toLocaleString() : 0} t) and serves as central node. Regional Hubs cover their macro-regions.`;
  
  const recAction = `Place ${standbyCount} inactive warehouses in Standby — only open them during peak season overflow.`;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">09 · Warehouse Roles · F-11</div>
        <h1 className="page-title">Each warehouse plays a distinct role</h1>
        <div className="page-sub">
          Eight standard roles — the engine auto-assigns every warehouse into one (or several) roles based on capacity,
          certifications, location, and the output of the active scenario optimization.
        </div>
      </div>

      {/* Scenario selector */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">Scenario Selector</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(window.SCENARIOS || []).map(s => (
            <button key={s.id}
              className={"btn" + (s.id === activeScenario ? " next" : "")}
              onClick={() => {
                setActiveScenario(s.id);
                setActive(null);
              }}>
              {s.id} · {s.tag || s.name}
            </button>
          ))}
        </div>
      </div>

      <window.KPIStrip>
        <window.KPI label="Roles defined"         value="8" foot="Each role has a specific rule"/>
        <window.KPI label="Warehouses classified" value={hubs.length} foot={`${hubs.filter(h => selectedHubIds.includes(h.id)).length} Active + ${hubs.filter(h => !selectedHubIds.includes(h.id)).length} Inactive`}/>
        <window.KPI label="National anchors"      value={roles.find(r => r.id === "national").whs.length} foot="Dynamic max-capacity anchor"/>
        <window.KPI label="Regional hubs"         value={roles.find(r => r.id === "regional").whs.length} foot="Macro-region coverage hubs"/>
        <window.KPI label="Standby (downgrade)"   value={roles.find(r => r.id === "standby").whs.length}
          foot={<><span className="badge danger"><span className="dot"></span>{standbyCount} standby sites</span></>}/>
      </window.KPIStrip>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {roles.map(r => (
          <div key={r.id} onClick={() => setActive(active === r.id ? null : r.id)}
            className="scenario-card"
            style={{ ...(active === r.id ? { borderColor: "var(--accent)", boxShadow: "0 0 0 3px var(--accent-soft)" } : {}) }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="sc-id">{r.id.toUpperCase()}</span>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{r.whs.length} WH</span>
            </div>
            <div className="sc-name">{r.name}</div>
            <div className="sc-desc">{r.en}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.4, marginTop: 4 }}>{r.rule}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <window.Card title="Assignments matrix" sub={`Columns = roles · ✓ = warehouse assigned · Active Scenario: ${scenario.name}`}>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl" style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th>Warehouse</th>
                  {roles.map(r => (
                    <th key={r.id} style={{ writingMode: "vertical-lr", textOrientation: "mixed", padding: "20px 4px", fontSize: 10 }}>
                      {r.en}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hubs.map(w => (
                  <tr key={w.id} className="hoverable" style={{ opacity: selectedHubIds.includes(w.id) ? 1 : 0.6 }}>
                    <td>
                      <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{w.id}</span>
                      <span style={{ marginLeft: 8, fontSize: 10 }} className={"badge " + (selectedHubIds.includes(w.id) ? "healthy" : "critical")}>
                        {selectedHubIds.includes(w.id) ? "Active" : "Standby"}
                      </span>
                      <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{w.name}</div>
                    </td>
                    {roles.map(r => {
                      const assigned = r.whs.includes(w.id);
                      return (
                        <td key={r.id} className="num"
                          style={{ background: assigned ? "var(--accent-soft)" : "transparent" }}>
                          {assigned && <window.Icon name="check" size={14}/>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </window.Card>

        <window.RecPanel
          what={recWhat}
          why={recWhy}
          action={recAction}
          impact="Every warehouse has a clear operator rule — no more 'do-anything warehouses' (the root cause behind Diagnosis bullet 3)."/>
      </div>
    </div>
  );
}
window.PageRoles = PageRoles;

// ════════════════════════════════════════════════════════════
// 10 — EVENT PLAYBOOK (F-12 · US-12)
// ════════════════════════════════════════════════════════════
function PagePlaybook() {
  const [activeIdx, setActiveIdx] = useStateR(0);
  const co = window.COMPANY;
  const industry = window.INDUSTRY_BY_ID[co.industry];
  const book = window.PLAYBOOKS[activeIdx];
  const act = (id) => window.ACTION_BY_ID[id];

  return (
    <div className="page">
      <window.KPIStrip>
        <window.KPI label="Industry filter" value={industry.en} foot="Only prints relevant events"/>
        <window.KPI label="Playbooks generated" value={window.PLAYBOOKS.length} foot="Of 30+ events on file"/>
        <window.KPI label="Next peak" value="11.11" foot={<><span className="badge danger"><span className="dot"></span>+92% fashion + electronics</span></>}/>
        <window.KPI label="Lead time" value="6" unit="weeks" foot="Earliest activation window"/>
      </window.KPIStrip>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {window.PLAYBOOKS.map((p, i) => (
          <button key={p.eventId} onClick={() => setActiveIdx(i)}
            style={{
              padding: "10px 14px", borderRadius: 10,
              border: "1px solid " + (i === activeIdx ? "var(--accent)" : "var(--border)"),
              background: i === activeIdx ? "var(--accent-soft)" : "var(--surface)",
              cursor: "pointer", display: "flex", flexDirection: "column", gap: 2,
              minWidth: 200,
            }}>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{p.start}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{p.name}</span>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.uplift}</span>
          </button>
        ))}
      </div>

      <window.Card title={book.name + " · " + book.start + " → " + book.end} sub={"Affected group: " + book.headGroup + " · Uplift " + book.uplift}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
          <div>
            <div className="card-sub" style={{ marginBottom: 8 }}>Status at peak</div>
            <div style={{ background: "var(--warn-soft)", padding: "10px 14px", borderRadius: 8, fontSize: 13, color: "var(--ink)",
              border: "1px solid color-mix(in oklch, var(--warn) 30%, transparent)", fontFamily: "var(--font-mono)" }}>
              <window.Icon name="warn" size={14}/> {book.peakStatus}
            </div>

            <div className="card-sub" style={{ marginTop: 18, marginBottom: 10 }}>3-step action plan</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {book.steps.map((s, i) => {
                const a = act(s.action);
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", gap: 12, alignItems: "flex-start",
                    padding: 14, background: "var(--surface-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--ink)", color: "#fff",
                      display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>{a.id}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{a.kind}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{a.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{a.en}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.5 }}>{s.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="card-sub" style={{ marginBottom: 10 }}>Retreat rule · exit emergency mode</div>
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14, background: "var(--surface)" }}>
              <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trigger</div>
              <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, marginTop: 2 }}>{book.retreat.trigger}</div>
              <div className="divider" style={{ margin: "10px 0" }}></div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Monitoring</div>
              <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, marginTop: 2 }}>{book.retreat.monitorDays} days</div>
              <div className="divider" style={{ margin: "10px 0" }}></div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Threshold</div>
              <div style={{ fontSize: 13, color: "var(--ink)", marginTop: 2, lineHeight: 1.5 }}>{book.retreat.threshold}</div>
            </div>

            <div className="card-sub" style={{ marginTop: 18, marginBottom: 8 }}>Related events</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.6 }}>
              A playbook is emitted only when the event passes the industry filter AND uplift &gt; +15% or disruption &lt; −20%.
              Events outside the filter are still computed by the engine but no playbook is generated.
            </div>
          </div>
        </div>
      </window.Card>

    </div>
  );
}
window.PagePlaybook = PagePlaybook;

// ════════════════════════════════════════════════════════════
// 11 — BUSINESS CASE (F-13 · US-10)
// ════════════════════════════════════════════════════════════
function PageBusinessCase() {
  const roi = window.ROI_V2;
  const rec = window.PLAN_BY_ID[roi.recommendedPlan];

  const recTier = roi.recommendationCode === "go" ? "Deploy now"
                : roi.recommendationCode === "pilot" ? "Pilot one region first"
                : "Reconsider";
  const recTone = roi.recommendationCode === "go" ? "healthy" : roi.recommendationCode === "pilot" ? "warn" : "danger";

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">11 · Business Case · F-13 · US-10</div>
        <h1 className="page-title">Is it worth deploying?</h1>
        <div className="page-sub">
          Convert the technical recommendation into financial numbers for the boardroom — revenue loss avoided,
          reputation loss avoided, ROI ratio, payback. Automatic recommendation against the 3 thresholds in PRD §F-13.
        </div>
      </div>

      <window.KPIStrip>
        <window.KPI label="Annual value"   value={"₩" + window.fmtKRW(roi.annual_value)}
          foot="Cancellation + reputation savings"/>
        <window.KPI label="Incremental fixed cost" value={"₩" + window.fmtKRW(roi.incremental_fixed_cost)}
          foot="Hub setup + WMS + transition"/>
        <window.KPI label="ROI ratio" value={roi.ROI_ratio.toFixed(2)} unit="×"
          delta={<>{recTier}</>} deltaKind="up"
          foot={"Tier: ROI " + (roi.ROI_ratio > 2.5 ? "> 2.5" : roi.ROI_ratio > 1.5 ? "1.5–2.5" : "< 1.5")}/>
        <window.KPI label="Payback period" value={roi.payback_months} unit="months"
          foot={<><span className="badge healthy"><span className="dot"></span>≤ 12 mo target</span></>}/>
        <window.KPI label="Recommendation" value={recTier}
          foot={<><span className={"badge " + recTone}><span className="dot"></span>Pilot region: {roi.pilotRegion}</span></>}/>
      </window.KPIStrip>

      <div className="section-grid">
        <window.Card title="Loss decomposition"
          sub="Revenue + reputation losses being avoided · the engine's case for change">
          <table className="tbl">
            <thead>
              <tr><th>Loss type</th><th className="num">Formula</th><th className="num">Annual value</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ color: "var(--ink)", fontWeight: 500 }}>Revenue loss</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>orders_delayed × cancellation_rate × avg_order_value</div>
                </td>
                <td className="num mono" style={{ fontSize: 11 }}>
                  {window.fmtNum(roi.ordersDelayedPerYear)} × {window.fmtPct(roi.cancellationRate)} × ₩{window.fmtNum(roi.avgOrderValueKRW)}
                </td>
                <td className="num" style={{ color: "var(--danger)", fontWeight: 600 }}>₩{window.fmtKRW(roi.revenue_loss)}</td>
              </tr>
              <tr>
                <td>
                  <div style={{ color: "var(--ink)", fontWeight: 500 }}>Reputation loss</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>revenue_loss × reputation_multiplier (size-band auto)</div>
                </td>
                <td className="num mono" style={{ fontSize: 11 }}>
                  ₩{window.fmtKRW(roi.revenue_loss)} × {window.SIZE_BY_ID[window.COMPANY.size].repMult.toFixed(2)}
                </td>
                <td className="num" style={{ color: "var(--danger)", fontWeight: 600 }}>₩{window.fmtKRW(roi.reputation_loss)}</td>
              </tr>
              <tr style={{ background: "var(--surface-2)" }}>
                <td style={{ color: "var(--ink)", fontWeight: 600 }}>Annual value</td>
                <td className="num mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>revenue_loss + reputation_loss + cost_saving</td>
                <td className="num" style={{ color: "var(--ok)", fontWeight: 700, fontSize: 14 }}>₩{window.fmtKRW(roi.annual_value)}</td>
              </tr>
            </tbody>
          </table>

          <div className="divider"></div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 4 }}>
            <RoiTier code="go"    label="Deploy now"                    cond="ROI > 2.5×"     active={roi.recommendationCode === "go"}/>
            <RoiTier code="pilot" label="Pilot one region first"     cond="ROI 1.5 – 2.5×" active={roi.recommendationCode === "pilot"}/>
            <RoiTier code="hold"  label="Reconsider"                    cond="ROI < 1.5×"     active={roi.recommendationCode === "hold"}/>
          </div>
        </window.Card>

        <window.RecPanel
          what={"ROI " + roi.ROI_ratio.toFixed(2) + "× · payback " + roi.payback_months + " months — falling in the 'pilot first' band."}
          why="Annual value comes from three sources: 1) logistics-cost reduction ₩4.31B; 2) revenue loss avoided ₩1.83B; 3) reputation loss avoided ₩641M. Total ₩6.78B / yr."
          action={"Pilot " + roi.pilotRegion + " for 8 weeks (T+5 – T+6 of the roadmap). Measure: cost/m³ down 12%, lead time ≤ 24h."}
          impact="After a successful pilot, scale nationally at T+7 – T+8. If the pilot misses its KPIs, retreat to a more resilient plan."/>
      </div>

      <window.Card title="Cumulative cash impact · 24 months · Recommended Plan vs current"
        sub="Break-even at month 8 · cumulative value +₩6.5B after 24 months">
        <PaybackChart paybackMonths={roi.payback_months}
          monthlySaving={roi.annual_value / 12}
          oneTimeCost={roi.incremental_fixed_cost}/>
      </window.Card>

      <div className="two-col">
        <window.Card title="Comparison · Current vs Recommended" sub="₩ million per year">
          <CompareBars/>
        </window.Card>

        <window.Card title="Implementation risk" sub="What we accept by choosing this plan">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { kind: "warn", k: "Pilot duration",  v: "8 weeks " + roi.pilotRegion, note: "Risk: insufficient signal" },
              { kind: "warn", k: "WMS rollout",     v: "Multiple sites simultaneous",note: "Risk: integration delay" },
              { kind: "ok",   k: "Budget cap",      v: "₩6.0B / yr respected",       note: "Stays within budget" },
              { kind: "ok",   k: "Service SLA",     v: "≥ 90% within 24h",           note: "Acceptance criteria met" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span className={"badge " + (r.kind === "ok" ? "healthy" : "warn")} style={{ marginTop: 1, minWidth: 50, justifyContent: "center" }}>
                  <span className="dot"></span>{r.kind === "ok" ? "Safe" : "Watch"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ color: "var(--ink)", fontWeight: 500 }}>{r.k}</span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{r.v}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.note}</div>
                </div>
              </div>
            ))}
          </div>
        </window.Card>
      </div>
    </div>
  );
}

function RoiTier({ code, label, cond, active }) {
  return (
    <div style={{
      padding: "12px 14px", borderRadius: 10,
      border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
      background: active ? "var(--accent-soft)" : "var(--surface)",
      boxShadow: active ? "0 0 0 3px color-mix(in oklch, var(--accent) 12%, transparent)" : "none",
    }}>
      <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{cond}</div>
      <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600, marginTop: 4 }}>{label}</div>
      {active && <div className="mono" style={{ fontSize: 11, color: "var(--accent-ink)", marginTop: 6 }}>↑ Current tier</div>}
    </div>
  );
}

function CompareBars() {
  const rows = [
    { k: "Transport",   curr: 2_820, rec: 2_510 },
    { k: "Fixed",       curr: 1_400, rec: 1_180 },
    { k: "Handling",    curr:   490, rec:   470 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {rows.map(r => {
        const max = Math.max(r.curr, r.rec);
        const delta = r.rec - r.curr;
        return (
          <div key={r.k}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--ink-2)" }}>{r.k}</span>
              <span className="mono" style={{ color: delta < 0 ? "var(--ok)" : "var(--ink-3)" }}>
                {delta < 0 ? "−" : "+"}₩{Math.abs(delta).toLocaleString()}M
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 60px", gap: 6, alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: "var(--ink-3)" }}>Now</span>
              <div className="bar"><span style={{ width: (r.curr/max*100)+"%", background: "var(--ink-3)" }}></span></div>
              <span className="mono" style={{ fontSize: 11, textAlign: "right" }}>₩{r.curr.toLocaleString()}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 60px", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--accent)" }}>Rec</span>
              <div className="bar"><span style={{ width: (r.rec/max*100)+"%", background: "var(--accent)" }}></span></div>
              <span className="mono" style={{ fontSize: 11, textAlign: "right" }}>₩{r.rec.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PaybackChart({ paybackMonths, monthlySaving, oneTimeCost }) {
  const W = 720, H = 220;
  const months = 24;
  const data = [];
  for (let i = 0; i <= months; i++) {
    const cumul = -oneTimeCost + monthlySaving * i;
    data.push({ m: i, v: cumul / 1_000_000 });
  }
  const min = Math.min(...data.map(d => d.v)) * 1.15;
  const max = Math.max(...data.map(d => d.v)) * 1.15;
  const px = (m) => (m / months) * W;
  const py = (v) => H - ((v - min) / (max - min)) * (H - 30) - 10;
  const zeroY = py(0);
  const pathD = data.map((d, i) => (i === 0 ? "M" : "L") + px(d.m) + " " + py(d.v)).join(" ");
  return (
    <svg className="svg-chart" viewBox={`0 0 ${W} ${H + 24}`} preserveAspectRatio="none">
      <line x1="0" x2={W} y1={zeroY} y2={zeroY} stroke="#D2D5CE" strokeWidth="0.8"/>
      <line x1={px(paybackMonths)} x2={px(paybackMonths)} y1={10} y2={H - 5} stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="3 3"/>
      <rect x={px(paybackMonths) - 38} y={6} width={76} height={18} rx={3} fill="var(--accent-soft)"/>
      <text x={px(paybackMonths)} y={18} fontSize="10.5" textAnchor="middle" fill="var(--accent-ink)" fontFamily="JetBrains Mono">Payback · M{paybackMonths}</text>
      <path d={pathD} stroke="var(--ink)" strokeWidth="1.8" fill="none"/>
      <circle cx={px(paybackMonths)} cy={zeroY} r={5} fill="var(--accent)" stroke="#fff" strokeWidth="2"/>
      {[0, 6, 12, 18, 24].map(m => (
        <text key={m} x={px(m)} y={H + 16} fontSize="10" textAnchor="middle" fill="#6B7480" fontFamily="JetBrains Mono">M{m}</text>
      ))}
      <text x={px(months) - 4} y={py(data[months].v) - 6} fontSize="11" textAnchor="end" fill="var(--ok)" fontFamily="JetBrains Mono" fontWeight="600">
        +₩{window.fmtKRW(monthlySaving * months - oneTimeCost)} @ M24
      </text>
    </svg>
  );
}
window.PageBusinessCase = PageBusinessCase;

// ════════════════════════════════════════════════════════════
// 12 — ROADMAP (F-14)
// ════════════════════════════════════════════════════════════
function PageRoadmap() {
  const phases = window.ROADMAP_V2;
  const totalBudget = phases.reduce((a, p) => a + p.budgetKRW, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">12 · Implementation Roadmap · F-14</div>
        <h1 className="page-title">12 – 18 month implementation roadmap</h1>
        <div className="page-sub">
          Each phase includes a task list, suggested owner, budget estimate and measurement KPI.
          Total deployment budget ≤ incremental_fixed_cost from the Business Case.
        </div>
      </div>

      <window.KPIStrip>
        <window.KPI label="Phases" value={phases.length} foot="T+1–2 → T+9+"/>
        <window.KPI label="Total budget" value={"₩" + window.fmtKRW(totalBudget)} foot="≤ ₩4.5B fixed cap"/>
        <window.KPI label="Time to pilot" value="5" unit="months" foot="Phase R3 — Seoul + Gyeonggi"/>
        <window.KPI label="National rollout" value="8" unit="months" foot="Phase R4 — D-day for WH-GWJ-01"/>
        <window.KPI label="Continuous mode" value="Q+" foot="Phase R5 — quarterly 2-page report"/>
      </window.KPIStrip>

      <window.Card title="Phase timeline · Gantt-style" sub="Click a phase below for owner + budget + KPI">
        <Gantt phases={phases}/>
      </window.Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {phases.map((p, i) => (
          <div key={p.id} style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)",
            padding: 16, display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr", gap: 24, alignItems: "start" }}>
            
            {/* Col 1: Identity & Context */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>{p.id}</span>
                <span className="badge outline" style={{ fontSize: 10 }}>Phase {i + 1}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.phase}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{p.theme}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{p.en}</div>
            </div>

            {/* Col 2: Task Checklist */}
            <div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Key Tasks</div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {p.tasks.map((t, j) => (
                  <li key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "var(--ink)", lineHeight: 1.4 }}>
                    <span style={{ color: "var(--accent)", marginTop: 2 }}><window.Icon name="check" size={12}/></span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, borderLeft: "1px solid var(--border)", paddingLeft: 24 }}>
              <div>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Owner</div>
                <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500, marginTop: 2 }}>{p.owner}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Budget</div>
                <div className="mono" style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, marginTop: 2 }}>₩{window.fmtKRW(p.budgetKRW)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>KPI / Success Metric</div>
                <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500, marginTop: 2, lineHeight: 1.4 }}>{p.kpi}</div>
              </div>
            </div>

          </div>
        ))}
      </div>

      <window.RecPanel
        what="5 phases · 18-month horizon · total budget ₩2.98B — within the ₩4.5B incremental cap."
        why="The roadmap locks the phase-1 budget (Legal & People · ₩420M) under COO + HR + Legal — ensuring warehouse contracts and people are ready before IT infra (T+3 – T+4)."
        action="Start T+1 immediately after the board approves the Business Case. Phase R3 (Pilot) must be approved before the national rollout."
        impact="Phase R5 produces the 2-page quarterly update (US-14) — keeping the engine fed by live operational data after go-live."/>
    </div>
  );
}

function Gantt({ phases }) {
  const monthsTotal = 18;
  const phaseTime = [
    { start: 0,  end: 2  },
    { start: 2,  end: 4  },
    { start: 4,  end: 6  },
    { start: 6,  end: 8  },
    { start: 8,  end: 18 },
  ];
  const colors = ["oklch(56% 0.11 205)", "oklch(60% 0.13 145)", "oklch(68% 0.14 70)", "oklch(60% 0.13 320)", "oklch(54% 0.10 280)"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, alignItems: "center" }}>
        <div></div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${monthsTotal}, 1fr)`, gap: 1 }}>
          {Array.from({ length: monthsTotal }).map((_, i) => (
            <div key={i} className="mono" style={{ fontSize: 9.5, color: "var(--ink-4)", textAlign: "center" }}>T+{i + 1}</div>
          ))}
        </div>
      </div>
      {phases.map((p, i) => (
        <div key={p.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{p.theme}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{p.phase}</div>
          </div>
          <div style={{ position: "relative", height: 28, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{
              position: "absolute", top: 3, bottom: 3,
              left: (phaseTime[i].start / monthsTotal * 100) + "%",
              width: ((phaseTime[i].end - phaseTime[i].start) / monthsTotal * 100) + "%",
              background: colors[i], borderRadius: 4,
              display: "flex", alignItems: "center", padding: "0 8px",
              color: "white", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)"
            }}>
              {p.id}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
window.PageRoadmap = PageRoadmap;

// ════════════════════════════════════════════════════════════
// 13 — REPORT EXPORT (F-15 cross-check + F-16 packaging · US-11/13/14)
// ════════════════════════════════════════════════════════════
function PageExport() {
  const [formats, setFormats] = useStateR({ exec: true, pdf: true, csv: true, web: true, slides: false, quarterly: true });
  const cc = window.CONSISTENCY;
  const toggle = (k) => setFormats({ ...formats, [k]: !formats[k] });

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">13 · Report Export · F-15 + F-16 · US-11/13/14</div>
        <h1 className="page-title">Package & deliver report</h1>
        <div className="page-sub">
          The cross-logic consistency check (F-15) runs before packaging. ~20-page narrative PDF + 4
          mandatory charts + 1-page executive summary + interactive web view (US-13). Delivered to the registered email.
        </div>
      </div>

      <ConsistencyBanner cc={cc}/>

      <div className="two-col">
        <window.Card title="Report contents" sub="5 sections · ~20 pages · matches PRD §F-10 – F-14">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { n: "01", t: "1-page executive summary",          ref: "US-10 · ROI + payback + risk" },
              { n: "02", t: "Section 1 · Network diagnosis",        ref: "F-10 · 4-problem diagnosis" },
              { n: "03", t: "Section 2 · 8 warehouse roles",              ref: "F-11 · 8 roles" },
              { n: "04", t: "Section 3 · Event playbook",           ref: "F-12 · 3 events + 12 actions ref" },
              { n: "05", t: "Section 4 · Business case & ROI",        ref: "F-13 · ROI ratio + payback" },
              { n: "06", t: "Section 5 · Implementation roadmap",        ref: "F-14 · T+1 → T+9+" },
              { n: "07", t: "Appendix A · 12 standard actions",     ref: "Reference table" },
              { n: "08", t: "Appendix B · Data sources & versions",ref: "Snapshot + directory refresh" },
            ].map((s) => (
              <div key={s.n} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12,
                padding: "10px 12px", borderRadius: 6, background: "var(--surface-2)", alignItems: "center" }}>
                <span className="mono" style={{ width: 22, color: "var(--ink-3)", fontSize: 11 }}>{s.n}</span>
                <div>
                  <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{s.t}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{s.ref}</div>
                </div>
                <window.Icon name="check"/>
              </div>
            ))}
          </div>
          <div className="divider"></div>
          <div className="card-sub" style={{ marginBottom: 8 }}>4 mandatory charts</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {[
              "Monthly demand distribution",
              "Current vs. recommended warehouse map",
              "3-plan cost comparison",
              "Cumulative payback over time",
            ].map(c => (
              <div key={c} style={{ padding: "8px 10px", background: "var(--surface)", border: "1px dashed var(--border-strong)",
                borderRadius: 6, fontSize: 11.5, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 8 }}>
                <window.Icon name="chart" size={12}/> {c}
              </div>
            ))}
          </div>
        </window.Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <window.Card title="Output formats · F-16">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { k: "exec",      name: "1-page executive summary", desc: "For the CEO · decide in 3 minutes (US-10)" },
                { k: "pdf",       name: "PDF ~20 trang",          desc: "Narrative document + 4 charts (US-11)" },
                { k: "csv",       name: "CSV bundle",             desc: "Every engine output · 24 intermediate tables" },
                { k: "web",       name: "Interactive web view",     desc: "Budget slider + '+X% demand' scenario (US-13)" },
                { k: "slides",    name: "Slides (10 trang)",      desc: "Stakeholder review · optional" },
                { k: "quarterly", name: "Quarterly update report", desc: "Automatic · 2 pages (US-14 · P2)" },
              ].map(f => (
                <div key={f.k} onClick={() => toggle(f.k)}
                  style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", borderRadius: 8,
                    border: "1px solid " + (formats[f.k] ? "var(--accent)" : "var(--border)"),
                    background: formats[f.k] ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer" }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4,
                    border: "1.5px solid " + (formats[f.k] ? "var(--accent)" : "var(--border-strong)"),
                    background: formats[f.k] ? "var(--accent)" : "var(--surface)",
                    display: "grid", placeItems: "center" }}>
                    {formats[f.k] && <window.Icon name="check" size={10}/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
              <button className="btn primary" style={{ justifyContent: "center", padding: "10px 14px" }} disabled={cc.fail > 0}>
                <window.Icon name="download"/> Generate &amp; email {Object.values(formats).filter(Boolean).length}-file bundle
              </button>
              {cc.fail > 0 && (
                <div style={{ fontSize: 11, color: "var(--danger)" }}>
                  Report blocked — fix {cc.fail} consistency-check errors before packaging.
                </div>
              )}
            </div>
          </window.Card>

          <window.Card title="Delivery · email" sub="Sent to the registered address in the company profile">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, background: "var(--surface-2)", padding: 14, borderRadius: 8,
              border: "1px solid var(--border)", color: "var(--ink-2)", lineHeight: 1.7 }}>
              <div>To:      {window.COMPANY.contact}</div>
              <div>Subject: LogiHub · Consulting report · {window.COMPANY.name}</div>
              <div>Attach:  6 files · 12.4 MB</div>
              <div style={{ color: "var(--ink-4)" }}>// Bundle link expires after 30 days</div>
            </div>
          </window.Card>
        </div>
      </div>
    </div>
  );
}

function ConsistencyBanner({ cc }) {
  const tone = cc.fail > 0 ? "danger" : cc.warn > 0 ? "warn" : "healthy";
  return (
    <window.Card title="F-15 · Cross-logic consistency check"
      sub={cc.pass + " pass · " + cc.warn + " warn · " + cc.fail + " fail"}
      actions={<span className={"badge " + tone}>
        <span className="dot"></span>{cc.fail > 0 ? "Blocked" : cc.warn > 0 ? "Proceed with note" : "All consistent"}
      </span>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {cc.checks.map(c => {
          const tone = c.status === "pass" ? "healthy" : c.status === "warn" ? "warn" : "danger";
          return (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, padding: "8px 10px",
              background: "var(--surface-2)", borderRadius: 6, alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{c.id}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                {c.note && <div style={{ fontSize: 10.5, color: "var(--warn)", marginTop: 1 }}>{c.note}</div>}
              </div>
              <span className={"badge " + tone} style={{ fontSize: 10 }}><span className="dot"></span>{c.status}</span>
            </div>
          );
        })}
      </div>
    </window.Card>
  );
}
window.PageExport = PageExport;
