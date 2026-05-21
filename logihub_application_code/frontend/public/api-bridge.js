/**
 * LogiHub API Bridge
 * ------------------
 * Thin layer between the LogiHub.html prototype and the FastAPI backend
 * (http://localhost:8000).  Falls back to mock data gracefully when the
 * backend is offline.
 *
 * Exposes:  window.API  (object with all callable methods)
 * Emits:    CustomEvent "logihub:backend-ready"   – backend connected + data loaded
 *           CustomEvent "logihub:plans-updated"   – live optimization results available
 *           CustomEvent "logihub:upload-done"     – file upload completed
 */

(function () {
  "use strict";

  const BASE = "http://localhost:8000";
  const TIMEOUT_MS = 90_000; // 90 s — optimizer can be slow on first run

  // ── State shared with the rest of the prototype ─────────────────────────
  window.API_STATE = {
    online:        false,   // backend reachable?
    dataLoaded:    false,   // DATA_STORE populated?
    running:       false,   // optimization in flight?
    liveResults:   null,    // last successful /api/optimize/all response
    liveScenarios: null,    // last successful /api/optimize/all-scenarios response
    error:         null,
  };

  // ── Low-level fetch wrapper ───────────────────────────────────────────────
  async function apiFetch(path, options = {}, timeoutMs = TIMEOUT_MS) {
    const ctrl = new AbortController();
    const tid   = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(BASE + path, { ...options, signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) {
        const txt = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(tid);
      throw err;
    }
  }

  // ── Health check & auto-init ──────────────────────────────────────────────
  async function probe() {
    try {
      const data = await apiFetch("/api/status", {}, 4000);
      window.API_STATE.online     = true;
      window.API_STATE.dataLoaded = data.data_loaded || false;
      return data;
    } catch (_) {
      window.API_STATE.online = false;
      return null;
    }
  }

  async function loadDefaults() {
    const res = await apiFetch("/api/load-defaults", { method: "POST" }, 20_000);
    if (res.status === "success") {
      window.API_STATE.dataLoaded = true;
      window.dispatchEvent(new CustomEvent("logihub:backend-ready", { detail: res.data }));
    }
    return res;
  }

  // ── Upload real files ─────────────────────────────────────────────────────
  async function uploadFiles(odFile, warehouseFile) {
    const form = new FormData();
    if (odFile)        form.append("od_file",        odFile);
    if (warehouseFile) form.append("warehouse_file", warehouseFile);

    const res = await apiFetch("/api/upload", { method: "POST", body: form }, 30_000);
    if (res.status === "success") {
      window.API_STATE.dataLoaded = true;
      window.dispatchEvent(new CustomEvent("logihub:upload-done", { detail: res.data }));
    }
    return res;
  }

  // ── Run all three optimizers ──────────────────────────────────────────────
  async function runAll(p1Hubs = 5, p3Hubs = 5, p3Radius = 150) {
    if (!window.API_STATE.dataLoaded) {
      throw new Error("No data loaded. Call loadDefaults() or upload files first.");
    }
    window.API_STATE.running = true;
    window.API_STATE.error   = null;

    try {
      const form = new FormData();
      form.append("p1_hubs",   p1Hubs);
      form.append("p3_hubs",   p3Hubs);
      form.append("p3_radius", p3Radius);

      const res = await apiFetch("/api/optimize/all", { method: "POST", body: form });

      if (res.status !== "success") throw new Error(res.detail || "Optimization failed");

      window.API_STATE.liveResults = res.data;

      // Patch window.PLANS with real numbers so every existing chart re-renders
      _patchPlans(res.data);

      window.dispatchEvent(new CustomEvent("logihub:plans-updated", { detail: res.data }));
      return res.data;
    } finally {
      window.API_STATE.running = false;
    }
  }

  // ── Run all 9 scenarios (engine_b framework + real PuLP solvers) ─────────
  async function runAllScenarios() {
    if (!window.API_STATE.dataLoaded) {
      throw new Error("No data loaded. Call loadDefaults() or upload files first.");
    }
    window.API_STATE.running = true;
    window.API_STATE.error   = null;

    try {
      const res = await apiFetch("/api/optimize/all-scenarios", { method: "POST" }, 120_000);
      if (res.status !== "success") throw new Error(res.detail || "9-scenario run failed");

      window.API_STATE.liveScenarios = res.data;
      window.dispatchEvent(new CustomEvent("logihub:scenarios-updated", { detail: res.data }));
      return res.data;
    } finally {
      window.API_STATE.running = false;
    }
  }

  // ── Single-plan endpoints ─────────────────────────────────────────────────
  async function runPMedian(p = 5) {
    const form = new FormData();
    form.append("p", p);
    return apiFetch("/api/optimize/p-median", { method: "POST", body: form });
  }

  async function runCFLP() {
    return apiFetch("/api/optimize/cflp", { method: "POST", body: new FormData() });
  }

  async function runMCLP(p = 5, radius = 150) {
    const form = new FormData();
    form.append("p",      p);
    form.append("radius", radius);
    return apiFetch("/api/optimize/mclp", { method: "POST", body: form });
  }

  async function getBaseline() {
    return apiFetch("/api/network/baseline");
  }

  // ── Patch window.PLANS with live solver results ───────────────────────────
  /**
   * Convert the backend's metric schema to the numbers the prototype
   * data.js PLANS objects use for display.
   *
   * Backend gives (per plan):
   *   metrics.total_cost_usd        – USD, includes transport + fixed
   *   metrics.avg_lead_time_hrs     – hours
   *   metrics.coverage_within_150km_pct – 0-100
   *   opened_hubs                   – array of hub objects
   *   assignments                   – region-hub pairs
   *
   * Prototype PLANS uses:
   *   total_cost    – ₩ millions / month  (we convert from USD using ~1350 KRW/USD)
   *   avg_delay     – days
   *   geo_coverage  – 0-1
   *   resilience    – 0-100 (kept from mock — needs 100 simulations)
   *   saving        – fraction vs "current"
   *   payback       – months
   *   selectedWHs   – number of open hubs
   *   hubs          – array of hub IDs
   *   liveMetrics   – raw backend metrics (extra, for detail panel)
   */
  function _patchPlans(data) {
    if (!window.PLANS || !window.PLAN_BY_ID) return;

    const USD_TO_KRW  = 1_350;           // rough exchange rate
    const MONTHS      = 12;

    // "Current" baseline — use P2 mock as reference for saving %
    const currentCostKRW = window.PLAN_BY_ID["P2"]
      ? window.PLAN_BY_ID["P2"]._mockCost || window.PLAN_BY_ID["P2"].total_cost
      : 4_705;

    const planMap = { P1: data.P1, P2: data.P2, P3: data.P3 };

    window.PLANS.forEach(plan => {
      const r = planMap[plan.id];
      if (!r || r.status !== "Optimal") return;

      const m = r.metrics;

      // Preserve mock cost on first patch so saving% is stable
      if (!plan._mockCost) plan._mockCost = plan.total_cost;

      // Convert annual USD cost → monthly ₩ millions
      const annualUSD  = m.total_cost_usd || 0;
      const monthlyKRW_M = (annualUSD * USD_TO_KRW) / (1_000_000 * MONTHS);

      plan.total_cost  = Math.round(monthlyKRW_M) || plan._mockCost;
      plan.avg_delay   = parseFloat(((m.avg_lead_time_hrs || 0) / 24).toFixed(3));
      plan.geo_coverage = (m.coverage_within_150km_pct || 0) / 100;
      plan.selectedWHs = r.opened_hubs.length;
      plan.hubs        = r.opened_hubs.map(h => h.id);

      // saving vs "current" mock baseline
      const mockRef    = plan._mockCost || currentCostKRW;
      plan.saving      = mockRef > 0 ? Math.max(0, 1 - plan.total_cost / mockRef) : plan.saving;

      // Payback: rough estimate based on saving
      const annualSavingKRW_M = plan.saving * mockRef * MONTHS;
      plan.payback = annualSavingKRW_M > 0
        ? Math.max(1, Math.round((plan.total_cost * 2) / (annualSavingKRW_M / MONTHS)))
        : plan.payback;

      // Store raw API data for detail panel
      plan.liveMetrics = {
        total_cost_usd:        m.total_cost_usd,
        avg_distance_km:       m.avg_distance_km,
        avg_lead_time_hrs:     m.avg_lead_time_hrs,
        co2_emissions_kg:      m.co2_emissions_kg,
        coverage_pct:          m.coverage_within_150km_pct,
        total_tons:            m.total_tons,
        opened_hubs:           r.opened_hubs,
        assignments:           r.assignments,
      };

      // Update PLAN_BY_ID alias too
      if (window.PLAN_BY_ID[plan.id]) {
        Object.assign(window.PLAN_BY_ID[plan.id], plan);
      }
    });

    // Update ROI_V2 recommended plan
    if (window.ROI_V2 && data.recommended) {
      window.ROI_V2.recommendedPlan = data.recommended;
    }
  }

  // ── Auto-init on page load ────────────────────────────────────────────────
  async function init() {
    const status = await probe();
    if (!status) {
      console.info("[LogiHub API] Backend offline — running in mock mode.");
      return;
    }
    console.info("[LogiHub API] Backend online. data_loaded:", window.API_STATE.dataLoaded);

    if (!window.API_STATE.dataLoaded) {
      try {
        await loadDefaults();
        console.info("[LogiHub API] Default dataset loaded.");
      } catch (e) {
        console.warn("[LogiHub API] load-defaults failed:", e.message);
      }
    } else {
      window.dispatchEvent(new CustomEvent("logihub:backend-ready", { detail: status }));
    }
  }

  // ── Public API surface ────────────────────────────────────────────────────
  window.API = {
    probe,
    loadDefaults,
    uploadFiles,
    runAll,
    runAllScenarios,
    runPMedian,
    runCFLP,
    runMCLP,
    getBaseline,
    get state() { return window.API_STATE; },
  };

  // Auto-run after the page DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
