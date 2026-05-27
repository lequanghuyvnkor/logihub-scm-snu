// LogiHub v2 — Tier A · Setup pages
// 00 Overview, 01 Company Profile, 02 Data Upload (4-slot), 03 Existing Warehouses (A/B mode)
const { useState: useStateSetup } = React;

// ════════════════════════════════════════════════════════════
// 00 — OVERVIEW (Resume banner + KPIs + 5-stage pipeline)
// ════════════════════════════════════════════════════════════
function PageOverview2({ navigate, flow }) {
  const co = window.COMPANY;
  const industry = window.INDUSTRY_BY_ID[co.industry];
  const engineRan = flow.optimizationStatus === "done";
  const resumeStep = window.findStepInfo(flow.resumeStep || "profile");

  // Best scenario from window.SCENARIOS (rank 1)
  const bestScenario = window.SCENARIOS ? window.SCENARIOS.find(s => s.rank === 1) || window.SCENARIOS[2] : null;
  const totalDemand = window.REGIONS.reduce((a, r) => a + r.demand, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">00 · Overview</div>
        <h1 className="page-title">Network Control Tower</h1>
        <div className="page-sub">
          Gated linear flow · 3 tiers · 11 steps. Setup → Decision → Explore — each step unlocks only when the prior gate is satisfied.
          Output: warehouse network allocation across 9 optimization scenarios + implementation playbook and roadmap.
        </div>
      </div>

      {/* Resume banner */}
      <div className="resume-banner">
        <div>
          <div className="rb-eyebrow">
            {engineRan ? "Engine solved · 9 scenarios completed" : "Start your network optimization"}
          </div>
          <h2>
            {engineRan
              ? "Network optimized · " + (bestScenario ? "S" + bestScenario.id + " recommended · ₩" + window.fmtKRW(bestScenario.totalCost * 1_000_000) + " / mo" : "Results ready")
              : "Upload your data to begin — then run all 9 scenarios in one pass"}
          </h2>
          <p>
            {engineRan
              ? "Scenario " + (bestScenario?.id || "S2") + " (" + (bestScenario?.name || "Balanced Cost & Capacity") + ") wins the cost-service trade-off. Open the Warehouse Map to see which sites to keep, open, downgrade, or close."
              : "The engine runs 9 solver types in parallel (UFLP, P-median, CFLP, MCLP, Hybrid) and returns a full comparison matrix. Start with Company Profile and Data Upload."}
          </p>
          <div className="rb-mini">
            <span>Company <b>{co.name}</b></span>
            <span>Industry <b>{industry.en}</b></span>
            <span>Scenarios <b>{engineRan ? "9 / 9" : "0 / 9"}</b></span>
            <span>Upload <b>{flow.uploadValidated ? "✓ Done" : "Pending"}</b></span>
          </div>
        </div>
        <button className="btn resume" onClick={() => navigate(engineRan ? "map" : (flow.resumeStep || "profile"))}>
          {engineRan ? "Open Warehouse Map" : "Start · " + (resumeStep?.name || "Company Profile")} <window.Icon name="arrow-right"/>
        </button>
      </div>

      <window.PipelineV2 stepId="overview" flow={flow}/>

      <window.KPIStrip>
        <window.KPI label="Best scenario" value={engineRan ? (bestScenario?.tag || "—") : "—"}
          foot={engineRan ? (bestScenario?.id || "S2") + " · rank #1" : "Run engine to populate"}/>
        <window.KPI label="Monthly cost"
          value={engineRan && bestScenario ? "₩" + window.fmtKRW(bestScenario.totalCost * 1_000_000) : "—"}
          delta={engineRan && bestScenario ? "−" + window.fmtPct(bestScenario.saving, 1) : null} deltaKind="up"
          foot={engineRan ? "vs baseline S0" : "Waiting on engine"}/>
        <window.KPI label="Demand covered" value={window.fmtNum(totalDemand)} unit="orders/mo"
          foot="17 regions · 7 product families"/>
        <window.KPI label="Scenarios solved" value={engineRan ? "9 / 9" : "0 / 9"}
          foot={engineRan ? "All solver types converged" : "Run engine first"}/>
        <window.KPI label="Data uploaded" value={flow.uploadValidated ? "Ready" : "Pending"}
          foot={flow.uploadValidated ? "Shipping history loaded" : "Upload in Step 02"}/>
      </window.KPIStrip>

      <div className="section-grid">
        <window.Card title="Tier A · Setup — required" sub="Declare company + load data"
          actions={<button className="btn" onClick={() => navigate("profile")}>Open Setup <window.Icon name="arrow-right"/></button>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "profile", name: "Company Profile" },
              { id: "upload",  name: "Data Upload"     },
              { id: "owned",   name: "Existing Warehouses", optional: true },
            ].map(it => {
              const st = window.getStepStatus(it.id, flow);
              return (
                <div key={it.id} onClick={() => navigate(it.id)}
                  style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12,
                    padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8,
                    alignItems: "center", cursor: "pointer", border: "1px solid var(--border)" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%",
                    background: st === "done" ? "var(--ok)" : st === "inprogress" ? "var(--accent)" : "var(--surface-3)",
                    color: st === "available" ? "var(--ink-3)" : "#fff",
                    display: "grid", placeItems: "center", fontSize: 11 }}>
                    {st === "done" ? "✓" : st === "inprogress" ? "●" : "○"}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{it.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {it.id === "profile" && (st === "done" ? "Company profile saved" : "5 fields · auto-tune size & SLA")}
                      {it.id === "upload"  && (st === "done" ? "Data validated · ready for engine" : "Slot 1 required · 3 slots optional")}
                      {it.id === "owned"   && (st === "done" ? "Warehouses declared · improve-existing mode" : "Optional · pick mode A / B")}
                    </div>
                  </div>
                  {it.optional && <span className="badge outline" style={{ fontSize: 10 }}>Optional</span>}
                  <span className={"badge " + (st === "done" ? "healthy" : st === "inprogress" ? "accent" : "neutral")}>
                    <span className="dot"></span>{st === "done" ? "Done" : st === "inprogress" ? "In progress" : "Available"}
                  </span>
                </div>
              );
            })}
          </div>
        </window.Card>

        <window.Card title="System status · §7 NFRs" sub="Performance · accuracy · compliance"
          actions={<span className="badge healthy"><span className="dot"></span>All targets met</span>}>
          <table className="tbl">
            <thead><tr><th>Indicator</th><th>Target</th><th>Actual</th></tr></thead>
            <tbody>
              {window.NFR.slice(0, 6).map(n => (
                <tr key={n.id}>
                  <td style={{ color: "var(--ink)", fontWeight: 500 }}>{n.name}</td>
                  <td className="mono" style={{ color: "var(--ink-3)" }}>{n.target}</td>
                  <td className="mono" style={{ color: "var(--ink)" }}>{n.actual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>
      </div>

      <div className="two-col">
        <window.Card title="Tier B · Decision — core axis"
          sub="Run 9 scenarios · pick the best · see network on map"
          actions={<button className="btn" onClick={() => navigate(engineRan ? "map" : "optimize")}>
            {engineRan ? "Open Map" : "Run engine"} <window.Icon name="arrow-right"/>
          </button>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "optimize", name: "Run Optimization" },
              { id: "map",      name: "Warehouse Map" },
              { id: "roles",    name: "Warehouse Roles" },
            ].map(it => {
              const st = window.getStepStatus(it.id, flow);
              const locked = st === "locked";
              return (
                <div key={it.id} onClick={() => !locked && navigate(it.id)}
                  style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12,
                    padding: "10px 12px",
                    background: locked ? "var(--surface-3)" : "var(--surface-2)",
                    borderRadius: 8, alignItems: "center",
                    cursor: locked ? "not-allowed" : "pointer",
                    border: "1px solid var(--border)",
                    opacity: locked ? 0.55 : 1 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%",
                    background: st === "done" ? "var(--ok)" : st === "locked" ? "var(--surface)" : "var(--accent)",
                    border: st === "locked" ? "1.5px dashed var(--ink-4)" : "none",
                    color: st === "locked" ? "var(--ink-4)" : "#fff",
                    display: "grid", placeItems: "center", fontSize: 11 }}>
                    {st === "done" ? "✓" : st === "locked" ? "🔒" : "●"}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{it.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {it.id === "optimize" && (engineRan ? "9 scenarios solved · best scenario identified" : "Run 9 scenarios in parallel · ~90s")}
                      {it.id === "map"      && (engineRan ? "Network plan · 4 actions (Keep / Open / Downgrade / Close)" : "Locked · run optimization first")}
                      {it.id === "roles"    && (engineRan ? "8 standard roles · all warehouses classified" : "Locked · run optimization first")}
                    </div>
                  </div>
                  <span className={"badge " + (st === "done" ? "healthy" : st === "locked" ? "neutral" : "accent")}>
                    <span className="dot"></span>{st === "done" ? "Ready" : st === "locked" ? "Locked" : "Available"}
                  </span>
                </div>
              );
            })}
          </div>
        </window.Card>

        <window.Card title="Tier C · Explore — drill-down" sub="Forecast · Events · Scenarios · Playbook · Case · Roadmap · Export">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
            {[
              { id: "forecast", name: "Demand Forecast", icon: "chart" },
              { id: "events",   name: "Seasonal Events", icon: "calendar" },
              { id: "scenarios",name: "Scenarios",       icon: "tune" },
              { id: "playbook", name: "Event Playbook",  icon: "spark" },
              { id: "case",     name: "Business Case",   icon: "money" },
              { id: "roadmap",  name: "Roadmap",         icon: "arrow-right" },
              { id: "export",   name: "Export bundle",   icon: "download" },
            ].map(it => {
              const st = window.getStepStatus(it.id, flow);
              const locked = st === "locked";
              return (
                <div key={it.id} onClick={() => !locked && navigate(it.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 11px",
                    background: locked ? "var(--surface-3)" : "var(--surface)",
                    border: "1px solid var(--border)", borderRadius: 8,
                    cursor: locked ? "not-allowed" : "pointer",
                    opacity: locked ? 0.55 : 1, fontSize: 12.5 }}>
                  <window.Icon name={it.icon} size={12}/>
                  <span style={{ flex: 1, color: "var(--ink)" }}>{it.name}</span>
                  {locked && <span style={{ fontSize: 11, color: "var(--ink-4)" }}>🔒</span>}
                  {!locked && st === "done" && <window.Icon name="check" size={12}/>}
                </div>
              );
            })}
          </div>
          <div className="hint" style={{ marginTop: 10 }}>
            Tier C uses <b>tab pills</b> — not required to follow order. Forecast + Events can be viewed before engine runs; remaining tabs open after Tier B is complete.
          </div>
        </window.Card>
      </div>

      <window.StepFooter stepId="overview" flow={flow} onNavigate={navigate}
        gate={{ ok: true }}
        customNext={() => navigate("profile")}/>
    </div>
  );
}
window.PageOverview2 = PageOverview2;

