"""
Generate mock_engine_output_abc.json — full contract v1.0 payload
built from Company ABC (fish & meat) shipping transaction data.
Run from:  data/company_ABC/
Output:    mock_engine_output_abc.json   (copy to backend/mocks/ to use in UI)
"""

import csv, json, sys, uuid
from collections import defaultdict
from datetime import datetime

sys.stdout.reconfigure(encoding="utf-8")

# ── helpers ───────────────────────────────────────────────────────────────────
def read_csv(path):
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))

def flt(v): return round(float(v), 2) if v not in ("", None) else 0.0

# ── load processed CSVs ───────────────────────────────────────────────────────
tx       = read_csv("shipping_transactions.csv")
reg_dem  = read_csv("processed/regional_demand.csv")
mon_dem  = read_csv("processed/monthly_demand_by_region.csv")
mon_prod = read_csv("processed/monthly_demand_by_region_product.csv")
od_mat   = read_csv("processed/od_matrix_17_region.csv")
top_od   = read_csv("processed/top_od_lanes.csv")
seas_idx = read_csv("processed/seasonal_index.csv")

MONTHS_LABEL = {12:"2025-12",1:"2026-01",2:"2026-02",3:"2026-03",4:"2026-04",5:"2026-05"}
REGIONS = ["Seoul","Busan","Daegu","Incheon","Gwangju","Daejeon","Ulsan",
           "Sejong","Gyeonggi","Gangwon","Chungbuk","Chungnam",
           "Jeonbuk","Jeonnam","Gyeongbuk","Gyeongnam","Jeju"]

REGION_COORDS = {
    "Seoul":    (37.5665, 126.9780), "Busan":    (35.1796, 129.0756),
    "Daegu":    (35.8714, 128.6014), "Incheon":  (37.4563, 126.7052),
    "Gwangju":  (35.1595, 126.8526), "Daejeon":  (36.3504, 127.3845),
    "Ulsan":    (35.5384, 129.3114), "Sejong":   (36.4800, 127.2890),
    "Gyeonggi": (37.4138, 127.5183), "Gangwon":  (37.8228, 128.1555),
    "Chungbuk": (36.6357, 127.4913), "Chungnam": (36.5184, 126.8000),
    "Jeonbuk":  (35.7175, 127.1530), "Jeonnam":  (34.8161, 126.4630),
    "Gyeongbuk":(36.4919, 128.8889), "Gyeongnam":(35.2374, 128.6922),
    "Jeju":     (33.4996, 126.5312),
}

total_weight = sum(flt(r["weight_tons"]) for r in tx)

# ── CANDIDATE HUBS (ABC-specific cold storage network) ───────────────────────
HUBS = [
    # Existing ABC warehouses
    {"hub_id":"ABC_BSN",  "hub_name":"ABC Busan Cold Storage",
     "region_id":"Busan",    "lat":35.1796,"lon":129.0756,
     "hub_type":"regional",  "area_m2":8000,
     "base_capacity":800,    "effective_capacity":680,
     "fixed_cost_usd_per_year":95000,  "is_existing":True},
    {"hub_id":"ABC_GG",   "hub_name":"ABC Gyeonggi Distribution Center",
     "region_id":"Gyeonggi", "lat":37.2636,"lon":127.0286,
     "hub_type":"regional",  "area_m2":6000,
     "base_capacity":600,    "effective_capacity":510,
     "fixed_cost_usd_per_year":78000,  "is_existing":True},
    # Candidate new hubs
    {"hub_id":"CAND_ICN", "hub_name":"Incheon Port Cold Hub",
     "region_id":"Incheon",  "lat":37.4563,"lon":126.7052,
     "hub_type":"crossdock", "area_m2":5000,
     "base_capacity":500,    "effective_capacity":425,
     "fixed_cost_usd_per_year":65000,  "is_existing":False},
    {"hub_id":"CAND_GJU", "hub_name":"Gwangju Fresh Hub",
     "region_id":"Gwangju",  "lat":35.1595,"lon":126.8526,
     "hub_type":"service_node","area_m2":3000,
     "base_capacity":300,    "effective_capacity":255,
     "fixed_cost_usd_per_year":38000,  "is_existing":False},
    {"hub_id":"CAND_DJN", "hub_name":"Daejeon Central Node",
     "region_id":"Daejeon",  "lat":36.3504,"lon":127.3845,
     "hub_type":"service_node","area_m2":2500,
     "base_capacity":250,    "effective_capacity":212,
     "fixed_cost_usd_per_year":32000,  "is_existing":False},
]

