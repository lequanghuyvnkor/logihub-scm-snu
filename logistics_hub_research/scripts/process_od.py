import pandas as pd
import numpy as np
import os

def process_data():
    base_dir = r"C:\Users\PC\.gemini\antigravity\scratch\korea_logistics_hub_project"
    file_path = r"C:\Users\PC\Downloads\20260430173444\ton_2023\배포용 (기준년도 2023년) 화물물동량OD_2026.04.xlsx"
    
    print("Loading zone mapping...")
    zones_df = pd.read_excel(file_path, sheet_name="존체계")
    # Columns are: 존번호, 대존_17, 행정구역명
    zone_dict_250 = dict(zip(zones_df['존번호'], zones_df['행정구역명']))
    
    # Map for 17 large zones (get the name of the province/city)
    # usually 행정구역명 for large zones can be extracted from the first word
    zones_df['large_zone_name'] = zones_df['행정구역명'].apply(lambda x: str(x).split('_')[0])
    zone_dict_17 = dict(zip(zones_df['대존_17'], zones_df['large_zone_name']))

    print("Loading OD volume...")
    od_df = pd.read_excel(file_path, sheet_name="2023년 기준 도로 전체 물동량", skiprows=1)
    
    # The columns are O_250, D_250, O_17, D_17, 품목01 ... 품목32, 컨테이너, 전체
    id_vars = ['O_250', 'D_250', 'O_17', 'D_17']
    value_vars = [c for c in od_df.columns if c not in id_vars and c != '전체']
    
    print("Melting data to long format...")
    long_od = pd.melt(od_df, id_vars=id_vars, value_vars=value_vars, var_name='commodity', value_name='volume_ton')
    long_od = long_od[long_od['volume_ton'] > 0] # Filter out zero volumes to save space
    
    # Map names
    long_od['O_250_name'] = long_od['O_250'].map(zone_dict_250)
    long_od['D_250_name'] = long_od['D_250'].map(zone_dict_250)
    long_od['O_17_name'] = long_od['O_17'].map(zone_dict_17)
    long_od['D_17_name'] = long_od['D_17'].map(zone_dict_17)
    
    # Save clean long format OD
    out_od_path = os.path.join(base_dir, "data_processed", "od_clean_long_2023.csv")
    long_od.to_csv(out_od_path, index=False, encoding='utf-8-sig')
    print(f"Saved clean OD to {out_od_path}")
    
    # --- RQ1: Demand Structure ---
    print("Calculating aggregate demands...")
    
    # By 17 large zones
    outbound_17 = long_od.groupby(['O_17', 'O_17_name'])['volume_ton'].sum().reset_index().rename(columns={'volume_ton': 'outbound_volume'})
    inbound_17 = long_od.groupby(['D_17', 'D_17_name'])['volume_ton'].sum().reset_index().rename(columns={'volume_ton': 'inbound_volume'})
    
    demand_17 = pd.merge(outbound_17, inbound_17, left_on='O_17', right_on='D_17', how='outer')
    demand_17['region_code'] = demand_17['O_17'].fillna(demand_17['D_17'])
    demand_17['region_name'] = demand_17['O_17_name'].fillna(demand_17['D_17_name'])
    demand_17['outbound_volume'] = demand_17['outbound_volume'].fillna(0)
    demand_17['inbound_volume'] = demand_17['inbound_volume'].fillna(0)
    demand_17['total_volume'] = demand_17['outbound_volume'] + demand_17['inbound_volume']
    
    demand_17 = demand_17[['region_code', 'region_name', 'outbound_volume', 'inbound_volume', 'total_volume']].sort_values(by='total_volume', ascending=False)
    
    out_demand_17_path = os.path.join(base_dir, "data_processed", "demand_17_regions_2023.csv")
    demand_17.to_csv(out_demand_17_path, index=False, encoding='utf-8-sig')
    print(f"Saved 17 region demand to {out_demand_17_path}")
    
    # Top O/D Corridors (17 zones)
    corridors_17 = long_od.groupby(['O_17_name', 'D_17_name'])['volume_ton'].sum().reset_index()
    corridors_17 = corridors_17[corridors_17['O_17_name'] != corridors_17['D_17_name']] # exclude intra-zonal
    corridors_17 = corridors_17.sort_values(by='volume_ton', ascending=False).head(20)
    
    out_corridor_path = os.path.join(base_dir, "data_processed", "top_corridors_17_2023.csv")
    corridors_17.to_csv(out_corridor_path, index=False, encoding='utf-8-sig')
    print(f"Saved top corridors to {out_corridor_path}")

if __name__ == "__main__":
    process_data()
