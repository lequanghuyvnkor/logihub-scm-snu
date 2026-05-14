# Table of Contents

# LOGIHUB ONBOARDING PACKAGE — GROUP C: DIAGNOSIS & OUTCOME / 로지허브 온보딩 패키지 — 그룹 C: 진단 및 아웃컴

Welcome to the LogiHub logistics network optimization development team.
You are the Chief Coordinator of the project. Your mission is to build
the analytical modules (Rule-based classifier, Diagnostics), dynamically
render the final 16-section SCM Outcome Markdown report, and seamlessly
integrate the final Word thesis and PowerPoint slides. *로지허브 물류
네트워크 최적화 개발 팀에 오신 것을 환영합니다. 귀하는 프로젝트의 수석
코디네이터입니다. 귀하의 미션은 분석 모듈(규칙 기반 분류기, 진단)을
구축하고, 최종 16개 장의 SCM 아웃컴 마크다운 보고서를 동적으로
렌더링하며, 최종 Word 논문과 PPT 슬라이드를 매끄럽게 통합하는 것입니다.*

Below is a detailed and independent manual so you can get straight to
work without waiting for the other two members. *다음은 다른 두 멤버를
기다리지 않고 바로 작업에 착수할 수 있도록 돕는 세부적이고 독립적인
매뉴얼입니다.*

## 1. Role & Key Reference Documents / 역할 및 주요 참조 문서

-   **Mission:** Program the Product Classifier (Part 5), Legacy Network
    Diagnostics (Part 8), and the automated Template Engine (Part 10).
    Consolidate all final project deliverables. ***미션:** 제품
    분류기(파트 5), 기존 망 진단(파트 8) 및 자동화된 템플릿 엔진(파트
    10)을 프로그래밍합니다. 모든 최종 프로젝트 산출물을 취합합니다.*
-   **Must-Read Files:** ***필독 파일:***
    -   `LogiHub_Onboarding_Tong_Quan.md` (Project Overview / 프로젝트
        개요)
    -   `LogiHub_Midterm_Plan_3People_18days.md` (18-Day Plan / 18일
        계획)
    -   `LogiHub_WBS_Proxy_Engine_Midterm.md` (Detailed WBS / 세부 업무
        분장)

## 2. Detailed Work Breakdown Structure (WBS) / 세부 업무 분장 (WBS)

You are responsible for programming **Parts 5, 8, and 10** of the
Engine, plus leading the final document synthesis. *귀하는 엔진의 **파트
5, 8, 10**을 프로그래밍하고 최종 문서 취합을 주도할 책임이 있습니다.*