def hub_obj(h):
    return {
        "hub_id": h["hub_id"], "hub_name": h["hub_name"],
        "region_id": h["region_id"], "region_name": h["region_id"],
        "lat": h["lat"], "lon": h["lon"],
        "hub_type": h["hub_type"],
        "area_m2": h["area_m2"],
        "base_capacity": h["base_capacity"],
        "effective_capacity": h["effective_capacity"],
        "capacity_unit": "ton",
        "fixed_cost_usd_per_year": h["fixed_cost_usd_per_year"],
        "eligible_product_families": ["Fresh_Food"],
    }

# ── DEMAND: annual by region ──────────────────────────────────────────────────
inbound = defaultdict(float)
for r in tx:
    inbound[r["destination_region"]] += flt(r["weight_tons"])
total_inbound = sum(inbound.values())

annual_demand_by_region = []
for reg in REGIONS:
    vol = round(inbound.get(reg, 0), 2)
    annual_demand_by_region.append({
        "region_id": reg, "region_name": reg,
        "demand_weight_ton": vol, "unit": "ton",
        "share_pct": round(vol / total_inbound * 100, 2) if total_inbound else 0,
    })

# ── DEMAND: monthly by region × product ──────────────────────────────────────
monthly_rp = defaultdict(lambda: defaultdict(float))
for r in tx:
    ym = MONTHS_LABEL[int(r["shipment_date"][5:7])]
    monthly_rp[r["destination_region"]][ym] += flt(r["weight_tons"])

monthly_demand_by_region_product = []
for reg in REGIONS:
    for ym in sorted(MONTHS_LABEL.values()):
        monthly_demand_by_region_product.append({
            "region_id": reg, "region_name": reg,
            "product_family": "Fresh_Food", "month": ym,
            "volume": round(monthly_rp[reg].get(ym, 0), 2),
            "unit": "ton",
            "seasonal_index": round({
                "2025-12":1.08,"2026-01":1.31,"2026-02":0.81,
                "2026-03":0.94,"2026-04":1.03,"2026-05":1.08
            }[ym], 2),
        })

# ── TOP OD LANES ──────────────────────────────────────────────────────────────
top_od_lanes = []
for row in top_od[:20]:
    top_od_lanes.append({
        "rank": int(row["rank"]),
        "origin_region": row["origin_region"],
        "destination_region": row["destination_region"],
        "volume_ton": flt(row["volume_ton"]),
        "lane_type": row["lane_type"],
        "share_pct": round(flt(row["share_of_total"]) * 100, 2),
    })

# ── BASELINE NETWORK (current 2-hub ABC network) ──────────────────────────────
baseline_util = {
    "ABC_BSN": 112.5,   # overloaded — Jan peak exceeds cold storage cap
    "ABC_GG":  87.3,
}

# ── SCENARIOS ─────────────────────────────────────────────────────────────────
def transport_cost(scenario_hubs, vol, rate_per_ton=28.5):
    """Simple cost model: fixed + variable transport."""
    fixed = sum(h["fixed_cost_usd_per_year"] for h in scenario_hubs)
    variable = vol * rate_per_ton
    return round(fixed + variable, 2)

monthly_vol_map = defaultdict(float)
for r in tx:
    ym = MONTHS_LABEL[int(r["shipment_date"][5:7])]
    monthly_vol_map[ym] += flt(r["weight_tons"])
