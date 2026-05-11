# Table of Contents

# LOGIHUB ONBOARDING PACKAGE — GROUP A: DATA & DEMAND / 로지허브 온보딩 패키지 — 그룹 A: 데이터 및 수요

Welcome to the LogiHub logistics network optimization development team.
Your mission is to build a solid data foundation for the entire
project—from cleaning the source data (Korean Freight O/D) to modeling
dynamic demand over time and product families. *로지허브 물류 네트워크
최적화 개발 팀에 오신 것을 환영합니다. 귀하의 미션은 원천 데이터(한국
화물 O/D) 정제부터 시간 및 제품군에 따른 동적 수요 모델링에 이르기까지
전체 프로젝트를 위한 탄탄한 데이터 기반을 구축하는 것입니다.*

Below is a detailed and independent manual so you can get straight to
work without waiting for the other two members. *다음은 다른 두 멤버를
기다리지 않고 바로 작업에 착수할 수 있도록 돕는 세부적이고 독립적인
매뉴얼입니다.*

## 1. Role & Key Reference Documents / 역할 및 주요 참조 문서

-   **Mission:** Build the Data Pipeline, standardize administrative
    regions, construct the O/D (Origin/Destination) matrix, and model
    dynamic Seasonal Demand Profiles by month and product family.
    ***미션:** 데이터 파이프라인 구축, 행정 구역 표준화,
    O/D(출발지/도착지) 매트릭스 구축, 월별 및 제품군별 동적 시즌 수요
    프로필 모델링.*
-   **Must-Read Files:** ***필독 파일:***
    -   `LogiHub_Onboarding_Tong_Quan.md` (Project Overview / 프로젝트
        개요)
    -   `LogiHub_Midterm_Plan_3People_18days.md` (18-Day Plan / 18일
        계획)
    -   `LogiHub_WBS_Proxy_Engine_Midterm.md` (Detailed WBS / 세부 업무
        분장)

## 2. Detailed Work Breakdown Structure (WBS) / 세부 업무 분장 (WBS)

You are responsible for programming and completing **Parts 1, 2, 3, and
4** of the Engine. *귀하는 엔진의 **파트 1, 2, 3, 4**를 프로그래밍하고
완료할 책임이 있습니다.*

