# PROXY ENGINE — DEFINITION AND COMPLETION PLAN
# 프록시 엔진 — 정의 및 완성 계획

*This document clarifies the concept of a "proxy engine" in LogiHub, specifically maps 10 engine components based on the "realness" of the data, and outlines the roadmap from midterm to production.*
*이 문서는 LogiHub의 "프록시 엔진" 개념을 명확히 하고, 데이터의 "실제성"에 따라 10개의 엔진 구성 요소를 구체적으로 매핑하며, 중간 평가부터 프로덕션까지의 로드맵을 설명합니다.*

---

## 1. WHAT IS A PROXY ENGINE?
## 1. 프록시 엔진이란 무엇인가?

### 1.1. One-sentence definition
### 1.1. 한 문장 정의

A **Proxy engine** is a version of the LogiHub Logistics Engine that runs on **public data acting as a proxy for real corporate data** — the result is that the engine can demonstrate the entire architecture and processing logic without requiring an NDA or access to internal data.
**프록시 엔진**은 **실제 기업 데이터의 프록시 역할을 하는 공개 데이터**에서 실행되는 LogiHub Logistics Engine의 한 버전입니다. 그 결과 엔진은 NDA를 체결하거나 내부 데이터에 접근하지 않고도 전체 아키텍처와 처리 논리를 입증할 수 있습니다.

### 1.2. Distinguishing the 3 engine versions
### 1.2. 3가지 엔진 버전 구분

To understand the proxy engine clearly, it must be placed in relation to the other two versions:
프록시 엔진을 명확히 이해하려면 나머지 두 버전과 비교해야 합니다.

| Version / 버전 | Input Data / 입력 데이터 | Output Quality / 출력 품질 | When to Use / 사용 시기 |
| --- | --- | --- | --- |
| **Mock engine** | Simulated data from a generator / 생성기에서 만든 시뮬레이션 데이터 | Technical demonstration / 기술 시연 | Internal development, unit testing / 내부 개발, 단위 테스트 |
| **Proxy engine (← MIDTERM)** | Public Korean Freight O/D + Warehouse Registry + heuristics / 공개 한국 화물 O/D + 창고 등록부 + 휴리스틱 | Demonstration grade — reasonable in scale and structure but not exact numbers of a specific company / 데모 등급 — 규모와 구조면에서 합리적이지만 특정 회사의 정확한 수치는 아님 | Midterm, pitch, academic research / 중간 평가, 피치, 학술 연구 |
| **Production engine** | Real internal shipment data + SKU master data + real cost contracts of a company / 특정 회사의 실제 내부 배송 데이터 + SKU 마스터 데이터 + 실제 비용 계약 | Production grade — exact to the unit, directly deployable / 프로덕션 등급 — 단위별로 정확하며 즉시 배포 가능 | Real customer pilot, commercial roll-out / 실제 고객 파일럿, 상용화 롤아웃 |

These three versions are not three different engines — **it is a single engine** running on 3 different types of input data. The architecture, code, and logic are identical; only the input CSV files change.
이 세 가지 버전은 서로 다른 세 가지 엔진이 아닙니다. 3가지 다른 유형의 입력 데이터에서 실행되는 **단일 엔진**입니다. 아키텍처, 코드, 논리는 동일하며 입력 CSV 파일만 변경됩니다.

### 1.3. Core principle of the proxy approach
### 1.3. 프록시 접근법의 핵심 원리

The 2022/2023 Korean Freight O/D records **all inter-regional freight transport in South Korea** across all industries — regardless of the company or product. It accurately reflects the geographical structure of national logistics demand — Seoul/Gyeonggi is the key area, Busan is the southern cluster, and Pyeongtaek is the high-tech zone.
2022/2023 한국 화물 O/D는 회사나 제품에 관계없이 모든 산업에 걸쳐 **한국 내 모든 지역 간 화물 운송**을 기록합니다. 이는 국가 물류 수요의 지리적 구조를 정확하게 반영합니다. 서울/경기는 핵심 지역이고, 부산은 남부 클러스터, 평택은 첨단 기술 단지입니다.

The proxy engine exploits this geographical structure. It **does not simulate the figures of any specific company** — it demonstrates that when a company feeds its real internal data into the engine, the engine will produce output with a structure and analytical quality similar to what the council is viewing.
프록시 엔진은 이 지리적 구조를 활용합니다. 특정 회사의 수치를 시뮬레이션하지 않고, 회사가 실제 내부 데이터를 엔진에 입력하면 엔진이 평가 위원회가 보는 것과 유사한 구조와 분석 품질의 결과를 생성한다는 것을 보여줍니다.

---

## 2. WHY CHOOSE A PROXY ENGINE FOR MIDTERM?
## 2. 왜 중간 평가에 프록시 엔진을 선택하는가?

There are 4 practical reasons leading to this decision.
이 결정에는 4가지 실질적인 이유가 있습니다.

**Reason 1 — Business Secrets.** Internal shipment data of any company is a strategic asset. Companies never publish it, no academic dataset contains it, and a student team within the midterm framework cannot sign an NDA with a large corporation to request data.
**이유 1 — 영업 비밀.** 어느 회사의 내부 배송 데이터이든 전략적 자산입니다. 회사는 절대 이를 공개하지 않으며, 이를 포함하는 학술 데이터세트도 없고, 중간 평가 프레임워크 내의 학생 팀은 대기업과 NDA를 체결하여 데이터를 요청할 수 없습니다.

**Reason 2 — Massive Scale of Real Data.** A large-scale logistics company processes millions of shipments/year × ~30 attributes/shipment = hundreds of GBs of raw data. Even if the data were available, the infrastructure needed to process it exceeds the capacity of a student's personal computer. Proxy data is 100-1000 times smaller but sufficient to demonstrate the architecture.
**이유 2 — 실제 데이터의 방대한 규모.** 대규모 물류 회사는 연간 수백만 건의 배송 × 배송당 약 30개의 속성 = 수백 GB의 원시 데이터를 처리합니다. 데이터를 사용할 수 있더라도 처리하는 데 필요한 인프라가 학생의 개인 컴퓨터 용량을 초과합니다. 프록시 데이터는 100-1000배 작지만 아키텍처를 보여주기에는 충분합니다.

