import pandas as pd
import numpy as np
import os

# Paths
base_dir = r"C:\Users\PC\.gemini\antigravity\scratch\korea_logistics_hub_project"
logihub_dir = r"C:\Users\PC\.gemini\antigravity\scratch\logihub"
output_od = os.path.join(logihub_dir, "freight_od.csv")
output_warehouse = os.path.join(logihub_dir, "warehouse_registry.csv")

def run_migration():
    print("Migrating Demand Data...")
    df_demand = pd.read_csv(os.path.join(base_dir, "data_processed", "demand_17_regions_2023.csv"))
    # The Logihub backend expects: region_id, lat, lon, demand_tons
    # In demand_17_regions_2023.csv we have: REGION, DEMAND_TONS
    
    # We need the base coordinates for the 17 regions
    coords_17 = {
        '서울특별시': (37.5665, 126.9780),
        '부산광역시': (35.1796, 129.0756),
        '대구광역시': (35.8714, 128.6014),
        '인천광역시': (37.4563, 126.7052),
        '광주광역시': (35.1595, 126.8526),
        '대전광역시': (36.3504, 127.3845),
        '울산광역시': (35.5384, 129.3114),
        '세종특별자치시': (36.4800, 127.2890),
        '경기도': (37.4138, 127.5183),
        '강원특별자치도': (37.8228, 128.1555),
        '강원도': (37.8228, 128.1555), # Old name fallback
        '충청북도': (36.6357, 127.4913),
        '충청남도': (36.5184, 126.8000),
        '전북특별자치도': (35.7175, 127.1530),
        '전라북도': (35.7175, 127.1530), # Old name fallback
        '전라남도': (34.8679, 126.9910),
        '경상북도': (36.4919, 128.8889),
        '경상남도': (35.2373, 128.6919),
        '제주특별자치도': (33.4890, 126.4983)
    }

    df_demand['lat'] = df_demand['region_name'].map(lambda x: coords_17.get(x, (0,0))[0])
    df_demand['lon'] = df_demand['region_name'].map(lambda x: coords_17.get(x, (0,0))[1])
    
    df_od = pd.DataFrame({
        'region_id': df_demand['region_name'],
        'lat': df_demand['lat'],
        'lon': df_demand['lon'],
        'demand_tons': df_demand['total_volume']
    })
    df_od.to_csv(output_od, index=False, encoding='utf-8-sig')
    print(f"Exported freight_od.csv with {len(df_od)} records.")

    print("Migrating Warehouse Data (from Geocoded dataset)...")
    geocoded_file = os.path.join(base_dir, "data_processed", "warehouse_geocoded.csv")
    try:
        df_wh = pd.read_csv(geocoded_file)
    except Exception as e:
        print(f"Error reading geocoded file: {e}")
        return

    # Categorize storage items
    def categorize_storage(item_str):
        if not isinstance(item_str, str):
            return 'General Merchandise'
        
        s = item_str.lower()
        if any(kw in s for kw in ['냉동', '신선', '육류', '아이스크림', '수산물', '과일', '농수산', '농축수산', '냉장']):
            return 'Cold Storage'
        elif any(kw in s for kw in ['전자', '가전', '반도체', '컴퓨터']):
            return 'Electronics'
        elif any(kw in s for kw in ['가공식품', '음료', '생수', '맥주', '주류', '식품', '식자재', '와인', '원재료']):
            return 'Food & Beverage'
        elif any(kw in s for kw in ['의류', '화장품', '양말', '패션', '스타킹']):
            return 'Fashion & Cosmetics'
        elif any(kw in s for kw in ['위생', '의약', '병원', '구급', '보호복', '마스크']):
            return 'Medical'
        elif any(kw in s for kw in ['배터리', '변압기', '화학', '위험물']):
            return 'Industrial'
        else:
            return 'General Merchandise'
            
    df_wh['storage_item'] = df_wh['storage_item'].apply(categorize_storage)
    
    # We only need to write it to the logihub directory
    df_wh.to_csv(output_warehouse, index=False, encoding='utf-8-sig')
    print(f"Exported warehouse_registry.csv with {len(df_wh)} records to {output_warehouse}.")

if __name__ == "__main__":
    run_migration()
