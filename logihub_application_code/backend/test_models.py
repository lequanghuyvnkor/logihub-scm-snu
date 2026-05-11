import pandas as pd
from models import run_p_median, run_cflp
from utils import compute_distance_matrix
import time

def test_engine():
    print("Loading data...")
    df_demand = pd.read_csv("../freight_od.csv")
    df_hubs = pd.read_csv("../warehouse_registry.csv")
    
    print(f"Demand: {len(df_demand)}, Hubs: {len(df_hubs)}")
    
    print("Computing distance matrix...")
    t0 = time.time()
    df_dist = compute_distance_matrix(df_demand, df_hubs)
    print(f"Distance matrix computed in {time.time()-t0:.2f}s")
    
    print("Running P-Median P=5...")
    t0 = time.time()
    res = run_p_median(df_demand, df_hubs, df_dist, 5)
    print(f"P-Median status: {res.get('status', 'Error')}, Time: {time.time()-t0:.2f}s")
    
    print("Running CFLP...")
    t0 = time.time()
    # ensure total capacity > total demand
    tot_cap = df_hubs['capacity_tons'].sum()
    tot_dem = df_demand['demand_tons'].sum()
    print(f"Total capacity: {tot_cap:,.0f}, Total Demand: {tot_dem:,.0f}")
    
    res_cflp = run_cflp(df_demand, df_hubs, df_dist)
    print(f"CFLP status: {res_cflp.get('status', 'Error')}, Time: {time.time()-t0:.2f}s")
    if res_cflp.get('status') == 'Optimal':
        print(f"CFLP Selected {len(res_cflp['opened_hubs'])} hubs.")

if __name__ == "__main__":
    test_engine()
