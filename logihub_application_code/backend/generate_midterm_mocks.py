import os
import json
import pandas as pd
import numpy as np
import uuid
import datetime

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    mocks_dir = os.path.join(base_dir, "mocks")
    group_a_dir = os.path.join(mocks_dir, "group_A_data")
    group_b_dir = os.path.join(mocks_dir, "group_B_data")
    group_c_dir = os.path.join(mocks_dir, "group_C_data")
    
    os.makedirs(group_a_dir, exist_ok=True)
    os.makedirs(group_b_dir, exist_ok=True)
    os.makedirs(group_c_dir, exist_ok=True)
    
    np.random.seed(42)
    regions = ["Seoul", "Busan", "Daegu", "Incheon", "Gwangju", "Daejeon", "Ulsan", "Sejong", "Gyeonggi", "Gangwon", "Chungbuk", "Chungnam", "Jeonbuk", "Jeonnam", "Gyeongbuk", "Gyeongnam", "Jeju"]
    product_families = ["mobile_launch", "bulky_appliance", "finished_goods", "secure_node", "spare_parts", "ecommerce_small", "general_cargo"]
    months = [f"2023-{str(i).zfill(2)}" for i in range(1, 13)]
    hubs = ["GG_METRO", "BS_PORT", "DJ_CENTRAL", "IC_AIRPORT", "GW_BULKY", "SJ_SECURE"]
    scenarios_list = [f"S{i}" for i in range(9)]
    
    # ------------------ GROUP A: DEMAND ------------------
    print("Generating Group A (Demand) Mocks...")
    regional_demand = [{"region_id": r, "region_name": r, "volume": round(np.random.uniform(500, 5000), 2), "unit": "ton", "share_pct": 0.0} for r in regions]
    total_vol = sum(d["volume"] for d in regional_demand)
    for d in regional_demand: d["share_pct"] = round((d["volume"] / total_vol) * 100, 2)
    pd.DataFrame(regional_demand).to_csv(os.path.join(group_a_dir, "regional_demand.csv"), index=False)
    
    monthly_demand = [{"region_id": r, "region_name": r, "month": m, "volume": round(np.random.uniform(50, 500), 2), "unit": "ton"} for r in regions for m in months]
    pd.DataFrame(monthly_demand).to_csv(os.path.join(group_a_dir, "monthly_demand_by_region.csv"), index=False)
    
    monthly_demand_prod = [{"region_id": r, "region_name": r, "product_family": np.random.choice(product_families), "month": m, "volume": round(np.random.uniform(10, 100), 2), "unit": "ton", "seasonal_index": round(np.random.uniform(0.8, 1.5), 2)} for r in regions for m in months]
    pd.DataFrame(monthly_demand_prod).to_csv(os.path.join(group_a_dir, "monthly_demand_by_region_product.csv"), index=False)
    
    top_lanes = [{"origin_region": r1, "destination_region": r2, "product_family": "finished_goods", "volume": round(np.random.uniform(500, 2000), 2), "unit": "ton", "share_pct": round(np.random.uniform(1, 10), 2)} for r1, r2 in zip(regions[:5], regions[5:10])]
    pd.DataFrame(top_lanes).to_csv(os.path.join(group_a_dir, "top_od_lanes.csv"), index=False)

    od_matrix = [{"origin": r1, "destination": r2, "flow_tons": round(np.random.uniform(50, 1000), 2)} for r1 in regions for r2 in regions if r1 != r2]
    pd.DataFrame(od_matrix).to_csv(os.path.join(group_a_dir, "od_matrix_17_region.csv"), index=False)

    # ------------------ GROUP B: COSTS & OPTIMIZATION ------------------
    print("Generating Group B (Cost & Optimization) Mocks...")
    transport_cost = [{"lane_id": f"{r1}-{r2}", "origin": r1, "destination": r2, "cost_per_ton_km": 0.15, "distance_km": round(np.random.uniform(50, 400), 2)} for r1 in regions[:5] for r2 in regions[5:10]]
    pd.DataFrame(transport_cost).to_csv(os.path.join(group_b_dir, "transport_cost_by_lane.csv"), index=False)
    
    fixed_cost = [{"hub_id": h, "fixed_cost_usd_per_year": round(np.random.uniform(50000, 200000), 2), "capacity_tons": round(np.random.uniform(10000, 50000), 2)} for h in hubs]
    pd.DataFrame(fixed_cost).to_csv(os.path.join(group_b_dir, "warehouse_fixed_cost_by_hub.csv"), index=False)
    
    handling_cost = [{"hub_id": h, "product_family": p, "cost_per_ton": round(np.random.uniform(5, 20), 2)} for h in hubs for p in product_families[:3]]
    pd.DataFrame(handling_cost).to_csv(os.path.join(group_b_dir, "handling_cost_by_product_hub.csv"), index=False)
    
    inventory_holding = [{"month": m, "product_family": p, "holding_cost": round(np.random.uniform(10, 50), 2)} for m in months for p in product_families[:3]]
    pd.DataFrame(inventory_holding).to_csv(os.path.join(group_b_dir, "inventory_holding_cost_by_month.csv"), index=False)
    
    seasonal_flex = [{"hub_id": h, "month": m, "flex_cost_usd": round(np.random.uniform(0, 10000), 2)} for h in hubs for m in ["2023-11", "2023-12"]]
    pd.DataFrame(seasonal_flex).to_csv(os.path.join(group_b_dir, "seasonal_flex_cost.csv"), index=False)
    
    sla_penalty = [{"lane_id": f"{r1}-{r2}", "penalty_usd": round(np.random.uniform(100, 500), 2)} for r1, r2 in zip(regions[:3], regions[3:6])]
    pd.DataFrame(sla_penalty).to_csv(os.path.join(group_b_dir, "sla_penalty_by_lane.csv"), index=False)
    
    utilization = [{"scenario_id": "S3", "hub_id": h, "month": m, "assigned_volume": 12000, "effective_capacity": 15000, "utilization_pct": 80.0, "status": "healthy"} for h in hubs for m in months[:2]]
    pd.DataFrame(utilization).to_csv(os.path.join(group_b_dir, "utilization_by_hub_month.csv"), index=False)
    
    capacity_gap = [{"scenario_id": "S3", "hub_id": h, "peak_month": "2023-11", "capacity_gap": 2000, "recommended_action": "Add 3PL"} for h in hubs[:2]]
    pd.DataFrame(capacity_gap).to_csv(os.path.join(group_b_dir, "capacity_gap_by_peak_period.csv"), index=False)
    
    selected_hubs = [{"scenario_id": s, "hub_id": h} for s in scenarios_list for h in np.random.choice(hubs, 3, replace=False)]
    pd.DataFrame(selected_hubs).to_csv(os.path.join(group_b_dir, "selected_hubs_by_scenario.csv"), index=False)
    
    scenario_comp = [{"scenario_id": s, "scenario_name": f"Scenario {s}", "total_cost": round(np.random.uniform(1000000, 5000000), 2), "service_level_pct": round(np.random.uniform(85, 99), 2)} for s in scenarios_list]
    pd.DataFrame(scenario_comp).to_csv(os.path.join(group_b_dir, "scenario_comparison.csv"), index=False)
    
    allocations = [{"scenario_id": "S3", "region_name": r, "hub_id": np.random.choice(hubs), "product_family": "mobile_launch", "volume": 100, "unit": "ton", "allocation_share_pct": 100.0} for r in regions]
    pd.DataFrame(allocations).to_csv(os.path.join(group_b_dir, "region_to_hub_allocation_by_product.csv"), index=False)

    # ------------------ GROUP C: DIAGNOSIS & SYNTHESIS ------------------
    print("Generating Group C (Diagnosis & Synthesis) Mocks...")
    current_health = [{"hub_id": "GG_METRO", "status": "overload", "utilization_pct": 110.5}]
    pd.DataFrame(current_health).to_csv(os.path.join(group_c_dir, "current_network_health.csv"), index=False)
    
    high_cost = [{"lane_id": "Seoul-Busan", "cost": 50000, "driver": "Distance"}]
    pd.DataFrame(high_cost).to_csv(os.path.join(group_c_dir, "high_cost_lanes.csv"), index=False)
    
    overloaded = [{"hub_id": "GG_METRO", "utilization_pct": 110.5, "severity": "High", "reason": "Metro demand spike"}]
    pd.DataFrame(overloaded).to_csv(os.path.join(group_c_dir, "overloaded_hubs.csv"), index=False)
    
    hub_roles = [{"hub_id": h, "role": "metro_fulfillment" if h=="GG_METRO" else "regional_hub"} for h in hubs]
    pd.DataFrame(hub_roles).to_csv(os.path.join(group_c_dir, "hub_role_assignment.csv"), index=False)
    
    recommended_net = [{"scenario_id": "S3", "hub_id": h, "status": "healthy"} for h in hubs[:4]]
    pd.DataFrame(recommended_net).to_csv(os.path.join(group_c_dir, "recommended_network.csv"), index=False)

    rules = {"rules": [{"region": "Seoul", "family": "mobile_launch", "confidence": 0.9}]}
    with open(os.path.join(group_c_dir, "classifier_rules.json"), "w") as f: json.dump(rules, f, indent=2)
        
    playbook = [{"event_id": "E1", "event_name": "Q1_Galaxy_Launch", "months": ["2023-02"], "affected_product_families": ["mobile_launch"], "affected_hubs": ["GG_METRO"], "risk": "Capacity overflow", "recommended_actions": ["Pre-position inventory"]}]
    with open(os.path.join(group_c_dir, "seasonal_playbook.json"), "w") as f: json.dump(playbook, f, indent=2)

    # ------------------ MASTER JSON CONTRACT ------------------
    print("Generating Master Engine JSON aligned with updated schema...")
    master_json = {
        "contract_version": "v1.0-locked",
        "run_info": {
            "scenario_run_id": f"run_{uuid.uuid4().hex[:8]}",
            "run_uuid": str(uuid.uuid4()),
            "engine_version": "v2.0-proxy",
            "run_mode": "mock",
            "created_at": datetime.datetime.utcnow().isoformat() + "Z",
            "created_by": "generate_midterm_mocks.py",
            "execution_time_ms": 15420.5,
            "status": "success"
        },
        "proxy_scope": {
            "is_proxy": True,
            "data_source_type": "public_proxy",
            "data_sources": [
                {
                    "source_id": "KOTI_OD_2023",
                    "source_name": "Korean Freight O/D 2023",
                    "source_type": "public_dataset",
                    "role_in_engine": "Demand volumes"
                }
            ],
            "geographic_scope": "South Korea (17 regions)",
            "analysis_period": "2023",
            "target_company_context": "Samsung Electronics Logistics Proxy",
            "disclaimer": "This analysis relies on public proxy data. Do not use for real-world CAPEX decisions without substituting enterprise data."
        },
        "input_data_summary": {
            "total_rows_ingested": 1500000,
            "total_rows_processed": 1450000,
            "total_volume_processed": total_vol,
            "volume_unit": "ton",
            "date_range": {"start": "2023-01-01", "end": "2023-12-31"},
            "records_by_input": [{"dataset_name": "KOTI OD", "rows_ingested": 1500000, "rows_processed": 1450000}],
            "unit_standardization": {"standard_unit": "ton", "conversion_notes": ["1 pallet = 1 ton assumed"]}
        },
        "data_quality_report": {
            "usable_rate": 0.96,
            "quality_level": "High",
            "missing_fields": [],
            "imputed_fields": ["product_family"],
            "missing_origin_count": 0,
            "missing_destination_count": 0,
            "missing_volume_count": 0,
            "invalid_region_count": 50,
            "duplicate_records_count": 120,
            "geocode_success_rate": 1.0,
            "warnings": ["Imputed product family based on region heuristic."]
        },
        "master_data": {
            "regions": [{"region_id": r, "region_name": r, "country": "KR", "level": "si_do", "lat": 37.0, "lon": 127.0} for r in regions],
            "product_families": [{"product_family": p, "product_family_name": p.replace("_", " ").title(), "description": "Mocked", "default_sla_radius_km": 150, "default_unit": "ton"} for p in product_families],
            "candidate_hubs": [{"hub_id": h, "hub_name": h, "region_id": "Gyeonggi", "region_name": "Gyeonggi", "lat": 37.5, "lon": 127.1, "hub_type": "regional", "area_m2": 50000, "base_capacity": 50000, "effective_capacity": 60000, "capacity_unit": "ton", "fixed_cost_usd_per_year": 100000, "eligible_product_families": product_families} for h in hubs]
        },
        "demand": {
            "total_annual_volume": total_vol,
            "volume_unit": "ton",
            "annual_demand_by_region": regional_demand,
            "monthly_demand_by_region_product": monthly_demand_prod,
            "top_od_lanes": top_lanes
        },
        "product_segmentation": {
            "method": "rule_based",
            "confidence_level": "Medium",
            "rules_applied": 7,
            "distribution": [{"product_family": p, "volume": 10000, "unit": "ton", "share_pct": 14.2} for p in product_families],
            "notes": ["Segmentation applied using Group C playbook."]
        },
        "baseline_network": {
            "current_network_assumption": "Largest 3 hubs",
            "current_hubs": [{"hub_id": "GG_METRO", "hub_name": "Gyeonggi Hub", "region_name": "Gyeonggi", "role": "metro_fulfillment", "capacity": 50000, "assigned_volume": 45000, "unit": "ton", "utilization_pct": 90, "status": "healthy"}],
            "current_total_cost": {"currency": "USD", "total_cost": 5000000, "cost_index": 100},
            "current_service_level_pct": 82.5,
            "current_risk_score": 0.4
        },
        "cost_model": {
            "currency": "USD",
            "cost_basis": "benchmark",
            "cost_components": ["transport", "warehouse_fixed", "handling", "inventory_holding"],
            "cost_config": {"transport_rate": 0.15},
            "cost_breakdown_baseline": {"transport": 3000000, "warehouse_fixed": 1000000, "handling": 500000, "inventory_holding": 500000, "seasonal_flex": 0, "sla_penalty": 0, "total": 5000000}
        },
        "capacity_model": {
            "capacity_unit": "ton",
            "total_network_capacity": 300000,
            "average_utilization_pct": 85.5,
            "utilization_bands": {"healthy": "<90%", "overload": ">100%"},
            "hub_utilization_by_month": utilization,
            "capacity_gap_by_peak_period": capacity_gap
        },
        "diagnosis": {
            "network_health_summary": "Network is generally healthy but GG_METRO overloads in Q4.",
            "overloaded_hubs": overloaded,
            "underused_hubs": [],
            "high_cost_lanes": [{"lane_id": "Seoul-Busan", "origin_region": "Seoul", "destination_region": "Busan", "product_family": "finished_goods", "monthly_volume": 1000, "unit": "ton", "distance_km": 320, "cost": 48000, "currency": "USD", "cost_share_pct": 12.5, "driver": "Distance", "recommended_action": "Open Southern Hub"}],
            "poor_coverage_regions": [{"region_name": "Jeju", "nearest_hub_id": "BS_PORT", "distance_km": 400, "sla_violation_pct": 95.0, "risk_level": "High"}]
        },
        "optimization_models": {
            "models_run": [{"model_id": "cflp", "model_name": "Capacitated FLP", "solver": "CBC", "status": "optimal", "solve_time_seconds": 39.5}]
        },
        "scenarios": [
            {
                "scenario_id": "S0", "scenario_name": "Baseline", "scenario_type": "baseline", "model_used": "assumption", "description": "Current network",
                "selected_hubs": ["GG_METRO", "BS_PORT", "DJ_CENTRAL"],
                "cost_breakdown": {"transport": 3000000, "warehouse_fixed": 1000000, "handling": 500000, "inventory_holding": 500000, "seasonal_flex": 0, "sla_penalty": 0, "total": 5000000},
                "total_cost": 5000000, "currency": "USD", "cost_index": 100.0, "service_level_pct": 82.5, "coverage_200km_pct": 85.0, "peak_utilization_pct": 110.0, "risk_score": 0.4, "risk_level": "High", "recommended": False, "managerial_interpretation": "High risk in Q4.",
                "assignments": []
            },
            {
                "scenario_id": "S3", "scenario_name": "Hybrid-6", "scenario_type": "optimized", "model_used": "hybrid_cflp", "description": "Optimized network",
                "selected_hubs": ["GG_METRO", "BS_PORT", "DJ_CENTRAL", "IC_AIRPORT"],
                "cost_breakdown": {"transport": 2500000, "warehouse_fixed": 1200000, "handling": 400000, "inventory_holding": 400000, "seasonal_flex": 50000, "sla_penalty": 0, "total": 4550000},
                "total_cost": 4550000, "currency": "USD", "cost_index": 91.0, "service_level_pct": 95.5, "coverage_200km_pct": 98.0, "peak_utilization_pct": 92.0, "risk_score": 0.15, "risk_level": "Low", "recommended": True, "managerial_interpretation": "Optimal balance of cost and service.",
                "assignments": allocations
            }
        ],
        "recommended_network": {
            "recommended_scenario_id": "S3",
            "recommendation_summary": "Move to 4 hubs to balance cost.",
            "recommended_hubs": [{"hub_id": "GG_METRO", "hub_name": "Gyeonggi Hub", "region_name": "Gyeonggi", "role": "metro_fulfillment", "lat": 37.5, "lon": 127.1, "served_regions": ["Seoul", "Gyeonggi"], "served_product_families": ["mobile_launch"], "reason_selected": "High demand density"}],
            "why_this_scenario": "Best cost reduction.",
            "why_not_other_scenarios": ["S1 lacks capacity", "S4 is too expensive"]
        },
        "allocation": allocations,
        "seasonal_playbook": playbook,
        "business_case": {
            "baseline_scenario_id": "S0",
            "recommended_scenario_id": "S3",
            "annual_saving": 450000,
            "currency": "USD",
            "saving_pct": 9.0,
            "additional_fixed_cost": 200000,
            "payback_months": 5.3,
            "service_level_improvement_pct_point": 13.0,
            "risk_reduction_summary": "Mitigates Q4 capacity risk.",
            "executive_summary": "The S3 network saves 9% annually."
        },
        "roadmap": [
            {"phase_id": "P1", "phase_name": "Quick Wins", "timeline": "Month 1-3", "actions": ["Reallocate Seoul volumes"], "owner": "Operations", "expected_impact": "Immediate SLA improvement"}
        ],
        "outcome_report": {
            "markdown_path": "output/outcome_sample_full.md",
            "sections_count": 16,
            "sections": [{"section_id": "sec_0", "title": "Executive Summary", "source_blocks": ["business_case"]}],
            "disclaimer_included": True
        },
        "artifacts": [
            {"artifact_type": "csv", "path": "mocks/group_A_data/regional_demand.csv"}
        ],
        "warnings": [{"warning_code": "W001", "message": "Imputed families.", "severity": "Low", "module": "segmentation"}],
        "errors": []
    }
    
    with open(os.path.join(mocks_dir, "mock_engine_output_final.json"), "w") as f:
        json.dump(master_json, f, indent=2)
        
    print(f"Success! Generated all intermediate mock tables and strictly compliant master JSON at {mocks_dir}")

if __name__ == "__main__":
    main()
