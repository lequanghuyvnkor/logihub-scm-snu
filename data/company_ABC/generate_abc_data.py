"""
Generate sample enterprise data for Company ABC (fish & meat distributor)
covering Dec 2025 – May 2026 (6 months).

Outputs (Engine A input + processed):
  enterprise_profile.json
  shipping_transactions.csv         ← raw enterprise upload
  processed/regional_demand.csv
  processed/monthly_demand_by_region.csv
  processed/monthly_demand_by_region_product.csv
  processed/od_matrix_17_region.csv
  processed/top_od_lanes.csv
  processed/seasonal_index.csv
"""

import csv, json, os, random, sys
sys.stdout.reconfigure(encoding="utf-8")
from collections import defaultdict
from datetime import date, timedelta

random.seed(42)
os.makedirs("processed", exist_ok=True)

# ── 1. Enterprise Profile ──────────────────────────────────────────────────────
profile = {
    "company_name": "ABC Food Logistics Co., Ltd.",
    "enterprise_scale": "Medium",
    "annual_revenue_krw_billion": 320,
    "primary_product_category": "Fresh_Food",
    "sub_categories": ["Fresh_Seafood", "Frozen_Seafood", "Fresh_Meat", "Processed_Meat"],
    "delivery_sla_hours": {
        "Fresh_Seafood": 12,
        "Frozen_Seafood": 24,
        "Fresh_Meat": 12,
        "Processed_Meat": 24
    },
    "capex_budget_usd_per_year": 480000,
    "priority_regions": ["Busan", "Gyeonggi", "Seoul", "Gyeongnam"],
    "existing_warehouses": [
        {
            "code": "ABC_BSN",
            "name": "ABC Busan Cold Storage",
            "region": "Busan",
            "address": "Busan Metropolitan City, Nam-gu",
            "capacity_tons": 800,
            "lease_type": "long_term",
            "annual_fixed_cost_usd": 95000,
            "product_category": "Fresh_Food"
        },
        {
            "code": "ABC_GG",
            "name": "ABC Gyeonggi Distribution Center",
            "region": "Gyeonggi",
            "address": "Gyeonggi-do, Icheon-si",
            "capacity_tons": 600,
            "lease_type": "long_term",
            "annual_fixed_cost_usd": 78000,
            "product_category": "Fresh_Food"
        }
    ],
    "data_period": {"start": "2025-12-01", "end": "2026-05-31"},
    "notes": "ABC Corp specializes in seafood (sourced from Busan, Jeonnam, Gyeongnam) and meat (sourced from Gyeonggi, Chungnam, Gyeongbuk). Primary markets: Seoul Metro, Gyeonggi, Incheon."
}
with open("enterprise_profile.json", "w", encoding="utf-8") as f:
    json.dump(profile, f, ensure_ascii=False, indent=2)
print("✓ enterprise_profile.json")

# ── 2. Shipping Transactions (raw upload) ──────────────────────────────────────
PRODUCT_CODES = {
    "FF_001": ("Fresh_Seafood",   "Fresh_Food"),
    "FF_002": ("Frozen_Seafood",  "Fresh_Food"),
    "FF_003": ("Fresh_Meat",      "Fresh_Food"),
    "FF_004": ("Processed_Meat",  "Fresh_Food"),
}

