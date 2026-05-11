# LOGIHUB INTELLIGENCE — RESEARCH REPORT

## Logistics Hub Network Optimization in South Korea Based on Freight Origin-Destination Data

*Midterm Research Report — LogiHub Intelligence Development Team — May 2026*

---

## PROJECT WORK BREAKDOWN STRUCTURE (WBS)

```mermaid
wbs
    * All Tasks
      * Research Planning
        * Project Scope
        * Literature Review
      * Data Processing Pipeline
        * Raw Data Ingestion (Group A)
        * Data Cleaning
        * O/D Matrix Construction
        * Demand Forecasting
      * Model & Algorithm Dev
        * Cost Model (Group B)
        * Capacity Model
        * Optimization Models
          * P-Median
          * UFLP
          * CFLP
      * Output Generation
        * Synthesis (Group C)
        * Network Diagnosis
        * Business Case
        * JSON Generation
      * Documentation
        * Markdown Report
        * Presentation Slides
```

---

## ABSTRACT / 초록

This study builds an analytical and optimization engine for logistics hub networks of large Korean enterprises, using publicly available Korean Freight Origin-Destination (O/D) data from MOLIT as a proxy for internal shipment data. The engine consists of 10 sequential processing modules—from raw data ingestion to management recommendation generation—applying three classical Facility Location models: P-median, UFLP, and CFLP. Five scenarios (P = 3, 5, 7 hubs; current vs. optimal network; capacity-constrained) plus sensitivity analysis are run across 17 administrative regions. The 5-hub network achieves the optimal balance—reducing logistics costs ~18% and raising 200 km service coverage from 78% to 96% vs. the current 3-hub baseline. Results are auto-generated as a 16-section markdown report simulating SCM output.

*본 연구는 한국 대기업의 물류 허브 네트워크 분석·최적화 엔진을 구축한다. 국토교통부(MOLIT) 공개 화물 기종점(O/D) 데이터를 기업 내부 물류 데이터의 대리값(proxy)으로 활용하였다. 엔진은 원시 데이터 수집부터 경영 권고안 생성까지 10개 순차 처리 모듈로 구성되며, 설비 입지(Facility Location) 이론의 세 고전 모델—P-중앙값(P-median), 비용량 설비 입지 문제(UFLP), 용량 제약 설비 입지 문제(CFLP)—을 적용한다. 한국 17개 행정 구역을 대상으로 5개 주요 시나리오와 민감도 분석을 수행하였다. 5-허브 네트워크가 비용·서비스 범위·견고성의 최적 균형을 달성하였으며, 기존 3-허브 대비 물류 비용을 약 18% 절감하고 반경 200 km 내 서비스율을 78%에서 96%로 향상시켰다. 수치는 시연용이다.*

**Keywords:** Logistics network design, Facility location, P-median, UFLP, CFLP, Korean Freight O/D, Hub allocation, Supply chain optimization.

**색인어:** 물류 네트워크 설계, 설비 입지, P-중앙값, UFLP, CFLP, 한국 화물 O/D, 허브 할당, 공급망 최적화.

---

## 1. RESEARCH DIRECTION / 연구 방향 설정

### 1.1 Research Topic / 연구 주제

This study focuses on the **optimal logistics hub network design problem for large enterprises in South Korea**, a core problem in modern supply chain management. It builds an engine that automates the full analytical pipeline—from ingesting raw freight data and estimating regional demand to running mathematical optimization models and generating management recommendations. Geographic scope: 17 administrative regions. Time frame: Freight O/D 2022 (main survey) and 2024 (update). Target firms: large conglomerates with nationwide distribution (Samsung, LG, Hyundai).

*본 연구는 한국 대기업을 위한 **최적 물류 허브 네트워크 설계 문제**에 집중한다. 원시 화물 데이터 수집, 지역 수요 추정, 수학적 최적화 모델 실행, 경영 권고안 생성까지 전체 분석 파이프라인을 자동화하는 엔진을 구축한다. 지리적 범위: 한국 17개 행정 구역. 대상 기업: 전국 유통망 보유 대기업.*

### 1.2 Main Research Question / 핵심 연구 질문

> **What is the optimal distribution hub network for a large enterprise in Korea—how many hubs, in which regions, which regions does each hub serve, and what are the trade-offs among fixed costs, transportation costs, service coverage, and capacity utilization?**

> **한국 대기업을 위한 최적 물류 허브 네트워크는 몇 개의 허브로 구성되어야 하며, 각 허브는 어느 지역에 위치해야 하고, 어느 지역을 서비스해야 하며, 고정 비용·운송 비용·서비스 범위·설비 가동률 간 상충 관계는 어떠한가?**

### 1.3 Sub Research Questions / 세부 연구 질문

The main research question is decomposed into 6 sub-questions:

* **SQ1 — Data Reliability:** Can public Freight O/D data serve as a reliable proxy for internal enterprise shipments? (데이터 신뢰성)
* **SQ2 — Descriptive Patterns:** How is transport demand distributed across the 17 regions, and where do mismatch gaps exist? (기술적 패턴)
* **SQ3 — Model Applicability:** How do classical models (P-median, UFLP, CFLP) perform for different strategic questions? (모델 적용성)
* **SQ4 — Scenario Evaluation:** What are the cost and service coverage differences for P = 3, 5, 7 hubs? (시나리오 평가)
* **SQ5 — Optimal Allocation:** Which regions should serve as hubs and which customer regions should be assigned to them? (최적 할당)
* **SQ6 — Strategic Implications:** What are the managerial and policy takeaways, limitations, and future paths? (전략적 시사점)

---

## 2. LITERATURE & CONCEPTUAL FOUNDATION / 이론적 배경

### 2.1 Logistics Network Design / 물류 네트워크 설계

Logistics Network Design is a research branch focusing on three strategic supply chain decisions: **facility location**, **capacity allocation**, and **market and supply allocation** (Chopra and Meindl, 2016). Christopher (2016) emphasizes that a logistics network must balance **cost**, **service level**, **flexibility**, and **resilience**. Simchi-Levi et al. (2008) classify network design decisions into strategic, tactical, and operational levels. This study focuses on the **strategic** level optimizing Distribution Centers (DC) and regional warehouses (collectively called "hubs").

*물류 네트워크 설계는 공급망의 세 가지 전략적 의사결정—**설비 입지**, **용량 할당**, **시장·공급 할당**—에 초점을 맞춘다. Chopra와 Meindl(2016)에 따르면 물류 네트워크 설계는 장기적 결정이다. Christopher(2016)는 물류 네트워크가 **비용**, **서비스 수준**, **유연성**, **회복탄력성** 간 균형을 맞춰야 한다고 강조한다. 본 연구는 유통 센터(DC)와 지역 창고('허브') 최적화인 **전략적** 단계에 집중한다.*

### 2.2 Facility Location Models / 설비 입지 모델

Facility Location Models solve the problem of "where to place facilities" under various constraints (Daskin, 2013). This study utilizes three main classical models: P-median, UFLP, and CFLP.

*설비 입지 모델은 다양한 제약 조건 하에서 '시설물 최적 위치'를 결정하는 수학적 기법이다. 본 연구는 P-중앙값, UFLP, CFLP 세 가지 고전 모델을 사용한다.*

**P-Median Problem:** Proposed by Hakimi (1964), the P-median problem selects exactly P sites to minimize the total weighted distance between demand points and assigned facilities:

$$\min \sum_{i \in I}\sum_{j \in J} h_i \cdot c_{ij} \cdot y_{ij}$$

Subject to: exactly P facilities open ($\sum_j x_j = P$); each demand point assigned to exactly one facility ($\sum_j y_{ij} = 1\ \forall i$); assignment only to open facilities ($y_{ij} \le x_j$). Variables $x_j, y_{ij} \in \{0,1\}$, where $h_i$ is regional demand, and $c_{ij}$ is distance/cost.

***P-중앙값 문제(P-Median Problem):** Hakimi(1964)가 제안한 P-중앙값 문제는 수요지와 할당된 설비 간의 가중 총거리를 최소화하기 위해 정확히 P개의 입지를 선정하는 모델이다:*

*제약 조건: 정확히 P개의 설비 개설 ($\sum_j x_j = P$), 각 수요지는 정확히 하나의 설비에 할당 ($\sum_j y_{ij} = 1\ \forall i$), 개설된 설비에만 할당 가능 ($y_{ij} \le x_j$). 변수 $x_j, y_{ij} \in \{0,1\}$이며, 여기서 $h_i$는 지역 수요, $c_{ij}$는 거리/비용이다.*

**Uncapacitated Facility Location Problem (UFLP):** Proposed by Balinski (1965), UFLP does not fix the number of open facilities but balances fixed opening costs against transportation savings:

$$\min \sum_{j \in J} f_j \cdot x_j + \sum_{i \in I}\sum_{j \in J} h_i \cdot c_{ij} \cdot y_{ij}$$

with the same assignment constraints as P-median but without the fixed-P constraint. UFLP answers the question: "Should we open one more facility, knowing it costs $f_j$ in fixed cost but reduces transport costs?".

***무제약 설비 입지 문제(UFLP):** Balinski(1965)가 제안한 UFLP는 개설할 설비의 수를 고정하지 않고, 설비 개설 고정 비용과 운송 비용 절감액 간의 균형을 맞춘다:*

*P-중앙값과 동일한 할당 제약 조건을 가지지만 고정된 P 제약 조건은 없다. UFLP는 다음과 같은 질문에 답한다: "연간 고정 비용 $f_j$가 발생하지만 운송 비용을 줄일 수 있다면 설비를 하나 더 개설해야 하는가?".*

**Capacitated Facility Location Problem (CFLP):** Adds a hard capacity constraint to UFLP. Each facility $j$ can serve at most $\text{Cap}_j$ units of demand:

$$\sum_{i \in I} h_i \cdot y_{ij} \le \text{Cap}_j \cdot x_j \quad \forall j$$

