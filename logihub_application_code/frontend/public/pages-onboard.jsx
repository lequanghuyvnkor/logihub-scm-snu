// LogiHub PRD v1.0 — Onboarding pages: Overview, Company Profile, Data Upload, Existing Warehouses
const { useState: useStateO } = React;

// ════════════════════════════════════════════════════════════
// 00 — OVERVIEW (control-tower entry)
// ════════════════════════════════════════════════════════════
function PageOverview({ navigate }) {
  const co = window.COMPANY;
  const industry = window.INDUSTRY_BY_ID[co.industry];
  const size = window.SIZE_BY_ID[co.size];
  const rec = window.PLAN_BY_ID[window.ROI_V2.recommendedPlan];
  const totalDemand = window.REGIONS.reduce((a, r) => a + r.demand, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">00 · Overview</div>
        <h1 className="page-title">Network Control Tower</h1>
        <div className="page-sub">
          Businesses upload 3 data types and the system brings the directory of {window.fmtNum(window.DIRECTORY.total)} warehouse,
          warehouses, plus the seasonal calendar, distance matrix and optimization solver — returning a consulting-grade report in 5–15 minutes.
        </div>
      </div>

      <window.Pipeline current={4}/>

      <window.KPIStrip>
        <window.KPI label="Recommended plan" value={rec.id}
          foot={<><span className="badge accent"><span className="dot"></span>{rec.name}</span></>}/>
        <window.KPI label="Monthly saving" value={"₩" + window.fmtKRW(rec.total_cost * 1_000_000 * rec.saving)}
          delta={"−" + window.fmtPct(rec.saving, 1)} deltaKind="up"
          foot={"Payback " + rec.payback + " mo · vs current"}/>
        <window.KPI label="ROI ratio" value={window.ROI_V2.ROI_ratio.toFixed(2)} unit="×"
          foot={<><span className="badge warn"><span className="dot"></span>{window.ROI_V2.recommendation}</span></>}/>
        <window.KPI label="Demand covered" value={window.fmtNum(totalDemand)} unit="orders/mo"
          foot="17 regions · 7 product families"/>
        <window.KPI label="Resilience" value={rec.resilience} unit="/ 100"
          foot={"P3 scored " + window.PLAN_BY_ID.P3.resilience + " on 100 stress tests"}/>
      </window.KPIStrip>

      <div className="section-grid">
        <window.Card title="Company profile snapshot" sub="Parameters currently driving the engine — edit on the Profile page"
          actions={<button className="btn" onClick={() => navigate("profile")}>Edit profile <window.Icon name="arrow-right"/></button>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ProfileRow k="Company"           v={co.name}/>
            <ProfileRow k="Industry"          v={industry.name + " · " + industry.en}/>
            <ProfileRow k="Size band"         v={size.label + " · " + size.rev}/>
            <ProfileRow k="Delivery SLA"      v={co.sla + " h target"}/>
            <ProfileRow k="Budget cap"        v={"₩" + window.fmtKRW(co.budgetCapKRW) + " / yr"}/>
            <ProfileRow k="Priority regions"  v={co.priorityRegions.map(r => window.REGION_BY_ID[r].name).join(" · ")}/>
            <ProfileRow k="Late tolerance"    v={window.fmtPct(size.lateOk) + " · cancel " + window.fmtPct(size.cancelRate)}/>
            <ProfileRow k="Reputation factor" v={size.repMult.toFixed(2) + " (auto · size band)"}/>
          </div>
        </window.Card>

        <window.RecPanel
          what={rec.name + " is the recommended plan (ROI " + window.ROI_V2.ROI_ratio.toFixed(2) + "×, payback " + rec.payback + " months)."}
          why="Plan P2 minimises total cost while staying inside the ₩6.0B budget cap and the size-band SLA tolerance. Cancellation losses fall by ₩1.83B / yr; reputation losses by ₩641M / yr."
          action={"Engine recommends " + window.ROI_V2.recommendation + " — start with " + window.ROI_V2.pilotRegion + " before national rollout (see Roadmap T+5–6)."}
          impact={"Annual value ₩" + window.fmtKRW(window.ROI_V2.annual_value) + " · incremental fixed cost ₩" + window.fmtKRW(window.ROI_V2.incremental_fixed_cost)}/>
      </div>

      <div className="two-col">
        <window.Card title="System status · §7 NFRs" sub="Performance, accuracy and compliance"
          actions={<span className="badge healthy"><span className="dot"></span>All within target</span>}>
          <table className="tbl">
            <thead><tr><th>Indicator</th><th>Target</th><th>Actual</th><th></th></tr></thead>
            <tbody>
              {window.NFR.map(n => (
                <tr key={n.id}>
                  <td style={{ color: "var(--ink)", fontWeight: 500 }}>{n.name}</td>
                  <td className="mono" style={{ color: "var(--ink-3)" }}>{n.target}</td>
                  <td className="mono" style={{ color: "var(--ink)" }}>{n.actual}</td>
                  <td><span className="badge healthy"><span className="dot"></span>Pass</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>

        <window.Card title="Engine pipeline" sub="Stage gates from upload → report">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { stage: "01 Data upload",     status: "done", note: "486k rows · validation 7/7 (1 warn)" },
              { stage: "02 Profile + SLA",   status: "done", note: "Fashion · Medium · 24 h SLA · ₩6B cap" },
              { stage: "03 Demand forecast", status: "done", note: "12-month forecast · MAPE 17.6%" },
              { stage: "04 Optimisation",    status: "done", note: "3 plans solved · P2 recommended" },
              { stage: "05 Diagnosis",       status: "done", note: "13 warehouses · 3 blind zones · 1 burn" },
              { stage: "06 Report bundle",   status: "running", note: "Ready in ~38 s" },
            ].map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", padding: "8px 10px",
                background: r.status === "running" ? "var(--accent-soft)" : "var(--surface-2)", borderRadius: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: r.status === "done" ? "var(--ok)" : "var(--accent)",
                  display: "grid", placeItems: "center", color: "#fff", fontSize: 10 }}>
                  {r.status === "done" ? "✓" : "•"}
                </span>
                <div>
                  <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500 }}>{r.stage}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.note}</div>
                </div>
                <span className={"badge " + (r.status === "done" ? "healthy" : "accent")}>
                  <span className="dot"></span>{r.status === "done" ? "Done" : "Running"}
                </span>
              </div>
            ))}
          </div>
        </window.Card>
      </div>
    </div>
  );
}
function ProfileRow({ k, v }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</div>
      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, marginTop: 3 }}>{v}</div>
    </div>
  );
}
window.PageOverview = PageOverview;

