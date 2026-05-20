# How to Understand this Project?

## LogiHub Product Flow — From Input Data to Advisory Report

---

### Operational Pipeline Overview

LogiHub is an intelligence engine that transforms raw corporate transportation transaction data into a comprehensive ~20-page advisory report. This report specifically prescribes where the enterprise should establish new warehouse nodes, which existing facilities to decommission, the exact annual cost-savings generated, and the concrete operational strategy to deploy during seasonal peak windows. The entire end-to-end processing pipeline takes approximately 5 to 15 minutes from file upload to final PDF report delivery.

The system is designed as a sequential four-station production line:
*   **Station 1 (Data Ingestion & Normalization):** Ingests raw corporate transaction data and normalizes it.
*   **Station 2 (Market Enrichment):** Enriching corporate data with pre-collected market registries and geo-intelligence.
*   **Station 3 (Three-Tier Processing Filters):** Executes three consecutive analytical and mathematical filters.
*   **Station 4 (Auto-Generation & Packaging):** Formulates the final business case, roadmap, and compiles the polished advisory report.

Each station has strict validation gates to prevent downstream error propagation. The process concludes with a cross-logic validation check to ensure no contradictory recommendations are made in the final report.

The core design philosophy is to minimize customer data friction. Instead of requiring complex, hard-to-access data fields, the enterprise only needs to provide three standard transaction sets that are readily available in any corporate ledger. All national logistics registries, seasonal events, transport matrices, and traffic speeds are natively maintained by LogiHub. This is a critical departure from traditional supply chain consulting software, which typically requires manual configuration of hundreds of variables.

---

## PART 1: Enterprise-Provided Data

### 1.1. Enterprise Profile

Upon registering an account, the user completes a quick onboarding form requiring five mandatory parameters:

1.  **Enterprise Scale:** Small (annual revenue under 100 billion KRW), Medium (100 billion to 1 trillion KRW), or Large (over 1 trillion KRW). The scale dictates default SLA thresholds. For example, a Small enterprise has a higher late-delivery tolerance (up to 15% late shipments are considered acceptable). A Large enterprise faces much stricter parameters—a 3% late-delivery rate triggers a red alert. Additionally, customer churn/cancellation rates due to delivery delays vary by scale: 8% for Small, 15% for Medium, and 25% for Large enterprises (as larger clients have higher service expectations and abundant alternatives).
2.  **Primary Product Category:** One of six pre-defined product families: Cold Chain, Electronics, Food and Beverage, Fashion and Cosmetics, Medical, and General Cargo. If the uploaded transaction file lacks granular product SKU codes, the system defaults to this primary product category instead of guessing blindly.
3.  **Delivery Service Commitment (SLA):** The committed transit time to customers (in hours). This parameter is vital for mapping "delivery blind spots". Defaults are set to 24 hours for general cargo, 6 hours for fresh/cold items, and 4 hours for urgent medical supplies. Users can customize this parameter per product category.
4.  **Cap on Capital Expenditure (CAPEX Budget):** The maximum annual budget the enterprise is willing to allocate for lease and fixed warehouse operations. This serves as a mathematical constraint in the optimizer, preventing the system from proposing financially unviable configurations. Users can select "unlimited" to seek the theoretical lowest-cost network.
5.  **Priority Regions:** A customized list of geographical regions where the enterprise wishes to prioritize coverage. This can be left blank, allowing the system to recommend optimal coverage purely based on data distributions.

### 1.2. Shipping Demand Transactions

The enterprise uploads a spreadsheet containing historical transportation logs spanning at least 6 months (ideally 12 months).

Each row represents a single shipment, containing seven mandatory columns:
1.  **Shipment Date**
2.  **Origin Region** (province name or administrative code)
3.  **Destination Region**
4.  **Product Sub-Category Code** (mapped to one of 60 standard codes that map to the 6 primary product families)
5.  **Weight** (in metric tons)
6.  **Vehicle Trips** (if recorded)
7.  **Actual Transit Time** (if available)