annualized_vol = round(total_weight * 2, 1)   # 6-month × 2 → annualized

S0_hubs = [HUBS[0], HUBS[1]]                               # baseline: 2 existing
S1_hubs = [HUBS[0], HUBS[1], HUBS[2]]                      # add Incheon
S2_hubs = [HUBS[0], HUBS[1], HUBS[3]]                      # add Gwangju
S3_hubs = [HUBS[0], HUBS[1], HUBS[2], HUBS[3]]             # balanced 4-hub
S4_hubs = [HUBS[0], HUBS[1], HUBS[2], HUBS[3], HUBS[4]]   # full 5-hub

def scenario(sid, name, stype, hubs, svc, cov, peak_util, risk, recommended, desc, interpret):
    return {
        "scenario_id": sid,
        "scenario_name": name,
        "scenario_type": stype,
        "model_used": "P-Median + Cost Optimizer",
        "description": desc,
        "selected_hubs": [h["hub_id"] for h in hubs],
        "cost_breakdown": {
            "fixed_cost": sum(h["fixed_cost_usd_per_year"] for h in hubs),
            "variable_transport_cost": round(annualized_vol * 28.5, 2),
            "handling_cost": round(annualized_vol * 4.2, 2),
            "cold_chain_surcharge": round(annualized_vol * 6.8, 2),
        },
        "total_cost": transport_cost(hubs, annualized_vol),
        "currency": "USD",
        "cost_index": round(transport_cost(hubs, annualized_vol) / transport_cost(S0_hubs, annualized_vol), 3),
        "service_level_pct": svc,
        "coverage_200km_pct": cov,
        "peak_utilization_pct": peak_util,
        "risk_score": {"Low":2,"Medium":4,"High":7,"Critical":9}[risk],
        "risk_level": risk,
        "recommended": recommended,
        "managerial_interpretation": interpret,
        "assignments": [
            {"region_name": reg, "hub_id": hubs[i % len(hubs)]["hub_id"],
             "product_family": "Fresh_Food",
             "volume_ton": round(inbound.get(reg, 0) * 2, 2),
             "allocation_share_pct": 100.0}
            for i, reg in enumerate(REGIONS)
        ],
    }

scenarios = [
    scenario("S0","Baseline (Current 2-Hub)","baseline",S0_hubs,
             72.4,61.2,112.5,"High",False,
             "Current 2-hub network: Busan + Gyeonggi. Severely overloaded at Busan during Seollal peak.",
             "Status quo is unsustainable. Busan hub exceeds cold storage capacity in January and April-May, causing SLA failures across southern Korea."),
    scenario("S1","Expand: Add Incheon Port Hub","cost_optimized",S1_hubs,
             81.5,72.8,89.3,"Medium",False,
             "3-hub config adding Incheon. Relieves import seafood pressure and covers Seoul metro better.",
             "Incheon hub absorbs imported seafood flows efficiently. Reduces long-haul Busan-Seoul lanes by ~28%. However, southern Korea (Gwangju, Jeonnam) remains underserved."),
    scenario("S2","Expand: Add Gwangju Southern Hub","service_optimized",S2_hubs,
             84.1,78.4,96.2,"Medium",False,
             "3-hub config adding Gwangju. Fixes southern coverage gap for Jeonnam/Jeonbuk supply lanes.",
             "Gwangju hub dramatically improves SLA for the southern supply corridor. Fresh seafood from Jeonnam reaches consumers 3.2 hours faster. Cost slightly higher than S1 due to lower Gwangju hub utilization."),
    scenario("S3","Balanced: 4-Hub Network","balanced",S3_hubs,
             91.8,88.6,74.1,"Low",True,
             "Recommended. Busan + Gyeonggi + Incheon + Gwangju. Optimal cost-service balance for cold chain.",
             "S3 achieves 91.8% SLA compliance — up from 72.4% baseline — while reducing peak utilization from 112.5% to 74.1% at Busan. Annual savings of $87K vs. baseline despite additional fixed costs, driven by shorter transport lanes and reduced spoilage losses."),
    scenario("S4","Maximum Coverage: 5-Hub Network","service_optimized",S4_hubs,
             96.3,94.1,61.8,"Low",False,
             "5-hub config adds Daejeon central node. Near-perfect SLA but highest fixed cost.",
             "S4 achieves best-in-class SLA at 96.3% but costs $32K/year more than S3 with marginal improvement. Daejeon hub is underutilized at ~45%. Recommended only if the enterprise targets premium express delivery positioning."),
]

