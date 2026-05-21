import pandas as pd
import math
import os


def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0
    lat1_rad, lon1_rad = math.radians(lat1), math.radians(lon1)
    lat2_rad, lon2_rad = math.radians(lat2), math.radians(lon2)
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def build_distance_matrix(demand_file="freight_od.csv", warehouse_file="warehouse_registry.csv"):
    print("[INFO] Loading data...")
    region_df = pd.read_csv(demand_file)
    warehouse_df = pd.read_csv(warehouse_file)

    records = []
    print("[INFO] Calculating distance matrix (Long Format)...")
    for _, region in region_df.iterrows():
        for _, hub in warehouse_df.iterrows():
            dist = calculate_haversine_distance(region['lat'], region['lon'], hub['lat'], hub['lon'])
            records.append({
                'origin': region['region_id'],
                'destination': hub['hub_id'],
                'distance_km': round(dist, 2)
            })

    if not os.path.exists('output'):
        os.makedirs('output')

    distance_matrix_df = pd.DataFrame(records)
    distance_matrix_df.to_csv('output/distance_matrix.csv', index=False)
    print("[SUCCESS] output/distance_matrix.csv generated.")
    return distance_matrix_df


if __name__ == "__main__":
    build_distance_matrix()