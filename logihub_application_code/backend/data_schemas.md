# LogiHub — Intermediate Data Schemas (X2)

> **Purpose.** Lock the schema for every intermediate data table that flows between Engine A (Data & Demand) → Engine B (Cost & Optimization) → Engine C (Diagnosis & Outcome) and the Frontend.
>
> This document is 1-to-1 aligned with `engine_contract.schema.json` v1.0-locked and the existing mock dataset under `backend/mocks/`.
>
> **Version:** v1.0-locked &middot; **Locked on:** 2026-05-13 &middot; **Audience:** Person A / B / C / UI / PM
>
> ⚠️ Any schema change (column rename, add/remove column, dtype change) must bump the version (`v1.x`) and update both this file and `engine_contract.schema.json`.

---

## 1. Conventions

| Item | Convention |
|---|---|
| Encoding | UTF-8, with header row, comma-separated (CSV) |
| Default volume unit | `ton` (see `unit` enum below) |
| Default currency | `USD` (see `currency` enum) |
| Month format | `YYYY-MM` (e.g. `2023-11`) |
| Decimals | Minimum 2 digits, `.` as decimal separator |
| Missing values | Blank or `null` — **never** use `NA`, `-`, or `0` |
| Region naming | Use `regionName` enum (see §1.1) |
| Hub ID | Pattern `[A-Z]{2}_[A-Z0-9]+`, e.g. `GG_METRO`, `BS_PORT` |
| Scenario ID | Pattern `^S[0-8]$`, e.g. `S0`, `S3` |

### 1.1 Shared enums

| Enum | Allowed values |
|---|---|
| `regionName` (17) | `Seoul`, `Busan`, `Daegu`, `Incheon`, `Gwangju`, `Daejeon`, `Ulsan`, `Sejong`, `Gyeonggi`, `Gangwon`, `Chungbuk`, `Chungnam`, `Jeonbuk`, `Jeonnam`, `Gyeongbuk`, `Gyeongnam`, `Jeju` (+ `Unknown`) |
| `productFamily` (7) | `mobile_launch`, `bulky_appliance`, `high_value_secure`, `finished_goods`, `spare_parts`, `ecommerce_small`, `general_cargo` |
| `unit` | `ton`, `kg`, `pallet`, `unit`, `shipment`, `carton`, `cbm`, `index` |
| `currency` | `USD`, `KRW`, `VND`, `EUR`, `JPY` |
| `riskLevel` | `Low`, `Medium`, `High`, `Critical` |
| `hubStatus` | `underused`, `healthy`, `watchlist`, `seasonal_watch`, `overload`, `critical`, `crisis` |
| `hubRole` | `metro_fulfillment`, `secure_node`, `central_balancing`, `launch_hub`, `bulky_appliance`, `southern_port`, `regional_hub`, `service_node`, `crossdock`, `overflow` |

---

## 2. Data flow diagram

```
raw_data/                 (Korean OD raw data)
   │
   ▼
[Engine A]  ── clean_od.csv / region_master ──┐
   │                                          │
   ├─► regional_demand.csv                    │
   ├─► monthly_demand_by_region.csv           │
   ├─► monthly_demand_by_region_product.csv ──┤
   ├─► top_od_lanes.csv                       │
   └─► od_matrix_17_region.csv ───────────────┤
                                              ▼
                                          [Engine B] ── cost / capacity / scenarios
                                              │
                                              ▼
                                          [Engine C] ── diagnosis / roles / playbook
                                              │
                                              ▼
                                          engine_output.json (contract v1.0)
                                              │
                                              ▼
                                          [Frontend / Outcome / Report]
```

---

## 3. GROUP A — Data & Demand (6 tables)

> Output of Engine A. Mandatory input for Engine B (cost) and Engine C (segmentation).
> Mock location: `backend/mocks/group_A_data/`

### A.0 `region_master.csv` — 17-region master table

| Column | dtype | Required | Enum / Constraint | Description |
|---|---|---|---|---|
| `region_id` | string | ✓ | – | Region ID (matches `region_name`) |
| `region_name` | string | ✓ | `regionName` | Region name |
| `country` | string | ✓ | `KR` only (v1.0) | ISO country code |
| `level` | string | ✓ | `si_do`, `si_gun_gu`, `custom_zone` | Administrative level |
| `lat` | float | ✓ | -90 to 90 | Latitude (centroid) |
| `lon` | float | ✓ | -180 to 180 | Longitude (centroid) |

