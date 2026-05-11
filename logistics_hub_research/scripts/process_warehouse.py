import pandas as pd
import os

base_dir = r"C:\Users\PC\.gemini\antigravity\scratch\korea_logistics_hub_project"
file_path = r"C:\Users\PC\Downloads\물류창고정보_260508.xls"

def process_warehouse():
    print("Loading warehouse data...")
    df = pd.read_excel(file_path, engine='xlrd')
    
    # Calculate total capacity area (m2)
    area_cols = ['일반창고면적(m²)', '냉동냉장창고면적(m²)', '보관장소면적(m²)', '타법률창고면적(m²)']
    
    # Ensure numeric
    for col in area_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
    df['total_area_m2'] = df[area_cols].sum(axis=1)
    
    # Extract 17 large region from address (소재지)
    # The address usually starts with the province/city name like "서울특별시", "경기도", etc.
    df['region_name'] = df['소재지'].astype(str).str.split(' ').str[0]
    
    # Some cleaning might be needed (e.g., "서울시" vs "서울특별시")
    mapping = {
        '서울시': '서울특별시', '서울': '서울특별시',
        '부산시': '부산광역시', '부산': '부산광역시',
        '대구시': '대구광역시', '대구': '대구광역시',
        '인천시': '인천광역시', '인천': '인천광역시',
        '광주시': '광주광역시', '광주': '광주광역시',
        '대전시': '대전광역시', '대전': '대전광역시',
        '울산시': '울산광역시', '울산': '울산광역시',
        '세종시': '세종특별자치시', '세종': '세종특별자치시',
        '경기': '경기도', '강원': '강원도',
        '충북': '충청북도', '충남': '충청남도',
        '전북': '전라북도', '전남': '전라남도',
        '경북': '경상북도', '경남': '경상남도',
        '제주': '제주특별자치도', '제주시': '제주특별자치도'
    }
    
    df['region_name'] = df['region_name'].replace(mapping)
    
    # Aggregate capacity by region
    region_capacity = df.groupby('region_name')['total_area_m2'].sum().reset_index()
    region_count = df.groupby('region_name').size().reset_index(name='warehouse_count')
    
    capacity_df = pd.merge(region_capacity, region_count, on='region_name')
    capacity_df = capacity_df.sort_values(by='total_area_m2', ascending=False)
    
    out_path = os.path.join(base_dir, "data_processed", "warehouse_capacity_17_regions.csv")
    capacity_df.to_csv(out_path, index=False, encoding='utf-8-sig')
    
    print(f"Saved aggregated warehouse capacity to {out_path}")
    print("\nTop 5 regions by capacity:")
    print(capacity_df.head())

if __name__ == "__main__":
    process_warehouse()
