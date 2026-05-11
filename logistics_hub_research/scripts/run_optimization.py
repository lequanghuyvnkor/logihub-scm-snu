import pandas as pd
import numpy as np
from pulp import *
from geopy.distance import geodesic
import os

base_dir = r"C:\Users\PC\.gemini\antigravity\scratch\korea_logistics_hub_project"

# Approximate coordinates for 17 regions
coords = {
    '서울특별시': (37.5665, 126.9780),
    '부산광역시': (35.1796, 129.0756),
    '대구광역시': (35.8714, 128.6014),
    '인천광역시': (37.4563, 126.7052),
    '광주광역시': (35.1595, 126.8526),
    '대전광역시': (36.3504, 127.3845),
    '울산광역시': (35.5384, 129.3114),
    '세종특별자치시': (36.4800, 127.2890),
    '경기도': (37.2636, 127.0286),
    '강원도': (37.8853, 127.7298),
    '충청북도': (36.6356, 127.4913),
    '충청남도': (36.6588, 126.6728),
    '전라북도': (35.8242, 127.1480),
    '전라남도': (34.8161, 126.4629),
    '경상북도': (36.5760, 128.5056),
    '경상남도': (35.2383, 128.6922),
    '제주특별자치도': (33.4890, 126.4983)
}

def load_data():
    demand_df = pd.read_csv(os.path.join(base_dir, "data_processed", "demand_17_regions_2023.csv"))
    cap_df = pd.read_csv(os.path.join(base_dir, "data_processed", "warehouse_capacity_17_regions.csv"))
    
    # Merge
    df = pd.merge(demand_df, cap_df, on='region_name', how='left')
    df['total_area_m2'] = df['total_area_m2'].fillna(0)
    
    # Add coordinates
    df['lat'] = df['region_name'].map(lambda x: coords.get(x, (0,0))[0])
    df['lon'] = df['region_name'].map(lambda x: coords.get(x, (0,0))[1])
    
    return df

def calculate_distance_matrix(df):
    regions = df['region_name'].tolist()
    dist_matrix = {}
    for r1 in regions:
        dist_matrix[r1] = {}
        lat1, lon1 = df[df['region_name'] == r1][['lat', 'lon']].values[0]
        for r2 in regions:
            lat2, lon2 = df[df['region_name'] == r2][['lat', 'lon']].values[0]
            # distance in km
            dist_matrix[r1][r2] = geodesic((lat1, lon1), (lat2, lon2)).km
    return dist_matrix

def run_p_median(df, dist_matrix, p_hubs=3):
    print(f"\n--- Running P-Median Model (P={p_hubs}) ---")
    regions = df['region_name'].tolist()
    demand = dict(zip(df['region_name'], df['total_volume']))
    
    prob = LpProblem("P_Median", LpMinimize)
    
    # Variables
    y = LpVariable.dicts("Hub", regions, cat='Binary')
    x = LpVariable.dicts("Assign", (regions, regions), cat='Binary')
    
    # Objective
    prob += lpSum(demand[i] * dist_matrix[i][j] * x[i][j] for i in regions for j in regions)
    
    # Constraints
    prob += lpSum(y[j] for j in regions) == p_hubs
    
    for i in regions:
        prob += lpSum(x[i][j] for j in regions) == 1
        for j in regions:
            prob += x[i][j] <= y[j]
            
    prob.solve(PULP_CBC_CMD(msg=0))
    
    print("Status:", LpStatus[prob.status])
    print("Objective (Ton-km):", value(prob.objective))
    
    selected_hubs = [j for j in regions if y[j].varValue > 0.5]
    print("Selected Hubs:", selected_hubs)
    
    assignments = []
    for i in regions:
        for j in selected_hubs:
            if x[i][j].varValue > 0.5:
                assignments.append({'Demand_Region': i, 'Hub': j, 'Demand': demand[i], 'Distance': dist_matrix[i][j]})
                
    res_df = pd.DataFrame(assignments)
    res_df.to_csv(os.path.join(base_dir, "outputs", "optimization", f"p_median_p{p_hubs}_results.csv"), index=False, encoding='utf-8-sig')