# ── DIAGNOSIS ────────────────────────────────────────────────────────────────
diagnosis = {
    "overloaded_hubs": [
        {"hub_id":"ABC_BSN","utilization_pct":112.5,"severity":"Critical",
         "reason":"Seollal peak (Jan 2026) drives 1,896 tons inbound — 41% above cold storage capacity of 800 tons. Spoilage risk: HIGH."},
    ],
    "underused_hubs": [
        {"hub_id":"ABC_GG","utilization_pct":87.3,"severity":"Low",
         "reason":"Healthy utilization but will reach watchlist during simultaneous Seollal + spring peaks."},
    ],
    "poor_coverage_regions": [
        {"region_name":"Jeonnam","nearest_hub_id":"ABC_BSN","distance_km":198.4,
         "sla_violation_pct":38.2,"risk_level":"High"},
        {"region_name":"Gwangju","nearest_hub_id":"ABC_BSN","distance_km":174.6,
         "sla_violation_pct":31.5,"risk_level":"High"},
        {"region_name":"Jeonbuk","nearest_hub_id":"ABC_GG","distance_km":211.3,
         "sla_violation_pct":44.7,"risk_level":"Critical"},
        {"region_name":"Gangwon","nearest_hub_id":"ABC_GG","distance_km":122.4,
         "sla_violation_pct":18.3,"risk_level":"Medium"},
    ],
    "high_cost_lanes": [
        {"lane_id":"Busan-Seoul","origin_region":"Busan","destination_region":"Seoul",
         "distance_km":325.4,"cost_share_pct":18.2,"driver":"Long-haul cold chain surcharge",
         "recommended_action":"Reroute via Gyeonggi hub for final delivery"},
        {"lane_id":"Jeonnam-Seoul","origin_region":"Jeonnam","destination_region":"Seoul",
         "distance_km":289.7,"cost_share_pct":11.4,"driver":"Distance + no intermediate cold hub",
         "recommended_action":"Add Gwangju hub as intermediate consolidation point"},
        {"lane_id":"Gyeongbuk-Seoul","origin_region":"Gyeongbuk","destination_region":"Seoul",
         "distance_km":260.1,"cost_share_pct":8.7,"driver":"Low load factor (avg 14.2t/truck)",
         "recommended_action":"Consolidate with Daegu pickup to improve load factor"},
    ],
    "network_health_score": 58.3,
    "health_grade": "C",
    "summary": "ABC Corp's current 2-hub network is critically strained. The Busan cold storage hub operates at 112.5% peak utilization during Seollal, risking product spoilage and SLA failures across 4 regions. Southern Korea (Jeonbuk, Jeonnam, Gwangju) has SLA violation rates exceeding 30%. Immediate network expansion is required.",
}

