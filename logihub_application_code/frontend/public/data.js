// LogiHub mock data — proxy dataset for prototype.

// 17 Korean regions with approximate normalized positions (0..1, 0..1) on a portrait map.
window.REGIONS = [
  { id: "seoul",    name: "Seoul",        sido: "Seoul",            x: 0.43, y: 0.25, demand: 184500, share: 0.205, growth: +0.08 },
  { id: "gyeonggi", name: "Gyeonggi",     sido: "Gyeonggi-do",      x: 0.41, y: 0.35, demand: 168300, share: 0.187, growth: +0.11 },
  { id: "incheon",  name: "Incheon",      sido: "Incheon",          x: 0.27, y: 0.29, demand:  62100, share: 0.069, growth: +0.04 },
  { id: "gangwon",  name: "Gangwon",      sido: "Gangwon-do",       x: 0.65, y: 0.24, demand:  31400, share: 0.035, growth: -0.02 },
  { id: "chungbuk", name: "Chungbuk",     sido: "Chungcheongbuk-do",x: 0.52, y: 0.43, demand:  39800, share: 0.044, growth: +0.03 },
  { id: "chungnam", name: "Chungnam",     sido: "Chungcheongnam-do",x: 0.36, y: 0.46, demand:  51200, share: 0.057, growth: +0.05 },
  { id: "sejong",   name: "Sejong",       sido: "Sejong",           x: 0.43, y: 0.48, demand:  12800, share: 0.014, growth: +0.09 },
  { id: "daejeon",  name: "Daejeon",      sido: "Daejeon",          x: 0.46, y: 0.52, demand:  41500, share: 0.046, growth: +0.02 },
  { id: "jeonbuk",  name: "Jeonbuk",      sido: "Jeollabuk-do",     x: 0.38, y: 0.60, demand:  35200, share: 0.039, growth: -0.01 },
  { id: "jeonnam",  name: "Jeonnam",      sido: "Jeollanam-do",     x: 0.34, y: 0.72, demand:  38600, share: 0.043, growth: +0.01 },
  { id: "gwangju",  name: "Gwangju",      sido: "Gwangju",          x: 0.32, y: 0.66, demand:  28900, share: 0.032, growth: +0.03 },
  { id: "gyeongbuk",name: "Gyeongbuk",    sido: "Gyeongsangbuk-do", x: 0.66, y: 0.46, demand:  52800, share: 0.059, growth: +0.04 },
  { id: "daegu",    name: "Daegu",        sido: "Daegu",            x: 0.62, y: 0.55, demand:  46300, share: 0.052, growth: +0.02 },
  { id: "gyeongnam",name: "Gyeongnam",    sido: "Gyeongsangnam-do", x: 0.58, y: 0.66, demand:  58400, share: 0.065, growth: +0.06 },
  { id: "ulsan",    name: "Ulsan",        sido: "Ulsan",            x: 0.72, y: 0.62, demand:  24100, share: 0.027, growth: +0.01 },
  { id: "busan",    name: "Busan",        sido: "Busan",            x: 0.68, y: 0.72, demand:  64800, share: 0.072, growth: +0.05 },
  { id: "jeju",     name: "Jeju",         sido: "Jeju",             x: 0.28, y: 0.93, demand:  10800, share: 0.012, growth: +0.07 },
];

window.PRODUCTS = [
  { id: "electronics", name: "Electronics", share: 0.24, peak: ["Feb", "Mar", "Nov"],         color: "oklch(56% 0.11 240)" },
  { id: "fashion",     name: "Fashion",     share: 0.21, peak: ["Apr", "Oct", "Nov"],         color: "oklch(60% 0.13 320)" },
  { id: "food",        name: "Food",        share: 0.19, peak: ["Jan", "Sep", "Dec"],         color: "oklch(64% 0.13 80)"  },
  { id: "beauty",      name: "Beauty",      share: 0.13, peak: ["May", "Nov", "Dec"],         color: "oklch(66% 0.14 20)"  },
  { id: "lifestyle",   name: "Lifestyle",   share: 0.11, peak: ["Mar", "Sep"],                color: "oklch(58% 0.10 170)" },
  { id: "home",        name: "Home & Living",share: 0.08, peak: ["Apr", "May"],               color: "oklch(54% 0.09 200)" },
  { id: "sports",      name: "Sports",      share: 0.04, peak: ["Mar", "Jul"],                color: "oklch(60% 0.13 130)" },
];

window.MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Monthly demand index (normalized seasonality). Sum per row is just a relative shape.
window.MONTHLY_DEMAND = [
  // total network-level demand index per month (in thousands)
  68, 72, 79, 81, 78, 75, 73, 70, 86, 92, 98, 88
];

window.SEASONAL_BY_PRODUCT = {
  electronics: [62, 95, 102, 78, 72, 68, 64, 60, 72, 80, 110, 88],
  fashion:     [54, 60, 78, 96, 84, 76, 70, 72, 88, 102, 110, 92],
  food:        [98, 70, 72, 78, 80, 84, 86, 82, 102, 88, 90, 110],
  beauty:      [60, 64, 72, 78, 102, 84, 76, 72, 80, 88, 110, 104],
  lifestyle:   [62, 66, 96, 80, 78, 72, 68, 70, 102, 86, 84, 78],
  home:        [60, 64, 70, 95, 102, 84, 72, 66, 70, 72, 76, 70],
  sports:      [54, 58, 96, 78, 76, 72, 100, 84, 70, 66, 64, 62],
};

window.HUBS = [
  { id: "H01", name: "Seoul Metro Hub",  region: "seoul",     type: "National", x: 0.41, y: 0.27, base: 220000, flex: 60000, fixed: 480_000_000, status: "selected" },
  { id: "H02", name: "Incheon Gateway",  region: "incheon",   type: "Urban",    x: 0.30, y: 0.29, base: 140000, flex: 40000, fixed: 320_000_000, status: "selected" },
  { id: "H03", name: "Anseong DC",       region: "gyeonggi",  type: "Regional", x: 0.44, y: 0.39, base: 160000, flex: 50000, fixed: 360_000_000, status: "selected" },
  { id: "H04", name: "Daejeon Central",  region: "daejeon",   type: "National", x: 0.46, y: 0.52, base: 175000, flex: 50000, fixed: 360_000_000, status: "selected" },
  { id: "H05", name: "Chungju Inland",   region: "chungbuk",  type: "Regional", x: 0.55, y: 0.42, base:  95000, flex: 30000, fixed: 220_000_000, status: "candidate" },
  { id: "H06", name: "Wonju Flex",       region: "gangwon",   type: "Flex",     x: 0.62, y: 0.30, base:  60000, flex: 35000, fixed: 160_000_000, status: "candidate" },
  { id: "H07", name: "Gwangju Southwest",region: "gwangju",   type: "Regional", x: 0.33, y: 0.66, base: 110000, flex: 30000, fixed: 250_000_000, status: "selected" },
  { id: "H08", name: "Iksan Junction",   region: "jeonbuk",   type: "Regional", x: 0.40, y: 0.58, base:  85000, flex: 25000, fixed: 200_000_000, status: "candidate" },
  { id: "H09", name: "Daegu East",       region: "daegu",     type: "Regional", x: 0.62, y: 0.55, base: 120000, flex: 35000, fixed: 280_000_000, status: "candidate" },
  { id: "H10", name: "Busan Port DC",    region: "busan",     type: "National", x: 0.68, y: 0.72, base: 165000, flex: 45000, fixed: 380_000_000, status: "selected" },
  { id: "H11", name: "Changwon Coastal", region: "gyeongnam", type: "Urban",    x: 0.58, y: 0.68, base:  90000, flex: 25000, fixed: 210_000_000, status: "candidate" },
  { id: "H12", name: "Jeju Island Hub",  region: "jeju",      type: "Flex",     x: 0.28, y: 0.93, base:  35000, flex: 20000, fixed: 120_000_000, status: "candidate" },
];

