// LogiHub PRD v1.0 — Engine pages: Demand Forecast, Optimization
const { useState: useStateE } = React;

// ════════════════════════════════════════════════════════════
// 06 — DEMAND FORECAST (F-07 Filter 1 + F-08 Filter 2)
// ════════════════════════════════════════════════════════════
function PageForecast() {
  const [filter, setFilter] = useStateE("filter2"); // filter1 (screening) | filter2 (seasonal) | output

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">06 · Demand Forecast · F-07 + F-08</div>
        <h1 className="page-title">Demand filtering & multiplication</h1>
        <div className="page-sub">
          Filter 1 applies physical + legal screens (temperature, safety, security, ton→m³). Filter 2 multiplies demand
          against 30+ seasonal events + spatial shift. Output: (origin, dest, group, month) → demand_avg / peak / trough.
        </div>
      </div>

      <window.KPIStrip>
        <window.KPI label="Forecast horizon" value="12" unit="months" foot="2026-06 → 2027-05"/>
        <window.KPI label="Forecast points" value="14,280" foot="17 × 7 × 12 × 10 SKU buckets"/>
        <window.KPI label="MAPE backtest" value="17.6%" foot={<><span className="badge healthy"><span className="dot"></span>≤ 20% NFR</span></>}/>
        <window.KPI label="Decision-table screens" value="3" foot="Temp · Safety · Security"/>
        <window.KPI label="Hard-rejected SKUs" value="0" foot="All upload SKUs pass Filter 1"/>
        <window.KPI label="Events applied" value={window.EVENTS.length} foot="Filter 2 — multiplier per (group, month)"/>
      </window.KPIStrip>

      <window.Seg
        options={[
          { value: "filter1", label: "Filter 1 · Physical + Legal screen" },
          { value: "filter2", label: "Filter 2 · Seasonal multiplier" },
          { value: "output",  label: "Forecast output" },
        ]}
        value={filter} onChange={setFilter}/>

      {filter === "filter1" && <FilterOneView/>}
      {filter === "filter2" && <FilterTwoView/>}
      {filter === "output"  && <ForecastOutputView/>}
    </div>
  );
}