# ── SEASONAL PLAYBOOK ─────────────────────────────────────────────────────────
seasonal_playbook = [
    {
        "event_id": "E1",
        "event_name": "M01_Fresh_Food_peak_window",
        "months": ["2026-01"],
        "affected_product_families": ["Fresh_Food"],
        "affected_hubs": ["ABC_BSN","ABC_GG"],
        "risk": "Busan hub overflow (112.5%) — fresh seafood spoilage risk during Seollal (Jan 28-30 2026). Peak demand 1,896 tons vs. 800-ton cold storage capacity.",
        "recommended_actions": [
            "Pre-position 35% of Fresh_Food inventory at Gyeonggi hub 10 days before Seollal",
            "Activate temporary cold-storage 3PL at Busan (Shinsegae Logistics, +400 tons) from Jan 15",
            "Freeze Busan hub inbound at 85% capacity; reroute overflow to Gyeonggi",
            "Deploy 6 additional refrigerated trucks on Busan-Seoul corridor from Jan 20-Feb 5",
        ],
        "de_escalation_rule": "When Busan utilization drops below 70% for 5 consecutive days post-Seollal, terminate 3PL contract and release temporary trucks.",
        "kpi_targets": {"sla_success_rate_pct": 88.0, "spoilage_rate_pct_max": 1.5},
    },
    {
        "event_id": "E2",
        "event_name": "M05_Fresh_Food_peak_window",
        "months": ["2026-05"],
        "affected_product_families": ["Fresh_Food"],
        "affected_hubs": ["ABC_BSN","ABC_GG"],
        "risk": "Parents' Day (May 8) and Children's Day (May 5) drive 18% demand surge for premium seafood and meat gift sets. Gyeonggi hub approaches 95% utilization.",
        "recommended_actions": [
            "Pre-stock gift-set SKUs (premium seafood, wagyu cuts) at Gyeonggi hub 2 weeks ahead",
            "Partner with Coupang Fulfillment for e-commerce overflow in Seoul/Incheon",
            "Add Saturday operations (normally off) for May 3-10 at both hubs",
        ],
        "de_escalation_rule": "Resume standard Mon-Fri operations from May 12. Review gift-set inventory levels; mark down slow SKUs after May 15.",
        "kpi_targets": {"sla_success_rate_pct": 90.0, "spoilage_rate_pct_max": 2.0},
    },
]

# ── BUSINESS CASE ─────────────────────────────────────────────────────────────
# S0 baseline: long-haul routes, $34/ton (no intermediate hubs → longer distances)
# S3 optimized: shorter routes to 4 nearby hubs, $22/ton blended rate
baseline_cost = transport_cost(S0_hubs, annualized_vol, rate_per_ton=34.0)
s3_cost       = transport_cost(S3_hubs, annualized_vol, rate_per_ton=22.0)

SPOILAGE_SAVING     = 112000   # avoided spoilage losses (Busan overflow → 3.2% → 0.9%)
SLA_PENALTY_SAVING  = 34500    # avoided late-delivery penalties
ADDITIONAL_FIXED    = HUBS[2]["fixed_cost_usd_per_year"] + HUBS[3]["fixed_cost_usd_per_year"]
transport_saving    = round(baseline_cost - s3_cost, 2)
gross_saving        = transport_saving + SPOILAGE_SAVING + SLA_PENALTY_SAVING
net_saving          = round(gross_saving - ADDITIONAL_FIXED, 2)
bc_ratio            = round(gross_saving / ADDITIONAL_FIXED, 2)
payback             = round(ADDITIONAL_FIXED / (net_saving / 12), 1)