**Example row:** `Seoul,Seoul,KR,si_do,37.5665,126.9780`

**Constraints:** exactly 17 rows for the v1.0 Korean proxy scope. Unique on `region_id`.

---

### A.1 `regional_demand.csv` — Annual demand by region

| Column | dtype | Required | Enum / Constraint | Description |
|---|---|---|---|---|
| `region_id` | string | ✓ | – | Region ID (currently mirrors `region_name`) |
| `region_name` | string | ✓ | `regionName` | Region name (17 regions + Unknown) |
| `volume` | float ≥ 0 | ✓ | – | Total annual volume |
| `unit` | string | ✓ | `unit` enum | Unit, default `ton` |
| `share_pct` | float | ✓ | 0–100 | Share %, total across 17 regions ≈ 100 |

**Example row:** `Seoul,Seoul,2185.43,ton,4.96`

**Constraints:** unique on `region_id`. Sum of `share_pct` must lie in [99.5, 100.5].

---

### A.2 `monthly_demand_by_region.csv` — Monthly demand by region

| Column | dtype | Required | Enum / Constraint | Description |
|---|---|---|---|---|
| `region_id` | string | ✓ | – | Region ID |
| `region_name` | string | ✓ | `regionName` | Region name |
| `month` | string | ✓ | regex `^[0-9]{4}-[0-9]{2}$` | Month `YYYY-MM` |
| `volume` | float ≥ 0 | ✓ | – | Monthly volume |
| `unit` | string | ✓ | `unit` enum | Default `ton` |

**Example row:** `Seoul,Seoul,2023-01,286.14,ton`

**Constraints:** unique on (`region_id`, `month`). 17 regions × 12 months = max 204 rows/year.

---

### A.3 `monthly_demand_by_region_product.csv` — Monthly demand by region × product

| Column | dtype | Required | Enum / Constraint | Description |
|---|---|---|---|---|
| `region_id` | string | ✓ | – | Region ID |
| `region_name` | string | ✓ | `regionName` | Region name |
| `product_family` | string | ✓ | `productFamily` | One of 7 product families |
| `month` | string | ✓ | `YYYY-MM` | Month |
| `volume` | float ≥ 0 | ✓ | – | Volume |
| `unit` | string | ✓ | `unit` enum | Default `ton` |
| `seasonal_index` | float ≥ 0 | ✓ | typically 0–2 | Seasonality index (1.0 = average) |

**Example row:** `Seoul,Seoul,mobile_launch,2023-01,58.83,ton,1.16`

**Constraints:** unique on (`region_id`, `product_family`, `month`).

---

### A.4 `top_od_lanes.csv` — Top O/D lanes by volume

| Column | dtype | Required | Enum / Constraint | Description |
|---|---|---|---|---|
| `origin_region` | string | ✓ | `regionName` | Origin region |
| `destination_region` | string | ✓ | `regionName` | Destination region |
| `product_family` | string |   | `productFamily` | May be null if aggregated |
| `volume` | float ≥ 0 | ✓ | – | Annual volume |
| `unit` | string | ✓ | `unit` enum | Default `ton` |
| `share_pct` | float | ✓ | 0–100 | Share %, sorted descending |

**Example row:** `Seoul,Daejeon,finished_goods,1309.67,ton,4.95`

**Constraints:** sorted by `volume` descending. Recommended to keep top 20–50 lanes.

---

### A.5 `od_matrix_17_region.csv` — 17×17 O/D matrix (long format)

| Column | dtype | Required | Enum / Constraint | Description |
|---|---|---|---|---|
| `origin` | string | ✓ | `regionName` | Origin region |
| `destination` | string | ✓ | `regionName` | Destination region |
| `flow_tons` | float ≥ 0 | ✓ | – | Annual flow (tons) |

**Example row:** `Seoul,Busan,366.17`

**Constraints:** unique on (`origin`, `destination`). Max 17 × 17 = 289 rows (zeros allowed).

---

## 4. GROUP B — Cost & Optimization (13 tables)

> Output of Engine B. Feeds the optimization solver and powers the frontend scenario comparison.
> Mock location: `backend/mocks/group_B_data/`

### B.0a `distance_matrix.csv` — 17×17 hub/region distance matrix (long format)

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `origin` | string | ✓ | `regionName` | Origin region |
| `destination` | string | ✓ | `regionName` | Destination region |
| `distance_km` | float ≥ 0 | ✓ | – | Road / haversine distance |