| Task ID / ID | Task Name / 과업명                                                                | Inputs / 입력                                                                                                                                           | Outputs / 출력                                                                                                              | Technical Guidelines & Notes / 기술 가이드 및 주의 사항                                                                                                                                                                                                               |
|--------------|-----------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **A1**       | Read raw datasets / 원천 데이터 세트 로드                                         | `od_clean_long_2023.csv`, `warehouse_geocoded.csv`, `warehouse_capacity_17_regions.csv`                                                                 | 3 raw DataFrames in `RunContext` / `RunContext` 내 3개 원천 DataFrame                                                       | Read directly from the processed files in the data folder. Handle missing columns or formatting errors with explicit Exceptions. / 데이터 폴더에서 이미 전처리된 파일을 직접 읽으십시오. 누락된 열이나 서식 오류는 명시적인 예외 처리(Exception)로 처리하십시오.      |
| **A2**       | Standardize regions + units / 지역 및 단위 표준화                                 | Raw DataFrames from A1 / A1의 원천 DataFrame                                                                                                            | `clean_od.csv`, `clean_warehouse.csv`, `region_master.py`                                                                   | Align strictly to the 17 administrative regions from the Ministry of Land, Infrastructure and Transport. Geocode missing lat/lon with centroid coords. / 국토교통부 기준 17개 고정 행정 구역에 엄격히 맞추십시오. 위경도 누락 시 대표 좌표로 지오코딩을 보완하십시오. |
| **A3**       | Build 17×17 O/D Matrix / 17×17 O/D 매트릭스 구축                                  | `clean_od.csv`                                                                                                                                          | `regional_demand.csv`, `od_matrix_17_region.csv`, `top_od_lanes.csv`                                                        | Total demand after aggregation must match original volume (error &lt; 1.0%). Ensure flow equilibrium: Total Inbound = Total Outbound. / 집계 후 총 수요는 원본 물량과 정확히 일치해야 합니다 (오차 &lt; 1.0%). 유량 균형 확보: 총 유입량 = 총 유출량.                 |
| **A4**       | Monthly & Product Family Demand / 월간 및 제품군별 수요 생성                      | `regional_demand.csv`, seasonal config in `engine/config.py`, Group C classifier / `regional_demand.csv`, `engine/config.py`의 시즌 설정, 그룹 C 분류기 | `monthly_demand_by_region.csv`, `monthly_demand_by_region_product.csv`, `seasonal_index.csv`                                | Seasonal indices are **HEURISTIC** — write disclaimer. Every column’s 12-month average must approximate 1.0 (error ±2.0%). / 시즌 지수는 **휴리스틱**이므로 면책 조항을 기재하십시오. 각 열의 12개월 평균값 ≈ 1.0 (오차 ±2.0%)이어야 합니다.                          |
| **A5**       | CLI `build-od` command / 독립형 CLI 명령 `build-od`                               | `data/` folder / `data/` 폴더                                                                                                                           | 6 output CSV tables + system logs / 6개 출력 CSV 테이블 + 시스템 로그                                                       | Must run 100% independently. Command: `python -m engine.cli build-od --input data/ --output output/`. / 100% 독립적으로 실행 가능해야 합니다. 실행 명령: `python -m engine.cli build-od --input data/ --output output/`.                                              |
| **A6**       | Unit test 4 modules / 4개 모듈 유닛 테스트                                        | Code A1–A4 / A1–A4 코드                                                                                                                                 | `tests/test_*.py` files / `tests/test_*.py` 파일                                                                            | Achieve code coverage ≥ 75%. Cross-validate total inbound = outbound, and average seasonal indices. / 코드 커버리지 75% 이상 달성. 총 유입량 = 유출량 및 평균 시즌 지수를 교차 검증하십시오.                                                                          |
| **A7**       | Thesis chapter: Ingestion & Normalization / 논문 보고서 작성: 데이터 및 처리 방법 | Tables + figures from A3, A4 / A3, A4의 테이블 및 그림 출력                                                                                             | 6-8 Word pages / 6-8페이지 Word 분량                                                                                        | Explain the Korean Freight O/D data source and O/D matrix formula. Include bar charts and heatmaps. / 한국 화물 O/D 데이터 소스 및 O/D 매트릭스 공식을 설명하십시오. 막대 그래프 및 열지도를 포함하십시오.                                                            |
| **A8**       | Provide Outcome data & Slides / 아웃컴 데이터 및 슬라이드 제공                    | Test results / 테스트 결과                                                                                                                              | Sections 1, 2, 10a of `outcome_sample_full.md` + 3-4 PPT slides / `outcome_sample_full.md` 1, 2, 10a장 + 3-4개 PPT 슬라이드 | Write in SCM Senior Manager tone. Add 1-2 analytical sentences per table. / SCM 시니어 매니저 톤으로 작성하십시오. 표당 1-2문장의 분석을 추가하십시오.                                                                                                                |

## 3. Independent Testing & Mocks (No Dependencies) / 독립 테스트 및 모의 데이터 (의존성 없음)

To work completely asynchronously without waiting for Group B or C:
*그룹 B나 C를 기다리지 않고 완전히 비동기식으로 작업하려면:*

1.  **Use Mock Data:** At the Kickoff meeting (May 10), agree on your
    exact output data schema. Create mock files and place them in the
    `mocks/` folder. ***모의 데이터 사용:** 킥오프 미팅(5월 10일)에서
    출력 데이터 스키마를 확정하십시오. 모의 파일을 생성하여* `mocks/`
    *폴더에 배치하십시오.*
2.  **Independent Goal:** Group B and C will read from this `mocks/`
    folder. You are free to develop your cleaning algorithms in A1-A4.
    Once your real code is merged into `main`, they simply switch from
    reading mocks to reading your real output. ***독립적 목표:** 그룹
    B와 C는 이* `mocks/` *폴더에서 데이터를 읽습니다. 귀하는 A1-A4에서
    자유롭게 정제 알고리즘을 개발할 수 있습니다. 실제 코드가* `main`*에
    병합되면, 다른 그룹은 모의 데이터 대신 귀하의 실제 출력을 읽도록
    전환하기만 하면 됩니다.*
3.  **Command to test your module:** ***모듈 테스트 명령:***
    `powershell     python -m engine.cli build-od --input data/ --output output/`

## 4. Report & Slide Contributions / 보고서 및 슬라이드 기여