| Task ID / ID | Task Name / 과업명                                           | Inputs / 입력                              | Outputs / 출력                                            | Technical Guidelines & Notes / 기술 가이드 및 주의 사항                                                                                                                                                                            |
|--------------|--------------------------------------------------------------|--------------------------------------------|-----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **C1**       | Rule-based classifier / 7대 규칙 기반 분류기 개발            | `od_matrix_17_region.csv`                  | `classifier_rules.json`, `od_by_product.csv`              | **HEURISTIC** logic. Every lane must map to ≥ 1 rule. Target: mobile 18-25%, bulky 15-20%, secure 8-12%. / **휴리스틱** 로직. 모든 경로는 하나 이상의 규칙과 매치되어야 합니다. 목표: 모바일 18-25%, 대형 가전 15-20%, 보안 8-12%. |
| **C2**       | Diagnose current network / 기존 네트워크 자가 진단           | `monthly_demand`, `transport_cost_by_lane` | `current_network_health.csv`, `high_cost_lanes.csv`       | Assume top 3 hubs represent baseline. Top 10 high-cost lanes must include ≥ 1 route to Jeju. / 상위 3개 허브를 기존 Baseline으로 가정합니다. 상위 10개 고비용 경로 중 제주 노선을 1개 이상 포함하십시오.                           |
| **C3**       | S3 Hub Role Assignment / S3 허브 역할 지정                   | S3 scenario results                        | `hub_role_assignment.csv`                                 | Assign 6 roles (Metro, Secure, Launch, Bulky, Southern, Central) based on dominant products. / 우세 제품군을 기반으로 6대 역할(수도권, 보안, 런칭, 대형, 남부, 중부)을 지정하십시오.                                               |
| **C4**       | Seasonal playbook / 시즌별 플레이북 생성                     | `monthly_demand`, scenario gaps            | `seasonal_playbook.json`                                  | Create action plans for peak windows derived from `product_family` demand patterns (e.g. `mobile_launch_peak_window`, `bulky_appliance_peak_window`, `high_value_secure_peak_window`, `general_cargo_peak_window`). Event names must follow data-driven pattern `M<NN>_<product_family>_peak_window` — no brand or industry-specific labels. / `product_family` 수요 패턴에서 도출된 피크 윈도우에 대한 실행 계획을 수립하십시오. 이벤트 이름은 데이터 기반 패턴 `M<NN>_<product_family>_peak_window`을 따라야 하며, 브랜드 또는 특정 산업 레이블을 사용하지 마십시오.                                    |
| **C5**       | Roadmap & Business Case / 로드맵 및 ROI 비즈니스 케이스 수립 | Delta S0 vs. S3                            | `implementation_roadmap.json`, `business_case_summary.md` | Calculate ROI. Target cost saving ∈ \[10%, 25%\]. Provide 2-3 sentence executive summary. / ROI를 계산하십시오. 목표 비용 절감률은 \[10%, 25%\] 내에 있어야 합니다. 2-3문장의 경영진 요약을 제공하십시오.                          |
| **C6**       | Design outcome template / 16개 장 Outcome 템플릿 설계        | Outcome layout spec                        | `outcome_template.md` with placeholders                   | Lock markdown template with `{{...}}` placeholders in Week 1. Add comments. / 1주 차에 `{{...}}` 플레이스홀더를 포함한 마크다운 템플릿을 잠그고 주석을 추가하십시오.                                                               |
| **C7**       | Outcome Engine & Polish / 아웃컴 v1 생성 및 v2 정제          | Outputs from A & B, C6 template            | `outcome_sample_full.md` (\~15 pages)                     | ★ **CENTERPIECE**. Render all 16 sections dynamically. Write analytical sentences for every table. / ★ **핵심 산출물**. 16개 장을 동적으로 렌더링하고 각 표에 대한 분석 문장을 작성하십시오.                                       |
| **C8**       | External 3-Question Test / 외부인 이해도 검증                | Outcome v1 draft                           | Feedback notes + Outcome v2                               | Validate if an external reader can answer 3 core questions in 5 mins. Pass rate ≥ 2/3. / 외부 독자가 5분 내에 3가지 핵심 질문에 답할 수 있는지 검증하십시오. 통과 기준 2/3 이상.                                                   |
| **C9**       | CLI `render-outcome` / 독립형 CLI 명령 `render-outcome`      | `mocks/scenarios.json`                     | `outcome_sample_full.md` via mocks                        | Must run 100% independently: `python -m engine.cli render-outcome --scenarios mocks/...` / 100% 독립적으로 실행되어야 합니다: `python -m engine.cli render-outcome ...`                                                            |
| **C10**      | Narrative chapters & Slides / Outcome머지 장 및 슬라이드     | C5 roadmap                                 | Outcome sections 0, 3, 8, 10b, 12-16 + 6-7 slides         | Write executive strategic narrative. Slides cover problem hook, architecture, and roadmap. / 경영 전략 서술을 작성하십시오. 슬라이드는 문제 제기, 아키텍처 및 로드맵을 다룹니다.                                                   |
| **C11**      | Unified Thesis Report / 종합 Word 논문 통합                  | Reports from A7, B9                        | `LogiHub_Midterm_Report.docx` (\~30 pages)                | Format: A4, Times New Roman 12, APA 7. Must include abstract, TOC, and proxy disclaimer. / 서식: A4, Times New Roman 12, APA 7. 초록, 목차 및 프록시 면책 조항을 반드시 포함해야 합니다.                                           |
| **C12**      | Unified Slide Deck & Q&A / 통합 발표 슬라이드 및 Q&A         | Slide files from A & B                     | `LogiHub_Midterm_Slide.pptx` + `q_and_a.md`               | 15-18 master slides. Presentation timing: 12-15 mins. Prepare a 10-question Q&A doc. / 15-18장 슬라이드. 발표 시간 12-15분. 10개 예상 질문의 Q&A 문서를 준비하십시오.                                                              |

## 3. Independent Testing & Mocks (No Dependencies) / 독립 테스트 및 모의 데이터 (의존성 없음)

To work asynchronously without waiting for Group A or B to finish their
algorithms: *그룹 A나 B의 알고리즘 완료를 기다리지 않고 비동기식으로
작업하려면:*

1.  **Use Mock Data:** Agree on all output JSON/CSV schemas during the
    Kickoff. Generate `mocks/scenarios.json` to simulate Group B’s
    optimization output. ***모의 데이터 사용:** 킥오프 시 모든 출력
    JSON/CSV 스키마에 동의하십시오. 그룹 B의 최적화 출력을 모방하는*
    `mocks/scenarios.json`*을 생성하십시오.*
2.  **Independent Goal:** Use these mock scenarios to build your
    `render-outcome` template engine. When Group B pushes their final
    JSONs to `main`, your CLI will seamlessly generate the final
    document. ***독립적 목표:** 이러한 모의 시나리오를 사용하여*
    `render-outcome` *템플릿 엔진을 구축하십시오. 그룹 B가 최종 JSON을*
    `main`*에 푸시하면 CLI가 매끄럽게 최종 문서를 생성합니다.*
3.  **Command to test your module:** ***모듈 테스트 명령:***
    `powershell     python -m engine.cli render-outcome --scenarios mocks/scenarios.json --output output/`

## 4. Report & Slide Contributions / 보고서 및 슬라이드 기여