def run_cflp(df, dist_matrix):
    print(f"\n--- Running CFLP Model ---")
    regions = df['region_name'].tolist()
    demand = dict(zip(df['region_name'], df['total_volume']))
    
    # Assume 1 m2 of warehouse can process 100 tons of freight per year to make it feasible
    capacity = dict(zip(df['region_name'], df['total_area_m2'] * 100))
    
    # Fixed cost of opening a hub: Assume $1M per hub as a relative scalar
    fixed_cost = 5000000000  # Large enough to limit the number of hubs
    
    # Transport cost: $1 per ton-km
    trans_cost = 1
    
    prob = LpProblem("CFLP", LpMinimize)
    
    y = LpVariable.dicts("Hub", regions, cat='Binary')
    x = LpVariable.dicts("Flow", (regions, regions), lowBound=0, cat='Continuous')
    
    # Objective: Fixed Costs + Transport Costs
    prob += lpSum(fixed_cost * y[j] for j in regions) + lpSum(trans_cost * dist_matrix[i][j] * x[i][j] for i in regions for j in regions)
    
    # Constraints
    # 1. Satisfy demand
    for i in regions:
        prob += lpSum(x[i][j] for j in regions) == demand[i]
        
    # 2. Capacity constraint
    for j in regions:
        prob += lpSum(x[i][j] for i in regions) <= capacity[j] * y[j]
        
    prob.solve(PULP_CBC_CMD(msg=0))
    
    print("Status:", LpStatus[prob.status])
    print("Total Cost:", value(prob.objective))
    
    selected_hubs = [j for j in regions if y[j].varValue > 0.5]
    print("Selected Hubs:", selected_hubs)
    
    assignments = []
    for i in regions:
        for j in selected_hubs:
            if x[i][j].varValue > 0.1:
                assignments.append({'Demand_Region': i, 'Hub': j, 'Flow': x[i][j].varValue, 'Distance': dist_matrix[i][j]})
                
    res_df = pd.DataFrame(assignments)
    res_df.to_csv(os.path.join(base_dir, "outputs", "optimization", "cflp_results.csv"), index=False, encoding='utf-8-sig')


def run_cflp_demand_shock(df, dist_matrix):
    print(f"\n--- Running CFLP Model (Demand Shock +20%) ---")
    regions = df['region_name'].tolist()
    # Increase demand by 20%
    demand = dict(zip(df['region_name'], df['total_volume'] * 1.2))
    capacity = dict(zip(df['region_name'], df['total_area_m2'] * 100))
    fixed_cost = 5000000000
    trans_cost = 1
    
    prob = LpProblem("CFLP_Shock", LpMinimize)
    y = LpVariable.dicts("Hub", regions, cat='Binary')
    x = LpVariable.dicts("Flow", (regions, regions), lowBound=0, cat='Continuous')
    
    prob += lpSum(fixed_cost * y[j] for j in regions) + lpSum(trans_cost * dist_matrix[i][j] * x[i][j] for i in regions for j in regions)
    
    for i in regions:
        prob += lpSum(x[i][j] for j in regions) == demand[i]
    for j in regions:
        prob += lpSum(x[i][j] for i in regions) <= capacity[j] * y[j]
        
    prob.solve(PULP_CBC_CMD(msg=0))
    print("Status:", LpStatus[prob.status])
    if prob.status == 1:
        print("Total Cost:", value(prob.objective))
        selected_hubs = [j for j in regions if y[j].varValue > 0.5]
        print("Selected Hubs (Shock):", selected_hubs)

if __name__ == "__main__":
    df = load_data()
    dist_matrix = calculate_distance_matrix(df)
    
    run_p_median(df, dist_matrix, p_hubs=3)
    run_p_median(df, dist_matrix, p_hubs=5)
    run_p_median(df, dist_matrix, p_hubs=7)
    run_cflp(df, dist_matrix)
    run_cflp_demand_shock(df, dist_matrix)
    print("\nOptimization complete.")