// ════════════════════════════════════════════════════════════
// 01 — COMPANY PROFILE (F-01 · US-01)
// ════════════════════════════════════════════════════════════
function PageProfile() {
  const co = window.COMPANY;
  const [size, setSize] = useStateO(co.size);
  const [industry, setIndustry] = useStateO(co.industry);
  const [sla, setSla] = useStateO(co.sla);
  const [budget, setBudget] = useStateO(co.budgetCapKRW / 1_000_000); // M KRW
  const [priorityRegions, setPriority] = useStateO(co.priorityRegions);

  const sizeMeta = window.SIZE_BY_ID[size];
  const indMeta  = window.INDUSTRY_BY_ID[industry];

  const togglePri = (id) => setPriority(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">01 · Company Profile · F-01</div>
        <h1 className="page-title">Company profile</h1>
        <div className="page-sub">
          Five fields are enough for the system to tune its defaults. Auxiliary parameters (late-tolerance, cancellation rate,
          reputation factor) are derived automatically from the size band — no manual entry needed.
        </div>
      </div>

      <div className="two-col">
        <window.Card title="Form · 5 fields" sub="Completed in ≤ 5 minutes (acceptance criteria · onboarding)">
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            <Field label="Company name">
              <input type="text" defaultValue={co.name}
                style={inputStyle}/>
            </Field>

            <Field label="Size band">
              <window.Seg
                options={window.SIZE_BANDS.map(s => ({ value: s.id, label: s.label + " · " + s.en }))}
                value={size} onChange={setSize}/>
              <div className="hint">{sizeMeta.rev} — auto-tuned: late ≤ {window.fmtPct(sizeMeta.lateOk)}, cancel {window.fmtPct(sizeMeta.cancelRate)}, reputation × {sizeMeta.repMult.toFixed(2)}.</div>
            </Field>

            <Field label="Primary industry">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {window.INDUSTRIES.map(i => (
                  <button key={i.id} onClick={() => setIndustry(i.id)}
                    style={{ ...tileBtn, ...(industry === i.id ? tileBtnActive : {}) }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{i.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{i.en}</div>
                  </button>
                ))}
              </div>
              <div className="hint">{indMeta.name} requires: {indMeta.needs.length ? indMeta.needs.join(" · ") : "no special certs"} · default SLA {indMeta.sla} h.</div>
            </Field>

            <Field label="Delivery commitment · SLA (h)">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="range" min="2" max="72" value={sla} className="range-input"
                  onChange={(e) => setSla(+e.target.value)} style={{ flex: 1 }}/>
                <span className="mono" style={{ width: 70, textAlign: "right", color: "var(--ink)", fontSize: 14, fontWeight: 600 }}>{sla} h</span>
              </div>
              <div className="hint">Default {indMeta.sla} h for {indMeta.en}. Fresh-food 6 h · urgent pharma 4 h.</div>
            </Field>

            <Field label="Budget cap (₩ million / year)">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="number" value={budget} onChange={(e) => setBudget(+e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}/>
                <span className="mono" style={{ color: "var(--ink-3)", fontSize: 12 }}>= ₩{window.fmtKRW(budget * 1_000_000)} / yr</span>
              </div>
              <div className="hint">Leave empty = no cap. Hard constraint for Plan P2 (Min total cost).</div>
            </Field>

            <Field label="Priority regions">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {window.REGIONS.map(r => {
                  const active = priorityRegions.includes(r.id);
                  return (
                    <button key={r.id} onClick={() => togglePri(r.id)}
                      style={{ padding: "5px 10px", borderRadius: 999, fontSize: 11.5,
                        background: active ? "var(--accent)" : "var(--surface-2)",
                        color: active ? "#fff" : "var(--ink-2)",
                        border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
                        cursor: "pointer" }}>
                      {r.name}
                    </button>
                  );
                })}
              </div>
              <div className="hint">{priorityRegions.length} of 17 selected. Leave empty = engine proposes them.</div>
            </Field>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn">Reset</button>
              <button className="btn primary"><window.Icon name="check"/> Save profile</button>
            </div>
          </div>
        </window.Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <window.Card title="Auto-tuned parameters" sub="Derived by the system from size + industry">
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
                <tr><td style={{ color: "var(--ink-3)" }}>Optimization mode</td>
                    <td className="mono" style={{ textAlign: "right", fontSize: 11.5 }}>
                      improve-existing (3 owned WHs)</td></tr>
              </tbody>
            </table>
          </window.Card>

          <window.RecPanel
            what={"Profile is " + sizeMeta.label + " · " + indMeta.name + " — default parameters have been calibrated."}
            why={"Size band " + sizeMeta.label + " ⇒ cancellation " + window.fmtPct(sizeMeta.cancelRate) + " and reputation multiplier " + sizeMeta.repMult.toFixed(2) + " applied to the ROI formula."}
            action="After saving profile, proceed to Data Upload (step 02) to run the 7-step validation."
            impact="These parameters lock the Plan P2 budget and feed revenue/reputation-loss conversion in the Business Case."/>
        </div>
      </div>
    </div>
  );
}
const inputStyle = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
  background: "var(--surface)", fontSize: 13, color: "var(--ink)", outline: "none",
};
const tileBtn = {
  textAlign: "left", padding: "10px 12px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer",
};
const tileBtnActive = { borderColor: "var(--accent)", background: "var(--accent-soft)", boxShadow: "0 0 0 3px color-mix(in oklch, var(--accent) 12%, transparent)" };
function Field({ label, children }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      {children}
    </div>
  );
}
window.PageProfile = PageProfile;

// ════════════════════════════════════════════════════════════
// 02 — DATA UPLOAD (F-02 · US-02 · US-03 · US-05)
// ════════════════════════════════════════════════════════════
function PageUpload() {
  const [accepted,   setAccepted]   = useStateO(true);
  const [uploadMsg,  setUploadMsg]  = useStateO(null);   // feedback string from real upload
  const [uploading,  setUploading]  = useStateO(false);
  const [backendOk,  setBackendOk]  = useStateO(
    () => !!(window.API_STATE && window.API_STATE.online)
  );
  const [dataLoaded, setDataLoaded] = useStateO(
    () => !!(window.API_STATE && window.API_STATE.dataLoaded)
  );

  const passCount = window.VALIDATION_STEPS.filter(s => s.status === "pass").length;
  const warnCount = window.VALIDATION_STEPS.filter(s => s.status === "warn").length;
  const okPct     = 0.94;

  // Stay in sync with API events
  React.useEffect(() => {
    const onReady  = () => { setBackendOk(true);  setDataLoaded(true); };
    const onUpload = (e) => {
      setDataLoaded(true);
      setUploadMsg("Upload success: " + JSON.stringify(e.detail));
    };
    window.addEventListener("logihub:backend-ready", onReady);
    window.addEventListener("logihub:upload-done",   onUpload);
    return () => {
      window.removeEventListener("logihub:backend-ready", onReady);
      window.removeEventListener("logihub:upload-done",   onUpload);
    };
  }, []);

  // Handle manual file upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !window.API) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      // Heuristic: if file name contains "warehouse"/"hub" → warehouse file; else O/D
      const odFile  = Array.from(files).find(f => !/warehouse|hub/i.test(f.name));
      const whFile  = Array.from(files).find(f =>  /warehouse|hub/i.test(f.name));
      const res = await window.API.uploadFiles(odFile || files[0], whFile || null);
      setUploadMsg("✓ Upload complete — " + (res.data?.od_records || "?") + " demand rows, distance matrix computed.");
    } catch (err) {
      setUploadMsg("✗ Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Load the built-in demo dataset
  const handleLoadDefaults = async () => {
    if (!window.API) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const res = await window.API.loadDefaults();
      setUploadMsg(
        "✓ Demo data loaded — " +
        res.data.demand_regions + " regions · " +
        res.data.candidate_hubs + " hubs · " +
        res.data.distance_pairs + " distance pairs"
      );
    } catch (err) {
      setUploadMsg("✗ " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">02 · Data Upload · F-02</div>
        <h1 className="page-title">Upload & clean shipping data</h1>
        <div className="page-sub">
          Accepts .xlsx / .csv / .xls. The system auto-normalises province names (≥ 98%), maps product codes
          (≥ 90%), weight units → kg, dates → YYYY-MM-DD; the 7-step validation stops at the first failure.
        </div>
      </div>

      {/* ── Backend connection + data loader ── */}
      <div style={{
        background:  backendOk ? "var(--ok-soft)"      : "var(--surface-3)",
        border:      "1px solid " + (backendOk ? "var(--ok)" : "var(--border)"),
        borderRadius: "var(--r-lg)", padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%",
            background: backendOk ? "var(--ok)" : "var(--ink-4)",
            boxShadow: backendOk ? "0 0 0 3px var(--ok-soft)" : "none" }}/>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: backendOk ? "var(--ok)" : "var(--ink-3)" }}>
            {backendOk ? "Backend API connected · localhost:8000" : "Backend offline — using mock data"}
          </span>
          {dataLoaded && <span className="badge healthy" style={{ fontSize: 10 }}><span className="dot"/>Data loaded</span>}
        </div>

        {backendOk && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
              borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "var(--surface)",
              fontSize: 12, fontWeight: 500, cursor: "pointer", color: "var(--ink-2)" }}>
              <window.Icon name="upload" size={13}/>
              {uploading ? "Uploading…" : "Upload CSV files"}
              <input type="file" accept=".csv,.xlsx,.xls" multiple style={{ display: "none" }}
                onChange={handleFileUpload} disabled={uploading}/>
            </label>
            <button className="btn primary" disabled={uploading} onClick={handleLoadDefaults}>
              <window.Icon name="play"/> Load demo data
            </button>
          </div>
        )}

        {uploadMsg && (
          <div style={{ width: "100%", fontSize: 11.5,
            color: uploadMsg.startsWith("✓") ? "var(--ok)" : "var(--danger)" }}>
            {uploadMsg}
          </div>
        )}
      </div>

      <window.KPIStrip>
        <window.KPI label="File" value={dataLoaded ? "Mock dataset" : "shipping_history_2025.xlsx"}
          foot={dataLoaded ? "17 regions · 8 candidate hubs" : "14.2 MB · uploaded 2026-05-12 09:18"}/>
        <window.KPI label="Rows ingested" value="486,142" foot="12 months · 168 origin–dest pairs"/>
        <window.KPI label="Validation"   value={passCount + "/7"}
          foot={<><span className="badge warn"><span className="dot"></span>{warnCount} warn · 0 fail</span></>}/>
        <window.KPI label="Province normalisation" value="99.4%" foot="≥ 98% NFR target"/>
        <window.KPI label="SKU mapping"  value="92.7%" foot="Mapped to 70-code product taxonomy"/>
        <window.KPI label="Row preview confirmed" value={window.fmtPct(okPct)}
          foot={<><span className={"badge " + (okPct >= 0.90 ? "healthy" : "warn")}><span className="dot"></span>≥ 90% gate</span></>}/>
      </window.KPIStrip>

      <window.Card title="7-step validation · stops at first failure"
        sub="The system creates an immutable snapshot + stores its hash · 90-day retention"
        actions={<button className="btn"><window.Icon name="download"/> Validation log</button>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {window.VALIDATION_STEPS.map(s => {
            const tone = s.status === "pass" ? "healthy" : s.status === "warn" ? "warn" : "danger";
            return (
              <div key={s.id} style={{
                border: "1px solid var(--border)", borderRadius: 10, padding: 12,
                background: s.status === "warn" ? "var(--warn-soft)" : s.status === "fail" ? "var(--danger-soft)" : "var(--surface)",
                display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>Step {s.id}</span>
                  <span className={"badge " + tone} style={{ fontSize: 10 }}>
                    <span className="dot"></span>{s.status === "pass" ? "Pass" : s.status === "warn" ? "Warn" : "Fail"}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 500, lineHeight: 1.35 }}>{s.name}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{s.en}</div>
                <div className="divider" style={{ margin: "4px 0" }}></div>
                <div style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.45 }}>{s.detail}</div>
              </div>
            );
          })}
        </div>
      </window.Card>

      <window.Card title="100-row review · US-03"
        sub={"Confirm normalised rows before engine run · " + window.fmtPct(okPct) + " confirmed (gate ≥ 90%)"}
        actions={<>
          <window.Seg compact options={[
            { value: "all", label: "All rows" },
            { value: "flag", label: "Flagged only" },
          ]} value={accepted ? "all" : "flag"} onChange={(v) => setAccepted(v === "all")}/>
          <button className="btn"><window.Icon name="filter"/> Filter</button>
        </>}>
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th><th>Date</th><th>Origin</th><th>Dest</th><th>SKU</th>
              <th className="num">Weight (kg)</th><th>Truck</th><th className="num">Lead (h)</th>
              <th className="num">Confidence</th><th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {window.UPLOAD_PREVIEW.map((r, i) => (
              <tr key={i} className={r.conf < 0.9 ? "" : "hoverable"}
                  style={r.conf < 0.9 ? { background: "var(--warn-soft)" } : null}>
                <td className="mono" style={{ color: "var(--ink-3)", fontSize: 11 }}>{String(i+1).padStart(3,"0")}</td>
                <td className="mono" style={{ fontSize: 11.5 }}>{r.date}</td>
                <td style={{ color: r.flag?.includes("origin") ? "var(--danger)" : "var(--ink)" }}>{r.origin || "—"}</td>
                <td style={{ color: r.flag?.includes("dest") ? "var(--danger)" : "var(--ink)" }}>{r.dest}</td>
                <td className="mono" style={{ fontSize: 11 }}>{r.sku}</td>
                <td className="num">{window.fmtNum(r.w)}</td>
                <td className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.truck || "—"}</td>
                <td className="num">{r.lead == null ? "—" : r.lead.toFixed(1)}</td>
                <td className="num">
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <div className="bar" style={{ width: 40, height: 4 }}>
                      <span className={r.conf >= 0.9 ? "ok" : "warn"} style={{ width: (r.conf * 100) + "%" }}></span>
                    </div>
                    <span className="mono" style={{ fontSize: 11 }}>{window.fmtPct(r.conf)}</span>
                  </div>
                </td>
                <td>
                  {r.flag?.length
                    ? <span className="badge warn" style={{ fontSize: 10 }}><span className="dot"></span>Review {r.flag.join(" · ")}</span>
                    : <span className="badge healthy" style={{ fontSize: 10 }}><span className="dot"></span>Auto-normalised</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <div className="hint">8 of 100 rows shown. Click any flagged cell to inline-edit; system tracks every override.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn">Bulk-accept normalised</button>
            <button className="btn primary"><window.Icon name="check"/> Confirm & continue</button>
          </div>
        </div>
      </window.Card>

      <div className="two-col">
        <window.Card title="Rejection rules · US-05" sub="Files that don't pass are stopped with a specific reason">
          <table className="tbl">
            <thead><tr><th>Rule</th><th>If</th><th>Then</th></tr></thead>
            <tbody>
              <tr><td>Below floor</td><td className="mono">rows &lt; 100</td><td><span className="badge danger"><span className="dot"></span>Reject</span> — "File too small — minimum 100 trips."</td></tr>
              <tr><td>Time too short</td><td className="mono">span &lt; 2 months</td><td><span className="badge danger"><span className="dot"></span>Reject</span> — "Need at least 2 months of history."</td></tr>
              <tr><td>Geo too narrow</td><td className="mono">pairs &lt; 5</td><td><span className="badge danger"><span className="dot"></span>Reject</span> — "Cover at least 5 origin–dest pairs."</td></tr>
              <tr><td>Product too narrow</td><td className="mono">groups &lt; 3</td><td><span className="badge danger"><span className="dot"></span>Reject</span> — "Need at least 3 product groups."</td></tr>
              <tr><td>Anomaly</td><td className="mono">weight &gt; 10t · distance &lt; 0</td><td><span className="badge warn"><span className="dot"></span>Warn</span> — surface to row review.</td></tr>
              <tr><td>Review gate</td><td className="mono">confirmed &lt; 90%</td><td><span className="badge warn"><span className="dot"></span>Block engine</span> — must edit cells.</td></tr>
            </tbody>
          </table>
        </window.Card>

        <window.Card title="Immutable snapshot" sub="Step 7 · 90-day retention">
          <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: 8, border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 11.5, lineHeight: 1.7, color: "var(--ink-2)" }}>
            <div style={{ color: "var(--ink-4)" }}>// snapshot.json</div>
            <div>file:        shipping_history_2025.xlsx</div>
            <div>uploaded:    2026-05-12T09:18Z</div>
            <div>sha256:      8c4e29…b91a · immutable</div>
            <div>row_count:   486,142</div>
            <div>retention:   90 days</div>
            <div>override_log: 3 cells (audit trail)</div>
          </div>
          <div className="hint" style={{ marginTop: 10 }}>
            Every manual analyst edit is written to override_log — the original data is never overwritten.
          </div>
        </window.Card>
      </div>
    </div>
  );
}
window.PageUpload = PageUpload;

