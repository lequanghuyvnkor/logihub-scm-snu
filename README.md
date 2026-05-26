# 🚚 LogiHub Intelligence — Logistics Decision Cockpit & Network Optimizer

Welcome to **LogiHub Intelligence**, an end-to-end logistics network optimization platform designed for modern, high-complexity supply chains in South Korea. LogiHub empowers supply chain executives to make strategic, data-driven decisions on where to place warehouse hubs, how to allocate regional demand, and how to optimize total logistics costs under high seasonal demand volatility.

---

## 🗺️ Project Architecture & Repository Map

This repository is organized into distinct, clean modules separating academic research, backend optimization algorithms, the interactive web interface, and AI capabilities:

```text
LogiHub_Project_Archive/
│
├── 📁 AutoResearchClaw/               # 🆕 AI Research Assistant Framework (researchclaw, llm, agents)
│   ├── 📁 researchclaw/               # Core AI modules (agents, llm, memory, skills, metaclaw_bridge)
│   ├── 📁 experiments/                # AI benchmarking and testing
│   ├── 📁 website/ & 📁 frontend/     # UI for the AutoResearchClaw
│   └── 📁 docs/ & 📁 tests/           # Documentation and test suites
│
├── 📁 logistics_hub_research/       # Core Academic Research & Pre-processing
│   ├── 📁 data_processed/            # Cleaned, geocoded, and structured dataset (CSV format)
│   ├── 📁 scripts/                   # Data pipelines, geocoding & baseline analytics
│   ├── 📁 outputs/                   # Optimization outputs (figures, optimization)
│   └── 📁 reports/                   # 🆕 Generated research reports
│
├── 📁 logihub_application_code/     # Live Production-Grade Software Suite
│   ├── 📁 backend/                   # FastAPI Server & Optimization Solvers
│   │   ├── 📁 engine_a/              # 🆕 Group A: Data & Demand Processing Engine
│   │   ├── 📁 engine_b/              # 🆕 Group B: Cost Modeling & Optimization Engine
│   │   └── 📁 mocks/                 # Fully decoupled mock data for independent team testing
│   │
│   └── 📁 frontend/                  # Next.js Interactive Dashboard
│       └── 📁 src/                   # v2 UI with 11-step gated flow and live-reload
│
├── 📁 docs/                          # Structured Project Delivery Packages (Markdown conversions)
├── 📁 codegraph_output/              # 🆕 Generated codebase architecture graphs
├── 📄 LogiHub_GroupC_Master_Guide.md # 🆕 Master Guide for Group C Heuristics & Operations
├── 📄 LogiHub_Proxy_Engine_Midterm.pptx # 🆕 Midterm Presentation Slides
├── 📄 run_servers.ps1                # 🆕 PowerShell script to spin up project services
├── 📄 engine_contract.schema.json    # Strict JSON Draft-07 API Contract Schema
└── 📄 .gitignore                     # Optimized git filters
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

5. **AutoResearchClaw (AI Research Assistant)**:
   - A newly integrated automated AI framework utilizing LLMs to streamline literature review, benchmarking, and codebase interaction, driving smart decision-making.

---

## 🛠️ Quick Start & Local Setup

> [!IMPORTANT]
> **Before running any commands**, make sure you open your terminal (Command Prompt, PowerShell, or Bash) and navigate to your local project root directory.
> ```cmd
> cd /path/to/LogiHub_Project_Archive
> ```

### 🚀 1-Click Start (Windows Recommended)
We have added a streamlined PowerShell script to instantly spin up both the Backend and Frontend servers. Simply run:
```powershell
.\run_servers.ps1
```
This will automatically launch the FastAPI and Next.js servers in separate windows and open the dashboard in your default browser.

### Manual Setup (Backend API)
If you prefer starting services manually, follow these steps:
#### 🟦 Windows (PowerShell) / 💻 CMD
```powershell
cd logihub_application_code/backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # Use 'call venv\Scripts\activate' on CMD
pip install -r requirements.txt
uvicorn main:app --reload
```

### Manual Setup (Frontend Dashboard)
#### 🟦 Windows / 🍎 macOS / Linux
```bash
cd logihub_application_code/frontend
npm install
npm run dev
```

> [!TIP]
> **Windows Terminal Freezing?** If your terminal seems "frozen" while running, you might have accidentally activated QuickEdit mode. Simply press **`ESC`** or **`Enter`** to unfreeze it!

> [!WARNING]
> **NEVER run `npm audit fix --force`**: It forcefully upgrades core frameworks and causes severe dependency conflicts (ERESOLVE) that will break the application.

---

## 👥 Meet the Team & WBS Roles
LogiHub is developed by a high-performing 3-person engineering team structured under independent, concurrent roles:
- **Group A (Data & Demand)**: Core ingestion pipelines, O/D matrices, and monthly demand-seasonality indexes.
- **Group B (Costs, Capacity & Optimization)**: LP modeling, PuLP integration, cost-formula tuning, and stress tests.
- **Group C (Segmentation, Synthesis & Business Case)**: Product family heuristics, role assignment engine, business-cockpit reporting, and executive summary generation.

*For detailed team guides, deliverables, and role specifications, please refer to the onboarding packages in the [docs/](file:///c:/Users/PC/Downloads/LogiHub_Project_Archive/docs) directory.*
