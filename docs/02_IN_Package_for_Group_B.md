# Table of Contents

# LOGIHUB ONBOARDING PACKAGE — GROUP B: COST & OPTIMIZATION / 로지허브 온보딩 패키지 — 그룹 B: 비용 및 최적화

Welcome to the LogiHub logistics network optimization development team.
Your mission is to build the core mathematical brain of the
project—calculating all logistics costs, integrating capacity
constraints, and executing 9 network design scenarios using Operations
Research (OR) models. *로지허브 물류 네트워크 최적화 개발 팀에 오신 것을
환영합니다. 귀하의 미션은 프로젝트의 핵심 수학적 두뇌를 구축하는
것입니다. 모든 물류 비용을 계산하고, 용량 제약을 통합하며, OR(운영 연구)
모델을 사용하여 9개의 네트워크 설계 시나리오를 실행합니다.*

Below is a detailed and independent manual so you can get straight to
work without waiting for the other two members. *다음은 다른 두 멤버를
기다리지 않고 바로 작업에 착수할 수 있도록 돕는 세부적이고 독립적인
매뉴얼입니다.*

## 1. Role & Key Reference Documents / 역할 및 주요 참조 문서

-   **Mission:** Construct the 6-component Cost Engine, model the
    5-state Capacity limits, and build the 9-Scenario Parallel Solver
    utilizing P-median, UFLP, and CFLP algorithms. ***미션:** 6대 비용
    엔진을 구성하고, 5단계 용량 한계를 모델링하며, P-median, UFLP 및
    CFLP 알고리즘을 활용하여 9개 시나리오 병렬 솔버를 구축합니다.*
-   **Must-Read Files:** ***필독 파일:***
    -   `LogiHub_Onboarding_Tong_Quan.md` (Project Overview / 프로젝트
        개요)
    -   `LogiHub_Midterm_Plan_3People_18days.md` (18-Day Plan / 18일
        계획)
    -   `LogiHub_WBS_Proxy_Engine_Midterm.md` (Detailed WBS / 세부 업무
        분장)

## 2. Detailed Work Breakdown Structure (WBS) / 세부 업무 분장 (WBS)

You are responsible for programming and completing **Parts 6, 7, and 9**
of the Engine. *귀하는 엔진의 **파트 6, 7, 9**를 프로그래밍하고 완료할
책임이 있습니다.*