# Lane definitions: (origin, destination, typical_weight_range, transit_hours, product_mix)
LANES = [
    # Seafood supply: Busan hub
    ("Busan",    "Seoul",     (18, 42), 5.5, ["FF_001","FF_002"]),
    ("Busan",    "Gyeonggi",  (20, 45), 5.8, ["FF_001","FF_002"]),
    ("Busan",    "Incheon",   (15, 35), 6.0, ["FF_001","FF_002"]),
    ("Busan",    "Daegu",     (8,  20), 1.5, ["FF_001","FF_002"]),
    ("Busan",    "Gwangju",   (10, 25), 3.5, ["FF_001","FF_002"]),
    # Seafood supply: Jeonnam (Southern coast)
    ("Jeonnam",  "Seoul",     (12, 30), 4.5, ["FF_001","FF_002"]),
    ("Jeonnam",  "Gwangju",   (5,  15), 1.0, ["FF_001","FF_002"]),
    ("Jeonnam",  "Busan",     (8,  22), 3.0, ["FF_001","FF_002"]),
    ("Jeonnam",  "Gyeonggi",  (10, 28), 5.0, ["FF_001","FF_002"]),
    # Seafood supply: Gyeongnam
    ("Gyeongnam","Busan",     (6,  18), 1.0, ["FF_001","FF_002"]),
    ("Gyeongnam","Daegu",     (5,  15), 1.5, ["FF_001","FF_002"]),
    ("Gyeongnam","Seoul",     (10, 25), 5.5, ["FF_001","FF_002"]),
    # Imported seafood redistribution via Incheon port
    ("Incheon",  "Seoul",     (12, 30), 0.8, ["FF_001","FF_002"]),
    ("Incheon",  "Gyeonggi",  (8,  20), 0.7, ["FF_001","FF_002"]),
    # Meat supply: Gyeonggi (livestock farms)
    ("Gyeonggi", "Seoul",     (6,  18), 1.0, ["FF_003","FF_004"]),
    ("Gyeonggi", "Incheon",   (5,  15), 0.8, ["FF_003","FF_004"]),
    ("Gyeonggi", "Daejeon",   (8,  20), 2.0, ["FF_003","FF_004"]),
    # Meat supply: Chungnam
    ("Chungnam", "Seoul",     (10, 28), 2.5, ["FF_003","FF_004"]),
    ("Chungnam", "Daejeon",   (5,  15), 0.8, ["FF_003","FF_004"]),
    ("Chungnam", "Gyeonggi",  (8,  22), 2.0, ["FF_003","FF_004"]),
    # Meat supply: Gyeongbuk
    ("Gyeongbuk","Daegu",     (5,  18), 1.0, ["FF_003","FF_004"]),
    ("Gyeongbuk","Seoul",     (8,  22), 4.0, ["FF_003","FF_004"]),
    ("Gyeongbuk","Busan",     (6,  16), 2.5, ["FF_003","FF_004"]),
    # Gangwon (fresh mountain produce + trout)
    ("Gangwon",  "Seoul",     (5,  15), 2.0, ["FF_001","FF_003"]),
    ("Gangwon",  "Gyeonggi",  (4,  12), 1.5, ["FF_001","FF_003"]),
    # Internal redistribution
    ("Seoul",    "Incheon",   (4,  12), 0.7, ["FF_003","FF_004"]),
    ("Daejeon",  "Seoul",     (5,  14), 2.2, ["FF_003","FF_004"]),
    ("Daegu",    "Seoul",     (6,  16), 3.5, ["FF_003","FF_004"]),
    ("Gwangju",  "Seoul",     (5,  14), 3.8, ["FF_001","FF_003"]),
    ("Jeonbuk",  "Gwangju",   (4,  12), 1.2, ["FF_001","FF_003"]),
]

# Monthly seasonal multiplier (Dec-May for Fresh_Food)
MONTHLY_INDEX = {
    "2025-12": 1.18,   # year-end gatherings + Seollal prep
    "2026-01": 1.42,   # Seollal peak (Jan 28-30 2026)
    "2026-02": 0.88,   # post-holiday dip
    "2026-03": 1.02,   # spring recovery
    "2026-04": 1.12,   # spring season + outdoor dining
    "2026-05": 1.18,   # Parents Day (May 8) + Children's Day (May 5)
}

# Base trips per month per lane
BASE_TRIPS = 3

def working_days(year, month):
    d = date(year, month, 1)
    days = []
    while d.month == month:
        if d.weekday() < 5:   # Mon-Fri
            days.append(d)
        d += timedelta(days=1)
    return days