The system is designed to handle dirty, unstandardized raw data. In practice, client files contain numerous minor anomalies—misspelled province names, non-standard product codes, mixed date formats, and conflicting weight units (e.g., kilograms mixed with tons). A smart ingestion filter automatically normalizes these inputs: maps region names via a localized synonym dictionary (e.g., "Gyeonggi", "kyung-gi", and "경기" all resolve to Gyeonggi Province); maps sub-category codes using text similarity/embeddings; converts dates to `YYYY-MM-DD` format; and standardizes all weights to metric tons.

Once normalized, the system displays a "Data Ingestion Summary" showing the first 100 standardized rows, flagged with red markers on low-confidence guesses. The user can manually override any misinterpretations before confirming. The pipeline requires the user to validate at least 90% of the parsed rows before proceeding.

### 1.3. Existing Warehouse Network (Optional)

If the enterprise already operates an active network, they can declare existing nodes by inputting six key parameters per warehouse: name/code, full address, maximum storage capacity (in cubic meters or tons), lease type (self-operated, long-term lease, or seasonal), annual fixed operating cost (lease, labor, utilities), and primary product category handled.

For startups building a network from scratch or businesses expanding into new territory, this section can be left blank. The system then enters "Greenfield Design" mode instead of "Brownfield Network Optimization". While both modes share the same optimization backend, the generated report tone changes—Greenfield mode focuses heavily on recommended leases, whereas Brownfield mode focuses on warehouse retention, consolidation, and liquidation.

### 1.4. Ingestion Gate and Validation

Upon clicking upload, the system runs seven validation checks before proceeding:
1.  **File Format Verification:** Validates that the file is a standard spreadsheet format.
2.  **Minimum Record Volume Check:** Rejects datasets under 100 shipments to ensure statistical significance.
3.  **Temporal Distribution Check:** Rejects datasets spanning less than one month, as seasonal patterns cannot be extracted.
4.  **Geographic Distribution Check:** Requires at least five distinct origin-destination regional pairs to make network allocation mathematically meaningful.
5.  **Product Family Diversity Check:** Requires shipments to span at least three distinct product groups.
6.  **Outlier & Anomaly Detection:** Flags extreme anomalies (e.g., a single shipment of 100,000 tons, or negative transit times).
7.  **Original Archive Archival:** Saves a secure, read-only copy of the raw upload for future lineage and auditing.

Upon clearing all seven validation checks, the system advances to Part 2.

---

## PART 2: System-Enriched Market Intelligence

The enterprise is not required to provide external market data. LogiHub automatically enriches the dataset with three pre-built, quarterly updated market databases:

### 2.1. National Warehouse Registry

LogiHub maintains a comprehensive registry of over 4,400 commercial warehouses across South Korea, aggregated from three sources:
1.  Public databases from transport and logistics regulatory bodies.
2.  Commercial listings from major industrial real estate platforms.
3.  Proprietary web scrapers capturing industrial lease listings.

For each warehouse, the registry tracks twelve variables: hub code, operator name, province, detailed address, latitude/longitude coordinates, total floor area, weight capacity, estimated annual fixed cost, primary product family (mapped to one of 6 standard groups), special certifications (e.g., cold storage, hazardous materials, high-security, Good Distribution Practice/GDP for pharmaceuticals), leasing availability status, and address verification confidence.

This registry is a core strategic asset of LogiHub, allowing the generated advisory report to prescribe concrete options (e.g., "Lease warehouse [A], contact operator [B] at [Phone Number]") instead of vague recommendations like "lease warehouse space in Gyeonggi Province."

### 2.2. Seasonal Event Catalog

