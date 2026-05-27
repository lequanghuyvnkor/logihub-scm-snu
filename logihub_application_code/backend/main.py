from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import os
import concurrent.futures

from utils import compute_distance_matrix
from models import run_p_median, run_cflp, run_baseline, run_uflp, run_mclp

app = FastAPI(title="LogiHub Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for MVP (should use DB in prod)
DATA_STORE = {
    "demand": None,
    "hubs": None,
    "distances": None
}

# ─── Helpers ────────────────────────────────────────────────────────────────

def _require_data():
    if DATA_STORE["demand"] is None or DATA_STORE["hubs"] is None or DATA_STORE["distances"] is None:
        raise HTTPException(status_code=400, detail="No data loaded. Call /api/load-defaults or POST /api/upload first.")

def filter_hubs(df_hubs, storage_type):
    if storage_type and storage_type != "All":
        filtered = df_hubs[df_hubs['storage_item'] == storage_type]
        if len(filtered) == 0:
            raise ValueError(f"No hubs found for storage type: {storage_type}")
        return filtered
    return df_hubs

def _build_demand_df(group_a_dir: str, demand_scale: float = 1.0) -> pd.DataFrame:
    """
    Merge region_master (lat/lon) + regional_demand (demand_weight_ton) by row order.
    Both files have exactly 17 rows in the same regional order.
    demand_scale divides the raw tons so values fit within hub capacity constraints.
    """
    region_master = pd.read_csv(
        os.path.join(group_a_dir, "region_master.csv"),
        encoding="utf-8-sig",
    )
    regional_demand = pd.read_csv(
        os.path.join(group_a_dir, "regional_demand.csv"),
        encoding="utf-8-sig",
    )
    if len(region_master) != len(regional_demand):
        raise ValueError("region_master and regional_demand row counts do not match")

    return pd.DataFrame({
        "region_id":   region_master["region_id"].values,
        "lat":         region_master["lat"].values,
        "lon":         region_master["lon"].values,
        "demand_tons": (regional_demand["demand_weight_ton"].values / demand_scale).astype(float),
    })


def _build_hubs_df(group_b_dir: str) -> pd.DataFrame:
    """
    Map candidate_hubs.csv columns → the schema expected by the solvers.
    Required by models.py: hub_id, lat, lon, capacity_tons, fixed_cost, storage_item, company_name
    """
    raw = pd.read_csv(
        os.path.join(group_b_dir, "candidate_hubs.csv"),
        encoding="utf-8-sig",
    )
    return pd.DataFrame({
        "hub_id":       raw["hub_id"],
        "company_name": raw["hub_name"],
        "lat":          raw["lat"],
        "lon":          raw["lon"],
        "capacity_tons": raw["effective_capacity"].astype(float),
        "fixed_cost":   raw["fixed_cost_usd_per_year"].astype(float),
        "storage_item": raw["hub_type"],          # metro / port / regional / launch / secure
        "hub_type":     raw["hub_type"],
        "region_id":    raw["region_id"],
    })


# ─── Existing endpoints ──────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {
        "message": "Welcome to LogiHub Intelligence API",
        "data_loaded": DATA_STORE["demand"] is not None,
    }

@app.get("/api/status")
def api_status():
    loaded = DATA_STORE["demand"] is not None
    return {
        "status": "ok",
        "data_loaded": loaded,
        "demand_regions": int(len(DATA_STORE["demand"])) if loaded else 0,
        "candidate_hubs": int(len(DATA_STORE["hubs"])) if loaded else 0,
    }