**Reason 3 — Technical Validation First, Business Validation Later.** The midterm goal is to prove that the 10-module engine architecture works end-to-end and produces quality output. This is **technical validation**. Business validation (whether the numbers are accurate, whether the company agrees) belongs to the post-midterm pilot phase.
**이유 3 — 기술 검증 먼저, 비즈니스 검증 나중.** 중간 평가의 목표는 10개 모듈의 엔진 아키텍처가 엔드투엔드로 작동하고 양질의 출력을 생성한다는 것을 증명하는 것입니다. 이것은 **기술적 검증**입니다. 비즈니스 검증(숫자가 정확한지 여부, 회사가 동의하는지 여부)은 중간 평가 이후의 파일럿 단계에 속합니다.

**Reason 4 — Reusability for Future Pitches.** After the midterm, the team can use the proxy engine itself to pitch to potential companies: "This is the output we generated on public Korean data — if you give us your real shipment data, the output will be accurate for your company." This is how logistics intelligence startups often overcome the "chicken-and-egg problem" of data.
**이유 4 — 향후 피치를 위한 재사용성.** 중간 평가 이후, 팀은 프록시 엔진 자체를 사용하여 잠재적인 기업에 프레젠테이션할 수 있습니다. "이것은 한국 공개 데이터에서 생성한 결과입니다. 실제 배송 데이터를 주시면 결과가 귀하의 회사에 정확하게 맞춰질 것입니다." 이것이 물류 인텔리전스 스타트업이 종종 데이터의 "닭과 달걀 문제"를 극복하는 방법입니다.

---

## 3. MAPPING THE 10 ENGINE COMPONENTS — REAL / PROXY / HEURISTIC
## 3. 10개 엔진 구성 요소 매핑 — 리얼 / 프록시 / 휴리스틱

Not all 10 engine components are "proxies." Some parts run on completely real data, some are purely proxies, and some are heuristics that do not require data. The table below categorizes each part:
10개의 엔진 구성 요소가 모두 "프록시"인 것은 아닙니다. 일부는 완전히 실제 데이터에서 실행되고, 일부는 순수한 프록시이며, 일부는 데이터가 필요 없는 휴리스틱입니다. 아래 표는 각 부분을 분류합니다.

| Component / 부분 | Status / 상태 | Input Data / 입력 데이터 | Quality vs Production / 프로덕션 대비 품질 |
| --- | --- | --- | --- |
| **1. Data Reading / 데이터 읽기** | 🟢 **Real** | Korean Freight O/D 2023 + Warehouse Registry | Identical — reading CSV/Excel is reading CSV/Excel / 동일함 — CSV/Excel 읽기는 CSV/Excel 읽기 |
| **2. Standardization / 표준화** | 🟢 **Real** | 17-region mapping + tonnage unit / 17개 지역 매핑 + 톤 단위 | Identical — unchanged standards / 동일함 — 변하지 않는 기준 |
| **3. O/D Matrix / O/D 매트릭스** | 🟡 **Proxy** | Aggregated from Korean Freight O/D / 한국 화물 O/D 통합 | Similar structure to production, slight difference in total / 프로덕션과 유사한 구조, 총계에서 약간의 차이 |
| **4. Seasonal Demand / 계절적 수요** | 🟠 **Heuristic** | Seasonal index table from industry literature / 산업 문헌의 계절 지수 표 | Reasonable pattern but not real data / 합리적인 패턴이지만 실제 데이터 아님 |
| **5. Product Classification / 제품 분류** | 🟠 **Heuristic** | 7 rule-based rules by region / 지역별 7가지 규칙 기반 | Guessed based on factory clusters, not real SKUs / 실제 SKU가 아닌 공장 클러스터를 기준으로 추측 |
| **6. 6-Component Costs / 6가지 구성 요소 비용** | 🟠 **Heuristic** | Industry benchmark coefficients / 산업 벤치마크 계수 | Reasonable ratio between components, absolute number is benchmark / 구성 요소 간의 합리적인 비율, 절대 수치는 벤치마크 |
| **7. Warehouse Capacity / 창고 용량** | 🟡 **Proxy** | Public Warehouse Registry / 공개 창고 등록부 | Nominal capacity from registry, not real utilization / 실제 가동률이 아닌 등록부의 명목 용량 |
| **8. Current Network Diagnosis / 현재 네트워크 진단** | 🟠 **Heuristic** | Assume top 3 hubs as current / 상위 3개 허브를 현재로 가정 | Demonstration because there is no real current network data / 실제 현재 네트워크 데이터가 없으므로 데모 |
| **9. 9-Scenario Optimization / 9가지 시나리오 최적화** | 🟢 **Real** | Optimize on data from 3-7-8 above / 위의 3-7-8 데이터를 기반으로 최적화 | Mathematical logic identical to production / 프로덕션과 동일한 수학적 논리 |
| **10. Recommendations + Outcome / 권장 사항 + 결과** | 🟢 **Real** | Aggregated from 1-9 / 1-9 통합 | Template + logic similar to production / 프로덕션과 유사한 템플릿 및 논리 |

### 3.1. The "Real" Parts (3 parts — 30% of engine)
### 3.1. "리얼" 부분 (3개 부분 — 엔진의 30%)

Parts 1, 2, 9, 10 — these are the parts where **the logic and code do not change between proxy and production**. When a company uses it for real, the team only needs to swap the input file — the code in these parts runs exactly as before.
부분 1, 2, 9, 10 — 이 부분들은 **프록시와 프로덕션 간에 논리와 코드가 변하지 않는** 부분입니다. 회사가 실제로 사용할 때 팀은 입력 파일만 교체하면 되며, 이 부분의 코드는 예전과 똑같이 실행됩니다.

