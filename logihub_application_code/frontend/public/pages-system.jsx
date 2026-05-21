// LogiHub PRD v1.0 — System Data pages: Warehouse Directory, Seasonal Events
const { useState: useStateSys } = React;

// ════════════════════════════════════════════════════════════
// 04 — WAREHOUSE DIRECTORY (F-04 · F-06 · US-06)
// ════════════════════════════════════════════════════════════
function PageDirectory() {
  const [tab, setTab] = useStateSys("catalog"); // catalog | distance | corridors
  const dir = window.DIRECTORY;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">04 · Warehouse Directory · F-04 + F-06</div>
        <h1 className="page-title">Warehouse directory & distance matrix</h1>
        <div className="page-sub">
          The system manages {window.fmtNum(dir.total)} warehouses across 17 provinces, refreshed quarterly
          (refreshed {dir.refreshedOn}). The business uploads nothing — the engine looks these up automatically for any expansion plan.
        </div>
      </div>

      <window.KPIStrip>
        <window.KPI label="Total warehouses" value={window.fmtNum(dir.total)} foot="Quarterly refresh · F-04"/>
        <window.KPI label="Cold-chain capacity" value={window.fmtNum(dir.byCert.find(c => c.id === "cold_deep").n + dir.byCert.find(c => c.id === "cold_mild").n)} foot="deep + mild · certified"/>
        <window.KPI label="High-security sites" value={window.fmtNum(dir.byCert.find(c => c.id === "high_security").n)} foot="Premium electronics ready"/>
        <window.KPI label="GDP-pharma sites" value={window.fmtNum(dir.byCert.find(c => c.id === "gdp").n)} foot="Vaccine + drug-compliant"/>
        <window.KPI label="Distance matrix" value="17 × 17" foot="km · normal hrs · peak hrs"/>
      </window.KPIStrip>

      <window.Seg
        options={[
          { value: "catalog",   label: "Directory catalog" },
          { value: "distance",  label: "Distance matrix · F-06" },
          { value: "corridors", label: "Top corridors" },
        ]}
        value={tab} onChange={setTab}/>

      {tab === "catalog"   && <DirectoryCatalog/>}
      {tab === "distance"  && <DistanceMatrix/>}
      {tab === "corridors" && <Corridors/>}
    </div>
  );
}