business_case = {
    "baseline_scenario_id": "S0",
    "recommended_scenario_id": "S3",
    "currency": "USD",
    "baseline_total_cost": baseline_cost,
    "recommended_total_cost": s3_cost,
    "annual_saving": net_saving,
    "saving_pct": round(net_saving / baseline_cost * 100, 2),
    "saving_breakdown": {
        "transport_cost_reduction": transport_saving,
        "spoilage_loss_avoidance": SPOILAGE_SAVING,
        "sla_penalty_avoidance": SLA_PENALTY_SAVING,
        "additional_fixed_cost": -ADDITIONAL_FIXED,
    },
    "additional_fixed_cost": ADDITIONAL_FIXED,
    "payback_months": payback,
    "service_level_improvement_pct_point": round(91.8 - 72.4, 1),
    "risk_reduction_summary": "Eliminates Busan cold-storage overflow risk (Critical→Low). Reduces southern-Korea SLA violations from avg 38.6% to under 8%. Fresh-food spoilage rate projected to drop from 3.2% to 0.9%.",
    "executive_summary": f"ABC Corp's 2-hub network loses an estimated $146,500/year in spoilage costs and SLA penalties. Expanding to a 4-hub cold chain (S3: Busan + Gyeonggi + Incheon + Gwangju) generates ${net_saving:,.0f} in net annual savings — a payback period of {payback} months. SLA compliance improves from 72.4% to 91.8%, directly reducing customer churn risk. Recommendation: Execute Immediately (B/C ratio: {bc_ratio}).",
    "bc_ratio": bc_ratio,
    "recommendation_tier": "Execute Immediately" if bc_ratio > 2.5 else "Phased Pilot",
}

# ── ROADMAP ───────────────────────────────────────────────────────────────────
roadmap = [
    {"phase_id":"P1","phase_name":"Stabilize Busan Hub",
     "timeline":"Month 1-2 (Jun-Jul 2026)",
     "actions":["Sign emergency 3PL cold-storage contract at Busan (+400 tons)",
                "Implement hub-capacity alert dashboard (alert at 85%)",
                "Retrain dispatch team on overflow routing protocols"],
     "owner":"Operations + Logistics Manager",
     "expected_impact":"Eliminate Critical overload risk before next peak. Busan utilization capped at 85%."},
    {"phase_id":"P2","phase_name":"Incheon Hub Setup",
     "timeline":"Month 2-4 (Jul-Sep 2026)",
     "actions":["Sign 3-year lease at Incheon Port cold facility (CAND_ICN)",
                "Install blast-freezer units for imported seafood (budget: $28K)",
                "Migrate import-seafood flows (Incheon→Seoul, Incheon→Gyeonggi) to new hub",
                "Integrate WMS with existing Gyeonggi hub system"],
     "owner":"Engineering + Procurement",
     "expected_impact":"Import seafood SLA from 71% to 94%. Gyeonggi hub load reduced by 22%."},
    {"phase_id":"P3","phase_name":"Gwangju Southern Hub Activation",
     "timeline":"Month 4-6 (Sep-Nov 2026)",
     "actions":["Sign lease at Gwangju Fresh Hub (CAND_GJU)",
                "Establish daily Jeonnam→Gwangju milk-run (6am departure)",
                "Onboard 2 regional sales teams for Jeonbuk/Jeonnam markets",
                "Pilot cross-docking with Jeonbuk meat suppliers"],
     "owner":"Regional Sales + Operations",
     "expected_impact":"Southern-Korea SLA violation drops from 38% to <8%. New market revenue: est. $95K/year."},
    {"phase_id":"P4","phase_name":"Full Network Optimization",
     "timeline":"Month 7-12 (Dec 2026 - May 2027)",
     "actions":["Run quarterly LogiHub re-analysis with updated transaction data",
                "Implement dynamic routing between all 4 hubs based on real-time utilization",
                "Negotiate volume discounts with refrigerated trucking partners (target -8% rate)",
                "Prepare for Chuseok 2027 peak with full 4-hub capacity playbook"],
     "owner":"Supply Chain Director",
     "expected_impact":"Achieve 91.8%+ SLA sustained. Full $savings realized. Network stress-test resilience: 94/100."},
]