### 3.2. The "Proxy" Parts (2 parts — 20% of engine)
### 3.2. "프록시" 부분 (2개 부분 — 엔진의 20%)

Parts 3 and 7 — use public data as a proxy for internal data. The resulting structure is similar but **the absolute numbers are different** (because the data source is different). Upon moving to production, swapping the input file will produce accurate outputs for that company.
부분 3과 7 — 공개 데이터를 내부 데이터의 프록시로 사용합니다. 결과 구조는 유사하지만 (데이터 출처가 다르기 때문에) **절대 수치는 다릅니다**. 프로덕션으로 이동할 때 입력 파일을 교체하면 해당 회사에 정확한 결과가 생성됩니다.

### 3.3. The "Heuristic" Parts (4 parts — 40% of engine)
### 3.3. "휴리스틱" 부분 (4개 부분 — 엔진의 40%)

Parts 4, 5, 6, 8 — use rules/coefficients independent of the input data. This is the part **most affected** when transitioning to production:
부분 4, 5, 6, 8 — 입력 데이터와 독립적인 규칙/계수를 사용합니다. 이 부분은 프로덕션으로 전환할 때 **가장 많은 영향을 받는** 부분입니다.

- **Part 4 (seasonality / 계절성):** production requires 2-3 years of time-series shipment data to decompose real seasonal patterns, replacing the heuristic table. / 프로덕션은 휴리스틱 표를 대체하여 실제 계절적 패턴을 분해하기 위해 2-3년 간의 시계열 배송 데이터가 필요합니다.
- **Part 5 (product classification / 제품 분류):** production has SKU master data → knows exactly which product line each shipment belongs to, no need to guess using regional rules. / 프로덕션에는 SKU 마스터 데이터가 있습니다 → 각 배송이 어느 제품 라인에 속하는지 정확히 알 수 있어 지역 규칙으로 추측할 필요가 없습니다.
- **Part 6 (costs / 비용):** production has the company's real cost contracts with 3PLs/carriers → replacing industry benchmarks. / 프로덕션에는 3PL/운송업체와의 실제 회사 비용 계약이 있습니다 → 산업 벤치마크를 대체합니다.
- **Part 8 (current network diagnosis / 현재 네트워크 진단):** production has the company's current warehouse network data → replacing the "top 3 hubs" assumption. / 프로덕션에는 회사의 현재 창고 네트워크 데이터가 있습니다 → "상위 3개 허브" 가정을 대체합니다.

---

## 4. WHAT THE PROXY ENGINE CAN AND CANNOT DO
## 4. 프록시 엔진이 할 수 있는 일과 할 수 없는 일

### 4.1. Four things the proxy engine does well
### 4.1. 프록시 엔진이 잘하는 네 가지

**First, demonstrate the entire 10-part architecture.** The council can run the CLI, watch all 10 parts execute sequentially, and read the output of each part. This is a technical proof.
**첫째, 10개 부분의 아키텍처 전체를 시연합니다.** 평가 위원회는 CLI를 실행하여 10개 부분이 순차적으로 실행되는 것을 확인하고 각 부분의 출력을 읽을 수 있습니다. 이것은 기술적인 증명입니다.

**Second, generate a 16-item outcome with the structure and depth of a senior SCM manager's analysis.** The numbers are demonstration-grade (not real corporate data) but the logical structure, tables, interpretations, and recommendations are identical to production output.
**둘째, 선임 SCM 관리자의 분석 구조와 깊이를 가진 16개 항목의 결과를 생성합니다.** 수치는 데모 등급(실제 회사 데이터가 아님)이지만 논리적 구조, 표, 해석 및 권장 사항은 프로덕션 출력과 동일합니다.

**Third, validate the mathematical optimization model.** Part 9 runs P-median, UFLP, CFLP, MCLP, and Hybrid-CFLP correctly on proxy data. The solver returns the optimal solution. This proves the OR component of the engine works.
**셋째, 수학적 최적화 모델을 검증합니다.** 부분 9는 프록시 데이터에서 P-median, UFLP, CFLP, MCLP 및 Hybrid-CFLP를 올바르게 실행합니다. 솔버는 최적의 솔루션을 반환합니다. 이는 엔진의 OR 구성 요소가 작동함을 증명합니다.

**Fourth, serve as evidence for future pitches.** The team can take the proxy engine + sample outcome to pitch to Vietnamese companies: "This is what the engine will do for your company if fed real data."
**넷째, 향후 피치를 위한 증거로 사용됩니다.** 팀은 프록시 엔진과 샘플 결과를 가지고 베트남 회사에 프레젠테이션할 수 있습니다. "이것이 실제 데이터를 입력했을 때 엔진이 귀하의 회사를 위해 할 일입니다."

### 4.2. Four things the proxy engine cannot do
### 4.2. 프록시 엔진이 할 수 없는 네 가지

**First, cannot provide exact numbers for a specific company.** The proxy engine cannot answer cost-saving questions for a specific company. The sample outcome (file `outcome_sample_full.md`) is **assumed for illustration**, not the result of the engine running on real company data.
**첫째, 특정 회사에 대한 정확한 수치를 제공할 수 없습니다.** 프록시 엔진은 특정 회사의 비용 절감에 대한 질문에 대답할 수 없습니다. 샘플 결과(`outcome_sample_full.md` 파일)는 **설명을 위해 가정한 것**이며, 실제 회사 데이터에서 엔진을 실행한 결과가 아닙니다.

**Second, cannot validate the seasonal pattern of a specific company.** The seasonal index table in Part 4 is an industry heuristic — each company may have different seasonal patterns (e.g., peak window shifted by 1-2 months), which the proxy engine cannot detect.
**둘째, 특정 회사의 계절적 패턴을 검증할 수 없습니다.** 부분 4의 계절 지수 표는 산업 휴리스틱입니다. 각 회사는 다른 계절적 패턴(예: 최대 기간이 1-2개월 이동)을 가질 수 있으며 프록시 엔진은 이를 감지할 수 없습니다.

