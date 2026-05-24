// LogiHub v2 — main app shell with routing + flow state
const { useState: useStateApp2, useEffect: useEffectApp2 } = React;

function AppV2() {
  const [flow, setFlowState] = useStateApp2(() => window.loadFlow());
  const [route, setRoute] = useStateApp2(() => location.hash.replace("#", "") || "overview");
  const [dataMode, setDataMode] = useStateApp2("proxy");

  // Persist flow to localStorage
  useEffectApp2(() => { window.saveFlow(flow); }, [flow]);

  // Wrap setFlow to update visitedSteps + resumeStep
  const setFlow = (next) => {
    const merged = { ...flow, ...next };
    // ensure visitedSteps is always present and unique
    merged.visitedSteps = Array.from(new Set(merged.visitedSteps || flow.visitedSteps));
    setFlowState(merged);
  };

  useEffectApp2(() => {
    const onHash = () => setRoute(location.hash.replace("#", "") || "overview");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (id) => {
    // mark current as visited
    const newVisited = Array.from(new Set([...(flow.visitedSteps || []), route]));
    setFlowState({ ...flow, visitedSteps: newVisited, resumeStep: id });
    location.hash = "#" + id;
    setRoute(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const onResume = () => navigate(flow.resumeStep || "overview");

  // Route → page
  let page = null;
  const pageProps = { navigate, flow, setFlow };
  switch (route) {
    case "overview":  page = <window.PageOverview2 {...pageProps}/>; break;
    case "profile":   page = <window.PageProfile2  {...pageProps}/>; break;
    case "upload":    page = <window.PageUpload2   {...pageProps}/>; break;
    case "owned":     page = <window.PageOwned2    {...pageProps}/>; break;
    case "optimize":  page = <window.PageOptimize2 {...pageProps}/>; break;
    case "map":       page = <window.PageWarehouseMap {...pageProps}/>; break;
    case "roles":     page = <window.PageRoles2    {...pageProps}/>; break;
    case "forecast":  page = <window.PageForecast2 {...pageProps}/>; break;
    case "events":    page = <window.PageEvents2   {...pageProps}/>; break;
    case "scenarios": page = <window.PageScenarios {...pageProps}/>; break;
    case "playbook":  page = <window.PagePlaybook2 {...pageProps}/>; break;
    case "case":      page = <window.PageBusinessCase2 {...pageProps}/>; break;
    case "roadmap":   page = <window.PageRoadmap2  {...pageProps}/>; break;
    case "export":    page = <window.PageExport2   {...pageProps}/>; break;
    default:          page = <window.PageOverview2 {...pageProps}/>;
  }

  const stepInfo = window.findStepInfo(route);
  const screenLabel = stepInfo
    ? (stepInfo.num + " " + stepInfo.name)
    : "Overview";

  return (
    <window.FlowContext.Provider value={flow}>
      <div className="app">
        <window.SidebarV2 route={route} onNavigate={navigate}
          dataMode={dataMode} onDataModeChange={setDataMode} flow={flow}/>
        <div className="main">
          <window.TopBarV2 stepId={route} dataMode={dataMode} flow={flow} onResume={onResume}/>
          <div data-screen-label={screenLabel}>
            {page}
          </div>
        </div>
      </div>
    </window.FlowContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AppV2/>);