window.SCENARIOS = [
  {
    id: "S0",
    name: "Baseline",
    desc: "Current network — 6 selected hubs without re-optimization.",
    selectedHubs: ["H01","H02","H03","H04","H07","H10"],
    totalCost: 4_710,     // M KRW / month
    transport: 2_820,
    fixed: 1_400,
    handling: 490,
    overflow: 0,
    avgUtil: 0.78,
    overloaded: 2,
    underused: 0,
    serviceScore: 71,
    riskScore: 64,
    saving: 0,
    rank: 4,
    tag: "Baseline",
  },
  {
    id: "S1",
    name: "Minimum Transport Cost",
    desc: "Assign demand to the nearest hub on the cheapest lane, ignoring fixed-cost balance.",
    selectedHubs: ["H01","H02","H03","H04","H05","H07","H09","H10","H11"],
    totalCost: 4_390,
    transport: 2_360,
    fixed: 1_730,
    handling: 480,
    overflow: 0,
    avgUtil: 0.71,
    overloaded: 1,
    underused: 2,
    serviceScore: 84,
    riskScore: 48,
    saving: 0.068,
    rank: 2,
    tag: "Lowest Lane Cost",
  },
  {
    id: "S2",
    name: "Balanced Cost & Capacity",
    desc: "Reduce transport cost while keeping hub utilization within the healthy band.",
    selectedHubs: ["H01","H02","H03","H04","H05","H07","H09","H10"],
    totalCost: 4_145,
    transport: 2_510,
    fixed: 1_180,
    handling: 470,
    overflow: 0,
    avgUtil: 0.79,
    overloaded: 0,
    underused: 1,
    serviceScore: 81,
    riskScore: 32,
    saving: 0.120,
    rank: 1,
    tag: "Recommended",
  },
  {
    id: "S3",
    name: "Service Priority",
    desc: "Prioritize short delivery distance; accept higher fixed cost for service.",
    selectedHubs: ["H01","H02","H03","H04","H06","H07","H08","H09","H10","H11"],
    totalCost: 4_580,
    transport: 2_190,
    fixed: 1_960,
    handling: 460,
    overflow: 0,
    avgUtil: 0.66,
    overloaded: 0,
    underused: 3,
    serviceScore: 92,
    riskScore: 38,
    saving: 0.028,
    rank: 3,
    tag: "Highest Service",
  },
];

// Optional / nice-to-have scenarios per PRD §13. Rendered as preview tiles
// in the Scenario Builder; not yet wired into the optimization engine.
window.SCENARIOS_PREVIEW = [
  {
    id: "S4",
    name: "Minimum Number of Hubs",
    desc: "Lowest-footprint network — consolidate demand into the fewest viable hubs.",
    hubs: 4, savingHint: "+₩ fixed −₩ transport", riskHint: "Capacity stress in peak months",
    status: "post-mvp",
  },
  {
    id: "S5",
    name: "Peak-Season Protection",
    desc: "Pre-stage flex capacity and protective lanes ahead of Oct–Nov peak.",
    hubs: 9, savingHint: "Saving ≈ S2 in peak quarter", riskHint: "Higher off-peak idle",
    status: "post-mvp",
  },
  {
    id: "S6",
    name: "Regional Resilience",
    desc: "≥ 1 active hub per macro-region — survive single-hub failure.",
    hubs: 8, savingHint: "Saving below S2", riskHint: "Lowest risk score",
    status: "post-mvp",
  },
  {
    id: "S7",
    name: "Low Fixed-Cost",
    desc: "Lean on small regional sites; minimize warehouse fixed cost line.",
    hubs: 6, savingHint: "Fixed −20% vs S0", riskHint: "Handling cost rises",
    status: "post-mvp",
  },
  {
    id: "S8",
    name: "Aggressive Expansion",
    desc: "Pre-empt future demand — open every viable hub for max coverage.",
    hubs: 11, savingHint: "Saving turns negative short-term", riskHint: "Highest fixed cost",
    status: "post-mvp",
  },
];

// Network health composite (PRD §9.6 current_network_health.csv).
// Derived from S2 recommended scenario. Sub-scores are 0–100.
window.NETWORK_HEALTH = {
  scenarioId: "S2",
  overall: 78,
  status: "Strong with one residual risk",
  mainIssue: "Busan Port DC crosses 100% utilization in November (Electronics + Fashion peak).",
  subScores: [
    { id: "cost",     label: "Cost efficiency",   value: 82, note: "−12.0% vs S0; transport −11%, fixed −15.7%" },
    { id: "capacity", label: "Capacity balance",  value: 74, note: "Avg util 79%; 1 overloaded, 2 underused, peak gap 3.4k" },
    { id: "service",  label: "Service quality",   value: 81, note: "Avg lane 112 km (↓ from 138); +10 pts vs S0" },
    { id: "risk",     label: "Risk & resilience", value: 68, note: "Busan Nov peak + 5 high-cost lanes outstanding" },
    { id: "coverage", label: "Regional coverage", value: 86, note: "17/17 regions assigned; ≥1 hub per macro-region" },
  ],
};

// region → hub assignment per scenario (only S2 shown in detail; others derived loosely)
window.ALLOCATION = {
  S0: {
    seoul: "H01", gyeonggi: "H01", incheon: "H02", gangwon: "H01",
    chungbuk: "H04", chungnam: "H04", sejong: "H04", daejeon: "H04",
    jeonbuk: "H07", jeonnam: "H07", gwangju: "H07",
    gyeongbuk: "H04", daegu: "H10", gyeongnam: "H10", ulsan: "H10",
    busan: "H10", jeju: "H07",
  },
  S1: {
    seoul: "H01", gyeonggi: "H03", incheon: "H02", gangwon: "H01",
    chungbuk: "H05", chungnam: "H04", sejong: "H04", daejeon: "H04",
    jeonbuk: "H07", jeonnam: "H07", gwangju: "H07",
    gyeongbuk: "H09", daegu: "H09", gyeongnam: "H11", ulsan: "H11",
    busan: "H10", jeju: "H07",
  },
  S2: {
    seoul: "H01", gyeonggi: "H03", incheon: "H02", gangwon: "H03",
    chungbuk: "H05", chungnam: "H04", sejong: "H04", daejeon: "H04",
    jeonbuk: "H07", jeonnam: "H07", gwangju: "H07",
    gyeongbuk: "H09", daegu: "H09", gyeongnam: "H10", ulsan: "H10",
    busan: "H10", jeju: "H07",
  },
  S3: {
    seoul: "H01", gyeonggi: "H03", incheon: "H02", gangwon: "H06",
    chungbuk: "H05", chungnam: "H04", sejong: "H04", daejeon: "H04",
    jeonbuk: "H08", jeonnam: "H07", gwangju: "H07",
    gyeongbuk: "H09", daegu: "H09", gyeongnam: "H11", ulsan: "H11",
    busan: "H10", jeju: "H07",
  },
};

