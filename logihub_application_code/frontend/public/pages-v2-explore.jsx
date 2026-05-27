// LogiHub v2 — Tier C · Explore pages
// 07 Forecast, 08 Seasonal+Playbook, 09 Scenarios, 10 Business Case, 11 Roadmap+Export
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
// 08 — SEASONAL EVENTS & PLAYBOOK (merged: was 08 + 10)
// ════════════════════════════════════════════════════════════
function PageSeasonal2({ navigate, flow, setFlow }) {
  return (
    <div className="page">
      <window.StepHeader tier="C" num="08" name="Seasonal Playbook"
        sub="Per-event response plans automatically generated based on the seasonal forecast." />
      <window.PagePlaybook />
      <window.StepFooter stepId="seasonal" onNavigate={navigate} flow={flow} />
    </div>
  );
}
window.PageSeasonal2 = PageSeasonal2;


// ════════════════════════════════════════════════════════════
// 09 — BUSINESS CASE (wraps v1 PageBusinessCase, was step 11)
// ════════════════════════════════════════════════════════════
window.PageBusinessCase2 = withV2FooterC(window.PageBusinessCase, "case", "09", "Business Case");

// ════════════════════════════════════════════════════════════
// 10 — ROADMAP & EXPORT (merged: was steps 12 + 13)
// ════════════════════════════════════════════════════════════
function PageExportAll({ navigate, flow, setFlow }) {
  const [tab, setTab] = useStateExp("roadmap");
  return (
    <div className="page">
      <window.StepHeader tier="C" num="10" name="Roadmap & Export"
        sub="Implementation timeline and report packaging — combined into the final step." />
      <window.Seg
        options={[
          { value: "roadmap", label: "Implementation Roadmap · 18-month plan" },
          { value: "export",  label: "Package & Export · PDF · CSV · slides" },
        ]}
        value={tab} onChange={setTab}/>
      {tab === "roadmap" && <window.PageRoadmap />}
      {tab === "export"  && <window.PageExport  />}
      <window.StepFooter stepId="export" onNavigate={navigate} flow={flow} />
    </div>
  );
}
window.PageExportAll = PageExportAll;