The system maintains an event library containing over 30 entries categorized into four groups:
1.  **Recurring Cultural Events:** Lunar New Year (late January/early February), Chuseok (late September/early October), Parents' Day (May), Children's Day (May), and Teacher's Day (May). Each event is mapped to exact calendar dates with a demand multiplier per product family. For example, during Chuseok, Food & Beverage demand is multiplied by 2.7x, Cold Chain by 3.1x, and General Cargo by 1.5x.
2.  **Recurring Commercial Campaigns:** Single's Day (11/11), Black Friday, Year-End Sales, and major tech launch windows. Each event is localized by geographical impact (e.g., 11/11 peak volume is heavily concentrated in urban centers due to high e-commerce adoption).
3.  **Unplanned Disruptive Risks:** Pandemic waves, product recall events, severe weather/natural disaster closures, and national transport union strikes. The system logs historical patterns of these disruptions to run stochastic stress testing.
4.  **Category-Specific Cycles:** Agricultural harvest windows, back-to-school surges for stationery, and flagship smartphone release cycles. These events only scale demand for their respective product families.

### 2.3. Real-World Transportation Matrix

The system embeds a pre-computed road distance and transit time matrix between all 17 administrative provinces in South Korea. Rather than utilizing haversine "as-the-crow-flies" distance (which introduces severe errors), LogiHub uses actual road freight routes, accounting for average off-peak and peak congestion times.

It also logs the exact distance from each warehouse candidate to primary national transport gateways: Busan Port, Incheon Port, Pyeongtaek Port, Gwangyang Port, and Incheon International Airport. This enables the optimizer to intelligently assign "Gateway/Port Node" roles to close-proximity warehouses.

Lastly, the system monitors the 50 most congested freight corridors nationwide. During calculations, the system prioritizes routing that bypasses bottlenecks along these high-volume lanes.

---

## PART 3: Three-Tier Processing Filters

Once corporate data is enriched with market intelligence, it passes through three sequential processing filters:

### 3.1. Filter 1: Physical Feasibility and Legal Compliance

This filter filters out physically or legally impossible warehouse allocations early, avoiding unnecessary computational overhead in downstream optimization.

The system evaluates each transaction against three decision matrices:
1.  **Temperature Requirements:** Cold Chain shipments are restricted to candidate hubs possessing deep-freeze (below -18°C) or chilled (below 4°C) certifications. A cold-chain shipment is immediately barred from standard dry warehouses.
2.  **Regulatory & Safety Compliance:** Industrial materials classified as hazardous (e.g., batteries, chemicals, explosives) are restricted to warehouses certified for dangerous goods. Pharmaceutical and medical shipments are restricted to Good Distribution Practice (GDP) certified nodes.
3.  **Security Standards:** High-value Electronics and premium Fashion & Cosmetics are highly recommended (non-mandatory) to be routed through facilities featuring multi-layer security (electronic gates, AI-powered CCTV, 24/7 security personnel). If routed through a lower-security warehouse, the scenario incurs a score penalty rather than hard exclusion.

Simultaneously, Filter 1 converts shipment weights (tons) into physical storage volumes (Cubic Meters - CBM). This is a critical step often overlooked by corporate planners. Warehouses lease space based on volume (CBM), not weight (tons), and different product families have highly distinct packing densities. For example, one ton of apparel occupies roughly 6 CBM due to high volume-to-weight ratio, whereas one ton of metal occupies only 0.3 CBM. Calculating capacity purely on weight causes planners to under-lease or over-lease space by up to 20x. The system resolves this by applying density factors from a 60-row master catalog mapping the 60 sub-categories.

### 3.2. Filter 2: Seasonality Demand Multipliers

This filter projects future network throughput by accounting for peak volatility rather than flat annual averages. Building a logistics network based on average demand guarantees catastrophic failures during peak season.

The system extracts the normalized historical demand and expands it chronologically. For each of the 6 product families and each month of the 12-month planning horizon, it constructs a dynamic demand multiplier.

The multiplier is computed as:
`Demand Multiplier = Base Seasonality Index + Event Impact + Stochastic Volatility`

