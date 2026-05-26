# 🚚 LogiHub Intelligence — Logistics Decision Cockpit & Network Optimizer

Welcome to **LogiHub Intelligence**, an end-to-end logistics network optimization platform designed for modern, high-complexity supply chains in South Korea. LogiHub empowers supply chain executives to make strategic, data-driven decisions on where to place warehouse hubs, how to allocate regional demand, and how to optimize total logistics costs under high seasonal demand volatility.

---

## 🆕 Recent Updates (May 25-26, 2026)

**lequanghuyvnkor:**
- Converted PDF documents to Markdown, organized in `docs/` with proper numbering.
- Introduced a mid-level company size threshold across 8 product groups.
- Restructured groups A1-A5 to support 6 product families, adding Pharmaceuticals.
- Fixed optimizer crashes and filtered out private warehouses from the dataset.
- Added live-reload support for development, automatically refreshing the browser on JSX/CSS changes.
- Streamlined the frontend workflow (13 steps reduced to 11) and added cache-busting to script tags.

**seouldsv7-alt:**
- Configured a new `requirements.txt` for standardized Python environments.
- Continuously improved and refined `advanced_engine.py` and `config.json`.
- Updated Command Line Interface logic in `cli.py`.

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
├── 📁 docs/                                   # Structured Project Delivery Packages (Markdown)
│   ├── 📄 01_IN_Package_for_Group_A.md        # Group A: Demand Analytics & Ingestion Specs [IN]
│   ├── 📄 02_IN_Package_for_Group_B.md        # Group B: Cost Modeling & Solver Specifications [IN]
│   ├── 📄 03_IN_Package_for_Group_C.md        # Group C: Heuristics, Synthesis & Copywriting Specs [IN]
│   ├── 📄 04_IN_Async_MockData_Workflow.md    # Async Mock-Driven Pipeline & Team Onboarding Workflow [IN]
│   ├── 📄 04a_IN_How_to_Understand_this_Project_EN.md  # E2E Product Flow & System Architecture — English Version [IN]
│   ├── 📄 04b_IN_How_to_Understand_this_Project_KO.md  # E2E Product Flow & System Architecture — Korean Version [IN]
│   ├── 📄 05_MID_ProxyEngine.md               # Midterm Proxy Engine Architecture & Solver Specifications [MID]
│   ├── 📄 06_MID_Proxy_to_Production_Engine.md # Bilingual Transition Paper: Proxy O/D to Production Engine [MID]
│   ├── 📄 07_OUT_DocsResearch.md              # E2E Master Research Report (Bilingual English-Korean 🇰🇷🇺🇸) [OUT]
│   ├── 📄 08_OUT_CostEngine6Comp.md           # Cost Engine 6-Component Simulation Breakdown [OUT]
│   └── 📄 09_OUT_OutcomeAnalysisExample.md    # SCM Case Study Strategic Outcome Report (Bilingual English-Korean 🇰🇷🇺🇸) [OUT]
│
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

> [!IMPORTANT]
> **Before running any commands**, make sure you open your terminal (Command Prompt, PowerShell, or Bash) and navigate to your local project root directory (replace `/path/to` with the actual path on your computer):
> ```cmd
> cd /path/to/LogiHub_Project_Archive
> ```

### 1. Backend API (FastAPI)

Choose the block below that matches your operating system and terminal shell to avoid errors when copy-pasting:

#### 💻 Windows (Command Prompt - CMD)
```cmd
cd logihub_application_code\backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python test_models.py
uvicorn main:app --reload
```

#### 🟦 Windows (PowerShell)
```powershell
cd logihub_application_code/backend
python -m venv venv
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python test_models.py
uvicorn main:app --reload
```

#### 🍎 macOS / Linux (Bash/Zsh)
```bash
cd logihub_application_code/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python test_models.py
uvicorn main:app --reload
```

### 2. Frontend Dashboard (Next.js + React Leaflet)

The easiest way to start the frontend is to open the terminal directly inside the folder:

1. Mở thư mục **`LogiHub_Project_Archive/logihub_application_code/frontend`** bằng File Explorer.
2. Click chuột phải vào khoảng trắng trong thư mục, chọn **"Open in Terminal"** (Mở trong Terminal).
3. Chạy các lệnh sau:

#### 💻 Windows (Command Prompt - CMD)
```cmd
npm install
npm run dev
```

#### 🟦 Windows (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
npm install
npm run dev
```

#### 🍎 macOS / Linux (Bash/Zsh)
```bash
npm install
npm run dev
```

> [!TIP]
> **Windows Terminal Freezing?** If your Command Prompt or PowerShell seems "stuck" or "frozen" while running commands, you might have accidentally clicked inside the window (which activates Windows QuickEdit selection mode). Simply press **`ESC`** or **`Enter`** to unfreeze and resume execution!

> [!WARNING]
> **NEVER run `npm audit fix --force`**: After running `npm install`, you might see warnings about vulnerabilities (`npm warn deprecated...`) and a suggestion from your terminal to run `npm audit fix --force`. **Do NOT run this command.** It will forcefully upgrade core frameworks (like Next.js/ESLint) and cause severe dependency conflicts (ERESOLVE) that will break the application and prevent it from starting.

---

## 👥 Meet the Team & WBS Roles
LogiHub is developed by a high-performing 3-person engineering team structured under independent, concurrent roles:
- **Group A (Data & Demand)**: Core ingestion pipelines, O/D matrices, and monthly demand-seasonality indexes.
- **Group B (Costs, Capacity & Optimization)**: LP modeling, PuLP integration, cost-formula tuning, and stress tests.
- **Group C (Segmentation, Synthesis & Business Case)**: Product family heuristics, role assignment engine, business-cockpit reporting, and executive summary generation.

*For detailed team guides, deliverables, and role specifications, please refer to the onboarding packages in the [docs/](file:///c:/Users/PC/Downloads/LogiHub_Project_Archive/docs) directory.*
