// LogiHub — shell + shared components
const { useState, useEffect, useMemo, useRef } = React;

// ────────────────────────────────────────────────────────────
// Icons (simple, line-based SVG)
// ────────────────────────────────────────────────────────────
const Icon = ({ name, size = 14 }) => {
  const stroke = "currentColor";
  const sw = 1.6;
  const props = { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home":      return (<svg {...props}><path d="M2.5 7L8 2.5 13.5 7v6.5h-3v-4h-5v4h-3z"/></svg>);
    case "upload":    return (<svg {...props}><path d="M8 2v8M5 5l3-3 3 3M2.5 13.5h11"/></svg>);
    case "chart":     return (<svg {...props}><path d="M2.5 13.5h11M4 11V7M7 11V4M10 11V8M13 11V6"/></svg>);
    case "tune":      return (<svg {...props}><path d="M2.5 4h7M11 4h2.5M2.5 12h2.5M7 12h6.5M9 2.5v3M4.5 10.5v3"/></svg>);
    case "target":    return (<svg {...props}><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2.5"/></svg>);
    case "stethoscope": return (<svg {...props}><path d="M4 2.5v4a3 3 0 006 0v-4M7 9.5v2a2.5 2.5 0 005 0v-1"/><circle cx="12" cy="6.5" r="1.5"/></svg>);
    case "calendar":  return (<svg {...props}><rect x="2.5" y="3.5" width="11" height="9.5" rx="1"/><path d="M2.5 6.5h11M5 2v3M11 2v3"/></svg>);
    case "money":     return (<svg {...props}><circle cx="8" cy="8" r="5.5"/><path d="M9.5 6.5C9.5 5.7 8.83 5 8 5s-1.5.7-1.5 1.5S7.17 8 8 8s1.5.7 1.5 1.5S8.83 11 8 11s-1.5-.7-1.5-1.5M8 4v8"/></svg>);
    case "doc":       return (<svg {...props}><path d="M3.5 1.5h6L12.5 4.5v10h-9z"/><path d="M9.5 1.5v3h3M5.5 8h5M5.5 11h5"/></svg>);
    case "chevron":   return (<svg {...props}><path d="M4 6l4 4 4-4"/></svg>);
    case "arrow-right": return (<svg {...props}><path d="M3 8h10M9 4l4 4-4 4"/></svg>);
    case "check":     return (<svg {...props}><path d="M3 8.5l3 3 7-7"/></svg>);
    case "warn":      return (<svg {...props}><path d="M8 2L1.5 13.5h13zM8 6.5v3M8 11.5v.5"/></svg>);
    case "info":      return (<svg {...props}><circle cx="8" cy="8" r="5.5"/><path d="M8 7v4M8 5v.5"/></svg>);
    case "search":    return (<svg {...props}><circle cx="7" cy="7" r="4.5"/><path d="M13.5 13.5l-3-3"/></svg>);
    case "download":  return (<svg {...props}><path d="M8 2v8M5 7l3 3 3-3M2.5 13.5h11"/></svg>);
    case "filter":    return (<svg {...props}><path d="M2 3.5h12L9 9v4l-2 1V9z"/></svg>);
    case "spark":     return (<svg {...props}><path d="M2 11l3-4 3 2 3-5 3 3"/></svg>);
    case "layers":    return (<svg {...props}><path d="M8 2L2 5l6 3 6-3zM2 8l6 3 6-3M2 11l6 3 6-3"/></svg>);
    case "play":      return (<svg {...props}><path d="M5 3v10l8-5z"/></svg>);
    case "external":  return (<svg {...props}><path d="M6 3.5H3v9.5h9.5V10M9 3h4.5v4.5M7 9l6.5-6.5"/></svg>);
    case "dot":       return (<svg {...props}><circle cx="8" cy="8" r="3"/></svg>);
    default: return null;
  }
};

window.Icon = Icon;

// ────────────────────────────────────────────────────────────
// Sidebar nav
// ────────────────────────────────────────────────────────────
const NAV = [
  { group: "ONBOARDING", items: [
    { id: "overview",  num: "00", name: "Overview",            icon: "home"    },
    { id: "profile",   num: "01", name: "Company Profile",     icon: "doc"     },
    { id: "upload",    num: "02", name: "Data Upload",         icon: "upload"  },
    { id: "owned",     num: "03", name: "Existing Warehouses", icon: "layers"  },
  ]},
  { group: "SYSTEM DATA", items: [
    { id: "directory", num: "04", name: "Warehouse Directory", icon: "search"  },
    { id: "events",    num: "05", name: "Seasonal Events",     icon: "calendar"},
  ]},
  { group: "ENGINE", items: [
    { id: "forecast",  num: "06", name: "Demand Forecast",     icon: "chart"   },
    { id: "optimize",  num: "07", name: "Optimization",        icon: "target"  },
  ]},
  { group: "REPORT", items: [
    { id: "diagnosis", num: "08", name: "Network Diagnosis",   icon: "stethoscope" },
    { id: "roles",     num: "09", name: "Warehouse Roles",     icon: "layers"  },
    { id: "playbook",  num: "10", name: "Event Playbook",      icon: "spark"   },
    { id: "case",      num: "11", name: "Business Case",       icon: "money"   },
    { id: "roadmap",   num: "12", name: "Roadmap",             icon: "arrow-right" },
    { id: "export",    num: "13", name: "Report Export",       icon: "download"},
  ]},
];

window.NAV = NAV;

const DATA_MODES = [
  { id: "mock",       label: "Mock",        sub: "Synthetic seed",      tone: "neutral" },
  { id: "proxy",      label: "Proxy",       sub: "Public + CJ index",   tone: "warn"    },
  { id: "enterprise", label: "Enterprise",  sub: "CJ waybill sample",   tone: "accent"  },
];
window.DATA_MODES = DATA_MODES;

const Sidebar = ({ route, onNavigate, dataMode, onDataModeChange }) => {
  const mode = DATA_MODES.find(m => m.id === dataMode) || DATA_MODES[1];
  return (
  <aside className="sidebar">
    <div className="brand">
      <div className="brand-mark"></div>
      <div>
        <div className="brand-name">LogiHub</div>
        <div className="brand-sub">Decision Engine</div>
      </div>
    </div>
    {NAV.map((g) => (
      <React.Fragment key={g.group}>
        <div className="nav-section">{g.group}</div>
        {g.items.map((it) => (
          <div
            key={it.id}
            className={"nav-item" + (route === it.id ? " active" : "")}
            onClick={() => onNavigate(it.id)}
          >
            <span className="nav-num">{it.num}</span>
            <Icon name={it.icon} />
            <span>{it.name}</span>
          </div>
        ))}
      </React.Fragment>
    ))}
    <div className="sidebar-foot">
      <div className="mode-block">
        <div className="mode-block-head">
          <span>Data Mode</span>
          <span className={"mode-tag " + mode.tone}>{mode.sub}</span>
        </div>
        <div className="mode-switch">
          {DATA_MODES.map(m => (
            <button key={m.id}
              className={"mode-opt" + (m.id === dataMode ? " active" : "")}
              onClick={() => onDataModeChange?.(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="mode-foot">
          {mode.id === "mock" && "Self-generated dataset — pipeline smoke test."}
          {mode.id === "proxy" && "Public KOSTAT + MOLIT + CJ waybill-derived demand index."}
          {mode.id === "enterprise" && "Enterprise-origin CJ sample. Hub/cost/capacity still proxy."}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#6B7480", lineHeight: 1.4 }}>
        v0.4 · prototype build<br/>
        Proxy-to-production pipeline
      </div>
    </div>
  </aside>
  );
};
window.Sidebar = Sidebar;

// ────────────────────────────────────────────────────────────
// Top bar
// ────────────────────────────────────────────────────────────
const TopBar = ({ crumb, dataMode = "proxy" }) => {
  const co = window.COMPANY;
  const mode = (window.DATA_MODES || []).find(m => m.id === dataMode) || { label: "Proxy" };
  return (
    <div className="topbar">
      <div className="crumbs">
        <span>LogiHub</span>
        <span className="sep">/</span>
        <strong>{crumb}</strong>
      </div>
      <div className="topbar-right">
        <button className="btn ghost"><Icon name="search"/> Search</button>
        <div className="scenario-chip">
          <span className="lbl">Company</span>
          <span className="val">{co?.name || "—"}</span>
          <span>·</span>
          <span style={{ color: "var(--ink-2)" }}>{window.INDUSTRY_BY_ID?.[co?.industry]?.en}</span>
        </div>
        <button className="btn"><Icon name="download"/> Export</button>
        <button className="btn primary"><Icon name="play"/> Re-run engine</button>
      </div>
    </div>
  );
};
window.TopBar = TopBar;

// ────────────────────────────────────────────────────────────
// KPI strip
// ────────────────────────────────────────────────────────────
const KPI = ({ label, value, unit, delta, deltaKind = "flat", foot, hint }) => (
  <div className="kpi">
    <div className="kpi-label">{label}{hint && <Icon name="info" size={11}/>}</div>
    <div className="kpi-value">
      <span>{value}</span>
      {unit && <span className="unit">{unit}</span>}
      {delta && <span className={"kpi-delta " + deltaKind}>{delta}</span>}
    </div>
    {foot && <div className="kpi-foot">{foot}</div>}
  </div>
);
const KPIStrip = ({ children }) => <div className="kpi-strip">{children}</div>;
window.KPI = KPI; window.KPIStrip = KPIStrip;

// ────────────────────────────────────────────────────────────
// Recommendation panel
// ────────────────────────────────────────────────────────────
const RecPanel = ({ what, why, action, impact }) => (
  <div className="rec">
    <div className="rec-eyebrow"><Icon name="dot" size={8}/> Decision Insight</div>
    <div className="rec-block"><dt>What happened</dt><dd>{what}</dd></div>
    <div className="rec-block"><dt>Why</dt><dd>{why}</dd></div>
    <div className="rec-block"><dt>Recommended action</dt><dd>{action}</dd></div>
    <div className="rec-block"><dt>Business impact</dt><dd>{impact}</dd></div>
  </div>
);
window.RecPanel = RecPanel;

// ────────────────────────────────────────────────────────────
// Card
// ────────────────────────────────────────────────────────────
const Card = ({ title, sub, actions, children, bodyStyle, noBody }) => (
  <div className="card">
    {(title || sub || actions) && (
      <div className="card-head">
        <div>
          {title && <div className="card-title">{title}</div>}
          {sub && <div className="card-sub">{sub}</div>}
        </div>
        {actions && <div style={{ display: "flex", gap: 6 }}>{actions}</div>}
      </div>
    )}
    {noBody ? children : <div className="card-body" style={bodyStyle}>{children}</div>}
  </div>
);
window.Card = Card;

// ────────────────────────────────────────────────────────────
// Korea region grid (stylized, not a real map)
// ────────────────────────────────────────────────────────────
const KoreaMap = ({
  highlightRegions = {},     // { regionId: intensity 0..1 }
  showHubs = true,
  hubs = window.HUBS.filter(h => h.status === "selected"),
  selectedHub = null,
  hubStatus = {},            // { hubId: 'overload'|'underused'|'normal' }
  onRegionClick,
  onHubClick,
  flowLines = [],            // [{ regionId, hubId, weight }]
  selectedRegion = null,
  legend = null,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);

  // Helper to map IDs to South Korea geographical lat/lng coordinates
  const getRealLatLng = (id) => {
    // Dynamic lookup from window.HUB_BY_ID (populated by the backend solver data)
    if (window.HUB_BY_ID && window.HUB_BY_ID[id]) {
      const h = window.HUB_BY_ID[id];
      if (h.lat != null && h.lon != null) {
        return [Number(h.lat), Number(h.lon)];
      }
    }
    
    const coords = {
      // Regions (Sido / Provinces of South Korea)
      seoul: [37.5665, 126.9780],
      gyeonggi: [37.4138, 127.5183],
      incheon: [37.4563, 126.7052],
      gangwon: [37.8228, 128.1555],
      chungbuk: [36.6356, 127.4913],
      chungnam: [36.5184, 126.8000],
      sejong: [36.4800, 127.2890],
      daejeon: [36.3504, 127.3845],
      jeonbuk: [35.7175, 127.1449],
      jeonnam: [34.8679, 126.9910],
      gwangju: [35.1595, 126.8526],
      gyeongbuk: [36.5760, 128.5056],
      daegu: [35.8711, 128.6014],
      gyeongnam: [35.4606, 128.2132],
      ulsan: [35.5389, 129.3114],
      busan: [35.1796, 129.0756],
      jeju: [33.4996, 126.5312],

      // Hubs (Static UI Fallbacks)
      H01: [37.5665, 126.9780], // Seoul Metro Hub
      H02: [37.4563, 126.7052], // Incheon Gateway
      H03: [37.0084, 127.2652], // Anseong DC
      H04: [36.3504, 127.3845], // Daejeon Central
      H05: [36.9910, 127.9259], // Chungju Inland
      H06: [37.3422, 127.9201], // Wonju Flex
      H07: [35.1595, 126.8526], // Gwangju Southwest
      H08: [35.9483, 126.9578], // Iksan Junction
      H09: [35.8711, 128.6014], // Daegu East
      H10: [35.1041, 129.0413], // Busan Port DC
      H11: [35.2281, 128.6811], // Changwon Coastal
      H12: [33.4996, 126.5312], // Jeju Island Hub
      
      // Declared/Existing Warehouses
      WS01: [37.5565, 126.9380], // Mapo Seoul
      WS02: [37.0084, 127.2652], // Anseong
      WS03: [37.4063, 126.6352], // Yeonsu Incheon
      WS04: [36.3604, 127.3545], // Yuseong Daejeon
      WS05: [35.0996, 128.9614], // Saha Busan
      WS06: [35.1795, 126.8926], // Buk Gwangju
    };
    return coords[id] || [36.5, 127.5];
  };

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize real Leaflet map
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([35.8, 127.7], 7); // Beautiful scale to see all S.Korea

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous elements
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    const newLayers = [];

    // 1. Draw Region Circles with Shaded Intensity (demand)
    window.REGIONS.forEach(r => {
      const intensity = highlightRegions[r.id];
      const isSelected = selectedRegion === r.id;
      
      if (intensity != null || isSelected) {
        const latLng = getRealLatLng(r.id);
        const radius = 12000 + (intensity || 0) * 16000;
        const color = isSelected ? "#3b82f6" : "#4b5563";
        const fillColor = isSelected ? "#3b82f6" : "oklch(56% 0.11 205)";
        
        const circle = L.circle(latLng, {
          color: color,
          fillColor: fillColor,
          fillOpacity: isSelected ? 0.4 : 0.08 + (intensity || 0) * 0.45,
          weight: isSelected ? 3 : 1.2,
          radius: radius
        }).addTo(map);

        circle.bindTooltip(`
          <div style="font-family: var(--font-sans); padding: 4px; border-radius: 4px;">
            <div style="font-weight: 700; color: #1e293b;">${r.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Demand: <b>${window.fmtNum(r.demand)}</b></div>
          </div>
        `, {
          direction: "top",
          opacity: 0.95
        });

        circle.on('click', () => onRegionClick?.(r.id));
        newLayers.push(circle);
      }
    });

    // 2. Draw Flow Connections (Region to assigned Hub)
    flowLines.forEach((fl, idx) => {
      const rLatLng = getRealLatLng(fl.regionId);
      const hLatLng = getRealLatLng(fl.hubId);

      if (rLatLng && hLatLng) {
        const polyline = L.polyline([hLatLng, rLatLng], {
          color: "oklch(46% 0.09 205)",
          weight: 1.5 + (fl.weight || 0.5) * 1.5,
          opacity: 0.5,
          dashArray: "3, 6"
        }).addTo(map);
        newLayers.push(polyline);
      }
    });

    // 3. Draw Hub/Warehouse Markers
    if (showHubs) {
      hubs.forEach(h => {
        const latLng = getRealLatLng(h.id);
        const st = hubStatus[h.id] || "normal";
        const isSelected = selectedHub === h.id;

        const iconColor = st === "overload" ? "#ef4444" : st === "underused" ? "#94a3b8" : "#22c55e";
        const flexBorder = isSelected ? "box-shadow: 0 0 0 3px rgba(59,130,246,0.5);" : "";
        
        const markerHtml = `
          <div style="
            width: ${isSelected ? '16px' : '12px'}; 
            height: ${isSelected ? '16px' : '12px'}; 
            background: ${iconColor}; 
            border: 2px solid white; 
            border-radius: 50%;
            display: block;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ${flexBorder}
          "></div>
        `;

        const markerIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-hub-div-icon',
          iconSize: isSelected ? [16, 16] : [12, 12],
          iconAnchor: isSelected ? [8, 8] : [6, 6]
        });

        const marker = L.marker(latLng, { icon: markerIcon }).addTo(map);
        
        marker.bindTooltip(`
          <div style="font-family: var(--font-sans); padding: 4px;">
            <div style="font-weight: 700; color: #1e293b;">${h.name || h.id}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 1px;">Region: ${window.REGION_BY_ID[h.region]?.name || h.region}</div>
          </div>
        `, {
          direction: "top",
          opacity: 0.95
        });

        marker.on('click', () => onHubClick?.(h.id));
        newLayers.push(marker);
      });
    }

    layersRef.current = newLayers;
  }, [highlightRegions, showHubs, hubs, selectedHub, hubStatus, flowLines, selectedRegion]);

  return (
    <div className="korea-grid" style={{ height: "100%", width: "100%", padding: 0, overflow: "hidden" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />
      {legend && (
        <div style={{ position: "absolute", left: 16, bottom: 16, zIndex: 1000, background: "rgba(255,255,255,0.92)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px" }}>
          {legend}
        </div>
      )}
    </div>
  );
};
window.KoreaMap = KoreaMap;

// ────────────────────────────────────────────────────────────
// Mini bar / sparkline / donut
// ────────────────────────────────────────────────────────────
const Spark = ({ values, color = "var(--accent)", height = 36, fill = true }) => {
  const w = 200, h = height;
  const max = Math.max(...values), min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const fillPath = path + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && <path d={fillPath} fill={color} opacity="0.10"/>}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
};
window.Spark = Spark;

const BarColumn = ({ values, labels, colors, height = 200, showLabels = true, maxHint, threshold }) => {
  const max = maxHint || Math.max(...values.flat()) * 1.05;
  const W = 700, H = height;
  const barW = W / values.length - 8;
  return (
    <svg className="svg-chart" viewBox={`0 0 ${W} ${H + (showLabels ? 18 : 0)}`} preserveAspectRatio="none">
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1="0" x2={W} y1={H - p * H} y2={H - p * H} stroke="#E4E6E0" strokeWidth="0.5"/>
      ))}
      {threshold != null && (
        <line x1="0" x2={W} y1={H - (threshold / max) * H} y2={H - (threshold / max) * H}
              stroke="oklch(55% 0.18 28)" strokeWidth="0.8" strokeDasharray="3 3"/>
      )}
      {values.map((v, i) => {
        const h = (v / max) * H;
        const x = i * (W / values.length) + 4;
        const c = Array.isArray(colors) ? colors[i] : (colors || "var(--accent)");
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={barW} height={h} fill={c} rx="2"/>
            {showLabels && <text x={x + barW/2} y={H + 12} fontSize="9" textAnchor="middle" fill="#6B7480" fontFamily="JetBrains Mono">{labels[i]}</text>}
          </g>
        );
      })}
    </svg>
  );
};
window.BarColumn = BarColumn;