As the compiler, you are responsible for the overall narrative flow:
*문서 총괄자로서 귀하는 전반적인 내러티브 흐름을 담당합니다:* \*
**Midterm Academic Report (\~30 pages):** Synthesize the work of A and
B. Write the Abstract, Introduction, Project Diagnostics, and Conclusion
chapters. Ensure APA 7 consistency across the document. ***중간고사 학술
보고서 (약 30페이지):** A와 B의 작업을 종합합니다. 초록, 서론, 프로젝트
진단 및 결론 챕터를 작성하십시오. 문서 전체에 걸쳐 APA 7 일관성을
보장하십시오.* \* **SCM Outcome Analysis (15 pages):** Write the
executive summaries (Sections 0, 3, 8) and forward-looking sections
(12-16). Guarantee the “Senior SCM Manager” tone across the entire file.
***SCM 아웃컴 분석 (15페이지):** 경영진 요약(0, 3, 8장)과 미래 전망
장(12-16장)을 작성하십시오. 전체 파일에 걸쳐 “SCM 시니어 매니저” 톤을
보장하십시오.* \* **Slide Deck:** Compile the final deck. Contribute
**6-7 slides** covering the presentation hook, diagnostic overview, and
implementation roadmap. ***슬라이드 덱:** 최종 슬라이드를 통합합니다.
발표 훅, 진단 개요 및 구현 로드맵을 다루는 **6-7개 슬라이드**를
기여하십시오.*

## 5. Weekly Milestone Checklists / 주차별 마일스톤 체크리스트

### 📌 End of Week 1 (May 16) — Independent Mocks & CLI / 1주 차 말 (5월 16일) — 독립 모의 데이터 및 CLI

-   [ ] Set up the team’s `#logihub-midterm` communication channel and
    pin canonical files. / 팀의 `#logihub-midterm` 소통 채널을 개설하고
    핵심 문서를 고정하십시오.
-   [ ] Develop Product Classifier (C1) and design the
    `outcome_template.md` (C6). / 제품 분류기(C1)를 개발하고
    `outcome_template.md` 템플릿(C6)을 설계하십시오.
-   [ ] Build standalone CLI `render-outcome` that successfully outputs
    a markdown file using mock scenarios. / 모의 시나리오를 사용하여
    마크다운 파일을 성공적으로 출력하는 독립형 CLI `render-outcome`을
    구축하십시오.

### 📌 End of Week 2 (May 23) — Core Algorithm & External Testing / 2주 차 말 (5월 23일) — 핵심 알고리즘 및 외부 테스트

-   [ ] Complete Legacy diagnostics (C2), Hub Role assignment (C3), and
    ROI calculations (C5). / 기존 망 진단(C2), 허브 역할 배정(C3) 및 ROI
    계산(C5)을 완료하십시오.
-   [ ] Generate `outcome_sample_full.md` v1 using integrated real data
    (C7). / 통합된 실제 데이터를 사용하여 `outcome_sample_full.md` v1을
    생성하십시오 (C7).
-   [ ] Conduct the 3-question understanding test with an external
    reader and integrate feedback into v2 (C8). / 외부 독자와 함께 3대
    질문 이해도 테스트를 수행하고 피드백을 v2에 반영하십시오(C8).

### 📌 End of Week 3 (May 26) — Thesis & Slides Integration / 3주 차 말 (5월 26일) — 논문 및 슬라이드 통합

-   [ ] Polish all narrative chapters in the Outcome markdown report. /
    아웃컴 마크다운 보고서의 모든 서술형 장을 매끄럽게 정제하십시오.
-   [ ] Compile and format the unified `LogiHub_Midterm_Report.docx`
    (\~30 pages). / 통합된 `LogiHub_Midterm_Report.docx` (약 30페이지)를
    편찬하고 서식을 맞추십시오.
-   [ ] Integrate the final PowerPoint `LogiHub_Midterm_Slide.pptx` and
    draft the Q&A document. / 최종 PPT `LogiHub_Midterm_Slide.pptx`를
    통합하고 예상 Q&A 문서를 작성하십시오.

## 6. Tone Standards & Mandatory Disclaimer / 톤 표준 및 필수 면책 조항

-   **Tone requirement:** You must adopt a “Senior SCM Manager”
    persona—focus on executive ROI, risk mitigation, and strategic
    capabilities rather than purely technical code execution details.
    ***톤 요구 사항:** “SCM 시니어 매니저” 페르소나를 채택해야 합니다.
    단순한 기술 코드 세부 정보보다는 경영진을 위한 ROI, 리스크 완화 및
    전략적 역량에 초점을 맞추십시오.*

-   **Mandatory Disclaimer Rule:** You are the gatekeeper for
    compliance. You MUST verify that the following proxy disclaimer
    appears exactly as written in 3 key places: (1) Outcome report
    header, (2) Thesis Abstract, (3) Presentation Slide 3. ***필수 면책
    조항 규칙:** 귀하는 규정 준수의 문지기입니다. (1) 아웃컴 보고서
    헤더, (2) 논문 초록, (3) 발표 슬라이드 3장에 다음 프록시 면책 조항이
    정확히 명시되어 있는지 **반드시** 교차 검증해야 합니다.*

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