// Hub utilization across the year for S2 (the recommended scenario).
window.UTILIZATION = {
  H01: [0.78, 0.82, 0.85, 0.81, 0.79, 0.76, 0.74, 0.72, 0.84, 0.88, 0.94, 0.86], // Seoul Metro — near capacity peak
  H02: [0.62, 0.66, 0.71, 0.74, 0.70, 0.68, 0.66, 0.64, 0.72, 0.76, 0.82, 0.78], // Incheon Gateway
  H03: [0.70, 0.74, 0.79, 0.82, 0.78, 0.74, 0.72, 0.70, 0.81, 0.86, 0.91, 0.84], // Anseong
  H04: [0.66, 0.68, 0.71, 0.74, 0.72, 0.70, 0.68, 0.66, 0.76, 0.80, 0.84, 0.78], // Daejeon
  H05: [0.52, 0.56, 0.61, 0.64, 0.62, 0.60, 0.58, 0.56, 0.66, 0.70, 0.74, 0.68], // Chungju
  H07: [0.58, 0.62, 0.66, 0.68, 0.66, 0.64, 0.62, 0.60, 0.70, 0.74, 0.78, 0.72], // Gwangju
  H09: [0.48, 0.52, 0.58, 0.62, 0.60, 0.58, 0.56, 0.54, 0.64, 0.68, 0.72, 0.66], // Daegu East
  H10: [0.74, 0.78, 0.82, 0.84, 0.80, 0.78, 0.76, 0.74, 0.86, 0.90, 1.02, 0.92], // Busan — overloaded Nov
};

window.HIGH_COST_LANES = [
  { origin: "H07", dest: "jeju",     product: "electronics", distance: 478, demand: 4200, cost: 86_500_000, action: "Consider Jeju Island Hub" },
  { origin: "H01", dest: "busan",    product: "fashion",     distance: 396, demand: 1800, cost: 42_300_000, action: "Reassign to Busan Port DC" },
  { origin: "H04", dest: "gangwon",  product: "home",        distance: 248, demand: 2600, cost: 31_800_000, action: "Review allocation" },
  { origin: "H07", dest: "gyeongnam",product: "food",        distance: 281, demand: 3100, cost: 28_900_000, action: "Shift to Daegu East" },
  { origin: "H03", dest: "gangwon",  product: "lifestyle",   distance: 192, demand: 1400, cost: 18_400_000, action: "Monitor peak month" },
];

window.OVERLOADED = [
  { hub: "H10", name: "Busan Port DC",    month: "Nov", util: 1.02, demand: 168_400, capacity: 165_000, status: "Overloaded",     action: "Activate +45k flex capacity" },
  { hub: "H01", name: "Seoul Metro Hub",  month: "Nov", util: 0.94, demand: 207_000, capacity: 220_000, status: "Near capacity",  action: "Pre-allocate 8k to Anseong" },
  { hub: "H03", name: "Anseong DC",       month: "Nov", util: 0.91, demand: 145_400, capacity: 160_000, status: "Near capacity",  action: "Monitor weekly" },
];

window.UNDERUSED = [
  { hub: "H05", name: "Chungju Inland",   month: "Aug", util: 0.56, demand: 53_200, capacity: 95_000, status: "Underused", action: "Absorb Chungbuk volume from H04" },
  { hub: "H09", name: "Daegu East",       month: "Aug", util: 0.54, demand: 64_800, capacity: 120_000, status: "Underused", action: "Reroute Gyeongbuk products" },
];

window.SEASONAL = {
  peakWindow: "October – November",
  primaryRisk: "Holiday + Black Friday compounded peak across Electronics, Beauty, Fashion.",
  affectedHubs: ["Busan Port DC", "Seoul Metro Hub", "Anseong DC"],
  affectedRegions: ["Busan", "Seoul", "Gyeonggi", "Gyeongnam"],
  actions: [
    { kind: "flex", text: "Activate +45,000 unit flex capacity at Busan Port DC for Nov.", owner: "Hub Ops",  weeksOut: 6 },
    { kind: "shift",text: "Pre-allocate 8,000 units of Seoul demand to Anseong DC.",       owner: "Network", weeksOut: 4 },
    { kind: "lane", text: "Open temporary Daejeon → Busan night-shift lane for Electronics.", owner: "Transport", weeksOut: 5 },
    { kind: "watch",text: "Daily utilization monitoring for Anseong DC during Nov W2–W4.", owner: "Control Tower", weeksOut: 8 },
  ],
};

window.BUSINESS_CASE = {
  baseline: "S0",
  recommended: "S2",
  monthlySaving: 565_000_000,   // KRW
  savingRate: 0.120,
  annualSaving: 6_780_000_000,
  paybackMonths: 8,
  oneTimeCost: 4_500_000_000,
  mainReason: "S2 shortens long-haul lanes by routing central regions through Anseong DC and Chungju Inland, lowering transport spend while keeping every hub under the 90% utilization band — except Busan, which is handled via seasonal flex.",
  tradeoff: "Fixed cost decreases slightly (-15.7%) versus S0 because Anseong DC absorbs Seoul overflow at a lower carrying cost than expanding Seoul Metro. The main risk is Busan Nov overload — mitigated by Seasonal Playbook.",
  risk: "Medium",
  serviceImpact: "+10 pts service score",
  capacityImpact: "Avg utilization 79%, no chronic overloads",
};

window.ROADMAP = [
  { phase: "Phase 1", time: "Month 0 – 3", action: "Adopt S2 hub allocation; route Gyeongbuk via Daegu East; deploy weekly cost dashboard." },
  { phase: "Phase 2", time: "Month 3 – 6", action: "Sign seasonal flex contract for Busan Port DC; run Oct–Nov peak playbook; measure variance vs forecast." },
  { phase: "Phase 3", time: "Month 6 – 12", action: "Evaluate opening Iksan Junction (H08) based on Jeolla growth; re-run S2 quarterly with refreshed demand index." },
];

// derived helpers
window.fmtKRW = (n) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + "k";
  return String(n);
};
window.fmtPct = (x, d=0) => (x * 100).toFixed(d) + "%";
window.fmtNum = (n) => n.toLocaleString("en-US");

window.HUB_BY_ID = Object.fromEntries(window.HUBS.map(h => [h.id, h]));
window.REGION_BY_ID = Object.fromEntries(window.REGIONS.map(r => [r.id, r]));
window.SCENARIO_BY_ID = Object.fromEntries(window.SCENARIOS.map(s => [s.id, s]));

// ═════════════════════════════════════════════════════════════════
// PRD v1.0 — additional fixtures (Company Profile, Directory,
// Events, Roles, Roadmap, Standard Actions, ROI, NFR, etc.)
// ═════════════════════════════════════════════════════════════════

