import pandas as pd
import numpy as np
import os
import json
import random

def _load_config():
    cfg_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json')
    with open(cfg_path, encoding='utf-8-sig') as f:
        return json.load(f)

def generate_b3_and_b5():
    cfg = _load_config()
    
    # [핵심 수정 1] 12개로 세분화된 'product_benchmarks'를 직접 불러옵니다.
    product_benchmarks = cfg.get('product_benchmarks', {})
    
    # [핵심 수정 2] 나머지 설정값 파싱
    holding_rate_monthly = cfg.get('inventory_benchmarks', {}).get('holding_cost_pct_per_year', 0.20) / 12
    flex_rate = cfg.get('penalty_benchmarks', {}).get('flex_3pl_overflow_cost_usd_per_ton', 120)
    sla_penalty_rate = cfg.get('penalty_benchmarks', {}).get('sla_breach_penalty_usd_per_ton', 500)
    sla_threshold_km = cfg.get('coverage_radius_s6_km', 50)

    print("[INFO] Loading data for B3 & B5 Engines...")
    wh_df = pd.read_csv('warehouse_registry.csv')
    distance_df = pd.read_csv('output/distance_matrix.csv')

    hubs = wh_df['hub_id'].tolist()
    months = [f"2023-{str(m).zfill(2)}" for m in range(1, 13)]

    # Seasonal index proxy: peaks in Q4 (Oct–Dec)
    seasonal_index = {
        '2023-01': 0.82, '2023-02': 0.78, '2023-03': 0.88,
        '2023-04': 0.91, '2023-05': 0.94, '2023-06': 0.97,
        '2023-07': 1.00, '2023-08': 1.05, '2023-09': 1.08,
        '2023-10': 1.20, '2023-11': 1.38, '2023-12': 1.49,
    }

    # ---------------------------------------------------------
    # [B3] 3 Additional Cost Outputs
    # ---------------------------------------------------------
    print("[INFO] Generating B3: Inventory, Seasonal, SLA Penalties...")

    # 1. inventory_holding_cost_by_month.csv
    inv_records = []
    
    # [핵심 수정 3] 창고 유형이 아니라, 우리가 만든 12개 '세부 품목' 리스트를 가져옵니다.
    product_categories = list(product_benchmarks.keys())
    
    # 각 허브가 주로 취급하는 12개 카테고리 중 하나를 랜덤 배정
    hub_product_mapping = {hub: random.choice(product_categories) for hub in hubs}
    
    for hub in hubs:
        assigned_prod = hub_product_mapping[hub]
        # 해당 품목의 정확한 톤당 가치(inventory_value_usd_per_ton)를 가져옵니다.
        prod_value = product_benchmarks[assigned_prod]['inventory_value_usd_per_ton']
        
        for month in months:
            s_idx = seasonal_index[month]
            base_inventory = round(np.random.uniform(100, 500), 2)
            avg_inventory = round(base_inventory * s_idx, 2)
            
            # [핵심] 세분화된 품목 가치를 직접 반영한 holding cost 연산
            holding_cost = round(avg_inventory * prod_value * holding_rate_monthly, 2)
            
            inv_records.append({
                "hub_id": hub,
                "assigned_product_class": assigned_prod, # 무슨 품목을 취급하는지 기록
                "month": month,
                "seasonal_index": s_idx,
                "average_inventory_tons": avg_inventory,
                "unit_value_usd": prod_value,            # 품목의 단가 기록
                "holding_cost_usd": holding_cost
            })
    pd.DataFrame(inv_records).to_csv('output/inventory_holding_cost_by_month.csv', index=False)

    # 2. seasonal_flex_cost.csv (이하 원본 로직과 동일하게 유지)
    flex_records = []
    for hub in hubs:
        monthly_demand = {
            m: round(np.random.uniform(300, 1800) * seasonal_index[m], 1)
            for m in months
        }
        month_list = list(months)
        for i in range(1, len(month_list)):
            cur_month = month_list[i]
            prev_month = month_list[i - 1]
            demand_delta = abs(monthly_demand[cur_month] - monthly_demand[prev_month])
            flex_cost = round(demand_delta * flex_rate, 2)
            flex_records.append({
                "hub_id": hub,
                "month": cur_month,
                "prev_month": prev_month,
                "demand_tons_cur": monthly_demand[cur_month],
                "demand_tons_prev": monthly_demand[prev_month],
                "demand_delta_tons": round(demand_delta, 2),
                "flex_cost_usd": flex_cost
            })
    pd.DataFrame(flex_records).to_csv('output/seasonal_flex_cost.csv', index=False)

    # 3. sla_penalty_by_lane.csv
    sla_records = []
    for _, row in distance_df[distance_df['distance_km'] > sla_threshold_km].iterrows():
        delayed = int(np.random.uniform(1, 20))
        sla_records.append({
            "lane_id": f"{row['origin_region_id']}-{row['destination_hub_id']}",
            "distance_km": row['distance_km'],
            "delayed_shipments": delayed,
            "penalty_cost_usd": round(delayed * sla_penalty_rate, 2)
        })
    pd.DataFrame(sla_records).to_csv('output/sla_penalty_by_lane.csv', index=False)

    # ---------------------------------------------------------
    # [B5] Capacity Engine Outputs
    # ---------------------------------------------------------
    print("[INFO] Generating B5: Capacity Utilization & Gaps...")

    # 1. utilization_by_hub_month.csv
    util_records = []
    for hub in hubs:
        capacity = wh_df[wh_df['hub_id'] == hub]['capacity_tons'].values[0]
        for month in months:
            s_idx = seasonal_index[month]
            processed = round(capacity * np.random.uniform(0.6, 1.0) * s_idx, 2)
            utilization_pct = round(processed / capacity, 4) if capacity > 0 else 0

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
                "seasonal_index": s_idx,
                "capacity_tons": capacity,
                "processed_tons": processed,
                "utilization_pct": utilization_pct,
                "status": status
            })
    pd.DataFrame(util_records).to_csv('output/utilization_by_hub_month.csv', index=False)

    # 2. capacity_gap_by_peak_period.csv
    peak_multiplier = cfg.get('seasonal_peak_multiplier', 1.4)
    gap_records = []
    for hub in hubs:
        capacity = wh_df[wh_df['hub_id'] == hub]['capacity_tons'].values[0]
        peak_demand = round(capacity * np.random.uniform(0.9, peak_multiplier), 2)
        gap = peak_demand - capacity
        if gap > 0:
            gap_records.append({
                "hub_id": hub,
                "peak_period": "Q4_2023",
                "required_capacity": peak_demand,
                "current_capacity": capacity,
                "shortfall_tons": round(gap, 2)
            })
    pd.DataFrame(gap_records).to_csv('output/capacity_gap_by_peak_period.csv', index=False)

    print("[SUCCESS] B3 & B5 files generated successfully in output/ directory.")

if __name__ == "__main__":
    generate_b3_and_b5()