For example, Food & Beverage has a base Chuseok seasonality index of 1.15 in September. If Chuseok falls in October, the system injects a 2.7x peak multiplier specifically targeting a 21-day window around the holiday. Finally, it adds a ±15% stochastic margin to model random market volatility.

A unique feature of Filter 2 is spatial demand shifting. For instance, during the Lunar New Year, demand does not merely increase overall—it shifts geographically out of corporate office centers like Seoul into rural hometowns, followed by massive retail surges. LogiHub incorporates public population mobility indices to model this geographic demand migration, avoiding a common pitfall in competing software.

### 3.3. Filter 3: Mathematical Optimization Solver

This is the analytical core of LogiHub. Taking the peak demand projections from Filter 2 and the compliant warehouse candidates from Filter 1, it executes three mathematical optimization models in parallel:

1.  **Unconstrained P-Median Solver ("Where to place major hubs"):** Solves the traditional facility location problem, testing configurations of 3, 5, or 7 major national hubs. It minimizes total demand-weighted transportation distance without factoring in warehouse fixed costs.
2.  **Capacitated Cost Optimizer ("Which warehouses to lease under a budget"):** A highly realistic solver that balances fixed lease costs, labor costs, and variable transport rates (fuel, toll fees, driver wages). It identifies the optimal combination of warehouses that minimizes total logistics cost under the CAPEX constraint set in Section 1.1.
3.  **Stochastic Stress-Testing Solver ("Which network configuration is resilient"):** Runs 100 stress-testing simulations (e.g., peak demand surges, sudden warehouse closures, highway bottlenecks, labor strikes). It ranks the configurations generated by Solvers 1 and 2 based on their survival rates under disruption.

The system aggregates these results into three distinct recommended network scenarios:
*   **Least-Cost Scenario:** Prioritizes absolute expenditure savings (may trade off service speed).
*   **Highest-Service Scenario:** Prioritizes maximum SLA coverage and speed (incurs higher CAPEX).
*   **Balanced Scenario:** The optimal middle-ground, balancing cost efficiency, speed, and resilience.

---

## PART 4: Automated Narrative Generation Engine

The final deliverable is a ~20-page, fully written SCM advisory report in English. Rather than presenting raw, sterile spreadsheets, the system translates mathematical outputs into natural, actionable business narratives.

### 4.1. Section 1: Current Network Diagnostics

This section acts as a comprehensive diagnosis, pointing out structural flaws in the client's current logistics setup with specific root-cause analysis.

*   **Warehouse Overload Logic:** Divided by dividing peak demand by actual storage capacity. If capacity utilization exceeds 100%, a Red Alert is flagged. If it lies between 85% and 100%, a Yellow Alert is flagged. The narrative tone dynamically adapts based on severity: over 130% uses the term "operational collapse" (vỡ trận), 100%-130% uses "capacity overflow" (tràn), and 85%-100% uses "capacity strain" (căng cứng).
    *Template:* "The [Warehouse Name] in [Region] is projected to experience [Severity Tag] in [Month] due to a [Percentage]% surge in [Primary Product] peak demand. Specifically, peak demand will reach [CBM] CBM against a maximum capacity of [CBM], exceeding safe limits by [Percentage]%. This bottleneck is primarily driven by [Event Name]."
*   **Delivery SLA Blind Spots:** Calculated using the enterprise's SLA target (e.g., 24 hours). The system maps transit times from the nearest warehouse to each customer zone using the real-world road matrix. Customer zones exceeding the SLA are flagged as "blind spots."
    *Template:* "Customer shipments in [Province Name] are currently violating the [SLA Hours]-hour delivery commitment. The closest serving warehouse is [Warehouse Name], located [Distance] km away, requiring a real-world transit time of [Hours] hours ([Chuyên Hours] hours over SLA). This delivery gap is projected to impact [Percentage]% of shipments in this region, representing [Percentage]% of the company's annual order volume."