// F-01 — Company profile form options
window.INDUSTRIES = [
  { id: "cold",     name: "Cold-chain",          en: "Cold-chain",        sla: 6,  needs: ["cold_deep","cold_mild"] },
  { id: "elec",     name: "Electronics",           en: "Electronics",       sla: 24, needs: ["high_security"]         },
  { id: "fnb",      name: "Food & Beverage",    en: "Food & Beverage",   sla: 12, needs: ["cold_mild"]             },
  { id: "fashion",  name: "Fashion & Cosmetics",   en: "Fashion & Cosmetics", sla: 24, needs: []                      },
  { id: "pharma",   name: "Healthcare",              en: "Healthcare",        sla: 4,  needs: ["gdp"]                   },
  { id: "indust",   name: "Industrial",       en: "Industrial",        sla: 48, needs: ["hazmat"]                },
  { id: "general",  name: "General",          en: "General",           sla: 24, needs: []                        },
];

window.SIZE_BANDS = [
  { id: "small",  label: "Small",        en: "Small",  rev: "< ₩10B / yr",     lateOk: 0.15, cancelRate: 0.08, repMult: 0.20 },
  { id: "medium", label: "Medium", en: "Medium", rev: "₩10B – ₩100B",    lateOk: 0.08, cancelRate: 0.15, repMult: 0.35 },
  { id: "large",  label: "Large",        en: "Large",  rev: "> ₩100B / yr",    lateOk: 0.03, cancelRate: 0.25, repMult: 0.50 },
];

// Sample completed profile that drives the rest of the app
window.COMPANY = {
  name: "Hanmoo Korea Co.",
  size: "medium",
  industry: "fashion",
  sla: 24,
  budgetCapKRW: 6_000_000_000,
  priorityRegions: ["seoul","gyeonggi","busan","incheon"],
  contact: "operations@hanmoo.kr",
  createdAt: "2026-05-12",
};

// F-02 — Upload validation steps (7-step gate)
window.VALIDATION_STEPS = [
  { id: 1, name: "Valid file format",                en: "File format OK",       check: "Extension is .xlsx / .csv / .xls", status: "pass", detail: "shipping_history_2025.xlsx · 14.2 MB" },
  { id: 2, name: "Row count ≥ 100",                       en: "Row count ≥ 100",       check: "Minimum sample size",              status: "pass", detail: "486,142 rows ingested" },
  { id: 3, name: "Time span ≥ 2 months",         en: "Time span ≥ 2 months",  check: "Coverage of date column",          status: "pass", detail: "May 2025 → Apr 2026 · 12 months" },
  { id: 4, name: "Geographic spread ≥ 5 province pairs",         en: "≥ 5 origin–dest pairs", check: "Network sparsity check",            status: "pass", detail: "168 origin–dest pairs across 17 provinces" },
  { id: 5, name: "Product mix ≥ 3 groups",      en: "≥ 3 product groups",    check: "Product mix check",                 status: "pass", detail: "5 of 7 product families present" },
  { id: 6, name: "Anomaly screen",                  en: "Anomaly screen",        check: ">10t per trip · negative distance",  status: "warn", detail: "3 rows with weight > 10,000 kg flagged for review" },
  { id: 7, name: "Immutable snapshot",                   en: "Immutable snapshot",    check: "Hash + retention 90 days",          status: "pass", detail: "sha256: 8c4e…b91a · stored 2026-05-12T09:18Z" },
];

// 100-row preview cell-level confidence (US-03)
window.UPLOAD_PREVIEW = [
  { date: "2026-04-18", origin: "Seoul",      dest: "Busan",       sku: "FA-OUTW-08", w: 142,  truck: "TR-3104", lead: 23.5, conf: 0.99 },
  { date: "2026-04-18", origin: "Soul",       dest: "Pusan",       sku: "FA-OUTW-08", w: 142,  truck: "TR-3104", lead: 23.5, conf: 0.92, flag: ["origin","dest"] },
  { date: "2026-04-18", origin: "Gyeonggi",   dest: "Daegu",       sku: "FA-DENM-12", w:  89,  truck: "TR-1184", lead: 18.2, conf: 0.99 },
  { date: "2026-04-19", origin: "Incheon",    dest: "Gwangju",     sku: "CM-LIPS-04", w:  34,  truck: "TR-2071", lead: 26.8, conf: 0.97 },
  { date: "2026-04-19", origin: "—",          dest: "Chungbuk",    sku: "FA-OUTW-08", w: 218,  truck: "",        lead: null, conf: 0.42, flag: ["origin"] },
  { date: "2026-04-19", origin: "Gyeonggi",   dest: "Jeju",        sku: "FA-BAGS-02", w:  47,  truck: "TR-9982", lead: 38.4, conf: 0.99 },
  { date: "2026-04-20", origin: "Seoul",      dest: "Gangwon",     sku: "FA-CAPS-01", w:  62,  truck: "TR-3104", lead: 14.9, conf: 0.96 },
  { date: "2026-04-20", origin: "Busan",      dest: "Daejeon",     sku: "FA-DENM-12", w:  74,  truck: "TR-1741", lead: 22.6, conf: 0.99 },
];

// F-03 — Existing warehouses declaration (US-04)
window.OWNED_WAREHOUSES = [
  { code: "WH-SEL-01", addr: "Mapo-gu, Seoul",       cap_m3: 18_500, kind: "owned",      fixedCostKRW: 1_140_000_000, mainGroup: "fashion",  usage: 0.86, costPerM3: 61_600 },
  { code: "WH-ANS-01", addr: "Anseong, Gyeonggi-do", cap_m3: 24_200, kind: "long_lease", fixedCostKRW: 1_320_000_000, mainGroup: "fashion",  usage: 0.79, costPerM3: 54_500 },
  { code: "WH-INC-02", addr: "Yeonsu-gu, Incheon",   cap_m3:  9_600, kind: "long_lease", fixedCostKRW:   720_000_000, mainGroup: "general",  usage: 0.91, costPerM3: 75_000 },
  { code: "WH-DAJ-01", addr: "Yuseong-gu, Daejeon",  cap_m3: 12_800, kind: "owned",      fixedCostKRW:   860_000_000, mainGroup: "general",  usage: 0.63, costPerM3: 67_200 },
  { code: "WH-BSN-01", addr: "Saha-gu, Busan",       cap_m3: 16_400, kind: "owned",      fixedCostKRW: 1_080_000_000, mainGroup: "fashion",  usage: 1.04, costPerM3: 65_900 },
  { code: "WH-GWJ-01", addr: "Buk-gu, Gwangju",      cap_m3:  6_200, kind: "seasonal",   fixedCostKRW:   384_000_000, mainGroup: "general",  usage: 0.41, costPerM3: 91_900, flag: "burns-money" },
];