function FilterOneView() {
  return (
    <>
      <div className="three-col">
        {window.DECISION_TABLES.map(t => (
          <window.Card key={t.id} title={t.name} sub={t.rule}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span className={"badge " + (t.id === "security" ? "info" : "danger")} style={{ alignSelf: "flex-start", fontSize: 10 }}>
                <span className="dot"></span>{t.effect}
              </span>
              <table className="tbl" style={{ marginTop: 6 }}>
                <thead><tr><th>SKU example</th><th>Decision</th></tr></thead>
                <tbody>
                  {t.examples.map((ex, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12 }}>{ex.sku}</td>
                      <td>
                        <span className={"badge " + (ex.decision === "Allow" ? "healthy" : ex.decision === "Reject" ? "danger" : "info")}
                          style={{ fontSize: 10 }}>
                          <span className="dot"></span>{ex.decision}
                        </span>
                        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>{ex.cert}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </window.Card>
        ))}
      </div>

      <window.Card title="Weight → volume conversion · sample of 70 coefficients"
        sub="Tons are converted to m³ via the coefficient table · applied to every capacity calculation">
        <table className="tbl">
          <thead><tr><th>Product group</th><th className="num">ton / m³</th><th className="num">m³ / ton</th><th>Notes</th></tr></thead>
          <tbody>
            {window.WEIGHT_VOLUME.map(w => (
              <tr key={w.group}>
                <td style={{ color: "var(--ink)", fontWeight: 500 }}>{w.group}</td>
                <td className="num">{w.tonPerM3.toFixed(2)}</td>
                <td className="num">{w.m3PerTon.toFixed(1)}</td>
                <td className="hint">
                  {w.m3PerTon > 4 ? "Bulky — capacity-constrained early"
                    : w.m3PerTon < 1 ? "Dense — weight-constrained"
                    : "Balanced"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="hint" style={{ marginTop: 10 }}>Full table has 70 coefficients — the engine looks up per SKU mapping.</div>
      </window.Card>

      <window.RecPanel
        what="Filter 1 rejects no SKU from the Hanmoo Korea upload — all fit standard / high-security warehouses."
        why="Profile fashion + cosmetics ⇒ no cold-chain or hazmat. Some premium SKUs receive a soft preference for high-security warehouses."
        action="The engine passes data into Filter 2 with no exclusion. Soft-preference affects scoring inside Optimisation."
        impact="No plan violates any physical/legal constraint (acceptance criteria · analyze)."/>
    </>
  );
}

function FilterTwoView() {
  const months = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"];
  // synthetic per-group multipliers shaped by EVENTS
  const data = window.PRODUCTS.slice(0, 5).map(p => ({
    name: p.name,
    color: p.color,
    series: months.map((m, i) => {
      let mul = 1.0;
      if (p.id === "fashion" && (i === 5 || i === 6)) mul = 1.95;
      if (p.id === "electronics" && i === 5) mul = 1.82;
      if (p.id === "food" && (i === 3 || i === 6 || i === 7)) mul = 1.55;
      if (p.id === "beauty" && i === 5) mul = 1.62;
      if (p.id === "lifestyle" && i === 3) mul = 1.22;
      return mul;
    }),
  }));

  return (
    <>
      <window.Card title="Formula" sub="Multipliers applied per (group, month) before optimization">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-2)", background: "var(--surface-2)",
          padding: 16, borderRadius: 10, lineHeight: 1.8, border: "1px solid var(--border)" }}>
          <div style={{ color: "var(--ink-4)" }}>// F-08 · seasonal multiplier</div>
          <div>demand_multiplier = base_seasonal_index</div>
          <div style={{ paddingLeft: 24 }}>+ Σ event_impacts (filtered by industry profile)</div>
          <div style={{ paddingLeft: 24 }}>+ random_noise(±15%)</div>
          <div style={{ marginTop: 10, color: "var(--accent-ink)" }}>// per region pair</div>
          <div>demand(origin, dest, group, month) = base × multiplier × spatial_shift</div>
        </div>
      </window.Card>

      <window.Card title="Per-group seasonal multiplier · 12 months"
        sub="Color band marks events that contribute · ×1.0 = baseline">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {data.map(d => {
            const max = Math.max(...d.series);
            return (
              <div key={d.name} style={{ display: "grid", gridTemplateColumns: "120px 1fr 64px", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{d.name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }}>
                  {d.series.map((v, i) => (
                    <div key={i} title={months[i] + " · ×" + v.toFixed(2)}
                      style={{ height: 24, borderRadius: 3,
                        background: v > 1
                          ? `color-mix(in oklch, ${d.color} ${(Math.min(1, (v-1)/1.2) * 80 + 20).toFixed(0)}%, white)`
                          : "var(--surface-3)",
                        display: "grid", placeItems: "center",
                        fontFamily: "var(--font-mono)", fontSize: 9.5,
                        color: v > 1.5 ? "white" : "var(--ink-3)" }}>
                      {v > 1.05 ? v.toFixed(1) : ""}
                    </div>
                  ))}
                </div>
                <div className="mono" style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600, textAlign: "right" }}>
                  ×{max.toFixed(2)}
                </div>
              </div>
            );
          })}
          <div style={{ display: "grid", gridTemplateColumns: "120px repeat(12, 1fr) 64px", gap: 2, marginTop: 6 }}>
            <div></div>
            {months.map(m => (
              <div key={m} className="mono" style={{ fontSize: 9.5, color: "var(--ink-4)", textAlign: "center" }}>{m}</div>
            ))}
            <div></div>
          </div>
        </div>
      </window.Card>

      <div className="two-col">
        <window.Card title="Spatial shift · Lunar New Year proxy"
          sub="Rural → urban demand shift built from public mobility data">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { from: "Jeonbuk + Jeonnam",          to: "Seoul + Gyeonggi",  share: "12% of FNB demand", weeks: "Jan W3 → Feb W2" },
              { from: "Gyeongbuk + Gangwon",        to: "Busan + Daegu",      share: "9% of general",     weeks: "Jan W3 → Feb W2" },
              { from: "Chungbuk + Chungnam",        to: "Sejong + Daejeon",   share: "6% of fashion",     weeks: "Jan W4 → Feb W1" },
            ].map((s, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr 90px",
                gap: 10, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8, alignItems: "center" }}>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{s.from}</div>
                <window.Icon name="arrow-right" size={14}/>
                <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{s.to}</div>
                <div style={{ textAlign: "right", fontSize: 11 }}>
                  <div className="mono" style={{ color: "var(--accent)" }}>{s.share}</div>
                  <div style={{ color: "var(--ink-3)", fontSize: 10 }}>{s.weeks}</div>
                </div>
              </div>
            ))}
          </div>
        </window.Card>

        <window.RecPanel
          what="Filter 2 amplifies November demand 1.95× for fashion and 1.82× for electronics."
          why="11.11 + Black Friday stack with year-end gifting. Filter applies industry-filtered events only — pharma/cold events do not affect Hanmoo's fashion forecast."
          action="Output passed to Filter 3 (Optimization). Engine pre-computes Nov 11–30 as critical window for Plan P2's resilience score."
          impact="Without spatial shift, engine would under-provision Seoul Metro by ~8 200 m³ in Feb 2027."/>
      </div>
    </>
  );
}

function ForecastOutputView() {
  return (
    <>
      <window.Card title="Forecast output schema · sample 10 rows"
        sub="(origin, dest, group, month) → {demand_avg, demand_peak, demand_trough}"
        actions={<button className="btn"><window.Icon name="download"/> Export full 14,280 rows</button>}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Month</th><th>Origin</th><th>Dest</th><th>Group</th>
              <th className="num">Avg</th><th className="num">Peak</th><th className="num">Trough</th>
              <th>Trigger event</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m: "2026-11", o: "Seoul",    d: "Busan",    g: "Fashion",     avg: 142.4, peak: 274.8, trough: 96.5,  ev: "11.11 + BF" },
              { m: "2026-11", o: "Gyeonggi", d: "Daegu",    g: "Fashion",     avg:  82.6, peak: 156.2, trough: 58.4,  ev: "11.11" },
              { m: "2026-11", o: "Incheon",  d: "Busan",    g: "Electronics", avg:  68.4, peak: 152.6, trough: 48.2,  ev: "Black Friday" },
              { m: "2026-09", o: "Seoul",    d: "Gangwon",  g: "FNB",         avg:  31.2, peak:  58.4, trough: 22.8,  ev: "Chuseok" },
              { m: "2027-02", o: "Daejeon",  d: "Seoul",    g: "FNB",         avg:  46.8, peak:  84.6, trough: 32.4,  ev: "Seollal" },
              { m: "2026-12", o: "Gyeonggi", d: "Jeju",     g: "Cosmetics",   avg:  18.6, peak:  32.4, trough: 12.8,  ev: "Year-end" },
              { m: "2026-08", o: "Jeonnam",  d: "Busan",    g: "FNB",         avg:  24.6, peak:  41.2, trough: 14.8,  ev: "Typhoon ↓" },
              { m: "2026-10", o: "Gyeongbuk",d: "Seoul",    g: "FNB",         avg:  38.4, peak:  62.8, trough: 28.4,  ev: "Apple harvest" },
              { m: "2026-08", o: "Seoul",    d: "Gyeonggi", g: "General",     avg:  74.2, peak: 110.4, trough: 56.8,  ev: "Back-to-school" },
              { m: "2027-03", o: "Busan",    d: "Daegu",    g: "Fashion",     avg:  62.4, peak:  88.6, trough: 48.2,  ev: "—" },
            ].map((r, i) => (
              <tr key={i} className="hoverable">
                <td className="mono" style={{ fontSize: 11.5 }}>{r.m}</td>
                <td>{r.o}</td>
                <td>{r.d}</td>
                <td><span className="badge outline" style={{ fontSize: 10.5 }}>{r.g}</span></td>
                <td className="num">{r.avg.toFixed(1)}k</td>
                <td className="num" style={{ color: "var(--warn)", fontWeight: 600 }}>{r.peak.toFixed(1)}k</td>
                <td className="num">{r.trough.toFixed(1)}k</td>
                <td style={{ fontSize: 11.5, color: r.ev.includes("↓") ? "var(--danger)" : "var(--ink-2)" }}>{r.ev}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </window.Card>

      <div className="two-col">
        <window.Card title="Network demand · monthly band"
          sub="Avg with peak / trough corridor · all groups">
          <DemandBandChart/>
        </window.Card>

        <window.RecPanel
          what="Forecast peak is 2.18× the trough — driven by Nov shopping events stacking onto a stable base."
          why="Without seasonal filter, optimization would size the network for ~1.4× the average — losing both efficiency (idle Q1) and capacity (overload Q4)."
          action="Plan P2 sizes for 90th-percentile peak with seasonal flex. Plan P3 sizes for 99th to survive 11.11 + Typhoon stacked scenarios."
          impact="Forecast feeds directly into Optimization (Step 07) — re-run after every quarterly upload."/>
      </div>
    </>
  );
}