rows = []
for ym, idx in MONTHLY_INDEX.items():
    yr, mo = int(ym[:4]), int(ym[5:7])
    wdays = working_days(yr, mo)
    n_trips = int(BASE_TRIPS * idx)
    for lane in LANES:
        origin, dest, wt_range, transit, products = lane
        trips = max(1, int(n_trips * random.uniform(0.7, 1.3)))
        for _ in range(trips):
            day = random.choice(wdays)
            prod = random.choice(products)
            weight = round(random.uniform(*wt_range), 2)
            # Slight weight boost for January (Seollal bulk orders)
            if mo == 1:
                weight = round(weight * 1.25, 2)
            v_trips = max(1, int(weight / 14))   # ~14t per vehicle
            actual_transit = round(transit * random.uniform(0.9, 1.3), 1)
            rows.append({
                "shipment_date":       day.strftime("%Y-%m-%d"),
                "origin_region":       origin,
                "destination_region":  dest,
                "product_code":        prod,
                "product_subcategory": PRODUCT_CODES[prod][0],
                "product_family":      PRODUCT_CODES[prod][1],
                "weight_tons":         weight,
                "vehicle_trips":       v_trips,
                "transit_time_hours":  actual_transit,
            })

rows.sort(key=lambda r: r["shipment_date"])

tx_fields = ["shipment_date","origin_region","destination_region",
             "product_code","product_subcategory","product_family",
             "weight_tons","vehicle_trips","transit_time_hours"]
