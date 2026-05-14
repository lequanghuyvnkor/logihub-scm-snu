"""
Smoke tests for seasonal_playbook_generator (industry-agnostic v2).

Run from backend/ folder:
    python -m pytest test_seasonal_playbook_generator.py -v

Or as a plain script (no pytest required):
    python test_seasonal_playbook_generator.py
"""
from __future__ import annotations

import json
import tempfile
from pathlib import Path

import pandas as pd

from seasonal_playbook_generator import (
    PRODUCT_FAMILY_PROFILES_DEFAULT,
    SeasonalEvent,
    _detect_peaks,
    _generate_event_name,
    _group_into_windows,
    build_seasonal_playbook,
    validate_playbook,
)

HERE  = Path(__file__).parent
MOCKS = HERE / "mocks"


# ---------------------------------------------------------------------------
# Synthetic-data unit tests
# ---------------------------------------------------------------------------

def _sample_demand() -> pd.DataFrame:
    """Synthetic monthly_demand_by_region_product with planted peaks:
       Q1 mobile_launch, Jul/Aug bulky_appliance, Nov finished_goods.
    """
    rows = []
    months = [f"2023-{m:02d}" for m in range(1, 13)]
    for region in ["Seoul", "Busan"]:
        for fam in ["mobile_launch", "bulky_appliance", "finished_goods"]:
            for m in months:
                mm = int(m.split("-")[1])
                if fam == "mobile_launch" and mm == 2:
                    idx = 1.50
                elif fam == "mobile_launch" and mm == 3:
                    idx = 1.42      # consecutive — should merge with Feb
                elif fam == "bulky_appliance" and mm in (7, 8):
                    idx = 1.35
                elif fam == "finished_goods" and mm == 11:
                    idx = 1.25
                else:
                    idx = 0.95
                rows.append({
                    "region_id": region, "region_name": region,
                    "product_family": fam, "month": m,
                    "volume": 100.0, "unit": "ton",
                    "seasonal_index": idx,
                })
    return pd.DataFrame(rows)


def test_detect_peaks_returns_only_above_threshold():
    df = _sample_demand()
    peaks = _detect_peaks(df, threshold=1.20)
    # Feb mobile + Mar mobile + Jul bulky + Aug bulky + Nov finished = 5
    assert len(peaks) == 5
    for _, r in peaks.iterrows():
        assert r["mean_index"] >= 1.20


def test_event_name_is_data_driven_not_branded():
    """Event names must come from observation, NOT a hardcoded catalog."""
    name1 = _generate_event_name(["2023-02"], "mobile_launch")
    name2 = _generate_event_name(["2023-02", "2023-03"], "mobile_launch")
    name3 = _generate_event_name(["2023-07", "2023-08"], "bulky_appliance")

    assert name1 == "M02_mobile_launch_peak_window"
    assert name2 == "M02-M03_mobile_launch_peak_window"
    assert name3 == "M07-M08_bulky_appliance_peak_window"

    # Critical: must NOT contain brand names or industry-specific tokens.
    for n in (name1, name2, name3):
        for forbidden in ("Galaxy", "Samsung", "iPhone", "Chuseok",
                          "Lunar", "Black", "Family_Month"):
            assert forbidden not in n, f"branded token {forbidden!r} in {n!r}"


def test_group_into_windows_merges_consecutive_months():
    """Feb + Mar mobile_launch should merge into one window; Jul + Aug bulky
    should merge; Feb mobile and Jul bulky stay separate."""
    df = _sample_demand()
    peaks = _detect_peaks(df, 1.20)
    windows = _group_into_windows(peaks)
    families = sorted(w["product_family"] for w in windows)
    assert families == ["bulky_appliance", "finished_goods", "mobile_launch"]

    by_family = {w["product_family"]: w for w in windows}
    assert by_family["mobile_launch"]["months"] == ["2023-02", "2023-03"]
    assert by_family["bulky_appliance"]["months"] == ["2023-07", "2023-08"]
    assert by_family["finished_goods"]["months"] == ["2023-11"]


