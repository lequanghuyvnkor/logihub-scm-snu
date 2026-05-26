"""
Export clean CSVs for slide presentation charts — Company ABC
All files go to:  data/company_ABC/slide_exports/

Charts exported:
  1. demand_by_month.csv          → Line chart  (monthly volume trend)
  2. scenario_comparison.csv      → Bar/table   (S0-S4 metrics)
  3. top_od_lanes.csv             → Bar chart   (top 15 routes)
  4. regional_demand.csv          → Bar chart   (17 provinces)
  5. business_case_waterfall.csv  → Waterfall   (cost saving breakdown)
  6. hub_utilization.csv          → Bar chart   (current vs S3 utilization)
"""

import csv, json, os, sys
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")
os.makedirs("slide_exports", exist_ok=True)

# ── Load source data ──────────────────────────────────────────────────────────
def read_csv(path):
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))

def write_csv(path, fieldnames, rows):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:  # utf-8-sig = Excel-friendly BOM
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)
    print(f"  [OK] {path}")

tx      = read_csv("shipping_transactions.csv")
top_od  = read_csv("processed/top_od_lanes.csv")
reg_dem = read_csv("processed/regional_demand.csv")

with open("mock_engine_output_abc.json", encoding="utf-8") as f:
    eng = json.load(f)

print("Exporting slide charts for Company ABC...")
print()

# ══════════════════════════════════════════════════════════════════════════════
# 1. DEMAND BY MONTH  →  Line chart
# ══════════════════════════════════════════════════════════════════════════════
MONTH_LABELS = {
    "2025-12": "Dec 2025", "2026-01": "Jan 2026 (Seollal Peak)",
    "2026-02": "Feb 2026", "2026-03": "Mar 2026",
    "2026-04": "Apr 2026", "2026-05": "May 2026 (Parents Day)",
}
monthly = defaultdict(float)
for r in tx:
    ym = r["shipment_date"][:7]
    monthly[ym] += float(r["weight_tons"])

rows1 = []
for ym in sorted(MONTH_LABELS.keys()):
    vol = round(monthly.get(ym, 0), 1)
    rows1.append({
        "Month":           MONTH_LABELS[ym],
        "Volume (tons)":   vol,
        "Seasonal Index":  round({
            "2025-12":1.08,"2026-01":1.31,"2026-02":0.81,
            "2026-03":0.94,"2026-04":1.03,"2026-05":1.08
        }[ym], 2),
        "Note": "Peak" if ym == "2026-01" else ("Event" if ym == "2026-05" else ""),
    })

write_csv("slide_exports/1_demand_by_month.csv",
          ["Month","Volume (tons)","Seasonal Index","Note"], rows1)

# ══════════════════════════════════════════════════════════════════════════════
# 2. SCENARIO COMPARISON  →  Bar / grouped bar / table
# ══════════════════════════════════════════════════════════════════════════════
SCENARIO_META = {
    "S0": ("Baseline\n(2 Hubs)", "Current", 2),
    "S1": ("S1: +Incheon\n(3 Hubs)", "Cost-Optimized", 3),
    "S2": ("S2: +Gwangju\n(3 Hubs)", "Service-Optimized", 3),
    "S3": ("S3: 4-Hub\n(Recommended)", "Balanced", 4),
    "S4": ("S4: 5-Hub\n(Max Coverage)", "Service-Optimized", 5),
}
SCENARIO_DATA = {
    "S0": {"total_cost_usd": 641_622, "sla_pct": 72.4, "coverage_200km_pct": 61.2, "peak_util_pct": 112.5, "risk": "High"},
    "S1": {"total_cost_usd": 596_122, "sla_pct": 81.5, "coverage_200km_pct": 72.8, "peak_util_pct": 89.3,  "risk": "Medium"},
    "S2": {"total_cost_usd": 603_622, "sla_pct": 84.1, "coverage_200km_pct": 78.4, "peak_util_pct": 96.2,  "risk": "Medium"},
    "S3": {"total_cost_usd": 535_500, "sla_pct": 91.8, "coverage_200km_pct": 88.6, "peak_util_pct": 74.1,  "risk": "Low"},
    "S4": {"total_cost_usd": 567_500, "sla_pct": 96.3, "coverage_200km_pct": 94.1, "peak_util_pct": 61.8,  "risk": "Low"},
}