// ════════════════════════════════════════════════════════════
// 01 — COMPANY PROFILE
// ════════════════════════════════════════════════════════════
function PageProfile2({ navigate, flow, setFlow }) {
  const co = window.COMPANY;
  const [size, setSize] = useStateSetup(co.size);
  const [industry, setIndustry] = useStateSetup(co.industry);
  const [sla, setSla] = useStateSetup(co.sla);
  const [budget, setBudget] = useStateSetup(co.budgetCapKRW / 1_000_000);
  const [priorityRegions, setPriority] = useStateSetup(co.priorityRegions);
  const [companyName, setCompanyName] = useStateSetup(co.name);

  const sizeMeta = window.SIZE_BY_ID[size];
  const indMeta  = window.INDUSTRY_BY_ID[industry];
  const togglePri = (id) => setPriority(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const gateOk = !!companyName && !!size && !!industry;
  const gateMsg = !gateOk ? "Need company + size + industry" : null;

  const inputStyle = {
    padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)",
    background: "var(--surface)", fontSize: 13, color: "var(--ink)", outline: "none",
  };

  const handleSave = () => {
    setFlow({ ...flow, profileSaved: true, visitedSteps: [...new Set([...flow.visitedSteps, "profile"])] });
  };

  return (
    <div className="page">
      <window.StepHeader tier="A" num="01" name="Company Profile"
        sub="5 fields are enough — the system auto-tunes late tolerance, cancellation rate, and reputation factor from the size band. The auto-tuned parameters panel on the right updates live as you change inputs."/>

      <div className="two-col">
        <window.Card title="Form · 5 required + 1 optional" sub="≤ 5 minutes to complete">
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <Field label="Company name *">
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} style={inputStyle}/>
            </Field>

            <Field label="Size band *">
              <window.Seg
                options={window.SIZE_BANDS.map(s => ({ value: s.id, label: s.label + " · " + s.rev }))}
                value={size} onChange={setSize}/>
              <div className="hint">{sizeMeta.rev} — auto-tuned: late ≤ {window.fmtPct(sizeMeta.lateOk)}, cancel {window.fmtPct(sizeMeta.cancelRate)}, reputation × {sizeMeta.repMult.toFixed(2)}.</div>
            </Field>

            <Field label="Primary industry *">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {window.INDUSTRIES.map(i => (
                  <button key={i.id} onClick={() => setIndustry(i.id)}
                    style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8,
                      border: "1px solid " + (industry === i.id ? "var(--accent)" : "var(--border)"),
                      background: industry === i.id ? "var(--accent-soft)" : "var(--surface)",
                      cursor: "pointer" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{i.name}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>SLA {i.sla}h</div>
                  </button>
                ))}
              </div>
              <div className="hint">{indMeta.name} requires: {indMeta.needs.length ? indMeta.needs.join(" · ") : "no special certs"} · default SLA {indMeta.sla} h.</div>
            </Field>

            <Field label="Delivery commitment · SLA (h)">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="range" min="2" max="72" value={sla} className="range-input"
                  onChange={(e) => setSla(+e.target.value)} style={{ flex: 1 }}/>
                <span className="mono" style={{ width: 60, textAlign: "right", color: "var(--ink)", fontSize: 14, fontWeight: 600 }}>{sla} h</span>
              </div>
              <div className="hint">Default {indMeta.sla} h for {indMeta.en}.</div>
            </Field>

            <Field label="Budget cap (₩ million / year)">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="number" value={budget} onChange={(e) => setBudget(+e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}/>
                <span className="mono" style={{ color: "var(--ink-3)", fontSize: 12 }}>= ₩{window.fmtKRW(budget * 1_000_000)} / yr</span>
              </div>
              <div className="hint">Leave empty = no cap.</div>
            </Field>

            <Field label="Priority regions (optional)">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {window.REGIONS.map(r => {
                  const active = priorityRegions.includes(r.id);
                  return (
                    <button key={r.id} onClick={() => togglePri(r.id)}
                      style={{ padding: "5px 10px", borderRadius: 999, fontSize: 11.5,
                        background: active ? "var(--accent)" : "var(--surface-2)",
                        color: active ? "#fff" : "var(--ink-2)",
                        border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
                        cursor: "pointer" }}>{r.name}</button>
                  );
                })}
              </div>
              <div className="hint">{priorityRegions.length} of 17 selected. Empty = engine proposes.</div>
            </Field>

            <button className="btn primary" style={{ justifyContent: "center", marginTop: 4 }}
              onClick={handleSave} disabled={!gateOk}>
              <window.Icon name="check"/> Save profile
            </button>
            {flow.profileSaved && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ok)" }}>
                <window.Icon name="check" size={12}/> Profile saved — proceed to Data Upload
              </div>
            )}
          </div>
        </window.Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <window.Card title="Auto-tuned parameters" sub="System derives from size + industry — read-only">
            <table className="tbl">
              <tbody>
                <tr><td style={{ color: "var(--ink-3)" }}>Acceptable late share</td>
                    <td className="num mono">{window.fmtPct(sizeMeta.lateOk)}</td></tr>
                <tr><td style={{ color: "var(--ink-3)" }}>Cancel rate when late</td>
                    <td className="num mono">{window.fmtPct(sizeMeta.cancelRate)}</td></tr>
                <tr><td style={{ color: "var(--ink-3)" }}>Reputation multiplier</td>
                    <td className="num mono">{sizeMeta.repMult.toFixed(2)}</td></tr>
                <tr><td style={{ color: "var(--ink-3)" }}>Required certs</td>
                    <td className="mono" style={{ textAlign: "right", fontSize: 11 }}>
                      {indMeta.needs.length ? indMeta.needs.join(" · ") : "—"}</td></tr>
                <tr><td style={{ color: "var(--ink-3)" }}>Engine mode</td>
                    <td className="mono" style={{ textAlign: "right", fontSize: 11.5 }}>
                      {flow.ownedWHDeclared === "declared" ? "improve-existing" : "design-from-scratch"}
                    </td></tr>
              </tbody>
            </table>
          </window.Card>

          <window.RecPanel
            what={"Profile is " + sizeMeta.label + " · " + indMeta.name + " — defaults calibrated."}
            why={"Size band " + sizeMeta.label + " ⇒ cancellation " + window.fmtPct(sizeMeta.cancelRate) + " and reputation × " + sizeMeta.repMult.toFixed(2) + " feed the ROI formula."}
            action="Save profile · then proceed to Data Upload (step 02) to run the 7-step validation."
            impact="These parameters drive revenue/reputation conversion in Business Case."/>
        </div>
      </div>

      <window.StepFooter stepId="profile" flow={flow} onNavigate={navigate}
        gate={{ ok: flow.profileSaved, msg: !flow.profileSaved ? "Save profile first" : null }}/>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      {children}
    </div>
  );
}
window.PageProfile2 = PageProfile2;