// ════════════════════════════════════════════════════════════
// 03 — EXISTING WAREHOUSES (F-03 · US-04)
// ════════════════════════════════════════════════════════════
function PageOwned() {
  const wh = window.OWNED_WAREHOUSES;
  const totalCap = wh.reduce((a, w) => a + w.cap_m3, 0);
  const totalCost = wh.reduce((a, w) => a + w.fixedCostKRW, 0);
  const overload = wh.filter(w => w.usage >= 1.0).length;
  const burns = wh.filter(w => w.flag === "burns-money").length;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">03 · Existing Warehouses · F-03</div>
        <h1 className="page-title">Existing warehouses (optional)</h1>
        <div className="page-sub">
          Declaring warehouses ⇒ "improve-existing" mode — the engine keeps good sites, downgrades weak ones, and opens new sites only
          when needed. Leaving it empty ⇒ "design-from-scratch" mode. Six fields per warehouse.
        </div>
      </div>

      <window.KPIStrip>
        <window.KPI label="Owned / leased warehouses" value={wh.length}
          foot={"Mode: " + (wh.length ? "Improve existing" : "Design from scratch")}/>
        <window.KPI label="Total capacity" value={window.fmtNum(totalCap)} unit="m³" foot="Across all sites"/>
        <window.KPI label="Total fixed cost" value={"₩" + window.fmtKRW(totalCost)} unit="/ yr" foot="Self-reported"/>
        <window.KPI label="Avg utilisation" value={window.fmtPct(wh.reduce((a,w) => a + w.usage, 0) / wh.length, 1)}
          foot={overload + " above 100%"}/>
        <window.KPI label="Money-burning flags" value={burns}
          foot={<><span className="badge danger"><span className="dot"></span>Cost/m³ ≫ median</span></>}/>
      </window.KPIStrip>

      <window.Card title="Declared warehouses · 6 fields each"
        sub="Capacity (m³) · type · fixed cost/yr · main product group"
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
                  <td>
                    {w.flag === "burns-money"
                      ? <span className="badge danger"><span className="dot"></span>Burns money</span>
                      : <span className={"badge " + tone}><span className="dot"></span>{lbl}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </window.Card>

      <div className="two-col">
        <window.Card title="Map · current footprint" sub={wh.length + " owned sites · concentrated in capital + Busan"}>
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
              highlightRegions={Object.fromEntries(window.REGIONS.map(r => [r.id, window.COMPANY.priorityRegions.includes(r.id) ? 0.45 : 0.08]))}
              legend={
                <div style={{ fontSize: 11 }}>
                  <div><span className="hub-pin" style={{ position: "relative", display: "inline-block", marginRight: 8 }}></span>Owned warehouse</div>
                  <div><span className="hub-pin overload" style={{ position: "relative", display: "inline-block", marginRight: 8 }}></span>Overloaded</div>
                </div>
              }
            />
          </div>
        </window.Card>

        <window.RecPanel
          what={"Engine will run in improve-existing mode — keep 5 good sites, downgrade WH-GWJ-01 (burns money)."}
          why="WH-GWJ-01 has cost/m³ 92k vs median 58k AND usage 41% vs median 76% — meeting both 'money-burning' conditions in F-10."
          action="Once warehouses are confirmed, continue to Warehouse Directory (step 04) where the system proposes new sites from 4,412 candidates."
          impact={"Potential savings ~₩384M / yr if WH-GWJ-01 is decommissioned (see Network Diagnosis for detail)."}/>
      </div>
    </div>
  );
}
window.PageOwned = PageOwned;