// Multi-series stacked bar
const StackedBars = ({ data, keys, colors, labels, height = 220 }) => {
  // data: [{label, ...keys}]
  const W = 720, H = height;
  const max = Math.max(...data.map(d => keys.reduce((s, k) => s + d[k], 0))) * 1.08;
  const slotW = W / data.length;
  const barW = slotW - 10;
  return (
    <svg className="svg-chart" viewBox={`0 0 ${W} ${H + 24}`} preserveAspectRatio="none">
      {[0, 0.5, 1].map((p, i) => (
        <line key={i} x1="0" x2={W} y1={H - p * H} y2={H - p * H} stroke="#E4E6E0" strokeWidth="0.5"/>
      ))}
      {data.map((d, i) => {
        let acc = 0;
        const x = i * slotW + 5;
        return (
          <g key={i}>
            {keys.map((k, ki) => {
              const v = d[k] || 0;
              const h = (v / max) * H;
              const y = H - acc - h;
              acc += h;
              return <rect key={k} x={x} y={y} width={barW} height={h} fill={colors[ki]} />;
            })}
            <text x={x + barW/2} y={H + 16} fontSize="10" textAnchor="middle" fill="#6B7480" fontFamily="JetBrains Mono">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
};
window.StackedBars = StackedBars;

// Horizontal bar list (e.g., region or product breakdown)
const HBars = ({ items, accent = "var(--accent)" }) => {
  const max = Math.max(...items.map(i => i.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{it.label}</div>
          <div className="bar">
            <span style={{ width: `${(it.value / max) * 100}%`, background: it.color || accent }}></span>
          </div>
          <div className="mono" style={{ fontSize: 12, color: "var(--ink)", textAlign: "right" }}>{it.formatted ?? it.value}</div>
        </div>
      ))}
    </div>
  );
};
window.HBars = HBars;

// ────────────────────────────────────────────────────────────
// Pipeline strip
// ────────────────────────────────────────────────────────────
const Pipeline = ({ current }) => {
  const steps = [
    { num: "01", name: "Upload",   meta: "Raw shipping history" },
    { num: "02", name: "Forecast", meta: "Filter 1 + 2 · 12 mo" },
    { num: "03", name: "Optimize", meta: "P1 · P2 · P3 parallel" },
    { num: "04", name: "Diagnose", meta: "Load · blind · burn · congest" },
    { num: "05", name: "Report",   meta: "ROI · Roadmap · Bundle" },
  ];
  return (
    <div className="pipeline">
      {steps.map((s, i) => {
        const done = i < current;
        const curr = i === current;
        return (
          <div key={s.num} className={"pipeline-step" + (done ? " done" : "") + (curr ? " current" : "")}>
            <div className="step-num">{done ? "✓" : s.num}</div>
            <div className="step-name">{s.name}</div>
            <div className="step-meta">{s.meta}</div>
          </div>
        );
      })}
    </div>
  );
};
window.Pipeline = Pipeline;

// ────────────────────────────────────────────────────────────
// Segmented control
// ────────────────────────────────────────────────────────────
const Seg = ({ options, value, onChange, compact }) => (
  <div className={"seg" + (compact ? " compact" : "")}>
    {options.map(o => (
      <button key={o.value || o} className={(value === (o.value || o)) ? "active" : ""}
              onClick={() => onChange(o.value || o)}>{o.label || o}</button>
    ))}
  </div>
);
window.Seg = Seg;

const Toggle = ({ on, onChange }) => (
  <div className={"toggle" + (on ? " on" : "")} onClick={() => onChange(!on)}></div>
);
window.Toggle = Toggle;

// ────────────────────────────────────────────────────────────
// Util status helper
// ────────────────────────────────────────────────────────────
window.utilBadge = (u) => {
  if (u >= 1.0) return ["danger", "Overloaded"];
  if (u >= 0.9) return ["warn",   "Near capacity"];
  if (u >= 0.6) return ["healthy","Healthy"];
  return ["neutral", "Underused"];
};