function DemandBandChart() {
  const months = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"];
  const avg   = [820, 840, 880, 920, 1080, 1380, 1180, 880, 1020, 940, 920, 900];
  const peak  = [920, 940, 980, 1140, 1280, 1820, 1480, 1080, 1280, 1080, 1020, 990];
  const trough= [720, 740, 800, 840, 920, 1080, 980, 760, 880, 820, 820, 820];
  const W = 720, H = 240;
  const maxV = 2000;
  const px = (i) => (i / (months.length - 1)) * W;
  const py = (v) => H - (v / maxV) * (H - 20) - 10;
  const bandTop = peak.map((v, i) => px(i) + " " + py(v));
  const bandBot = trough.slice().reverse().map((v, i) => px(months.length - 1 - i) + " " + py(v));
  const bandD = "M " + bandTop.join(" L ") + " L " + bandBot.join(" L ") + " Z";
  const avgD = avg.map((v, i) => (i === 0 ? "M " : "L ") + px(i) + " " + py(v)).join(" ");
  return (
    <>
      <svg className="svg-chart" viewBox={`0 0 ${W} ${H + 24}`} preserveAspectRatio="none">
        {[0, 0.5, 1].map((p, i) => (
          <line key={i} x1="0" x2={W} y1={py(maxV * p)} y2={py(maxV * p)} stroke="#E4E6E0" strokeWidth="0.5"/>
        ))}
        <path d={bandD} fill="var(--accent)" opacity="0.16"/>
        <path d={avgD} stroke="var(--accent)" strokeWidth="1.8" fill="none"/>
        {peak.map((v, i) => (
          <circle key={"p" + i} cx={px(i)} cy={py(v)} r={i === 5 ? 4 : 2}
            fill={i === 5 ? "var(--danger)" : "var(--accent-2)"} stroke="#fff" strokeWidth="0.8"/>
        ))}
        {months.map((m, i) => (
          <text key={m} x={px(i)} y={H + 14} fontSize="9.5" textAnchor="middle" fill="#6B7480" fontFamily="JetBrains Mono">{m}</text>
        ))}
        <text x={px(5) + 8} y={py(peak[5]) - 6} fontSize="10.5" fill="var(--danger)" fontFamily="JetBrains Mono" fontWeight="600">Nov peak · 1,820</text>
      </svg>
      <div className="legend" style={{ marginTop: 6 }}>
        <span><span className="swatch" style={{ background: "var(--accent)" }}></span>Average forecast</span>
        <span><span className="swatch" style={{ background: "var(--accent)", opacity: 0.4 }}></span>Peak / trough band</span>
        <span><span className="swatch" style={{ background: "var(--danger)" }}></span>Critical month</span>
      </div>
    </>
  );
}
window.PageForecast = PageForecast;