// F-04 — National directory aggregate stats (the system "owns" 4,400+)
window.DIRECTORY = {
  total: 4_412,
  refreshedOn: "2026-04-01",
  byKind:  [ { k: "owned", n: 1_146 }, { k: "long_lease", n: 1_872 }, { k: "short_lease", n: 956 }, { k: "seasonal", n: 438 } ],
  byCert:  [
    { id: "cold_deep",     name: "Cold-deep (< −18°C)",   n:  214, color: "oklch(58% 0.13 235)" },
    { id: "cold_mild",     name: "Cold-mild (0–10°C)",    n:  642, color: "oklch(62% 0.11 200)" },
    { id: "hazmat",        name: "Hazmat-licensed",       n:  186, color: "oklch(60% 0.16 35)"  },
    { id: "gdp",           name: "GDP / pharma",          n:   94, color: "oklch(60% 0.13 145)" },
    { id: "high_security", name: "High-security",         n:  402, color: "oklch(54% 0.10 280)" },
    { id: "standard",      name: "Standard / multi-use",  n: 2_874,color: "oklch(70% 0.05 200)" },
  ],
  byRegion: [
    { region: "seoul",    n:  624 }, { region: "gyeonggi", n: 1_087 }, { region: "incheon",  n:  386 },
    { region: "chungnam", n:  214 }, { region: "chungbuk", n:  168 }, { region: "daejeon",  n:  142 },
    { region: "sejong",   n:   38 }, { region: "gangwon",  n:  136 }, { region: "jeonbuk",  n:  176 },
    { region: "jeonnam",  n:  148 }, { region: "gwangju",  n:  112 }, { region: "gyeongbuk",n:  248 },
    { region: "daegu",    n:  186 }, { region: "gyeongnam",n:  264 }, { region: "ulsan",    n:   98 },
    { region: "busan",    n:  348 }, { region: "jeju",     n:   37 },
  ],
  trust: [ { level: "Verified",   pct: 0.72 }, { level: "Self-reported", pct: 0.21 }, { level: "Inferred", pct: 0.07 } ],
};

// Sample directory rows (preview list)
window.DIRECTORY_SAMPLE = [
  { id: "D-08461", name: "GS Anseong Logistics Center",      region: "gyeonggi", cap: 38_400, certs: ["cold_mild","standard"],    rent: "available", monthlyKRW: 184_000_000, trust: "Verified",    cost_m3: 57_400 },
  { id: "D-02118", name: "Yongsan East Bay #3",              region: "seoul",    cap: 14_200, certs: ["high_security","standard"], rent: "available", monthlyKRW:  96_000_000, trust: "Verified",    cost_m3: 76_200 },
  { id: "D-06724", name: "Pyeongtaek Port Bonded #C",        region: "gyeonggi", cap: 22_800, certs: ["standard"],                  rent: "limited",   monthlyKRW: 134_000_000, trust: "Verified",    cost_m3: 62_100 },
  { id: "D-09312", name: "Busan Gamcheon Cold Hub",          region: "busan",    cap: 18_600, certs: ["cold_deep","cold_mild"],     rent: "available", monthlyKRW: 162_000_000, trust: "Verified",    cost_m3: 70_800 },
  { id: "D-04588", name: "Daejeon Yuseong Bio Park",         region: "daejeon",  cap:  9_400, certs: ["gdp","cold_mild"],            rent: "long_lease",monthlyKRW:  82_000_000, trust: "Self-reported", cost_m3: 81_500 },
  { id: "D-07103", name: "Cheongju Inland Multi-Use",        region: "chungbuk", cap: 12_800, certs: ["standard"],                   rent: "available", monthlyKRW:  64_000_000, trust: "Verified",    cost_m3: 53_200 },
  { id: "D-08827", name: "Daegu Bukgu Logistics Center",     region: "daegu",    cap: 16_200, certs: ["high_security","standard"],   rent: "available", monthlyKRW: 102_000_000, trust: "Verified",    cost_m3: 61_900 },
  { id: "D-11402", name: "Gwangju Pyeongdong Industrial",    region: "gwangju",  cap:  8_600, certs: ["hazmat","standard"],          rent: "limited",   monthlyKRW:  58_000_000, trust: "Self-reported", cost_m3: 68_400 },
  { id: "D-12089", name: "Jeju Aewol Refrigerated",          region: "jeju",     cap:  3_200, certs: ["cold_mild"],                   rent: "seasonal",  monthlyKRW:  41_000_000, trust: "Inferred",    cost_m3: 124_800 },
  { id: "D-05241", name: "Wonju Inland Flex Park",           region: "gangwon",  cap:  6_800, certs: ["standard"],                   rent: "seasonal",  monthlyKRW:  38_000_000, trust: "Verified",    cost_m3: 56_700 },
];

// F-06 — Distance matrix (17×17) — partial sample for the UI
window.DISTANCE = (() => {
  // generate a deterministic km matrix from region positions (Haversine-ish proxy)
  const reg = window.REGIONS;
  const km = (a, b) => {
    const dx = (a.x - b.x) * 480, dy = (a.y - b.y) * 600;
    return Math.round(Math.sqrt(dx*dx + dy*dy));
  };
  const m = {};
  reg.forEach(o => {
    m[o.id] = {};
    reg.forEach(d => { m[o.id][d.id] = km(o, d); });
  });
  return m;
})();

window.PORTS = [
  { id: "busan-port",     name: "Busan Port",          x: 0.69, y: 0.74, type: "seaport"  },
  { id: "incheon-port",   name: "Incheon Port",        x: 0.29, y: 0.31, type: "seaport"  },
  { id: "pyeongtaek",     name: "Pyeongtaek",          x: 0.36, y: 0.41, type: "seaport"  },
  { id: "gwangyang",      name: "Gwangyang",           x: 0.46, y: 0.78, type: "seaport"  },
  { id: "icn-airport",    name: "Incheon Int. Airport",x: 0.26, y: 0.27, type: "airport"  },
];

window.CORRIDORS = [
  { id: "SEL-BUS", origin: "seoul",    dest: "busan",    km: 396, hrs: 5.4, peak: 7.8, lanes: 4, util: 0.92, status: "near" },
  { id: "GYO-DAE", origin: "gyeonggi", dest: "daegu",    km: 268, hrs: 3.6, peak: 5.1, lanes: 4, util: 0.84, status: "healthy" },
  { id: "SEL-GWA", origin: "seoul",    dest: "gwangju", km: 312,  hrs: 4.2, peak: 6.0, lanes: 3, util: 0.76, status: "healthy" },
  { id: "DAJ-BUS", origin: "daejeon",  dest: "busan",    km: 268, hrs: 3.4, peak: 4.8, lanes: 4, util: 0.81, status: "healthy" },
  { id: "INC-BUS", origin: "incheon",  dest: "busan",    km: 421, hrs: 5.6, peak: 8.2, lanes: 3, util: 1.04, status: "congested" },
  { id: "GYO-GWA", origin: "gyeonggi", dest: "gwangju", km: 316,  hrs: 4.0, peak: 5.8, lanes: 3, util: 0.69, status: "healthy" },
  { id: "DAE-GYE", origin: "daegu",    dest: "gyeongnam",km: 132, hrs: 2.0, peak: 2.8, lanes: 3, util: 0.71, status: "healthy" },
  { id: "SEL-DAE", origin: "seoul",    dest: "daegu",    km: 286, hrs: 3.8, peak: 5.4, lanes: 4, util: 0.97, status: "near" },
];

