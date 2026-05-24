import pandas as pd
import numpy as np
import os

# Set seed for reproducibility
np.random.seed(42)

# 1. Update Warehouse Registry for FMCG
# We'll read the existing warehouse_registry.csv and add temperature_zone
warehouse_file = "warehouse_registry.csv"
if os.path.exists(warehouse_file):
    df_wh = pd.read_csv(warehouse_file)
    # Add temperature_zone: 30% Cold, 70% Ambient
    df_wh["temperature_zone"] = np.random.choice(["Ambient", "Cold_Chain"], size=len(df_wh), p=[0.7, 0.3])
    
    # Cold chain warehouses have 40% higher fixed cost and 20% lower capacity per m2
    cold_mask = df_wh["temperature_zone"] == "Cold_Chain"
    if "fixed_cost" in df_wh.columns:
        df_wh.loc[cold_mask, "fixed_cost"] = df_wh.loc[cold_mask, "fixed_cost"] * 1.4
    if "capacity_tons" in df_wh.columns:
        df_wh.loc[cold_mask, "capacity_tons"] = df_wh.loc[cold_mask, "capacity_tons"] * 0.8
        
    # Write it to a new file so we don't overwrite the original if not needed, or overwrite directly.
    # Let's overwrite the existing one to ensure all backend models use it.
    df_wh.to_csv("warehouse_registry.csv", index=False)
    print(f"Updated warehouse_registry.csv with FMCG constraints for {len(df_wh)} warehouses.")
else:
    print(f"Error: {warehouse_file} not found!")

# 2. Generate new freight_od.csv for FMCG
regions = {
    "Seoul": {"lat": 37.5665, "lon": 126.9780, "demand_factor": 1.5},
    "Busan": {"lat": 35.1796, "lon": 129.0756, "demand_factor": 1.0},
    "Daegu": {"lat": 35.8714, "lon": 128.6014, "demand_factor": 0.6},
    "Incheon": {"lat": 37.4563, "lon": 126.7052, "demand_factor": 0.9},
    "Gwangju": {"lat": 35.1595, "lon": 126.8526, "demand_factor": 0.5},
    "Daejeon": {"lat": 36.3504, "lon": 127.3845, "demand_factor": 0.5},
    "Ulsan": {"lat": 35.5384, "lon": 129.3114, "demand_factor": 0.6},
    "Sejong": {"lat": 36.4800, "lon": 127.2890, "demand_factor": 0.3},
    "Gyeonggi": {"lat": 37.4138, "lon": 127.5183, "demand_factor": 2.0},
    "Gangwon": {"lat": 37.8228, "lon": 128.1555, "demand_factor": 0.4},
    "Chungbuk": {"lat": 36.6357, "lon": 127.4913, "demand_factor": 0.5},
    "Chungnam": {"lat": 36.5184, "lon": 126.8000, "demand_factor": 0.7},
    "Jeonbuk": {"lat": 35.7175, "lon": 127.1530, "demand_factor": 0.5},
    "Jeonnam": {"lat": 34.8679, "lon": 126.9910, "demand_factor": 0.5},
    "Gyeongbuk": {"lat": 36.4919, "lon": 128.8889, "demand_factor": 0.7},
    "Gyeongnam": {"lat": 35.2373, "lon": 128.6919, "demand_factor": 0.8},
    "Jeju": {"lat": 33.4890, "lon": 126.4983, "demand_factor": 0.2},
}

fmcg_commodities = ["Fresh_Food", "FMCG_Packaged", "Pharmaceuticals", "Industrial_Materials", "Durables_Electronics", "Ecommerce_Misc"]

# Volume multipliers per category (tons)
_vol = {
    "Fresh_Food": 200,
    "FMCG_Packaged": 800,
    "Pharmaceuticals": 150,
    "Industrial_Materials": 1200,
    "Durables_Electronics": 300,
    "Ecommerce_Misc": 600,
}

region_names = list(regions.keys())
od_data = []

for origin in region_names:
    for dest in region_names:
        if origin == dest:
            continue

        for commodity in fmcg_commodities:
            base = regions[origin]["demand_factor"] * regions[dest]["demand_factor"]
            base_demand = base * _vol.get(commodity, 400)
                
            tons = round(base_demand + np.random.normal(0, 50), 2)
            if tons < 0: tons = 5.0
            
            od_data.append({
                "year": 2024,
                "region_id": origin,
                "origin_region": origin,
                "destination_region": dest,
                "lat": regions[origin]["lat"],
                "lon": regions[origin]["lon"],
                "demand_tons": tons,
                "commodity_group": commodity
            })

df_od = pd.DataFrame(od_data)
df_demand_agg = df_od.groupby(['region_id', 'lat', 'lon']).agg({'demand_tons': 'sum'}).reset_index()
df_demand_agg.to_csv("freight_od.csv", index=False)
print("Generated freight_od.csv (aggregated) for FMCG with", len(df_demand_agg), "regions")

df_od.to_csv("freight_od_detailed.csv", index=False)
print("Generated freight_od_detailed.csv with detailed FMCG commodities.")
