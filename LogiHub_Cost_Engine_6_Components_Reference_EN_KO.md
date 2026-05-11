# LOGIHUB COST ENGINE — 6 COST COMPONENTS & INDUSTRY BENCHMARKS

*This document explains in detail Module 6 (Cost Engine) of LogiHub. Group B implements Module 6 using this document as the sole reference source.*
*본 문서는 LogiHub의 모듈 6(비용 엔진)을 상세히 설명한다. 그룹 B는 본 문서를 유일한 참고 자료로 사용하여 모듈 6을 구현한다.*

---

## 1. OVERVIEW / 개요

When the LogiHub engine calculates the total cost of a logistics network, it aggregates **6 distinct cost components**. Each component has a specific mathematical formulation and requires one or more **coefficients** (rates, percentages, or fixed values). Since actual proprietary freight contracts (such as Samsung's internal contracts) are unavailable, these coefficients are derived from **industry-average benchmarks in logistics** — referred to as "industry benchmark coefficients."

*LogiHub 엔진이 물류 네트워크의 총비용을 계산할 때, **6가지 개별 비용 구성 요소**를 합산한다. 각 구성 요소는 고유한 공식을 가지며, 하나 이상의 **계수**(요율, 비율, 고정값)를 필요로 한다. 실제 물류 계약 데이터(예: 삼성 내부 계약)를 사용할 수 없으므로, 이러한 계수들은 **물류 산업 평균 벤치마크**("산업 벤치마크 계수")에서 도출되었다.*

---

## 2. TOTAL COST FORMULATION / 총비용 공식

```
TOTAL ANNUAL LOGISTICS COST / 연간 총 물류 비용
=
(1) Transportation Cost / 운송 비용
+ (2) Warehouse Fixed Cost / 물류창고 고정 비용
+ (3) Handling Cost / 하역 및 처리 비용
+ (4) Inventory Holding Cost / 재고 보유 비용
+ (5) Seasonal Flex Cost / 성수기 유연성 비용
+ (6) SLA Penalty / SLA 패널티 및 배송 지연 비용
```

Each component can be calculated in detail across dimensions (demand region × warehouse × product line × month). The engine stores these values in a 5-dimensional **cost tensor** `C[i, j, p, t, k]`, where `k` represents the index of the 6 cost components.

*각 구성 요소는 (수요 지역 × 창고 × 제품군 × 월) 차원에 따라 상세히 계산될 수 있다. 엔진은 이러한 값들을 5차원 **비용 텐서(cost tensor)** `C[i, j, p, t, k]` 형태로 저장하며, 여기서 `k`는 6가지 비용 구성 요소의 인덱스를 나타낸다.*

---

## 3. COST COMPONENT DETAILS / 비용 구성 요소별 상세 내용

### 3.1 Transportation Cost / 운송 비용 (Transport Cost)

**Definition:** Payments made to truck, vessel, or air carriers to move freight from warehouses to demand points.
*정의: 창고에서 수요지까지 화물을 이동하기 위해 트럭, 선박, 항공 운송업체에 지불하는 비용.*

**Mathematical Formulation:**
*공식:*

$$\text{TransportCost} = \text{Demand (tons)} \times \text{Distance (km)} \times \text{Rate (USD/ton-km)} \times (1 + \text{Surcharge})$$

**Freight Rates by Product Line:**
*제품군별 운송 요율:*

| Product Line / 제품군 | Rate (USD/ton-km) | Rationale / 요율 차이 사유 |
| --- | ---: | --- |
| Mobile launch / 모바일 출시 | 0.18 | Express priority + high insurance coverage / 특송 우선순위 + 높은 보험 가입 |
| Bulky appliance / 대형 가전 | 0.13 | Bulky volume, standard transit / 대형 화물, 표준 운송 |
| High-value secure (chip) / 고가 보안 화물 (칩) | 0.35 | High security, armored vehicles, escort / 철저한 보안, 전용 차량, 에스코트 |
| Finished goods / 일반 완제품 | 0.10 | Standard trucking rate / 표준 트럭 운송 요율 |
| Spare parts / 예비 부품 | 0.15 | Express delivery 24-48h / 24-48시간 내 신속 배송 |
| E-commerce small / 이커머스 소형 화물 | 0.12 | Small parcel last-mile / 소형 패키지 라스트마일 배송 |

**Surcharges:**
*할증료 (Surcharges):*

| Condition / 조건 | Surcharge / 할증률 | Rationale / 적용 사유 |
| --- | ---: | --- |
| Long-haul > 300 km / 장거리 (>300 km) | +8% | Driver fatigue, road tolls / 운전사 피로도, 고속도로 통행료 |
| Jeju Island / 제주도 (섬 지역) | +35% | Ferry transport surcharge / 페리 선적 운송 비용 |
| Bulky freight / 부피 화물 | +20% | Underutilized weight capacity / 중량 대비 공간 점유율 높음 |
| High security / 고보안 운송 | +25% | Specialized monitoring, safe stops / 전용 모니터링, 안전 구역 주차 |
| Expedited delivery / 긴급 배송 | +50% | Dedicated trucks, immediate routing / 전용 차량 배차, 즉시 출발 |

**Example Calculation / 계산 예시:**
Transporting 100 tons of mobile phones from Suwon to Busan (385 km) with a long-haul surcharge of +8%:
*수원에서 부산(385 km)까지 모바일 폰 100톤을 운송하는 경우 (장거리 할증 +8% 적용):*

$$100 \text{ tons} \times 385 \text{ km} \times 0.18 \text{ USD/ton-km} \times 1.08 = 7,484 \text{ USD}$$

---

### 3.2 Warehouse Fixed Cost / 물류창고 고정 비용 (Warehouse Fixed Cost)

**Definition:** Annualized expense of leasing, operating, securing, and maintaining a warehouse facility—incurred regardless of the actual throughput volume.
*정의: 창고 임대, 운영, 보안 및 시스템 유지 관리에 소요되는 연간 비용. 처리 물동량에 관계없이 고정적으로 발생.*

**Mathematical Formulation:**
*공식:*

$$\text{WarehouseFixedCost}_j = F_j \times y_j$$

where $F_j$ is the annual fixed cost of warehouse $j$, and $y_j \in \{0, 1\}$ is a binary variable indicating whether warehouse $j$ is open ($y_j = 1$) or closed ($y_j = 0$).
*여기서 $F_j$는 창고 $j$의 연간 고정 비용이며, $y_j$는 창고 $j$의 개설 여부를 나타내는 이진 변수이다 (개설 시 1, 폐쇄 시 0).*

**Fixed Cost Benchmarks by Facility Type (USD/year):**
*시설 유형별 고정 비용 벤치마크:*

| Facility Type / 창고 유형 | Standard Footprint / 표준 면적 | Fixed Cost/Year / 연간 고정 비용 (USD) |
| --- | ---: | ---: |
| Metropolitan Hub (Seoul/Suwon) / 수도권 허브 | 25,000 m² | 6,800,000 |
| Regional Hub (Daejeon/Busan/Gwangju) / 권역별 허브 | 22,000 m² | 5,400,000 |
| Dedicated Launch Center (Gumi) / 전용 출시 센터 | 18,000 m² | 4,200,000 |
| Small Service Node / 소형 서비스 노드 | 14,000 m² | 3,400,000 |
| High-Security Node (Semiconductors) / 고보안 노드 (반도체) | 20,000 m² | 7,500,000 |

**Cost Driver Rationale:** Cost variances are driven by geographic location (Seoul land rent is significantly higher than Gwangju), security level requirements (semiconductor chips require extensive CCTV networks, biometric entry, and motion sensors), and automation technology level.
*비용 차이 사유: 지리적 위치(서울의 임대료가 광주보다 훨씬 높음), 요구되는 보안 수준(반도체 창고는 광범위한 CCTV, 생체 인식 출입 및 모션 센서 필요), 물류 자동화 설비 수준에 따라 차이가 발생.*

---

### 3.3 Handling Cost / 하역 및 처리 비용 (Handling Cost)

**Definition:** Expenses incurred per ton of cargo processed through the facility, covering activities such as loading, unloading, packing, serial counting, and labeling.
*정의: 창고를 거치는 화물 1톤당 발생하는 물리적 처리 비용. 상하차, 포장, 일련번호 검수, 라벨링 작업 등을 포함.*

**Mathematical Formulation:**
*공식:*

$$\text{HandlingCost} = \text{Volume (tons)} \times \text{HandlingRate (USD/ton)}$$

**Handling Benchmarks by Product Line (USD/ton):**
*제품군별 하역/처리 요율 벤치마크:*

| Product Line / 제품군 | Handling Rate (USD/ton) / 처리 요율 |
| --- | ---: |
| Mobile launch / 모바일 출시 | 25 |
| Bulky appliance / 대형 가전 | 45 |
| High-value secure (chip) / 고가 보안 화물 | 80 |
| Finished goods / 일반 완제품 | 18 |
| Spare parts / 예비 부품 | 22 |
| E-commerce small / 이커머스 소형 | 20 |

**Operational Rationale:** Bulky appliances require specialized heavy forklifts and two-man handling teams (45 USD/ton); high-value secure items require serial validation, continuous camera monitoring, and biometric logging (80 USD/ton); mobile launch goods require customized retail kit-packing (25 USD/ton); and standard finished goods require only basic pallet staging (18 USD/ton).
*작업적 차이 사유: 대형 가전은 전용 중장비 지게차와 2인 1조 작업반이 필요함(45 USD/톤); 고가 보안 제품은 일련번호 검수, 실시간 카메라 녹화 및 생체 출입 기록이 필수적임(80 USD/톤); 모바일 출시 제품은 대형 소매용 키트 패킹 작업이 수반됨(25 USD/톤); 일반 완제품은 단순 팔레트 적재만 필요함(18 USD/톤).*

---

### 3.4 Inventory Holding Cost / 재고 보유 비용 (Inventory Holding Cost)

**Definition:** Capital tied up in physical inventory—representing the opportunity cost of capital (interest rates) plus physical storage risk and insurance.
*정의: 보관 중인 실물 재고에 묶인 자본 비용. 자본의 기회비용(금리)과 실물 보관 위험, 보험료 등을 합산한 비용.*

**Mathematical Formulation:**
*공식:*

$$\text{InventoryHoldingCost} = \text{AvgInventory (tons)} \times \text{UnitValue (USD/ton)} \times \text{HoldingPct/month}$$

where $\text{AvgInventory} \approx 0.5 \times \text{MonthlyDemand}$ (based on standard inventory turnover assumptions).
*여기서 $\text{AvgInventory} \approx 0.5 \times \text{월간 수요}$(표준 재고 회전율 가정 적용).*

**Inventory Cost Benchmarks:**
*재고 보유 비용 벤치마크:*

| Product Line / 제품군 | Unit Value (USD/ton) / 톤당 가치 | Monthly Holding Rate / 월간 보유 비율 (%) |
| --- | ---: | ---: |
| Mobile launch / 모바일 출시 | 50,000 | 2.5% |
| Bulky appliance / 대형 가전 | 8,000 | 1.2% |
| High-value secure (chip) / 고가 보안 화물 | 200,000 | 4.0% |
| Finished goods / 일반 완제품 | 12,000 | 1.5% |
| Spare parts / 예비 부품 | 30,000 | 2.0% |
| E-commerce small / 이커머스 소형 | 15,000 | 1.8% |

**Economic Driver Rationale:** High-value semiconductor chips valued at 200,000 USD/ton incur an opportunity cost of 8,000 USD/ton/month. Conversely, low-value bulky appliances stored in standard facilities incur only 96 USD/ton/month. This massive variance explains why **semiconductor chips must follow a strict fast-moving flow** with minimal warehousing stockpiles.
*경제적 차이 사유: 톤당 200,000 USD 가치의 고가 반도체 칩은 매월 톤당 8,000 USD의 막대한 기회비용이 발생한다. 반면, 일반 창고에 보관되는 저가 대형 가전은 월간 톤당 96 USD만 발생한다. 이 엄청난 격차가 **반도체 칩이 반드시 빠른 회전율**을 유지하고 장기 보관을 금지해야 하는 이유를 설명한다.*

**Example Calculation / 계산 예시:**
A facility holds an average inventory of 200 tons of mobile phones:
*수요지 창고의 모바일 폰 평균 재고가 200톤인 경우:*

$$200 \text{ tons} \times 50,000 \text{ USD/ton} \times 0.025 = 250,000 \text{ USD/month}$$

---

### 3.5 Seasonal Flex Cost / 성수기 유연성 비용 (Seasonal Flex Cost)

**Definition:** Extra costs incurred when shipment demand exceeds the standard capacity of a warehouse (e.g., during Galaxy flagship launches). The facility must pay staff overtime wages or leverage third-party logistics (3PL) spillover spaces.
*정의: 출고 수요가 창고의 표준 수용량을 초과할 때(예: 갤럭시 플래그십 출시월) 발생하는 추가 비용. 초과 근무 수당을 지불하거나 3자 물류(3PL) 외부 창고 공간을 확보해야 함.*

**Mathematical Formulation:**
*공식:*

$$\text{Overflow} = \max(0, \text{MonthlyDemand} - \text{BaseCapacity})$$

$$\text{OvertimeCost} = \min(\text{Overflow}, \text{BaseCapacity} \times 0.20) \times \text{BaseRate} \times 1.5$$

$$\text{ThreePLCost} = \max(0, \text{Overflow} - \text{BaseCapacity} \times 0.20) \times \text{BaseRate} \times 2.0$$

$$\text{SeasonalFlexCost} = \text{OvertimeCost} + \text{ThreePLCost}$$

**Calculation Logic:** The initial overflow tier (up to 20% of base capacity) is handled via internal overtime labor at a 1.5x multiplier. Any overflow exceeding this 20% threshold must be routed to 3PL partners at a 2.0x multiplier.
*계산 로직: 초과분 중 1차 범위(기본 용량의 20% 이하)는 1.5배의 가중치가 부여되는 직원 초과 근무로 충당한다. 20% 임계치를 넘는 추가 초과분은 2.0배 가중치의 3PL 파트너 창고로 이전 배정한다.*

**Benchmark Multipliers:**
*할증 배수 벤치마크:*

| Multiplier Type / 배수 유형 | Value / 가중 배수 | Operational Rationale / 적용 사유 |
| --- | ---: | --- |
| Overtime rate / 초과 근무 요율 | 1.5× | Mandated overtime rate under South Korean Labor Standard Act / 한국 근로기준법상 연장근로 수당 규정 |
| 3PL rate / 3PL 위탁 요율 | 2.0× | Partner margin, short-term lease surcharges, setup costs / 파트너 마진, 단기 임대 할증, 셋업 비용 |

**Example Calculation / 계산 예시:**
Suwon DC has a monthly base capacity of 480,000 units. During a launch month, demand spikes to 752,000 units (resulting in an overflow of 272,000 units):
*수원 DC의 기본 월간 용량이 480,000개일 때, 신제품 출시월에 수요가 752,000개로 급증한 경우 (초과분 = 272,000개):*

$$\text{Overtime Portion} = \min(272,000, 480,000 \times 0.20) = 96,000 \text{ units}$$

$$\text{3PL Portion} = 272,000 - 96,000 = 176,000 \text{ units}$$

$$\text{OvertimeCost} = 96,000 \times \text{BaseRate} \times 1.5$$

$$\text{ThreePLCost} = 176,000 \times \text{BaseRate} \times 2.0$$

---

### 3.6 SLA Penalty / SLA 패널티 및 배송 지연 비용 (SLA Penalty)

**Definition:** Penalties incurred when a warehouse is located too far from the customer region, causing transport times to exceed the Service Level Agreement (SLA). Compensation may involve shipping refunds, discounts, or production line penalties.
*정의: 창고가 서비스 지역에서 너무 멀리 떨어져 있어 배송 시간이 계약 약정(SLA)을 초과할 때 발생하는 벌금 및 배상금. 배송비 환불, 할인권 지급, 혹은 생산 지연 배상금 등을 포함.*

**Mathematical Formulation:**
*공식:*

$$\text{SLA Penalty}_{i,j,p} = \begin{cases} \text{Demand}_{i,p} \times \text{PenaltyRate}_p & \text{if } \text{Distance}(i, j) > \text{SLARadius}_p \\ 0 & \text{otherwise} \end{cases}$$

**SLA Benchmarks by Product Line:**
*제품군별 SLA 기준 벤치마크:*

| Product Line / 제품군 | SLA Service Radius (km) / 서비스 반경 | Penalty Rate (USD/ton) / 패널티 요율 |
| --- | ---: | ---: |
| Mobile launch / 모바일 출시 | 200 | 200 |
| Bulky appliance / 대형 가전 | 400 | 80 |
| High-value secure (chip) / 고가 보안 화물 | 150 | 800 |
| Finished goods / 일반 완제품 | 350 | 60 |
| Spare parts / 예비 부품 | 200 | 250 |
| E-commerce small / 이커머스 소형 | 100 | 100 |

**Operational Rationale:** Retail customers buying flagship mobile phones expect same-day or next-day delivery (narrow 200 km radius, high penalty). Bulky appliances can tolerate 2-3 day deliveries (broad 400 km radius, low penalty). Semiconductor chips delivered to B2B manufacturing plants (LG, Apple) carry extremely severe penalties of 800 USD/ton because delivery delays can cause factory line-stops.
*작업적 차이 사유: 신형 플래그십 폰을 구매하는 일반 소비자는 당일 혹은 익일 배송을 원하므로 서비스 반경이 200 km로 좁고 패널티가 높음. 대형 가전은 2-3일의 배송 여유가 있어 반경이 400 km로 넓고 패널티가 낮음. 반도체 칩은 B2B 제조업체(LG, 애플 등) 공장으로 배송되어 지연 시 라인 가동 중단(Line-stop)을 야기하므로 톤당 800 USD의 매우 엄격한 패널티가 부과됨.*

---

## 4. GLOBAL CONFIGURATION COEFFICIENTS / 글로벌 설정 계수

All coefficients are centralized in the configuration file `engine/config.py` to facilitate calibration. When adjustments are needed, changes are applied exclusively here, preventing hardcoded values in code modules.
*모든 계수는 손쉬운 조정을 위해 설정 파일인 `engine/config.py`에 일원화되어 관리된다. 계수 변경 필요 시 본 파일만 수정하며, 개별 코드 모듈의 하드코딩을 원천 차단한다.*

```python
# engine/config.py

# === Transport ===
TRANSPORT_RATE_BY_PRODUCT = {  # USD per ton-km
    "mobile_launch": 0.18,
    "bulky_appliance": 0.13,
    "high_value_secure": 0.35,
    "finished_goods": 0.10,
    "spare_parts": 0.15,
    "ecommerce_small": 0.12,
}

SURCHARGE = {
    "long_haul_300km": 0.08,
    "island_jeju": 0.35,
    "bulky": 0.20,
    "secure": 0.25,
    "expedite": 0.50,
}

# === Warehouse fixed cost ===
WAREHOUSE_FIXED_COST_USD = {  # per year
    "metro": 6_800_000,
    "regional": 5_400_000,
    "launch": 4_200_000,
    "service_node": 3_400_000,
    "secure": 7_500_000,
}

# === Handling ===
HANDLING_RATE_BY_PRODUCT = {  # USD per ton
    "mobile_launch": 25,
    "bulky_appliance": 45,
    "high_value_secure": 80,
    "finished_goods": 18,
    "spare_parts": 22,
    "ecommerce_small": 20,
}

# === Inventory ===
UNIT_VALUE_USD_PER_TON = {
    "mobile_launch": 50_000,
    "bulky_appliance": 8_000,
    "high_value_secure": 200_000,
    "finished_goods": 12_000,
    "spare_parts": 30_000,
    "ecommerce_small": 15_000,
}

HOLDING_COST_PCT_PER_MONTH = {
    "mobile_launch": 0.025,
    "bulky_appliance": 0.012,
    "high_value_secure": 0.040,
    "finished_goods": 0.015,
    "spare_parts": 0.020,
    "ecommerce_small": 0.018,
}

# === Seasonal flex ===
OVERTIME_MULTIPLIER = 1.5
THREEPL_MULTIPLIER = 2.0
OVERTIME_CAPACITY_PCT = 0.20  # Overtime covers maximum 20% of base capacity

# === SLA ===
SLA_RADIUS_KM = {
    "mobile_launch": 200,
    "bulky_appliance": 400,
    "high_value_secure": 150,
    "finished_goods": 350,
    "spare_parts": 200,
    "ecommerce_small": 100,
}

SLA_PENALTY_PER_TON = {
    "mobile_launch": 200,
    "bulky_appliance": 80,
    "high_value_secure": 800,
    "finished_goods": 60,
    "spare_parts": 250,
    "ecommerce_small": 100,
}

# === Capacity bands ===
UTILIZATION_BANDS = {
    "underused": (0.0, 0.7),
    "healthy": (0.7, 0.9),
    "watchlist": (0.9, 1.0),
    "overload": (1.0, 1.1),
    "critical": (1.1, 99.0),
}
```

There are **approximately 50 distinct parameters** managed in the configuration script. These form the primary calibration variables of the engine; modifying this single file dynamically recalibrates the entire model.
*설정 스크립트에서는 **약 50개의 개별 파라미터**를 일괄 관리한다. 이는 엔진의 핵심 조정 변수 집합으로, 이 파일의 파라미터를 수정하면 전체 모델 계산이 동적으로 보정된다.*

---

## 5. RECONCILING "INDUSTRY BENCHMARKS" / "산업 벤치마크"의 정의와 의의

### 5.1 Three Classes of Cost Coefficients / 비용 계수의 3가지 분류

| Coefficient Class / 계수 분류 | Primary Source / 출처 | Precision Level / 정확도 | Primary User / 사용 목적 |
| --- | --- | --- | --- |
| **Mock / 모의 계수** | Internal engineering estimations / 개발진 자체 설계 | Negligible / 낮음 | Code execution testing / 내부 로직 테스트 |
| **Industry Benchmark / 산업 벤치마크** ← *Active* | Literature, public freight reports / 문헌, 공공 화물 보고서 | Moderate (±20-40% error) / 보통 | Strategic proxy simulation / 프록시 엔진 (중간 보고) |
| **Actual Contract Cost / 실거래 계약 비용** | Proprietary carrier and labor agreements / 기업 내부 실제 물류 계약 | absolute / 매우 높음 | Production system deployment / 프로덕션 엔진 (파일럿 이후) |

### 5.2 Deciphering the Benchmark Concept / 벤치마크의 개념 and Significance
In logistics engineering, a "benchmark" represents the **industry-average reference value**. For example, South Korean domestic trucking rates average 0.10 to 0.18 USD/ton-km depending on cargo type. Actual freight costs for a specific enterprise (such as Samsung) can deviate from these benchmarks due to several key factors:
*물류 엔지니어링에서 "벤치마크"는 **산업 평균 기준치**를 뜻한다. 예를 들어, 한국 내수 트럭 운송 요율은 품목에 따라 톤-km당 평균 0.10~0.18 USD 범위 내에 있다. 삼성과 같은 특정 대기업의 실제 비용은 다음과 같은 요소들로 인해 벤치마크와 상이할 수 있다:*

- **Scale of Operations / 규모의 경제:** Mega-volume shippers like Samsung can negotiate freight contracts with carriers that are 15-30% lower than market averages.
  *대형 고객사 요율: 삼성과 같은 초대형 화주는 운송사와 시장 평균보다 15~30% 저렴한 전용 계약 요율을 협상할 수 있음.*
- **Long-term Agreements / 장기 계약:** Standard 3-5 year contracts stabilize rates, protecting the shipper from high spot-market freight rate spikes.
  *장기 계약 안정성: 3~5년 단위의 장기 계약은 요율을 고정하여 현물 시장(Spot)의 가격 급등 위험을 헤지함.*
- **Geographic Proximity / 지리적 근접성:** Facilities positioned near international gateways like Busan Port incur substantially lower export drayage than inland facilities in Daegu.
  *지리적 근접성: 부산항 등 수출 관문 근처에 위치한 설비는 대구 등 내륙 중심 설비보다 배후 수송 비용이 현저히 절감됨.*
- **Dedicated Fleet Operations / 전용 차량 운행:** Conglomerates run private fleets with custom cost structures, diverging from generic 3PL freight rate cards.
  *전용 차량 운영: 대기업은 독자적인 원가 구조를 가진 자사 차량(Private Fleet)을 직접 운행하여 일반 3PL 요율표와 차이를 보임.*

In summary, industry benchmarks serve as an **industry-average ruler**. When applied to a specific firm, errors range between ±20-40%. This is why benchmark coefficients are sufficient for **demonstration-grade engines** but insufficient for **production-grade deployment**.
*요약하자면, 산업 벤치마크는 **"업계 평균 자"** 역할을 한다. 개별 기업에 대입 시 ±20-40%의 오차가 발생할 수 있으므로, 데모 단계(Demonstration-grade)의 분석에는 적합하지만, 실제 비즈니스 적용(Production-grade)을 위해서는 실거래 데이터 입력이 필수적이다.*

### 5.3 Provenance of Benchmark Coefficients / 벤치마크 계수의 도출 출처

The project development team synthesized these coefficients from 4 distinct references:
*개발팀은 다음 4가지 검증된 출처에서 벤치마크 계수를 종합하여 산출하였다:*

**Reference 1 — SCM Literature / 공급망 문헌:** General strategic relationships (transport curves, inventory holding percentages, capacity multipliers) are derived from classical textbooks: Chopra & Meindl "Supply Chain Management" and Simchi-Levi "Designing and Managing the Supply Chain."
*문헌 분석: 전반적인 물류 네트워크 설계 원리와 상관관계는 학계 표준 문헌인 Chopra & Meindl의 "공급망 관리" 및 Simchi-Levi의 "공급망 설계 및 관리"에서 차용함.*

**Reference 2 — South Korean Freight Publications / 한국 물류 통계:** The Korea Logistics Institute publishes annualized logistics cost benchmarks. The team integrated the 2023-2024 publications to capture realistic domestic transport rates.
*한국 물류 통계: 한국교통연구원(KOTI) 및 한국물류연구원에서 매년 발간하는 국가 물류 비용 벤치마크 중 2023-2024년 최신 수치를 반영함.*

**Reference 3 — Market-based Retail Conversions / 시장 가치 환산:** Unit values (USD/ton) for the 6 product lines were translated from standard consumer retail prices:
*시장 가치 환산: 6가지 대표 제품군의 톤당 가치는 실제 소비자 권장 가격에서 환산하여 산정함.*
- Flagship Mobile Phones: $850-$1,800/unit × ~3,000 units/ton ≈ 50,000 USD/ton.
- Bulky Appliances: $400/unit × 20 units/ton ≈ 8,000 USD/ton.
- Semiconductor Chips: $1,000-$50,000/wafer × thousands of wafers/ton ≈ 200,000 USD/ton.

**Reference 4 — Regulatory and Operational Heuristics / 법적 규정 및 현업 관행:** Overtime multipliers (1.5x) comply with the South Korean Labor Standards Act, while 3PL emergency margins are set at the industry-standard 2.0x heuristic.
*법적 규정 및 현업 관행: 연장근로 수당 비율(1.5배)은 한국 근로기준법 규정을 준수하였으며, 긴급 3PL 배차 할증은 업계 관행인 2.0배를 적용함.*

### 5.4 Mandatory Research Report Disclaimer / 의무적 공시 조항 (Disclaimer)

Any formal research outcome compiled for corporate presentation must include the following disclaimer:
*공식 연구 보고서 및 프리젠테이션 문서에는 반드시 다음의 공시 조항이 포함되어야 한다:*

> **"Disclaimer: The logistics cost coefficients utilized in this optimization model are derived from industry-average benchmarks. They do not represent the proprietary commercial freight rates or internal labor cost structures of any specific corporation. Standard variance is estimated at ±20-40% compared to individual corporate networks. Commercial deployment of this engine requires substituting these benchmarks with actual, verified company-specific contracts."**

---

## 6. EXPECTED COST RATIOS / 6대 비용 구성비 타당성 검증

Following computation, the distribution ratios of the 6 cost components must align with expected industry ranges. The team utilizes the following check matrix:
*비용 엔진 계산 완료 후, 6대 비용 요소의 구성 비율이 실제 물류 생태계의 비중과 일치하는지 교차 검증을 수행한다:*

| Cost Component / 비용 요소 | Expected Ratio (% of Total) / 타당 범위 | Warning Flag Criteria / 경고 조건 |
| --- | ---: | --- |
| Transportation / 운송 | 35-50% | < 25% or > 60% → Recalibrate freight rates / 요율 입력 오류 검토 |
| Warehouse Fixed / 고정 | 10-20% | < 5% or > 30% → Check open facility count / 허브 개설 수 확인 |
| Handling / 하역 and Processing | 8-15% | < 3% or > 25% → Verify handling rates / 하역 요율 검토 |
| Inventory Holding / 재고 보유 | 10-18% | < 5% or > 25% → Check product unit values / 톤당 가치 산정 검토 |
| Seasonal Flex / 성수기 유연 | 5-12% | > 20% → Underdesigned capacity, open more hubs / 용량 부족, 허브 추가 |
| SLA Penalty / SLA 패널티 | 3-10% | > 15% → Suboptimal network service radius / 커버리지 부족, 입지 재선정 |

**Case Study: Samsung Mobile Outcome Reference:**
*삼성 모바일 아웃컴 적용 예시:*

| Component / 비용 요소 | Monthly Cost (USD) / 월간 비용 | % of Total / 구성 비중 | Validation Status / 타당성 검증 |
| --- | ---: | ---: | :---: |
| Transportation / 운송 | 4,820,000 | 42.6% | ✅ Passed / 정상 범위 |
| Warehouse Fixed / 고정 | 1,950,000 | 17.2% | ✅ Passed / 정상 범위 |
| Handling / 하역 and Processing | 1,580,000 | 13.9% | ✅ Passed / 정상 범위 |
| Inventory Holding / 재고 보유 | 1,420,000 | 12.5% | ✅ Passed / 정상 범위 |
| Seasonal Flex / 성수기 유연 | 940,000 | 8.3% | ✅ Passed / 정상 범위 |
| SLA Penalty / SLA 패널티 | 615,000 | 5.4% | ✅ Passed / 정상 범위 |
| **Total / 합계** | **11,325,000** | **100%** | — |

---

## 7. CALIBRATION & VERIFICATION / 모델 정밀 보정 테스트

To guarantee robust outcomes, Group B executes 3 validation test suites:
*모델의 타당성과 오차 제어를 위해 그룹 B는 다음 3가지 검증 부문을 실행한다:*

**Test Suite 1 — Linearity Verification / 선형성 검증:** Evaluate cost scaling by varying unit values (`unit_value_table` at 0.5x, 1.0x, and 2.0x). The total inventory holding cost component must scale in a perfectly linear fashion. Non-linear scaling flags structural code bugs.
*선형성 검증: 톤당 가치 비율을 0.5배, 1.0배, 2.0배로 변화시키며 재고 보유 비용의 추이를 확인한다. 보유 비용이 가치 변동에 따라 정확히 일차 선형으로 비례해 증가해야 하며, 비선형 거동 시 코드 내 로직 버그로 판정함.*

**Test Suite 2 — Savings Margin Check / 최적화 효율 검증:** Ensure the optimized network configuration (Scenario S3) achieves at least 15% savings compared to the legacy network (S0) ($S_3 \le S_0 \times 0.85$). Failure to demonstrate this efficiency suggests flawed model parameters or constraint violations.
*최적화 효율 검증: 최적화 네트워크(S3) 총비용이 기존 네트워크(S0) 대비 15% 이상의 비용 절감 효과를 달성하는지 확인한다. 15% 미만인 경우 최적화 로직의 가중치 및 제약 조건 타당성을 재검토한다.*

**Test Suite 3 — Stress Sensitivity Evaluation / 스트레스 민감도 평가:** Simulate severe demand spikes (Scenario S6 with +20% demand volume). The total cost must react with a growth of at least 15% ($S_6 \ge S_3 \times 1.15$), reflecting overflow overtime and 3PL premium warehousing charges.
*스트레스 민감도 평가: 수요가 20% 폭증하는 극한 스트레스 시나리오(S6)를 실행하여 총비용이 기존(S3) 대비 15% 이상 반응하는지 검증한다. 성수기 초과 근무 및 3PL 프리미엄 요율 작동 여부를 가려낸다.*

---

## 8. SUMMARY / 요약

- **6 Cost Components / 6대 비용:** Logistics network evaluation requires aggregating transport, warehouse fixed, handling, inventory holding, seasonal flex, and SLA penalty costs.
  *물류 네트워크 평가는 운송 비용, 창고 고정 비용, 하역 처리 비용, 재고 보유 비용, 성수기 유연 비용, SLA 패널티 비용을 모두 합산하여 이루어진다.*
- **Industry Benchmarks / 산업 벤치마크:** Where actual contracts are unavailable, coefficients are derived from verified industry literature and regional transport statistics, representing the average logistics performance curve.
  *실제 물류 계약 단가가 없는 경우 학계 표준 문헌, 국가 공식 통계 자료 등에서 업계 평균 수준인 벤치마크 계수를 추출해 활용한다.*
- **Centralized Parameter Management / 중앙 집중식 관리:** Approximately 50 distinct parameters are centralized inside `engine/config.py` to ensure instant calibration.
  *전체 모델 정밀 교정을 위한 약 50여 개의 요율 계수들은 `engine/config.py` 설정 파일 한 곳에서 일원화되어 제어된다.*
- **Explicit Disclaimers / 공시 조항:** Any SCM executive report must prominently state that benchmark estimates reflect industry averages (with a standard ±20-40% variance) rather than actual proprietary corporate contracts.
  *경영진 공식 보고서에는 본 분석이 실제 계약서상의 수치가 아닌 산업 평균 벤치마크 값(±20-40% 오차 범위 내)에 기초했음을 반드시 사전에 공시해야 한다.*

---

*This document is the official reference for Module 6 (Cost Engine). Group B implements Module 6 in strict accordance with this file. Any configuration updates must be synchronized across both `engine/config.py` and this reference document.*
*본 문서는 모듈 6(비용 엔진)의 공식 설계 가이드라인이다. 그룹 B는 본 문서에 의거하여 비용 엔진을 구축하며, 파라미터 갱신 시 `engine/config.py`와 본 참조 문서를 동시 동기화해야 한다.*