**Example row:** `Seoul,Busan,325.4`

**Constraints:** unique on (`origin`, `destination`). Diagonal (same region) should be 0. Max 17 × 17 = 289 rows.

**Source:** B1 deliverable (haversine on `region_master.lat/lon` for proxy mode; road API for production).

---

### B.0b `candidate_hubs.csv` — Candidate hub master data

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `hub_id` | string | ✓ | regex `^[A-Z]{2}_[A-Z0-9]+$` | Hub ID |
| `hub_name` | string | ✓ | – | Display name |
| `region_id` | string | ✓ | – | Region ID where hub sits |
| `region_name` | string | ✓ | `regionName` | Region name |
| `lat` | float | ✓ | -90 to 90 | Latitude |
| `lon` | float | ✓ | -180 to 180 | Longitude |
| `hub_type` | string | ✓ | `metro`, `regional`, `launch`, `secure`, `service_node`, `crossdock`, `port`, `overflow` | Hub typology |
| `area_m2` | float ≥ 0 |   | – | Floor area |
| `base_capacity` | float ≥ 0 | ✓ | – | Nominal capacity (tons) |
| `effective_capacity` | float ≥ 0 |   | typ. 85% of base | After scaling factor |
| `capacity_unit` | string | ✓ | `unit` enum | Usually `ton` |
| `fixed_cost_usd_per_year` | float ≥ 0 | ✓ | – | Annual fixed cost |
| `eligible_product_families` | string | ✓ | pipe-separated `productFamily` values | What this hub can handle |

**Example row:** `GG_METRO,Gyeonggi Metro Fulfillment,Gyeonggi,Gyeonggi,37.4138,127.5183,metro,45000,15000,12750,ton,198551.20,mobile_launch|ecommerce_small|finished_goods`

**Constraints:** unique on `hub_id`. `eligible_product_families` uses `|` as separator (CSV-safe).

---

### B.1 `transport_cost_by_lane.csv` — Transport cost

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `lane_id` | string | ✓ | format `<Origin>-<Destination>` | Lane ID |
| `origin` | string | ✓ | `regionName` | Origin region |
| `destination` | string | ✓ | `regionName` | Destination region |
| `cost_per_ton_km` | float ≥ 0 | ✓ | – | Rate (USD per ton-km) |
| `distance_km` | float ≥ 0 | ✓ | – | Distance |

**Example row:** `Seoul-Daejeon,Seoul,Daejeon,0.15,197.62`

---

### B.2 `warehouse_fixed_cost_by_hub.csv` — Warehouse fixed cost

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `hub_id` | string | ✓ | regex `^[A-Z]{2}_[A-Z0-9]+$` | Hub ID |
| `fixed_cost_usd_per_year` | float ≥ 0 | ✓ | – | Annual fixed cost |
| `capacity_tons` | float ≥ 0 | ✓ | – | Nominal capacity (tons) |

**Example row:** `GG_METRO,198551.2,10009.5`

---

### B.3 `handling_cost_by_product_hub.csv` — Handling cost per hub × product

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `hub_id` | string | ✓ | – | Hub ID |
| `product_family` | string | ✓ | `productFamily` | Product family |
| `cost_per_ton` | float ≥ 0 | ✓ | – | Handling cost (USD/ton) |

**Example row:** `GG_METRO,mobile_launch,9.08`

---

### B.4 `inventory_holding_cost_by_month.csv` — Inventory holding cost

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `month` | string | ✓ | `YYYY-MM` | Month |
| `product_family` | string | ✓ | `productFamily` | Product family |
| `holding_cost` | float ≥ 0 | ✓ | – | USD per ton per month |

**Example row:** `2023-01,mobile_launch,48.26`

---

### B.5 `seasonal_flex_cost.csv` — Seasonal flex cost

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `hub_id` | string | ✓ | – | Hub ID |
| `month` | string | ✓ | `YYYY-MM` | Peak month |
| `flex_cost_usd` | float ≥ 0 | ✓ | – | Flex capacity cost (USD) |

**Example row:** `GG_METRO,2023-11,8949.21`

---

### B.6 `sla_penalty_by_lane.csv` — SLA breach penalty

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `lane_id` | string | ✓ | – | Lane ID |
| `penalty_usd` | float ≥ 0 | ✓ | – | Penalty per breach (USD) |

**Example row:** `Seoul-Incheon,212.56`

---

