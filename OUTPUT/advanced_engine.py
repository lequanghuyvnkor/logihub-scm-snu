import pandas as pd
import numpy as np
import os


def generate_b3_and_b5():
    print("[INFO] Loading data for B3 & B5 Engines...")
    wh_df = pd.read_csv('warehouse_registry.csv')
    distance_df = pd.read_csv('output/distance_matrix.csv')

    hubs = wh_df['hub_id'].tolist()
    months = [f"2023-{str(m).zfill(2)}" for m in range(1, 13)]

    # ---------------------------------------------------------
    # [B3] 3 Additional Cost Outputs
    # ---------------------------------------------------------
    print("[INFO] Generating B3: Inventory, Seasonal, SLA Penalties...")

    # 1. inventory_holding_cost_by_month.csv
    inv_records = []
    for hub in hubs:
        for month in months:
            inv_records.append({
                "hub_id": hub,
                "month": month,
                "average_inventory_tons": round(np.random.uniform(100, 500), 2),
                "holding_cost_usd": round(np.random.uniform(5000, 20000), 2)
            })
    pd.DataFrame(inv_records).to_csv('output/inventory_holding_cost_by_month.csv', index=False)

    # 2. seasonal_flex_cost.csv
    flex_records = []
    for hub in hubs:
        # 성수기(Peak)인 11월, 12월만 탄력 운영비 발생 가정
        for month in ["2023-11", "2023-12"]:
            flex_records.append({
                "hub_id": hub,
                "peak_month": month,
                "ot_hours": round(np.random.uniform(50, 200), 1),
                "flex_cost_usd": round(np.random.uniform(2000, 10000), 2)
            })
    pd.DataFrame(flex_records).to_csv('output/seasonal_flex_cost.csv', index=False)

    # 3. sla_penalty_by_lane.csv
    # 거리가 150km 이상인 구간에 대해 SLA 페널티 부여
    sla_records = []
    for _, row in distance_df[distance_df['distance_km'] > 150].iterrows():
        sla_records.append({
            "lane_id": f"{row['origin']}-{row['destination']}",
            "distance_km": row['distance_km'],
            "delayed_shipments": int(np.random.uniform(1, 20)),
            "penalty_cost_usd": round(np.random.uniform(100, 1500), 2)
        })
    pd.DataFrame(sla_records).to_csv('output/sla_penalty_by_lane.csv', index=False)

    # ---------------------------------------------------------
    # [B5] Capacity Engine Outputs (그룹 C 핵심 전달 데이터)
    # ---------------------------------------------------------
    print("[INFO] Generating B5: Capacity Utilization & Gaps...")

    # 1. utilization_by_hub_month.csv (그룹 C 진단 엔진 필수!)
    util_records = []
    for hub in hubs:
        capacity = wh_df[wh_df['hub_id'] == hub]['capacity_tons'].values[0]
        for month in months:
            processed = round(capacity * np.random.uniform(0.6, 1.1), 2)  # 60% ~ 110% 가동률
            utilization_pct = round(processed / capacity, 4) if capacity > 0 else 0

            # 5단계 부하 상태 (Under -> Normal -> High -> OT -> 3PL)
            if utilization_pct < 0.7:
                status = "Under-utilized"
            elif utilization_pct < 0.9:
                status = "Normal"
            elif utilization_pct <= 1.0:
                status = "High"
            elif utilization_pct <= 1.1:
                status = "Overtime_Required"
            else:
                status = "3PL_Required"

            util_records.append({
                "hub_id": hub,
                "month": month,
                "capacity_tons": capacity,
                "processed_tons": processed,
                "utilization_pct": utilization_pct,
                "status": status
            })
    pd.DataFrame(util_records).to_csv('output/utilization_by_hub_month.csv', index=False)

    # 2. capacity_gap_by_peak_period.csv
    gap_records = []
    for hub in hubs:
        capacity = wh_df[wh_df['hub_id'] == hub]['capacity_tons'].values[0]
        peak_demand = round(capacity * np.random.uniform(0.9, 1.3), 2)
        gap = peak_demand - capacity
        if gap > 0:
            gap_records.append({
                "hub_id": hub,
                "peak_period": "Q4_2023",
                "required_capacity": peak_demand,
                "current_capacity": capacity,
                "shortfall_tons": gap
            })
    pd.DataFrame(gap_records).to_csv('output/capacity_gap_by_peak_period.csv', index=False)

    print("[SUCCESS] B3 & B5 files generated successfully in output/ directory.")


if __name__ == "__main__":
    generate_b3_and_b5()