**Third, cannot optimize exact product classification.** The 7-rule classifier only guesses the product line based on regional characteristics. Production with SKU master data will be much more accurate.
**셋째, 정확한 제품 분류를 최적화할 수 없습니다.** 7가지 규칙 분류기는 지역적 특성을 기반으로 제품 라인을 추측할 뿐입니다. SKU 마스터 데이터가 있는 프로덕션이 훨씬 더 정확할 것입니다.

**Fourth, cannot reflect actual cost contracts.** The cost coefficients in the proxy engine are industry benchmarks. Real companies have negotiated contract rates with carriers — sometimes 30% cheaper than the benchmark, sometimes 20% more expensive.
**넷째, 실제 비용 계약을 반영할 수 없습니다.** 프록시 엔진의 비용 계수는 산업 벤치마크입니다. 실제 기업은 운송업체와 별도의 계약 요금을 협상했습니다. 때로는 벤치마크보다 30% 저렴하고 때로는 20% 더 비쌉니다.

### 4.3. Implications for presentation
### 4.3. 프레젠테이션에 미치는 영향

Every outcome generated by the proxy engine must have a **disclaimer** at the beginning, for example:
프록시 엔진에서 생성된 모든 결과는 시작 부분에 **면책 조항(고지 사항)**이 있어야 합니다. 예:

> *This analysis was generated by LogiHub Logistics Engine v2 running on the 2023 Korean Freight O/D (public) acting as a proxy for corporate shipment data. The analysis structure, recommendation architecture, and optimization logic are of production-grade quality. Absolute numbers are for demonstration — real usage requires internal data to provide accurate numbers.*
> *이 분석은 기업 배송 데이터의 프록시 역할을 하는 2023 한국 화물 O/D(공개)에서 실행되는 LogiHub Logistics Engine v2에 의해 생성되었습니다. 분석 구조, 권장 아키텍처 및 최적화 논리는 프로덕션 등급 품질입니다. 절대 수치는 시연용이며 실제 사용 시 정확한 수치를 제공하려면 내부 데이터가 필요합니다.*

This disclaimer must be present in the Word report, presentation slides (slide 2 or 3), and markdown outcome. This is intellectual transparency necessary to avoid misleading the council.
이 면책 조항은 Word 보고서, 프레젠테이션 슬라이드(슬라이드 2 또는 3) 및 마크다운 결과에 포함되어야 합니다. 이것은 평가 위원회의 오해를 피하기 위해 필요한 지적 투명성입니다.

---

## 5. PROXY ENGINE COMPLETION PLAN FOR MIDTERM
## 5. 중간 평가를 위한 프록시 엔진 완성 계획

### 5.1. Task list for completion by component
### 5.1. 구성 요소별 완성 작업 목록

This is integrated with the 18-day plan — each engine component has a specific checklist to be considered "proxy-complete":
이것은 18일 계획과 통합되어 있습니다. 각 엔진 구성 요소는 "프록시 완성"으로 간주될 구체적인 체크리스트를 가지고 있습니다.

**Part 1 — Data Reading / 데이터 읽기.** Status / 상태: 🟢 Real. Completion tasks / 완성 작업: read `od_clean_long_2023.csv`, `warehouse_geocoded.csv`, `warehouse_capacity_17_regions.csv` without errors. Output: 3 raw DataFrames in RunContext. Owner: Team A. Deadline: 12/5.
**Part 2 — Standardization / 표준화.** Status / 상태: 🟢 Real. Tasks: 17 accurate REGION_MASTER entries with centroid coordinates. Functions `clean_od()` and `clean_warehouse()` have no null rows. Owner: Team A. Deadline: 13/5.
**Part 3 — O/D Matrix / O/D 매트릭스.** Status / 상태: 🟡 Proxy. Tasks: full 17×17 matrix + `regional_demand.csv` + `top_od_lanes.csv`. Total margin of error < 1%. Owner: Team A. Deadline: 14/5.
**Part 4 — Seasonal Demand / 계절적 수요.** Status / 상태: 🟠 Heuristic. Tasks: 12-month × 6 product lines seasonal index table in `engine/config.py`. Each column average ≈ 1.0 (±2% error). `expand_to_monthly()` applied correctly. **Disclaimer:** seasonality figures are industry heuristics, not the seasonal pattern of any specific company. Owner: Team A. Deadline: 17/5.
**Part 5 — Product Classification / 제품 분류.** Status / 상태: 🟠 Heuristic. Tasks: `classifier_rules.json` with 7 rules. Every lane in O/D matrix matches at least 1 rule (no 100% fall through to default). Total ratios by product family are reasonable (mobile 18-25%, bulky 15-20%, secure 8-12%). **Disclaimer:** classifier is rule-based, lacks SKU master data. Owner: Team C. Deadline: 11-17/5 (two passes).
**Part 6 — 6-Component Costs / 6가지 구성 요소 비용.** Status / 상태: 🟠 Heuristic. Tasks: all 6 components have their own output tables, no NaNs. Ratios between the 6 components are reasonable (transport 35-50%, warehouse 10-20%, handling 8-15%, inventory 10-18%, flex 5-12%, sla 3-10%). **Disclaimer:** coefficients are industry benchmarks, not actual contracts. Owner: Team B. Deadline: 14/5 (first 3 components) + 17/5 (last 3 components).
**Part 7 — Warehouse Capacity / 창고 용량.** Status / 상태: 🟡 Proxy. Tasks: `base_capacity_by_hub.csv` table for every warehouse in the registry. Effective capacity calculated correctly according to the formula. Status mapped correctly to UTILIZATION_BANDS. **Disclaimer:** capacities are from public registries, not actual operational utilization. Owner: Team B. Deadline: 18/5.
**Part 8 — Current Network Diagnosis / 현재 네트워크 진단.** Status / 상태: 🟠 Heuristic. Tasks: `assume_current_network()` function selects the top 3 hubs. 5 diagnostic functions (allocation, high-cost lanes, overloaded, underused, poor coverage) all have output. Service risk text > 100 words generated from the template. **Disclaimer:** current network is assumed, not real data. Owner: Team C. Deadline: 13/5 skeleton, 16/5 detailed.
**Part 9 — 9-Scenario Optimization / 9가지 시나리오 최적화.** Status / 상태: 🟢 Real. Tasks: 9 scenarios run in parallel < 90s. S3 cost < S0 × 0.85. S6 cost > S3 × 1.15. recommended_scenario_id ∈ {S3, S5}. Owner: Team B. Deadline: 18/5.
**Part 10 — Recommendations + Outcome / 권장 사항 + 결과.** Status / 상태: 🟢 Real. Tasks: hub_role_assignment for 6 hubs. seasonal_playbook ≥ 4 events. roadmap 4 phases. business_case has cost_saving_pct ∈ [10%, 25%]. **★ outcome_sample_full.md** 12-15 pages fully covering 16 items, passes the 3-question test ≥ 2/3. Owner: Team C. Deadline: 16-21/5.

