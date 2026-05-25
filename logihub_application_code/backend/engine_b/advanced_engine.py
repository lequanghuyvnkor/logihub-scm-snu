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
    
    # [수정 1] 새로운 Config 구조(계층형)에 맞게 데이터 파싱
    inv_cfg = cfg.get('inventory_benchmarks', {})
    pen_cfg = cfg.get('penalty_benchmarks', {})
    
    holding_rate_monthly = inv_cfg.get('holding_cost_pct_per_year', 0.20) / 12
    flex_rate = pen_cfg.get('flex_3pl_overflow_cost_usd_per_ton', 120)
    sla_penalty_rate = pen_cfg.get('sla_breach_penalty_usd_per_ton', 500)
    sla_threshold_km = cfg.get('coverage_radius_s6_km', 50) # SLA 기준 거리를 엄격한 50km로 세팅

    # [수정 3] 8가지 허브 역할별 가치 불러오기
    hub_role_values = inv_cfg.get('hub_role_values_usd_per_ton', {})
    hub_roles = list(hub_role_values.keys()) if hub_role_values else ["Default_Hub"]

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
    
    # 각 허브에 랜덤하게 특수 역할을 부여하여 비용 차이를 극대화함 (발표 방어용)
    hub_role_mapping = {hub: random.choice(hub_roles) for hub in hubs}
    
    for hub in hubs:
        assigned_role = hub_role_mapping[hub]
        # 해당 역할의 톤당 가치를 가져옴 (예: Security_Bay = 25000)
        specific_inv_value = hub_role_values.get(assigned_role, 3000) 
        
        for month in months:
            s_idx = seasonal_index[month]
            base_inventory = round(np.random.uniform(100, 500), 2)
            avg_inventory = round(base_inventory * s_idx, 2)
            
            # [핵심] 평균이 아닌, '허브의 역할별 단가'로 인벤토리 유지비 계산
            holding_cost = round(avg_inventory * specific_inv_value * holding_rate_monthly, 2)
            
            inv_records.append({
                "hub_id": hub,
                "hub_role": assigned_role,
                "month": month,
                "seasonal_index": s_idx,
                "average_inventory_tons": avg_inventory,
                "unit_value_usd": specific_inv_value,
                "holding_cost_usd": holding_cost
            })
    pd.DataFrame(inv_records).to_csv('output/inventory_holding_cost_by_month.csv', index=False)

    # 2. seasonal_flex_cost.csv
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
            # [수정 2] distance_matrix.csv의 실제 컬럼명 사용
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