// F-05 — Seasonal events library (4 types · 30+ events; key ones shown)
window.EVENT_TYPES = [
  { id: "culture",    name: "Cultural · recurring",   en: "Cultural · recurring",   color: "oklch(60% 0.13 320)" },
  { id: "commerce",   name: "Commerce · recurring",en: "Commerce · recurring",   color: "oklch(56% 0.11 205)" },
  { id: "surprise",   name: "Surprise · disruption",    en: "Surprise · disruption",  color: "oklch(58% 0.16 28)"  },
  { id: "industry",   name: "Industry-specific",  en: "Industry-specific",      color: "oklch(60% 0.13 145)" },
];

window.EVENTS = [
  { id: "E-001", type: "culture",  name: "Seollal (Lunar New Year)",    start: "2027-02-06", end: "2027-02-12", impact: { fashion: 1.42, fnb: 1.78, elec: 1.21, general: 1.32 }, regions: ["seoul","gyeonggi","busan","daegu"], note: "Rural → urban demand shift" },
  { id: "E-002", type: "culture",  name: "Chuseok (Harvest Moon)",      start: "2026-09-24", end: "2026-09-28", impact: { fnb: 1.84, general: 1.40, fashion: 1.15 },              regions: ["seoul","gyeonggi","chungnam","gyeongbuk"], note: "Gift-set surge for FNB" },
  { id: "E-003", type: "commerce", name: "Korean 11.11 Shopping",       start: "2026-11-11", end: "2026-11-11", impact: { fashion: 2.10, elec: 1.92, cosmetics: 1.78 },           regions: ["seoul","gyeonggi","incheon","busan"], note: "Single-day spike, full-day prep" },
  { id: "E-004", type: "commerce", name: "Black Friday + Cyber Monday", start: "2026-11-27", end: "2026-11-30", impact: { elec: 2.32, fashion: 1.84, general: 1.46 },             regions: ["seoul","gyeonggi","busan"], note: "Stacks on top of 11.11" },
  { id: "E-005", type: "commerce", name: "Back-to-school",              start: "2026-08-15", end: "2026-09-05", impact: { general: 1.28, elec: 1.34, fashion: 1.18 },             regions: ["seoul","gyeonggi","daejeon"], note: "Stationery + uniforms" },
  { id: "E-006", type: "commerce", name: "Year-end Holidays",           start: "2026-12-18", end: "2026-12-31", impact: { fashion: 1.62, cosmetics: 1.55, general: 1.40 },        regions: ["seoul","gyeonggi","busan","jeju"], note: "Cosmetics gift sets" },
  { id: "E-007", type: "surprise", name: "Logistics strike (proxy)",    start: "2026-07-08", end: "2026-07-15", impact: { general: 0.74, fashion: 0.68 },                         regions: ["busan","incheon"], note: "Port disruption — historical" },
  { id: "E-008", type: "surprise", name: "Typhoon corridor closure",    start: "2026-08-22", end: "2026-08-25", impact: { fnb: 0.62, general: 0.71 },                             regions: ["jeju","jeonnam","gyeongnam"], note: "Southern coast corridors" },
  { id: "E-009", type: "industry", name: "Rice harvest peak",           start: "2026-10-05", end: "2026-10-25", impact: { fnb: 1.38 },                                            regions: ["jeonnam","jeonbuk","chungnam"], note: "Cold-chain truck demand" },
  { id: "E-010", type: "industry", name: "Apple harvest peak",          start: "2026-10-15", end: "2026-11-05", impact: { fnb: 1.42 },                                            regions: ["gyeongbuk","gangwon"], note: "Cold-mild storage" },
];

// F-07 — Decision tables (physical / legal screening)
window.DECISION_TABLES = [
  {
    id: "temp",  name: "Temperature",
    rule: "Cold goods are restricted to warehouses with cold_deep or cold_mild certification.",
    effect: "Hard filter — removed from plan",
    examples: [
      { sku: "Ice cream",          decision: "Allow",  cert: "cold_deep" },
      { sku: "Dairy",              decision: "Allow",  cert: "cold_mild" },
      { sku: "Standard apparel",   decision: "Allow",  cert: "—" },
      { sku: "Fresh vegetables",   decision: "Reject", cert: "cold_mild required" },
    ],
  },
  {
    id: "safety", name: "Safety",
    rule: "Batteries / chemicals → hazmat. Vaccines / pharma → GDP-certified.",
    effect: "Hard filter — removed from plan",
    examples: [
      { sku: "Lithium-ion battery", decision: "Reject", cert: "hazmat required" },
      { sku: "Industrial paint",    decision: "Reject", cert: "hazmat required" },
      { sku: "Vaccine vial",        decision: "Reject", cert: "GDP required" },
    ],
  },
  {
    id: "security", name: "Security",
    rule: "Premium electronics prefer high-security warehouses — soft penalty, not exclusion.",
    effect: "Soft penalty — score adjustment, not exclusion",
    examples: [
      { sku: "Premium smartphone",  decision: "Prefer high-security", cert: "soft" },
      { sku: "Luxury handbag",      decision: "Prefer high-security", cert: "soft" },
    ],
  },
];

// Sample of the 70 ton-to-m³ coefficients
window.WEIGHT_VOLUME = [
  { group: "Fashion",      tonPerM3: 0.17, m3PerTon: 6.0 },
  { group: "Cosmetics",         tonPerM3: 0.42, m3PerTon: 2.4 },
  { group: "Small electronics",     tonPerM3: 0.51, m3PerTon: 2.0 },
  { group: "Large appliances", tonPerM3: 0.35, m3PerTon: 2.8 },
  { group: "Dry food",   tonPerM3: 0.62, m3PerTon: 1.6 },
  { group: "Frozen goods",    tonPerM3: 0.91, m3PerTon: 1.1 },
  { group: "Metal / industrial", tonPerM3: 3.30, m3PerTon: 0.3 },
];

// F-09 — Three optimization problems → three plans
window.PLANS = [
  {
    id: "P1", code: "min-distance",
    name: "Minimum Distance",        en: "Minimum total distance",
    objective: "Min Σ (distance × volume)",
    constraints: "Test 3 / 5 / 7 hub footprints; no fixed-cost objective.",
    pick: "Service-priority pick",
    badge: "Fastest",
    selectedWHs: 7,
    total_cost: 4_810,          // M KRW / mo
    avg_delay: 0.21,            // days
    geo_coverage: 0.96,         // share of demand within SLA
    resilience: 64,             // / 100
    payback: 11,
    saving: 0.064,
    tradeoff: "Best service but high fixed cost due to 7 hubs.",
  },
  {
    id: "P2", code: "min-total-cost",
    name: "Minimum Total Cost",       en: "Minimum total cost",
    objective: "Min (fixed cost + variable cost)",
    constraints: "Budget cap ₩6.0B / yr from company profile.",
    pick: "Recommended balanced pick",
    badge: "Recommended",
    selectedWHs: 5,
    total_cost: 4_145,
    avg_delay: 0.38,
    geo_coverage: 0.93,
    resilience: 71,
    payback: 8,
    saving: 0.120,
    tradeoff: "Balanced — low cost, service still hits 93% SLA.",
  },
  {
    id: "P3", code: "max-resilience",
    name: "Maximum Resilience",                en: "Maximum resilience",
    objective: "Max scenarios survived / 100 stress tests",
    constraints: "Demand spikes · hub closure · corridor congestion · pandemic.",
    pick: "Risk-averse pick",
    badge: "Most resilient",
    selectedWHs: 8,
    total_cost: 4_680,
    avg_delay: 0.34,
    geo_coverage: 0.97,
    resilience: 91,
    payback: 13,
    saving: 0.046,
    tradeoff: "Survives 91/100 scenarios but total cost is higher than P2.",
  },
];

