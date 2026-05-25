"""A1-A4 data pipeline used by the A5 standalone CLI.

Revision: 6-product-family version with Pharmaceuticals included.
"""
from __future__ import annotations

import json
import logging
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Tuple

import pandas as pd

from .config import COMMODITY_TO_PRODUCT_FAMILY, PRODUCT_FAMILIES, SEASONAL_INDEX_RAW
from .regions import REGION_CENTROIDS, REGION_CODES, REGIONS_17, normalize_region

OD_FILE = "od_clean_long_2023.csv"
WAREHOUSE_FILE = "warehouse_geocoded.csv"
CAPACITY_FILE = "warehouse_capacity_17_regions.csv"


@dataclass
class PipelineResult:
    input_dir: str
    output_dir: str
    original_od_volume_ton: float
    matrix_volume_ton: float
    aggregation_error_pct: float
    total_inbound_ton: float
    total_outbound_ton: float
    flow_balance_error_ton: float
    regional_monthly_error_pct: float
    product_monthly_error_pct: float
    seasonal_index_means: Dict[str, float]
    output_files: list[str]


def _require_columns(df: pd.DataFrame, required: set[str], file_name: str) -> None:
    missing = sorted(required - set(df.columns))
    if missing:
        raise ValueError(f"{file_name} is missing required columns: {missing}")


def read_raw_data(input_dir: Path) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """A1: Read raw/processed source CSV files and validate mandatory columns."""
    od_path = input_dir / OD_FILE
    wh_path = input_dir / WAREHOUSE_FILE
    cap_path = input_dir / CAPACITY_FILE
    for path in [od_path, wh_path, cap_path]:
        if not path.exists():
            raise FileNotFoundError(f"Required input file not found: {path}")

    od = pd.read_csv(od_path)
    wh = pd.read_csv(wh_path)
    cap = pd.read_csv(cap_path)

    _require_columns(od, {"O_17_name", "D_17_name", "commodity", "volume_ton"}, OD_FILE)
    _require_columns(wh, {"hub_id", "company_name", "sido", "lat", "lon", "area_m2", "fixed_cost", "capacity_tons", "storage_item"}, WAREHOUSE_FILE)
    _require_columns(cap, {"region_name", "total_area_m2", "warehouse_count"}, CAPACITY_FILE)
    return od, wh, cap


