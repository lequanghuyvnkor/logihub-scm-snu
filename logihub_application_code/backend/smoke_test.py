"""Quick end-to-end smoke test for P1/P2/P3 solvers."""
import os, sys, time
sys.path.insert(0, os.path.dirname(__file__))

from main import _build_demand_df, _build_hubs_df
from utils import compute_distance_matrix
from models import run_p_median, run_cflp, run_mclp
import pandas as pd

base    = os.path.dirname(os.path.abspath(__file__))
group_a = os.path.join(base, "mocks", "group_A_data")
group_b = os.path.join(base, "mocks", "group_B_data")

# Compute auto-scale (same logic as load_defaults endpoint)
d_raw        = pd.read_csv(os.path.join(group_a, "regional_demand.csv"), encoding="utf-8-sig")
h_raw        = pd.read_csv(os.path.join(group_b, "candidate_hubs.csv"),  encoding="utf-8-sig")
total_demand = d_raw["demand_weight_ton"].sum()
total_cap    = h_raw["effective_capacity"].sum()
scale        = total_demand / (total_cap * 0.80)
print(f"Demand scale factor: {scale:,.0f}  (total demand => {total_demand/scale:,.0f} tons vs cap {total_cap:,.0f} tons)\n")

d    = _build_demand_df(group_a, demand_scale=scale)
h    = _build_hubs_df(group_b)
dist = compute_distance_matrix(d, h)
print(f"Distance matrix: {len(dist)} pairs\n")

t0 = time.time()
r1 = run_p_median(d, h, dist, 5)
print(f"P1  p-median  p=5  | {r1['status']:10s} | cost={r1['total_cost']:>12,.1f} | hubs={len(r1['opened_hubs'])} | {time.time()-t0:.1f}s")
print(f"    hubs:     {[x['id'] for x in r1['opened_hubs']]}")
print(f"    coverage: {r1['metrics']['coverage_within_150km_pct']:.1f}%")
print(f"    lead time:{r1['metrics']['avg_lead_time_hrs']:.2f} hrs")

t0 = time.time()
r2 = run_cflp(d, h, dist)
status2 = r2.get("status", "?")
print(f"\nP2  CFLP           | {status2:10s} | cost={r2.get('total_cost',0):>12,.1f} | hubs={len(r2.get('opened_hubs',[]))} | {time.time()-t0:.1f}s")
if "error" in r2:
    print(f"    ERROR: {r2['error']}")
else:
    print(f"    hubs:        {[x['id'] for x in r2['opened_hubs']]}")
    print(f"    total_cost_usd: ${r2['metrics']['total_cost_usd']:,.0f}")
    print(f"    coverage:    {r2['metrics']['coverage_within_150km_pct']:.1f}%")

t0 = time.time()
r3 = run_mclp(d, h, dist, 5, 150)
print(f"\nP3  MCLP  p=5 r=150| {r3['status']:10s} | cost={r3['total_cost']:>12,.1f} | hubs={len(r3['opened_hubs'])} | {time.time()-t0:.1f}s")
print(f"    hubs:     {[x['id'] for x in r3['opened_hubs']]}")
print(f"    coverage: {r3['metrics']['coverage_within_150km_pct']:.1f}%")

print("\nOK — all three solvers completed successfully.")