### 5.2. Total tasks to complete before midterm
### 5.2. 중간 평가 전까지 완료해야 할 총 작업

10 parts × total tasks ~50 sub-tasks. Time allocation:
10개 부분 × 총 작업 ~50개 하위 작업. 시간 배분:
- Week 1 (10-16/5): complete skeletons of 10 parts with mock data, each part can run its CLI independently → ~30% done. / 1주 차 (5/10-16): 모의 데이터로 10개 부분의 뼈대 완성, 각 부분 독립적으로 CLI 실행 가능 → ~30% 완료.
- Week 2 (17-23/5): integration + deep dive → 90% done. / 2주 차 (5/17-23): 통합 및 심층 작업 → 90% 완료.
- Week 3 (24-26/5): polish + report + slides → 100% done for midterm. / 3주 차 (5/24-26): 폴리싱 + 보고서 + 슬라이드 → 중간 평가를 위해 100% 완료.

May 27: team submits proxy engine v1.0.
5월 27일: 팀이 프록시 엔진 v1.0을 제출합니다.

### 5.3. Criteria for "proxy engine v1.0" completion
### 5.3. "프록시 엔진 v1.0" 완료 기준

- [ ] CLI `python -m engine.cli run` runs end-to-end in < 90s without crashing / CLI `python -m engine.cli run` 충돌 없이 엔드투엔드로 90초 이내에 실행
- [ ] All 9 scenarios yield output, S3 is the recommended scenario / 9개 시나리오 모두 결과 출력, S3이 권장 시나리오
- [ ] 12 intermediate tables in `output/tables/` with complete schemas / `output/tables/`의 12개 중간 테이블이 완벽한 스키마를 갖춤
- [ ] JSON output is validated by `engine_contract.schema.json` / `engine_contract.schema.json`에 의해 JSON 출력이 유효성 검증됨
- [ ] `outcome_sample_full.md` 12-15 pages, 16 items, all placeholders filled, passes the 3-question test ≥ 2/3 / `outcome_sample_full.md` 12-15페이지, 16개 항목, 모든 자리 표시자 채움, 3개 질문 테스트 ≥ 2/3 통과
- [ ] Disclaimer appears in 3 places: outcome markdown header, report abstract, slides 2-3 / 면책 조항이 결과 마크다운 헤더, 보고서 초록, 슬라이드 2-3의 세 곳에 표시됨
- [ ] AI-generated frontend renders the JSON output (verified in week 3) / AI 생성 프론트엔드가 JSON 출력을 렌더링함 (3주 차에 확인됨)
- [ ] Backup CLI demo screencast (60s) is ready / 백업 CLI 데모 화면 녹화(60초) 준비 완료

---

## 6. ROADMAP FROM PROXY ENGINE TO PRODUCTION ENGINE
## 6. 프록시 엔진에서 프로덕션 엔진으로의 로드맵

### 6.1. Four completion phases post-midterm
### 6.1. 중간 평가 이후의 4가지 완료 단계

**Phase 1 — Consolidating the proxy engine (June 2026, 4 weeks after midterm).**
**1단계 — 프록시 엔진 통합 (2026년 6월, 중간 평가 후 4주).**

After submitting the midterm, the team has a 4-week buffer before summer break or starting the next project. This is the opportunity to polish the proxy engine to "demo-grade" before pitching.
중간 평가 제출 후, 팀은 여름 방학이나 다음 프로젝트를 시작하기 전에 4주의 버퍼 타임이 있습니다. 이것은 프레젠테이션 전에 프록시 엔진을 "데모 등급"으로 다듬을 기회입니다.

Tasks: Add LLM-driven executive summary for Part 10 (instead of pure templates); add provenance tracking so clicking any number traces back to the source data; add automated sensitivity analysis (sliders to adjust coefficients and see cost changes); fix bugs discovered after the midterm.
할 일: 부분 10에 순수 템플릿 대신 LLM 기반 경영진 요약 추가; 위원회/고객이 숫자를 클릭하면 소스 데이터로 추적할 수 있도록 출처 추적 추가; 자동화된 민감도 분석 추가 (계수를 조정하고 비용 변화를 확인하기 위한 슬라이더); 중간 평가 후 발견된 버그 수정.

**Phase 2 — Pilot with a Vietnamese case (July-August 2026, 8 weeks).**
**2단계 — 베트남 케이스 파일럿 (2026년 7-8월, 8주).**