function DirectoryCatalog() {
  const dir = window.DIRECTORY;
  return (
    <>
      <div className="three-col">
        <window.Card title="By ownership kind" sub="Total 4,412 sites">
          <window.HBars items={dir.byKind.map(k => ({
            label: k.k === "owned" ? "Owned" : k.k === "long_lease" ? "Long-term lease" : k.k === "short_lease" ? "Short-term lease" : "Seasonal",
            value: k.n, formatted: window.fmtNum(k.n)
          }))}/>
        </window.Card>

        <window.Card title="By certification" sub="Some warehouses hold multiple certs">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dir.byCert.map(c => (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }}></span>
                <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{c.name}</span>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>{window.fmtNum(c.n)}</span>
              </div>
            ))}
          </div>
        </window.Card>

        <window.Card title="Information trust" sub="Verified vs. self-reported · F-04">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {dir.trust.map(t => (
              <div key={t.level}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--ink-2)" }}>{t.level}</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{window.fmtPct(t.pct, 0)}</span>
                </div>
                <div className="bar" style={{ height: 8 }}>
                  <span className={t.level === "Verified" ? "ok" : t.level === "Self-reported" ? "warn" : ""}
                    style={{ width: (t.pct * 100) + "%", background: t.level === "Inferred" ? "var(--ink-4)" : undefined }}></span>
                </div>
              </div>
            ))}
            <div className="hint">Engine adjusts cost confidence intervals based on trust level.</div>
          </div>
        </window.Card>
      </div>

      <window.Card title="Sample directory rows" sub="10 of 4,412 · 12 fields each"
        actions={<>
          <button className="btn"><window.Icon name="filter"/> Filter</button>
          <button className="btn"><window.Icon name="search"/> Search</button>
        </>}>
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Region</th>
              <th className="num">Capacity</th><th>Certifications</th>
              <th>Rent status</th><th className="num">Monthly cost</th>
              <th className="num">Cost / m³</th><th>Trust</th>
            </tr>
          </thead>
          <tbody>
            {window.DIRECTORY_SAMPLE.map(w => (
              <tr key={w.id} className="hoverable">
                <td className="mono" style={{ fontSize: 11.5 }}>{w.id}</td>
                <td style={{ color: "var(--ink)", fontWeight: 500 }}>{w.name}</td>
                <td style={{ fontSize: 12 }}>{window.REGION_BY_ID[w.region].name}</td>
                <td className="num">{window.fmtNum(w.cap)} m³</td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {w.certs.map(c => (
                      <span key={c} className="badge outline" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>{c}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={"badge " + (w.rent === "available" ? "healthy" : w.rent === "long_lease" ? "info" : "warn")}>
                    <span className="dot"></span>{w.rent}
                  </span>
                </td>
                <td className="num">₩{window.fmtKRW(w.monthlyKRW)}</td>
                <td className="num">₩{window.fmtNum(w.cost_m3)}</td>
                <td>
                  <span className={"badge " + (w.trust === "Verified" ? "healthy" : w.trust === "Self-reported" ? "warn" : "neutral")}
                    style={{ fontSize: 10.5 }}>
                    <span className="dot"></span>{w.trust}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </window.Card>

      <div className="two-col">
        <window.Card title="Map · directory density by region" sub="Tile shade = warehouses available per region">
          <div style={{ height: 440 }}>
            <window.KoreaMap
              showHubs={false}
              highlightRegions={Object.fromEntries(window.DIRECTORY.byRegion.map(r => [r.region, Math.min(1, r.n / 1100)]))}
              legend={
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                  <span style={{ width: 80, height: 8, background: "linear-gradient(90deg, oklch(94% 0.025 205), oklch(46% 0.09 205))", borderRadius: 4 }}></span>
                  <span style={{ color: "var(--ink-3)" }}>0 → 1,100 warehouses</span>
                </div>
              }/>
          </div>
        </window.Card>

        <window.RecPanel
          what="Capital corridor (Seoul + Gyeonggi + Incheon) holds 47% of all available capacity."
          why="Regional concentration mirrors demand — the engine prefers leasing from Anseong (1,087 sites in Gyeonggi) when P2 picks expansion."
          action="Jeju has only 37 warehouses → engine flags it as a blind zone for Plan P3 and proposes a Blind-zone Relief station (see Warehouse Roles)."
          impact="Trust mix 72% Verified ⇒ the engine keeps a ±5% confidence band on estimated fixed cost."/>
      </div>
    </>
  );
}

function DistanceMatrix() {
  const D = window.DISTANCE;
  const regions = window.REGIONS.slice(0, 10); // show first 10 for fit
  const max = Math.max(...regions.flatMap(o => regions.map(d => D[o.id][d.id])));

  return (
    <>
      <window.Card title="Distance matrix · F-06"
        sub="Road km · proxy Haversine + road-factor · 17 × 17 (showing 10 × 10 sample)"
        actions={<window.Seg compact options={["km","normal hrs","peak hrs"]} value="km" onChange={()=>{}}/>}>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", left: 0, background: "var(--surface-2)" }}>From ↓ / To →</th>
                {regions.map(r => (
                  <th key={r.id} className="num mono" style={{ fontSize: 10 }}>{r.name.slice(0,4)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regions.map(o => (
                <tr key={o.id}>
                  <td style={{ position: "sticky", left: 0, background: "var(--surface)", fontWeight: 500, fontSize: 12 }}>{o.name}</td>
                  {regions.map(d => {
                    const v = D[o.id][d.id];
                    const intensity = v / max;
                    return (
                      <td key={d.id} className="num mono"
                        style={{ fontSize: 10.5,
                          background: o.id === d.id ? "var(--surface-3)" :
                            `color-mix(in oklch, oklch(56% 0.11 205) ${(intensity * 60).toFixed(0)}%, white)`,
                          color: intensity > 0.55 ? "white" : "var(--ink)" }}>
                        {o.id === d.id ? "—" : v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hint" style={{ marginTop: 10 }}>
          Each pair carries 3 layers: distance (km), truck-hours at normal hours, truck-hours at peak.
          The engine uses the peak layer for every event in Filter 2 (seasonal multiplier).
        </div>
      </window.Card>

      <window.Card title="Ports & airports · 5 hubs" sub="Distance from every warehouse to each gateway is pre-computed">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {window.PORTS.map(p => (
            <div key={p.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14, background: "var(--surface)" }}>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.type}</div>
              <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600, marginTop: 4 }}>{p.name}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
                lat/lng {p.x.toFixed(3)}, {p.y.toFixed(3)}
              </div>
            </div>
          ))}
        </div>
      </window.Card>
    </>
  );
}

function Corridors() {
  return (
    <>
      <window.Card title="Top busiest corridors" sub="50 corridors monitored · 8 shown · F-06"
        actions={<button className="btn"><window.Icon name="download"/> Export full 50</button>}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Corridor</th>
              <th className="num">km</th>
              <th className="num">Hrs · normal</th>
              <th className="num">Hrs · peak</th>
              <th className="num">Lanes</th>
              <th className="num">Utilisation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {window.CORRIDORS.map(c => {
              const [tone, lbl] = c.status === "congested" ? ["danger","Congested"]
                : c.status === "near" ? ["warn","Near capacity"]
                : ["healthy","Healthy"];
              return (
                <tr key={c.id} className="hoverable">
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      <span style={{ color: "var(--ink-2)" }}>{window.REGION_BY_ID[c.origin].name}</span>
                      <window.Icon name="arrow-right" size={12}/>
                      <span style={{ color: "var(--ink)" }}>{window.REGION_BY_ID[c.dest].name}</span>
                    </div>
                  </td>
                  <td className="num">{c.km}</td>
                  <td className="num">{c.hrs.toFixed(1)}</td>
                  <td className="num" style={{ color: "var(--warn)" }}>{c.peak.toFixed(1)}</td>
                  <td className="num">{c.lanes}</td>
                  <td className="num">
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <div className="bar" style={{ width: 48, height: 4 }}>
                        <span className={c.util >= 1 ? "danger" : c.util >= 0.9 ? "warn" : "ok"}
                          style={{ width: Math.min(100, c.util * 100) + "%" }}></span>
                      </div>
                      <span className="mono" style={{ fontSize: 11 }}>{window.fmtPct(c.util)}</span>
                    </div>
                  </td>
                  <td><span className={"badge " + tone}><span className="dot"></span>{lbl}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </window.Card>

      <window.RecPanel
        what="One congested corridor (Incheon ↔ Busan · 104% peak), one near-capacity (Seoul ↔ Daegu · 97%)."
        why="Both run through the main corridor of Plan P2 — accounting for 28% of forecast volume in month 11."
        action="The engine recommends a Pyeongtaek bypass in the Black Friday playbook (Playbook §10) and daily monitoring after Oct 25."
        impact="Avoids ~₩180M overflow penalty and 6,200 late orders inside the 11.11 – 11.30 window."/>
    </>
  );
}
window.PageDirectory = PageDirectory;

// ════════════════════════════════════════════════════════════
// 05 — SEASONAL EVENTS (F-05 · US-07)
// ════════════════════════════════════════════════════════════
function PageEvents() {
  const [typeFilter, setTypeFilter] = useStateSys("all");
  const events = typeFilter === "all" ? window.EVENTS : window.EVENTS.filter(e => e.type === typeFilter);
  const co = window.COMPANY;
  const industry = window.INDUSTRY_BY_ID[co.industry];

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">05 · Seasonal Events · F-05</div>
        <h1 className="page-title">Seasonal events library</h1>
        <div className="page-sub">
          30+ events across 4 types, refreshed quarterly. Each event carries exact dates, a demand multiplier × per 7 product groups,
          and affected regions. The engine filters by the company's industry when generating the playbook.
        </div>
      </div>

      <window.KPIStrip>
        <window.KPI label="Events on file" value={window.EVENTS.length}
          foot="30+ in full library · sample shown"/>
        <window.KPI label="Cultural" value={window.EVENTS.filter(e => e.type === "culture").length} foot="Recurring · holidays + harvests"/>
        <window.KPI label="Commerce" value={window.EVENTS.filter(e => e.type === "commerce").length} foot="11.11 · Black Friday · year-end"/>
        <window.KPI label="Surprise risk" value={window.EVENTS.filter(e => e.type === "surprise").length} foot="Strikes · typhoon · pandemic proxies"/>
        <window.KPI label="Industry filter" value={industry.en}
          foot={<><span className="badge accent"><span className="dot"></span>Filtered by profile</span></>}/>
      </window.KPIStrip>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <window.Seg
          options={[
            { value: "all",       label: "All types" },
            ...window.EVENT_TYPES.map(t => ({ value: t.id, label: t.en })),
          ]}
          value={typeFilter} onChange={setTypeFilter}/>
        <div style={{ flex: 1 }}></div>
        <button className="btn"><window.Icon name="download"/> Export full library</button>
      </div>

      <window.Card title="Event calendar · next 12 months" sub="Lateral position = month · cell tint = max uplift">
        <EventTimeline events={events}/>
      </window.Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {events.map(e => {
          const type = window.EVENT_TYPES.find(t => t.id === e.type);
          const maxUp = Math.max(...Object.values(e.impact));
          const minUp = Math.min(...Object.values(e.impact));
          const isDisruption = minUp < 1.0;
          return (
            <div key={e.id} style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)",
              padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: type.color }}></span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{type.en}</span>
                </div>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)" }}>{e.id}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.01em" }}>{e.name}</div>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                {e.start} → {e.end} · {Math.ceil((new Date(e.end) - new Date(e.start)) / 86400000) + 1} days
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 4 }}>
                {Object.entries(e.impact).map(([g, mult]) => (
                  <div key={g} style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px",
                    background: mult >= 1 ? "var(--surface-2)" : "var(--danger-soft)", borderRadius: 6, fontSize: 11.5 }}>
                    <span style={{ color: "var(--ink-2)" }}>{g}</span>
                    <span className="mono" style={{ fontWeight: 600, color: mult >= 1 ? (mult > 1.5 ? "var(--danger)" : "var(--accent)") : "var(--danger)" }}>
                      ×{mult.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5, marginTop: 4 }}>
                <b style={{ color: "var(--ink-2)" }}>Affected: </b>{e.regions.map(r => window.REGION_BY_ID[r].name).join(" · ")}
              </div>
              <div className="divider" style={{ margin: "4px 0" }}></div>
              <div style={{ fontSize: 11.5, color: "var(--ink-2)", fontStyle: "italic" }}>{e.note}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={"badge " + (isDisruption ? "danger" : maxUp > 1.5 ? "warn" : "info")} style={{ fontSize: 10 }}>
                  <span className="dot"></span>{isDisruption ? "Disruption" : maxUp > 1.5 ? "High uplift" : "Mild uplift"}
                </span>
                <button className="btn ghost" style={{ fontSize: 11 }}>View playbook <window.Icon name="arrow-right" size={11}/></button>
              </div>
            </div>
          );
        })}
      </div>

      <window.Card title="Spatial demand shift · Lunar New Year reference"
        sub="Demand migrates from rural provinces to major cities, derived from public mobility data">
        <div style={{ height: 320 }}>
          <window.KoreaMap
            showHubs={false}
            highlightRegions={{
              seoul: 0.85, gyeonggi: 0.78, busan: 0.72, daegu: 0.55, incheon: 0.50,
              jeonbuk: 0.12, jeonnam: 0.10, chungbuk: 0.16, chungnam: 0.18, gangwon: 0.20,
              gyeongbuk: 0.18, gyeongnam: 0.32, ulsan: 0.30,
              daejeon: 0.45, sejong: 0.18, gwangju: 0.30, jeju: 0.42,
            }}
            legend={
              <div style={{ fontSize: 11 }}>
                <div style={{ marginBottom: 4 }}><b>Seollal · 2027-02-06 → 02-12</b></div>
                <div style={{ color: "var(--ink-3)" }}>Darker = demand up · lighter = demand down</div>
              </div>
            }/>
        </div>
      </window.Card>
    </div>
  );
}

function EventTimeline({ events }) {
  const months = ["Jun-26","Jul","Aug","Sep","Oct","Nov","Dec","Jan-27","Feb","Mar","Apr","May"];
  const monthIndex = (date) => {
    const d = new Date(date);
    const base = new Date("2026-06-01");
    return Math.floor((d - base) / (1000 * 60 * 60 * 24 * 30));
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px repeat(12, 1fr)", gap: 1, background: "var(--border)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
      <div style={{ background: "var(--surface-2)", padding: "10px 12px", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Event</div>
      {months.map(m => (
        <div key={m} style={{ background: "var(--surface-2)", padding: "10px 0", fontSize: 10, color: "var(--ink-3)", textAlign: "center", fontFamily: "var(--font-mono)" }}>{m}</div>
      ))}
      {events.map(e => {
        const idx = monthIndex(e.start);
        const max = Math.max(...Object.values(e.impact));
        const min = Math.min(...Object.values(e.impact));
        const disruption = min < 1;
        const intensity = disruption ? Math.min(1, (1 - min) * 2) : Math.min(1, (max - 1));
        const type = window.EVENT_TYPES.find(t => t.id === e.type);
        return (
          <React.Fragment key={e.id}>
            <div style={{ background: "var(--surface)", padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500, lineHeight: 1.3 }}>{e.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{type.en}</div>
            </div>
            {months.map((m, i) => (
              <div key={i} style={{ background: "var(--surface)", padding: "6px 4px", display: "grid", placeItems: "center", minHeight: 36 }}>
                {i === idx && (
                  <div style={{
                    background: disruption ? `color-mix(in oklch, var(--danger) ${(intensity * 80).toFixed(0)}%, white)`
                      : `color-mix(in oklch, ${type.color} ${(intensity * 80 + 20).toFixed(0)}%, white)`,
                    color: intensity > 0.5 ? "white" : "var(--ink)",
                    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                    padding: "3px 6px", borderRadius: 4, whiteSpace: "nowrap"
                  }}>
                    {disruption ? "↓" : "↑"}{disruption ? (1 - min).toFixed(2) : "×" + max.toFixed(1)}
                  </div>
                )}
              </div>
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
}
window.PageEvents = PageEvents;