*   **Asset Inefficiency Flagging:** Identifies "capital-draining" nodes where the storage cost per CBM exceeds industry medians by over 50% while operating at under 30% average utilization.
    *Template:* "The [Warehouse Name] is currently incurring [Cost] in annual fixed overhead while utilizing only [Percentage]% of its capacity on average. The resulting storage cost per CBM is [Cost], which is [Percentage]% higher than the market median. We strongly recommend terminating this lease and consolidating inventory into [Target Warehouse]."
*   **Gateway Congestion:** Pinpoints bottlenecked transport lanes.

### 4.2. Section 2: Strategic Hub Role Assignment

The engine assigns one of six strategic roles to each active warehouse: Mega Hub (national fulfillment), Regional Hub (regional servicing), Secure Node (high-value asset protection), Service Node (last-mile customer proximity), Port/Cross-Dock Node (high-velocity transit), or Reserve Node (seasonal peak support).

*   **Cold Chain Distribution Hub Recommendation:** If Cold Chain and F&B shipments exceed 50% of a node's throughput and the node's capacity sits in the top 30% nationally, the system recommends upgrading it.
    *Template:* "The [Warehouse Name] currently handles [Percentage]% temperature-sensitive inventory. We recommend upgrading this asset into a dedicated Cold Chain Distribution Hub, requiring an estimated CAPEX of [Amount]. By consolidating, the enterprise can reduce refrigeration energy waste by [Percentage]% and accelerate picking cycles by [Percentage]%."
*   **Gateway Node Optimization:** Triggered if a warehouse sits within 50 km of a major port and capacity is in the top 50%.
    *Template:* "The [Warehouse Name] is located just [Distance] km from [Port Name]. We recommend specializing this node into a Port Gateway Node, designed to ingest imports directly, sort by product family, and cross-dock shipments directly to Regional Hubs within 24 hours. This will reduce average storage hold times from [Days] to [Days] days."
*   **Dynamic Last-Mile Node (Resolution Hub):** Recommended to resolve delivery blind spots. The system scans the national registry for small candidate nodes (200 - 1,000 CBM) near the blind spots with low lease costs, proposing a short-term lease.
    *Template:* "To resolve the delivery gap in [Province], we recommend leasing a [Capacity] CBM local facility operated by [Operator] at [Address] for an annual lease of [Amount]. Acting as a Dynamic Last-Mile Node, it will receive daily morning line-hauls from [Regional Hub] and execute local same-day dispatches. This will reduce average transit times from [Hours] to [Hours] hours."
*   **Reserve Node Downgrade:** Recommends downgrading inefficient, capital-draining warehouses into seasonal reserve nodes, activated only during peak windows to save fixed overhead.

### 4.3. Section 3: Event Response Playbook

Written as a highly actionable, command-style manual for operations directors. It dynamically prints playbooks only for events relevant to the client's industry.

*   **Mitigation Action Logic:** Maps four variables: Event Name, Peak Impact Period, Most Affected Product Family, and expected Warehouse Overload status. It selects from twelve pre-defined operational actions (e.g., pre-positioning inventory, activating reserve nodes, shifting transport to alternative lanes, seasonal hiring, capping maximum storage time, dynamic pricing, cross-regional inventory pooling).
    *Template:* "To mitigate the impact of [Event Name] scheduled from [Start Date] to [End Date], which is projected to drive a [Percentage]% increase in [Product Family] demand and overflow [Number] Regional Hubs by [Percentage]%, the Operations Director is instructed to execute the following three steps. Step 1: [Action 1] [Days] days prior to the event. Step 2: [Action 2] once warehouse utilization crosses [Percentage]%. Step 3: [Action 3] under worst-case escalation. Target KPIs: Delivery SLA success rate ≥ [Percentage]%, Customer Order Cancellation Rate ≤ [Percentage]%."