@app.post("/api/upload")
async def upload_data(od_file: UploadFile = File(None), warehouse_file: UploadFile = File(None)):
    if not od_file and not warehouse_file:
        raise HTTPException(status_code=400, detail="No files provided")

    result = {}

    if od_file:
        content = await od_file.read()
        try:
            try:
                decoded_content = content.decode('utf-8-sig')
            except UnicodeDecodeError:
                decoded_content = content.decode('cp949', errors='replace')
            df_od = pd.read_csv(io.StringIO(decoded_content))
            DATA_STORE["demand"] = df_od
            result["od_records"] = len(df_od)
            result["od_columns"] = df_od.columns.tolist()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing O/D file: {str(e)}")

    if warehouse_file:
        content = await warehouse_file.read()
        try:
            try:
                decoded_content = content.decode('utf-8-sig')
            except UnicodeDecodeError:
                decoded_content = content.decode('cp949', errors='replace')
            df_wh = pd.read_csv(io.StringIO(decoded_content))
            DATA_STORE["hubs"] = df_wh
            result["warehouse_records"] = len(df_wh)
            result["warehouse_columns"] = df_wh.columns.tolist()
        except Exception as e:
            return {"status": "error", "message": f"Error parsing Warehouse file: {str(e)}"}

    if DATA_STORE["demand"] is not None and DATA_STORE["hubs"] is not None:
        try:
            df_dist = compute_distance_matrix(DATA_STORE["demand"], DATA_STORE["hubs"])
            DATA_STORE["distances"] = df_dist
            result["distance_matrix_computed"] = True
            
            # Return full hubs for frontend syncing
            if "hub_id" in DATA_STORE["hubs"].columns:
                result["hubs"] = DATA_STORE["hubs"].to_dict(orient="records")
        except Exception as e:
            result["distance_matrix_error"] = str(e)

    return {"status": "success", "data": result}


# ─── NEW: Load defaults ───────────────────────────────────────────────────────