// F-10 — Network diagnosis on current state
window.DIAGNOSIS_V2 = {
  loadBuckets: [
    { id: "burst",   name: "Bursting",       en: "Burst",         range: "> 130%", count: 1, color: "var(--danger)" },
    { id: "overflow",name: "Overflowing",          en: "Overflow",      range: "100–130%", count: 2, color: "var(--warn)"   },
    { id: "tight",   name: "Tight",     en: "Tight",         range: "85–100%",  count: 3, color: "oklch(72% 0.13 70)" },
    { id: "healthy", name: "Healthy",     en: "Healthy",       range: "60–85%",   count: 6, color: "var(--ok)"     },
    { id: "idle",    name: "Dormant",      en: "Idle",          range: "< 60%",    count: 1, color: "var(--ink-4)"  },
  ],
  blindZones: [
    { region: "jeju",     pctLate: 0.18, nearest: "Gwangju Southwest", driveHrs: 5.4, slaGap: "+82% over SLA" },
    { region: "gangwon",  pctLate: 0.11, nearest: "Anseong DC",        driveHrs: 3.2, slaGap: "+18% over SLA" },
    { region: "jeonnam",  pctLate: 0.07, nearest: "Gwangju Southwest", driveHrs: 1.4, slaGap: "+4% over SLA"  },
  ],
  burnsMoney: [
    { code: "WH-GWJ-01", reason: "Cost/m³ 92k vs median 58k; usage 41% vs median 76%",  saving: 384_000_000 },
    { code: "WH-DAJ-01", reason: "Cost/m³ within band, but usage 63% — partial flag",     saving: 124_000_000 },
  ],
  corridors: [
    { id: "INC-BUS", forecastUtil: 1.04, recommend: "Open Pyeongtaek bypass during 11.11 + Black Friday" },
    { id: "SEL-DAE", forecastUtil: 0.97, recommend: "Pre-stage 30% at Anseong; daily monitoring after Oct 25" },
  ],
};

// F-11 — 8 warehouse roles + assignments
window.ROLES = [
  { id: "national", name: "National Anchor",   en: "National Anchor",      whs: ["WH-ANS-01"], rule: "P1 output — largest warehouse, nationwide service" },
  { id: "regional", name: "Regional Hub",          en: "Regional Hub",         whs: ["WH-DAJ-01","WH-BSN-01"], rule: "P2 output — warehouse covering a macro-region" },
  { id: "cold",     name: "Cold Distribution Station",     en: "Cold Distribution",    whs: ["D-09312"], rule: "Cold + FNB > 50% & top 30% capacity" },
  { id: "secure",   name: "Security Bay",            en: "Security Bay",         whs: ["WH-SEL-01","D-02118"], rule: "Electronics + premium > 60% with high-security" },
  { id: "lastmile", name: "Last-mile Relief",       en: "Last-mile Relief",     whs: ["WH-INC-02"], rule: "Small site within 30 km urban radius" },
  { id: "port",     name: "Port Trans-shipment",  en: "Port Trans-shipment",  whs: ["D-06724"], rule: "< 50 km to port & top 50% capacity" },
  { id: "relief",   name: "Blind-zone Relief",             en: "Blind-zone Relief",    whs: ["D-12089"], rule: "Newly-leased site (200–1,000 m³) covering a blind zone" },
  { id: "standby",  name: "Standby Warehouse",            en: "Standby (downgrade)",  whs: ["WH-GWJ-01"], rule: "Money-burning warehouse downgraded; opens only when load > 95%" },
];

// F-12 standard actions — Appendix A · 12 standard actions
window.STANDARD_ACTIONS = [
  { id: "A1",  name: "Pre-stage inventory",                 en: "Pre-stage to regional hubs", when: "Every major event",         kind: "stage"   },
  { id: "A2",  name: "Open standby warehouse",                     en: "Activate standby",           when: "Load > 95%",                kind: "open"    },
  { id: "A3",  name: "Switch to alternate corridor",              en: "Reroute via alternate lane", when: "Main corridor congested",    kind: "reroute" },
  { id: "A4",  name: "Increase trip frequency to last-mile station",       en: "Increase trips to last-mile",when: "SLA at risk",            kind: "freq"    },
  { id: "A5",  name: "Hire seasonal drivers",                 en: "Hire seasonal drivers",      when: "Transport capacity short",   kind: "people"  },
  { id: "A6",  name: "Cap maximum dwell time",                 en: "Cap maximum dwell time",     when: "Urgently free up capacity",  kind: "policy"  },
  { id: "A7",  name: "Close after-hours order intake",             en: "Close after-hours orders",   when: "Load > 110%",               kind: "policy"  },
  { id: "A8",  name: "Apply priority-shipping surcharge",               en: "Priority-shipping surcharge",when: "Load 90–110%",              kind: "pricing" },
  { id: "A9",  name: "Pull stock from neighbouring warehouses",             en: "Pull stock from neighbours", when: "Regional warehouse full",         kind: "balance" },
  { id: "A10", name: "Negotiate additional transport contracts",         en: "Spot-contract carriers",     when: "Long-term capacity shortage",   kind: "contract"},
  { id: "A11", name: "Activate late-delivery insurance",          en: "Activate late-delivery cover",when:"SLA breach forecast",        kind: "risk"    },
  { id: "A12", name: "Open backup customer-comms channel",en: "Open customer comms channel",when:"When A1–A11 are insufficient",       kind: "comms"   },
];

// Per-event playbook (filtered by industry — sample shown for fashion + commerce)
window.PLAYBOOKS = [
  {
    eventId: "E-003", name: "Korean 11.11 Shopping",
    start: "2026-11-11", end: "2026-11-11",
    headGroup: "Fashion + Cosmetics + Electronics", uplift: "+92 % vs base",
    peakStatus: "WH-BSN-01 ▸ Burst · WH-SEL-01 ▸ Tight",
    steps: [
      { action: "A1",  detail: "Pre-stage 8,400 m³ to Anseong (WH-ANS-01) by Nov-08 cut-off." },
      { action: "A8",  detail: "Apply +12% priority surcharge during Nov-10 to Nov-12." },
      { action: "A4",  detail: "Last-mile trips Seoul → 4× normal frequency for 72 h." },
    ],
    retreat: { trigger: "Daily order volume drops below 130% of Oct average", monitorDays: 3, threshold: "< 1.30× baseline for 3 consecutive days" },
  },
  {
    eventId: "E-004", name: "Black Friday + Cyber Monday",
    start: "2026-11-27", end: "2026-11-30",
    headGroup: "Electronics + Fashion", uplift: "+108 %",
    peakStatus: "INC-BUS corridor ▸ Congested · WH-BSN-01 ▸ Overflow",
    steps: [
      { action: "A3",  detail: "Reroute Incheon → Busan via Pyeongtaek bypass during Nov-26 – Dec-01." },
      { action: "A2",  detail: "Open standby WH-GWJ-01 to absorb +6,200 m³ overflow." },
      { action: "A5",  detail: "Contract 22 seasonal drivers for southern corridors." },
    ],
    retreat: { trigger: "Corridor utilisation < 85% for 48 h", monitorDays: 5, threshold: "Close standby when utilisation < 70% sustained" },
  },
  {
    eventId: "E-001", name: "Seollal (Lunar New Year)",
    start: "2027-02-06", end: "2027-02-12",
    headGroup: "Food & Beverage + Gifting", uplift: "+78 %",
    peakStatus: "WH-DAJ-01 ▸ Tight · Rural→Urban shift",
    steps: [
      { action: "A1",  detail: "Pre-stage 5,200 m³ FNB from Daejeon to Seoul + Busan by Jan-30." },
      { action: "A9",  detail: "Pull 1,800 m³ from Chungbuk inland to WH-ANS-01." },
      { action: "A11", detail: "Activate SLA cover for Jeju + Jeonnam corridors during typhoon window." },
    ],
    retreat: { trigger: "Demand shape returns within ±10% of base", monitorDays: 7, threshold: "Release pre-staged inventory after Feb-14" },
  },
];