# ── RECOMMENDED NETWORK ───────────────────────────────────────────────────────
recommended_network = {
    "recommended_scenario_id": "S3",
    "recommendation_summary": "Expand from 2 to 4 cold-chain hubs to eliminate Busan overflow and fix southern-Korea SLA gaps.",
    "recommended_hubs": [
        {"hub_id":"ABC_BSN","hub_name":"ABC Busan Cold Storage",
         "region_name":"Busan","role":"regional_hub","lat":35.1796,"lon":129.0756,
         "served_regions":["Busan","Gyeongnam","Ulsan","Gyeongbuk"],
         "served_product_families":["Fresh_Food"],
         "reason_selected":"Primary seafood supply hub. Must be retained and capacity-managed."},
        {"hub_id":"ABC_GG","hub_name":"ABC Gyeonggi Distribution Center",
         "region_name":"Gyeonggi","role":"metro_fulfillment","lat":37.2636,"lon":127.0286,
         "served_regions":["Seoul","Gyeonggi","Incheon","Daejeon","Chungnam","Gangwon"],
         "served_product_families":["Fresh_Food"],
         "reason_selected":"Central distribution hub for the Seoul metro corridor — highest demand density."},
        {"hub_id":"CAND_ICN","hub_name":"Incheon Port Cold Hub",
         "region_name":"Incheon","role":"crossdock","lat":37.4563,"lon":126.7052,
         "served_regions":["Incheon","Seoul"],
         "served_product_families":["Fresh_Food"],
         "reason_selected":"Captures imported seafood at port-of-entry, eliminating long-haul cold chain from Busan for imports."},
        {"hub_id":"CAND_GJU","hub_name":"Gwangju Fresh Hub",
         "region_name":"Gwangju","role":"service_node","lat":35.1595,"lon":126.8526,
         "served_regions":["Gwangju","Jeonnam","Jeonbuk"],
         "served_product_families":["Fresh_Food"],
         "reason_selected":"Fixes the critical southern-Korea coverage gap. 3 regions currently at >30% SLA violation."},
    ],
    "why_this_scenario": "S3 is the only scenario that simultaneously resolves Busan overflow (Critical risk), closes the southern-Korea coverage gap (High risk), and achieves positive ROI within 9 months.",
    "why_not_other_scenarios": [
        "S0 (baseline): Busan overload is unsustainable — Critical spoilage risk each Jan and May peak.",
        "S1 (Incheon only): Fixes import flows but leaves Jeonnam/Jeonbuk at >40% SLA violation.",
        "S2 (Gwangju only): Fixes southern gap but Incheon import flows remain inefficient.",
        "S4 (5-hub): Marginal SLA gain of +4.5% over S3 at $32K/yr additional cost — B/C ratio < 1.5.",
    ],
}

# ── ALLOCATION (FLOWS) ────────────────────────────────────────────────────────
allocation = []
hub_for_region = {
    "Seoul":"ABC_GG","Busan":"ABC_BSN","Daegu":"ABC_BSN","Incheon":"CAND_ICN",
    "Gwangju":"CAND_GJU","Daejeon":"ABC_GG","Ulsan":"ABC_BSN","Sejong":"ABC_GG",
    "Gyeonggi":"ABC_GG","Gangwon":"ABC_GG","Chungbuk":"ABC_GG","Chungnam":"ABC_GG",
    "Jeonbuk":"CAND_GJU","Jeonnam":"CAND_GJU","Gyeongbuk":"ABC_BSN",
    "Gyeongnam":"ABC_BSN","Jeju":"ABC_BSN",
}
for reg in REGIONS:
    vol = round(inbound.get(reg, 0) * 2, 2)
    allocation.append({
        "scenario_id":"S3","region_name":reg,
        "hub_id": hub_for_region.get(reg,"ABC_GG"),
        "product_family":"Fresh_Food",
        "volume":vol,"unit":"ton","allocation_share_pct":100.0,
    })