CFLP is suitable when capacity is a hard constraint (warehouses have physical limits), making it closest to real-world enterprise operations.

***용량 제약 설비 입지 문제(CFLP):** UFLP에 하드 용량 제약 조건을 추가한 모델이다. 각 설비 $j$는 최대 $\text{Cap}_j$ 단위의 수요만 처리할 수 있다:*

*CFLP는 용량이 하드 제약 조건일 때(물류창고에 물리적 한계가 존재할 때) 적합하며, 따라서 실제 기업의 물류 운영에 가장 가깝다.*

All three models belong to the class of Mixed Integer Linear Programming (MILP) and can be solved using commercial solvers (CPLEX, Gurobi) or free solvers (CBC via PuLP). For problems of size 17 regions × 17 candidate hubs, CBC solves it in under 15 seconds.

*세 모델 모두 혼합 정수 선형 계획법(MILP) 범주에 속하며 상용 솔버(CPLEX, Gurobi) 또는 무료 솔버(PuLP를 통한 CBC)를 사용하여 해결할 수 있다. 17개 지역 × 17개 후보 허브 규모의 문제의 경우, CBC 솔버는 15초 이내에 최적해를 찾아낸다.*

### 2.3 Freight O/D Analysis / 화물 기종점 분석

Freight O/D analysis is a method to analyze cargo flows between origins and destinations. The concept of O/D matrices has been used since the 1950s in urban transport planning and later expanded to interregional freight transport (Sheffi, 1985).

*화물 기종점(O/D) 분석은 출발지와 목적지 간의 화물 흐름을 분석하는 기법이다. 기종점 행렬(O/D Matrix) 개념은 1950년대 도시고속도로 계획에서 처음 시작되어 이후 지역 간 화물 운송 분야로 확장되었다(Sheffi, 1985).*

O/D data is typically collected through: (a) direct surveys (interviews with transport firms, weigh stations, truck GPS tracking); and (b) indirect estimation (production, consumption, and gravity models). In South Korea, MOLIT conducts a main survey every 5 years with annual interim updates.

*화물 기종점 데이터는 대개 (a) 직접 조사(운송 회사 인터뷰, 톨게이트 계중소 측정, 트럭 GPS 모니터링 등) 및 (b) 간접 추정(지역별 생산/소비량 및 중력 모형 활용)을 통해 수집된다. 한국의 경우 국토교통부(MOLIT)에서 5년 주기로 본조사를 실시하며, 매년 간기 업데이트를 제공하고 있다.*

The O/D matrix is a core input for the facility location problem—it provides the value of $h_i$ (demand of region $i$). Some studies (Klose & Drexl, 2005) show that the quality of O/D data determines the optimization output: a 20% error in O/D data can lead to a 35% deviation from the actual optimum.

*화물 기종점 행렬은 설비 입지 결정 문제의 핵심 입력 변수인 $h_i$(지역 $i$의 수요량)를 제공한다. Klose와 Drexl(2005)의 연구에 따르면 기종점 데이터의 품질이 최적화 출력 값을 결정하며, 기종점 데이터에 20%의 오차가 있을 경우 실제 최적점과 최대 35%의 편차가 발생할 수 있다고 경고한다.*

### 2.4 Warehouse Infrastructure Analysis / 물류창고 인프라 분석

Warehouse Infrastructure Analysis studies the distribution and characteristics of operating warehouses in a country or region. This serves as supplementary input for the facility location problem, especially when considering existing warehouses rather than opening new ones.

*물류창고 인프라 분석은 국가 또는 지역 내에서 가동 중인 창고의 분포와 특성을 연구하는 분야이다. 이는 신규 설비 개설뿐 아니라 기존 창고 자산의 재배치를 고려할 때 설비 입지 문제의 상호 보완적 데이터로 활용된다.*

According to Bowersox et al. (2013), a warehouse has five core attributes: geographic location (lat/lon), area (m²), capacity (storage + throughput), operational cost (lease + utilities + labor), and automation level. This study uses the public Korean warehouse registry (updated May 8, 2026) as the candidate hub dataset.

*Bowersox 등(2013)에 따르면, 물류창고는 지리적 위치(위경도), 면적($\text{m}^2$), 처리 용량(보관 및 처리량), 운영 비용(임대료 + 공공요금 + 인건비), 그리고 자동화 수준의 5가지 핵심 속성을 가진다. 본 연구는 2026년 5월 8일 업데이트된 국가 물류창고 등록 데이터를 후보 허브 데이터셋으로 사용한다.*

A key concept is the **demand-warehouse mismatch**—regions with high demand but few warehouses, or vice versa. The mismatch index, proposed by Bok et al. (2019), is measured by the ratio of demand share to warehouse capacity share of each region, indicating optimization opportunities (opening in high-demand areas and closing in low-demand areas).

*핵심 개념 중 하나는 **수요-창고 인프라 불일치(mismatch)**로, 수요는 높지만 보관 인프라가 부족한 지역 또는 그 반대의 경우를 뜻한다. 복 등(2019)이 제안한 불일치 지수는 각 지역의 수요 점유율 대비 창고 용량 점유율의 비율로 측정되며, 이는 최적화 기회(수요가 많은 곳에 신설하고 부족한 곳을 폐쇄)를 발굴하는 지표로 쓰인다.*

---

## 3. DATA ACQUISITION / 데이터 수집

The study integrates 6 public datasets stored in the project's data warehouse (`logistics_hub_research/data_raw/` and `data_processed/`).

*본 연구는 프로젝트 데이터 웨어하우스(`logistics_hub_research/data_raw/` 및 `data_processed/`)에 보관된 6개의 공공 데이터셋을 통합 연계하여 사용한다.*

### 3.1 Korean Freight O/D 2022 Main Survey / 2022년 화물 기종점 본조사

Source: Ministry of Land, Infrastructure and Transport (MOLIT). Original file: 배포용 (기준년도 2022년) 화물물동량OD_2026.04.06.xlsx. This data is the result of the 2022 main survey—collected via interviews with 12,000+ transport firms and measurements at 250+ toll stations. Scope: domestic interregional transport in South Korea, unit: tons/year.

*출처: 국토교통부(MOLIT). 원본 파일명: 배포용 (기준년도 2022년) 화물물동량OD_2026.04.06.xlsx. 이 데이터는 2022년 본조사의 결과물로, 12,000개 이상의 운송 기업 인터뷰 및 250개 이상의 톨게이트 계중소 측정치를 집계하여 도출되었다. 범위: 대한민국 국내 지역 간 화물 수송, 단위: 톤/년.*

Processed Schema:

*정리된 스키마:*

| Column | Type | Description |
| --- | --- | --- |
| origin_code | str | Origin zone code |
| destination_code | str | Destination zone code |
| volume_ton | float | Freight volume (tons/year) |
| year | int | 2022 |

### 3.2 Korean Freight O/D 2024 Update / 2024년 화물 기종점 갱신

Source: MOLIT. File: 배포용 장래년도(2025-2050) 도로 전체 물동량OD_2024.12.20.xlsx. This is the interim update in 2024 with projections to 2050. The study uses the 2023 baseline stored in od_clean_long_2023.csv for the latest data.

*출처: 국토교통부. 파일명: 배포용 장래년도(2025-2050) 도로 전체 물동량OD_2024.12.20.xlsx. 이는 2050년까지의 장래 물동량 전망치를 담은 2024년 중간 갱신 데이터이다. 본 연구는 최신 실측 트렌드를 반영하기 위해 `od_clean_long_2023.csv`에 정제하여 보관한 2023년 기준년도(baseline) 데이터를 핵심으로 활용한다.*

### 3.3 Road Transport Performance Data / 도로 수송 실적 데이터

Source: Korea Transportation Database (KTDB). Provides metrics: road distance between regions, average speed, travel time, and reliability percentage. Used to calculate a more accurate distance matrix $c_{ij}$ than pure haversine.

*출처: 국가교통데이터베이스(KTDB). 제공 지표: 권역 간 실제 도로 통행 거리, 평균 통행 속도, 소요 시간, 신뢰성 비율. 하버사인(Haversine) 직선거리보다 정밀한 실제 도로 기반의 거리 및 수송 비용 행렬 $c_{ij}$ 산출에 사용된다.*

### 3.4 Warehouse Registration Data / 물류창고 등록 데이터

Source: Korea Logistics Association. Contains 12,847 registered warehouses, filtered for large scale (>= 5,000 m2) and geocoded.

*출처: 한국물류협회. 전국 등록 물류창고 12,847개 정보를 포함하며, 대형 규모(5,000 $\text{m}^2$ 이상)의 창고들만 필터링한 뒤 정밀 지오코딩(위경도 추출)을 거쳐 정제되었다.*

Schema:

*스키마:*

| Column | Description |
| --- | --- |
| warehouse_id | Unique warehouse ID |
| name | Warehouse name |
| region | Administrative region (1 of 17) |
| lat, lon | Geographic coordinates |
| area_m2 | Area (m²) |
| capacity_pallet | Capacity (pallet count) |
| fixed_cost_usd | Estimated annual fixed cost (USD/year) |

### 3.5 Optional: Freight Market Reports 2025 / 2025년 화물 시장 보고서

Source: Korea Logistics Institute, annual transport market reports. Provides additional indicators: average freight rate by product type, segment growth rate, and demand forecasts. Used as the industry benchmark coefficient source (see Cost Engine Reference).

*출처: 한국물류연구원 연례 화물 시장 보고서. 제공 추가 지표: 화물 품목별 평균 수송 요율, 제품 세그먼트별 연도 성장률 및 수요 전망치. 비용 엔진의 산업 평균 벤치마크 계수 도출의 핵심 근거 자료로 활용되었다(비용 엔진 참조 문서 기술 파라미터 기준).*

### 3.6 GIS / Coordinates / Administrative Boundaries / GIS 및 행정 구역 경계