// ════════════════════════════════════════════════════════════
// 07 — OPTIMIZATION (F-09 · US-08 · US-09)
// ════════════════════════════════════════════════════════════
// 07 — OPTIMIZATION  (F-09 · US-08 · US-09)
// Real engine integration via window.API (api-bridge.js)
// ════════════════════════════════════════════════════════════
function PageOptimize() {
  const [activePlan, setActivePlan] = useStateE("P2");
  const [view, setView]             = useStateE("compare");
  const [runState, setRunState]     = useStateE("idle"); // idle | running | done | error
  const [runError, setRunError]     = useStateE(null);
  const [liveMode, setLiveMode]     = useStateE(
    () => !!(window.API_STATE && window.API_STATE.online)
  );
  const [p1Hubs,    setP1Hubs]    = useStateE(5);
  const [p3Radius,  setP3Radius]  = useStateE(150);
  const [tick,      setTick]      = useStateE(0);
  const [runState9, setRunState9] = useStateE("idle"); // idle | running | done | error
  const [runError9, setRunError9] = useStateE(null);

  const plan = window.PLAN_BY_ID[activePlan];
  const recId = (window.ROI_V2 && window.ROI_V2.recommendedPlan) || "P2";
  const recPlan = window.PLAN_BY_ID[recId] || window.PLAN_BY_ID["P2"];

  // Listen for backend events
  React.useEffect(() => {
    const onReady = () => {
      setLiveMode(true);
      setRunState("idle");
    };
    const onPlans = () => {
      setRunState("done");
      setTick(t => t + 1);
    };
    const onScenarios = () => {
      setRunState9("done");
      setTick(t => t + 1);
    };
    window.addEventListener("logihub:backend-ready",    onReady);
    window.addEventListener("logihub:plans-updated",    onPlans);
    window.addEventListener("logihub:scenarios-updated", onScenarios);
    return () => {
      window.removeEventListener("logihub:backend-ready",    onReady);
      window.removeEventListener("logihub:plans-updated",    onPlans);
      window.removeEventListener("logihub:scenarios-updated", onScenarios);
    };
  }, []);

  const handleRunEngine = async () => {
    if (!window.API || !window.API_STATE.online) return;
    setRunState("running");
    setRunError(null);
    try {
      await window.API.runAll(p1Hubs, 5, p3Radius);
      // onPlans event will update state
    } catch (e) {
      setRunError(e.message || "Optimization failed");
      setRunState("error");
    }
  };

  const handleRunAllScenarios = async () => {
    if (!window.API || !window.API_STATE.online) return;
    setRunState9("running");
    setRunError9(null);
    try {
      await window.API.runAllScenarios();
    } catch (e) {
      setRunError9(e.message || "9-scenario run failed");
      setRunState9("error");
    }
  };

  const isRunning        = runState === "running";
  const isRunning9       = runState9 === "running";
  const hasLive          = runState === "done" && !!window.API_STATE.liveResults;
  const hasLiveScenarios = runState9 === "done" && !!window.API_STATE.liveScenarios;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">07 · Optimization · F-09</div>
        <h1 className="page-title">9 scenarios in parallel · S0–S8</h1>
        <div className="page-sub">
          The engine solves 9 scenarios (S0–S8) in parallel using PuLP/CBC: UFLP, P-Median (P5 + P7),
          CFLP, MCLP (50 km + 100 km) and Hybrid. Output ranked by 4 metrics.
        </div>
      </div>

      {/* ── Live engine control panel ── */}
      <div style={{
        background: liveMode ? "var(--accent-soft)" : "var(--surface-3)",
        border: "1px solid " + (liveMode ? "var(--accent)" : "var(--border)"),
        borderRadius: "var(--r-lg)",
        padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: liveMode ? "var(--ok)" : "var(--ink-4)",
            boxShadow: liveMode ? "0 0 0 3px var(--ok-soft)" : "none",
          }}/>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: liveMode ? "var(--accent-ink)" : "var(--ink-3)" }}>
            {liveMode ? "Backend connected · CBC solver ready" : "Backend offline — showing mock data"}
          </span>
          {hasLive && <span className="badge healthy" style={{ fontSize: 10 }}><span className="dot"/>Live results</span>}
        </div>

        {liveMode && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
              <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 0 }}>
                <span className="field-label" style={{ whiteSpace: "nowrap" }}>P1 hubs</span>
                <select value={p1Hubs} onChange={e => setP1Hubs(+e.target.value)}
                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, background: "var(--surface)", color: "var(--ink)" }}>
                  {[3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 0 }}>
                <span className="field-label" style={{ whiteSpace: "nowrap" }}>P3 radius km</span>
                <select value={p3Radius} onChange={e => setP3Radius(+e.target.value)}
                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, background: "var(--surface)", color: "var(--ink)" }}>
                  {[100,120,150,180,200,250].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <button
                className={"btn primary"}
                disabled={isRunning || isRunning9}
                onClick={handleRunEngine}
                style={{ minWidth: 160, position: "relative" }}>
                {isRunning
                  ? <><span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>  Solving…</>
                  : <><window.Icon name="play"/> Run 3 plans (P1–P3)</>}
              </button>
              <button
                className={"btn"}
                disabled={isRunning || isRunning9}
                onClick={handleRunAllScenarios}
                style={{ minWidth: 190, position: "relative", fontWeight: 700 }}>
                {isRunning9
                  ? <><span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>  Running 9 scenarios…</>
                  : <><window.Icon name="play"/> Run 9 scenarios (S0–S8)</>}
              </button>
            </div>
          </>
        )}

        {runError && (
          <div style={{ width: "100%", fontSize: 11.5, color: "var(--danger)", paddingTop: 8 }}>
            <window.Icon name="warn" size={12}/> {runError}
          </div>
        )}
        {runError9 && (
          <div style={{ width: "100%", fontSize: 11.5, color: "var(--danger)", paddingTop: 4 }}>
            <window.Icon name="warn" size={12}/> 9-scenario error: {runError9}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {window.PLANS.map(p => (
          <PlanCard key={p.id + tick} plan={p} active={p.id === activePlan}
            onClick={() => setActivePlan(p.id)} hasLive={hasLive}/>
        ))}
      </div>

      <window.KPIStrip>
        <window.KPI label="Recommended" value={recId}
          foot={<><span className="badge accent"><span className="dot"/>{recPlan.name}</span></>}/>
        <window.KPI label={"Monthly cost · " + recId}
          value={"₩" + recPlan.total_cost.toLocaleString()} unit="M/mo"
          delta={"−" + window.fmtPct(recPlan.saving, 1)} deltaKind="up" foot="vs current footprint"/>
        <window.KPI label={"Avg delay · " + recId}
          value={recPlan.avg_delay.toFixed(2)} unit="days"
          foot={window.fmtPct(recPlan.geo_coverage) + " within SLA"}/>
        <window.KPI label={"Resilience · " + recId}
          value={recPlan.resilience} unit="/ 100" foot="stress scenarios survived"/>
        <window.KPI label={"Payback · " + recId}
          value={recPlan.payback} unit="months"
          foot={<><span className="badge healthy"><span className="dot"/>≤ 12 mo target</span></>}/>
      </window.KPIStrip>

      <window.Seg
        options={[
          { value: "compare", label: "Compare 3 plans · 4 metrics" },
          { value: "metrics", label: "Detail · " + activePlan },
          { value: "stress",  label: "100-scenario stress test · US-09" },
          ...(hasLive          ? [{ value: "live", label: "Live result · hubs & assignments" }] : []),
          ...(hasLiveScenarios ? [{ value: "nine", label: "9 Scenarios · S0–S8" }]             : []),
        ]}
        value={view} onChange={setView}/>

      {view === "compare" && <CompareView tick={tick}/>}
      {view === "metrics" && <PlanDetail plan={plan}/>}
      {view === "stress"  && <StressTest/>}
      {view === "live"    && hasLive          && <LiveResultView      data={window.API_STATE.liveResults}/>}
      {view === "nine"    && hasLiveScenarios && <NineScenariosView   data={window.API_STATE.liveScenarios}/>}
    </div>
  );
}

