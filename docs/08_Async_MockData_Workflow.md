# Async Development Workflow using Mock Data Contracts

This document outlines the **Asynchronous Development Workflow** employed by the LogiHub engineering team. By utilizing strictly defined mock data schemas and JSON contracts, the three sub-teams (Group A, Group B, and Group C) can develop the entire proxy engine pipeline in parallel without encountering development bottlenecks or waiting for upstream data processing.

---

## 1. The Core Philosophy: "Schema-First" Integration

In a traditional waterfall development model, Group B would have to wait for Group A to finish data cleaning before they could start writing optimization algorithms. 

LogiHub circumvents this by generating a comprehensive set of **20 intermediate CSV table schemas** and a **Master JSON Contract** in the `logihub_application_code/backend/mocks/` directory at the very beginning of the project. These mock files serve as strict boundaries and development targets.

---

## 2. Team Workflow & Mock Data Utilization

### 📦 Group A: Data Ingestion & Demand Forecasting
**Role:** The foundational layer. Group A translates raw, unstructured Korean Freight O/D data into standardized inputs for the rest of the engine.
*   **Target Schemas (What they build towards):** Their Python modules must output DataFrames that perfectly match the schema of the files in `mocks/group_A_data/` (e.g., `regional_demand.csv`, `od_matrix_17_region.csv`, `monthly_demand_by_region.csv`).
*   **Workflow:** Group A focuses purely on data engineering. They know exactly what column names and data types Group B is expecting because the mock files act as the ultimate requirement specification.

### ⚙️ Group B: Cost Modeling, Capacity & Optimization (OR)
**Role:** The quantitative engine. Group B builds the mathematical solver logic (P-median, CFLP, UFLP) using libraries like PuLP.
*   **Inputs from Mock Data:** Group B **does not wait** for Group A to finish. To build and test their optimization solvers, they point their Python scripts (`cost.py`, `optimizer.py`) to read directly from the `mocks/group_A_data/` folder.
*   **Target Schemas:** Their code must successfully execute and output files that match the schema of `mocks/group_B_data/` (e.g., `scenario_comparison.csv`, `transport_cost_by_lane.csv`, `utilization_by_hub_month.csv`).
*   **Integration Switch:** Once Group A completes their code, Group B only needs to switch their input directory from the `mocks` folder to the real data pipeline output. The solvers will run flawlessly because the schema was strictly enforced.

### 📊 Group C: Heuristics, Diagnosis & Business Synthesis
**Role:** The storytelling and synthesis layer. Group C translates raw numbers into actionable business intelligence and the final API contract.
*   **Inputs from Mock Data:** Group C **does not wait** for Group B to finish solving complex algorithms. They use the fake scenarios in `mocks/group_B_data/` and the fake demand in `mocks/group_A_data/` to write their logic.
*   **Target Schemas:** Their Python modules (`diagnosis.py`, `synthesis.py`) must ingest these tables and output the ultimate `engine_output_final.json`. This JSON must perfectly validate against the updated `engine_contract.schema.json` format, mirroring the `mock_engine_output_final.json`.
*   **Frontend Handoff:** Because Group C generated a strictly compliant `mock_engine_output_final.json` on Day 1, the Next.js Frontend team (or AI generators) can immediately begin building the Dashboard, Map Viewer, and Business Case UI components without waiting for the backend Python engine to be completed.

---

## 3. The Final Integration Pipeline (The Assembly Line)

Once all three groups have successfully tested their modules against the mock data, the system is assembled in a central execution script (e.g., `runner.py`):

1.  **Ingestion:** Real Korean Freight O/D data is fed into Group A's modules.
2.  **Handoff A $\rightarrow$ B:** Group A outputs Pandas DataFrames matching the `group_A` schema, passing them directly into Group B's modules in memory.
3.  **Optimization:** Group B's solvers compute the scenarios and output DataFrames matching the `group_B` schema, passing them to Group C.
4.  **Synthesis:** Group C applies business heuristics, diagnoses the network, and compiles the final `engine_output_final.json`.
5.  **Render:** The JSON is consumed by the outcome renderer to generate the final Markdown report (`outcome_sample_full.md`) and served via API to the Next.js frontend.

By employing this mock-driven, schema-first approach, the LogiHub team achieves maximum parallel efficiency, zero development bottlenecks, and robust, predictable code interfaces.