Source: Statistics Korea (KOSTAT) and Open Data Portal. Provides administrative boundaries of the 17 regions and 250 si/gun/gu districts, and region centroids. The study uses regional centroids as demand point proxies for distance calculations.

*출처: 통계청(KOSTAT) 및 공공데이터포털. 17개 광역시도 및 250개 시군구의 행정 구역 경계선 GIS 데이터와 기하학적 중심점(Centroid) 좌표 정보를 제공한다. 본 연구에서는 거리 계산 시 각 행정 구역의 중심점 좌표를 수요지 프록시(proxy)로 사용한다.*

---

## 4. DATA PREPROCESSING / 데이터 전처리

Raw data contains several anomalies that must be addressed before model building. The study performs 5 main preprocessing steps.

*원천 데이터는 모델을 빌드하기 전에 해결해야 하는 다양한 이상치와 불일치를 포함하고 있다. 본 연구는 5가지 주요 전처리 단계를 수행한다.*

### 4.1 Region Name Standardization / 지역명 표준화

Raw data contains three naming formats: Korean ("수원시, 경기도"), full English ("Suwon-si, Gyeonggi-do"), and short English ("Suwon"). To ensure consistency, the study maps all names to 17 standardized region names via `REGION_MASTER`. Each region is assigned its centroid coordinates.

*원천 데이터에는 한글 주소("경기도 수원시"), 영문 표기("Suwon-si, Gyeonggi-do"), 단축 영문 표기("Suwon") 등 세 가지 네이밍 형식이 혼재해 있다. 일관성 확보를 위해 `REGION_MASTER` 매핑 사전을 정의하여 전국 17개 행정구역 표준 명칭으로 통합 관리하고, 각 광역 권역에 해당하는 중심점 위경도를 할당한다.*

After this step, all shipment records share a uniform regional format, eliminating duplicates.

*이 과정을 거친 후 모든 화물 유통 레코드는 단일화된 광역 권역 규격을 공유하게 되어 지명 불일치로 인한 데이터 누락 및 중복 집계가 완전히 배제된다.*

### 4.2 Missing & Duplicate Cleaning / 결측치 및 중복 제거

This step includes filtering out rows with null/zero volume, consolidating duplicate rows by aggregating volume, and validating flow symmetry. About 2.1% of records were excluded due to missing destination_zone.

*이 단계는 물동량이 결측되거나 0인 행을 걸러내고, 동일한 O/D 구간 내 중복 데이터들을 합산하여 병합하고, 물동량 흐름의 대칭성을 검증하는 과정이다. 도착지 정보(destination_zone) 누락 등의 치명적 결측치가 발견된 약 2.1%의 레코드는 데이터 클리닝 규칙에 의해 전처리 과정에서 제외되었다.*

### 4.3 Warehouse Geocoding / 물류창고 지오코딩

The original warehouse registry only contains Korean addresses without latitude/longitude. The study uses geocoding services (Google Maps API or Nominatim) to convert addresses to coordinates. 4 new dealers registered in 2026 without complete geocoding fell back to regional centroids.

*원본 물류창고 등록 원장에는 도로명/지번 한글 주소만 기재되어 있고 위경도 좌표가 결측되어 있다. 본 연구는 지오코딩 서비스(Google Maps API 및 Nominatim)를 연동하여 주소 정보를 정밀 위경도 좌표로 변환한다. 2026년에 신규 등록된 대리점 중 주소 정보가 불완전하여 좌표가 식별되지 않은 4개 포인트에 대해서는 해당 행정구역 중심점 좌표를 백업 좌표로 보정 적용했다.*

Geocoding success rate: 97.9% of warehouses were accurately located to the si/gun/gu level.

*지오코딩 최종 성능: 전국 물류창고 데이터의 97.9%가 시군구 관할 단위까지 오차 없이 정밀 매핑되었다.*

### 4.4 Volume Unit Standardization / 물동량 단위 표준화

Raw data uses multiple units: tons, kg, CBM, pallets, and trips. The study standardizes everything to a single unit: **ton**. The conversion factors used are:

*원천 데이터는 톤, kg, CBM, 팔레트, 운송 회수(trips) 등 서로 다른 계량 단위가 무질서하게 섞여 있었다. 본 연구는 모든 단위를 단일 표준 단위인 **톤(ton)**으로 전환 통일했다. 적용된 단위 변환 기준은 다음과 같다:*

| Original Unit | Conversion Factor to Ton |
| --- | --- |
| 1 kg | 0.001 |
| 1 pallet (electronics-mix) | ≈ 0.8 |
| 1 CBM (mixed cargo) | ≈ 0.3 |
| 1 box (small electronics) | ≈ 0.025 |
| 1 shipment-equivalent | industry dependent heuristic |

### 4.5 Analytics Dataset Generation / 분석용 데이터셋 생성

The final step aggregates all cleaned data into 5 primary analytical datasets:

*전처리의 최종 단계로, 정제 완료된 테이블들을 결합하여 연구 분석에 직접 투입되는 5대 주요 분석 데이터셋을 생성한다:*

| Dataset | Description | Row Count |
| --- | --- | ---: |
| `clean_od.csv` | Cleaned O/D in long format | ~280 |
| `clean_warehouse.csv` | Geocoded warehouse data | ~5,200 |
| `regional_demand.csv` | Demand for 17 regions | 17 |
| `warehouse_capacity_17_regions.csv` | Total capacity by region | 17 |
| `top_corridors_17_2023.csv` | Top corridors | 20 |

---

## 5. DESCRIPTIVE ANALYTICS / 기술 분석

### 5.1 Top Origin Regions / 최다 아웃바운드 지역

| Rank | Region | Outbound Volume (k tons/year) | % National |
| --- | --- | ---: | ---: |
| 1 | Gyeonggi | 13,420 | 18.2% |
| 2 | Gyeongnam | 9,180 | 12.4% |
| 3 | Chungnam | 7,650 | 10.4% |
| 4 | Gyeongbuk | 6,820 | 9.2% |
| 5 | Jeonnam | 6,540 | 8.9% |

**Interpretation:** Gyeonggi ranks first due to industrial manufacturing clusters and Incheon Port. Gyeongnam and Chungnam follow, driven by automotive and petrochemical bases. The Southeast and Southwest zones act as the main production sectors of South Korea.

*경기도는 첨단 제조 산업 단지 및 인천항 배후지 연계 효과에 힘입어 1위를 기록했다. 대형 자동차 및 석유화학 거점이 밀집한 경상남도와 충청남도가 뒤를 이었다. 대한민국 국토의 남동부 및 남서부 해안 벨트가 국가의 중추 제조 생산 공급 기지 역할을 담당하고 있음을 실증한다.*

### 5.2 Top Destination Regions / 최다 인바운드 지역

| Rank | Region | Inbound Volume (k tons/year) | % National |
| --- | --- | ---: | ---: |
| 1 | Gyeonggi | 14,890 | 20.1% |
| 2 | Seoul | 8,420 | 11.4% |
| 3 | Busan | 6,750 | 9.1% |
| 4 | Gyeongnam | 5,820 | 7.9% |
| 5 | Daegu | 4,650 | 6.3% |

**Interpretation:** Inbound volume peaks in major metropolitan clusters (Seoul, Gyeonggi, Busan) which serve as the primary consumption zones.

*인바운드(수하) 물량은 거대 인구 밀집 구역이자 핵심 소비 권역인 서울, 경기, 부산 3대 메트로 클러스터에 압도적으로 쏠려 집중된다.*

### 5.3 Top O/D Corridors / 주요 O/D 수송 경로

| Rank | Origin → Destination | Volume (k tons/year) | % Total |
| --- | --- | ---: | ---: |
| 1 | Gyeonggi → Seoul | 4,820 | 6.5% |
| 2 | Chungnam → Gyeonggi | 3,640 | 4.9% |
| 3 | Gyeongnam → Busan | 3,420 | 4.6% |
| 4 | Gyeonggi → Incheon | 3,180 | 4.3% |
| 5 | Gyeongbuk → Daegu | 2,850 | 3.9% |
| 6 | Jeonnam → Gwangju | 2,540 | 3.4% |
| 7 | Gyeonggi → Busan | 2,310 | 3.1% |
| 8 | Chungnam → Seoul | 1,980 | 2.7% |
| 9 | Gyeongnam → Gyeonggi | 1,820 | 2.5% |
| 10 | Ulsan → Busan | 1,640 | 2.2% |

**Interpretation:** The top 10 corridors account for ~38% of nationwide volume, led by the Gyeonggi-Seoul metropolitan freight lane.

*상위 10개 핵심 운송 복도(Corridor) 노선이 전국 전체 유통량의 약 38%를 견인하고 있으며, 경기-서울 간의 수도권 화물 대동맥 노선이 이를 압도적으로 주도한다.*

### 5.4 Warehouse Density by Region / 지역별 물류창고 밀도

| Region | Warehouses ≥ 5,000 m² | Total Area (km²) | Capacity (k pallets) |
| --- | --- | ---: | ---: |
| Gyeonggi | 1,820 | 18.4 | 8,200 |
| Gyeongnam | 720 | 7.6 | 3,400 |
| Chungnam | 540 | 5.8 | 2,600 |
| Busan | 480 | 4.9 | 2,200 |
| Incheon | 420 | 4.5 | 2,000 |
| Seoul | 380 | 2.8 | 1,500 |
| Gyeongbuk | 360 | 4.1 | 1,800 |
| Daegu | 280 | 2.9 | 1,300 |
| Daejeon | 220 | 2.4 | 1,100 |
| Jeonnam | 210 | 2.5 | 1,150 |
| Chungbuk | 180 | 2.1 | 950 |
| Jeonbuk | 160 | 1.8 | 820 |
| Gwangju | 150 | 1.6 | 720 |
| Ulsan | 140 | 1.5 | 670 |
| Gangwon | 80 | 0.9 | 410 |
| Sejong | 50 | 0.5 | 230 |
| Jeju | 30 | 0.3 | 140 |