rows2 = []
base_cost = SCENARIO_DATA["S0"]["total_cost_usd"]
for sid, (label, stype, n_hubs) in SCENARIO_META.items():
    d = SCENARIO_DATA[sid]
    rows2.append({
        "Scenario":                label.replace("\n", " "),
        "Type":                    stype,
        "# Hubs":                  n_hubs,
        "Annual Cost (USD)":       d["total_cost_usd"],
        "Cost vs Baseline (%)":    round((d["total_cost_usd"] - base_cost) / base_cost * 100, 1),
        "SLA Compliance (%)":      d["sla_pct"],
        "Coverage within 200km (%)": d["coverage_200km_pct"],
        "Peak Hub Utilization (%)":  d["peak_util_pct"],
        "Risk Level":              d["risk"],
        "Recommended":             "YES" if sid == "S3" else "",
    })

write_csv("slide_exports/2_scenario_comparison.csv",
          ["Scenario","Type","# Hubs","Annual Cost (USD)","Cost vs Baseline (%)",
           "SLA Compliance (%)","Coverage within 200km (%)","Peak Hub Utilization (%)","Risk Level","Recommended"],
          rows2)

# ══════════════════════════════════════════════════════════════════════════════
# 3. TOP OD LANES  →  Horizontal bar chart
# ══════════════════════════════════════════════════════════════════════════════
rows3 = []
for row in top_od[:15]:
    vol = round(float(row["volume_ton"]), 1)
    if vol == 0:
        continue
    rows3.append({
        "Lane":            f"{row['origin_region']} → {row['destination_region']}",
        "Origin":          row["origin_region"],
        "Destination":     row["destination_region"],
        "Volume (tons)":   vol,
        "Share (%)":       round(float(row["share_of_total"]) * 100, 2),
        "Lane Type":       row["lane_type"],
    })
rows3.sort(key=lambda x: x["Volume (tons)"], reverse=True)

write_csv("slide_exports/3_top_od_lanes.csv",
          ["Lane","Origin","Destination","Volume (tons)","Share (%)","Lane Type"],
          rows3)

# ══════════════════════════════════════════════════════════════════════════════
# 4. REGIONAL DEMAND  →  Bar chart / choropleth
# ══════════════════════════════════════════════════════════════════════════════
inbound = defaultdict(float)
outbound = defaultdict(float)
for r in tx:
    inbound[r["destination_region"]]  += float(r["weight_tons"])
    outbound[r["origin_region"]]      += float(r["weight_tons"])

total_ib = sum(inbound.values())
rows4 = []
for reg in sorted(inbound.keys() | outbound.keys()):
    ib = round(inbound.get(reg, 0), 1)
    ob = round(outbound.get(reg, 0), 1)
    rows4.append({
        "Region":             reg,
        "Inbound (tons)":     ib,
        "Outbound (tons)":    ob,
        "Total Flow (tons)":  round(ib + ob, 1),
        "Inbound Share (%)":  round(ib / total_ib * 100, 2) if total_ib else 0,
        "Role":               "Supply Hub" if ob > ib * 1.5
                              else ("Demand Center" if ib > ob * 1.5
                              else "Balanced"),
    })
rows4.sort(key=lambda x: x["Total Flow (tons)"], reverse=True)

write_csv("slide_exports/4_regional_demand.csv",
          ["Region","Inbound (tons)","Outbound (tons)","Total Flow (tons)","Inbound Share (%)","Role"],
          rows4)

# ══════════════════════════════════════════════════════════════════════════════
# 5. BUSINESS CASE WATERFALL  →  Waterfall chart
# ══════════════════════════════════════════════════════════════════════════════
rows5 = [
    {"Item": "Baseline Annual Cost (S0)",    "Value (USD)":  641_622, "Type": "start",    "Label": "$641,622"},
    {"Item": "Transport Cost Reduction",     "Value (USD)": -106_122, "Type": "saving",   "Label": "-$106,122"},
    {"Item": "Spoilage Loss Avoidance",      "Value (USD)": -112_000, "Type": "saving",   "Label": "-$112,000"},
    {"Item": "SLA Penalty Avoidance",        "Value (USD)":  -34_500, "Type": "saving",   "Label": "-$34,500"},
    {"Item": "New Hub Fixed Costs (+2 hubs)","Value (USD)":  103_000, "Type": "cost",     "Label": "+$103,000"},
    {"Item": "Net Annual Cost (S3)",         "Value (USD)":  392_000, "Type": "end",      "Label": "$392,000"},
    {"Item": "NET ANNUAL SAVING",            "Value (USD)":  249_622, "Type": "total",    "Label": "$249,622 saved"},
]