// F-13 — ROI model
window.ROI_V2 = {
  baselinePlan: "current",
  recommendedPlan: "P2",
  annual_value: 6_780_000_000,
  incremental_fixed_cost: 4_500_000_000,
  ROI_ratio: 1.51,
  payback_months: 8,
  ordersDelayedPerYear: 142_000,
  cancellationRate: 0.15,
  avgOrderValueKRW: 86_000,
  revenue_loss:    1_832_000_000,
  reputation_loss:   641_200_000,
  recommendation: "Pilot one region first", // ROI 1.5–2.5 band
  recommendationCode: "pilot",
  pilotRegion: "Seoul + Gyeonggi",
};

// F-14 — Implementation roadmap (T+1 → T+9+)
window.ROADMAP_V2 = [
  { id: "R1", phase: "T+1 – 2",  theme: "Legal & People",     en: "Legal & People",
    tasks: [ "Sign contract for warehouse D-08461 (Anseong)", "Decommission WH-GWJ-01 (final phase)", "Hire 12 new warehouse staff" ],
    owner: "COO + HR + Legal", budgetKRW: 420_000_000, kpi: "100% contracts signed · 0 staff disruption" },
  { id: "R2", phase: "T+3 – 4",  theme: "Infrastructure",                en: "Infrastructure",
    tasks: [ "Install cold + security at D-09312", "Roll out unified WMS to 3 new warehouses", "IT integration rails between 3 sites" ],
    owner: "Head of IT + Operations", budgetKRW: 980_000_000, kpi: "WMS uptime ≥ 99% across 4-week pilot" },
  { id: "R3", phase: "T+5 – 6",  theme: "Single-region pilot",        en: "Single-region pilot",
    tasks: [ "Run 8-week pilot in Seoul + Gyeonggi", "Measure order accuracy, lead time, cost/m³", "Surface real-world risks" ],
    owner: "COO + Pilot lead", budgetKRW: 240_000_000, kpi: "Lead time ≤ 24 h, cost/m³ down 12% vs baseline" },
  { id: "R4", phase: "T+7 – 8",  theme: "National rollout",      en: "National rollout",
    tasks: [ "Expand to the remaining 5 provinces", "Close WH-GWJ-01 (D-day)", "Board report locking phase 1" ],
    owner: "COO + Logistics Director", budgetKRW: 1_280_000_000, kpi: "Entire network stable for 4 consecutive weeks" },
  { id: "R5", phase: "T+9 +",    theme: "Continuous optimisation",        en: "Continuous optimisation",
    tasks: [ "2-page quarterly update report (US-14)", "Re-run engine each new season", "Tune routing using live operational data" ],
    owner: "Analyst team",       budgetKRW:  60_000_000, kpi: "Forecast MAPE ≤ 18% after 2 quarters live" },
];

// F-15 — Cross-logic consistency check results
window.CONSISTENCY = {
  pass: 11,
  warn: 1,
  fail: 0,
  checks: [
    { id: "C1",  name: "ROI numerator matches Plan P2 saving",             status: "pass" },
    { id: "C2",  name: "Roadmap budget total ≤ incremental_fixed_cost",     status: "pass" },
    { id: "C3",  name: "Recommended plan ID consistent across sections",    status: "pass" },
    { id: "C4",  name: "Playbook only emits events tied to industry filter",status: "pass" },
    { id: "C5",  name: "Standard actions referenced ⊂ A1–A12",              status: "pass" },
    { id: "C6",  name: "Blind-zone count ≥ corridor recommendations",       status: "warn", note: "Jeju corridor pending alternate-port study" },
    { id: "C7",  name: "Capacity sums by region match directory aggregate", status: "pass" },
    { id: "C8",  name: "Distance matrix symmetric within ±2%",              status: "pass" },
    { id: "C9",  name: "Weight→volume coefficients applied uniformly",      status: "pass" },
    { id: "C10", name: "Decision tables block all listed unsafe SKUs",      status: "pass" },
    { id: "C11", name: "Validation step 7 snapshot hash present",           status: "pass" },
    { id: "C12", name: "No personally identifying info in upload preview",  status: "pass" },
  ],
};

// §7 NFRs — surfaced on Overview "System Status" tile
window.NFR = [
  { id: "perf",   name: "End-to-end (P95)",       target: "≤ 15 min · 1.5M rows", actual: "11.4 min · 486k rows", status: "pass" },
  { id: "load",   name: "Dashboard load (P95)",    target: "≤ 3 s",                actual: "1.8 s",                status: "pass" },
  { id: "uptime", name: "Uptime",                  target: "≥ 99.5%",              actual: "99.82%",               status: "pass" },
  { id: "geo",    name: "Province normalisation",  target: "≥ 98%",                actual: "99.4%",                status: "pass" },
  { id: "sku",    name: "SKU mapping accuracy",    target: "≥ 90%",                actual: "92.7%",                status: "pass" },
  { id: "mape",   name: "Forecast MAPE",           target: "≤ 20%",                actual: "17.6%",                status: "pass" },
  { id: "sec",    name: "Encryption",              target: "AES-256 / TLS 1.3",    actual: "Enforced",             status: "pass" },
  { id: "comp",   name: "Compliance",              target: "PIPA (Korea)",         actual: "Certified",            status: "pass" },
];

// Quick lookups
window.EVENT_BY_ID    = Object.fromEntries(window.EVENTS.map(e => [e.id, e]));
window.PLAN_BY_ID     = Object.fromEntries(window.PLANS.map(p => [p.id, p]));
window.ROLE_BY_ID     = Object.fromEntries(window.ROLES.map(r => [r.id, r]));
window.ACTION_BY_ID   = Object.fromEntries(window.STANDARD_ACTIONS.map(a => [a.id, a]));
window.INDUSTRY_BY_ID = Object.fromEntries(window.INDUSTRIES.map(i => [i.id, i]));
window.SIZE_BY_ID     = Object.fromEntries(window.SIZE_BANDS.map(s => [s.id, s]));