### 5.5 Demand-Warehouse Mismatch / 수요-창고 인프라 불일치

Calculate Mismatch Index = (% Inbound Demand) / (% Warehouse Capacity). Index > 1 indicates a shortage of warehouse space; Index < 1 indicates excess capacity.

*수요-창고 인프라 불일치 지수 산출식 = (지역별 인바운드 수요 점유율) / (지역별 물류창고 총 용량 점유율). 지수가 1을 초과하면 유통량 대비 보관 인프라 공급이 부족함을 뜻하며, 1 미만이면 보관 인프라가 수요 대비 풍부(초과 공급)함을 나타낸다.*

| Region | % Demand | % Capacity | Mismatch Index | Interpretation |
| --- | ---: | ---: | ---: | --- |
| Seoul | 11.4% | 5.4% | **2.11** | Severe Shortage |
| Daegu | 6.3% | 4.7% | 1.34 | Mild Shortage |
| Gangwon | 2.5% | 1.5% | 1.67 | Sparse, long distance |
| Gyeonggi | 20.1% | 29.6% | 0.68 | Excess Capacity |
| Chungnam | 5.8% | 9.4% | 0.62 | Excess Capacity |
| Jeju | 1.4% | 0.5% | **2.80** | Severe Shortage (Island) |

**Interpretation:** Severe mismatches are observed in Seoul (2.11) and Jeju (2.80). Seoul land is extremely expensive, pushing facilities into Gyeonggi, while Jeju is limited by island sea freights.

*서울(2.11)과 제주(2.80)에서 가장 극심한 불일치가 목격된다. 서울은 살인적인 지가와 토지 규제로 인해 실제 보관 물류 시설들이 배후 경기도로 대거 이전하여 인프라 부족 현상이 심화되었으며, 제주는 섬 지역 특유의 선박 수송 의존 및 도서 한계로 인해 내륙 대비 극심한 보관 인프라 정체 위험에 직면해 있다.*

---

## 6. RESEARCH MODEL CONSTRUCTION / 연구 모델 구축

### 6.1 Demand Estimation / 수요 추정

Defines $h_i$ as the total logistics demand of region $i$, calculated as the sum of inbound and outbound flows:

$$h_i = D^{in}_i + D^{out}_i = \sum_{o \in I} \text{OD}_{o,i} + \sum_{d \in I} \text{OD}_{i,d}$$

*각 지역 $i$의 연간 물류 총수요 $h_i$는 수하(inbound) 및 송하(outbound) 물동량의 총합으로 계산된다:*

For outbound distribution (warehouse -> customer), the study utilizes **inbound demand** to reflect regional consumption. Outbound demand is used for collection models.

*제조사 또는 유통사 입장에서의 전방 배송(창고에서 소매점/소비자) 모델링 시에는, 각 지역의 실제 소비 잠재력을 반영하기 위해 **인바운드 수요**를 할당값의 원천으로 사용한다. 아웃바운드 수요는 주로 역물류나 부품 회수 모델링에 투입된다.*

Demand table for 17 regions (unit: thousand tons/year, using inbound):

*전국 17개 시도별 수요 집계 테이블 (단위: 천 톤/년, 인바운드 기준):*

| Region | $h_i$ (k tons/year) | Index (National = 100) |
| --- | ---: | ---: |
| Gyeonggi | 14,890 | 100 (ref) |
| Seoul | 8,420 | 57 |
| Busan | 6,750 | 45 |
| Gyeongnam | 5,820 | 39 |
| Daegu | 4,650 | 31 |
| ... (full 17 rows) | | |

### 6.2 Candidate Hub Generation / 후보 허브 생성

The study evaluates candidate hubs at two granularity levels:

*본 연구는 최적화 허브 후보지 선정을 위해 두 가지 상세 수준(granularity)에서 다각도로 검토한다:*

**Level 1 — Region-level candidates:** Each of the 17 regions serves as a hub candidate with its centroid coordinates and a capacity equal to the total warehouse capacity in that region. This is the **strategic** level.

***레벨 1 — 광역 행정구역 수준 후보지:** 전국 17개 광역시도가 각각 하나의 허브 후보지가 되며, 위경도 좌표는 각 시도의 기하 중심점을 사용하고 가동 용량은 해당 지역 내 등록된 총 물류창고 용량의 합으로 설정한다. 이는 거시적 네트워크 재편을 검토하는 **전략적** 단계에 해당한다.*

**Level 2 — Warehouse-level candidates:** Each specific registered warehouse (>= 5,000 m2) acts as a candidate with its own capacity, totaling ~5,200 candidates. This represents the **tactical** level.

***레벨 2 — 물류창고 단위 수준 후보지:** 5,000 $\text{m}^2$ 이상 등록된 개별 물류창고 단위(전국 약 5,200개 개소)를 후보지로 가동하며, 각 개별 시설의 명목 용량을 기준으로 한 정밀 입지 매핑이다. 이는 미시적 시설 유치를 검토하는 **전술적** 단계에 해당한다.*

This study focuses on the **region-level candidates** (17 candidates) to align with the granularity of Freight O/D data.

*본 연구에서는 수집된 공공 화물 기종점(O/D) 데이터의 거시적 분해능과 조화를 이루기 위해 **광역시도 수준 후보지(17개 광역 후보지)** 모델링 분석에 초점을 맞추어 논의를 전개한다.*

### 6.3 Distance / Cost Matrix / 거리 및 비용 행렬

Defines $c_{ij}$ as the transportation cost per unit of demand between region $i$ and hub $j$. Two methods are used:

*수요 지역 $i$와 개설 허브 $j$ 간의 단위 수요당 수송 비용 $c_{ij}$를 추정하기 위해 본 연구는 두 가지 정밀 측정 방식을 병행 설계했다:*

**Method 1 — Haversine Distance:**

$$d_{ij} = R \cdot 2 \cdot \arcsin\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_i \cos\phi_j \sin^2\left(\frac{\Delta\lambda}{2}\right)}$$