Find a mid-sized Vietnamese company (FMCG, 3PL, or retail) willing to provide 6 months of shipment data for a trial run. This is the **first time the engine touches real data** — transitioning from proxy to production for a specific case.
테스트 실행을 위해 6개월의 배송 데이터를 기꺼이 제공할 중간 규모의 베트남 회사(FMCG, 3PL 또는 소매)를 찾습니다. 이것은 **엔진이 실제 데이터에 처음 접근하는 시기**이며, 특정 케이스에 대해 프록시에서 프로덕션으로 전환하는 것입니다.

Tasks: Sign NDA with the company; build a pipeline to ingest their internal data (which may be different ERP exports than Korean Freight O/D); run the engine, compare the output with their current network; write a whitepaper case study.
할 일: 회사와 NDA 체결; 내부 데이터를 수집하는 파이프라인 구축(한국 화물 O/D와 다른 ERP 내보내기일 수 있음); 엔진을 실행하고 결과를 현재 네트워크와 비교; 백서 케이스 스터디 작성.

Most affected engine parts during production transition: Part 5 (classifier) is replaced by actual SKU mapping; Part 6 (costs) replaces benchmarks with the company's cost contracts; Part 8 (diagnosis) replaces assumptions with the real current network.
프로덕션 전환 시 가장 많이 영향을 받는 엔진 부분: 부분 5(분류기)는 실제 SKU 매핑으로 대체됩니다. 부분 6(비용)은 벤치마크를 회사의 비용 계약으로 대체합니다. 부분 8(진단)은 가정을 실제 현재 네트워크로 대체합니다.

**Phase 3 — Case expansion + product polish (September-December 2026, 16 weeks).**
**3단계 — 케이스 확장 + 제품 폴리싱 (2026년 9-12월, 16주).**

Expand from 1 case to 3-5 client cases. Each case can be in a different industry (FMCG, electronics, pharmaceuticals). Validate that the engine works cross-industry.
1개 케이스에서 3-5개 클라이언트 케이스로 확장합니다. 각 케이스는 다른 산업(FMCG, 전자제품, 제약)일 수 있습니다. 엔진이 교차 산업에서 작동하는지 검증합니다.

Tasks: Create industry-specific config templates (each industry has different cost coefficients, product lines, and seasonality); build a professional frontend (not AI-generated); copyright the engine logic; build a SaaS pricing model.
할 일: 산업별 구성 템플릿 생성(각 산업에는 각기 다른 비용 계수, 제품 라인, 계절성이 있음); (AI 생성이 아닌) 전문적인 프론트엔드 구축; 엔진 논리에 대한 저작권 등록; SaaS 가격 책정 모델 구축.

**Phase 4 — Commercialization (2027 onwards).**
**4단계 — 상용화 (2027년 이후).**

Transition from a research project to a commercial product. Pricing as SaaS or consulting + license. The team could spin off into a startup or license to an existing logistics company.
연구 프로젝트에서 상업용 제품으로 전환합니다. SaaS 또는 컨설팅 + 라이선스로 가격 책정. 팀은 스타트업으로 스핀오프하거나 기존 물류 회사에 라이선스를 부여할 수 있습니다.

### 6.2. Comparison table: Proxy engine vs. Production engine
### 6.2. 비교 표: 프록시 엔진 vs. 프로덕션 엔진

| Aspect / 측면 | Proxy engine (midterm) / 프록시 엔진 (중간) | Production engine (post-pilot) / 프로덕션 엔진 (파일럿 후) |
| --- | --- | --- |
| Data source / 데이터 출처 | Korean Freight O/D + Public Registry / 한국 화물 O/D + 공개 등록부 | Internal corporate shipment data / 내부 기업 배송 데이터 |
| Product classification / 제품 분류 | 7 heuristic rules / 7가지 휴리스틱 규칙 | SKU master data / SKU 마스터 데이터 |
| Cost coefficients / 비용 계수 | Industry benchmarks / 산업 벤치마크 | Real corporate cost contracts / 실제 기업 비용 계약 |
| Seasonality / 계절성 | Heuristic table / 휴리스틱 표 | Time-series decomposition on 2-3 years of data / 2-3년 데이터의 시계열 분해 |
| Current network / 현재 네트워크 | Assumed top 3 hubs / 상위 3개 허브 가정 | Real corporate network / 실제 기업 네트워크 |
| Output data / 출력 수치 | Demonstration grade / 데모 등급 | Production grade / 프로덕션 등급 |
| Frontend / 프론트엔드 | AI-generated / AI 생성 | Self-built professional / 자체 구축 전문가용 |
| Disclaimer / 면책 조항 | Mandatory / 필수 | Not needed / 필요 없음 |
| Purpose / 목적 | Technical validation + pitch / 기술 검증 + 피치 | Real customer deployment / 실제 고객 배포 |

### 6.3. Effort estimate by phase
### 6.3. 단계별 노력(Effort) 추정

| Phase / 단계 | Duration / 기간 | Effort (person-day) / 노력(인일) | Main Output / 주요 산출물 |
| --- | --- | ---: | --- |
| 1. Consolidate proxy / 프록시 통합 | 4 weeks / 4주 | 60 | Engine v1.5 + LLM summary + provenance |
| 2. Vietnam Pilot / 베트남 파일럿 | 8 weeks / 8주 | 120 | Whitepaper case study + Engine v2.0 |
| 3. Expand + polish / 확장 + 폴리싱 | 16 weeks / 16주 | 360 | 3-5 case studies + Pro frontend + Engine v3.0 |
| 4. Commercialize / 상용화 | open | open | SaaS product / SaaS 제품 |

**Total time from midterm to commercial launch: ~7-8 months** with a 3-person team working part-time.
**중간 평가에서 상용화 출시까지의 총 기간: 약 7-8개월**, 3인 파트타임 팀.

---

## 7. STRATEGY FOR PRESENTING THE PROXY ENGINE TO THE COUNCIL
## 7. 평가 위원회 대상 프록시 엔진 프레젠테이션 전략

### 7.1. Three-tier message to avoid misunderstanding
### 7.1. 오해를 피하기 위한 3단계 메시지

