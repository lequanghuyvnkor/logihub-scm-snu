# engine/cli.py
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import argparse
import json
import pandas as pd
import concurrent.futures
import time
from engine.optimizer import solve_p_median, solve_uflp, solve_cflp, solve_mclp, solve_hybrid_cflp


def run_single_scenario(scenario_config, candidate_hubs):
    """개별 시나리오를 할당된 솔버로 실행하는 함수"""
    s_id = scenario_config['id']
    s_type = scenario_config['type']
    print(f" - [START] {s_id}: {scenario_config['name']} ({s_type})")

    # 설정된 모델 타입에 따라 알맞은 최적화 솔버 호출
    if s_type == 'UFLP':
        res = solve_uflp(s_id, candidate_hubs)
    elif s_type == 'P-median':
        res = solve_p_median(s_id, scenario_config.get('p', 5), candidate_hubs)
    elif s_type == 'CFLP':
        res = solve_cflp(s_id, candidate_hubs)
    elif s_type == 'MCLP':
        res = solve_mclp(s_id, candidate_hubs)
    elif s_type == 'Hybrid':
        res = solve_hybrid_cflp(s_id, candidate_hubs)
    else:
        res = solve_uflp(s_id, candidate_hubs)

    print(f" - [DONE] {s_id} completed.")
    return res, scenario_config['name']


def run_all_scenarios(demand_file, warehouse_file, output_dir):
    print(f"[INFO] Loading input data: {demand_file}, {warehouse_file}")
    wh_df = pd.read_csv(warehouse_file)
    candidate_hubs = wh_df['hub_id'].tolist()

    # 9대 시나리오 메타데이터 정의
    scenario_configs = [
        {'id': 'S0', 'name': 'Baseline', 'type': 'UFLP'},
        {'id': 'S1', 'name': 'Cost Minimized', 'type': 'UFLP'},
        {'id': 'S2', 'name': 'Balanced P5', 'type': 'P-median', 'p': 5},
        {'id': 'S3', 'name': 'Service P7', 'type': 'P-median', 'p': 7},
        {'id': 'S4', 'name': 'Capacity Constrained', 'type': 'CFLP'},
        {'id': 'S5', 'name': 'Peak Season Flex', 'type': 'CFLP'},
        {'id': 'S6', 'name': 'Max Coverage 50km', 'type': 'MCLP'},
        {'id': 'S7', 'name': 'Max Coverage 100km', 'type': 'MCLP'},
        {'id': 'S8', 'name': 'Hybrid Product Eligibility', 'type': 'Hybrid'}
    ]

    print("\n[INFO] Starting 9-Scenario Parallel Execution...")
    start_time = time.time()

    scenarios = {}
    comparison_data = []
    selected_hubs_data = []

    # 병렬 처리 (Thread Pool을 이용하여 9개 시나리오 동시 연산)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_to_scen = {
            executor.submit(run_single_scenario, cfg, candidate_hubs): cfg
            for cfg in scenario_configs
        }

        for future in concurrent.futures.as_completed(future_to_scen):
            cfg = future_to_scen[future]
            try:
                res, s_name = future.result()
                scenarios[res.scenario_id] = res.__dict__
                comparison_data.append({
                    "scenario_id": res.scenario_id,
                    "scenario_name": s_name,
                    "total_cost": res.objective_value,
                    "service_level_pct": 0.90  # 임시 서비스 레벨
                })
                for hub in res.selected_hubs:
                    selected_hubs_data.append({"scenario_id": res.scenario_id, "hub_id": hub})
            except Exception as exc:
                print(f"[ERROR] {cfg['id']} generated an exception: {exc}")

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 결과를 시나리오 ID 순서대로 정렬
    comparison_data.sort(key=lambda x: x['scenario_id'])
    selected_hubs_data.sort(key=lambda x: x['scenario_id'])

    # 최종 파일 저장
    with open(os.path.join(output_dir, 'scenario_logs.json'), 'w') as f:
        json.dump(scenarios, f, indent=4)
    pd.DataFrame(comparison_data).to_csv(os.path.join(output_dir, 'scenario_comparison.csv'), index=False)
    pd.DataFrame(selected_hubs_data).to_csv(os.path.join(output_dir, 'selected_hubs_by_scenario.csv'), index=False)

    elapsed = time.time() - start_time
    print(f"\n[SUCCESS] 9 Scenarios completed in {elapsed:.2f} seconds.")
    print("[SUCCESS] Generated: scenario_logs.json, scenario_comparison.csv, selected_hubs_by_scenario.csv")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["run-scenarios"])
    parser.add_argument("--demand", required=True)
    parser.add_argument("--warehouse", required=True)
    parser.add_argument("--output", required=True)

    args = parser.parse_args()

    if args.command == "run-scenarios":
        run_all_scenarios(args.demand, args.warehouse, args.output)


if __name__ == "__main__":
    main()