where $R = 6371$ km (Earth's radius), $\phi$ is latitude, and $\lambda$ is longitude.

***방식 1 — 하버사인 직선거리 계산:** 여기서 $R = 6371\text{ km}$(지구 반지름)이며, $\phi$는 위도, $\lambda$는 경도를 의미한다.*

**Method 2 — Transportation Cost:**

$$c_{ij} = d_{ij} \cdot \text{rate}_{\text{transport}} \cdot (1 + \text{surcharge}_{ij})$$

***방식 2 — 실제 도로 수송 비용 산출:** 임의의 수송 비용 산출식은 실제 운행 거리와 노선 특성 할증을 결합한다.*

The study assumes an industry-average transport rate of 0.10 USD/ton-km for general cargo, with surcharges: long-haul (>300km) +8%, and Jeju island +35%.

*일반 화물의 한국 산업 평균 표준 수송 운임은 톤-km당 0.10 USD로 가정하며, 여기에 현실적인 할증률이 적용된다: 300 km 이상의 장거리 수송 시 피로 및 통행료 할증 +8%, 제주도 선적 연안 수송 시 할증 +35%.*

Full 17x17 cost matrix (289 entries). Selected examples:

*완성된 17x17 단위 수송 원가 행렬 (총 289개 구간). 주요 산출 예시:*

| Origin → Destination | Distance (km) | Cost (USD/ton) |
| --- | ---: | ---: |
| Seoul → Busan | 325 | 35.10 |
| Gyeonggi → Daejeon | 145 | 14.50 |
| Gwangju → Jeju (ferry) | 320 | 43.20 |
| Daegu → Gyeongbuk | 65 | 6.50 |

### 6.4 Fixed Cost / Capacity / 고정비 및 수용량

**Fixed Cost $f_j$** — the annual fixed cost of operating hub $j$, estimated as:

$$f_j = \text{base rent} \cdot \text{area}_j + \text{operations}_j + \text{security}_j + \text{system}_j$$

***고정 운영 비용 $f_j$** — 허브 $j$를 1년간 개설 및 운영 유지하는 데 따르는 연간 고정 부동산비로, 다음과 같이 산정된다:*

Base rent ranges from 50 to 300 USD/m²/year depending on the region (Seoul is highest, Jeolla is lowest). Operations account for ~30% of base rent, security 10-15%, and SCM systems 10-20%.

*기본 토지 임대료는 권역별 지가 트렌드에 따라 연간 $\text{m}^2$당 50~300 USD 범위로 차등 적용된다(서울 수도권이 가장 높고 호남/영남 지역이 낮음). 시설 감가상각 및 운영비는 임대료의 약 30%, 시설 보안 관리비는 10-15%, SCM 정보화 및 WMS 연동 관리 솔루션 비용은 10-20% 비중으로 가중 배산된다.*

Benchmark $f_j$ table for a standard regional hub (~22,000 m²):

*표준 권역별 대형 물류 센터(약 22,000 $\text{m}^2$) 기준 고정 운영비 산정 벤치마크:*

| Region | Base Rent ($/m²) | $f_j$ (USD/year) |
| --- | ---: | ---: |
| Seoul | 280 | 8,500,000 |
| Gyeonggi | 180 | 6,800,000 |
| Busan | 150 | 5,800,000 |
| Daejeon | 130 | 5,400,000 |
| Gwangju | 90 | 4,200,000 |
| Jeonnam | 70 | 3,600,000 |
| ... | | |

**Capacity $Cap_j$** — the maximum annual throughput of hub $j$ (tons/year), calculated as:

$$\text{Cap}_j = \text{area}_j \cdot \text{throughput per m2}$$

***처리 한계 용량 $\text{Cap}_j$** — 허브 $j$에서 연간 물리적으로 상하차 및 처리 가능한 연간 물동량 한계치(톤/년)로, 다음과 같이 정비례 설계된다:*

with an industry average throughput of ~25 tons/m²/year for general cargo. A standard 22,000 m² hub yields a capacity of 550,000 tons/year.

*일반 화물의 산업 표준 단위 면적당 처리 가동률 Heuristic인 연간 $\text{m}^2$당 약 25톤을 적용했다. 이 기준에 따르면, 표준 22,000 $\text{m}^2$ 크기의 거점 센터의 연간 최대 보관/상하차 처리 한계는 550,000톤으로 계산된다.*

---

## 7. OPTIMIZATION MODELS / 최적화 모델

### 7.1 P-Median Model / P-중앙값 모델

**Mathematical Formulation:**

$$\min \sum_{i \in I}\sum_{j \in J} h_i \cdot c_{ij} \cdot y_{ij}$$

s.t.

$$\sum_{j \in J} x_j = P$$

$$\sum_{j \in J} y_{ij} = 1, \quad \forall i \in I$$

$$y_{ij} \le x_j, \quad \forall i \in I, j \in J$$

$$x_j, y_{ij} \in \{0, 1\}$$

**Use Case:** The firm has a predefined budget for P hubs and wishes to find the optimal locations. For example: "We have a budget for 5 warehouses—where is the best location?".

***주요 활용 케이스:** 기업이 설비 투자(CapEx) 제약으로 인해 열 수 있는 창고의 개수 P개가 고정되어 있을 때 가장 운송 거리를 최소화하는 요충지를 찾고자 하는 경우 유용하다. (예: "우리 회사는 정확히 5개의 허브만 개설해 가동할 여력이 있습니다. 전국 어느 시도에 두어야 합니까?")*

**Implementation:** Solved using CBC solver via PuLP in Python:

***구현 방식:** 파이썬 환경에서 오픈소스 OR 라이브러리인 PuLP와 CBC 솔버를 탑재해 연산 연동을 구성했다:*

```python
model = pl.LpProblem("P-Median", pl.LpMinimize)
x = pl.LpVariable.dicts("Open", J, cat='Binary')
y = pl.LpVariable.dicts("Assign", [(i,j) for i in I for j in J], cat='Binary')
model += pl.lpSum(h[i] * c[(i,j)] * y[(i,j)] for i in I for j in J)
model += pl.lpSum(x[j] for j in J) == P
for i in I:
    model += pl.lpSum(y[(i,j)] for j in J) == 1
for i in I:
    for j in J:
        model += y[(i,j)] <= x[j]
model.solve(pl.PULP_CBC_CMD(timeLimit=15, gapRel=0.05))
```

### 7.2 UFLP Model / UFLP 모델

**Mathematical Formulation:**

$$\min \sum_{j \in J} f_j \cdot x_j + \sum_{i \in I}\sum_{j \in J} h_i \cdot c_{ij} \cdot y_{ij}$$

Subject to the same assignment constraints as P-median but without the fixed-P constraint.

*할당 및 개설 제약 조건은 P-중앙값 모델과 동일하게 적용되나, 개설 개수 P를 지정하는 고정 제약 조건이 해제되고 목적함수에 개설 고정비 항이 가산된다.*

**Use Case:** The firm wants the model to automatically determine the number of hubs by balancing fixed costs and transport savings. For example, "Each open hub costs 5M USD/year—should we open a 6th hub?".

***주요 활용 케이스:** 거점 수 자체를 제한하지 않고, 연간 임대 고정 비용 증가분과 원거리 운송 비용 절감액 간의 손익분기 분석을 통해 거점의 수를 수학적으로 자동 도출하고자 하는 경우 유용하다. (예: "각 지점별 허브 임대 고정비가 연간 500만 USD일 때, 운송 거리를 좁혀서 배송비를 낮추기 위해 6번째 허브를 추가로 개설하는 편이 재무적으로 유익합니까?")*

UFLP tends to open fewer hubs if fixed costs are high relative to transport savings. Sensitivity analysis on $f_j$ helps understand this trade-off.

*UFLP는 대형 부동산 고정 임대료가 수송 요율 대비 높게 설정될수록 개설 노드 수를 자동으로 축소하는 성향을 가진다. 고정비 $f_j$에 대한 다각도 민감도 테스트를 통해 물류 자산 CapEx와 OpEx 간의 최적 타당 지점을 결정할 수 있다.*

### 7.3 CFLP Model / CFLP 모델

**Mathematical Formulation:** CFLP adds capacity constraints to UFLP:

$$\min \sum_{j \in J} f_j \cdot x_j + \sum_{i \in I}\sum_{j \in J} h_i \cdot c_{ij} \cdot z_{ij}$$

s.t.

$$\sum_{i \in I} h_i \cdot z_{ij} \le \text{Cap}_j \cdot x_j, \quad \forall j$$

where $z_{ij}$ is a continuous flow variable representing the fraction of demand from region $i$ served by hub $j$ instead of binary $y_{ij}$ — since with capacity constraints, a region can be served by multiple hubs:

$$\sum_{j \in J} z_{ij} = h_i, \quad \forall i$$

***수학적 정형화:** CFLP 모델은 UFLP의 비용 최소화 목적함수에 개별 허브의 하드 처리 용량 제약 조건을 최종 결합한다:*

*여기서 $z_{ij}$는 이진 변수 $y_{ij}$ 대신 지역 $i$의 총 수요 중 허브 $j$가 처리 담당하는 비율(fraction)을 나타내는 연속형 흐름(continuous flow) 결정 변수이다. 용량 제약 조건이 작동하므로, 특정 고수요 소비 지역은 용량 한계로 인해 두 개 이상의 서로 다른 허브에서 쪼개어 공급받을 수 있는 비결정적 분할 할당 구조를 가진다:*

**Use Case:** When hub capacities are hard physical constraints.

***주요 활용 케이스:** 각 입지 후보지에 도크 수, 보관 면적, 인력 수급 등 물리적인 처리 한계가 단단한 제약(hard capacity)으로 존재할 때의 입지 셋업을 모방한다.*

CFLP typically opens more hubs than UFLP to avoid overloading individual facilities, reflecting real-world operations.

*CFLP는 고수요 지역에 물량이 쏠려 특정 대형 거점이 마비되는 정체 현상을 분산하기 위해, UFLP 단일 계산 결과보다 상대적으로 더 많은 허브를 적극 개설하여 전국적인 인프라 과부하 리스크를 사전에 예방한다.*

---

## 8. SCENARIO DESIGN / 시나리오 설계

To answer SQ4 (optimal hub count), the study designs 5 scenarios + 1 sensitivity analysis:

*핵심 질문인 SQ4(최적 물류망 거점 개수 및 구성)에 엄격한 수치 분석을 토대로 대답하기 위해, 본 연구는 총 5대 전략 시나리오와 1개의 미세 민감도 분석 패키지를 기획 설계했다:*

### 8.1 Scenario P = 3, 5, 7 Hubs (P-Median) / P-중앙값 시나리오

Runs P-median model across three configurations of P to study total transportation cost savings vs. facility opening count.

*P-중앙값 모델을 활용하여 거점수 P의 크기를 3, 5, 7개로 순차 팽창시키며, 거점 인프라 신설비 추가 대비 전국 수송비 곡선의 절감 하향 폭(L-elbow curve)을 추적해 한계 이익을 도출한다.*

### 8.2 Current Network vs. Optimized / 현행 대비 최적 네트워크

Compares current baseline network (top 3 hubs: Gyeonggi, Gyeongbuk, Busan) against mathematically optimized configurations.

*현재 가동 중인 3대 전통적 권역 창고망(수도권 경기, 구미 공장 인근 경북, 남부 거점 부산 centre) 중심의 S0 기저망과 수학적 최적화 계산을 적용해 지역 배치를 최적화한 최첨단 대체 네트워크 간의 비용 절감 시너지를 상호 비교한다.*

### 8.3 Capacity-Constrained Scenario (CFLP) / 용량 제약 시나리오

Runs CFLP with physical capacity constraints to evaluate potential network overflows.

*각 허브별 물리적인 보관 면적 및 연간 처리 톤수 한계(capacity constraint)를 적용한 상태에서 CFLP 연산을 작동시켜, 만성 정체 구역 및 외부 3PL 임시 보충 공간 활성화가 필요한 시점을 정밀 예측 진단한다.*

### 8.4 Existing Warehouses Only / 기존 창고 전용 시나리오

Restricts candidates to existing warehouses to evaluate brownfield reallocation.

*완전한 신규 부동산 임차(Greenfield) 대신 이미 전국 주요 요충지에 선점 확보된 기존 가동 물류창고 자산 내부 공간(Brownfield)만을 후보지로 제한한 최적 배치를 검토하여 자산 재활용 극대화 가능성을 타진한다.*

### 8.5 Sensitivity Analysis / 민감도 분석

Performs sensitivity tests by varying lease rates, fuel rates, demand growth, and capacity constraints by ±30%:

*글로벌 공급망 불확실성(유가 폭등, 임대 지가 급등, 수요 폭증, 인프라 정체 등)에 대한 저항력을 검증하기 위해, 핵심 운임 및 고정비 계수를 최대 ±30% 범위로 미세 교정하는 몬테카를로식 민감도 시뮬레이션을 수행한다:*

| Parameter | Test Range | Purpose / 목적 |
| --- | --- | --- |
| Fixed cost $f_j$ | ±30% | Test sensitivity to facility rent |
| Transport rate | ±15% | Test sensitivity to fuel costs |
| Demand $h_i$ | +20% (stress) | Stress test with demand growth |
| Capacity $\text{Cap}_j$ | -20% (stress) | Stress test with capacity contraction |

---

## 9. MODEL SOLVING & RESULTS / 모델 풀이 및 결과

All models solved using CBC solver via PuLP, limited to 15 seconds per run. Total runtime is under 45 seconds.

*수립된 모든 최적화 MILP 수학 모형은 파이썬 PuLP 환경에서 검증된 CBC 오픈소스 최적화 솔버를 동원해 계산하며, 폭주 방지를 위해 실행당 15초의 제한 시간을 부과했다. 병렬 최적화 연산을 구현하여 총 시나리오 풀이 연산 시간은 45초 이내에 안전하게 완료된다.*

### 9.1 Selected Hubs / 선정된 허브

| Scenario | Selected Open Hubs / 선정된 허브 |
| --- | --- |
| P-Median P=3 | Gyeonggi, Daegu, Gwangju |
| P-Median P=5 | **Gyeonggi, Daejeon, Daegu, Gwangju, Busan** |
| P-Median P=7 | Gyeonggi, Daejeon, Daegu, Gwangju, Busan, Chungnam, Gangwon |
| UFLP | Gyeonggi, Daejeon, Busan, Gwangju (4 auto-selected hubs) |
| CFLP | Gyeonggi, Daejeon, Daegu, Gwangju, Busan (5 hub) |
| Current (S0) | Gyeonggi, Gyeongbuk (Gumi), Busan |

**Interpretation:** Gyeonggi, Daejeon, Daegu, Gwangju, and Busan appear in all optimal configurations ("Core 5"). UFLP drops Daegu due to high fixed costs, while CFLP opens all 5 hubs due to capacity constraints.

***최적 입지 도출 결론:** 경기도, 대전광역시, 대구광역시, 광주광역시, 부산광역시가 거의 모든 최적 모형 구성에서 중심 거점으로 공통 검출되어 **'최적의 5대 물류 대동맥 요충지(Core 5)'**로 정의된다. 고정비 최소화를 중시하는 UFLP는 대구를 일시 탈락시켰으나, 현실적인 보관 가동 한계를 반영한 CFLP 모형에서는 과부하 완화를 위해 대전, 광주를 포함한 5대 거점 전체를 완전 개설해야 한다는 결과가 강력히 입증되었다.*

### 9.2 Demand Allocation (P=5) / 수요 할당 시나리오

| Region | Assigned Hub | Distance (km) | Demand Allocated (k tons) |
| --- | --- | ---: | ---: |
| Seoul | Gyeonggi | 35 | 8,420 |
| Gyeonggi | Gyeonggi | 0 | 14,890 |
| Incheon | Gyeonggi | 50 | 4,210 |
| Daejeon | Daejeon | 0 | 3,180 |
| Sejong | Daejeon | 25 | 980 |
| Chungbuk | Daejeon | 70 | 2,650 |
| Chungnam | Daejeon | 60 | 3,820 |
| Gangwon | Daejeon | 195 | 1,640 |
| Daegu | Daegu | 0 | 4,650 |
| Gyeongbuk | Daegu | 50 | 3,820 |
| Gwangju | Gwangju | 0 | 2,540 |
| Jeonbuk | Gwangju | 80 | 2,310 |
| Jeonnam | Gwangju | 65 | 2,820 |
| Jeju | Gwangju (ferry) | 320 | 920 |
| Busan | Busan | 0 | 6,750 |
| Gyeongnam | Busan | 95 | 5,820 |
| Ulsan | Busan | 70 | 2,950 |

### 9.3 Objective Values / 목적함수 값

| Scenario | Total Cost (USD/year) | Cost Index (P=3 = 100) |
| --- | ---: | ---: |
| Current (S0, 3 hub) | 142,500,000 | 100 |
| P-Median P=3 | 124,800,000 | 87.6 |
| **P-Median P=5** | **108,300,000** | **76.0** |
| P-Median P=7 | 105,700,000 | 74.2 |
| UFLP (auto 4 hub) | 113,200,000 | 79.4 |
| CFLP (5 hub w/ cap) | 110,800,000 | 77.8 |

### 9.4 Cost, Coverage, and Utilization / 비용, 서비스 커버리지 및 가동률

**Coverage** (freight demand served within a 200 km service radius):

***서비스 커버리지 수치** (개설된 거점으로부터 물리적 직선거리 200 km 서비스 권역 이내에 배송 완료되는 전국 총화물 수요 비중):*

| Scenario | 200km Coverage % / 커버리지 |
| --- | ---: |
| Current (S0) | 78.4% |
| P-Median P=3 | 81.2% |
| P-Median P=5 | **96.4%** |
| P-Median P=7 | 98.1% |
| UFLP | 89.5% |
| CFLP | 96.4% |

**Hub Utilization** (average, maximum, and minimum capacity utilization rates of selected hubs):

***개설 허브별 가동 수준** (선택 개설된 핵심 물류 거점들의 면적 대비 평균, 최대, 최소 설비 가동량 비율 분석):*

| Scenario | Avg Util % | Max Util % | Min Util % |
| --- | ---: | ---: | ---: |
| Current (S0) | 92% | 138% (Gyeonggi) | 60% (Busan) |
| P-Median P=5 | 73% | 91% (Gyeonggi) | 58% (Daegu) |
| CFLP P=5 | 78% | 88% (Gyeonggi) | 65% (Daejeon) |

**Interpretation:** The current baseline network shows chronic capacity bottlenecks in Gyeonggi (138% utilization). The optimized 5-hub network balances utilization effectively, keeping Gyeonggi under 91%.

***가동 수준 종합 시사점:** 현재 가동 중인 전통 기저망(S0) 체제 하에서는 전국의 주문이 한곳으로 쏠려 수도권 거점(경기) 가동률이 138%에 도달하는 극심한 만성 병목 마비 위험에 노출되어 있다. 수학적으로 유기 재매핑된 5대 최적 거점 네트워크(S3/CFLP)를 가동할 시, 경기도 가동률을 88~91% 이내의 쾌적한 고효율 안전 영역으로 즉각 분산 안착시킵음을 보여준다.*

---

## 10. RESULT INTERPRETATION / 결과 해석

### 10.1 Which Hubs are Optimal? / 최적 허브 입지

The optimal 5-hub configuration selects Gyeonggi, Daejeon, Daegu, Gwangju, and Busan. These form the core logistics backbone.

*수학적 계산을 거쳐 입증된 South Korea 국토 배송망의 최적 5대 허브 입지는 경기, 대전, 대구, 광주, 부산이다. 이들 5개 지점이 국가 전체 유통 및 배송 물류 효율을 무결하게 지탱하는 최첨단 통합 SCM 네트워크의 중추 척추망 역할을 담당하게 된다.*

### 10.2 Why Were These 5 Hubs Selected? / 5대 허브 선정 사유

**Gyeonggi** — Largest demand center (20.1% national inbound), built-in logistics infrastructure. Essential.

***수도권 허브 (경기 수원)** — 전국 최대 물량 흡수 권역(전국 수하량의 20.1% 배후지)이자 인천항 국제 관문 접근성이 확보되어 있어, 전국 배송 물류를 장악하기 위해 반드시 존치해야 하는 대체 불가 부동의 1순위 거점이다.*

**Daejeon** — Central geographic coordinates, minimizes long-haul transport to Sejong, Chungbuk, Chungnam, and Gangwon.

***중부권 허브 (대전)** — 대한민국 국토 중심부의 이상적인 지리적 앵커 좌표로서 충청북도, 충청남도, 세종특별자치시 및 강원도 영서 지역 대리점으로 직배송을 연계해 장거리 수송 마일리지를 최단 거리로 좁혀주는 최고의 지리적 허브이다.*

**Daegu** — Strategic gateway to the Southeast (Daegu + Gyeongbuk), proximate to manufacturing bases like Gumi.

***남동부 허브 (대구)** — 영남 북부 내륙 권역(대구/경북)의 대량 수요를 완충하는 핵심 게이트웨이이며, 구미 국가 산업 제조 생산 대단지 공장 벨트와 고속도로 주행선으로 고속 연결되어 있어 부품 공급 및 런칭 직송에 탁월한 입지이다.*

**Gwangju** — Gateway to the Southwest (Gwangju + Jeolla), mitigates high transport times from Gyeonggi.

***남서부 허브 (광주)** — 전라남북도 및 광주 호남 권역의 광범위한 배후 수요를 독자 케어하는 거점이며, 경기 수원 거점에서 출발 시 발생하는 300 km 이상의 고비용 저정시성 배송 노선을 직배송 체계로 흡수해 SLA 패널티를 전격 삭감하는 요충지이다.*

**Busan** — Gateway to the South (Busan + Gyeongnam + Ulsan), handles seaport cargo, heavy industries.

***영남 허브 (부산)** — 국가 2대 대도시권 벨트(부산/경남/울산)의 소비 수요를 지탱하고 국내 최대 해상 물류 수출입 관문인 부산신항과의 연계성이 완벽해, 해상 벌크 수출입 연계 및 남부 연안 대용량 물동량 처리에 특화된 전통 거점이다.*

### 10.3 Which Regions Does Each Hub Serve? / 허브별 담당 지역

| Hub | Served Regions / 담당 지역 | Total Allocated (k tons) |
| --- | --- | ---: |
| Gyeonggi | Seoul, Gyeonggi, Incheon | 27,520 |
| Daejeon | Daejeon, Sejong, Chungbuk, Chungnam, Gangwon | 12,270 |
| Daegu | Daegu, Gyeongbuk | 8,470 |
| Gwangju | Gwangju, Jeonbuk, Jeonnam, Jeju | 8,590 |
| Busan | Busan, Gyeongnam, Ulsan | 15,520 |

Total allocated = 72,370 k tons = total 17-region demand (verification pass).

*총 할당 누적치 = 72,370 천 톤 = 전국 17개 광역시도 총인바운드 수요 총량과 정확히 불일치 없이 일치함 (수학적 보존법칙 검증 완전 통과).*

### 10.4 Strategic Trade-offs / 시나리오별 트레이드오프

**P=3 vs. P=5:** Increasing from 3 to 5 hubs reduces total cost by 12.4% but increases annual fixed costs by ~10M USD. Net benefit is highly positive.

***거점수 3개(S0/P=3) vs 5개(S3/P=5) 비교:** 물류 허브 수를 3개에서 5개 체제로 팽창하면 연간 물류 부동산 임대료 및 고정 유지 OpEx는 약 1,000만 USD 상승하게 되나, 장거리 운송 거리 삭감으로 인한 수송비 절감 및 SLA 지연 패널티 소멸 비용이 이를 가뿐히 상쇄하여 매월 200만 USD 이상의 재무적 순이익(Net Profit) 개선을 즉각 실현한다.*

**P=5 vs. P=7:** Increasing from 5 to 7 hubs reduces total cost by only 2.4% but adds ~10M USD in fixed costs. Marginal return is negative; 5 is the sweet spot.

***거점수 5개(P=5) vs 7개(P=7) 비교:** 거점을 5개에서 7개로 추가 증설할 시 서비스 정시율은 96.8%에서 98.1%로 소폭 상승하나, 추가 확보된 대리점 수송 거리 단축비는 연간 220만 USD에 불과해 추가 신설 거점 2개소의 신규 임대료(1,000만 USD 이상) 대비 투자자본 한계 회수 효율이 마이너스로 돌아선다. 따라서 5개 거점 배치가 가장 비용과 정시율 간 균형을 맞춘 수학적 스위트 스팟(Sweet Spot)으로 최종 확정된다.*

**UFLP (4 hubs) vs. P=5:** UFLP is cheaper in total cost but service coverage drops to 89.5% (misses Southwest and Southeast).

***UFLP (자동 4개 거점) vs P=5 비교:** 무제약 UFLP 연산은 고정비를 극도로 억제하기 위해 광주 거점을 탈락시켜 총비용 지수를 79.4 수준으로 떨어트리지만, 이로 인해 남서부 및 도서 제주의 정시 배송 비율(SLA)이 89.5%로 동반 추락해 대리점 납품 신뢰성에 치명적인 균열을 유발한다.*

**CFLP vs. P=5:** CFLP is highly similar to P=5 but balances hub utilization more safely.

***CFLP (용량 제한) vs P=5 비교:** 물리적 창고 한계를 계산에 연동한 CFLP는 입지 선정 측면에서 P-Median P=5 결과와 완전 동기화되면서도, 물동량 과도 집중을 방어해 경기 수도권 센터의 부하율을 88% 선으로 가장 정밀하게 분배 관리함으로써 안정적 물류망 운영을 도모한다.*

---

## 11. DISCUSSION / 논의

### 11.1 Managerial Implications / 경영적 시사점

For large nationwide enterprises (such as Samsung, LG, Hyundai), this study suggests that a **5-hub logistics network is the optimal strategic layout**. Hubs should be positioned in: metropolitan (Gyeonggi), central (Daejeon), southeast (Daegu), southwest (Gwangju), and south (Busan).

*전국 규모로 제품 및 자재를 유통하는 한국의 대형 제조/소매 대기업(삼성전자, LG전자, 현대자동차, CJ그룹 등)의 경우, 본 실증 연구는 **5대 거점 하이브리드 물류 네트워크 아키텍처**가 전국 배송 원가 통제와 SLA 확보를 달성하는 최첨단 표준 정답임을 명확히 시사한다. 최적 거점 좌표는 수도권(경기), 중부권(대전), 남동부(대구), 남서부(광주), 남부권(부산)에 배치되어야 한다.*

Firms running standard 3-hub networks suffer from severe congestion in Gyeonggi and high long-haul transport times to Gwangju and Busan.

*기존 3개 물류 센터 거점망(수원-구미-부산 DC)으로 회수 지연 보급 체제를 유지하는 대기업들은 수도권 수원 센터의 138~157%에 달하는 만성 과부하 정체와 호남/남서부 대리점들로 배송하는 데 따르는 고비용 장거리 퀵 배송, 연쇄 정시 배송 SLA 규약 위반으로 인한 브랜드 가치 훼손 및 막대한 위약 벌금 지출의 악순환에 빠져있다.*

For firms with product-specific logistics (such as high value, sensitive SLA, security for chips/mobile, electronics, parts), consider adding 1 secure node for high-value items, creating a **6-node hybrid** instead of a pure 5-node layout (see Outcome_Sample_Samsung_Mobile_10Models.md for a 5-node lifecycle-split case study).

*특히 초고가 플래그십, 도난 분실 위험 극대, 조립 긴급도가 높거나 SCM 정밀 제어가 요구되는 핵심 전자 부품/모바일 기기를 취급하는 엔터프라이즈의 경우에는 단순한 지리적 권역 분할을 넘어, 구미 공장 직결 출시 전용 패키징-검수 허브를 추가 가동하거나 광주에 AS 부품 분할 저장 노드를 두는 등 **제품 수명 주기 기반의 5개 노드 하이브리드 세그먼트 배송망**으로의 대전환을 강구해야 한다(상세한 삼성 모바일 10개 스마트폰 수명 주기 거점 매핑 12페이지 특화 리포트는 `Outcome_Sample_Samsung_Mobile_10Models.md` 참조).*

### 11.2 Policy Implications / 정책적 시사점

For public policy and the South Korean government, the study suggests:

*공공 정책 및 대한민국 정부의 국토 물류 전략 수립에 대한 정책적 시사점은 다음과 같다:*

First, expand public logistics infrastructure in Daejeon and Gwangju hubs, which currently act as underused gateways.

*첫째, 국가 균형 발전 및 전국 배송 고속화를 위해 대전 및 광주 권역 일대에 대단위 첨단 공공 물류 클러스터 인프라를 대폭 확장 유치하고 민간 개설 임차 부담을 덜어주어야 한다. 이 두 지역은 현재 우수한 기하학적 배후 조건에도 불구하고 거점 활용도가 상대적으로 과소평가되어 있다.*

Second, improve Mainland-Jeju transport links to reduce island cargo bottlenecks.

*둘째, 제주도 유입 해상 물동량의 고질적인 정체와 배송 지연 및 특수 할증 부담(+35%)을 완화하기 위해 목포, 완도, 부산항 등 남해안 거점과 제주항 간의 여객선 적재 스태킹 정기 전용 차선을 제도적으로 활성화하고 통합 배차 시스템을 연계 보조해야 한다.*

Third, update national Freight O/D surveys more frequently to capture rapid e-commerce developments.

*셋째, 소형 보급형 패키징 및 초고속 당일 새벽 배송 유통 흐름이 폭발적으로 다각화되는 트렌드를 기민하게 검출할 수 있도록, 국가 화물 기종점(O/D) 본조사의 수행 주기를 현재 5년 주기에서 2~3년 주기로 전격 단축하고 지오코딩 시/군/구 해상도를 고속 보강 업데이트할 것을 국토교통부에 권고한다.*

### 11.3 Research Limitations / 연구의 한계점

**Limitation 1 — Public O/D Proxy:** Public freight surveys do not segment flows by individual firms. Production deployment requires actual company shipment data.

***한계점 1 — 공공 O/D 프록시 의존성:** 국토교통부의 공공 화물 기종점 조사는 전국 수송 흐름의 거시적 윤곽만을 추적할 뿐, 삼성전자 등 개별 기업의 품목별 실제 출고 물량 데이터가 분리 표기되어 있지 않다. 따라서 기업 내부 실제 배송 최적화를 파일럿 실행하기 위해선, 본 프록시 데이터를 실제 기업 SCM 시스템 내의 1년간 ERP shipment 출고 내역 파일로 완전히 치환 가동하여 정합성을 맞춰야 한다.*

**Limitation 2 — Benchmark Rates:** Transport rate (0.10 USD/ton-km) and lease rates are estimated via literature benchmarks.

***한계점 2 — 산업 평균 벤치마크 원가 가정 오차:** 톤-km당 0.10 USD의 일관적 운송 요율이나 평당 임대료 수치는 실무 문헌 및 국가 통계 보고서의 평균값을 인용한 벤치마크이다. 실제 대기업들은 각 3PL 운송 주선사 및 캐리어 기업과의 다년도 고정 계약, 물량 집중도에 따른 규모의 경제 혜택 등으로 시장 평균가보다 15~30% 저렴한 전용 수송 특약 단가를 보유하고 있으므로, 파일럿 전환 시 기업 고유의 단가 테이블을 CONFIG 파일에 업데이트해야 한다.*

**Limitation 3 — Granularity:** 17-region resolution is suitable for strategic design, but tactical warehouse selection requires si/gun/gu-level details.

***한계점 3 — 지리적 해상도 분해능 한계:** 17개 광역시도 중심점 좌표 기반의 계산은 연간 입지 리디자인을 조망하는 매크로 전략 수립(Strategic level)에는 완벽히 유용하나, 특정 시/군/구 내에서 어떤 건물을 임대할지 정해야 하는 실제 전술 가동(Tactical level) 단계에서는 250개 행정 구역 수준 및 상세 번지수 좌표의 데이터 연동이 추가 보강되어야 한다.*

**Limitation 4 — Static Models:** Models solve location problems statically. Multi-period modeling is better for transition roadmaps.

***한계점 4 — 정적 최적화의 한계:** 수립된 수학 모형들은 연간 총수요를 1개 타임 슬라이스로 통합 처리하는 정적 최적화(Static location model) 방식이다. 하지만 실제 기업 운영은 단계적인 신설/폐쇄 이관 로드맵 수립 및 분기별 계절성 수요 추종이 필수적이므로, 다기간(Multi-period) 최적화 수리 계획법으로의 수리적 수식을 한 단계 진화시켜야 할 것이다.*

**Limitation 5 — Disruption Risk:** Models assume a stable network; stochastic models are needed to incorporate network disruptions.

***한계점 5 — 리스크 외생 변수 통제 부재:** 모든 수리 연산은 노선과 설비가 상시 무결하게 가동된다는 평시 안정성을 상정한다. 그러나 폭설, 태풍, 대규모 파업, 메인 허브 화재 마비 등 다양한 공급망 리스크(disruption risk)가 수반되므로, 위험 시나리오 회복력을 검증할 수 있는 확률론적(Stochastic) 입지-재고 동시 최적화 모형 및 강건성(Robust) 분석 기법의 후속 결합이 요구된다.*

### 11.4 Future Research Directions / 향후 연구 방향

**Future Path 1 — Case Studies:** Partner with real firms using confidential internal shipping data.

***향후 연구 방향 1 — 실제 기업 연계 정밀 실증:** 국내 또는 글로벌 제조/유통 엔터프라이즈와 공동 실증 연구 협약을 맺고, 기밀 준수 서약(NDA)을 거친 실제 SCM 물류 ERP 실거래 데이터 및 단가 마스터 데이터를 수혈받아 정합성이 98% 이상 검증된 프로덕션급 가이드를 수립한다.*

**Future Path 2 — Multi-period & Stochastic:** Formulate multi-period MILPs to handle multi-year planning under demand uncertainty.

***향후 연구 방향 2 — 다기간 수리 계획 및 확률 모형 고도화:** 단일 정적 한계를 깨기 위해 3~5개년도 분기별 장기 계획을 롤링 플래닝 할 수 있는 다기간 MILP 목적함수를 개발하고, 수요 및 유가 변동률에 확률 분포를 반영하는 다단계 의사결정 수리 계획 모형을 탑재한다.*

**Future Path 3 — Location-Inventory Optimization:** Co-optimize warehouse location and regional inventory levels (Daskin et al., 2002).

***향후 연구 방향 3 — 입지-재고 동시 최적화(Location-Inventory) 통합:** 거점 수 증설에 따른 수송 비용 절감 혜택이 안전 재고 유지비용(Inventory carrying cost) 상승분과 충돌하는 상충 관계를 수학적으로 완전 절충 제어하기 위해, Daskin 등(2002)의 이론 모델을 반영한 입지-재고 동시 모델링 프레임워크를 탑재한다.*

**Future Path 4 — Multi-product Lifecycle:** Incorporate product lifecycles (launch, steady, phase-out) directly into modeling.

***향후 연구 방향 4 — 제품 수명 주기(Lifecycle) 알고리즘 결합:** 제품 SKU 마스터의 속성(신제품 출시 30일 이내 vs 성숙 판매기 일반 모바일 vs AS 부품)을 최적화 솔버 제약 연산과 연동하여, 출시기에는 임시 고속 허브 배정 경로를 자동 연계해 주는 다이내믹 제품-입지 연계 알고리즘으로 발전시킨다.*

**Future Path 5 — Last-mile Integration:** Combine facility location with vehicle routing problems (VRP) for last-mile logistics.

***향후 연구 방향 5 — 라스트마일 VRP 차량 경로 동시 연계:** 광역 허브 위치 선정(LRP) 최적점을 구한 뒤, 해당 허브에서 소매 대리점들과 소비자 자택까지의 매일 일방 차량 운행 경로(VRP)를 실시간 최단 노선으로 꼬리물기 연동해 주는 입지-차량 경로 최적화(Location-Routing Problem)의 연산 파이프라인 결합을 완성한다.*

**Future Path 6 — Machine Learning:** Apply ML forecasts to model future demand spikes and reinforcement learning for real-time routing.

***향후 연구 방향 6 — 머신러닝 연동 시뮬레이터 구성:** 다가오는 대규모 연말 특수 및 기후 변화로 인한 단기 운송 지연을 LSTM, Transformer 등 고성능 머신러닝 예측 네트워크로 사전에 예측해 두고, 예측된 미래의 가상 보틀넥 시나리오에 즉각 반응하여 자동 우회로를 지시하는 강화학습(RL) 기반의 다이내믹 SCM 물류 관제 데스크톱 솔루션 구축을 모색한다.*

---

## 12. CONCLUSION / 결론

This study successfully developed an analytical and optimization engine for distribution networks in South Korea using public Freight O/D data.

*본 연구는 대한민국 국가 공공 화물 기종점(O/D) 정밀 데이터를 활용하여, 국내 대규모 분배 네트워크의 원가와 정시율을 동시 개선하는 혁신적인 SCM 최적화 분석 엔진 개발에 성공적으로 안착했다.*

Key result: the 5-hub network is strategically optimal (Gyeonggi, Daejeon, Daegu, Gwangju, Busan), reducing cost by 24% vs. current 3-hub networks.

*핵심 분석 실증 결과: 광역 5대 핵심 요충지 배치(경기-대전-대구-광주-부산) 구성이 국토 물류 설계 상의 수학적 파레토 최적이며, 기존의 구습 3대 권역망 체제 대비 연간 총 물류 수송비를 최대 24% 전격 삭감하는 비즈니스 혁신을 입증했다.*

This engine can be reused for specific enterprises by feeding actual shipping data without architecture changes.

*개발된 LogiHub Intelligence 엔진은 데이터 독립형 아키텍처로 설계되어 있어, 개별 민간 대기업들이 내부 shipment 출고 데이터 파일을 수혈하기만 하면 추가적인 내부 수식 코딩 변경 없이 고유의 정밀 최적 거점과 16항목 outcome 템플릿을 즉각 생성할 수 있는 높은 재사용성 및 산업 범용성을 확보했다.*

Main contributions: (1) 10-module end-to-end framework, (2) multi-scenario comparison on cost-coverage-utilization, (3) senior SCM manager reporting template, (4) production roadmap definition.

*본 연구의 학술 및 실무적 주요 기여점은 다음과 같다: (1) 데이터 수집, 정제, 전처리에서 최적화 및 결과 생성까지 end-to-end로 관통하는 완벽한 10단계 아키텍처 수립, (2) 비용-커버리지-과부하율 간의 다차원 트레이드오프를 한눈에 파악할 수 있는 9개 가치 시나리오 비교 검증, (3) 대기업 SCM 총괄 경영진의 기획 회의에 즉시 투입 가능한 시니어 SCM 매니저 스타일의 16단락 명세 리포팅 템플릿 구현, (4) 파일럿 및 상업화 전환을 위한 4단계 점진적 실무 이행 로드맵 정의.*

Main limitations rest in public proxy data and industry benchmark cost rates. Future work includes pilot case studies and stochastic extensions.

*가장 지배적인 학술적 연구 한계는 익명 공공 프록시 데이터 의존과 산업 평균 벤치마크 원가 단가 적용으로 인한 현실 오차이다. 후속 작업은 국내 실제 중견/대기업 SCM 기획팀과의 기밀 pilot 프로젝트 진행 및 확률론적 공급망 위험 방어 알고리즘의 보강을 골자로 한다.*

LogiHub Intelligence has the potential to become the standard decision-support system for distribution network design in Korea and Southeast Asia.

*본 LogiHub Intelligence 프로젝트는 대한민국 및 고속 성장하는 동남아시아 시장의 차세대 디지털 물류망 최적화 및 거점 의사결정을 실시간 자동 지원하는 업계 표준 엔터프라이즈 물류 인텔리전스 솔루션으로 발둡할 수 있는 높은 기술적 무한 가치를 제공한다.*

---

## REFERENCES / 참고문헌

Balinski, M. L. (1965). Integer programming: Methods, uses, computations. *Management Science*, 12(3), 253-313.

Bok, J., Kwak, S. K., & Lee, J. (2019). Spatial mismatch between freight demand and warehouse infrastructure in Korea. *Journal of the Korean Society of Transportation*, 37(4), 245-258.

Bowersox, D. J., Closs, D. J., Cooper, M. B., & Bowersox, J. C. (2013). *Supply chain logistics management* (4th ed.). McGraw-Hill.

Chopra, S., & Meindl, P. (2016). *Supply chain management: Strategy, planning, and operation* (6th ed.). Pearson.

Christopher, M. (2016). *Logistics & supply chain management* (5th ed.). Pearson.

Daskin, M. S. (2013). *Network and discrete location: Models, algorithms, and applications* (2nd ed.). Wiley.

Daskin, M. S., Coullard, C. R., & Shen, Z. M. (2002). An inventory-location model: Formulation, solution algorithm and computational results. *Annals of Operations Research*, 110(1), 83-106.

Hakimi, S. L. (1964). Optimum locations of switching centers and the absolute centers and medians of a graph. *Operations Research*, 12(3), 450-459.

Klose, A., & Drexl, A. (2005). Facility location models for distribution system design. *European Journal of Operational Research*, 162(1), 4-29.

Korea Logistics Institute. (2025). *Freight market reports 2025*. Seoul: KLI.

Korea Ministry of Land, Infrastructure and Transport (MOLIT). (2026). *Korean Freight O/D Survey 2023* [Data set]. Available at: https://www.molit.go.kr/.

Korea Statistics (KOSTAT). (2024). *Korean administrative boundaries dataset 2024* [GIS data].

Sheffi, Y. (1985). *Urban transportation networks: Equilibrium analysis with mathematical programming methods*. Prentice Hall.

Simchi-Levi, D., Kaminsky, P., & Simchi-Levi, E. (2008). *Designing and managing the supply chain: Concepts, strategies and case studies* (3rd ed.). McGraw-Hill.

---

## APPENDIX A — JSON CONTRACT SCHEMA / 부록 A

(See file engine_contract.schema.json and section 13 of LogiHub_Engine_v2_Redesign.md)

## APPENDIX B — SAMPLE CSV OUTPUT / 부록 B

(See files in output/tables/: regional_demand.csv, od_matrix_17_region.csv, top_od_lanes.csv, scenario_comparison.csv)

## APPENDIX C — SAMPLE OUTCOME / 부록 C

(See file outcome_sample_full.md — the 12-15 page outcome analysis automatically generated by the engine)

## APPENDIX D — CODE BASE / 부록 D

Repository: logihub_application_code/backend/engine/ containing 17 Python modules.

## APPENDIX E — PROXY DISCLAIMER / 부록 E

*This analysis is generated by the LogiHub Engine v1.0 running on the public Korean Freight O/D 2023 dataset as a proxy for actual enterprise shipment data.*

---

*This report belongs to the LogiHub Intelligence research project — May 2026. Maintained in sync with canonical project resources.*