You are the lead author for the following sections: *귀하는 다음 내용의
수석 저자입니다:* \* **Midterm Academic Report (\~30 pages):** Write the
**“Data and Processing Methodology”** section (6-8 pages). Explain data
cleaning, 17-region mapping, and seasonal profiling. ***중간고사 학술
보고서 (약 30페이지):** **“데이터 및 처리 방법론”** 섹션(6-8페이지)을
작성하십시오. 데이터 정제, 17개 지역 매핑 및 시즌 프로파일링을
설명하십시오.* \* **SCM Outcome Analysis (15 pages):** Fill real data
into Sections 1 (Product Lifecycle Segmentation), 2 (Geographic Demand
Analysis), and 10a (Seasonal Peak Operations). ***SCM 아웃컴 분석
(15페이지):** 실제 데이터를 1장(제품 수명주기 세분화), 2장(지역별 수요
분석), 10a장(시즌 피크 운영)에 기입하십시오.* \* **Slide Deck:**
Contribute **3-4 slides** covering the raw data flow, O/D matrix
heatmap, and seasonal demand segmentation. ***슬라이드 덱:** 원천 데이터
흐름, O/D 매트릭스 열지도 및 시즌별 수요 세분화를 다루는 **3-4개
슬라이드**를 기여하십시오.*

## 5. Weekly Milestone Checklists / 주차별 마일스톤 체크리스트

### 📌 End of Week 1 (May 16) — Independent Mocks & CLI / 1주 차 말 (5월 16일) — 독립 모의 데이터 및 CLI

-   [ ] Lock output schemas (JSON/CSV headers) with the team at Kickoff.
    / 킥오프 미팅에서 팀과 함께 출력 스키마(JSON/CSV 헤더) 확정.
-   [ ] Create `mocks/regional_demand.csv` and
    `mocks/od_matrix_17_region.csv` with sample data. / 샘플 데이터가
    포함된 `mocks/regional_demand.csv` 및
    `mocks/od_matrix_17_region.csv` 생성.
-   [ ] Complete raw reading (A1) and geographic normalization (A2). /
    원천 로드(A1) 및 지리적 표준화(A2) 완료.
-   [ ] Build standalone CLI `build-od` that successfully outputs 6 mock
    tables. / 6개 모의 테이블을 성공적으로 출력하는 독립형 CLI
    `build-od` 구축.

### 📌 End of Week 2 (May 23) — Core Algorithm & Unit Tests / 2주 차 말 (5월 23일) — 핵심 알고리즘 및 유닛 테스트

-   [ ] Complete the 17x17 O/D matrix aggregation algorithm (A3). /
    17x17 O/D 매트릭스 집계 알고리즘(A3) 완료.
-   [ ] Program the dynamic seasonal and product family demand generator
    (A4). / 동적 시즌 및 제품군 수요 생성기(A4) 프로그래밍 완료.
-   [ ] Write unit tests achieving &gt;75% coverage. / 75% 이상의
    커버리지를 달성하는 유닛 테스트 작성.
-   [ ] Integrate with real data and cross-validate Total Inbound =
    Outbound. / 실제 데이터와 통합하고 총 유입량 = 유출량을 교차 검증.

### 📌 End of Week 3 (May 26) — Thesis & Slides / 3주 차 말 (5월 26일) — 논문 및 슬라이드

-   [ ] Complete the 6-8 page Word report chapter. / 6-8페이지 분량의
    Word 보고서 챕터 작성 완료.
-   [ ] Finalize actual data in Outcome Sections 1, 2, 10a. / 아웃컴 1,
    2, 10a장의 실제 데이터 확정.
-   [ ] Design 3-4 PowerPoint slides. / 3-4개 PPT 슬라이드 디자인 완료.
-   [ ] Jointly review the final integrated system. / 최종 통합 시스템
    공동 검토.

## 6. Tone Standards & Mandatory Disclaimer / 톤 표준 및 필수 면책 조항

-   **Tone requirement:** Use precise international SCM terminology
    (e.g., *Long-haul transport*, *Cross-shipping*, *Seasonal
    Replenishment*, *Demand Smoothing*, *Lead time metrics*). ***톤 요구
    사항:** 정확한 국제 SCM 용어를 사용하십시오 (예: 장거리 운송, 교차
    배송, 시즌별 보충, 수요 평탄화, 리드 타임 지표).*

-   **Mandatory Disclaimer Rule:** Since we use national Korean Freight
    data as a proxy for unpublished internal shipment data, you MUST
    insert the exact disclaimer below at the beginning of your academic
    report: ***필수 면책 조항 규칙:** 미공개 내부 출고 데이터를 대변하기
    위해 국가 한국 화물 데이터를 프록시로 사용하므로, 학술 보고서 시작
    부분에 반드시 아래의 면책 조항을 삽입해야 합니다.*

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