# ── ASSEMBLE FULL CONTRACT ────────────────────────────────────────────────────
output = {
    "contract_version": "v1.0-locked",
    "run_info": {
        "scenario_run_id": f"run_abc_{uuid.uuid4().hex[:8]}",
        "run_uuid": str(uuid.uuid4()),
        "engine_version": "v2.0-proxy",
        "run_mode": "mock",
        "created_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "created_by": "generate_abc_engine_output.py",
        "execution_time_ms": 4821.3,
        "status": "success",
    },
    "proxy_scope": {
        "is_proxy": True,
        "data_source_type": "enterprise_sample",
        "data_sources": [{"source_id":"ABC_TX_2025H2","source_name":"ABC Corp Shipping Transactions Dec 2025 – May 2026","source_type":"enterprise_sample","role_in_engine":"Demand volumes"}],
        "geographic_scope": "South Korea (17 regions)",
        "analysis_period": "2025-12 to 2026-05",
        "target_company_context": "ABC Food Logistics Co., Ltd. — Fresh seafood & meat distributor",
        "disclaimer": "This analysis is automatically generated by LogiHub Engine v1.0 running on ABC Corp enterprise sample data. The analytical framework and optimization logic are of production-grade quality. All absolute figures are for demonstration purposes only.",
    },
    "input_data_summary": {
        "total_rows_ingested": len(tx),
        "total_rows_processed": len(tx),
        "total_volume_processed": round(total_weight, 2),
        "volume_unit": "ton",
        "date_range": {"start": "2025-12-01", "end": "2026-05-31"},
        "records_by_input": [{"dataset_name":"ABC Shipping Transactions","rows_ingested":len(tx),"rows_processed":len(tx)}],
        "unit_standardization": {"standard_unit":"ton","conversion_notes":[]},
    },
    "data_quality_report": {
        "usable_rate": 1.0, "quality_level": "High",
        "missing_fields": [], "imputed_fields": [],
        "missing_origin_count": 0, "missing_destination_count": 0,
        "missing_volume_count": 0, "invalid_region_count": 0,
        "duplicate_records_count": 0, "geocode_success_rate": 1.0,
        "warnings": [],
    },
    "master_data": {
        "regions": [
            {"region_id":r,"region_name":r,"country":"KR","level":"si_do",
             "lat":REGION_COORDS[r][0],"lon":REGION_COORDS[r][1]}
            for r in REGIONS
        ],
        "product_families": [
            {"product_family":"Fresh_Food","product_family_name":"Fresh Food (Seafood & Meat)",
             "description":"Fresh and frozen seafood, fresh meat, processed meat products requiring cold chain",
             "default_sla_radius_km":120,"default_unit":"ton"},
        ],
        "candidate_hubs": [hub_obj(h) for h in HUBS],
    },
    "demand": {
        "total_annual_volume": annualized_vol,
        "volume_unit": "ton",
        "annual_demand_by_region": annual_demand_by_region,
        "monthly_demand_by_region_product": monthly_demand_by_region_product,
        "top_od_lanes": top_od_lanes,
    },
    "diagnosis": diagnosis,
    "scenarios": scenarios,
    "recommended_network": recommended_network,
    "allocation": allocation,
    "seasonal_playbook": seasonal_playbook,
    "business_case": business_case,
    "roadmap": roadmap,
    "warnings": [],
    "errors": [],
}

# ── WRITE OUTPUT ──────────────────────────────────────────────────────────────
out_path = "mock_engine_output_abc.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

size_kb = round(len(json.dumps(output)) / 1024, 1)
print(f"[OK] {out_path}  ({size_kb} KB)")
print(f"     Transactions : {len(tx)} rows  /  {round(total_weight,1)} tons (6-month)")
print(f"     Annualized   : {annualized_vol} tons/year")
print(f"     Scenarios    : {len(scenarios)} (S0-S4)")
print(f"     Recommended  : S3 — 4-Hub Cold Chain Network")
print(f"     Annual saving: ${business_case['annual_saving']:,.0f}  (B/C {business_case['bc_ratio']})")
print(f"     Payback      : {business_case['payback_months']} months")
print()
print("Next step: copy to frontend data folder or backend/mocks/")
print("  copy mock_engine_output_abc.json ..\\..\\logihub_application_code\\backend\\mocks\\mock_engine_output_abc.json")