def standardize_regions(od: pd.DataFrame, wh: pd.DataFrame, cap: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """A2: Normalize all regional names to the Korean 17-region standard."""
    clean_od = od.copy()
    clean_od["origin_region"] = clean_od["O_17_name"].map(normalize_region)
    clean_od["destination_region"] = clean_od["D_17_name"].map(normalize_region)
    clean_od["origin_region_code"] = clean_od["origin_region"].map(REGION_CODES)
    clean_od["destination_region_code"] = clean_od["destination_region"].map(REGION_CODES)
    clean_od = clean_od[["origin_region_code", "origin_region", "destination_region_code", "destination_region", "commodity", "volume_ton"]]

    clean_wh = wh.copy()
    clean_wh["region"] = clean_wh["sido"].map(normalize_region)
    clean_wh["region_code"] = clean_wh["region"].map(REGION_CODES)

    # Fill missing lat/lon with representative regional centroids.
    missing_latlon = clean_wh["lat"].isna() | clean_wh["lon"].isna()
    if missing_latlon.any():
        clean_wh.loc[missing_latlon, "lat"] = clean_wh.loc[missing_latlon, "region"].map(lambda r: REGION_CENTROIDS[r][0])
        clean_wh.loc[missing_latlon, "lon"] = clean_wh.loc[missing_latlon, "region"].map(lambda r: REGION_CENTROIDS[r][1])
    clean_wh = clean_wh[["hub_id", "company_name", "region_code", "region", "lat", "lon", "area_m2", "fixed_cost", "capacity_tons", "storage_item"]]

    clean_cap = cap.copy()
    clean_cap["region"] = clean_cap["region_name"].map(normalize_region)
    clean_cap = (
        clean_cap.groupby("region", as_index=False)[["total_area_m2", "warehouse_count"]]
        .sum()
        .assign(region_code=lambda x: x["region"].map(REGION_CODES))
        [["region_code", "region", "total_area_m2", "warehouse_count"]]
    )
    full_region_frame = pd.DataFrame({"region": REGIONS_17})
    full_region_frame["region_code"] = full_region_frame["region"].map(REGION_CODES)
    clean_cap = full_region_frame.merge(clean_cap, on=["region_code", "region"], how="left")
    clean_cap[["total_area_m2", "warehouse_count"]] = clean_cap[["total_area_m2", "warehouse_count"]].fillna(0)
    clean_cap["warehouse_count"] = clean_cap["warehouse_count"].astype(int)
    return clean_od, clean_wh, clean_cap


def build_od_outputs(clean_od: pd.DataFrame, clean_cap: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """A3: Build 17x17 O/D matrix, regional demand summary, and top O/D lanes."""
    od_matrix = clean_od.pivot_table(
        index="origin_region",
        columns="destination_region",
        values="volume_ton",
        aggfunc="sum",
        fill_value=0.0,
    ).reindex(index=REGIONS_17, columns=REGIONS_17, fill_value=0.0)
    od_matrix_out = od_matrix.reset_index().rename(columns={"origin_region": "origin_region"})

    inbound = od_matrix.sum(axis=0).rename("inbound_ton")
    outbound = od_matrix.sum(axis=1).rename("outbound_ton")
    regional_demand = pd.DataFrame({"region": REGIONS_17})
    regional_demand["region_code"] = regional_demand["region"].map(REGION_CODES)
    regional_demand = regional_demand.merge(inbound, left_on="region", right_index=True, how="left")
    regional_demand = regional_demand.merge(outbound, left_on="region", right_index=True, how="left")
    regional_demand["total_flow_ton"] = regional_demand["inbound_ton"] + regional_demand["outbound_ton"]
    regional_demand["demand_weight_ton"] = regional_demand["inbound_ton"]
    total_demand = regional_demand["demand_weight_ton"].sum()
    regional_demand["demand_share"] = regional_demand["demand_weight_ton"] / total_demand if total_demand else 0.0
    regional_demand = regional_demand.merge(clean_cap, on=["region_code", "region"], how="left")
    regional_demand = regional_demand[["region_code", "region", "inbound_ton", "outbound_ton", "total_flow_ton", "demand_weight_ton", "demand_share", "total_area_m2", "warehouse_count"]]

    top_od_lanes = (
        clean_od.groupby(["origin_region", "destination_region"], as_index=False)["volume_ton"].sum()
        .sort_values("volume_ton", ascending=False)
        .head(100)
        .reset_index(drop=True)
    )
    top_od_lanes.insert(0, "rank", top_od_lanes.index + 1)
    top_od_lanes["lane_type"] = top_od_lanes.apply(lambda r: "intra-region" if r["origin_region"] == r["destination_region"] else "inter-region", axis=1)
    total_volume = clean_od["volume_ton"].sum()
    top_od_lanes["share_of_total"] = top_od_lanes["volume_ton"] / total_volume if total_volume else 0.0
    return od_matrix_out, regional_demand, top_od_lanes


def _normalized_seasonal_index() -> pd.DataFrame:
    data = {"month": list(range(1, 13))}
    for col, vals in SEASONAL_INDEX_RAW.items():
        s = pd.Series(vals, dtype=float)
        data[col] = (s / s.mean()).round(8).tolist()
    return pd.DataFrame(data)


def _map_product_family(commodity: object) -> str:
    return COMMODITY_TO_PRODUCT_FAMILY.get(str(commodity).strip(), "Ecommerce_Misc")


def build_monthly_outputs(clean_od: pd.DataFrame, regional_demand: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """A4: Build monthly and product-family demand tables using heuristic seasonality."""
    seasonal_index = _normalized_seasonal_index()

    monthly_region = regional_demand[["region_code", "region", "demand_weight_ton"]].merge(seasonal_index[["month", "overall_index"]], how="cross")
    monthly_region["seasonal_index"] = monthly_region["overall_index"]
    monthly_region["monthly_demand_ton"] = monthly_region["demand_weight_ton"] / 12.0 * monthly_region["seasonal_index"]
    monthly_region = monthly_region[["region_code", "region", "month", "seasonal_index", "monthly_demand_ton"]]

    od_with_family = clean_od.copy()
    od_with_family["product_family"] = od_with_family["commodity"].map(_map_product_family)
    annual_region_product = (
        od_with_family.groupby(["destination_region", "product_family"], as_index=False)["volume_ton"].sum()
        .rename(columns={"destination_region": "region", "volume_ton": "annual_demand_ton"})
    )
    annual_region_product["region_code"] = annual_region_product["region"].map(REGION_CODES)
    annual_region_product = annual_region_product[["region_code", "region", "product_family", "annual_demand_ton"]]

    # Ensure full region x product-family coverage.
    full = pd.MultiIndex.from_product([REGIONS_17, PRODUCT_FAMILIES], names=["region", "product_family"]).to_frame(index=False)
    full["region_code"] = full["region"].map(REGION_CODES)
    annual_region_product = full.merge(annual_region_product, on=["region_code", "region", "product_family"], how="left").fillna({"annual_demand_ton": 0.0})

    seasonal_long = seasonal_index.melt(id_vars=["month"], value_vars=PRODUCT_FAMILIES, var_name="product_family", value_name="seasonal_index")
    monthly_region_product = annual_region_product.merge(seasonal_long, on="product_family", how="left")
    monthly_region_product["monthly_demand_ton"] = monthly_region_product["annual_demand_ton"] / 12.0 * monthly_region_product["seasonal_index"]
    monthly_region_product = monthly_region_product[["region_code", "region", "product_family", "month", "seasonal_index", "monthly_demand_ton"]]
    return seasonal_index, monthly_region, annual_region_product, monthly_region_product


def write_region_master(output_dir: Path) -> str:
    target = output_dir / "region_master.py"
    content = "# Auto-generated by LogiHub Group A build-od CLI.\n" \
              "REGIONS_17 = " + repr(REGIONS_17) + "\n\n" \
              "REGION_CODES = " + repr(REGION_CODES) + "\n\n" \
              "REGION_CENTROIDS = " + repr(REGION_CENTROIDS) + "\n"
    target.write_text(content, encoding="utf-8")
    return target.name




def write_commodity_mapping(output_dir: Path) -> str:
    """Write the heuristic commodity-to-product-family mapping for auditability."""
    target = output_dir / "commodity_product_family_mapping.csv"
    mapping = pd.DataFrame(
        sorted(COMMODITY_TO_PRODUCT_FAMILY.items()),
        columns=["commodity", "product_family"],
    )
    mapping["mapping_status"] = "heuristic_pending_group_c_classifier"
    mapping.to_csv(target, index=False, encoding="utf-8-sig")
    return target.name


def run_pipeline(input_dir: str | Path, output_dir: str | Path, logger: logging.Logger | None = None) -> PipelineResult:
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    logger = logger or logging.getLogger(__name__)

    logger.info("A1: reading source datasets from %s", input_path)
    od, wh, cap = read_raw_data(input_path)
    original_total = float(od["volume_ton"].sum())

    logger.info("A2: standardizing regions and warehouse capacity data")
    clean_od, clean_wh, clean_cap = standardize_regions(od, wh, cap)

    logger.info("A3: building 17x17 O/D matrix and regional demand outputs")
    od_matrix, regional_demand, top_od_lanes = build_od_outputs(clean_od, clean_cap)

    logger.info("A4: generating monthly and product-family demand outputs")
    seasonal_index, monthly_region, annual_region_product, monthly_region_product = build_monthly_outputs(clean_od, regional_demand)

    output_files = []
    for name, df in [
        ("clean_od.csv", clean_od),
        ("clean_warehouse.csv", clean_wh),
        ("clean_warehouse_capacity_17_regions.csv", clean_cap),
        ("od_matrix_17_region.csv", od_matrix),
        ("regional_demand.csv", regional_demand),
        ("top_od_lanes.csv", top_od_lanes),
        ("seasonal_index.csv", seasonal_index),
        ("monthly_demand_by_region.csv", monthly_region),
        ("annual_demand_by_region_product.csv", annual_region_product),
        ("monthly_demand_by_region_product.csv", monthly_region_product),
    ]:
        df.to_csv(output_path / name, index=False, encoding="utf-8-sig")
        output_files.append(name)
    output_files.append(write_region_master(output_path))
    output_files.append(write_commodity_mapping(output_path))

    matrix_numeric = od_matrix[REGIONS_17]
    matrix_total = float(matrix_numeric.to_numpy().sum())
    total_inbound = float(regional_demand["inbound_ton"].sum())
    total_outbound = float(regional_demand["outbound_ton"].sum())
    aggregation_error_pct = abs(matrix_total - original_total) / original_total * 100 if original_total else 0.0
    regional_monthly_error_pct = abs(float(monthly_region["monthly_demand_ton"].sum()) - total_inbound) / total_inbound * 100 if total_inbound else 0.0
    product_monthly_error_pct = abs(float(monthly_region_product["monthly_demand_ton"].sum()) - float(annual_region_product["annual_demand_ton"].sum())) / float(annual_region_product["annual_demand_ton"].sum()) * 100 if float(annual_region_product["annual_demand_ton"].sum()) else 0.0
    seasonal_means = {col: float(seasonal_index[col].mean()) for col in seasonal_index.columns if col != "month"}

    result = PipelineResult(
        input_dir=str(input_path),
        output_dir=str(output_path),
        original_od_volume_ton=original_total,
        matrix_volume_ton=matrix_total,
        aggregation_error_pct=aggregation_error_pct,
        total_inbound_ton=total_inbound,
        total_outbound_ton=total_outbound,
        flow_balance_error_ton=abs(total_inbound - total_outbound),
        regional_monthly_error_pct=regional_monthly_error_pct,
        product_monthly_error_pct=product_monthly_error_pct,
        seasonal_index_means=seasonal_means,
        output_files=output_files + ["validation_summary.json", "build_od.log"],
    )
    with (output_path / "validation_summary.json").open("w", encoding="utf-8") as f:
        json.dump(asdict(result), f, ensure_ascii=False, indent=2)

    logger.info("Completed build-od. Aggregation error: %.8f%%; flow balance error: %.6f tons", aggregation_error_pct, abs(total_inbound - total_outbound))
    return result
