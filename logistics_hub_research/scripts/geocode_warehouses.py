import pandas as pd
import requests
import os
import re
import time

KAKAO_API_KEY = "370da0db421135708a5784ebfd56f4fd"
RAW_FILE = r"C:\Users\PC\Downloads\물류창고정보_260508.xls"
OUT_FILE = r"C:\Users\PC\.gemini\antigravity\scratch\korea_logistics_hub_project\data_processed\warehouse_geocoded.csv"

# Centroids for fallback
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
    '강원도': (37.8228, 128.1555),
    '충청북도': (36.6357, 127.4913),
    '충청남도': (36.5184, 126.8000),
    '전북특별자치도': (35.7175, 127.1530),
    '전라북도': (35.7175, 127.1530),
    '전라남도': (34.8679, 126.9910),
    '경상북도': (36.4919, 128.8889),
    '경상남도': (35.2373, 128.6919),
    '제주특별자치도': (33.4890, 126.4983)
}

def clean_address(addr):
    if not isinstance(addr, str):
        return ""
    # Remove things inside parenthesis (often building names which APIs fail on)
    addr = re.sub(r'\(.*?\)', '', addr)
    # Remove extra spaces
    addr = ' '.join(addr.split())
    return addr

def geocode_kakao(address):
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {"query": address}
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('documents'):
                doc = data['documents'][0]
                return float(doc['y']), float(doc['x']), "Success", doc.get('address_name', address)
    except Exception as e:
        print(f"Error geocoding {address}: {e}")
    return None, None, "Failed", ""

def get_fallback_coords(sido, address):
    # Try Sido exact match
    if sido in coords_17:
        return coords_17[sido]
    # Try finding Sido in the address string
    for region, coords in coords_17.items():
        if region[:2] in address:
            return coords
    # Ultimate fallback (center of SK)
    return (36.0, 127.5)

def main():
    print("Reading raw warehouse registry...")
    df_wh = pd.read_excel(RAW_FILE, engine='xlrd')
    
    # Extract unique clean addresses
    df_wh['CleanAddress'] = df_wh['소재지'].astype(str).apply(clean_address)
    unique_addrs = df_wh['CleanAddress'].unique()
    unique_addrs = [a for a in unique_addrs if a and a != 'nan']
    
    print(f"Total records: {len(df_wh)}. Unique addresses to geocode: {len(unique_addrs)}")
    
    coord_map = {}
    print("Starting Multi-threaded Kakao Geocoding...")
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    def process_address(addr):
        lat, lon, status, matched = geocode_kakao(addr)
        return addr, lat, lon, status, matched
        
    with ThreadPoolExecutor(max_workers=30) as executor:
        futures = {executor.submit(process_address, addr): addr for addr in unique_addrs}
        completed = 0
        for future in as_completed(futures):
            addr, lat, lon, status, matched = future.result()
            coord_map[addr] = {
                'lat': lat,
                'lon': lon,
                'status': status,
                'matched_address': matched
            }
            completed += 1
            if completed % 500 == 0:
                print(f"Geocoded {completed}/{len(unique_addrs)} addresses...")
        
    print("Geocoding complete. Mapping to full dataset...")
    
    results = []
    success_count = 0
    fallback_count = 0
    
    # Calculate total capacity area (m2)
    area_cols = ['일반창고면적(m²)', '냉동냉장창고면적(m²)', '보관장소면적(m²)', '타법률창고면적(m²)']
    for col in area_cols:
        if col in df_wh.columns:
            df_wh[col] = pd.to_numeric(df_wh[col], errors='coerce').fillna(0)
    
    for idx, row in df_wh.iterrows():
        raw_addr = str(row.get('소재지', ''))
        sido = str(raw_addr).split(' ')[0] if pd.notnull(raw_addr) else 'Unknown'
        clean_addr = str(row.get('CleanAddress', ''))
        company = str(row.get('상호명', f'Warehouse_{idx}'))
        
        # Calculate Capacity & Costs
        total_area = sum(row.get(col, 0) for col in area_cols)
        if pd.isna(total_area) or total_area == 0:
            total_area = 1000
            
        capacity = total_area * 100
        fixed_cost = total_area * 1000
        
        # Geocoding Assignment
        lat, lon, status, matched = None, None, "Failed", ""
        if clean_addr in coord_map:
            cmap = coord_map[clean_addr]
            lat, lon = cmap['lat'], cmap['lon']
            status = cmap['status']
            matched = cmap['matched_address']
            
        if status == "Success" and lat is not None and lon is not None:
            success_count += 1
            final_status = "High-Confidence (Kakao)"
        else:
            fallback_count += 1
            lat, lon = get_fallback_coords(sido, raw_addr)
            final_status = "Low-Confidence (Fallback)"
            
        results.append({
            'hub_id': f'WH_{idx:05d}',
            'company_name': company,
            'sido': sido,
            'address': raw_addr,
            'matched_address': matched,
            'lat': lat,
            'lon': lon,
            'area_m2': total_area,
            'fixed_cost': fixed_cost,
            'capacity_tons': capacity,
            'storage_item': str(row.get('취급품목', 'Mixed')),
            'geocoding_status': final_status
        })
        
    df_res = pd.DataFrame(results)
    
    # Clip bounds
    df_res['lat'] = df_res['lat'].clip(33.0, 38.5)
    df_res['lon'] = df_res['lon'].clip(125.0, 130.0)
    
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    df_res.to_csv(OUT_FILE, index=False, encoding='utf-8')
    print(f"Exported {len(df_res)} records to {OUT_FILE}")
    print(f"Geocoding Stats -> Success: {success_count}, Fallback: {fallback_count}")

if __name__ == "__main__":
    main()