*   **Graceful De-escalation (Exit Rules):** Ensures the enterprise stops incurring emergency expenses immediately after the peak passes.
    *Template:* "Following the conclusion of [Event Name], monitor local demand for a [Days]-day window. Once demand stabilizes below [Percentage]% of the annual median for [Days] consecutive days, execute graceful de-escalation: terminate temporary driver contracts, deactivate the [Reserve Node], and return to standard shipping lanes."

### 4.4. Section 4: SCM Business Case & ROI Analysis

Tailored for C-level executives, translating all logistics metrics into financial impacts.

*   **Cost of Inaction:** Quantifies the financial loss of maintaining the current network.
    *Template:* "If the enterprise maintains its current network, it is projected to lose [Amount] in annual revenue due to customer order cancellations. This comprises [Percentage]% during the Chuseok peak, [Percentage]% during Year-End campaigns, and [Percentage]% due to persistent SLA blind spots. Incorporating a brand reputation impact factor of [Factor] tailored for the [Product Family] sector, total annual losses are estimated at [Amount]."
*   **ROI of Recommended Network:** Computes the payback period and benefit-to-cost ratio.
    *Template:* "The recommended Balanced Scenario requires an additional annual fixed cost of [Amount]. However, it prevents [Amount] in cancelled revenue, generates [Amount] in new revenue via expanded SLA coverage, and reduces variable shipping costs by [Amount] through corridor optimization. The net annual value created is [Amount], representing a payback period of [Months] months and a benefit-to-cost ratio of [Ratio]. Recommendation: [Execute Immediately / Phased Pilot / Re-evaluate]."
    *Decision Thresholds:* Ratio > 2.5 -> "Execute Immediately"; 1.5 - 2.5 -> "Phased Pilot"; < 1.5 -> "Re-evaluate".
*   **Scenario Comparison Matrix:** Presents a structured table comparing the current network, Least-Cost, Highest-Service, and Balanced scenarios across cost, transit speed, SLA coverage, risk resilience, and payback period.

### 4.5. Section 5: Phased Implementation Roadmap

Maps the transition into a 12-to-18-month phased roadmap with clear owners, budgets, and milestones:
*   **Months 1-2: Legal & HR Setup** (Warehouse lease contract signings, decommissioning underperforming nodes, hiring key regional managers).
*   **Months 3-4: Infrastructure & Tech Integration** (Installing refrigeration units, setting up high-security systems, deploying unified Warehouse Management Systems).
*   **Months 5-6: Localized Pilot Phase** (Testing the flow in a single region to identify operational friction).
*   **Months 7-8: National Scale-Up** (Full activation of the optimized network nationwide).
*   **Months 9+: Continuous Optimization** (Running quarterly LogiHub iterations with updated transaction logs).

---

## PART 5: Packaging & Final Compilation

Before final delivery, the system runs three post-processing steps:
1.  **Cross-Logic Validation Check:** Ensures absolute alignment across all report sections (e.g., a node cannot be recommended for decommissioning in Section 1 and designated as a Mega Hub in Section 2).
2.  **Stylistic Narrative Polishing:** Applies natural language processing to smooth transitions, ensuring professional, engaging SCM prose instead of repetitive template outputs.
3.  **Format Compilation:** Embeds corporate styling (logos, typography, brand colors), generates four standard SCM charts (monthly demand distributions, spatial hub mapping, scenario cost comparisons, and ROI payback curves), compiles the table of contents, and packages the final PDF/HTML interactive dashboard.

---

## Conclusion

LogiHub offers a frictionless transition from raw transaction data to strategic execution in under 15 minutes. By automating complex geo-spatial enrichment, complying with strict regulatory parameters, and running robust mathematical optimizers, LogiHub equips supply chain executives with a comprehensive, board-ready SCM master plan. The final advisory report does not merely analyze—it prescribes actions, timelines, and financial impacts, acting as a trusted AI-powered Strategic Advisor standing between raw shipping logs and the boardroom.