def test_profiles_cover_all_contract_product_families():
    """Every productFamily enum value must have a default profile so the
    generator can never encounter an unmapped family on real data."""
    contract_families = {
        "mobile_launch", "bulky_appliance", "high_value_secure",
        "finished_goods", "spare_parts", "ecommerce_small", "general_cargo",
    }
    assert set(PRODUCT_FAMILY_PROFILES_DEFAULT.keys()) == contract_families


def test_build_seasonal_playbook_synthetic():
    df = _sample_demand()
    tmp = Path(tempfile.mkdtemp())
    demand_csv = tmp / "demand.csv"
    out = tmp / "seasonal_playbook.json"
    df.to_csv(demand_csv, index=False)

    payload = build_seasonal_playbook(
        demand_csv=demand_csv, output_path=out,
        peak_threshold=1.20, min_events=3,
    )
    assert out.exists()
    assert len(payload) >= 3
    assert validate_playbook(payload) == []
    ids = [e["event_id"] for e in payload]
    assert ids == [f"E{i+1}" for i in range(len(payload))]

    # All event names should match the data-driven pattern.
    for ev in payload:
        name = ev["event_name"]
        assert name.endswith("_peak_window"), f"unexpected event name: {name}"
        assert name.startswith("M"), f"unexpected event name: {name}"


def test_validate_catches_missing_keys():
    bad = [{"event_id": "E1", "event_name": "x"}]
    issues = validate_playbook(bad)
    assert any("missing keys" in it for it in issues)


def test_progressive_threshold_relaxation():
    """When threshold is too high, generator relaxes it to meet min_events."""
    df = _sample_demand()
    tmp = Path(tempfile.mkdtemp())
    demand_csv = tmp / "demand.csv"
    df.to_csv(demand_csv, index=False)

    payload = build_seasonal_playbook(
        demand_csv=demand_csv, output_path=None,
        peak_threshold=1.60,    # nothing passes
        min_events=3,
    )
    assert len(payload) >= 3


# ---------------------------------------------------------------------------
# Integration test against actual repo mocks (skipped if mocks missing)
# ---------------------------------------------------------------------------

def test_against_repo_mocks():
    demand = MOCKS / "group_A_data" / "monthly_demand_by_region_product.csv"
    if not demand.exists():
        print(f"[skip] mock file not found: {demand}")
        return
    overloaded = MOCKS / "group_C_data" / "overloaded_hubs.csv"
    gap = MOCKS / "group_B_data" / "capacity_gap_by_peak_period.csv"

    tmp = Path(tempfile.mkdtemp())
    out = tmp / "seasonal_playbook.json"

    payload = build_seasonal_playbook(
        demand_csv=demand,
        overloaded_hubs_csv=overloaded if overloaded.exists() else None,
        capacity_gap_csv=gap if gap.exists() else None,
        output_path=out,
        peak_threshold=1.20,
        min_events=4,
    )
    assert len(payload) >= 4, f"midterm pass requires >= 4 events, got {len(payload)}"
    issues = validate_playbook(payload)
    assert issues == [], f"validation issues: {issues}"

    # Ensure no branded names sneak in.
    for ev in payload:
        for token in ("Galaxy", "Samsung", "iPhone"):
            assert token not in ev["event_name"], f"branded token in {ev}"

    print(f"  -> {len(payload)} events written to {out}")
    print(f"  -> first event: {json.dumps(payload[0], indent=2, ensure_ascii=False)}")


# ---------------------------------------------------------------------------
# Plain-script runner (no pytest needed)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    tests = [
        test_detect_peaks_returns_only_above_threshold,
        test_event_name_is_data_driven_not_branded,
        test_group_into_windows_merges_consecutive_months,
        test_profiles_cover_all_contract_product_families,
        test_build_seasonal_playbook_synthetic,
        test_validate_catches_missing_keys,
        test_progressive_threshold_relaxation,
        test_against_repo_mocks,
    ]
    failures = 0
    for t in tests:
        name = t.__name__
        try:
            t()
            print(f"PASS  {name}")
        except AssertionError as e:
            failures += 1
            print(f"FAIL  {name}: {e}")
        except Exception as e:  # noqa: BLE001
            failures += 1
            print(f"ERROR {name}: {type(e).__name__}: {e}")
    if failures:
        raise SystemExit(failures)
    print(f"\nAll {len(tests)} tests passed.")