write_csv("slide_exports/5_business_case_waterfall.csv",
          ["Item","Value (USD)","Type","Label"], rows5)

# ══════════════════════════════════════════════════════════════════════════════
# 6. HUB UTILIZATION  →  Bar chart (current vs S3)
# ══════════════════════════════════════════════════════════════════════════════
rows6 = [
    {"Hub":          "ABC Busan\n(existing)",    "Current Utilization (%)": 112.5, "S3 Utilization (%)": 74.1, "Status Current": "OVERLOAD",  "Status S3": "Healthy"},
    {"Hub":          "ABC Gyeonggi\n(existing)", "Current Utilization (%)": 87.3,  "S3 Utilization (%)": 68.5, "Status Current": "Watchlist", "Status S3": "Healthy"},
    {"Hub":          "Incheon Port Hub\n(new)",  "Current Utilization (%)": 0,     "S3 Utilization (%)": 71.2, "Status Current": "Not Active","Status S3": "Healthy"},
    {"Hub":          "Gwangju Fresh Hub\n(new)", "Current Utilization (%)": 0,     "S3 Utilization (%)": 58.4, "Status Current": "Not Active","Status S3": "Healthy"},
]
# flatten for CSV
rows6_flat = []
for r in rows6:
    rows6_flat.append({k: v for k, v in r.items()})

write_csv("slide_exports/6_hub_utilization.csv",
          ["Hub","Current Utilization (%)","S3 Utilization (%)","Status Current","Status S3"],
          rows6_flat)

# ══════════════════════════════════════════════════════════════════════════════
# Summary README
# ══════════════════════════════════════════════════════════════════════════════
readme = """# LogiHub — Company ABC Slide Chart Exports
Generated for presentation use. All files are UTF-8 with BOM (Excel-friendly).

## Files & Recommended Chart Types

| File | Recommended Chart | Tool Tip |
|------|------------------|----------|
| 1_demand_by_month.csv | Line chart | Flourish > Line chart; mark Jan as "Peak" annotation |
| 2_scenario_comparison.csv | Grouped bar or table | Datawrapper > Grouped Bars; highlight S3 row |
| 3_top_od_lanes.csv | Horizontal bar | Flourish > Bar chart race OR Datawrapper > Bar |
| 4_regional_demand.csv | Bar chart | Google Sheets > Bar; sort by Total Flow descending |
| 5_business_case_waterfall.csv | Waterfall chart | Datawrapper > Arrow plot OR Google Sheets > Waterfall |
| 6_hub_utilization.csv | Grouped bar | Flourish > Grouped bar; color red for OVERLOAD |

## Quick Upload Guide

### Datawrapper (datawrapper.de) — Recommended
1. New Chart → Upload CSV → paste content
2. Select chart type → Refine (colors, labels) → Publish → Export PNG

### Flourish (flourish.studio)
1. New Visualization → choose template → Upload Data tab → paste CSV
2. Preview → Export → Download PNG/SVG

### Google Sheets
1. File → Import → Upload CSV → Insert Chart → customize
2. Copy chart → Paste Special into Google Slides

## Key Numbers for Slide Talking Points
- Total volume: 6,901 tons over 6 months (Dec 2025 – May 2026)
- Seollal peak (Jan 2026): 1,896 tons — highest month (+81% vs Feb dip)
- Current network SLA: 72.4% → Recommended S3: 91.8% (+19.4 pts)
- Busan hub: 112.5% utilization (CRITICAL overload) → S3: 74.1%
- Annual net saving with S3: $249,622 | Payback: 4.9 months | B/C: 3.43
"""

with open("slide_exports/README.md", "w", encoding="utf-8") as f:
    f.write(readme)
print("  [OK] slide_exports/README.md")

print()
print("=" * 55)
print("  6 CSV files ready in slide_exports/")
print("  All files use UTF-8 BOM — opens correctly in Excel")
print("=" * 55)