// ════════════════════════════════════════════════════════════
// 02 — DATA UPLOAD v2 — 4-slot grid (starts blank)
// ════════════════════════════════════════════════════════════
function PageUpload2({ navigate, flow, setFlow }) {
  // All slots start empty — user uploads their own data
  const initialSlots = {
    shipping: { uploaded: false },
    existing: { uploaded: false },
    sku:      { uploaded: false },
    costs:    { uploaded: false },
  };
  const [slots, setSlots] = useStateSetup(initialSlots);
  const [previewSlot, setPreviewSlot] = useStateSetup(null);

  const slotDefs = [
    { key: "shipping", required: true,
      title: "Shipping history",
      schema: "O/D · SKU · date · weight",
      formats: ".xlsx / .csv",
      purpose: "Demand input — feeds the forecast engine",
    },
    { key: "existing", required: false,
      title: "Existing warehouses",
      schema: "Code · address · capacity · cost · main group",
      formats: ".xlsx / .csv",
      purpose: "Enables 'improve existing' mode (else: design-from-scratch)",
    },
    { key: "sku", required: false,
      title: "Product master / SKU taxonomy",
      schema: "SKU code · group · tonPerM3 · cert needs",
      formats: ".xlsx / .csv",
      purpose: "Maps your SKUs to the 70-group product taxonomy",
    },
    { key: "costs", required: false,
      title: "Cost overrides",
      schema: "Region · rent/m³ · tariff · handling",
      formats: ".xlsx / .csv",
      purpose: "Override default proxy costs with enterprise rates",
    },
  ];

  const shippingDone = slots.shipping.uploaded;
  const filledCount = Object.values(slots).filter(s => s.uploaded).length;

  // Gate: shipping slot uploaded
  const gateOk = shippingDone;
  const gateMsg = !shippingDone ? "Upload shipping history (slot 1)" : null;

  // Simulate file upload
  const handleChooseFile = (key) => {
    const def = slotDefs.find(d => d.key === key);
    setSlots(prev => ({
      ...prev,
      [key]: { uploaded: true, fileName: key + "_data.xlsx", size: "—", rows: "loaded" }
    }));
  };

  // When gate passes, mark upload validated
  const handleConfirm = () => {
    if (gateOk) {
      setFlow({ ...flow, uploadValidated: true, visitedSteps: [...new Set([...flow.visitedSteps, "upload"])] });
    }
  };

  return (
    <div className="page">
      <window.StepHeader tier="A" num="02" name="Data Upload"
        sub="Load your enterprise data. 4 slots — slot 1 required, 3 optional. Each slot has a drag-drop zone and 7-step validation gate. Upload your OD shipping history to proceed."/>

      <window.KPIStrip>
        <window.KPI label="Slots filled" value={filledCount + " / 4"}
          foot={shippingDone ? "Required slot ✓" : "Required slot pending"}/>
        <window.KPI label="Rows ingested" value={shippingDone ? "Loaded" : "—"} foot="Pending upload"/>
        <window.KPI label="Validation" value={shippingDone ? "Ready" : "—"}
          foot={shippingDone ? "7-step gate will run" : "Upload file first"}/>
        <window.KPI label="Province normalisation" value={shippingDone ? "Auto" : "—"} foot="≥ 98% NFR target"/>
        <window.KPI label="SKU mapping" value={slots.sku.uploaded ? "Custom" : "Proxy"} foot="Of 70-code taxonomy"/>
        <window.KPI label="Status" value={flow.uploadValidated ? "Confirmed" : shippingDone ? "Ready" : "Waiting"}
          foot={<><span className={"badge " + (flow.uploadValidated ? "healthy" : shippingDone ? "accent" : "neutral")}><span className="dot"></span>{flow.uploadValidated ? "Done" : shippingDone ? "Confirm to proceed" : "Upload first"}</span></>}/>
      </window.KPIStrip>

      {/* 4-slot grid */}
      <div className="section-title-row">
        <h3>① Drop your files into 4 slots</h3>
        <span className="hint">Slot 1 required · slots 2–4 optional but unlock extra features</span>
      </div>
      <div className="slot-grid">
        {slotDefs.map(def => {
          const s = slots[def.key];
          return (
            <div key={def.key}
              className={"slot " + (def.required ? "required" : "optional") + " " + (s.uploaded ? "uploaded" : "empty")}>
              <div className="slot-head">
                <div>
                  <div className="slot-title">{def.title}</div>
                  <div className="slot-purpose">{def.purpose}</div>
                </div>
                {s.uploaded
                  ? <span className="badge healthy"><span className="dot"></span>Uploaded</span>
                  : <span className="badge neutral"><span className="dot"></span>Empty</span>}
              </div>

              {s.uploaded ? (
                <div className="file-row">
                  <div className="fname">
                    <window.Icon name="doc" size={14}/>{s.fileName}
                  </div>
                  <div className="fmeta">{s.size} · {s.rows}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                    <button className="btn ghost" style={{ fontSize: 11 }}>Replace</button>
                    <button className="btn ghost" style={{ fontSize: 11 }} onClick={() => setPreviewSlot(def.key)}>Preview</button>
                    <button className="btn ghost" style={{ fontSize: 11, marginLeft: "auto", color: "var(--danger)" }}
                      onClick={() => setSlots({ ...slots, [def.key]: { uploaded: false } })}>Remove</button>
                  </div>
                </div>
              ) : (
                <div className="drop-zone">
                  <div className="dz-icon"><window.Icon name="upload" size={14}/></div>
                  <div style={{ color: "var(--ink-2)", fontWeight: 500 }}>Drop your file here or click to browse</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>
                    {def.formats} · schema: {def.schema}
                  </div>
                  <button className="btn" style={{ marginTop: 6 }}
                    onClick={() => handleChooseFile(def.key)}>
                    Choose file…
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 7-step validation */}
      <div className="section-title-row" style={{ marginTop: 8 }}>
        <h3>② 7-step validation · runs after upload</h3>
        <span className="hint">Immutable snapshot + sha256 hash · 90-day retention</span>
      </div>
      <window.Card noBody>
        <div style={{ padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {window.VALIDATION_STEPS.map((s) => {
              const tone = shippingDone ? (s.status === "pass" ? "healthy" : s.status === "warn" ? "warn" : "danger") : "neutral";
              return (
                <div key={s.id} style={{
                  border: "1px solid var(--border)", borderRadius: 10, padding: 12,
                  background: !shippingDone ? "var(--surface-2)" : s.status === "warn" ? "var(--warn-soft)" : "var(--surface)",
                  display: "flex", flexDirection: "column", gap: 6, opacity: shippingDone ? 1 : 0.55 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>Step {s.id}</span>
                    <span className={"badge " + tone} style={{ fontSize: 10 }}>
                      <span className="dot"></span>{shippingDone ? (s.status === "pass" ? "Pass" : s.status === "warn" ? "Warn" : "Fail") : "Pending"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500, lineHeight: 1.35 }}>{s.name}</div>
                  <div className="divider" style={{ margin: "4px 0" }}></div>
                  <div style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.45 }}>{s.detail}</div>
                </div>
              );
            })}
          </div>
        </div>
      </window.Card>

      {/* Confirm upload */}
      {shippingDone && !flow.uploadValidated && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn primary" onClick={handleConfirm}>
            <window.Icon name="check"/> Confirm upload — proceed to engine
          </button>
        </div>
      )}
      {flow.uploadValidated && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px",
          background: "oklch(96% 0.03 155)", border: "1px solid color-mix(in oklch, var(--ok) 30%, transparent)",
          borderRadius: 10 }}>
          <window.Icon name="check" size={14}/>
          <span style={{ fontSize: 13, color: "var(--ok)", fontWeight: 500 }}>Upload confirmed — proceed to Run Optimization (step 04)</span>
        </div>
      )}

      <div className="two-col">
        <window.Card title="Snapshot / audit log" sub="Step 7 · sha256 + 90-day retention">
          <div className="audit-log">
            {shippingDone ? (
              <>
                <div className="row"><span className="ts">{new Date().toLocaleTimeString()}</span><span>📦 {slots.shipping.fileName} loaded</span></div>
                <div className="row"><span className="ts">—</span><span>Running 7-step validation…</span></div>
              </>
            ) : (
              <div style={{ color: "var(--ink-4)", fontSize: 12 }}>// Upload shipping history to begin validation</div>
            )}
          </div>
        </window.Card>

        <window.RecPanel
          what="Slot 1 (shipping history) is required. The 3 optional slots boost engine quality — existing warehouses unlock improve-existing mode; cost overrides replace proxy rent indices."
          why="The engine works best with at least 6 months of O/D shipping history across 5+ province pairs. Fewer data points yield less reliable hub placement recommendations."
          action="Upload your OD data in slot 1, confirm validation, then continue to Existing Warehouses (step 03) or jump to Run Optimization (step 04)."
          impact="Without slot 2: engine designs a brand-new network. Without slot 3: SKU mapping uses proxy coefficients."/>
      </div>

      <window.StepFooter stepId="upload" flow={flow} onNavigate={navigate}
        gate={{ ok: flow.uploadValidated, msg: !flow.uploadValidated ? (shippingDone ? "Click Confirm to proceed" : "Upload shipping history first") : null }}/>

      {previewSlot && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--surface)", width: 800, maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12, display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>Preview: {slotDefs.find(d => d.key === previewSlot)?.title}</h3>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>Showing sample data</div>
              </div>
              <button className="btn ghost" onClick={() => setPreviewSlot(null)}>✕ Close</button>
            </div>
            <div style={{ padding: 20, overflow: "auto" }}>
              {previewSlot === "shipping" ? (
                <table className="tbl">
                  <thead>
                    <tr><th>Date</th><th>Origin</th><th>Dest</th><th>SKU</th><th className="num">Weight (kg)</th><th>Truck</th><th className="num">Lead (h)</th><th className="num">Confidence</th></tr>
                  </thead>
                  <tbody>
                    {window.UPLOAD_PREVIEW.map((r, i) => (
                      <tr key={i} className="hoverable">
                        <td className="mono">{r.date}</td>
                        <td style={r.flag?.includes("origin") ? {color:"var(--danger)", fontWeight: 600} : {}}>{r.origin}</td>
                        <td style={r.flag?.includes("dest") ? {color:"var(--danger)", fontWeight: 600} : {}}>{r.dest}</td>
                        <td className="mono">{r.sku}</td>
                        <td className="num">{r.w}</td>
                        <td className="mono" style={{fontSize: 11}}>{r.truck || "—"}</td>
                        <td className="num">{r.lead || "—"}</td>
                        <td className="num">
                          <span className={"badge " + (r.conf >= 0.95 ? "healthy" : r.conf >= 0.8 ? "warn" : "danger")} style={{fontSize: 10}}>
                            {window.fmtPct(r.conf, 0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : previewSlot === "existing" ? (
                <table className="tbl">
                  <thead>
                    <tr><th>Code</th><th>Address</th><th className="num">Capacity (m³)</th><th>Kind</th><th className="num">Fixed Cost</th><th>Main Group</th><th className="num">Usage</th><th className="num">Cost/m³</th></tr>
                  </thead>
                  <tbody>
                    {window.OWNED_WAREHOUSES.map((r, i) => (
                      <tr key={i} className="hoverable">
                        <td className="mono">{r.code}</td>
                        <td>{r.addr}</td>
                        <td className="num">{window.fmtNum(r.cap_m3)}</td>
                        <td>{r.kind}</td>
                        <td className="num">₩{window.fmtKRW(r.fixedCostKRW)}</td>
                        <td>{r.mainGroup}</td>
                        <td className="num">{window.fmtPct(r.usage)}</td>
                        <td className="num">₩{window.fmtNum(r.costPerM3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : previewSlot === "sku" ? (
                <table className="tbl">
                  <thead>
                    <tr><th>SKU Code</th><th>Product Family</th><th className="num">Density (t/m³)</th><th>Required Certifications</th></tr>
                  </thead>
                  <tbody>
                    {[
                      { code: "EL-TELE-01", group: "Electronics", tPerM3: 0.12, certs: "High-security" },
                      { code: "FA-COAT-12", group: "Fashion", tPerM3: 0.08, certs: "Standard" },
                      { code: "FO-MEAT-04", group: "Food & Beverage", tPerM3: 0.45, certs: "Cold-deep (< −18°C)" },
                      { code: "FO-MILK-22", group: "Food & Beverage", tPerM3: 0.92, certs: "Cold-mild (0–10°C)" },
                      { code: "BE-CREM-08", group: "Beauty & Cosmetics", tPerM3: 0.35, certs: "Cold-mild (0–10°C)" },
                      { code: "LI-CHAI-03", group: "Lifestyle & Home", tPerM3: 0.15, certs: "Standard" },
                      { code: "SP-TENT-07", group: "Sports & Outdoors", tPerM3: 0.22, certs: "Standard" },
                    ].map((r, i) => (
                      <tr key={i} className="hoverable">
                        <td className="mono" style={{ fontWeight: 600, color: "var(--accent-ink)" }}>{r.code}</td>
                        <td>{r.group}</td>
                        <td className="num">{r.tPerM3.toFixed(2)}</td>
                        <td>
                          <span className="badge info">{r.certs}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : previewSlot === "costs" ? (
                <table className="tbl">
                  <thead>
                    <tr><th>Region</th><th className="num">Rent / m³</th><th className="num">Primary Tariff</th><th className="num">Handling Fee</th></tr>
                  </thead>
                  <tbody>
                    {[
                      { region: "Seoul Metro", rentM3: "₩ 92,000", tariff: "₩ 4,200 / km", handling: "₩ 1,800 / unit" },
                      { region: "Gyeonggi Province", rentM3: "₩ 58,000", tariff: "₩ 3,800 / km", handling: "₩ 1,500 / unit" },
                      { region: "Incheon Gateway", rentM3: "₩ 75,000", tariff: "₩ 3,900 / km", handling: "₩ 1,600 / unit" },
                      { region: "Daejeon Hub", rentM3: "₩ 67,000", tariff: "₩ 3,500 / km", handling: "₩ 1,400 / unit" },
                      { region: "Busan Port", rentM3: "₩ 65,000", tariff: "₩ 3,600 / km", handling: "₩ 1,450 / unit" },
                      { region: "Jeju Island", rentM3: "₩ 124,000", tariff: "₩ 6,800 / km", handling: "₩ 2,400 / unit" },
                    ].map((r, i) => (
                      <tr key={i} className="hoverable">
                        <td style={{ fontWeight: 600 }}>{r.region}</td>
                        <td className="num mono" style={{ color: "var(--ok)" }}>{r.rentM3}</td>
                        <td className="num mono">{r.tariff}</td>
                        <td className="num mono">{r.handling}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--ink-3)" }}>
                  Preview not available for {previewSlot} in this prototype.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
window.PageUpload2 = PageUpload2;

// ════════════════════════════════════════════════════════════
// 03 — EXISTING WAREHOUSES v2 — A/B mode picker
// ════════════════════════════════════════════════════════════
function PageOwned2({ navigate, flow, setFlow }) {
  const wh = window.OWNED_WAREHOUSES;
  const [mode, setMode] = useStateSetup(flow.ownedWHDeclared === "skip" ? "B" : "A");

  const totalCap = wh.reduce((a, w) => a + w.cap_m3, 0);
  const totalCost = wh.reduce((a, w) => a + w.fixedCostKRW, 0);
  const overload = wh.filter(w => w.usage >= 1.0).length;
  const burns = wh.filter(w => w.flag === "burns-money").length;

  const gateOk = mode === "B" || wh.length > 0;

  const handleDeclare = () => {
    setFlow({ ...flow,
      ownedWHDeclared: mode === "B" ? "skip" : "declared",
      visitedSteps: [...new Set([...flow.visitedSteps, "owned"])] });
  };

  return (
    <div className="page">
      <window.StepHeader tier="A" num="03" name="Existing Warehouses"
        sub="Last step of Setup. Choose how the engine handles the network — improve-existing (evaluate current sites) or design-from-scratch (propose a new network from 4,412 candidates)."
        badges={<span className="badge outline" style={{ fontSize: 10.5 }}>Optional · can skip</span>}/>

      <div className="section-title-row">
        <h3>① Pick a mode — this drives the optimization engine</h3>
      </div>
      <div className="mode-cards">
        <div className={"mode-card" + (mode === "A" ? " active" : "")} onClick={() => setMode("A")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="mode-letter">A</div>
            <div className="mode-title">Improve existing network</div>
          </div>
          <div className="mode-desc">
            "I already have {wh.length} warehouses. Evaluate each site — keep, downgrade, or close — and open new sites where needed."
          </div>
          <div className="mode-meta">
            <span>Mode <b>improve-existing</b></span>
            <span>Engine considers <b>your {wh.length} sites</b> + 4,412 directory candidates</span>
          </div>
        </div>

        <div className={"mode-card" + (mode === "B" ? " active" : "")} onClick={() => setMode("B")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="mode-letter">B</div>
            <div className="mode-title">Design from scratch</div>
          </div>
          <div className="mode-desc">
            "I have no warehouses yet or want a clean slate — propose a new network from 4,412 directory candidates."
          </div>
          <div className="mode-meta">
            <span>Mode <b>design-from-scratch</b></span>
            <span>Skip to <b>Run Optimization</b> directly</span>
          </div>
        </div>
      </div>

      {mode === "A" ? (
        <>
          <window.KPIStrip>
            <window.KPI label="Declared warehouses" value={wh.length} foot="From upload slot 2"/>
            <window.KPI label="Total capacity" value={window.fmtNum(totalCap)} unit="m³" foot="Across 6 sites"/>
            <window.KPI label="Total fixed cost" value={"₩" + window.fmtKRW(totalCost)} unit="/ yr" foot="Self-reported"/>
            <window.KPI label="Avg utilisation" value={window.fmtPct(wh.reduce((a,w) => a + w.usage, 0) / wh.length, 1)}
              foot={overload + " above 100%"}/>
            <window.KPI label="Money-burning flags" value={burns}
              foot={<><span className="badge danger"><span className="dot"></span>cost/m³ ≫ median</span></>}/>
          </window.KPIStrip>

          <window.Card title="Declared warehouses · 6 fields each"
            sub="Capacity (m³) · kind · fixed cost/yr · main product group · self-reported usage"
            actions={<>
              <button className="btn"><window.Icon name="upload"/> Import CSV</button>
              <button className="btn primary">+ Add warehouse</button>
            </>}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Code</th><th>Address</th><th className="num">Capacity (m³)</th>
                  <th>Kind</th><th className="num">Fixed cost / yr</th><th>Main group</th>
                  <th className="num">Usage</th><th className="num">Cost / m³</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {wh.map(w => {
                  const util = w.usage;
                  const [tone, lbl] = window.utilBadge(util);
                  return (
                    <tr key={w.code} className="hoverable">
                      <td className="mono" style={{ fontSize: 11.5, color: "var(--ink)" }}>{w.code}</td>
                      <td>{w.addr}</td>
                      <td className="num">{window.fmtNum(w.cap_m3)}</td>
                      <td><span className="badge outline" style={{ fontSize: 10.5 }}>{w.kind}</span></td>
                      <td className="num">₩{window.fmtKRW(w.fixedCostKRW)}</td>
                      <td style={{ fontSize: 12 }}>{w.mainGroup}</td>
                      <td className="num">
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <div className="bar" style={{ width: 44, height: 4 }}>
                            <span className={util >= 1 ? "danger" : util >= 0.9 ? "warn" : "ok"}
                              style={{ width: Math.min(100, util * 100) + "%" }}></span>
                          </div>
                          <span className="mono" style={{ fontSize: 11 }}>{window.fmtPct(util)}</span>
                        </div>
                      </td>
                      <td className="num">₩{window.fmtNum(w.costPerM3)}</td>
                      <td>{w.flag === "burns-money"
                        ? <span className="badge danger"><span className="dot"></span>Burns money</span>
                        : <span className={"badge " + tone}><span className="dot"></span>{lbl}</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </window.Card>

          <div className="two-col">
            <window.Card title="Map · current footprint" sub={wh.length + " owned sites"}>
              <div style={{ height: 360 }}>
                <window.KoreaMap
                  showHubs={true}
                  hubs={[
                    { id: "WS01", name: "Mapo Seoul",     region: "seoul",    x: 0.42, y: 0.28 },
                    { id: "WS02", name: "Anseong",        region: "gyeonggi", x: 0.44, y: 0.39 },
                    { id: "WS03", name: "Yeonsu Incheon", region: "incheon",  x: 0.30, y: 0.30 },
                    { id: "WS04", name: "Yuseong Daejeon",region: "daejeon",  x: 0.46, y: 0.52 },
                    { id: "WS05", name: "Saha Busan",     region: "busan",    x: 0.68, y: 0.72 },
                    { id: "WS06", name: "Buk Gwangju",    region: "gwangju",  x: 0.33, y: 0.66 },
                  ]}
                  hubStatus={{ WS05: "overload" }}
                  highlightRegions={Object.fromEntries(window.REGIONS.map(r => [r.id, window.COMPANY.priorityRegions.includes(r.id) ? 0.45 : 0.08]))}/>
              </div>
            </window.Card>

            <window.RecPanel
              what="Engine will run in improve-existing mode — evaluate 6 current sites, recommend keep/downgrade/close for each."
              why="WH-GWJ-01 has cost/m³ 92k vs median 58k AND usage 41% vs median 76% — flags both money-burning conditions."
              action="Continue to Run Optimization. The engine will solve 9 scenarios against your declared sites + directory candidates."
              impact={"Potential savings ~₩384M / yr if WH-GWJ-01 is decommissioned (validated in Scenarios step 09)."}/>
          </div>
        </>
      ) : (
        <window.Card title="Skip mode · design-from-scratch" sub="Engine will propose a new network from 4,412 directory candidates">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.55 }}>
                You chose <b>Mode B</b>. The engine will:
              </p>
              <ul style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7, paddingLeft: 18 }}>
                <li>Treat <b>all 4,412 directory warehouses</b> as candidates</li>
                <li>Pick the best <b>5–8 hubs</b> based on demand + cost + resilience</li>
                <li>Skip the "improve existing" mode entirely</li>
                <li>Output is a <b>green-field plan</b> — usable for greenfield expansion or M&amp;A scenarios</li>
              </ul>
              <div className="hint" style={{ marginTop: 12 }}>
                💡 If you have warehouses, Mode A unlocks the "Burns money" detector and keep-vs-close cost deltas.
              </div>
            </div>
            <div style={{ background: "var(--surface-2)", padding: 16, borderRadius: 10, border: "1px solid var(--border)" }}>
              <div className="card-sub" style={{ marginBottom: 10 }}>Sample output (sneak peek)</div>
              <table className="tbl">
                <tbody>
                  <tr><td style={{ color: "var(--ink-3)" }}>Recommended hubs</td><td className="num mono">5</td></tr>
                  <tr><td style={{ color: "var(--ink-3)" }}>Total fixed cost</td><td className="num mono">₩1.18B / yr</td></tr>
                  <tr><td style={{ color: "var(--ink-3)" }}>SLA coverage</td><td className="num mono">93%</td></tr>
                  <tr><td style={{ color: "var(--ink-3)" }}>Payback</td><td className="num mono">9–11 mo</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </window.Card>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button className="btn primary" onClick={handleDeclare}>
          <window.Icon name="check"/> {mode === "B" ? "Skip · use design-from-scratch" : "Confirm warehouses"} — proceed to optimization
        </button>
      </div>
      {flow.ownedWHDeclared !== "idle" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
          background: "oklch(96% 0.03 155)", border: "1px solid color-mix(in oklch, var(--ok) 30%, transparent)",
          borderRadius: 8, fontSize: 12, color: "var(--ok)" }}>
          <window.Icon name="check" size={12}/>
          {flow.ownedWHDeclared === "skip" ? "Design-from-scratch mode selected" : "Warehouses declared — improve-existing mode"} · proceed to Run Optimization
        </div>
      )}

      <window.StepFooter stepId="owned" flow={flow} onNavigate={navigate}
        gate={{ ok: flow.ownedWHDeclared !== "idle" || true, msg: null }}/>
    </div>
  );
}
window.PageOwned2 = PageOwned2;
