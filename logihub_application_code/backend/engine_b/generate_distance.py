import json
import csv
import math
import os


def haversine(lat1, lon1, lat2, lon2):
    """지구 곡률을 반영한 하버사인 구면 직선거리 연산 (km)"""
    R = 6371.0  # 지구의 평균 반지름 (km)
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


# output 폴더가 없으면 자동 생성
os.makedirs('output', exist_ok=True)

# 프록시 JSON 데이터 로드 (인코딩 에러 방지 적용)
print("[INFO] JSON 데이터에서 위경도 좌표를 추출합니다...")
with open('mock_engine_output_final.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

regions = data['master_data']['regions']
hubs = data['master_data']['candidate_hubs']

# 102개 노선(17개 권역 x 6개 허브) 거리 매트릭스 계산 및 CSV 저장
print("[INFO] 하버사인 거리 행렬(102 lanes)을 연산합니다...")
with open('output/distance_matrix.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    # [수정된 부분] cli.py가 찾는 이름과 똑같이 맞춤!
    writer.writerow(['origin_region_id', 'destination_hub_id', 'distance_km'])

    for r in regions:
        for h in hubs:
            dist = haversine(r['lat'], r['lon'], h['lat'], h['lon'])
            writer.writerow([r['region_id'], h['hub_id'], dist])

print("[SUCCESS] output/distance_matrix.csv 파일이 성공적으로 생성되었습니다!")