@app.post("/api/load-defaults")
async def load_defaults():
    """
    Auto-load the bundled mock datasets from disk.
    Eliminates the need for manual CSV upload in demo / dev mode.
    """
    base      = os.path.dirname(os.path.abspath(__file__))
    group_a   = os.path.join(base, "mocks", "group_A_data")
    group_b   = os.path.join(base, "mocks", "group_B_data")

    try:
        # Auto-scale demand so total demand ≈ 80 % of total hub capacity.
        # Raw freight tonnage (annual, gross) is orders of magnitude larger than
        # warehouse storage capacity — we normalise before feeding the solvers.
        df_hubs_raw      = pd.read_csv(os.path.join(group_b, "candidate_hubs.csv"), encoding="utf-8-sig")
        df_demand_raw    = pd.read_csv(os.path.join(group_a, "regional_demand.csv"), encoding="utf-8-sig")
        total_raw_demand = df_demand_raw["demand_weight_ton"].sum()
        total_capacity   = df_hubs_raw["effective_capacity"].sum()
        # Target 80 % fill rate — leaves slack for CFLP capacity constraints
        demand_scale     = total_raw_demand / (total_capacity * 0.80)

        df_demand = _build_demand_df(group_a, demand_scale=demand_scale)
        df_hubs   = _build_hubs_df(group_b)
        df_dist   = compute_distance_matrix(df_demand, df_hubs)

        DATA_STORE["demand"]    = df_demand
        DATA_STORE["hubs"]      = df_hubs
        DATA_STORE["distances"] = df_dist

        return {
            "status": "success",
            "data": {
                "demand_regions":   int(len(df_demand)),
                "candidate_hubs":   int(len(df_hubs)),
                "distance_pairs":   int(len(df_dist)),
                "hub_ids":          df_hubs["hub_id"].tolist(),
                "region_ids":       df_demand["region_id"].tolist(),
                "hubs":             df_hubs.to_dict(orient="records"),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load defaults: {str(e)}")


# ─── NEW: Run all three optimizers in one call ────────────────────────────────

@app.post("/api/optimize/all")
async def optimize_all(
    p1_hubs: int  = Form(5),       # P1: number of hubs for p-median
    p3_hubs: int  = Form(5),       # P3: number of hubs for MCLP
    p3_radius: int = Form(150),    # P3: coverage radius km
):
    """
    Run P1 (p-median, minimize distance), P2 (CFLP, minimize cost),
    and P3 (MCLP, maximize coverage) in parallel.
    Returns all three results plus a recommendation.
    """
    _require_data()

    demand    = DATA_STORE["demand"]
    hubs      = DATA_STORE["hubs"]
    distances = DATA_STORE["distances"]

    # Run in parallel threads (PuLP/CBC releases the GIL during solve)
    def _p1(): return run_p_median(demand, hubs, distances, p1_hubs)
    def _p2(): return run_cflp(demand, hubs, distances)
    def _p3(): return run_mclp(demand, hubs, distances, p3_hubs, p3_radius)

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
            f_p1 = pool.submit(_p1)
            f_p2 = pool.submit(_p2)
            f_p3 = pool.submit(_p3)
            r_p1 = f_p1.result(timeout=60)
            r_p2 = f_p2.result(timeout=60)
            r_p3 = f_p3.result(timeout=60)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")

    # Derive a simple recommendation: pick the plan with best (coverage + cost balance)
    def _score(r):
        if not r or r.get("status") != "Optimal" or "metrics" not in r:
            return -999999999.0
        cov  = r["metrics"].get("coverage_within_150km_pct", 0) / 100
        cost = r["metrics"].get("total_cost_usd", 1e9)
        # normalised score: higher coverage wins, lower cost wins
        return cov - (cost / 1_000_000)

    scores = {"P1": _score(r_p1), "P2": _score(r_p2), "P3": _score(r_p3)}
    recommended = max(scores, key=scores.get)

    return {
        "status": "success",
        "data": {
            "P1": r_p1,
            "P2": r_p2,
            "P3": r_p3,
            "recommended": recommended,
            "params": {
                "p1_hubs": p1_hubs,
                "p3_hubs": p3_hubs,
                "p3_radius_km": p3_radius,
            },
        },
    }


# ─── NEW: 9-Scenario runner (engine_b framework + real PuLP solvers) ─────────

SCENARIO_CONFIGS = [
    {"id": "S0", "name": "Baseline",                  "type": "UFLP"},
    {"id": "S1", "name": "Cost Minimized",             "type": "UFLP"},
    {"id": "S2", "name": "Balanced P5",                "type": "P-median", "p": 5},
    {"id": "S3", "name": "Service P7",                 "type": "P-median", "p": 7},
    {"id": "S4", "name": "Capacity Constrained",       "type": "CFLP"},
    {"id": "S5", "name": "Peak Season Flex",           "type": "CFLP"},
    {"id": "S6", "name": "Max Coverage 50km",          "type": "MCLP",     "p": 5, "radius": 50},
    {"id": "S7", "name": "Max Coverage 100km",         "type": "MCLP",     "p": 5, "radius": 100},
    {"id": "S8", "name": "Hybrid Product Eligibility", "type": "Hybrid"},
]

@app.post("/api/optimize/all-scenarios")
async def optimize_all_scenarios():
    """
    Run all 9 scenarios (S0-S8) in parallel using real PuLP solvers.
    Scenario definitions from engine_b framework; solvers from models.py.
    """
    _require_data()
    demand    = DATA_STORE["demand"]
    hubs      = DATA_STORE["hubs"]
    distances = DATA_STORE["distances"]

    def _run_scenario(cfg):
        s_type = cfg["type"]
        if s_type in ("UFLP", "Baseline"):
            result = run_uflp(demand, hubs, distances)
        elif s_type == "P-median":
            result = run_p_median(demand, hubs, distances, cfg["p"])
        elif s_type == "CFLP":
            result = run_cflp(demand, hubs, distances)
        elif s_type == "Hybrid":
            # S8: product-eligibility filter — only metro/secure hubs for high-value products
            eligible_types = {"metro", "secure"}
            hubs_hybrid = hubs[hubs["hub_type"].isin(eligible_types)] if "hub_type" in hubs.columns else hubs
            if len(hubs_hybrid) == 0:
                hubs_hybrid = hubs
            dist_hybrid = distances[distances["hub_id"].isin(hubs_hybrid["hub_id"])] if "hub_id" in distances.columns else distances
            result = run_cflp(demand, hubs_hybrid, dist_hybrid)
        elif s_type == "MCLP":
            result = run_mclp(demand, hubs, distances, cfg["p"], cfg["radius"])
        else:
            result = run_uflp(demand, hubs, distances)
        result["scenario_id"] = cfg["id"]
        result["name"]        = cfg["name"]
        result["solver_type"] = s_type
        return cfg["id"], result

    results = {}
    errors  = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=9) as pool:
        futures = {pool.submit(_run_scenario, cfg): cfg for cfg in SCENARIO_CONFIGS}
        for future in concurrent.futures.as_completed(futures):
            cfg = futures[future]
            try:
                s_id, result = future.result(timeout=90)
                results[s_id] = result
            except Exception as e:
                errors[cfg["id"]] = str(e)

    def _score(r):
        if not r or r.get("status") != "Optimal" or "metrics" not in r:
            return -999999999.0
        cov  = r["metrics"].get("coverage_within_150km_pct", 0) / 100
        cost = r["metrics"].get("total_cost_usd", 1e9)
        return cov - (cost / 1_000_000)

    recommended = max(results, key=lambda k: _score(results[k])) if results else None
    ordered     = {s["id"]: results.get(s["id"]) for s in SCENARIO_CONFIGS}

    return {
        "status": "success",
        "data": {
            "scenarios":        ordered,
            "recommended":      recommended,
            "errors":           errors,
            "total_scenarios":  len(SCENARIO_CONFIGS),
            "completed":        len(results),
        },
    }


# ─── Existing single-optimizer endpoints ─────────────────────────────────────

@app.get("/api/network/baseline")
async def get_baseline():
    _require_data()
    try:
        result = run_baseline(DATA_STORE["demand"], DATA_STORE["hubs"], DATA_STORE["distances"])
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/network/hubs")
async def get_all_hubs():
    if DATA_STORE["hubs"] is None:
        raise HTTPException(status_code=400, detail="Please upload data first")
    try:
        df = DATA_STORE["hubs"]
        cols = [c for c in ['hub_id', 'lat', 'lon', 'company_name', 'storage_item'] if c in df.columns]
        hubs_list = df[cols].to_dict('records')
        return {"status": "success", "data": {"hubs": hubs_list}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/optimize/p-median")
async def optimize_p_median(p: int = Form(...), storage_type: str = Form(None)):
    _require_data()
    try:
        hubs_to_use = filter_hubs(DATA_STORE["hubs"], storage_type)
        result = run_p_median(DATA_STORE["demand"], hubs_to_use, DATA_STORE["distances"], p)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/optimize/cflp")
async def optimize_cflp(storage_type: str = Form(None)):
    _require_data()
    try:
        hubs_to_use = filter_hubs(DATA_STORE["hubs"], storage_type)
        result = run_cflp(DATA_STORE["demand"], hubs_to_use, DATA_STORE["distances"])
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/optimize/uflp")
async def optimize_uflp(storage_type: str = Form(None)):
    _require_data()
    try:
        hubs_to_use = filter_hubs(DATA_STORE["hubs"], storage_type)
        result = run_uflp(DATA_STORE["demand"], hubs_to_use, DATA_STORE["distances"])
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/optimize/mclp")
async def optimize_mclp(p: int = Form(...), radius: int = Form(...), storage_type: str = Form(None)):
    _require_data()
    try:
        hubs_to_use = filter_hubs(DATA_STORE["hubs"], storage_type)
        result = run_mclp(DATA_STORE["demand"], hubs_to_use, DATA_STORE["distances"], p, radius)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