with open("shipping_transactions.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=tx_fields)
    w.writeheader()
    w.writerows(rows)
print(f"✓ shipping_transactions.csv  ({len(rows)} rows)")

# ── 3. Aggregate: OD Matrix ────────────────────────────────────────────────────
od_agg = defaultdict(float)
for r in rows:
    od_agg[(r["origin_region"], r["destination_region"])] += r["weight_tons"]

REGIONS_EN = ["Seoul","Busan","Daegu","Incheon","Gwangju","Daejeon","Ulsan",
              "Sejong","Gyeonggi","Gangwon","Chungbuk","Chungnam","Jeonbuk",
              "Jeonnam","Gyeongbuk","Gyeongnam","Jeju"]

with open("processed/od_matrix_17_region.csv","w",newline="",encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["origin","destination","flow_tons"])
    for o in REGIONS_EN:
        for d in REGIONS_EN:
            val = round(od_agg.get((o,d), 0.0), 2)
            w.writerow([o, d, val])
print("✓ processed/od_matrix_17_region.csv")

# ── 4. Regional Demand ─────────────────────────────────────────────────────────
region_inbound  = defaultdict(float)
region_outbound = defaultdict(float)
for r in rows:
    region_outbound[r["origin_region"]]      += r["weight_tons"]
    region_inbound[r["destination_region"]]  += r["weight_tons"]

total_flow = sum(region_inbound.values())
region_codes = {r: f"KR{str(i+1).zfill(2)}" for i,r in enumerate(REGIONS_EN)}

with open("processed/regional_demand.csv","w",newline="",encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["region_code","region","inbound_ton","outbound_ton",
                "total_flow_ton","demand_weight_ton","demand_share",
                "total_area_m2","warehouse_count"])
    for reg in REGIONS_EN:
        ib = round(region_inbound.get(reg,0),2)
        ob = round(region_outbound.get(reg,0),2)
        total = round(ib+ob,2)
        share = round(total/(2*total_flow),4) if total_flow else 0
        w.writerow([region_codes[reg], reg, ib, ob, total, ib, share, "", ""])
print("✓ processed/regional_demand.csv")

# ── 5. Monthly Demand by Region ────────────────────────────────────────────────
monthly_region = defaultdict(lambda: defaultdict(float))
for r in rows:
    mo = int(r["shipment_date"][5:7])
    monthly_region[r["destination_region"]][mo] += r["weight_tons"]

with open("processed/monthly_demand_by_region.csv","w",newline="",encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["region_code","region","month","seasonal_index","monthly_demand_ton"])
    # Map month numbers (12=1, 1=2, 2=3, 3=4, 4=5, 5=6) to sequential
    idx_map = {12:1.18, 1:1.42, 2:0.88, 3:1.02, 4:1.12, 5:1.18}
    for reg in REGIONS_EN:
        for mo in [12,1,2,3,4,5]:
            val = round(monthly_region[reg].get(mo,0),2)
            w.writerow([region_codes[reg], reg, mo, idx_map[mo], val])
print("✓ processed/monthly_demand_by_region.csv")

# ── 6. Monthly Demand by Region × Product ─────────────────────────────────────
monthly_region_prod = defaultdict(lambda: defaultdict(lambda: defaultdict(float)))
for r in rows:
    mo = int(r["shipment_date"][5:7])
    monthly_region_prod[r["destination_region"]][r["product_family"]][mo] += r["weight_tons"]

annual_rp = defaultdict(lambda: defaultdict(float))
for r in rows:
    annual_rp[r["destination_region"]][r["product_family"]] += r["weight_tons"]

prod_idx = {12:1.18, 1:1.42, 2:0.88, 3:1.02, 4:1.12, 5:1.18}

with open("processed/monthly_demand_by_region_product.csv","w",newline="",encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["region_code","region","product_family","month",
                "seasonal_index","monthly_demand_ton","annual_demand_ton"])
    for reg in REGIONS_EN:
        for pf in ["Fresh_Food"]:
            ann = round(annual_rp[reg].get(pf,0),2)
            for mo in [12,1,2,3,4,5]:
                val = round(monthly_region_prod[reg][pf].get(mo,0),2)
                w.writerow([region_codes[reg], reg, pf, mo, prod_idx[mo], val, ann])
print("✓ processed/monthly_demand_by_region_product.csv")

# ── 7. Top OD Lanes ───────────────────────────────────────────────────────────
od_sorted = sorted(od_agg.items(), key=lambda x: x[1], reverse=True)
total_od = sum(od_agg.values())

with open("processed/top_od_lanes.csv","w",newline="",encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["rank","origin_region","destination_region","volume_ton",
                "lane_type","share_of_total"])
    for rank,(pair,vol) in enumerate(od_sorted[:30],1):
        o,d = pair
        ltype = "intra-region" if o==d else "inter-region"
        share = round(vol/total_od,4) if total_od else 0
        w.writerow([rank, o, d, round(vol,2), ltype, share])
print("✓ processed/top_od_lanes.csv")

# ── 8. Seasonal Index (6 months, normalized to ~1.0 mean) ─────────────────────
months_order = [12,1,2,3,4,5]
raw = [1.18, 1.42, 0.88, 1.02, 1.12, 1.18]
mean_raw = sum(raw)/len(raw)
norm = [round(v/mean_raw, 4) for v in raw]

with open("processed/seasonal_index.csv","w",newline="",encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["month","overall_index","Fresh_Food","FMCG_Packaged",
                "Industrial_Materials","Durables_Electronics","Ecommerce_Misc"])
    for mo,ov,ff in zip(months_order, norm, norm):
        # Other families are neutral for ABC (not their business)
        w.writerow([mo, ov, ff, 1.0, 1.0, 1.0, 1.0])
print("✓ processed/seasonal_index.csv")

# ── Summary ────────────────────────────────────────────────────────────────────
total_weight = sum(r["weight_tons"] for r in rows)
print(f"\n{'='*55}")
print(f"  Company ABC — Data Generation Complete")
print(f"  Period   : Dec 2025 – May 2026 (6 months)")
print(f"  Shipments: {len(rows)} transactions")
print(f"  Volume   : {total_weight:,.1f} tons total")
by_month = defaultdict(float)
for r in rows:
    by_month[r['shipment_date'][:7]] += r['weight_tons']
for ym in sorted(by_month):
    print(f"    {ym}: {by_month[ym]:>8,.1f} tons")
print(f"{'='*55}")