### B.7 `utilization_by_hub_month.csv` — Hub utilization by month

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `scenario_id` | string | ✓ | `^S[0-8]$` | Scenario |
| `hub_id` | string | ✓ | – | Hub ID |
| `month` | string | ✓ | `YYYY-MM` | Month |
| `assigned_volume` | float ≥ 0 | ✓ | – | Allocated volume |
| `effective_capacity` | float ≥ 0 | ✓ | – | Effective capacity (after scaling) |
| `utilization_pct` | float ≥ 0 | ✓ | usually 0–150 | Utilization % |
| `status` | string | ✓ | `hubStatus` | Hub status for the month |

**Example row:** `S3,GG_METRO,2023-01,12000,15000,80.0,healthy`

---

### B.8 `capacity_gap_by_peak_period.csv` — Capacity gap at peak

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `scenario_id` | string | ✓ | `^S[0-8]$` | Scenario |
| `hub_id` | string | ✓ | – | Hub ID |
| `peak_month` | string | ✓ | `YYYY-MM` | Peak month |
| `capacity_gap` | float ≥ 0 | ✓ | – | Shortfall (tons) |
| `recommended_action` | string | ✓ | text | Recommended mitigation |

**Example row:** `S3,GG_METRO,2023-11,2000,Add 3PL`

---

### B.9 `selected_hubs_by_scenario.csv` — Selected hubs per scenario

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `scenario_id` | string | ✓ | `^S[0-8]$` | Scenario |
| `hub_id` | string | ✓ | – | Selected hub ID |

**Example row:** `S0,GG_METRO`

**Constraints:** unique on (`scenario_id`, `hub_id`).

---

### B.10 `scenario_comparison.csv` — Scenario comparison

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `scenario_id` | string | ✓ | `^S[0-8]$` | Scenario |
| `scenario_name` | string | ✓ | – | Display name |
| `total_cost` | float ≥ 0 | ✓ | – | Total cost (USD) |
| `service_level_pct` | float | ✓ | 0–100 | Service level % |

**Example row:** `S0,Scenario S0,4845261.15,91.52`

**Recommended extension (v1.1):** add `cost_index`, `coverage_200km_pct`, `peak_utilization_pct`, `risk_level`, `recommended` (bool) to fully match the `scenario` definition in the contract.

---

### B.11 `region_to_hub_allocation_by_product.csv` — Region → hub allocation by product

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `scenario_id` | string | ✓ | `^S[0-8]$` | Scenario |
| `region_name` | string | ✓ | `regionName` | Region served |
| `hub_id` | string | ✓ | – | Hub serving this region |
| `product_family` | string | ✓ | `productFamily` | Product family |
| `volume` | float ≥ 0 | ✓ | – | Allocated volume |
| `unit` | string | ✓ | `unit` enum | Default `ton` |
| `allocation_share_pct` | float | ✓ | 0–100 | Allocation share % |

**Example row:** `S3,Seoul,GW_BULKY,mobile_launch,100,ton,100.0`

**Constraints:** for the same (`scenario_id`, `region_name`, `product_family`), the sum of `allocation_share_pct` ≈ 100.

---

## 5. GROUP C — Diagnosis & Outcome (12 tables)

> Output of Engine C. Powers outcome doc, business case, and frontend.
> Mock location: `backend/mocks/group_C_data/`

### C.1 `current_network_health.csv` — Current network health

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `hub_id` | string | ✓ | – | Hub ID |
| `status` | string | ✓ | `hubStatus` | Status |
| `utilization_pct` | float ≥ 0 | ✓ | – | Utilization % |

**Example row:** `GG_METRO,overload,110.5`

---

### C.2 `high_cost_lanes.csv` — High-cost lanes

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `lane_id` | string | ✓ | – | Lane ID |
| `cost` | float ≥ 0 | ✓ | – | Cost (USD) |
| `driver` | string | ✓ | text | Primary driver (e.g. `Distance`, `Volume spike`) |

**Example row:** `Seoul-Busan,50000,Distance`

**Recommended extension (v1.1):** add `origin_region`, `destination_region`, `distance_km`, `cost_share_pct`, `recommended_action` to match `highCostLane` in the contract.

---

### C.2b `underused_hubs.csv` — Under-utilized hubs

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `hub_id` | string | ✓ | – | Hub ID |
| `utilization_pct` | float ≥ 0 | ✓ | usually <60 | Utilization % |
| `severity` | string | ✓ | `riskLevel` | Severity tag |
| `reason` | string | ✓ | text | Why under-used (operations note) |