When presenting the midterm, the team must convey 3 parallel messages:
중간 평가를 발표할 때 팀은 3가지 병렬 메시지를 전달해야 합니다.

**Tier 1 — The engine has a complete architecture and runs successfully.** "This is a 10-part engine processing from raw data to a 16-item outcome, running 9 optimization scenarios in parallel in under 90 seconds, generating a markdown analysis of senior SCM manager quality."
**1단계 — 엔진은 완벽한 아키텍처를 가지고 있으며 성공적으로 실행됩니다.** "이것은 원시 데이터부터 16개 항목의 결과까지 처리하는 10개 부분의 엔진으로, 90초 이내에 9개의 최적화 시나리오를 병렬로 실행하며, 선임 SCM 관리자 품질의 마크다운 분석을 생성합니다."

**Tier 2 — The engine is currently running on proxy data, not internal corporate data.** "Because internal shipment data is a business secret, the team uses the public Korean Freight O/D as a proxy. The analysis structure and optimization logic are production-grade; the absolute numbers are for demonstration."
**2단계 — 엔진은 현재 기업 내부 데이터가 아닌 프록시 데이터로 실행되고 있습니다.** "기업 내부 배송 데이터는 영업 비밀이므로, 팀은 공개된 한국 화물 O/D를 프록시로 사용합니다. 분석 구조와 최적화 논리는 프로덕션 등급이며, 절대 수치는 시연용입니다."

**Tier 3 — The engine will provide exact numbers when fed real data.** "When a company uses it for real, they simply feed their internal shipment data — the engine architecture remains the same, the code is unchanged, only the CSV input file changes. The numbers will be exactly accurate for that company."
**3단계 — 실제 데이터를 입력하면 엔진이 정확한 수치를 제공할 것입니다.** "회사가 실제로 사용할 때 내부 배송 데이터만 입력하면 됩니다. 엔진 아키텍처는 동일하고 코드는 변경되지 않으며 입력 CSV 파일만 변경됩니다. 수치는 해당 회사에 정확하게 맞을 것입니다."

These three tiers do not contradict — they show the team understands the problem well and works intelligently within data constraints.
이 세 단계는 모순되지 않습니다. 팀이 문제를 잘 이해하고 데이터 제약 내에서 현명하게 작업하고 있음을 보여줍니다.

### 7.2. Suggested slides for midterm
### 7.2. 중간 평가를 위한 제안된 슬라이드

Within the existing 18-slide structure, slides 2-3 are dedicated entirely to the proxy approach:
기존의 18개 슬라이드 구조에서 슬라이드 2-3은 온전히 프록시 접근법에 할당됩니다.

| Slide / 슬라이드 | Content / 내용 |
| --- | --- |
| Slide 2 | "The Problem" — large corporations need engines to decide on warehouse networks / "문제" — 대기업은 창고 네트워크를 결정할 엔진이 필요함 |
| Slide 3 | **"Scope of Research — Proxy Engine"** — introducing the approach: using Korean Freight O/D as proxy, reasons, implications, disclaimers / **"연구 범위 — 프록시 엔진"** — 한국 화물 O/D를 프록시로 사용하는 접근법 소개, 이유, 의미, 면책 조항 |
| Slide 4 | "Product Goals" — 5-capability engine / "제품 목표" — 5가지 기능 엔진 |
| ... | ... |
| Slide 14 | **"Production Roadmap"** — 4 phases from proxy to real customer deployment / **"프로덕션 로드맵"** — 프록시에서 실제 고객 배포까지의 4단계 |

The two proxy slides are critical differentiators between a "team that knows what it's doing" and a "team that confuses proxy with production."
두 개의 프록시 슬라이드는 "자신이 무엇을 하는지 아는 팀"과 "프록시와 프로덕션을 혼동하는 팀" 사이의 중요한 차별 요소입니다.

### 7.3. Common Q&A about the proxy
### 7.3. 프록시에 관한 일반적인 Q&A

**Q: Are the cost-saving numbers in the outcome real?**
**Q: 결과의 비용 절감 수치는 실제입니까?**

A: No. They are assumed for illustration. The sample outcome is built based on aggregated Korean Freight O/D (not specific company data) to demonstrate what the engine will achieve when fed real data. Absolute numbers are demonstration-grade — real companies using it will get accurate numbers for their network.
A: 아닙니다. 설명을 위해 가정한 것입니다. 샘플 결과는 실제 데이터를 입력했을 때 엔진이 달성할 것을 입증하기 위해 (특정 회사 데이터가 아닌) 집계된 한국 화물 O/D를 기반으로 작성되었습니다. 절대 수치는 데모 등급입니다. 실제 사용하는 기업은 자신의 네트워크에 대한 정확한 수치를 얻을 것입니다.

**Q: Why not wait for real data before building the engine?**
**Q: 실제 데이터를 얻을 때까지 기다린 후 엔진을 구축하지 않는 이유는 무엇입니까?**

A: Because building the engine and requesting data are two independent problems. The team builds the engine first on proxy data → has a demo product → uses that demo to pitch and request data from potential companies → then upgrades to production. This is the standard strategy for logistics intelligence startups.
A: 엔진 구축과 데이터 요청은 별개의 두 가지 문제이기 때문입니다. 팀은 먼저 프록시 데이터에 엔진을 구축합니다 → 데모 제품 확보 → 해당 데모를 사용하여 잠재 기업에 프레젠테이션하고 데이터 요청 → 그 다음 프로덕션으로 업그레이드합니다. 이것이 물류 인텔리전스 스타트업의 표준 전략입니다.

**Q: Does the engine really differ from Excel?**
**Q: 엔진이 엑셀과 정말 다른가요?**

