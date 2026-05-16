"""Standalone CLI for LogiHub Group A data-demand pipeline.

Usage:
    python -m engine.cli build-od --input data/ --output output/
"""
from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import asdict
from pathlib import Path

from .pipeline import run_pipeline


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="python -m engine.cli", description="LogiHub Group A standalone CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    build_od = subparsers.add_parser("build-od", help="Run A1-A4 data pipeline and write output CSV tables")
    build_od.add_argument("--input", required=True, help="Input data folder containing od_clean_long_2023.csv, warehouse_geocoded.csv, warehouse_capacity_17_regions.csv")
    build_od.add_argument("--output", required=True, help="Output folder for generated CSV tables and system logs")
    return parser


def _setup_logging(output_dir: Path) -> logging.Logger:
    output_dir.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger("logihub.build_od")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()
    formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")

    stream = logging.StreamHandler(sys.stdout)
    stream.setFormatter(formatter)
    logger.addHandler(stream)

    file_handler = logging.FileHandler(output_dir / "build_od.log", encoding="utf-8")
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.command == "build-od":
        output_dir = Path(args.output)
        logger = _setup_logging(output_dir)
        try:
            result = run_pipeline(args.input, output_dir, logger=logger)
        except Exception as exc:  # explicit operational failure for terminal users
            logger.exception("build-od failed: %s", exc)
            return 1
        print(json.dumps(asdict(result), ensure_ascii=False, indent=2))
        return 0
    parser.error("Unknown command")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
