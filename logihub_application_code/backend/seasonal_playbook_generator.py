"""
seasonal_playbook_generator.py
==============================

Proxy-mode generator for `seasonal_playbook.json` (Engine C, Phase 10 deliverable).

This module takes the heuristic seasonal index produced by Engine A
(monthly_demand_by_region_product.csv) and — optionally — diagnosis tables
from Engine B (overloaded_hubs.csv, capacity_gap_by_peak_period.csv) and
produces a seasonal playbook that conforms to the schema in
`data_schemas.md` §C.7 and `engine_contract.schema.json` (#/definitions/seasonalEvent).

Three layers of logic
---------------------
1) **Peak detection.**  Group rows by (month, product_family) and flag groups
   whose mean seasonal_index ≥ PEAK_THRESHOLD (default 1.20).
2) **Event labelling.**  Look up each (month, product_family) peak in
   `KOREAN_EVENT_CATALOG` — a static table of well-known Korean industry
   seasonal events.  Falls back to a generic "<Month>_<Family>_Peak" label.
3) **Action templating.**  Pick an action list from `ACTION_TEMPLATES` keyed
   on the *risk type* derived from each peak (capacity overflow, last-mile,
   storage shortage, …).  Augment with hub-specific actions if Engine B
   diagnosis tables are provided.

Production mode replaces step 1 with STL/Prophet decomposition over real
shipment data, step 2 with a SKU launch calendar join, and step 3 with the
enterprise's actual 3PL contract catalogue.  This module is intentionally
isolated so swapping it for the production version is a one-line import
change in the Engine C orchestrator.

Usage
-----
    from seasonal_playbook_generator import build_seasonal_playbook

    events = build_seasonal_playbook(
        demand_csv="mocks/group_A_data/monthly_demand_by_region_product.csv",
        overloaded_hubs_csv="mocks/group_C_data/overloaded_hubs.csv",   # optional
        capacity_gap_csv="mocks/group_B_data/capacity_gap_by_peak_period.csv",  # optional
        output_path="mocks/group_C_data/seasonal_playbook.json",
        peak_threshold=1.20,
    )

CLI
---
    python seasonal_playbook_generator.py \\
        --demand mocks/group_A_data/monthly_demand_by_region_product.csv \\
        --output mocks/group_C_data/seasonal_playbook.json

Author: LogiHub team (Engine C — Person C)
Mode:   proxy (midterm)
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import pandas as pd

# ---------------------------------------------------------------------------
# Static catalogs — these encode the *heuristic / industry knowledge* layer
# that distinguishes proxy mode from production mode.  Production mode
# replaces these with SKU launch calendars and enterprise contract data.
# ---------------------------------------------------------------------------

# Default static fallbacks
KOREAN_EVENT_CATALOG_DEFAULT: Dict[Tuple[str, str], Tuple[str, str]] = {
    ("01", "ecommerce_small"):    ("Lunar_New_Year_Ecommerce_Push", "last_mile"),
    ("02", "mobile_launch"):      ("Q1_Galaxy_Launch",              "capacity_overflow"),
    ("03", "mobile_launch"):      ("Q1_Galaxy_Launch_Tail",         "capacity_overflow"),
    ("05", "finished_goods"):     ("Family_Month_Promo",            "general_peak"),
    ("06", "bulky_appliance"):    ("Early_Summer_AC_Ramp",          "storage_shortage"),
    ("07", "bulky_appliance"):    ("Summer_AC_Peak",                "storage_shortage"),
    ("08", "bulky_appliance"):    ("Summer_AC_Peak",                "storage_shortage"),
    ("09", "general_cargo"):      ("Chuseok_Gifting",               "last_mile"),
    ("09", "ecommerce_small"):    ("Chuseok_Ecommerce",             "last_mile"),
    ("10", "mobile_launch"):      ("Q4_Phone_Refresh",              "capacity_overflow"),
    ("11", "ecommerce_small"):    ("Black_November_Ecommerce",      "last_mile"),
    ("11", "finished_goods"):     ("Year_End_B2B_Push",             "capacity_overflow"),
    ("12", "ecommerce_small"):    ("Year_End_Gifting",              "last_mile"),
    ("12", "high_value_secure"):  ("Year_End_Premium_Goods",        "security_risk"),
}

ACTION_TEMPLATES_DEFAULT: Dict[str, List[str]] = {
    "capacity_overflow": [
        "Pre-position 30% inventory 2 weeks early",
        "Activate flex capacity at affected hubs",
        "Negotiate temporary 3PL overflow contracts",
    ],
    "last_mile": [
        "Add temporary 3PL contracts for last-mile",
        "Shift handling staff +20% during the event window",
        "Stage parcels closer to demand centroids",
    ],
    "storage_shortage": [
        "Lease overflow yard within 30 km of the affected hub",
        "Cross-dock directly from port / supplier when possible",
        "Reduce safety stock days for slow-moving SKUs",
    ],
    "general_peak": [
        "Increase inbound receiving slots by 25%",
        "Pre-build picking waves the night before",
    ],
    "security_risk": [
        "Move shipments through secure_node hubs only",
        "Increase guarded transit checkpoints",
        "Insurance rider for the event window",
    ],
}

RISK_DESCRIPTIONS_DEFAULT: Dict[str, str] = {
    "capacity_overflow": "Capacity overflow at affected hubs",
    "last_mile":         "Last-mile delivery delays and SLA breach risk",
    "storage_shortage":  "Storage shortage for bulky inventory",
    "general_peak":      "General demand spike requiring flex operations",
    "security_risk":     "Elevated theft / loss risk on high-value goods",
}

def load_external_catalog(json_path: Optional[str | Path] = None) -> Tuple[Dict[Tuple[str, str], Tuple[str, str]], Dict[str, List[str]], Dict[str, str]]:
    """Load catalog, action templates, and risk descriptions from a JSON config file."""
    if json_path is None:
        json_path = Path(__file__).parent / "event_catalog.json"
    
    path = Path(json_path)
    if not path.exists():
        return KOREAN_EVENT_CATALOG_DEFAULT, ACTION_TEMPLATES_DEFAULT, RISK_DESCRIPTIONS_DEFAULT

    try:
        with open(path, "r", encoding="utf-8") as f:
            config = json.load(f)
        
        # Convert string keys like "MM|family" back to tuple keys (MM, family)
        raw_catalog = config.get("event_catalog", {})
        catalog = {}
        for k, v in raw_catalog.items():
            if "|" in k:
                parts = tuple(k.split("|"))
                if len(parts) == 2:
                    catalog[parts] = tuple(v)
            else:
                catalog[k] = tuple(v)
        
        action_templates = config.get("action_templates", ACTION_TEMPLATES_DEFAULT)
        risk_descriptions = config.get("risk_descriptions", RISK_DESCRIPTIONS_DEFAULT)
        
        return catalog, action_templates, risk_descriptions
    except Exception as e:
        print(f"Warning: Failed to load external config {json_path}: {e}. Falling back to default catalogs.", file=sys.stderr)
        return KOREAN_EVENT_CATALOG_DEFAULT, ACTION_TEMPLATES_DEFAULT, RISK_DESCRIPTIONS_DEFAULT

# Load catalogs dynamically (default to loading from event_catalog.json in script dir)
KOREAN_EVENT_CATALOG, ACTION_TEMPLATES, RISK_DESCRIPTIONS = load_external_catalog()

DEFAULT_PEAK_THRESHOLD = 1.20  # seasonal_index threshold for proxy mode


# ---------------------------------------------------------------------------
# Data class mirroring the seasonalEvent contract definition
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
    # Optional fields kept out of contract but useful for traceability:
    confidence: float = field(default=0.7)  # proxy mode default
    source: str = field(default="proxy_heuristic_v1")

    def to_contract_dict(self) -> dict:
        """Return only fields defined by `seasonalEvent` in the contract."""
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

def _detect_peaks(
    demand_df: pd.DataFrame,
    threshold: float,
) -> pd.DataFrame:
    """Return a DataFrame of (month, product_family, regions, mean_index)
    rows where mean seasonal_index ≥ threshold.

    Expected demand_df schema (per data_schemas.md §A.3):
        region_id, region_name, product_family, month, volume, unit, seasonal_index
    """
    required = {"region_name", "product_family", "month", "seasonal_index"}
    missing = required - set(demand_df.columns)
    if missing:
        raise ValueError(
            f"demand_df missing required columns for peak detection: {sorted(missing)}"
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


def _label_event(month: str, product_family: str) -> Tuple[str, str]:
    """Lookup (event_name, risk_type) from KOREAN_EVENT_CATALOG.
    Falls back to generic label if the (month, family) combo is unknown."""
    mm = month.split("-")[-1] if "-" in month else month
    if (mm, product_family) in KOREAN_EVENT_CATALOG:
        return KOREAN_EVENT_CATALOG[(mm, product_family)]
    return (f"M{mm}_{product_family}_Peak", "general_peak")


def _hubs_for_event(
    months: List[str],
    overloaded_hubs_df: Optional[pd.DataFrame],
    capacity_gap_df: Optional[pd.DataFrame],
) -> List[str]:
    """Return the set of hub_ids flagged as overloaded or capacity-gapped
    during the given months.  Returns [] if neither table is provided."""
    hubs: set[str] = set()

    if overloaded_hubs_df is not None and not overloaded_hubs_df.empty:
        # overloaded_hubs.csv (per §C.3) has no month column in the proxy mock,
        # so we treat all listed hubs as candidates for any peak event.
        hubs.update(overloaded_hubs_df["hub_id"].astype(str).tolist())

    if capacity_gap_df is not None and not capacity_gap_df.empty:
        if "peak_month" in capacity_gap_df.columns:
            mask = capacity_gap_df["peak_month"].isin(months)
            hubs.update(capacity_gap_df.loc[mask, "hub_id"].astype(str).tolist())

    return sorted(hubs)


def _augment_actions(
    base_actions: List[str],
    affected_hubs: List[str],
    capacity_gap_df: Optional[pd.DataFrame],
    months: List[str],
) -> List[str]:
    """Add hub-specific actions when capacity_gap data is available."""
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
    """Generate the seasonal playbook and optionally write it to disk.

    Parameters
    ----------
    demand_csv          : path to monthly_demand_by_region_product.csv (required)
    overloaded_hubs_csv : path to overloaded_hubs.csv (optional, Engine C / B)
    capacity_gap_csv    : path to capacity_gap_by_peak_period.csv (optional, Engine B)
    output_path         : if given, JSON is written here
    peak_threshold      : seasonal_index threshold (default 1.20)
    min_events          : if fewer events are detected, threshold is relaxed
                          progressively until at least this many events emerge
                          (proxy mode requirement: ≥ 4 events for midterm pass).
    config_json         : path to external JSON configuration file (optional)

    Returns
    -------
    List[dict] : playbook events as contract-compliant dicts.
    """
    global KOREAN_EVENT_CATALOG, ACTION_TEMPLATES, RISK_DESCRIPTIONS
    KOREAN_EVENT_CATALOG, ACTION_TEMPLATES, RISK_DESCRIPTIONS = load_external_catalog(config_json)

    demand_df = pd.read_csv(demand_csv)
    overloaded_df = (
        pd.read_csv(overloaded_hubs_csv) if overloaded_hubs_csv else None
    )
    gap_df = pd.read_csv(capacity_gap_csv) if capacity_gap_csv else None

    # Progressive threshold relaxation to ensure min_events is met.
    threshold = peak_threshold
    peaks = _detect_peaks(demand_df, threshold)
    while len(peaks) < min_events and threshold > 1.0:
        threshold = round(threshold - 0.05, 2)
        peaks = _detect_peaks(demand_df, threshold)
    if len(peaks) < min_events:
        # Fall back: take the top-N by mean_index regardless of threshold.
        all_peaks = (
            demand_df.groupby(["month", "product_family"], as_index=False)
            .agg(
                mean_index=("seasonal_index", "mean"),
                regions=("region_name", lambda s: sorted(set(s))),
            )
            .sort_values("mean_index", ascending=False)
            .head(min_events)
        )
        peaks = all_peaks.reset_index(drop=True)

    # Merge consecutive months of the same labelled event.
    events_by_name: Dict[str, SeasonalEvent] = {}
    for i, row in peaks.iterrows():
        event_name, risk_type = _label_event(row["month"], row["product_family"])
        affected_hubs = _hubs_for_event([row["month"]], overloaded_df, gap_df)
        base_actions = ACTION_TEMPLATES.get(risk_type, ACTION_TEMPLATES["general_peak"])
        actions = _augment_actions(base_actions, affected_hubs, gap_df, [row["month"]])
        risk_text = RISK_DESCRIPTIONS.get(risk_type, "Demand-side seasonal risk")

        if event_name in events_by_name:
            ev = events_by_name[event_name]
            ev.months = sorted(set(ev.months + [row["month"]]))
            ev.affected_product_families = sorted(
                set(ev.affected_product_families + [row["product_family"]])
            )
            ev.affected_hubs = sorted(set(ev.affected_hubs + affected_hubs))
            for a in actions:
                if a not in ev.recommended_actions:
                    ev.recommended_actions.append(a)
        else:
            events_by_name[event_name] = SeasonalEvent(
                event_id=f"E{len(events_by_name) + 1}",
                event_name=event_name,
                months=[row["month"]],
                affected_product_families=[row["product_family"]],
                affected_hubs=affected_hubs,
                risk=risk_text,
                recommended_actions=actions,
            )

    # Re-number event_ids deterministically by earliest month.
    ordered = sorted(
        events_by_name.values(),
        key=lambda e: (min(e.months), e.event_name),
    )
    for idx, ev in enumerate(ordered, start=1):
        ev.event_id = f"E{idx}"

    payload = [ev.to_contract_dict() for ev in ordered]

    if output_path:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

    return payload


# ---------------------------------------------------------------------------
# Validation — light schema check (does not pull jsonschema as a hard dep)
# ---------------------------------------------------------------------------

REQUIRED_EVENT_KEYS = {
    "event_id", "event_name", "months",
    "affected_product_families", "affected_hubs",
    "risk", "recommended_actions",
}


def validate_playbook(events: List[dict]) -> List[str]:
    """Return a list of human-readable issues; empty list = valid."""
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
        description="Generate seasonal_playbook.json (proxy mode)."
    )
    parser.add_argument(
        "--demand", required=True,
        help="Path to monthly_demand_by_region_product.csv (Engine A output).",
    )
    parser.add_argument(
        "--overloaded", default=None,
        help="Path to overloaded_hubs.csv (Engine C / B, optional).",
    )
    parser.add_argument(
        "--gap", default=None,
        help="Path to capacity_gap_by_peak_period.csv (Engine B, optional).",
    )
    parser.add_argument(
        "--output", required=True,
        help="Where to write seasonal_playbook.json.",
    )
    parser.add_argument(
        "--threshold", type=float, default=DEFAULT_PEAK_THRESHOLD,
        help=f"Seasonal index threshold (default {DEFAULT_PEAK_THRESHOLD}).",
    )
    parser.add_argument(
        "--min-events", type=int, default=4,
        help="Minimum events to emit (relaxes threshold if needed). Default 4.",
    )
    parser.add_argument(
        "--config", default=None,
        help="Path to event_catalog.json config file (optional).",
    )
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
