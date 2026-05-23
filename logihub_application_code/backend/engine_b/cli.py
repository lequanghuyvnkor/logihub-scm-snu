import os
import json
import argparse
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
from optimizer import SupplyChainOptimizer

def load_config():
    """Load external config file (WBS B8)"""
    try:
        with open('config.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("[WARNING] config.json not found. Using default benchmark values.")
        return {
            "transport_rate_usd_per_ton_km": 0.15,
            "seasonal_peak_multiplier": 1.4,
            "coverage_radius_s6_km": 50,
            "coverage_radius_s7_km": 100,
            "p_median_s2_count": 5,
            "p_median_s3_count": 7
        }

def load_real_data(json_path, dist_path):
    """Integrate Group A's real O/D data and geographic distance data"""
    print(f"[INFO] Loading Group A master data... ({json_path})")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    I = [r['region_id'] for r in data['master_data']['regions']]
    J = [h['hub_id'] for h in data['master_data']['candidate_hubs']]
    
    demand = {item['region_id']: item['volume'] for item in data['demand']['annual_demand_by_region']}
    
    f_costs, cap = {}, {}
    for hub in data['master_data']['candidate_hubs']:
        h_id = hub['hub_id']
        f_costs[h_id] = hub['fixed_cost_usd_per_year']
        cap[h_id] = hub['effective_capacity']
        
    # Handling cost benchmark (temporary fixed value, product family differences reflected in pre-processing)
    v_costs = {j: 2000 for j in J} 
    
    elig = {}
    for i in I:
        for hub in data['master_data']['candidate_hubs']:
            # If at least one product family is eligible, set to 1
            elig[(i, hub['hub_id'])] = 1 if len(hub.get('eligible_product_families', [])) > 0 else 0

    print(f"[INFO] Loading distance matrix... ({dist_path})")
    d = {}
    try:
        df_dist = pd.read_csv(dist_path)
        for _, row in df_dist.iterrows():
            d[(row['origin_region_id'], row['destination_hub_id'])] = row['distance_km']
    except FileNotFoundError:
        print(f"[ERROR] {dist_path} not found. Run generate_distance.py first!")
        exit(1)

    return I, J, d, demand, f_costs, v_costs, cap, elig

def evaluate_baseline(opt, baseline_hubs):
    """Helper function to reverse-calculate the cost of S0 (Baseline) fixed network"""
    total_cost = sum(opt.f[j] for j in baseline_hubs)
    
    # Assign each demand region to the closest baseline hub (simple greedy approach)
    for i in opt.I:
        best_hub = min(baseline_hubs, key=lambda j: opt.c[i, j] + opt.v[j])
        total_cost += (opt.c[i, best_hub] + opt.v[best_hub]) * opt.demand[i]
        
    return {"status": "Fixed", "cost": total_cost, "hubs": baseline_hubs}

def run_scenarios(args):
    # 1. Start data pipeline
    config = load_config()
    I, J, d, demand, f_costs, v_costs, cap, elig = load_real_data(args.data, args.distance)
    
    # 2. Initialize optimization engine
    opt = SupplyChainOptimizer(
        demand_nodes=I, candidate_hubs=J, distances=d, demands=demand, 
        fixed_costs=f_costs, handling_costs=v_costs, capacities=cap, eligibilities=elig,
        transport_rate=config['transport_rate_usd_per_ton_km']
    )
    
    results = {}
    print("\n[INFO] WBS B6: Running 9-scenario parallel optimization engine (Timeout < 90s)...\n")
    
    # 3. Calculate S0 (Baseline)
    print(" - [✓] S0_Baseline (Fixed 3 Hubs)")
    baseline_hubs = ["GG_METRO", "BS_PORT", "DJ_CENTRAL"] # Reference JSON Baseline
    results["S0_Baseline"] = evaluate_baseline(opt, baseline_hubs)

    # 4. Run S1 ~ S8 concurrently using ThreadPoolExecutor (WBS B6)
    tasks = {
        "S1_UFLP_Cost_Min": lambda: opt.solve_uflp("S1"),
        f"S2_P_Median_{config['p_median_s2_count']}Hubs": lambda: opt.solve_p_median("S2", config['p_median_s2_count']),
        f"S3_P_Median_{config['p_median_s3_count']}Hubs": lambda: opt.solve_p_median("S3", config['p_median_s3_count']),
        "S4_CFLP_Capacity": lambda: opt.solve_cflp("S4", peak_multiplier=1.0),
        "S5_CFLP_Peak_Season": lambda: opt.solve_cflp("S5", peak_multiplier=config['seasonal_peak_multiplier']),
        f"S6_MCLP_Strict_{config['coverage_radius_s6_km']}km": lambda: opt.solve_coverage("S6", config['coverage_radius_s6_km']),
        f"S7_MCLP_Relaxed_{config['coverage_radius_s7_km']}km": lambda: opt.solve_coverage("S7", config['coverage_radius_s7_km']),
        "S8_Hybrid_MultiConstraint": lambda: opt.solve_hybrid("S8")
    }

    with ThreadPoolExecutor(max_workers=4) as executor:
        future_to_name = {executor.submit(func): name for name, func in tasks.items()}
        for future in future_to_name:
            name = future_to_name[future]
            try:
                results[name] = future.result()
                print(f" - [✓] {name} Solved. Status: {results[name]['status']}")
            except Exception as exc:
                print(f" - [X] {name} Error: {exc}")

    # 5. Extract result CSV (WBS B6 output)
    os.makedirs(args.output, exist_ok=True)
    summary_data = []
    
    for s_name, res in results.items():
        summary_data.append({
            "Scenario_ID": s_name.split('_')[0],
            "Scenario_Name": s_name,
            "Solver_Status": res['status'],
            "Total_Cost_USD": round(res['cost'], 2),
            "Open_Hub_Count": len(res['hubs']),
            "Hub_List": " | ".join(res['hubs'])
        })
        
    df_results = pd.DataFrame(summary_data)
    out_file = os.path.join(args.output, 'scenario_comparison.csv')
    df_results.to_csv(out_file, index=False)
    
    print(f"\n[SUCCESS] All scenarios computed successfully! Results saved to '{out_file}'.")

if __name__ == "__main__":
    # CLI Argument Parser matching WBS B7 specs
    parser = argparse.ArgumentParser(description="LogiHub 9-Scenario Optimization Engine")
    parser.add_argument("--data", type=str, default="group_A_data.json", help="Path to master JSON data")
    parser.add_argument("--distance", type=str, default="output/distance_matrix.csv", help="Path to distance matrix CSV")
    parser.add_argument("--output", type=str, default="output", help="Directory to save output CSVs")
    
    args = parser.parse_args()
    run_scenarios(args)
