import pandas as pd
import numpy as np
import os

# Set seed for reproducibility
np.random.seed(42)

# 1. Define Korean Regions and their Coordinates/Stats
regions = {
    "Seoul": {"lat": 37.5665, "lon": 126.9780, "wh_count": 31, "demand_factor": 1.2},
    "Busan": {"lat": 35.1796, "lon": 129.0756, "wh_count": 99, "demand_factor": 0.8},
    "Daegu": {"lat": 35.8714, "lon": 128.6014, "wh_count": 23, "demand_factor": 0.5},
    "Incheon": {"lat": 37.4563, "lon": 126.7052, "wh_count": 194, "demand_factor": 0.7},
    "Gwangju": {"lat": 35.1595, "lon": 126.8526, "wh_count": 27, "demand_factor": 0.4},
    "Daejeon": {"lat": 36.3504, "lon": 127.3845, "wh_count": 11, "demand_factor": 0.4},
    "Ulsan": {"lat": 35.5384, "lon": 129.3114, "wh_count": 42, "demand_factor": 0.5},
    "Sejong": {"lat": 36.4800, "lon": 127.2890, "wh_count": 13, "demand_factor": 0.2},
    "Gyeonggi": {"lat": 37.4138, "lon": 127.5183, "wh_count": 915, "demand_factor": 1.5},
    "Gangwon": {"lat": 37.8228, "lon": 128.1555, "wh_count": 50, "demand_factor": 0.3},
    "Chungbuk": {"lat": 36.6357, "lon": 127.4913, "wh_count": 82, "demand_factor": 0.4},
    "Chungnam": {"lat": 36.5184, "lon": 126.8000, "wh_count": 61, "demand_factor": 0.6},
    "Jeonbuk": {"lat": 35.7175, "lon": 127.1530, "wh_count": 72, "demand_factor": 0.4},
    "Jeonnam": {"lat": 34.8679, "lon": 126.9910, "wh_count": 94, "demand_factor": 0.4},
    "Gyeongbuk": {"lat": 36.4919, "lon": 128.8889, "wh_count": 85, "demand_factor": 0.6},
    "Gyeongnam": {"lat": 35.2373, "lon": 128.6919, "wh_count": 105, "demand_factor": 0.7},
    "Jeju": {"lat": 33.4890, "lon": 126.4983, "wh_count": 20, "demand_factor": 0.1},
}

region_names = list(regions.keys())

# 2. Generate freight_od.csv (Nhu cầu hàng hóa)
# We generate O/D flows between all regions
od_data = []
for origin in region_names:
    for dest in region_names:
        if origin == dest:
            continue
        # Demand is proportional to origin demand factor and destination demand factor
        base_demand = regions[origin]["demand_factor"] * regions[dest]["demand_factor"] * 500
        tons = round(base_demand + np.random.normal(0, 100), 2)
        if tons < 0: tons = 10.0
        
        od_data.append({
            "year": 2022,
            "region_id": origin, # Using origin as region_id for our simple model
            "origin_region": origin,
            "destination_region": dest,
            "lat": regions[origin]["lat"],
            "lon": regions[origin]["lon"],
            "demand_tons": tons,
            "commodity_group": "General Freight"
        })

df_od = pd.DataFrame(od_data)
# Aggregate demand per region for the p-median model
df_demand_agg = df_od.groupby(['region_id', 'lat', 'lon']).agg({'demand_tons': 'sum'}).reset_index()
df_demand_agg.to_csv("freight_od.csv", index=False)
print("Generated freight_od.csv with", len(df_demand_agg), "regions")

# 3. Generate warehouse_registry.csv (Sổ đăng ký kho bãi)
wh_data = []
idx = 1
for reg_name, info in regions.items():
    count = info["wh_count"]
    for _ in range(count):
        # Jitter coordinates slightly within the region
        lat_jitter = np.random.normal(0, 0.15)
        lon_jitter = np.random.normal(0, 0.15)
        
        # Warehouse Area between 500 and 50000 m2
        area = round(np.random.lognormal(mean=8.5, sigma=1.2)) 
        if area < 500: area = 500
        
        # Fixed cost and capacity for CFLP
        fixed_cost = area * 1000 # 1,000 KRW per m2
        capacity = area * 0.5 # 0.5 tons per m2
        
        wh_data.append({
            "hub_id": f"WH_{idx:04d}",
            "company_name": f"LogiCorp {reg_name} {idx}",
            "sido": reg_name,
            "lat": info["lat"] + lat_jitter,
            "lon": info["lon"] + lon_jitter,
            "area_m2": area,
            "fixed_cost": fixed_cost,
            "capacity_tons": capacity,
            "storage_item": "Mixed Goods"
        })
        idx += 1

df_wh = pd.DataFrame(wh_data)
df_wh.to_csv("warehouse_registry.csv", index=False)
print("Generated warehouse_registry.csv with", len(df_wh), "warehouses")