**Example row:** `US_CROSSDOCK,38.2,Low,Underutilized — limited adoption since opening`

---

### C.2c `poor_coverage_regions.csv` — Regions with poor SLA coverage

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `region_name` | string | ✓ | `regionName` | Region with coverage issue |
| `nearest_hub_id` | string | ✓ | – | Closest serving hub |
| `distance_km` | float ≥ 0 | ✓ | – | Distance to nearest hub |
| `sla_violation_pct` | float | ✓ | 0–100 | SLA breach rate (%) |
| `risk_level` | string | ✓ | `riskLevel` | Risk tag |

**Example row:** `Jeju,BS_PORT,310.0,42.5,High`

---

### C.3 `overloaded_hubs.csv` — Overloaded hubs

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `hub_id` | string | ✓ | – | Hub ID |
| `utilization_pct` | float ≥ 0 | ✓ | – | Utilization (>100 = overload) |
| `severity` | string | ✓ | `riskLevel` | Severity level |
| `reason` | string | ✓ | text | Short reason |

**Example row:** `GG_METRO,110.5,High,Metro demand spike`

---

### C.4 `hub_role_assignment.csv` — Hub role assignment

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `hub_id` | string | ✓ | – | Hub ID |
| `role` | string | ✓ | `hubRole` | One of 10 roles (see §1.1) |

**Example row:** `GG_METRO,metro_fulfillment`

**Constraints:** each hub has exactly 1 role per scenario. Roles `crossdock` and `overflow` are optional.

---

### C.5 `recommended_network.csv` — Recommended network

| Column | dtype | Required | Constraint | Description |
|---|---|---|---|---|
| `scenario_id` | string | ✓ | `^S[0-8]$` | Recommended scenario |
| `hub_id` | string | ✓ | – | Hub in the recommended network |
| `status` | string | ✓ | `hubStatus` | Expected status |

**Example row:** `S3,GG_METRO,healthy`

---

### C.6 `classifier_rules.json` — Product classifier rules (7 rules)

```json
{
  "rules": [
    {
      "region": "Seoul",            // string, optional, regionName enum
      "family": "mobile_launch",    // string, required, productFamily enum
      "confidence": 0.9             // float, required, range 0-1
    }
  ]
}
```

**Constraints:**
- `rules` is an array, **exactly 7 entries** (per task C1).
- Each rule has `family` (required) and `confidence` ∈ [0, 1].
- Optional fields (for v1.1 extension): `region`, `min_volume`, `value_tier`, `temp_zone`, `fragility`.

---

### C.7 `seasonal_playbook.json` — Seasonal playbook

```json
[
  {
    "event_id": "E1",                                 // string, required, regex ^E[0-9]+$
    "event_name": "M02-M03_mobile_launch_peak_window",// string, required, data-driven (NO brand/industry tokens)
    "months": ["2023-02", "2023-03"],                 // array<string YYYY-MM>, required
    "affected_product_families": ["mobile_launch"],   // array<productFamily>, required
    "affected_hubs": ["GG_METRO", "IC_AIRPORT"],      // array<hub_id>, required
    "risk": "Capacity overflow at affected hubs during M02-M03 high-velocity launch wave",
    "recommended_actions": [                          // array<string>, required
      "Pre-position 30% inventory 2 weeks early",
      "Activate flex capacity at affected hubs"
    ]
  }
]
```

**Event-name rule (industry-agnostic):** the generator MUST emit names of the form `M<NN>[-M<NN>]_<product_family>_peak_window`. Branded labels like `Q1_Galaxy_Launch` or industry-specific names (`Black_November`, `Lunar_New_Year_*`) are **forbidden in proxy mode**. They may only appear in production mode via a post-processing alias layer that joins to the enterprise's SKU launch calendar.

**Constraints:** array of at least 1 event. `event_id` is unique. Every `affected_*` value must exist in the master data (regions / hubs / product families).

---

### C.7b `business_case.json` — Standalone business case payload

Shape mirrors `engine_contract.schema.json#/definitions/businessCase`.

```json
{
  "baseline_scenario_id": "S0",                    // scenarioId, required
  "recommended_scenario_id": "S3",                 // scenarioId, required
  "annual_saving": 565473.91,                      // float >= 0, optional
  "currency": "USD",                               // currency enum
  "saving_pct": 11.67,                             // 0-100, required
  "additional_fixed_cost": 142000.00,              // float >= 0, optional
  "payback_months": 3.0,                           // float >= 0, optional
  "service_level_improvement_pct_point": -6.50,    // float (can be negative)
  "risk_reduction_summary": "...",                 // string, required
  "executive_summary": "..."                       // string, required
}
```

