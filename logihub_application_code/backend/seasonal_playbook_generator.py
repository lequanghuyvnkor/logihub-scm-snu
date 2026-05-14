"""
seasonal_playbook_generator.py
==============================

Proxy-mode generator for `seasonal_playbook.json` (Engine C, Phase 10 deliverable).

Design principle — INDUSTRY-AGNOSTIC
------------------------------------
This generator deliberately does NOT hard-code any branded, calendar-specific,
or industry-specific event labels. In proxy mode the engine is demonstrating
architecture on PUBLIC aggregate freight data — it cannot tell whether the
underlying enterprise is consumer electronics, FMCG, pharma, automotive, or
a 3PL.  All event labels are *derived from the data observation itself*:
the peak-month window + the `product_family` enum value (from the contract).

If a pilot customer wants pretty labels (e.g., "Q1_<Brand>_Launch" instead
of "M02-M03_mobile_launch_peak_window"), they layer that on top in production
mode by joining with their internal SKU launch calendar — that join is NOT
part of the proxy generator and should never be hard-coded here.

Three layers of logic
---------------------
1) **Peak detection.**  Group rows by (month, product_family) and flag groups
   whose mean seasonal_index ≥ PEAK_THRESHOLD (default 1.20).
2) **Window grouping.**  Consecutive months of the same product_family that
   both pass the threshold are merged into a single 'peak window' event.
3) **Risk & action mapping.**  Use `PRODUCT_FAMILY_PROFILES` (keyed on the
   7 product_family enum values) to derive risk_type from *physical /
   logistical* characteristics of the family — bulky → storage shortage,
   high-value → security risk, small parcel → last-mile bottleneck, etc.
   Then pull the corresponding action template.  Add hub-specific actions
   when Engine B diagnosis tables are provided.

Why product_family → risk mapping is NOT industry bias
-------------------------------------------------------
Mapping bulky_appliance → storage_shortage reflects a *physical fact* about
the cargo (large objects need more floor space).  Mapping high_value_secure
→ security_risk reflects a *physical fact* about value density.  These hold
regardless of the customer's industry — consumer electronics, FMCG, pharma,
automotive, 3PL — because the mapping is on cargo physics, not on industry.
The mapping is on the contract enum, not on industry names — so it stays
agnostic.  Customers can override these defaults via `event_catalog.json`.

Production mode replaces step 1 with STL/Prophet decomposition over real
shipment data, optionally enriches step 2 names by joining with the
enterprise SKU launch calendar, and optionally swaps step 3 templates with
the enterprise's 3PL contract catalogue.  This module is isolated so
swapping it for the production version is a one-line import change in the
Engine C orchestrator.

Usage
-----
    from seasonal_playbook_generator import build_seasonal_playbook
    events = build_seasonal_playbook(
        demand_csv="mocks/group_A_data/monthly_demand_by_region_product.csv",
        overloaded_hubs_csv="mocks/group_C_data/overloaded_hubs.csv",
        capacity_gap_csv="mocks/group_B_data/capacity_gap_by_peak_period.csv",
        output_path="mocks/group_C_data/seasonal_playbook.json",
        peak_threshold=1.20,
    )

CLI
---
    python seasonal_playbook_generator.py \\
        --demand mocks/group_A_data/monthly_demand_by_region_product.csv \\
        --output mocks/group_C_data/seasonal_playbook.json

Author: LogiHub team (Engine C — Person C)
Mode:   proxy (data-driven, industry-agnostic)
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import pandas as pd


# ---------------------------------------------------------------------------
# Product-family-driven profiles.
# Keyed on the productFamily enum from engine_contract.schema.json.
# Each profile encodes the *physical/logistical* risk character of the family,
# NOT any industry or company assumption.
#
# To tune for a pilot customer: provide an `event_catalog.json` file in the
# script directory or via --config flag.  See _load_external_config docstring.
# ---------------------------------------------------------------------------

PRODUCT_FAMILY_PROFILES_DEFAULT: Dict[str, Dict[str, object]] = {
    "mobile_launch": {
        "risk_type": "capacity_overflow",
        "label": "high-velocity launch wave",
        "extra_actions": [
            "Coordinate inbound with manufacturer release calendar",
        ],
    },
    "bulky_appliance": {
        "risk_type": "storage_shortage",
        "label": "bulky storage-intensive flow",
        "extra_actions": [
            "Pre-clear floor space at receiving hubs 2 weeks ahead",
        ],
    },
    "high_value_secure": {
        "risk_type": "security_risk",
        "label": "high-value secure shipment surge",
        "extra_actions": [
            "Audit chain of custody through secure_node hubs",
        ],
    },
    "finished_goods": {
        "risk_type": "general_peak",
        "label": "finished-goods replenishment cycle",
        "extra_actions": [
            "Sync inbound receiving slots with downstream PO calendar",
        ],
    },
    "spare_parts": {
        "risk_type": "general_peak",
        "label": "reactive spare-parts demand",
        "extra_actions": [
            "Hold safety stock at regional service nodes",
        ],
    },
    "ecommerce_small": {
        "risk_type": "last_mile",
        "label": "parcel-volume surge",
        "extra_actions": [
            "Scale last-mile rider/courier pools for the window",
        ],
    },
    "general_cargo": {
        "risk_type": "general_peak",
        "label": "mixed cargo seasonal swing",
        "extra_actions": [],
    },
}

ACTION_TEMPLATES_DEFAULT: Dict[str, List[str]] = {
    "capacity_overflow": [
        "Pre-position 30% inventory 2 weeks early",
        "Activate flex capacity at affected hubs",
        "Negotiate temporary 3PL overflow contracts",
    ],
    "last_mile": [
        "Add temporary 3PL contracts for last-mile delivery",
        "Shift handling staff +20% during the event window",
        "Stage parcels closer to demand centroids",
    ],
    "storage_shortage": [
        "Lease overflow yard within 30 km of the affected hub",
        "Cross-dock directly from port / supplier when possible",
        "Reduce safety stock days for slow-moving SKUs",
    ],
    "general_peak": [
        "Increase inbound receiving slot capacity by 25%",
        "Pre-build picking waves the night before",
    ],
    "security_risk": [
        "Route shipments through secure_node hubs only",
        "Increase guarded transit checkpoints",
        "Add insurance rider for the event window",
    ],
}

RISK_DESCRIPTIONS_DEFAULT: Dict[str, str] = {
    "capacity_overflow": "Capacity overflow at affected hubs",
    "last_mile":         "Last-mile delivery delays and SLA breach risk",
    "storage_shortage":  "Storage shortage for bulky inventory",
    "general_peak":      "General demand spike requiring flex operations",
    "security_risk":     "Elevated theft / loss risk on high-value goods",
}


def _load_external_config(
    json_path: Optional[str | Path] = None,
) -> Tuple[Dict[str, Dict[str, object]], Dict[str, List[str]], Dict[str, str]]:
    """Load product_family_profiles / action_templates / risk_descriptions
    from an external JSON config.  Defaults returned if file is missing or
    malformed.

    Expected JSON schema (all keys optional — anything missing falls back
    to the default):

        {
          "product_family_profiles": {
              "<family>": {
                  "risk_type": "<one_of_known_risk_types>",
                  "label": "<short label>",
                  "extra_actions": ["..."]
              }, ...
          },
          "action_templates":  {"<risk_type>": ["..."]},
          "risk_descriptions": {"<risk_type>": "..."}
        }
    """
    if json_path is None:
        json_path = Path(__file__).parent / "event_catalog.json"
    path = Path(json_path)
    if not path.exists():
        return (PRODUCT_FAMILY_PROFILES_DEFAULT,
                ACTION_TEMPLATES_DEFAULT,
                RISK_DESCRIPTIONS_DEFAULT)
    try:
        with open(path, "r", encoding="utf-8") as f:
            cfg = json.load(f)
        profiles  = cfg.get("product_family_profiles", PRODUCT_FAMILY_PROFILES_DEFAULT)
        actions   = cfg.get("action_templates",        ACTION_TEMPLATES_DEFAULT)
        risk_desc = cfg.get("risk_descriptions",       RISK_DESCRIPTIONS_DEFAULT)
        return profiles, actions, risk_desc
    except Exception as e:
        print(
            f"Warning: failed to load {json_path}: {e}. Falling back to defaults.",
            file=sys.stderr,
        )
        return (PRODUCT_FAMILY_PROFILES_DEFAULT,
                ACTION_TEMPLATES_DEFAULT,
                RISK_DESCRIPTIONS_DEFAULT)


# Load once on import; build_seasonal_playbook may reload via config_json arg.
PRODUCT_FAMILY_PROFILES, ACTION_TEMPLATES, RISK_DESCRIPTIONS = _load_external_config()
DEFAULT_PEAK_THRESHOLD = 1.20  # seasonal_index threshold for proxy mode


# ---------------------------------------------------------------------------
# Dataclass — mirrors engine_contract.schema.json #/definitions/seasonalEvent
# ---------------------------------------------------------------------------

@dataclass
class SeasonalEvent:
    event_id: str
    event_name: str
    months: List[str]
    affected_product_families: List[str]
    affected_hubs: List[str]
    risk: str
    recommended_actions: List[str]
    # Optional / traceability — not in contract:
    confidence: float = field(default=0.7)
    source: str = field(default="proxy_data_driven_v2")

    def to_contract_dict(self) -> dict:
        return {
            "event_id": self.event_id,
            "event_name": self.event_name,
            "months": self.months,
            "affected_product_families": self.affected_product_families,
            "affected_hubs": self.affected_hubs,
            "risk": self.risk,
            "recommended_actions": self.recommended_actions,
        }


# ---------------------------------------------------------------------------
# Core pipeline
# ---------------------------------------------------------------------------

def _detect_peaks(demand_df: pd.DataFrame, threshold: float) -> pd.DataFrame:
    """Return rows of (month, product_family, regions, mean_index) where the
    mean seasonal_index across regions ≥ threshold."""
    required = {"region_name", "product_family", "month", "seasonal_index"}
    missing = required - set(demand_df.columns)
    if missing:
        raise ValueError(
            f"demand_df missing required columns: {sorted(missing)}"
        )
    grouped = (
        demand_df
        .groupby(["month", "product_family"], as_index=False)
        .agg(
            mean_index=("seasonal_index", "mean"),
            regions=("region_name", lambda s: sorted(set(s))),
        )
    )
    return grouped[grouped["mean_index"] >= threshold].reset_index(drop=True)


def _group_into_windows(peaks: pd.DataFrame) -> List[Dict[str, object]]:
    """Merge consecutive months of the *same* product_family into a single
    'peak window'.  If a family peaks in Feb AND Mar, they merge into one
    window [2023-02, 2023-03].  If it peaks in Feb AND Aug (non-consecutive),
    those are TWO separate windows.
    """
    if peaks.empty:
        return []

    sorted_peaks = peaks.sort_values(["product_family", "month"]).reset_index(drop=True)
    windows: List[Dict[str, object]] = []

    cur_family: Optional[str] = None
    cur_months: List[str] = []
    cur_regions: set = set()
    cur_idx: List[float] = []
    prev_month_int: Optional[int] = None

    def _flush() -> None:
        if cur_family and cur_months:
            windows.append({
                "product_family": cur_family,
                "months": list(cur_months),
                "regions": sorted(cur_regions),
                "mean_index": sum(cur_idx) / len(cur_idx),
            })

    for _, row in sorted_peaks.iterrows():
        fam = row["product_family"]
        month = row["month"]
        month_int = int(month.split("-")[1])
        is_consecutive = (
            cur_family == fam
            and prev_month_int is not None
            and month_int == prev_month_int + 1
        )
        if cur_family != fam or not is_consecutive:
            _flush()
            cur_family = fam
            cur_months = [month]
            cur_regions = set(row["regions"])
            cur_idx = [row["mean_index"]]
        else:
            cur_months.append(month)
            cur_regions.update(row["regions"])
            cur_idx.append(row["mean_index"])
        prev_month_int = month_int
    _flush()
    return windows


def _generate_event_name(months: List[str], product_family: str) -> str:
    """Industry-agnostic event name derived purely from observation."""
    nums = sorted({m.split("-")[1] for m in months})
    span = f"M{nums[0]}" if len(nums) == 1 else f"M{nums[0]}-M{nums[-1]}"
    return f"{span}_{product_family}_peak_window"


def _hubs_for_event(
    months: List[str],
    overloaded_df: Optional[pd.DataFrame],
    gap_df: Optional[pd.DataFrame],
) -> List[str]:
    hubs: set[str] = set()
    if overloaded_df is not None and not overloaded_df.empty:
        # overloaded_hubs.csv has no month column (per data_schemas.md §C.3)
        # → treat all listed hubs as candidates for any peak event.
        hubs.update(overloaded_df["hub_id"].astype(str).tolist())
    if gap_df is not None and not gap_df.empty and "peak_month" in gap_df.columns:
        mask = gap_df["peak_month"].isin(months)
        hubs.update(gap_df.loc[mask, "hub_id"].astype(str).tolist())
    return sorted(hubs)


def _augment_actions(
    base_actions: List[str],
    capacity_gap_df: Optional[pd.DataFrame],
    months: List[str],
) -> List[str]:
    actions = list(base_actions)
    if capacity_gap_df is None or capacity_gap_df.empty:
        return actions
    if "peak_month" not in capacity_gap_df.columns:
        return actions
    rows = capacity_gap_df[capacity_gap_df["peak_month"].isin(months)]
    for _, r in rows.iterrows():
        gap = r.get("capacity_gap", 0)
        action = r.get("recommended_action", "")
        hub = r.get("hub_id", "")
        if action and hub:
            actions.append(f"{action} at {hub} (gap ≈ {gap:.0f} tons)")
    return actions


def build_seasonal_playbook(
    demand_csv: str | Path,
    overloaded_hubs_csv: Optional[str | Path] = None,
    capacity_gap_csv: Optional[str | Path] = None,
    output_path: Optional[str | Path] = None,
    peak_threshold: float = DEFAULT_PEAK_THRESHOLD,
    min_events: int = 4,
    config_json: Optional[str | Path] = None,
) -> List[dict]:
    """Generate the industry-agnostic seasonal playbook.

    Returns a list of contract-compliant event dicts.  If `output_path` is
    given, the same list is written to disk as JSON.
    """
    global PRODUCT_FAMILY_PROFILES, ACTION_TEMPLATES, RISK_DESCRIPTIONS
    PRODUCT_FAMILY_PROFILES, ACTION_TEMPLATES, RISK_DESCRIPTIONS = \
        _load_external_config(config_json)

    demand_df = pd.read_csv(demand_csv)
    overloaded_df = pd.read_csv(overloaded_hubs_csv) if overloaded_hubs_csv else None
    gap_df = pd.read_csv(capacity_gap_csv) if capacity_gap_csv else None

    # Progressive threshold relaxation to meet min_events.
    threshold = peak_threshold
    peaks = _detect_peaks(demand_df, threshold)
    windows = _group_into_windows(peaks)
    while len(windows) < min_events and threshold > 1.0:
        threshold = round(threshold - 0.05, 2)
        peaks = _detect_peaks(demand_df, threshold)
        windows = _group_into_windows(peaks)
    if len(windows) < min_events:
        # Fallback: take the top-N (month, family) groups by mean_index.
        fallback = (
            demand_df.groupby(["month", "product_family"], as_index=False)
            .agg(
                mean_index=("seasonal_index", "mean"),
                regions=("region_name", lambda s: sorted(set(s))),
            )
            .sort_values("mean_index", ascending=False)
            .head(min_events)
            .reset_index(drop=True)
        )
        windows = _group_into_windows(fallback)

    # Build SeasonalEvent objects.
    events: List[SeasonalEvent] = []
    for w in windows:
        family = w["product_family"]
        months = w["months"]
        profile = PRODUCT_FAMILY_PROFILES.get(family, {
            "risk_type": "general_peak",
            "label": "seasonal demand swing",
            "extra_actions": [],
        })
        risk_type    = profile.get("risk_type", "general_peak")
        family_label = profile.get("label", family)
        extra        = profile.get("extra_actions", []) or []

        affected_hubs = _hubs_for_event(months, overloaded_df, gap_df)
        base = ACTION_TEMPLATES.get(risk_type, ACTION_TEMPLATES["general_peak"])
        actions = list(base) + list(extra)
        actions = _augment_actions(actions, gap_df, months)

        nums = sorted({m.split("-")[1] for m in months})
        span = f"M{nums[0]}" if len(nums) == 1 else f"M{nums[0]}-M{nums[-1]}"
        risk_text = (
            f"{RISK_DESCRIPTIONS.get(risk_type, 'Demand-side seasonal risk')} "
            f"during {span} {family_label}"
        )

        events.append(SeasonalEvent(
            event_id="E?",
            event_name=_generate_event_name(months, family),
            months=months,
            affected_product_families=[family],
            affected_hubs=affected_hubs,
            risk=risk_text,
            recommended_actions=actions,
        ))

    # Deterministic ordering & numbering.
    events.sort(key=lambda e: (min(e.months), e.event_name))
    for idx, ev in enumerate(events, start=1):
        ev.event_id = f"E{idx}"

    payload = [ev.to_contract_dict() for ev in events]
    if output_path:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
    return payload


# ---------------------------------------------------------------------------
# Validation (lightweight; does not require jsonschema)
# ---------------------------------------------------------------------------

REQUIRED_EVENT_KEYS = {
    "event_id", "event_name", "months",
    "affected_product_families", "affected_hubs",
    "risk", "recommended_actions",
}


def validate_playbook(events: List[dict]) -> List[str]:
    """Return a list of human-readable validation issues; empty = valid."""
    issues: List[str] = []
    if not isinstance(events, list):
        return ["payload is not a JSON array"]
    if len(events) == 0:
        issues.append("playbook is empty — contract requires ≥ 1 event")
    seen_ids: set[str] = set()
    for i, ev in enumerate(events):
        if not isinstance(ev, dict):
            issues.append(f"event #{i}: not an object")
            continue
        missing = REQUIRED_EVENT_KEYS - set(ev.keys())
        if missing:
            issues.append(f"event #{i} missing keys: {sorted(missing)}")
        eid = ev.get("event_id")
        if eid in seen_ids:
            issues.append(f"event #{i}: duplicate event_id '{eid}'")
        seen_ids.add(eid)
        for m in ev.get("months", []):
            if not (isinstance(m, str) and len(m) == 7 and m[4] == "-"):
                issues.append(f"event #{i} bad month format: {m!r}")
    return issues


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _cli() -> int:
    parser = argparse.ArgumentParser(
        description="Generate seasonal_playbook.json (proxy, industry-agnostic).",
    )
    parser.add_argument("--demand", required=True,
                        help="Path to monthly_demand_by_region_product.csv")
    parser.add_argument("--overloaded", default=None,
                        help="Path to overloaded_hubs.csv (optional)")
    parser.add_argument("--gap", default=None,
                        help="Path to capacity_gap_by_peak_period.csv (optional)")
    parser.add_argument("--output", required=True,
                        help="Where to write seasonal_playbook.json")
    parser.add_argument("--threshold", type=float, default=DEFAULT_PEAK_THRESHOLD,
                        help=f"Seasonal index threshold (default {DEFAULT_PEAK_THRESHOLD})")
    parser.add_argument("--min-events", type=int, default=4,
                        help="Minimum events to emit; relaxes threshold if needed")
    parser.add_argument("--config", default=None,
                        help="Path to event_catalog.json override (optional)")
    args = parser.parse_args()

    payload = build_seasonal_playbook(
        demand_csv=args.demand,
        overloaded_hubs_csv=args.overloaded,
        capacity_gap_csv=args.gap,
        output_path=args.output,
        peak_threshold=args.threshold,
        min_events=args.min_events,
        config_json=args.config,
    )
    issues = validate_playbook(payload)
    if issues:
        print("Validation warnings:", file=sys.stderr)
        for it in issues:
            print(f"  - {it}", file=sys.stderr)
    print(f"Wrote {len(payload)} events -> {args.output}")
    return 0 if not issues else 1


if __name__ == "__main__":
    raise SystemExit(_cli())
