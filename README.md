# 🚚 LogiHub Intelligence — Logistics Decision Cockpit & Network Optimizer

Welcome to **LogiHub Intelligence**, an end-to-end logistics network optimization platform designed for modern, high-complexity supply chains in South Korea. LogiHub empowers supply chain executives to make strategic, data-driven decisions on where to place warehouse hubs, how to allocate regional demand, and how to optimize total logistics costs under high seasonal demand volatility.

---

## 🗺️ Project Architecture & Repository Map

This repository is organized into distinct, clean modules separating academic research, backend optimization algorithms, and the interactive web interface:

```text
LogiHub_Project_Archive/
│
├── 📁 logistics_hub_research/       # Core Academic Research & Pre-processing
│   ├── 📁 data_raw/                  # Raw Korean Freight O/D & Warehouse Registries (Korean)
│   ├── 📁 data_processed/            # Cleaned, geocoded, and structured dataset (CSV format)
│   ├── 📁 scripts/                   # Data pipelines, geocoding & baseline analytics
│   └── 📁 outputs/                   # Static optimization outputs, plots & charts
│
├── 📁 logihub_application_code/     # Live Production-Grade Software Suite
│   ├── 📁 backend/                   # FastAPI Server & Optimization Solvers
│   │   ├── 📁 mocks/                 # Fully decoupled mock data for independent team testing
│   │   ├── 📄 main.py                # REST API Endpoints (Upload, Base, Optimizers)
│   │   ├── 📄 models.py              # Mathematical Solver engines (PuLP: P-Median, CFLP, MCLP, UFLP)
│   │   └── 📄 test_models.py         # End-to-end local solver test pipeline
│   │
│   └── 📁 frontend/                  # Next.js Interactive Dashboard
│       ├── 📁 src/components/        # DashboardView, OptimizerWizard, MapViewer, ScenariosView
│       └── 📁 src/app/               # Application Routing & Layout (TailwindCSS)
│
├── 📁 docs/                          # Structured Project Delivery Packages (Markdown)
│   ├── 📄 01_Package_for_Group_A.md  # Group A: Demand Analytics & Ingestion Specs
│   ├── 📄 02_Package_for_Group_B.md  # Group B: Cost Modeling & Solver Specifications
│   ├── 📄 03_Package_for_Group_C.md  # Group C: Heuristics, Synthesis & Copywriting Specs
│   ├── 📄 04_MID_ProxyEngine.md      # Midterm Engine Specs & Flowcharts
│   ├── 📄 05_OUT_DocsResearch.md     # E2E Master Research Report (Bilingual English-Korean 🇰🇷🇺🇸)
│   ├── 📄 06_OUT_CostEngine6Comp.md  # Cost Engine Simulation Breakdown
│   └── 📄 07_OUT_OutcomeAnalysisExample.md # SCM Strategic Case Study Report (Bilingual English-Korean 🇰🇷🇺🇸)
│
├── 📄 LogiHub_Project_Onboarding.md  # 🚀 Main Team Onboarding Guide (Vietnamese - Start Here!)
├── 📄 LogiHub_Engine_v2_Redesign.md  # Engine Architectural Specification & Schema Redesign
├── 📄 LogiHub_Midterm_Plan_3People_18days.md # Team Schedule, Deliverables & WBS
├── 📄 engine_contract.schema.json    # Strict JSON Draft-07 API Contract Schema
└── 📄 .gitignore                     # Optimized git filters (ignores massive PDF textbooks/raw data)
```

---

## ⚡ Key Highlights & Engineering Excellence

1. **Comprehensive Solver Suite (`models.py`)**:
   - **P-Median Model**: Minimizes total demand-weighted distance for $P$ facilities.
   - **Capacitated Facility Location (CFLP)**: Minimizes joint fixed warehouse costs and continuous variable transport costs subject to capacity bounds.
   - **Uncapacitated Facility Location (UFLP)**: Balances opening fixed costs against transport distances.
   - **Maximal Covering Location (MCLP)**: Optimizes coverage within a critical service radius ($R$).

2. **Decoupled Async Team Strategy**:
   - Built on a strict **JSON Contract Schema** (`engine_contract.schema.json`), allowing Frontend (Next.js) and Backend (FastAPI) to develop completely in parallel with locked, predictable mock boundaries.

3. **High-Grade Korean Geolocation Proxy**:
   - Leverages **Korean National Freight O/D (2022/2023)** data from the Ministry of Land, Infrastructure, and Transport as a proxy to model nationwide consumer distribution across 17 administrative provinces.

4. **100% Clean & Production Ready**:
   - Fully optimized `.gitignore` prevents repository bloat from multi-megabyte research PDFs and Excel sheets while preserving rapid-deployment codebase.

---

## 🛠️ Quick Start & Local Setup

### 1. Backend API (FastAPI)
Navigate to the backend directory, spin up a Python virtual environment, install dependencies, and run:
```bash
cd logihub_application_code/backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python test_models.py          # Run end-to-end mathematical solver check
uvicorn main:app --reload      # Start local development server on http://localhost:8000
```

### 2. Frontend Dashboard (Next.js + React Leaflet)
In another terminal, set up and run the modern UI:
```bash
cd logihub_application_code/frontend
npm install
npm run dev                    # Starts UI on http://localhost:3000
```

---

## 👥 Meet the Team & WBS Roles
LogiHub is developed by a high-performing 3-person engineering team structured under independent, concurrent roles:
- **Group A (Data & Demand)**: Core ingestion pipelines, O/D matrices, and monthly demand-seasonality indexes.
- **Group B (Costs, Capacity & Optimization)**: LP modeling, PuLP integration, cost-formula tuning, and stress tests.
- **Group C (Segmentation, Synthesis & Business Case)**: Product family heuristics, role assignment engine, business-cockpit reporting, and executive summary generation.

*For full project timelines, meeting schedules, and detailed guides, please refer to the [LogiHub Project Onboarding Guide](file:///c:/Users/PC/Downloads/LogiHub_Project_Archive/LogiHub_Project_Onboarding.md).*