**Constraints:** `saving_pct` ∈ [0, 100]. `service_level_improvement_pct_point` can be negative when the recommended scenario trades service for cost — the report must call this out explicitly.

---

### C.7c `roadmap.json` — Standalone roadmap payload

Array of phases. Shape mirrors `engine_contract.schema.json#/definitions/roadmapPhase`.

```json
[
  {
    "phase_id": "P1",                        // string, required, unique
    "phase_name": "Stabilize & Diagnose",    // string, required
    "timeline": "Month 1-2",                 // string, required (free-form duration)
    "actions": ["..."],                      // array<string>, required
    "owner": "Engineering + Ops",            // string, required
    "expected_impact": "..."                 // string, required
  }
]
```

**Constraints:** array of at least 1 phase. `phase_id` unique across the array. Order matters — phases are read sequentially.

---

### C.8 `mock_engine_output_final.json` — Full engine output JSON

> Aggregated file that complies with the **entire** `engine_contract.schema.json` (LogiHubEngineContract). This is the single payload that the frontend needs to call.
>
> Detailed schema in `engine_contract.schema.json`. Key blocks:
> - `run_info` — execution metadata
> - `proxy_scope` — flags mock / proxy / production
> - `master_data` — `regions`, `product_families`, `candidate_hubs`
> - `demand` — `annual_demand_by_region`, `monthly_demand_by_region_product`, `top_od_lanes`
> - `scenarios[]` — array S0–S8 with `cost_breakdown`, `service_level_pct`, `risk_score`...
> - `recommended_network` — winning scenario plus reasons
> - `business_case` — `annual_saving`, `payback_months`, `executive_summary`
> - `roadmap[]` — implementation phases
> - `warnings[]`, `errors[]` — non-fatal & fatal

---

## 6. Validation rules (apply on read)

Every module reading a table must verify:

| # | Rule | Action on violation |
|---|---|---|
| 1 | Header matches spec 100% (names + order) | Reject → log error code `SCHEMA_001` |
| 2 | dtype per column matches (`pandas.read_csv(..., dtype=...)`) | Reject → `SCHEMA_002` |
| 3 | Every `region_name` is in the `regionName` enum | Reject row → `ENUM_001` |
| 4 | Every `product_family` is in the `productFamily` enum | Reject row → `ENUM_002` |
| 5 | Every `scenario_id` matches regex `^S[0-8]$` | Reject row → `ENUM_003` |
| 6 | `month` matches regex `^[0-9]{4}-[0-9]{2}$` | Reject row → `FMT_001` |
| 7 | All monetary / volume values ≥ 0 | Reject row → `RANGE_001` |
| 8 | `share_pct`, `*_pct` ∈ [0, 100] (except `utilization_pct` ∈ [0, 150]) | Reject row → `RANGE_002` |
| 9 | Per-table unique constraint (see each section) | Reject duplicate → `UNIQ_001` |
| 10 | Cross-ref: `hub_id` in B/C must exist in `master_data.candidate_hubs` | Warning → `XREF_001` |

Suggested reference implementation: use `pandera` or `pydantic v2` to code-gen validators from this file.

---

## 7. Versioning & change log

| Version | Date | Author | Notes |
|---|---|---|---|
| v1.0-locked | 2026-05-13 | Shared/PM | Initial schema lock derived from mock data + engine_contract.schema.json |

**Change policy:** patch version bump (v1.0 → v1.1) for non-breaking column additions. Minor version bump (v1.x → v2.0) for renames / removals — requires migrating mocks and every module.

---

## 8. References

- `engine_contract.schema.json` — canonical JSON Schema for the full payload
- `backend/mocks/group_A_data/` — 6 files (all CSV)
- `backend/mocks/group_B_data/` — 13 files (all CSV)
- `backend/mocks/group_C_data/` — 11 files (7 CSV + 4 JSON)
- `backend/mocks/mock_engine_output_final.json` — 1 aggregated full payload
- **Total: 31 mock files** (exceeds X3 spec of 12 sample files)
- `docs/05_MID_ProxyEngine.md` — proxy scope definition
- `docs/08_OUT_CostEngine6Comp.md` — 6 cost components
- `docs/09_OUT_OutcomeAnalysisExample.md` — outcome example
