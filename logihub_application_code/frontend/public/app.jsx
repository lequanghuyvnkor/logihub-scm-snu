// LogiHub PRD v1.0 — main app shell with routing
const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  const [route, setRoute] = useStateApp(() => location.hash.replace("#", "") || "overview");
  const [dataMode, setDataMode] = useStateApp("proxy"); // mock | proxy | enterprise

  useEffectApp(() => {
    const onHash = () => setRoute(location.hash.replace("#", "") || "overview");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (id) => {
    location.hash = "#" + id;
    setRoute(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const crumbName = window.NAV.flatMap(g => g.items).find(it => it.id === route)?.name || "Overview";

  let page = null;
  switch (route) {
    case "overview":   page = <window.PageOverview      navigate={navigate}/>; break;
    case "profile":    page = <window.PageProfile/>;       break;
    case "upload":     page = <window.PageUpload/>;        break;
    case "owned":      page = <window.PageOwned/>;         break;
    case "directory":  page = <window.PageDirectory/>;     break;
    case "events":     page = <window.PageEvents/>;        break;
    case "forecast":   page = <window.PageForecast/>;      break;
    case "optimize":   page = <window.PageOptimize/>;      break;
    case "diagnosis":  page = <window.PageDiagnosis/>;     break;
    case "roles":      page = <window.PageRoles/>;         break;
    case "playbook":   page = <window.PagePlaybook/>;      break;
    case "case":       page = <window.PageBusinessCase/>;  break;
    case "roadmap":    page = <window.PageRoadmap/>;       break;
    case "export":     page = <window.PageExport/>;        break;
    default:           page = <window.PageOverview navigate={navigate}/>;
  }

  return (
    <div className="app">
      <window.Sidebar route={route} onNavigate={navigate} dataMode={dataMode} onDataModeChange={setDataMode}/>
      <div className="main">
        <window.TopBar crumb={crumbName} dataMode={dataMode}/>
        <div data-screen-label={crumbName}>
          {page}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