| Task ID / ID | Task Name / 과업명                                                                         | Inputs / 입력                                                                      | Outputs / 출력                                                                                           | Technical Guidelines & Notes / 기술 가이드 및 주의 사항                                                                                                                                                                                                                     |
|--------------|--------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **B1**       | Distance matrix / 거리 매트릭스 계산                                                       | `clean_warehouse.csv` (lat/lon), `region_master.py`                                | `distance_matrix.csv` (region × hub)                                                                     | Use Haversine geodesic distance formula. Unit: km. / 하버사인 구면 삼각법 공식을 사용하십시오. 단위: km.                                                                                                                                                                    |
| **B2**       | Calculate first 3 cost elements / 초기 3대 비용 구성 요소 계산                             | `monthly_demand_by_region_product.csv`, `distance_matrix.csv`, config coefficients | `transport_cost_by_lane.csv`, `warehouse_fixed_cost_by_hub.csv`, `handling_cost_by_product_hub.csv`      | Calculate Transportation, Fixed rent, and Handling costs. Note: Coefficients are **INDUSTRY BENCHMARKS**. / 운송, 고정 임대, 하역 비용을 계산하십시오. 참고: 계수는 **업계 벤치마크**입니다.                                                                                |
| **B3**       | Calculate last 3 cost elements / 후기 3대 비용 구성 요소 계산                              | `monthly_demand`, `distance_matrix`, value and holding % tables                    | `inventory_holding_cost_by_month.csv`, `seasonal_flex_cost.csv`, `sla_penalty_by_lane.csv`               | Inventory: Avg Stock = 0.5 \* Monthly Demand. Flex uses Overtime for ≤ 20% overload, else 3PL. SLA applies penalty for excessive distance. / 재고: 평균 재고 = 0.5 \* 월간 수요. 탄력 비용: 초과 부하 20% 이하는 잔업, 초과 시 3PL 적용. SLA: 초과 거리에 대한 페널티 부과. |
| **B4**       | Refactor 5 optimization solvers / 5개 최적화 모델 리팩토링                                 | Legacy code in `models.py`                                                         | `engine/optimizer.py` with unified `solve_*` functions returning `SolverResult`                          | Unify signatures for P-median, UFLP, CFLP, MCLP, Hybrid-CFLP. Hybrid-CFLP must enforce `product_family` eligibility mapping. / P-median, UFLP, CFLP, MCLP, Hybrid-CFLP 서명을 통일하십시오. Hybrid-CFLP는 제품군 자격 매핑을 강제해야 합니다.                               |
| **B5**       | Warehouse capacity engine / 창고 공수 분석 엔진                                            | `warehouse_capacity_17_regions.csv`                                                | `effective_capacity_by_hub_month.csv`, `utilization_by_hub_month.csv`, `capacity_gap_by_peak_period.csv` | Effective Capacity = Base Capacity \* (1 + 20% Overtime + 30% 3PL). Determine 5 load states (Surplus to Crisis). / 실질 공수 = 기본 용량 \* (1 + 20% 잔업 + 30% 3PL). 5가지 부하 상태(여유\~위기)를 정의하십시오.                                                           |
| **B6**       | 9-Scenario Parallel Runner / 9대 시나리오 병렬 처리                                        | All inputs from B1–B5                                                              | `selected_hubs_by_scenario.csv`, `scenario_comparison.csv`                                               | Use `multiprocessing.Pool(4)`. Enforcement timeout: 20 seconds/scenario. **Total run &lt; 90 seconds**. / `multiprocessing.Pool(4)` 사용. 시나리오당 타임아웃 20초 제한. **전체 구동 90초 이내**.                                                                           |
| **B7**       | CLI `run-scenarios` / 독립형 CLI 명령 `run-scenarios`                                      | `mocks/demand.csv`, `mocks/warehouse.csv`                                          | 9 scenario JSON logs + comparison table                                                                  | Must run 100% independently: `python -m engine.cli run-scenarios --demand mocks/demand.csv --warehouse mocks/warehouse.csv --output output/`. / 100% 독립적으로 실행되어야 합니다: `python -m engine.cli run-scenarios ...`                                                 |
| **B8**       | Calibrate coefficients / 비용 계수 보정 및 교차 검증                                       | Scenario outputs from B6                                                           | Tuned parameters in `config.py`                                                                          | Calibrate cost ratio to be linear. Target shares: Transport 35-50%, Rent 10-20%, Handling 8-15%, Inventory 10-18%, Flex 5-12%, SLA 3-10%. / 비용 비율이 선형적이도록 보정하십시오. 목표 비중: 운송 35-50%, 임대 10-20%, 하역 8-15%, 재고 10-18%, 탄력 5-12%, SLA 3-10%.     |
| **B9**       | Thesis section: Framework & Outcomes + Slides / 논문 보고서: 프레임워크 및 결과 + 슬라이드 | Output B6, formulas, matrices                                                      | 10-12 Word pages + 4-5 PPT slides + outcome data sections 4-11                                           | Write “Theoretical Framework” citing Chopra-Meindl/Simchi-Levi. Present 9-scenario cost analysis. / Chopra-Meindl/Simchi-Levi를 인용한 “이론적 배경”을 작성하십시오. 9개 시나리오 비용 분석을 제시하십시오.                                                                 |
| **B10**      | Backup CLI demo video / 백업용 데모 동영상 제작                                            | Pre-computed scenarios                                                             | 60-second live terminal screencast                                                                       | Essential backup screencast in case the frontend fails during the presentation. Complete before May 25. / 발표 중 프론트엔드 오류에 대비한 필수 백업 화면 녹화본입니다. 5월 25일까지 완료하십시오.                                                                          |

## 3. Independent Testing & Mocks (No Dependencies) / 독립 테스트 및 모의 데이터 (의존성 없음)

To work asynchronously without waiting for Group A or C: *그룹 A나 C를
기다리지 않고 비동기식으로 작업하려면:*

1.  **Use Mock Data:** Agree on input schemas (demand, geocoded
    warehouses) at the Kickoff. Use Group A’s `mocks/` files. ***모의
    데이터 사용:** 킥오프에서 입력 스키마(수요, 지오코딩된 창고)에
    동의하십시오. 그룹 A의* `mocks/` *파일을 사용하십시오.*
2.  **Independent Goal:** Group C will read from your output mocks. Once
    your solver is stable, push to `main` so C can use your actual
    results. ***독립적 목표:** 그룹 C는 귀하의 출력 모의 데이터를
    읽습니다. 솔버가 안정화되면* `main`*으로 푸시하여 C가 실제 결과를
    사용할 수 있도록 하십시오.*
3.  **Command to test your module:** ***모듈 테스트 명령:***
    `powershell     python -m engine.cli run-scenarios --demand mocks/demand.csv --warehouse mocks/warehouse.csv --output output/`

## 4. Report & Slide Contributions / 보고서 및 슬라이드 기여

You are the lead author for the following sections: *귀하는 다음 내용의
수석 저자입니다:* \* **Midterm Academic Report (\~30 pages):** Write the
**“Theoretical Framework & Optimization Methodology”** section (10-12
pages). Include math formulas for P-Median, UFLP, and CFLP, and formally
cite Chopra-Meindl and Simchi-Levi. ***중간고사 학술 보고서 (약
30페이지):** **“이론적 배경 및 최적화 방법론”** 섹션(10-12페이지)을
작성하십시오. P-Median, UFLP, CFLP에 대한 수학적 공식을 포함하고
Chopra-Meindl 및 Simchi-Levi를 정식 인용하십시오.* \* **SCM Outcome
Analysis (15 pages):** Fill real data into Sections 4-11 (Network
Capabilities, Scenario Comparisons, SLA metrics). ***SCM 아웃컴 분석
(15페이지):** 실제 데이터를 4-11장(네트워크 기능, 시나리오 비교, SLA
지표)에 기입하십시오.* \* **Slide Deck:** Contribute **4-5 slides**
detailing the optimization models and scenario cost-breakdown
comparisons. ***슬라이드 덱:** 최적화 모델 및 시나리오별 비용 분석
비교를 자세히 설명하는 **4-5개 슬라이드**를 기여하십시오.*

