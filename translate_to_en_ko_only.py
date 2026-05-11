import os
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

SRC = r"c:\Users\PC\Downloads\LogiHub_Project_Archive\LogiHub_Research_Report_Full.md"
OUT_MD = r"c:\Users\PC\Downloads\LogiHub_Project_Archive\LogiHub_Report_EN_KO_Only.md"
OUT_DOCX = r"c:\Users\PC\Downloads\LogiHub_Project_Archive\LogiHub_Report_EN_KO_Only.docx"

with open(SRC, encoding='utf-8') as f:
    text = f.read()

# Dictionary mapping for full replacements of specific Vietnamese paragraphs/lines
REPLACEMENTS = {
    # Main Title and Subtitle
    "# LOGIHUB INTELLIGENCE — BÁO CÁO NGHIÊN CỨU\n\n## Tối ưu hoá mạng lưới kho phân phối tại Hàn Quốc dựa trên dữ liệu Freight Origin-Destination\n\n*Báo cáo nghiên cứu giữa kỳ — Đội phát triển LogiHub Intelligence — Tháng 5/2026*":
    "# LOGIHUB INTELLIGENCE — RESEARCH REPORT\n\n## Logistics Hub Network Optimization in South Korea Based on Freight Origin-Destination Data\n\n*Midterm Research Report — LogiHub Intelligence Development Team — May 2026*",

    # Abstract Section
    "## TÓM TẮT (ABSTRACT)\n\nNghiên cứu này xây dựng một engine phân tích và tối ưu hoá mạng lưới kho hàng (logistics hub network) cho doanh nghiệp lớn tại Hàn Quốc, sử dụng dữ liệu Freight Origin-Destination (O/D) công khai của Bộ Giao thông Hàn Quốc làm proxy cho dữ liệu vận chuyển nội bộ doanh nghiệp. Engine gồm 10 module xử lý nối tiếp, từ nạp dữ liệu thô đến sinh khuyến nghị quản trị, áp dụng ba mô hình tối ưu hoá kinh điển trong lý thuyết Facility Location: P-median, Uncapacitated Facility Location Problem (UFLP), và Capacitated Facility Location Problem (CFLP). Nghiên cứu thiết kế 5 kịch bản chính (P = 3, 5, 7 hub; mạng hiện tại vs tối ưu; capacity-constrained) cộng với một sensitivity analysis, chạy trên 17 vùng hành chính Hàn Quốc. Kết quả cho thấy mạng 5-hub đạt sweet spot giữa chi phí, độ phủ phục vụ và tính bền vững — giảm khoảng 18% chi phí logistics và nâng tỉ lệ phục vụ trong bán kính 200km từ 78% lên 96% so với mạng 3-hub hiện hành. Bản phân tích kết quả cuối cùng được sinh tự động dưới dạng markdown 16 mục, mô phỏng output cấp senior supply chain manager. *Lưu ý quan trọng: hệ số chi phí trong nghiên cứu này được lấy từ giá trị benchmark trung bình ngành logistics, không phải hợp đồng vận chuyển thực tế của một doanh nghiệp cụ thể; cấu trúc phân tích và logic tối ưu hoá đạt chất lượng tương đương production, các con số tuyệt đối là demonstration.*\n\n**Từ khoá:** Logistics network design, Facility location, P-median, UFLP, CFLP, Korean Freight O/D, Hub allocation, Supply chain optimization.":
    "## ABSTRACT / 초록\n\nThis study builds an analytical and optimization engine for logistics hub networks of large Korean enterprises, using publicly available Korean Freight Origin-Destination (O/D) data from MOLIT as a proxy for internal shipment data. The engine consists of 10 sequential processing modules—from raw data ingestion to management recommendation generation—applying three classical Facility Location models: P-median, UFLP, and CFLP. Five scenarios (P = 3, 5, 7 hubs; current vs. optimal network; capacity-constrained) plus sensitivity analysis are run across 17 administrative regions. The 5-hub network achieves the optimal balance—reducing logistics costs ~18% and raising 200 km service coverage from 78% to 96% vs. the current 3-hub baseline. Results are auto-generated as a 16-section markdown report simulating SCM output.\n\n*본 연구는 한국 대기업의 물류 허브 네트워크 분석·최적화 엔진을 구축한다. 국토교통부(MOLIT) 공개 화물 기종점(O/D) 데이터를 기업 내부 물류 데이터의 대리값(proxy)으로 활용하였다. 엔진은 원시 데이터 수집부터 경영 권고안 생성까지 10개 순차 처리 모듈로 구성되며, 설비 입지(Facility Location) 이론의 세 고전 모델—P-중앙값(P-median), 비용량 설비 입지 문제(UFLP), 용량 제약 설비 입지 문제(CFLP)—을 적용한다. 한국 17개 행정 구역을 대상으로 5개 주요 시나리오와 민감도 분석을 수행하였다. 5-허브 네트워크가 비용·서비스 범위·견고성의 최적 균형을 달성하였으며, 기존 3-허브 대비 물류 비용을 약 18% 절감하고 반경 200 km 내 서비스율을 78%에서 96%로 향상시켰다. 수치는 시연용이다.*\n\n**Keywords:** Logistics network design, Facility location, P-median, UFLP, CFLP, Korean Freight O/D, Hub allocation, Supply chain optimization.\n\n**색인어:** 물류 네트워크 설계, 설비 입지, P-중앙값, UFLP, CFLP, 한국 화물 O/D, 허브 할당, 공급망 최적화.",

    # Section 1
    "## 1. ĐỊNH HƯỚNG NGHIÊN CỨU (DEFINE RESEARCH DIRECTION)": "## 1. RESEARCH DIRECTION / 연구 방향 설정",
    "### 1.1. Chủ đề nghiên cứu (Research Topic)": "### 1.1 Research Topic / 연구 주제",
    "Nghiên cứu này tập trung vào bài toán **thiết kế mạng lưới kho hàng tối ưu cho doanh nghiệp lớn tại Hàn Quốc**, một bài toán cốt lõi trong quản lý chuỗi cung ứng hiện đại. Đặc biệt, nghiên cứu xây dựng một engine tự động hoá toàn bộ quá trình phân tích — từ nạp dữ liệu vận chuyển thô, ước lượng nhu cầu theo vùng, đến chạy mô hình tối ưu hoá toán học và sinh khuyến nghị quản trị.\n\nPhạm vi địa lý là 17 vùng hành chính của Hàn Quốc (Seoul, Gyeonggi, Incheon, Busan, Daegu, Daejeon, Gwangju, Ulsan, Sejong, Gangwon, Chungbuk, Chungnam, Jeonbuk, Jeonnam, Gyeongbuk, Gyeongnam, Jeju). Phạm vi thời gian là dữ liệu Freight O/D 2022 (điều tra chính) và 2024 (cập nhật). Đối tượng doanh nghiệp giả định là các tập đoàn lớn như Samsung, LG, Hyundai có hoạt động phân phối trải rộng cả nước.":
    "This study focuses on the **optimal logistics hub network design problem for large enterprises in South Korea**, a core problem in modern supply chain management. It builds an engine that automates the full analytical pipeline—from ingesting raw freight data and estimating regional demand to running mathematical optimization models and generating management recommendations. Geographic scope: 17 administrative regions. Time frame: Freight O/D 2022 (main survey) and 2024 (update). Target firms: large conglomerates with nationwide distribution (Samsung, LG, Hyundai).\n\n본 연구는 한국 대기업을 위한 **최적 물류 허브 네트워크 설계 문제**에 집중한다. 원시 화물 데이터 수집, 지역 수요 추정, 수학적 최적화 모델 실행, 경영 권고안 생성까지 전체 분석 파이프라인을 자동화하는 엔진을 구축한다. 지리적 범위: 한국 17개 행정 구역. 대상 기업: 전국 유통망 보유 대기업.",

    "### 1.2. Câu hỏi nghiên cứu chính (Main Research Question)": "### 1.2 Main Research Question / 핵심 연구 질문",
    "> **Mạng lưới kho phân phối tối ưu cho một doanh nghiệp lớn tại Hàn Quốc bao gồm bao nhiêu kho, đặt ở vùng nào, mỗi kho phục vụ những vùng nào, và đánh đổi như thế nào giữa chi phí cố định, chi phí vận chuyển, độ phủ phục vụ, và tỉ lệ sử dụng công suất?**\n\nĐây là câu hỏi chiến lược cấp quản trị (strategic-level decision) mà engine LogiHub phải trả lời được một cách tự động dựa trên dữ liệu input.":
    "> **What is the optimal distribution hub network for a large enterprise in Korea—how many hubs, in which regions, which regions does each hub serve, and what are the trade-offs among fixed costs, transportation costs, service coverage, and capacity utilization?**\n\n> **한국 대기업을 위한 최적 물류 허브 네트워크는 몇 개의 허브로 구성되어야 하며, 각 허브는 어느 지역에 위치해야 하고, 어느 지역을 서비스해야 하며, 고정 비용·운송 비용·서비스 범위·설비 가동률 간 상충 관계는 어떠한가?**",

    "### 1.3. Câu hỏi nghiên cứu phụ (Sub Research Questions)": "### 1.3 Sub Research Questions / 세부 연구 질문",
    "Câu hỏi chính được phân rã thành 6 câu hỏi phụ:\n\n**SQ1 — Câu hỏi về dữ liệu:** Dữ liệu Korean Freight O/D công khai có đủ tin cậy và chi tiết để dùng làm proxy cho shipment data nội bộ của doanh nghiệp không? Cần xử lý những bước tiền xử lý nào để biến dữ liệu thô thành dữ liệu mô hình hoá được?\n\n**SQ2 — Câu hỏi về mô tả:** Cấu trúc nhu cầu vận chuyển hàng hoá tại Hàn Quốc phân bố như thế nào theo 17 vùng? Đâu là các hành lang vận chuyển (corridors) chính? Vùng nào có hiện tượng demand-warehouse mismatch (nhu cầu cao nhưng ít kho hoặc ngược lại)?\n\n**SQ3 — Câu hỏi về mô hình:** Trong các mô hình facility location kinh điển (P-median, UFLP, CFLP), mô hình nào phù hợp với từng câu hỏi cụ thể? Khi nào dùng P-median, khi nào dùng UFLP, khi nào cần CFLP?\n\n**SQ4 — Câu hỏi về kịch bản:** Số lượng hub tối ưu cho mạng lưới Hàn Quốc là bao nhiêu? So sánh các phương án P = 3, 5, 7 hub thay đổi cost và coverage ra sao? Mạng tối ưu có tốt hơn mạng hiện tại như thế nào?\n\n**SQ5 — Câu hỏi về kết quả:** Vùng nào nên trở thành hub? Tại sao? Mỗi hub được chọn nên phục vụ những vùng nào? Đánh đổi cost-service trong từng kịch bản là gì?\n\n**SQ6 — Câu hỏi về hệ quả quản trị:** Kết quả tối ưu hoá có hàm ý gì cho quyết định quản trị của doanh nghiệp? Có gì cần lưu ý cho chính sách logistics quốc gia? Hạn chế của nghiên cứu là gì? Hướng phát triển tiếp theo ra sao?":
    "The main research question is decomposed into 6 sub-questions:\n\n* **SQ1 — Data Reliability:** Can public Freight O/D data serve as a reliable proxy for internal enterprise shipments? (데이터 신뢰성)\n* **SQ2 — Descriptive Patterns:** How is transport demand distributed across the 17 regions, and where do mismatch gaps exist? (기술적 패턴)\n* **SQ3 — Model Applicability:** How do classical models (P-median, UFLP, CFLP) perform for different strategic questions? (모델 적용성)\n* **SQ4 — Scenario Evaluation:** What are the cost and service coverage differences for P = 3, 5, 7 hubs? (시나리오 평가)\n* **SQ5 — Optimal Allocation:** Which regions should serve as hubs and which customer regions should be assigned to them? (최적 할당)\n* **SQ6 — Strategic Implications:** What are the managerial and policy takeaways, limitations, and future paths? (전략적 시사점)",

    # Section 2
    "## 2. CƠ SỞ LÝ THUYẾT (LITERATURE & CONCEPTUAL FOUNDATION)": "## 2. LITERATURE & CONCEPTUAL FOUNDATION / 이론적 배경",
    "### 2.1. Logistics Network Design": "### 2.1 Logistics Network Design / 물류 네트워크 설계",
    "Logistics Network Design là nhánh nghiên cứu tập trung vào ba quyết định chiến lược của chuỗi cung ứng: **vị trí cơ sở (facility location)**, **phân bổ công suất (capacity allocation)**, và **phân bổ thị trường — nguồn cung (market and supply allocation)**. Theo Chopra và Meindl (2016), thiết kế mạng lưới logistics là quyết định có tính dài hạn, ảnh hưởng đến chi phí và hiệu quả vận hành của doanh nghiệp trong nhiều năm sau khi triển khai.\n\nChristopher (2016) trong \"Logistics & Supply Chain Management\" nhấn mạnh rằng mạng lưới logistics không chỉ là vấn đề tối thiểu chi phí — nó phải cân bằng giữa **chi phí (cost)**, **dịch vụ (service level)**, **tính linh hoạt (flexibility)**, và **độ bền vững (resilience)**. Một mạng lưới quá tinh giản (ít hub, ít kho) thì rẻ nhưng dễ vỡ khi có gián đoạn; mạng lưới quá dày đặc thì dịch vụ tốt nhưng chi phí cố định cao.\n\nSimchi-Levi và cộng sự (2008) phân loại các quyết định trong network design thành ba mức: chiến lược (vị trí cơ sở, công suất, mạng phân phối), chiến thuật (phân bổ inventory, lựa chọn carrier), và vận hành (lập lịch xe, quản lý đơn hàng). Nghiên cứu này tập trung vào mức **chiến lược**.\n\nMột mạng lưới logistics điển hình của doanh nghiệp lớn gồm các thành phần: nhà máy sản xuất (factories), kho trung tâm phân phối (distribution centers — DC), kho vùng (regional warehouses), điểm tập kết (cross-docking points), và điểm bán hàng cuối (retailers, dealers, customers). Engine LogiHub tập trung vào tối ưu hoá lớp DC và regional warehouse — gọi chung là \"hub\".":
    "Logistics Network Design is a research branch focusing on three strategic supply chain decisions: **facility location**, **capacity allocation**, and **market and supply allocation** (Chopra and Meindl, 2016). Christopher (2016) emphasizes that a logistics network must balance **cost**, **service level**, **flexibility**, and **resilience**. Simchi-Levi et al. (2008) classify network design decisions into strategic, tactical, and operational levels. This study focuses on the **strategic** level optimizing Distribution Centers (DC) and regional warehouses (collectively called \"hubs\").\n\n물류 네트워크 설계는 공급망의 세 가지 전략적 의사결정—**설비 입지**, **용량 할당**, **시장·공급 할당**—에 초점을 맞춘다. Chopra와 Meindl(2016)에 따르면 물류 네트워크 설계는 장기적 결정이다. Christopher(2016)는 물류 네트워크가 **비용**, **서비스 수준**, **유연성**, **회복탄력성** 간 균형을 맞춰야 한다고 강조한다. 본 연구는 유통 센터(DC)와 지역 창고('허브') 최적화인 **전략적** 단계에 집중한다.",

    "### 2.2. Facility Location Models": "### 2.2 Facility Location Models / 설비 입지 모델",
    "Facility Location Models (mô hình định vị cơ sở) là họ mô hình toán học giải bài toán \"đặt cơ sở ở đâu\" với các ràng buộc khác nhau. Daskin (2013) trong \"Network and Discrete Location\" liệt kê hơn 30 biến thể, nhưng ba biến thể được dùng phổ biến nhất là P-median, UFLP, và CFLP.":
    "Facility Location Models solve the problem of \"where to place facilities\" under various constraints (Daskin, 2013). This study utilizes three main classical models: P-median, UFLP, and CFLP.\n\n설비 입지 모델은 다양한 제약 조건 하에서 '시설물 최적 위치'를 결정하는 수학적 기법이다. 본 연구는 P-중앙값, UFLP, CFLP 세 가지 고전 모델을 사용한다.",

    "**P-Median Problem.** Bài toán P-median được Hakimi (1964) đề xuất, có mục tiêu chọn đúng P điểm trong tập ứng viên sao cho tổng khoảng cách có trọng số giữa các điểm nhu cầu và cơ sở phục vụ chúng là nhỏ nhất. Công thức:":
    "**P-Median Problem:** Proposed by Hakimi (1964), the P-median problem selects exactly P sites to minimize the total weighted distance between demand points and assigned facilities:",

    "**Uncapacitated Facility Location Problem (UFLP).** Đề xuất bởi Balinski (1965), UFLP không cố định số facility mở mà tự chọn dựa trên cân bằng giữa **chi phí cố định** của mở facility và **chi phí vận chuyển**. Công thức:":
    "**Uncapacitated Facility Location Problem (UFLP):** Proposed by Balinski (1965), UFLP does not fix the number of open facilities but balances fixed opening costs against transportation savings:",

    "**Capacitated Facility Location Problem (CFLP).** Bổ sung ràng buộc capacity vào UFLP. Mỗi facility $j$ chỉ phục vụ được tối đa $\\text{Cap}_j$ đơn vị nhu cầu:":
    "**Capacitated Facility Location Problem (CFLP):** Adds a hard capacity constraint to UFLP. Each facility $j$ can serve at most $\\text{Cap}_j$ units of demand:",

    # Section 2.3 & 2.4
    "### 2.3. Freight Origin-Destination Analysis": "### 2.3 Freight O/D Analysis / 화물 기종점 분석",
    "### 2.4. Warehouse Infrastructure Analysis": "### 2.4 Warehouse Infrastructure Analysis / 물류창고 인프라 분석",

    # Section 3
    "## 3. THU THẬP DỮ LIỆU (DATA ACQUISITION)": "## 3. DATA ACQUISITION / 데이터 수집",
    "### 3.1. Korean Freight O/D 2022 Main Survey": "### 3.1 Korean Freight O/D 2022 Main Survey / 2022년 화물 기종점 본조사",
    "### 3.2. Korean Freight O/D 2024 Update": "### 3.2 Korean Freight O/D 2024 Update / 2024년 화물 기종점 갱신",
    "### 3.3. Road Transport Performance Data": "### 3.3 Road Transport Performance Data / 도로 수송 실적 데이터",
    "### 3.4. Warehouse Registration Data": "### 3.4 Warehouse Registration Data / 물류창고 등록 데이터",
    "### 3.5. Optional: Freight Market Reports 2025": "### 3.5 Optional: Freight Market Reports 2025 / 2025년 화물 시장 보고서",
    "### 3.6. GIS / Coordinates / Administrative Boundaries": "### 3.6 GIS / Coordinates / Administrative Boundaries / GIS 및 행정 구역 경계",

    # Section 4
    "## 4. TIỀN XỬ LÝ DỮ LIỆU (DATA PREPROCESSING)": "## 4. DATA PREPROCESSING / 데이터 전처리",
    "### 4.1. Chuẩn hoá tên vùng": "### 4.1 Region Name Standardization / 지역명 표준화",
    "### 4.2. Làm sạch missing và duplicate": "### 4.2 Missing & Duplicate Cleaning / 결측치 및 중복 제거",
    "### 4.3. Geocoding vị trí kho": "### 4.3 Warehouse Geocoding / 물류창고 지오코딩",
    "### 4.4. Chuẩn hoá đơn vị volume": "### 4.4 Volume Unit Standardization / 물동량 단위 표준화",
    "### 4.5. Tạo dataset phân tích": "### 4.5 Analytics Dataset Generation / 분석용 데이터셋 생성",

    # Section 5
    "## 5. PHÂN TÍCH MÔ TẢ (DESCRIPTIVE ANALYTICS)": "## 5. DESCRIPTIVE ANALYTICS / 기술 분석",
    "### 5.1. Vùng có demand outbound cao nhất (Top origin regions)": "### 5.1 Top Origin Regions / 최다 아웃바운드 지역",
    "### 5.2. Vùng có demand inbound cao nhất (Top destination regions)": "### 5.2 Top Destination Regions / 최다 인바운드 지역",
    "### 5.3. Top O/D corridors": "### 5.3 Top O/D Corridors / 주요 O/D 수송 경로",
    "### 5.4. Mật độ kho theo vùng (Warehouse density by region)": "### 5.4 Warehouse Density by Region / 지역별 물류창고 밀도",
    "### 5.5. Demand-warehouse mismatch": "### 5.5 Demand-Warehouse Mismatch / 수요-창고 인프라 불일치",

    # Section 6
    "## 6. XÂY DỰNG MÔ HÌNH NGHIÊN CỨU (RESEARCH MODEL CONSTRUCTION)": "## 6. RESEARCH MODEL CONSTRUCTION / 연구 모델 구축",
    "### 6.1. Ước lượng nhu cầu (Demand Estimation)": "### 6.1 Demand Estimation / 수요 추정",
    "### 6.2. Sinh ứng viên hub (Candidate Hub Generation)": "### 6.2 Candidate Hub Generation / 후보 허브 생성",
    "### 6.3. Ma trận khoảng cách / chi phí (Distance / Cost Matrix)": "### 6.3 Distance / Cost Matrix / 거리 및 비용 행렬",
    "### 6.4. Chi phí cố định và công suất (Fixed Cost / Capacity)": "### 6.4 Fixed Cost / Capacity / 고정비 및 수용량",

    # Section 7
    "## 7. CÁC MÔ HÌNH TỐI ƯU HOÁ (OPTIMIZATION MODELS)": "## 7. OPTIMIZATION MODELS / 최적화 모델",
    "### 7.1. P-Median Model": "### 7.1 P-Median Model / P-중앙값 모델",
    "### 7.2. UFLP Model": "### 7.2 UFLP Model / UFLP 모델",
    "### 7.3. CFLP Model": "### 7.3 CFLP Model / CFLP 모델",

    # Section 8
    "## 8. THIẾT KẾ KỊCH BẢN (SCENARIO DESIGN)": "## 8. SCENARIO DESIGN / 시나리오 설계",
    "### 8.1. Kịch bản P = 3, 5, 7 hub (P-Median)": "### 8.1 Scenario P = 3, 5, 7 Hubs (P-Median) / P-중앙값 시나리오",
    "### 8.2. Current network vs optimized": "### 8.2 Current Network vs. Optimized / 현행 대비 최적 네트워크",
    "### 8.3. Capacity-constrained scenario (CFLP)": "### 8.3 Capacity-Constrained Scenario (CFLP) / 용량 제약 시나리오",
    "### 8.4. Existing warehouses only": "### 8.4 Existing Warehouses Only / 기존 창고 전용 시나리오",
    "### 8.5. Sensitivity analysis": "### 8.5 Sensitivity Analysis / 민감도 분석",

    # Section 9
    "## 9. GIẢI MÔ HÌNH (MODEL SOLVING)": "## 9. MODEL SOLVING & RESULTS / 모델 풀이 및 결과",
    "### 9.1. Hub được chọn (Selected hubs)": "### 9.1 Selected Hubs / 선정된 허브",
    "### 9.2. Phân bổ nhu cầu (Demand allocation) — Kịch bản P-Median P=5": "### 9.2 Demand Allocation (P=5) / 수요 할당 시나리오",
    "### 9.3. Giá trị hàm mục tiêu (Objective value)": "### 9.3 Objective Values / 목적함수 값",
    "### 9.4. Cost / coverage / utilization": "### 9.4 Cost, Coverage, and Utilization / 비용, 서비스 커버리지 및 가동률",

    # Section 10
    "## 10. DIỄN GIẢI KẾT QUẢ (RESULT INTERPRETATION)": "## 10. RESULT INTERPRETATION / 결과 해석",
    "### 10.1. Hub nào tối ưu?": "### 10.1 Which Hubs are Optimal? / 최적 허브 입지",
    "### 10.2. Tại sao 5 hub này được chọn?": "### 10.2 Why Were These 5 Hubs Selected? / 5대 허브 선정 사유",
    "### 10.3. Mỗi hub phục vụ vùng nào?": "### 10.3 Which Regions Does Each Hub Serve? / 허브별 담당 지역",
    "### 10.4. Trade-offs giữa các kịch bản": "### 10.4 Strategic Trade-offs / 시나리오별 트레이드오프",

    # Section 11
    "## 11. THẢO LUẬN (DISCUSSION)": "## 11. DISCUSSION / 논의",
    "### 11.1. Hệ quả quản trị (Managerial implications)": "### 11.1 Managerial Implications / 경영적 시사점",
    "### 11.2. Hệ quả chính sách (Policy implications)": "### 11.2 Policy Implications / 정책적 시사점",
    "### 11.3. Hạn chế của nghiên cứu (Research limitations)": "### 11.3 Research Limitations / 연구의 한계점",
    "### 11.4. Hướng nghiên cứu tiếp theo (Future research directions)": "### 11.4 Future Research Directions / 향후 연구 방향",

    # Section 12
    "## 12. KẾT LUẬN (CONCLUSION)": "## 12. CONCLUSION / 결론",

    # References
    "## TÀI LIỆU THAM KHẢO": "## REFERENCES / 참고문헌",

    "## PHỤ LỤC A — JSON CONTRACT SCHEMA": "## APPENDIX A — JSON CONTRACT SCHEMA / 부록 A",
    "## PHỤ LỤC B — SAMPLE CSV OUTPUT": "## APPENDIX B — SAMPLE CSV OUTPUT / 부록 B",
    "## PHỤ LỤC C — OUTCOME MARKDOWN MẪU": "## APPENDIX C — SAMPLE OUTCOME / 부록 C",
    "## PHỤ LỤC D — CODE BASE": "## APPENDIX D — CODE BASE / 부록 D",
    "## PHỤ LỤC E — DISCLAIMER VỀ PROXY DATA": "## APPENDIX E — PROXY DISCLAIMER / 부록 E",
}

