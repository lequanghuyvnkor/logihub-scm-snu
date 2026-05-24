import pandas as pd
import os
import json


def _load_config():
    cfg_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json')
    with open(cfg_path, encoding='utf-8-sig') as f:
        return json.load(f)


def calculate_base_costs():
    cfg = _load_config()
    benchmarks = cfg['product_benchmarks']

    print("[INFO] Loading data...")
    distance_df = pd.read_csv('output/distance_matrix.csv')
    warehouse_df = pd.read_csv('warehouse_registry.csv')

    UNIT_TRANSPORT_COST = cfg['transport_rate_usd_per_ton_km']

    print("[INFO] Calculating base costs...")

    # 1. Transport Cost (lane_id, origin, destination, cost_per_ton_km, distance_km)
    distance_df['lane_id'] = distance_df['origin'] + "-" + distance_df['destination']
    distance_df['cost_per_ton_km'] = UNIT_TRANSPORT_COST
    transport_cols = ['lane_id', 'origin', 'destination', 'cost_per_ton_km', 'distance_km']
    df_transport = distance_df[transport_cols]
    df_transport.to_csv('output/transport_cost_by_lane.csv', index=False)

    # 2. Fixed Cost (hub_id, fixed_cost_usd_per_year, capacity_tons)
    df_fixed = warehouse_df[['hub_id', 'fixed_cost', 'capacity_tons']].copy()
    df_fixed.rename(columns={'fixed_cost': 'fixed_cost_usd_per_year'}, inplace=True)
    df_fixed.to_csv('output/warehouse_fixed_cost_by_hub.csv', index=False)

    # 3. Handling Cost — product-specific rates from config.json benchmarks
    handling_records = []
    for hub in warehouse_df['hub_id']:
        for pf, rates in benchmarks.items():
            handling_records.append({
                'hub_id': hub,
                'product_family': pf,
                'unit_handling_cost': rates['handling_cost_usd_per_ton']
            })

    df_handling = pd.DataFrame(handling_records)
    df_handling.to_csv('output/handling_cost_by_product_hub.csv', index=False)

    print("[SUCCESS] Base cost CSVs generated.")


if __name__ == "__main__":
    if not os.path.exists('output'):
        os.makedirs('output')
    calculate_base_costs()