// ── Live result detail view ──────────────────────────────────────────────────
function LiveResultView({ data }) {
  const [selected, setSelected] = useStateE("P2");
  const r = data[selected];
  if (!r) return null;
  if (r.status !== "Optimal") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["P1","P2","P3"].map(id => (
            <button key={id} onClick={() => setSelected(id)}
              className={"btn" + (selected === id ? " primary" : "")}>
              {id} {id === data.recommended ? "★" : ""}
            </button>
          ))}
          <span style={{ marginLeft: 8, fontSize: 11.5, color: "var(--ink-3)", lineHeight: "30px" }}>
            Recommended: <b style={{ color: "var(--accent-ink)" }}>{data.recommended}</b>
          </span>
        </div>
        <div style={{ padding: 24, borderRadius: 10, background: "var(--danger-soft)", border: "1px solid var(--danger)", color: "var(--danger)", display: "flex", alignItems: "center", gap: 8 }}>
          <window.Icon name="warn" size={16}/>
          <span>Solver returned status <b>{r.status}</b>: {r.error || "Optimization failed"}</span>
        </div>
      </div>
    );
  }
  const m = r.metrics;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["P1","P2","P3"].map(id => (
          <button key={id} onClick={() => setSelected(id)}
            className={"btn" + (selected === id ? " primary" : "")}>
            {id} {id === data.recommended ? "★" : ""}
          </button>
        ))}
        <span style={{ marginLeft: 8, fontSize: 11.5, color: "var(--ink-3)", lineHeight: "30px" }}>
          Recommended: <b style={{ color: "var(--accent-ink)" }}>{data.recommended}</b>
        </span>
      </div>

      <div className="three-col">
        {[
          { label: "Total cost (USD/yr)",   v: "$" + (m.total_cost_usd||0).toLocaleString("en",{maximumFractionDigits:0}) },
          { label: "Avg distance (km)",     v: (m.avg_distance_km||0).toFixed(1) + " km" },
          { label: "Avg lead time",         v: (m.avg_lead_time_hrs||0).toFixed(2) + " hrs" },
          { label: "CO₂ emissions",         v: (m.co2_emissions_kg||0).toLocaleString("en",{maximumFractionDigits:0}) + " kg" },
          { label: "Coverage ≤150 km",      v: (m.coverage_within_150km_pct||0).toFixed(1) + "%" },
          { label: "Total demand (k tons)", v: ((m.total_tons||0)/1000).toFixed(1) + "k t" },
        ].map(kv => (
          <div key={kv.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{kv.label}</div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginTop: 4 }}>{kv.v}</div>
          </div>
        ))}
      </div>

      <window.Card title={"Open hubs · " + selected + " · " + r.opened_hubs.length + " selected"}
        sub="CBC solver chose these facilities from the 8 candidates">
        <table className="tbl">
          <thead>
            <tr><th>Hub ID</th><th className="num">Lat</th><th className="num">Lon</th>
                <th className="num">Capacity (t)</th><th className="num">Fixed cost (USD/yr)</th></tr>
          </thead>
          <tbody>
            {r.opened_hubs.map(h => (
              <tr key={h.id} className="hoverable">
                <td className="mono" style={{ fontWeight: 600, color: "var(--accent-ink)" }}>{h.id}</td>
                <td className="num">{h.lat.toFixed(4)}</td>
                <td className="num">{h.lon.toFixed(4)}</td>
                <td className="num">{(h.capacity_tons||0).toLocaleString()}</td>
                <td className="num">${(h.fixed_cost||0).toLocaleString("en",{maximumFractionDigits:0})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </window.Card>

      <window.Card title={"Region assignments · " + selected + " · " + r.assignments.length + " regions"}
        sub="Each demand region assigned to closest open hub">
        <table className="tbl">
          <thead>
            <tr><th>Region</th><th>Assigned hub</th>
                <th className="num">Demand (t)</th><th className="num">Distance (km)</th></tr>
          </thead>
          <tbody>
            {r.assignments.map((a, i) => (
              <tr key={i} className="hoverable">
                <td style={{ fontWeight: 500 }}>{a.region_id}</td>
                <td className="mono" style={{ color: "var(--accent-ink)", fontSize: 11.5 }}>{a.hub_id}</td>
                <td className="num">{((a.demand_tons||a.flow_tons||0)).toFixed(1)}</td>
                <td className="num" style={{ color: a.distance_km > 150 ? "var(--danger)" : "var(--ok)" }}>
                  {a.distance_km.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </window.Card>
    </div>
  );
}

// CSS keyframes for spinner — injected once
if (!document.getElementById("lh-spin-style")) {
  const s = document.createElement("style");
  s.id = "lh-spin-style";
  s.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(s);
}

function PlanCard({ plan, active, onClick }) {
  const isRec = plan.id === "P2";
  return (
    <div className={"scenario-card" + (active ? " selected" : "")} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="sc-id">{plan.id}</span>
        {isRec
          ? <span className="badge accent"><span className="dot"></span>{plan.badge}</span>
          : <span className="badge outline" style={{ fontSize: 10 }}>{plan.badge}</span>}
      </div>
      <div className="sc-name">{plan.name}</div>
      <div className="sc-desc">{plan.objective}</div>
      <div className="sc-stats">
        <div className="stat"><span>Cost</span><b>₩{plan.total_cost.toLocaleString()}M</b></div>
        <div className="stat"><span>Delay</span><b>{plan.avg_delay.toFixed(2)}d</b></div>
        <div className="stat"><span>Coverage</span><b>{window.fmtPct(plan.geo_coverage)}</b></div>
        <div className="stat"><span>Resilience</span><b>{plan.resilience}</b></div>
      </div>
    </div>
  );
}

function CompareView() {
  const metrics = [
    { id: "total_cost",   name: "Total cost / mo",   unit: "₩ M", fmt: v => "₩" + v.toLocaleString() + "M", lowerBetter: true  },
    { id: "avg_delay",    name: "Avg delivery delay", unit: "days", fmt: v => v.toFixed(2) + " d",          lowerBetter: true  },
    { id: "geo_coverage", name: "Geo coverage",       unit: "%",    fmt: v => window.fmtPct(v),              lowerBetter: false },
    { id: "resilience",   name: "Resilience score",   unit: "/100", fmt: v => v + " / 100",                  lowerBetter: false },
  ];

  return (
    <div className="section-grid">
      <window.Card title="Plans × 4 metrics" sub="Click cell to highlight winning plan per metric">
        <table className="tbl">
          <thead>
            <tr><th>Metric</th>{window.PLANS.map(p => <th key={p.id} className="num">{p.id}</th>)}<th>Best</th></tr>
          </thead>
          <tbody>
            {metrics.map(m => {
              const values = window.PLANS.map(p => p[m.id]);
              const best = m.lowerBetter ? Math.min(...values) : Math.max(...values);
              const winnerIdx = values.indexOf(best);
              return (
                <tr key={m.id}>
                  <td style={{ color: "var(--ink)", fontWeight: 500 }}>{m.name}</td>
                  {window.PLANS.map((p, i) => (
                    <td key={p.id} className="num" style={i === winnerIdx ? { background: "var(--ok-soft)", color: "var(--ok)", fontWeight: 600 } : null}>
                      {m.fmt(p[m.id])}
                    </td>
                  ))}
                  <td className="mono" style={{ color: "var(--accent)", fontWeight: 600 }}>{window.PLANS[winnerIdx].id}</td>
                </tr>
              );
            })}
            <tr style={{ background: "var(--surface-2)" }}>
              <td style={{ color: "var(--ink)", fontWeight: 600 }}>Recommended pick</td>
              {window.PLANS.map(p => (
                <td key={p.id} className="num">{p.id === "P2" ? <span className="badge accent"><span className="dot"></span>Pick</span> : "—"}</td>
              ))}
              <td></td>
            </tr>
          </tbody>
        </table>
      </window.Card>

      <window.RecPanel
        what="P1 wins on coverage and delay. P2 wins on cost. P3 wins on resilience. None dominates all four — engine recommends P2 as the balanced trade-off."
        why="Profile budget cap ₩6.0B/yr eliminates P1 (₩4.81B + opening + transition exceeds cap). P3 keeps cost in budget but adds 5-month payback delay vs. P2."
        action="Adopt P2; pilot in Seoul + Gyeonggi (ROI band 1.5–2.5×). Hold P3 in reserve for years 2–3 if disruption frequency rises."
        impact="P2 saves ₩565M / mo (12.0%) with payback in 8 months — meets the F-13 'pilot first' recommendation tier."/>
    </div>
  );
}

function PlanDetail({ plan }) {
  return (
    <>
      <window.Card title={plan.id + " · " + plan.name + " — detail"} sub={plan.objective + "  ·  " + plan.constraints}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div className="card-sub" style={{ marginBottom: 10 }}>Plan summary</div>
            <table className="tbl">
              <tbody>
                <tr><td style={{ color: "var(--ink-3)" }}>Code</td>          <td className="mono">{plan.code}</td></tr>
                <tr><td style={{ color: "var(--ink-3)" }}>Warehouses selected</td><td className="mono">{plan.selectedWHs}</td></tr>
                <tr><td style={{ color: "var(--ink-3)" }}>Monthly cost</td>  <td className="mono">₩{plan.total_cost.toLocaleString()}M</td></tr>
                <tr><td style={{ color: "var(--ink-3)" }}>Saving vs current</td><td className="mono" style={{ color: "var(--ok)" }}>−{window.fmtPct(plan.saving, 1)}</td></tr>
                <tr><td style={{ color: "var(--ink-3)" }}>Avg delay</td>     <td className="mono">{plan.avg_delay.toFixed(2)} days</td></tr>
                <tr><td style={{ color: "var(--ink-3)" }}>Geo coverage</td>  <td className="mono">{window.fmtPct(plan.geo_coverage)} demand within SLA</td></tr>
                <tr><td style={{ color: "var(--ink-3)" }}>Resilience</td>    <td className="mono">{plan.resilience} / 100 scenarios survived</td></tr>
                <tr><td style={{ color: "var(--ink-3)" }}>Payback</td>       <td className="mono">{plan.payback} months</td></tr>
              </tbody>
            </table>
            <div className="rec-block" style={{ marginTop: 14 }}>
              <dt>Trade-off</dt><dd>{plan.tradeoff}</dd>
            </div>
          </div>

          <div>
            <div className="card-sub" style={{ marginBottom: 10 }}>Metric radar</div>
            <RadarChart plan={plan}/>
          </div>
        </div>
      </window.Card>
    </>
  );
}

function RadarChart({ plan }) {
  const dims = [
    { key: "cost",       label: "Cost",       v: 1 - (plan.total_cost - 4145) / 1000 },
    { key: "delay",      label: "Speed",      v: 1 - (plan.avg_delay - 0.20) / 0.30 },
    { key: "coverage",   label: "Coverage",   v: (plan.geo_coverage - 0.85) / 0.15 },
    { key: "resilience", label: "Resilience", v: plan.resilience / 100 },
    { key: "payback",    label: "Payback",    v: 1 - (plan.payback - 6) / 10 },
  ];
  const cx = 140, cy = 140, R = 100;
  const pts = dims.map((d, i) => {
    const a = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
    const r = Math.max(0.1, Math.min(1, d.v)) * R;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx + Math.cos(a) * (R + 16), cy + Math.sin(a) * (R + 16), d.label];
  });
  const path = "M " + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ") + " Z";
  return (
    <svg viewBox="0 0 280 280" style={{ width: "100%", maxWidth: 320 }}>
      {[0.25, 0.5, 0.75, 1].map((p, i) => {
        const poly = Array.from({ length: dims.length }).map((_, j) => {
          const a = (Math.PI * 2 * j) / dims.length - Math.PI / 2;
          return (cx + Math.cos(a) * R * p).toFixed(1) + " " + (cy + Math.sin(a) * R * p).toFixed(1);
        }).join(" L ");
        return <path key={i} d={"M " + poly + " Z"} fill="none" stroke="#E4E6E0" strokeWidth="0.5"/>;
      })}
      {dims.map((_, i) => {
        const a = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * R} y2={cy + Math.sin(a) * R} stroke="#E4E6E0" strokeWidth="0.5"/>;
      })}
      <path d={path} fill="var(--accent)" opacity="0.18" stroke="var(--accent)" strokeWidth="1.5"/>
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--accent)" stroke="#fff" strokeWidth="1"/>)}
      {pts.map((p, i) => (
        <text key={i} x={p[2]} y={p[3]} fontSize="11" textAnchor="middle"
          fill="var(--ink-2)" fontFamily="JetBrains Mono">{p[4]}</text>
      ))}
    </svg>
  );
}

function StressTest() {
  // visualise 100 scenarios as a 10x10 grid, colored by which plan survived
  const grid = [];
  // Random-ish but deterministic survival per plan
  for (let i = 0; i < 100; i++) {
    const p1 = i % 7 !== 0 && i % 11 !== 0;
    const p2 = i % 4 !== 0 || i % 9 === 0;
    const p3 = i % 13 !== 0;
    grid.push({ p1, p2, p3 });
  }
  const counts = {
    p1: grid.filter(g => g.p1).length,
    p2: grid.filter(g => g.p2).length,
    p3: grid.filter(g => g.p3).length,
  };
  const scenarioCats = [
    { name: "Demand spike",     n: 30, color: "oklch(56% 0.11 205)" },
    { name: "Hub closure",      n: 25, color: "oklch(60% 0.16 35)"  },
    { name: "Corridor block",   n: 25, color: "oklch(68% 0.14 70)"  },
    { name: "Pandemic proxy",   n: 20, color: "oklch(54% 0.10 280)" },
  ];
  return (
    <>
      <div className="section-grid">
        <window.Card title="100-scenario stress test · 4 shock families" sub="Cells coloured by which plan survives each scenario">
          <div style={{ display: "flex", gap: 18 }}>
            {["p1","p2","p3"].map(k => (
              <div key={k} style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Plan {k.toUpperCase()} · {counts[k]} survived
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 2 }}>
                  {grid.map((g, i) => (
                    <div key={i} style={{
                      aspectRatio: "1 / 1",
                      background: g[k] ? "var(--ok)" : "var(--danger)",
                      opacity: g[k] ? 0.6 : 0.85,
                      borderRadius: 2,
                    }}></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 14 }}>
            Engine runs each plan against 100 stress scenarios. Plan P3 ({counts.p3}/100) trades cost for resilience —
            preferred for industries with high disruption frequency.
          </div>
        </window.Card>

        <window.Card title="Scenario families" sub="Composition of the 100 stress tests">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {scenarioCats.map(c => (
              <div key={c.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--ink-2)" }}>{c.name}</span>
                  <span className="mono" style={{ color: "var(--ink)", fontWeight: 600 }}>{c.n} scenarios</span>
                </div>
                <div className="bar" style={{ height: 8 }}>
                  <span style={{ width: c.n + "%", background: c.color }}></span>
                </div>
              </div>
            ))}
            <div className="divider"></div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.6 }}>
              Shock magnitude calibrated to the worst historical month for each family — e.g. demand spike = 11.11 + Black Friday stacked.
            </div>
          </div>
        </window.Card>
      </div>
    </>
  );
}
// ── 9-Scenario result view ───────────────────────────────────────────────────
function NineScenariosView({ data }) {
  const [selected, setSelected] = useStateE(null);
  const ORDER = ["S0","S1","S2","S3","S4","S5","S6","S7","S8"];
  const LABELS = {
    S0: "Baseline",          S1: "Cost Minimized",
    S2: "Balanced P5",       S3: "Service P7",
    S4: "Capacity Constrained", S5: "Peak Season Flex",
    S6: "Max Coverage 50km", S7: "Max Coverage 100km",
    S8: "Hybrid Eligibility",
  };
  const SOLVER = {
    S0:"UFLP", S1:"UFLP", S2:"P-Median", S3:"P-Median",
    S4:"CFLP", S5:"CFLP", S6:"MCLP",     S7:"MCLP",    S8:"Hybrid→CFLP",
  };

  const fmtUSD = v => "$" + (v||0).toLocaleString("en",{maximumFractionDigits:0});
  const fmtKm  = v => (v||0).toFixed(1) + " km";
  const fmtPct = v => (v||0).toFixed(1) + "%";

  const rows = ORDER.map(id => ({ id, result: data.scenarios?.[id] }));
  const rec  = data.recommended;
  const sel  = selected || rec;
  const selResult = data.scenarios?.[sel];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span className="badge accent"><span className="dot"/>{data.completed}/{data.total_scenarios} completed</span>
        {rec && (
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
            Recommended: <b style={{ color: "var(--accent-ink)" }}>{rec} — {LABELS[rec]}</b>
          </span>
        )}
        {data.errors && Object.keys(data.errors).length > 0 && (
          <span className="badge danger" style={{ fontSize: 11 }}>
            <span className="dot"/>{Object.keys(data.errors).length} error(s): {Object.keys(data.errors).join(", ")}
          </span>
        )}
      </div>

      {/* Scenario selector buttons */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {ORDER.map(id => {
          const r = data.scenarios?.[id];
          const isRec = id === rec;
          const isSel = id === sel;
          return (
            <button key={id} onClick={() => setSelected(id)}
              className={"btn" + (isSel ? " primary" : "")}
              style={{ fontWeight: isRec ? 700 : 400, position: "relative" }}>
              {id} {isRec ? "★" : ""} {!r ? "✕" : ""}
            </button>
          );
        })}
      </div>

      {/* Comparison table */}
      <window.Card title="9-Scenario comparison matrix" sub="PuLP/CBC solver · real optimization results">
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Solver</th>
                <th className="num">Cost (USD/yr)</th>
                <th className="num">Avg dist (km)</th>
                <th className="num">Coverage ≤150km</th>
                <th className="num">Lead time (hrs)</th>
                <th className="num">Hubs opened</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ id, result: r }) => {
                const isRec = id === rec;
                const m = r?.metrics;
                return (
                  <tr key={id} className="hoverable"
                    onClick={() => setSelected(id)}
                    style={isRec ? { background: "var(--ok-soft)" } : {}}>
                    <td className="mono" style={{ fontWeight: 700, color: isRec ? "var(--ok)" : "var(--accent-ink)" }}>{id}</td>
                    <td style={{ fontWeight: isRec ? 700 : 400 }}>{LABELS[id]}</td>
                    <td className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{SOLVER[id]}</td>
                    <td className="num">{m ? fmtUSD(m.total_cost_usd)    : <span style={{color:"var(--danger)"}}>—</span>}</td>
                    <td className="num">{m ? fmtKm(m.avg_distance_km)    : "—"}</td>
                    <td className="num">{m ? fmtPct(m.coverage_within_150km_pct) : "—"}</td>
                    <td className="num">{m ? (m.avg_lead_time_hrs||0).toFixed(2) + " h" : "—"}</td>
                    <td className="num">{r?.opened_hubs?.length ?? "—"}</td>
                    <td>
                      {!r
                        ? <span className="badge danger" style={{fontSize:10}}><span className="dot"/>Error</span>
                        : isRec
                        ? <span className="badge accent" style={{fontSize:10}}><span className="dot"/>Recommended</span>
                        : <span className="badge healthy" style={{fontSize:10}}><span className="dot"/>Optimal</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </window.Card>

      {/* Detail panel for selected scenario */}
      {selResult && selResult.opened_hubs && (
        <window.Card
          title={sel + " · " + LABELS[sel] + " — " + selResult.opened_hubs.length + " hubs selected"}
          sub={"Solver: " + SOLVER[sel] + " · CBC · PuLP"}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total cost (USD/yr)",  v: fmtUSD(selResult.metrics?.total_cost_usd) },
              { label: "Avg distance",         v: fmtKm(selResult.metrics?.avg_distance_km) },
              { label: "Avg lead time",        v: (selResult.metrics?.avg_lead_time_hrs||0).toFixed(2) + " hrs" },
              { label: "Coverage ≤150km",      v: fmtPct(selResult.metrics?.coverage_within_150km_pct) },
              { label: "CO₂ emissions",        v: (selResult.metrics?.co2_emissions_kg||0).toLocaleString("en",{maximumFractionDigits:0}) + " kg" },
              { label: "Total demand",         v: ((selResult.metrics?.total_tons||0)/1000).toFixed(1) + "k t" },
            ].map(kv => (
              <div key={kv.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "10px 14px" }}>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{kv.label}</div>
                <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginTop: 3 }}>{kv.v}</div>
              </div>
            ))}
          </div>
          <table className="tbl">
            <thead><tr><th>Hub ID</th><th className="num">Lat</th><th className="num">Lon</th><th className="num">Capacity (t)</th><th className="num">Fixed cost</th></tr></thead>
            <tbody>
              {selResult.opened_hubs.map(h => (
                <tr key={h.id} className="hoverable">
                  <td className="mono" style={{ fontWeight: 600, color: "var(--accent-ink)" }}>{h.id}</td>
                  <td className="num">{h.lat.toFixed(4)}</td>
                  <td className="num">{h.lon.toFixed(4)}</td>
                  <td className="num">{(h.capacity_tons||0).toLocaleString()}</td>
                  <td className="num">${(h.fixed_cost||0).toLocaleString("en",{maximumFractionDigits:0})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>
      )}
    </div>
  );
}

window.PageOptimize = PageOptimize;