for src_str, target_str in REPLACEMENTS.items():
    text = text.replace(src_str, target_str)

# Fine-grained Line by Line replacement list
FINE_REPLACEMENTS = [
    ("với ràng buộc tổng số facility mở $\\sum_{j} x_j = P$, mỗi điểm nhu cầu được phục vụ bởi đúng một facility $\\sum_{j} y_{ij} = 1$, và facility chỉ phục vụ nếu được mở $y_{ij} \\le x_j$. Trong đó: $h_i$ là nhu cầu vùng $i$; $c_{ij}$ là khoảng cách hoặc chi phí; $x_j \\in \\{0,1\\}$ biến nhị phân chọn hub $j$; $y_{ij} \\in \\{0,1\\}$ biến nhị phân gán vùng $i$ cho hub $j$.",
     "Subject to: exactly P facilities open ($\\sum_j x_j = P$); each demand point assigned to exactly one facility ($\\sum_j y_{ij} = 1\\ \\forall i$); assignment only to open facilities ($y_{ij} \\le x_j$). Variables $x_j, y_{ij} \\in \\{0,1\\}$, where $h_i$ is regional demand, and $c_{ij}$ is distance/cost."),

    ("với cùng các ràng buộc về assignment như P-median nhưng bỏ ràng buộc số facility cố định. UFLP trả lời câu hỏi: \"Có nên mở thêm 1 facility nữa không, biết rằng nó tốn $f_j$ chi phí cố định nhưng giảm chi phí vận chuyển?\".\n\nUFLP thường ra số hub thấp hơn nếu fixed cost cao tương đối so với savings từ transport. Sensitivity analysis trên $f_j$ giúp hiểu trade-off.",
     "Same assignment constraints as P-median but without the fixed-P constraint. UFLP answers: \"Should we open one more facility given it costs $f_j$ annually but reduces transport cost?\""),

    ("CFLP phù hợp khi capacity là ràng buộc cứng (kho có giới hạn diện tích, throughput, dock space). Trong thực tế, CFLP gần với bài toán doanh nghiệp hơn UFLP vì kho nào cũng có giới hạn vật lý.",
     "CFLP is suitable when capacity is a hard constraint (warehouses have physical limits), making it closest to real-world enterprise operations."),

    ("Cả ba mô hình đều thuộc lớp Mixed Integer Linear Programming (MILP) và có thể giải bằng các solver thương mại (CPLEX, Gurobi) hoặc miễn phí (CBC qua PuLP). Đối với bài toán cỡ 17 vùng × 30-40 hub ứng viên, CBC giải được trong dưới 15 giây.",
     "All three models belong to the class of Mixed Integer Linear Programming (MILP) and can be solved using commercial solvers (CPLEX, Gurobi) or free solvers (CBC via PuLP). For problems of size 17 regions × 17 candidate hubs, CBC solves it in under 15 seconds."),

    ("Nguồn: Bộ Giao thông Hàn Quốc (MOLIT). File gốc: `배포용 (기준년 độ 2022년) 화물물동 lượngOD_2026.04.06.xlsx` (sheet tiếng Hàn). Dữ liệu này là kết quả điều tra chính 2022 — thu thập qua phỏng vấn 12,000+ doanh nghiệp vận tải và đo đếm tại 250+ trạm cân. Phạm vi: vận chuyển liên vùng nội địa Hàn Quốc, đơn vị tấn/năm.",
     "Source: Ministry of Land, Infrastructure and Transport (MOLIT). Original file: 배포용 (기준년도 2022년) 화물물동량OD_2026.04.06.xlsx. Contains domestic freight flows in tons/year based on surveys of 12,000+ logistics firms and 250+ toll stations."),

    ("Schema sau xử lý:", "Processed Schema:"),
    ("| Cột | Kiểu | Mô tả |", "| Column | Type | Description |"),
    ("Mã vùng đi (theo Korean administrative codes)", "Origin zone code"),
    ("Mã vùng đến", "Destination zone code"),
    ("Lượng hàng (tấn/năm)", "Freight volume (tons/year)"),

    ("Nguồn: MOLIT. File: `배포용 장래년도(2025-2050) 도로 전체 물동 lượngOD_2024.12.20.xlsx`. Đây là bản cập nhật giữa kỳ năm 2024 with projection đến 2050. Nghiên cứu dùng phần baseline 2023 đã được clean lưu trong `od_clean_long_2023.csv` để có dữ liệu mới nhất.",
     "Source: MOLIT. File: 배포용 장래년도(2025-2050) 도로 전체 물동량OD_2024.12.20.xlsx. Contains future projections up to 2050."),

    ("Nguồn: Korea Logistics Association — bộ đăng ký kho công nghiệp. File gốc: `물류창고정보_260508.xls`. Dữ liệu chứa thông tin của 12,847 kho công nghiệp đã đăng ký toàn quốc. Nghiên cứu lọc và geocode các kho có quy mô lớn (≥ 5,000 m²) lưu trong `warehouse_geocoded.csv`. Cộng với bảng tổng hợp công suất theo 17 vùng `warehouse_capacity_17_regions.csv`.",
     "Source: Korea Logistics Association. Contains 12,847 registered warehouses, filtered for large scale (>= 5,000 m2) and geocoded."),

    ("| Đơn vị gốc | Hệ số quy đổi sang tấn |", "| Original Unit | Conversion Factor to Ton |"),
    ("tuỳ ngành, dùng heuristic", "industry dependent heuristic"),
    ("Số dòng", "Row Count"),

    ("| Hạng | Vùng | Volume outbound (k tấn/năm) | % toàn quốc |", "| Rank | Region | Outbound Volume (k tons/year) | % National |"),
    ("Diễn giải: Gyeonggi đứng đầu vì cụm sản xuất công nghiệp + cảng Incheon. Gyeongnam và Chungnam tiếp theo do là cụm nhà máy ô tô (Hyundai-Ulsan, Kia-Hwaseong) và hoá dầu. Đông Nam và Tây Nam có tỉ trọng outbound lớn — đây là khu vực **sản xuất** chính của Hàn Quốc.",
     "**Interpretation:** Gyeonggi ranks first due to industrial manufacturing clusters and Incheon Port. Gyeongnam and Chungnam follow, driven by automotive and petrochemical bases. The Southeast and Southwest zones act as the main production sectors of South Korea."),

    ("| Hạng | Vùng | Volume inbound (k tấn/năm) | % toàn quốc |", "| Rank | Region | Inbound Volume (k tons/year) | % National |"),
    ("Diễn giải: Inbound cao nhất ở các vùng đô thị (Seoul, Gyeonggi, Busan) — đây là khu vực **tiêu thụ**. Gyeonggi vừa là origin vừa là destination lớn nhất, phản ánh tính chất \"vùng tổ hợp\" — vừa sản xuất vừa tiêu thụ và trung chuyển.",
     "**Interpretation:** Inbound volume peaks in major metropolitan clusters (Seoul, Gyeonggi, Busan) which serve as the primary consumption zones."),

    ("| Hạng | Origin → Destination | Volume (k tấn/năm) | % tổng |", "| Rank | Origin → Destination | Volume (k tons/year) | % Total |"),
    ("Top 10 corridor chiếm ~38% tổng volume cả nước. Hành lang tải lớn nhất là **Gyeonggi ↔ Seoul** (cụm metro), tiếp theo là **Chungnam ↔ Gyeonggi** (cụm công nghiệp Asan-Cheonan tới metro), và **Gyeongnam ↔ Busan** (sản xuất tới cảng).",
     "**Interpretation:** The top 10 corridors account for ~38% of nationwide volume, led by the Gyeonggi-Seoul metropolitan freight lane."),

    ("| Vùng | Số kho ≥ 5,000 m² | Tổng diện tích (km²) | Capacity (k pallets) |", "| Region | Warehouses ≥ 5,000 m² | Total Area (km²) | Capacity (k pallets) |"),
    ("| Vùng | % Demand | % Capacity | Mismatch index | Diễn giải |", "| Region | % Demand | % Capacity | Mismatch Index | Interpretation |"),
    ("Thiếu kho mạnh", "Severe Shortage"),
    ("Hơi thiếu", "Mild Shortage"),
    ("Vùng thưa, distance dài", "Sparse, long distance"),
    ("Thừa capacity", "Excess Capacity"),
    ("Thiếu kho rất mạnh, đảo", "Severe Shortage (Island)"),

    ("Diễn giải quan trọng: mismatch lớn nhất ở **Seoul** (2.11) và **Jeju** (2.80). Seoul là vùng đô thị đắt đỏ — kho thường được đẩy ra Gyeonggi. Jeju là đảo, bị surcharge phà cao nên ít kho. Hai vùng này là cơ hội tối ưu hoá mạnh nhất khi triển khai mạng lưới mới.",
     "**Interpretation:** Severe mismatches are observed in Seoul (2.11) and Jeju (2.80). Seoul land is extremely expensive, pushing facilities into Gyeonggi, while Jeju is limited by island sea freights."),

    ("| Vùng | $h_i$ (k tấn/năm) | Index (toàn quốc = 100) |", "| Region | $h_i$ (k tons/year) | Index (National = 100) |"),
    ("| Origin → Destination | Distance (km) | Cost (USD/tấn) |", "| Origin → Destination | Distance (km) | Cost (USD/ton) |"),
    ("| Vùng | Base rent ($/m²) | $f_j$ (USD/năm) |", "| Region | Base Rent ($/m²) | $f_j$ (USD/year) |"),

    ("**Khi nào dùng:** doanh nghiệp chưa quyết định số hub, muốn để mô hình tự cân bằng giữa **chi phí cố định** của mở facility và **chi phí vận chuyển**. Ví dụ: \"Mỗi hub mở thì tốn 5 triệu USD/năm — có nên mở thêm hub thứ 6 không?\".",
     "**Use Case:** The firm wants the model to automatically determine the number of hubs by balancing fixed costs and transport savings."),

    ("**Mathematical Formulation:** UFLP có thêm capacity constraint:", "**Mathematical Formulation:** CFLP adds capacity constraints to UFLP:"),

    ("| Tham số | Range thử | Mục đích |", "| Parameter | Test Range | Purpose / 목적 |"),
    ("Test độ nhạy với chi phí kho", "Test sensitivity to facility rent"),
    ("Test với thay đổi giá xăng", "Test sensitivity to fuel costs"),
    ("Test với tăng trưởng nhu cầu", "Stress test with demand growth"),
    ("Test khi kho bị giới hạn", "Stress test with capacity contraction"),

    ("| Kịch bản | Hub được mở |", "| Scenario | Selected Open Hubs / 선정된 허브 |"),
    ("Diễn giải: 5 vùng xuất hiện trong mọi kịch bản tối ưu là **Gyeonggi, Daejeon, Daegu, Gwangju, Busan**. Khi chi phí cố định cực kỳ cao (UFLP), mô hình tự động rút về 4 hub (bỏ Daegu). Khi có giới hạn công suất (CFLP), mô hình bắt buộc phải mở cả 5 hub để chia tải.",
     "**Interpretation:** Gyeonggi, Daejeon, Daegu, Gwangju, and Busan appear in all optimal configurations."),

    ("| Vùng | Hub được gán | Distance (km) | Demand allocated (k tấn) |", "| Region | Assigned Hub | Distance (km) | Demand Allocated (k tons) |"),
    ("| Kịch bản | Total cost (USD/năm) | Cost index (P=3 = 100) |", "| Scenario | Total Cost (USD/year) | Cost Index (P=3 = 100) |"),
    ("| Kịch bản | Coverage % |", "| Scenario | 200km Coverage % / 커버리지 |"),
    ("| Kịch bản | Util tb | Util max | Util min |", "| Scenario | Avg Util % | Max Util % | Min Util % |"),
    ("| Hub | Vùng phục vụ | Tổng demand allocated (k tấn) |", "| Hub | Served Regions / 담당 지역 | Total Allocated (k tons) |"),

    ("Đối với doanh nghiệp có yêu cầu logistics đặc thù theo dòng sản phẩm (nhu cầu cao, nhạy cảm SLA, an ninh như chip/màn hình), nên mở rộng sang mô hình **6-hub hybrid DC** có bổ sung một hub chuyên dụng bảo mật giá trị cao.",
     "Firms with product-specific logistics (such as Samsung Mobile) should design a 6-node hybrid network with a dedicated secure hub."),

    ("*Bản phân tích này được sinh bởi LogiHub Engine v1.0 chạy trên Korean Freight O/D 2023 (công khai) đóng vai trò proxy cho data shipment doanh nghiệp. Cấu trúc phân tích, kiến trúc khuyến nghị, và logic tối ưu hoá có chất lượng tương đương phiên bản production. Các con số tuyệt đối là demonstration. Khi áp dụng cho một doanh nghiệp cụ thể (Samsung, LG, ...), engine cần được feed shipment data nội bộ để có kết quả chính xác.*",
     "*This analysis is generated by the LogiHub Engine v1.0 running on the public Korean Freight O/D 2023 dataset as a proxy for actual enterprise shipment data.*")
]

for src, tgt in FINE_REPLACEMENTS:
    text = text.replace(src, tgt)

# Clean up some common leftover words
text = text.replace("Nguồn:", "Source:")
text = text.replace("Cột", "Column")
text = text.replace("Mô tả", "Description")
text = text.replace("tấn/năm", "tons/year")
text = text.replace("Số dòng", "Row Count")

# Write output file
with open(OUT_MD, "w", encoding="utf-8") as f:
    f.write(text)

print("Programmatic replacements completed successfully.")

# Run Pandoc command to export to DOCX with native Office Math
cmd = [
    'pandoc', OUT_MD,
    '-o', OUT_DOCX,
    '--mathml',
    '--toc',
    '--toc-depth=2',
    '-M', 'title=LogiHub Intelligence — Research Report (EN/KO)',
    '-M', 'lang=en',
]

try:
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if r.returncode == 0:
        print("Pure EN-KO DOCX generated successfully.")
        print(f"Path: {OUT_DOCX}")
    else:
        print("Pandoc Error:", r.stderr)
except Exception as e:
    print("Execution Error:", str(e))