## 5. Weekly Milestone Checklists / 주차별 마일스톤 체크리스트

### 📌 End of Week 1 (May 16) — Independent Mocks & CLI / 1주 차 말 (5월 16일) — 독립 모의 데이터 및 CLI

-   [ ] Initialize Git repository with branch protection rules and
    invite teammates. / 브랜치 보호 규칙이 있는 Git 레포지토리를
    초기화하고 팀원을 초대하십시오.
-   [ ] Develop Distance matrix (B1) and base cost modules (B2). / 거리
    매트릭스(B1) 및 기본 비용 모듈(B2)을 개발하십시오.
-   [ ] Refactor the 5 LP models in `optimizer.py` (B4). /
    `optimizer.py`에서 5개 LP 모델을 리팩토링하십시오(B4).
-   [ ] Build standalone CLI `run-scenarios` resolving S0, S2, and S3
    using mock data. / 모의 데이터를 사용하여 S0, S2, S3를 연산하는
    독립형 CLI `run-scenarios`를 구축하십시오.

### 📌 End of Week 2 (May 23) — Core Algorithm & Calibration / 2주 차 말 (5월 23일) — 핵심 알고리즘 및 보정

-   [ ] Implement Capacity utilization module (B5) and remaining 3 cost
    modules (B3). / 용량 가동률 모듈(B5) 및 나머지 3개 비용 모듈(B3)을
    구현하십시오.
-   [ ] Complete the 9-scenario parallel runner ensuring execution under
    90 seconds (B6). / 실행 시간이 90초 이내임을 보장하는 9대 시나리오
    병렬 실행기(B6)를 완료하십시오.
-   [ ] Freeze and calibrate all cost coefficients in `config.py` (B8).
    / `config.py`의 모든 비용 계수를 잠그고 튜닝하십시오(B8).

### 📌 End of Week 3 (May 26) — Thesis & Slides / 3주 차 말 (5월 26일) — 논문 및 슬라이드

-   [ ] Complete the 10-12 page Word report chapter (Optimization
    Framework). / 10-12페이지 분량의 Word 보고서 챕터(최적화
    프레임워크)를 완료하십시오.
-   [ ] Finalize actual data in Outcome Sections 4-11. / 아웃컴 4-11장의
    실제 데이터를 확정하십시오.
-   [ ] Record the 60-second backup terminal screencast. / 60초 백업
    터미널 시연 동영상을 녹화하십시오.
-   [ ] Jointly review the final integrated system. / 최종 통합 시스템을
    공동 검토하십시오.

## 6. Tone Standards & Mandatory Disclaimer / 톤 표준 및 필수 면책 조항

-   **Tone requirement:** Use formal OR (Operations Research) and Supply
    Chain terminology (e.g., *Capacitated Facility Location Problem*,
    *Service Level Penalty*, *Capacity Utilization Rate*). ***톤 요구
    사항:** 공식적인 OR(운영 연구) 및 공급망 용어를 사용하십시오 (예:
    용량 제약 설비 입지 문제, 서비스 수준 페널티, 공수 가동률).*

-   **Mandatory Disclaimer Rule:** Since cost coefficients are derived
    from industry benchmarks, you MUST explicitly state that absolute
    values are for simulation purposes. Insert the exact proxy
    disclaimer at the beginning of your academic report: ***필수 면책
    조항 규칙:** 비용 계수는 업계 벤치마크에서 파생되므로 절대값은
    시뮬레이션 목적임을 명시해야 합니다. 학술 보고서 시작 부분에 반드시
    프록시 면책 조항을 삽입하십시오:*

<!-- -->

-   **\[!IMPORTANT\]** *“This analysis is automatically generated by
    > LogiHub Engine v1.0 running on the public Korean Freight O/D 2023
    > dataset as a proxy for corporate shipment data. The analytical
    > framework, recommended architecture, and optimization logic are of
    > production-grade quality. All absolute figures are for
    > demonstration purposes only.”* *“본 분석은 기업 출고 데이터를
    > 대변하기 위해 공개된 한국 화물 O/D 2023 데이터셋을 기반으로
    > LogiHub 엔진 v1.0에서 자동 생성되었습니다. 분석 프레임워크, 권장
    > 아키텍처 및 최적화 로직은 프로덕션 수준의 품질을 제공합니다. 모든
    > 절대 수치는 데모용으로만 사용됩니다.”*