A: Excel can run 1 scenario at a time with manual formulas. The engine runs 9 scenarios in parallel with 5 mathematical optimization models, including product-aware models that cannot be represented in Excel. The engine also automatically generates a 16-item analysis — Excel cannot do this.
A: 엑셀은 수동 수식으로 한 번에 1개의 시나리오만 실행할 수 있습니다. 엔진은 엑셀에서 표현할 수 없는 제품 인지 모델을 포함하여 5개의 수학적 최적화 모델과 함께 병렬로 9개의 시나리오를 실행합니다. 엔진은 또한 자동으로 16개 항목의 분석을 생성합니다 — 엑셀은 이를 수행할 수 없습니다.

**Q: Why choose Korean Freight instead of Vietnam Freight?**
**Q: 왜 베트남 화물 대신 한국 화물을 선택했습니까?**

A: Because Vietnam does not have public Freight O/D of equivalent quality. South Korea has the Ministry of Transport publishing a standard dataset every 2 years. The team chose Korea to have good data; the engine logic is independent of the country — when expanding to Vietnam, only the region master and input data need to be replaced.
A: 베트남에는 동등한 품질의 공개 화물 O/D가 없기 때문입니다. 한국은 국토교통부가 2년마다 표준 데이터세트를 발표합니다. 팀은 좋은 데이터를 확보하기 위해 한국을 선택했습니다. 엔진 논리는 국가와 무관합니다. 베트남으로 확장할 때는 지역 마스터와 입력 데이터만 교체하면 됩니다.

**Q: Which parts of the engine are most affected when moving to production?**
**Q: 프로덕션으로 이동할 때 가장 큰 영향을 받는 엔진 부분은 어디입니까?**

A: Part 5 (product classifier), Part 6 (costs), and Part 8 (current diagnosis). These three parts are currently heuristics. In production, they are replaced by real SKU mapping, real cost contracts, and the real current network. The other 7 parts (1, 2, 3, 4, 7, 9, 10) transition to production with almost no code changes — only the input files are replaced.
A: 5부분(제품 분류기), 6부분(비용), 8부분(현재 진단)입니다. 이 세 부분은 현재 휴리스틱입니다. 프로덕션에서는 실제 SKU 매핑, 실제 비용 계약 및 실제 현재 네트워크로 대체됩니다. 나머지 7개 부분(1, 2, 3, 4, 7, 9, 10)은 코드 변경 없이 프로덕션으로 전환되며 입력 파일만 교체됩니다.

---

## 8. EXECUTIVE SUMMARY
## 8. 요약

The proxy engine is not a "low-quality" engine — it is a **fully architected engine** running on a different input dataset to demonstrate in an environment where corporate data is inaccessible. Of the 10 engine components, 3 run 100% like production, 2 use public data as proxies, and 4 use heuristics.
프록시 엔진은 "저품질" 엔진이 아닙니다. 기업 데이터에 접근할 수 없는 환경에서 시연하기 위해 다른 입력 데이터 세트에서 실행되는 **완벽하게 설계된 엔진**입니다. 10개의 엔진 구성 요소 중 3개는 프로덕션처럼 100% 실행되고, 2개는 공개 데이터를 프록시로 사용하며, 4개는 휴리스틱을 사용합니다.

The plan to complete the proxy engine for the May 27, 2026 midterm is integrated into the team's 18-day plan — each part has a specific deadline and owner. The criteria for "proxy engine v1.0 complete" consists of 8 items in section 5.3.
2026년 5월 27일 중간 평가를 위한 프록시 엔진 완성 계획은 팀의 18일 계획에 통합되어 있으며, 각 부분에는 특정 마감일과 담당자가 있습니다. "프록시 엔진 v1.0 완료" 기준은 5.3절의 8개 항목으로 구성됩니다.

Post-midterm, the roadmap from proxy to production consists of 4 phases over 7-8 months: consolidate proxy → pilot 1 Vietnam case → expand to 3-5 cases → commercialize. The engine parts most affected during production transition are Parts 5, 6, and 8 (the heuristic parts).
중간 평가 후, 프록시에서 프로덕션으로 향하는 로드맵은 7-8개월에 걸쳐 4단계로 구성됩니다: 프록시 통합 → 베트남 케이스 1개 파일럿 → 3-5개 케이스 확장 → 상용화. 프로덕션 전환 시 가장 큰 영향을 받는 엔진 부분은 5, 6, 8부분(휴리스틱 부분)입니다.

When presenting to the council, the team must convey a three-tier message: (1) the engine has a complete architecture and works, (2) it currently runs on proxy data with a clear disclaimer, and (3) it will provide exact numbers when fed real data. There are 2 dedicated slides (slide 3 and slide 14) for the proxy approach and production roadmap.
평가 위원회에 프레젠테이션할 때, 팀은 3단계 메시지를 전달해야 합니다: (1) 엔진이 완전한 아키텍처를 가지고 있으며 작동한다, (2) 현재 분명한 면책 조항과 함께 프록시 데이터로 실행되고 있다, (3) 실제 데이터를 입력하면 정확한 수치를 제공할 것이다. 프록시 접근 방식과 프로덕션 로드맵을 위한 두 개의 전용 슬라이드(슬라이드 3 및 슬라이드 14)가 있습니다.

---

*This document is one of the canonical documents of LogiHub. Along with `LogiHub_Engine_v2_Redesign.md` (architecture), `LogiHub_Midterm_Plan_3People_18days.md` (plan), `LogiHub_Onboarding_Tong_Quan.md` (introduction), and `outcome_sample_full.md` (industry-agnostic sample outcome), it forms a set of 5 files fully describing the LogiHub Intelligence project in the midterm phase.*
*이 문서는 LogiHub의 핵심 문서 중 하나입니다. `LogiHub_Engine_v2_Redesign.md`(아키텍처), `LogiHub_Midterm_Plan_3People_18days.md`(계획), `LogiHub_Onboarding_Tong_Quan.md`(소개) 및 `outcome_sample_full.md`(산업 불문 샘플 결과)와 함께 중간 단계의 LogiHub Intelligence 프로젝트를 완벽하게 설명하는 5개 파일 세트를 구성합니다.*
