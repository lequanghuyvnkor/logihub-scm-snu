# LOGIHUB INTELLIGENCE — BÁO CÁO NGHIÊN CỨU

## Tối ưu hoá mạng lưới kho phân phối tại Hàn Quốc dựa trên dữ liệu Freight Origin-Destination

*Báo cáo nghiên cứu giữa kỳ — Đội phát triển LogiHub Intelligence — Tháng 5/2026*

---

## TÓM TẮT (ABSTRACT)

Nghiên cứu này xây dựng một engine phân tích và tối ưu hoá mạng lưới kho hàng (logistics hub network) cho doanh nghiệp lớn tại Hàn Quốc, sử dụng dữ liệu Freight Origin-Destination (O/D) công khai của Bộ Giao thông Hàn Quốc làm proxy cho dữ liệu vận chuyển nội bộ doanh nghiệp. Engine gồm 10 module xử lý nối tiếp, từ nạp dữ liệu thô đến sinh khuyến nghị quản trị, áp dụng ba mô hình tối ưu hoá kinh điển trong lý thuyết Facility Location: P-median, Uncapacitated Facility Location Problem (UFLP), và Capacitated Facility Location Problem (CFLP). Nghiên cứu thiết kế 5 kịch bản chính (P = 3, 5, 7 hub; mạng hiện tại vs tối ưu; capacity-constrained) cộng với một sensitivity analysis, chạy trên 17 vùng hành chính Hàn Quốc. Kết quả cho thấy mạng 5-hub đạt sweet spot giữa chi phí, độ phủ phục vụ và tính bền vững — giảm khoảng 18% chi phí logistics và nâng tỉ lệ phục vụ trong bán kính 200km từ 78% lên 96% so với mạng 3-hub hiện hành. Bản phân tích kết quả cuối cùng được sinh tự động dưới dạng markdown 16 mục, mô phỏng output cấp senior supply chain manager. *Lưu ý quan trọng: hệ số chi phí trong nghiên cứu này được lấy từ giá trị benchmark trung bình ngành logistics, không phải hợp đồng vận chuyển thực tế của một doanh nghiệp cụ thể; cấu trúc phân tích và logic tối ưu hoá đạt chất lượng tương đương production, các con số tuyệt đối là demonstration.*

**[EN] ABSTRACT**

This study builds an analytical and optimization engine for logistics hub networks of large Korean enterprises, using publicly available Korean Freight O/D data from MOLIT as a proxy for internal shipment data. The engine has 10 sequential modules applying three classical Facility Location models: P-median, UFLP, and CFLP. Five scenarios (P = 3, 5, 7 hubs; current vs. optimal; capacity-constrained) plus sensitivity analysis are run across 17 Korean administrative regions. The 5-hub network achieves the optimal balance—reducing logistics costs ~18% and raising 200 km service coverage from 78% to 96% vs. the current 3-hub baseline. Results are auto-generated as a 16-section markdown report simulating senior SCM manager output. *Note: cost coefficients are industry-average benchmarks, not actual contracts; analytical structure and optimization logic are production-equivalent; absolute figures are for demonstration.*

**[KO] 초록**

본 연구는 한국 대기업의 물류 허브 네트워크 분석·최적화 엔진을 구축한다. 국토교통부(MOLIT) 공개 화물 기종점(O/D) 데이터를 기업 내부 물류 데이터의 대리값(proxy)으로 활용하였다. 엔진은 원시 데이터 수집부터 경영 권고안 생성까지 10개 순차 처리 모듈로 구성되며, 설비 입지(Facility Location) 이론의 세 고전 모델—P-중앙값(P-median), 비용량 설비 입지 문제(UFLP), 용량 제약 설비 입지 문제(CFLP)—을 적용한다. 한국 17개 행정 구역을 대상으로 5개 주요 시나리오와 민감도 분석을 수행하였다. 5-허브 네트워크가 비용·서비스 범위·견고성의 최적 균형을 달성하였으며, 기존 3-허브 대비 물류 비용을 약 18% 절감하고 반경 200 km 내 서비스율을 78%에서 96%로 향상시켰다. *참고: 비용 계수는 업계 평균 벤치마크 값이며 실제 계약 기준이 아니다. 분석 구조 및 최적화 논리는 실제 엔진 수준이며, 절대 수치는 시연용이다.*


**Từ khoá:** Logistics network design, Facility location, P-median, UFLP, CFLP, Korean Freight O/D, Hub allocation, Supply chain optimization.

---

## 1. ĐỊNH HƯỚNG NGHIÊN CỨU (DEFINE RESEARCH DIRECTION)

### 1.1. Chủ đề nghiên cứu (Research Topic)

Nghiên cứu này tập trung vào bài toán **thiết kế mạng lưới kho hàng tối ưu cho doanh nghiệp lớn tại Hàn Quốc**, một bài toán cốt lõi trong quản lý chuỗi cung ứng hiện đại. Đặc biệt, nghiên cứu xây dựng một engine tự động hoá toàn bộ quá trình phân tích — từ nạp dữ liệu vận chuyển thô, ước lượng nhu cầu theo vùng, đến chạy mô hình tối ưu hoá toán học và sinh khuyến nghị quản trị.

**[EN] 1.1 Research Topic**

This study focuses on the **optimal logistics hub network design problem for large enterprises in Korea**. It builds an engine that automates the full analytical pipeline—from ingesting raw freight data and estimating regional demand to running mathematical optimization models and generating management recommendations. Geographic scope: 17 Korean administrative regions. Time frame: Freight O/D 2022 (main survey) and 2024 (update). Target firms: large conglomerates with nationwide distribution (Samsung, LG, Hyundai).

**[KO] 1.1 연구 주제**

본 연구는 **한국 대기업을 위한 최적 물류 허브 네트워크 설계 문제**에 집중한다. 원시 화물 데이터 수집, 지역 수요 추정, 수학적 최적화 모델 실행, 경영 권고안 생성까지 전체 분석 파이프라인을 자동화하는 엔진을 구축한다. 지리적 범위: 한국 17개 행정 구역. 분석 기간: 2022년 본조사 및 2024년 갱신 O/D 데이터. 대상 기업: 삼성, LG, 현대 등 전국 유통망 보유 대기업.


Phạm vi địa lý là 17 vùng hành chính của Hàn Quốc (Seoul, Gyeonggi, Incheon, Busan, Daegu, Daejeon, Gwangju, Ulsan, Sejong, Gangwon, Chungbuk, Chungnam, Jeonbuk, Jeonnam, Gyeongbuk, Gyeongnam, Jeju). Phạm vi thời gian là dữ liệu Freight O/D 2022 (điều tra chính) và 2024 (cập nhật). Đối tượng doanh nghiệp giả định là các tập đoàn lớn như Samsung, LG, Hyundai có hoạt động phân phối trải rộng cả nước.

### 1.2. Câu hỏi nghiên cứu chính (Main Research Question)

> **Mạng lưới kho phân phối tối ưu cho một doanh nghiệp lớn tại Hàn Quốc bao gồm bao nhiêu kho, đặt ở vùng nào, mỗi kho phục vụ những vùng nào, và đánh đổi như thế nào giữa chi phí cố định, chi phí vận chuyển, độ phủ phục vụ, và tỉ lệ sử dụng công suất?**

**[EN] Main Research Question**

> What is the optimal distribution hub network for a large Korean enterprise — how many hubs, in which regions, which regions does each hub serve, and what are the trade-offs among fixed costs, transportation costs, service coverage, and capacity utilization?

**[KO] 핵심 연구 질문**

> 한국 대기업을 위한 최적 물류 허브 네트워크는 몇 개의 허브로 구성되어야 하며, 각 허브는 어느 지역에 위치해야 하고, 어느 지역을 서비스해야 하며, 고정 비용·운송 비용·서비스 범위·설비 가동률 간 상충 관계는 어떠한가?


Đây là câu hỏi chiến lược cấp quản trị (strategic-level decision) mà engine LogiHub phải trả lời được một cách tự động dựa trên dữ liệu input.

### 1.3. Câu hỏi nghiên cứu phụ (Sub Research Questions)

Câu hỏi chính được phân rã thành 6 câu hỏi phụ:

**SQ1 — Câu hỏi về dữ liệu:** Dữ liệu Korean Freight O/D công khai có đủ tin cậy và chi tiết để dùng làm proxy cho shipment data nội bộ của doanh nghiệp không? Cần xử lý những bước tiền xử lý nào để biến dữ liệu thô thành dữ liệu mô hình hoá được?

**SQ2 — Câu hỏi về mô tả:** Cấu trúc nhu cầu vận chuyển hàng hoá tại Hàn Quốc phân bố như thế nào theo 17 vùng? Đâu là các hành lang vận chuyển (corridors) chính? Vùng nào có hiện tượng demand-warehouse mismatch (nhu cầu cao nhưng ít kho hoặc ngược lại)?

**SQ3 — Câu hỏi về mô hình:** Trong các mô hình facility location kinh điển (P-median, UFLP, CFLP), mô hình nào phù hợp với từng câu hỏi cụ thể? Khi nào dùng P-median, khi nào dùng UFLP, khi nào cần CFLP?

**SQ4 — Câu hỏi về kịch bản:** Số lượng hub tối ưu cho mạng lưới Hàn Quốc là bao nhiêu? So sánh các phương án P = 3, 5, 7 hub thay đổi cost và coverage ra sao? Mạng tối ưu có tốt hơn mạng hiện tại như thế nào?

**SQ5 — Câu hỏi về kết quả:** Vùng nào nên trở thành hub? Tại sao? Mỗi hub được chọn nên phục vụ những vùng nào? Đánh đổi cost-service trong từng kịch bản là gì?

**SQ6 — Câu hỏi về hệ quả quản trị:** Kết quả tối ưu hoá có hàm ý gì cho quyết định quản trị của doanh nghiệp? Có gì cần lưu ý cho chính sách logistics quốc gia? Hạn chế của nghiên cứu là gì? Hướng phát triển tiếp theo ra sao?

---

## 2. CƠ SỞ LÝ THUYẾT (LITERATURE & CONCEPTUAL FOUNDATION)

### 2.1. Logistics Network Design

Logistics Network Design là nhánh nghiên cứu tập trung vào ba quyết định chiến lược của chuỗi cung ứng: **vị trí cơ sở (facility location)**, **phân bổ công suất (capacity allocation)**, và **phân bổ thị trường — nguồn cung (market and supply allocation)**. Theo Chopra và Meindl (2016), thiết kế mạng lưới logistics là quyết định có tính dài hạn, ảnh hưởng đến chi phí và hiệu quả vận hành của doanh nghiệp trong nhiều năm sau khi triển khai.

Christopher (2016) trong "Logistics & Supply Chain Management" nhấn mạnh rằng mạng lưới logistics không chỉ là vấn đề tối thiểu chi phí — nó phải cân bằng giữa **chi phí (cost)**, **dịch vụ (service level)**, **tính linh hoạt (flexibility)**, và **độ bền vững (resilience)**. Một mạng lưới quá tinh giản (ít hub, ít kho) thì rẻ nhưng dễ vỡ khi có gián đoạn; mạng lưới quá dày đặc thì dịch vụ tốt nhưng chi phí cố định cao.

Simchi-Levi và cộng sự (2008) phân loại các quyết định trong network design thành ba mức: chiến lược (vị trí cơ sở, công suất, mạng phân phối), chiến thuật (phân bổ inventory, lựa chọn carrier), và vận hành (lập lịch xe, quản lý đơn hàng). Nghiên cứu này tập trung vào mức **chiến lược**.

Một mạng lưới logistics điển hình của doanh nghiệp lớn gồm các thành phần: nhà máy sản xuất (factories), kho trung tâm phân phối (distribution centers — DC), kho vùng (regional warehouses), điểm tập kết (cross-docking points), và điểm bán hàng cuối (retailers, dealers, customers). Engine LogiHub tập trung vào tối ưu hoá lớp DC và regional warehouse — gọi chung là "hub".

### 2.2. Facility Location Models

Facility Location Models (mô hình định vị cơ sở) là họ mô hình toán học giải bài toán "đặt cơ sở ở đâu" với các ràng buộc khác nhau. Daskin (2013) trong "Network and Discrete Location" liệt kê hơn 30 biến thể, nhưng ba biến thể được dùng phổ biến nhất là P-median, UFLP, và CFLP.

**P-Median Problem.** Bài toán P-median được Hakimi (1964) đề xuất, có mục tiêu chọn đúng P điểm trong tập ứng viên sao cho tổng khoảng cách có trọng số giữa các điểm nhu cầu và cơ sở phục vụ chúng là nhỏ nhất. Công thức:

$$\min \sum_{i \in I}\sum_{j \in J} h_i \cdot c_{ij} \cdot y_{ij}$$

với ràng buộc tổng số facility mở $\sum_{j} x_j = P$, mỗi điểm nhu cầu được phục vụ bởi đúng một facility $\sum_{j} y_{ij} = 1$, và facility chỉ phục vụ nếu được mở $y_{ij} \le x_j$. Trong đó: $h_i$ là nhu cầu vùng $i$; $c_{ij}$ là khoảng cách hoặc chi phí; $x_j \in \{0,1\}$ biến nhị phân chọn hub $j$; $y_{ij} \in \{0,1\}$ biến nhị phân gán vùng $i$ cho hub $j$.

**Uncapacitated Facility Location Problem (UFLP).** Đề xuất bởi Balinski (1965), UFLP không cố định số facility mở mà tự chọn dựa trên cân bằng giữa **chi phí cố định** của mở facility và **chi phí vận chuyển**. Công thức:

$$\min \sum_{j \in J} f_j \cdot x_j + \sum_{i \in I}\sum_{j \in J} h_i \cdot c_{ij} \cdot y_{ij}$$

với cùng các ràng buộc về assignment như P-median nhưng bỏ ràng buộc số facility cố định. UFLP trả lời câu hỏi: "Có nên mở thêm 1 facility nữa không, biết rằng nó tốn $f_j$ chi phí cố định nhưng giảm chi phí vận chuyển?".

**Capacitated Facility Location Problem (CFLP).** Bổ sung ràng buộc capacity vào UFLP. Mỗi facility $j$ chỉ phục vụ được tối đa $\text{Cap}_j$ đơn vị nhu cầu:

$$\sum_{i \in I} h_i \cdot y_{ij} \le \text{Cap}_j \cdot x_j \quad \forall j$$

CFLP phù hợp khi capacity là ràng buộc cứng (kho có giới hạn diện tích, throughput, dock space). Trong thực tế, CFLP gần với bài toán doanh nghiệp hơn UFLP vì kho nào cũng có giới hạn vật lý.

Cả ba mô hình đều thuộc lớp Mixed Integer Linear Programming (MILP) và có thể giải bằng các solver thương mại (CPLEX, Gurobi) hoặc miễn phí (CBC qua PuLP). Đối với bài toán cỡ 17 vùng × 30-40 hub ứng viên, CBC giải được trong dưới 15 giây.

### 2.3. Freight Origin-Destination Analysis

Freight O/D analysis là phương pháp phân tích dòng vận chuyển hàng hoá giữa các cặp vùng (origin, destination). Khái niệm O/D matrix được sử dụng từ những năm 1950 trong quy hoạch giao thông đô thị, sau đó mở rộng sang vận tải hàng hoá liên vùng (Sheffi, 1985).

Dữ liệu O/D thường được thu thập qua hai cách: (a) **survey trực tiếp** — phỏng vấn doanh nghiệp vận tải, đo đếm tại trạm cân, theo dõi GPS xe tải; (b) **estimation gián tiếp** — từ dữ liệu sản xuất, tiêu thụ, và mô hình hấp dẫn (gravity model). Ở Hàn Quốc, Bộ Giao thông Hàn Quốc (Ministry of Land, Infrastructure and Transport — MOLIT) tổ chức điều tra chính (main survey) 5 năm một lần và cập nhật giữa kỳ (interim update) hàng năm.

O/D matrix là input cốt lõi cho bài toán facility location — nó cung cấp giá trị $h_i$ (nhu cầu vùng $i$). Một số nghiên cứu (Klose & Drexl, 2005) chỉ ra rằng chất lượng O/D quyết định chất lượng output mô hình tối ưu hoá: O/D sai lệch 20% thì kết quả tối ưu hoá có thể chệch khỏi tối ưu thực sự đến 35%.

### 2.4. Warehouse Infrastructure Analysis

Warehouse Infrastructure Analysis nghiên cứu phân bố và đặc điểm các kho hàng đang vận hành tại một quốc gia hoặc vùng. Đây là input bổ sung cho bài toán facility location, đặc biệt khi xét **kho hiện hữu (existing warehouses)** thay cho mở kho mới.

Theo Bowersox và cộng sự (2013), một kho hàng có 5 thuộc tính chính: **vị trí địa lý** (lat/lon), **diện tích** (m²), **công suất** (storage + throughput), **chi phí vận hành** (lease + utilities + labor), và **mức độ tự động hoá**. Nghiên cứu này dùng warehouse registry công khai của Hàn Quốc (cập nhật 2026-05-08) làm nguồn dữ liệu cho candidate hub.

Một khái niệm quan trọng là **demand-warehouse mismatch** — vùng có nhu cầu cao nhưng ít kho (hoặc kho có công suất nhỏ), hoặc ngược lại. Mismatch index được Bok và cộng sự (2019) đề xuất đo bằng tỉ lệ giữa demand share và warehouse capacity share của mỗi vùng. Mismatch chỉ ra cơ hội tối ưu hoá: mở kho mới ở vùng nhu cầu cao và đóng kho thừa ở vùng nhu cầu thấp.

---

## 3. THU THẬP DỮ LIỆU (DATA ACQUISITION)

Nghiên cứu sử dụng 6 nguồn dữ liệu chính, tất cả công khai và đã được tích hợp vào kho dữ liệu của dự án (`logistics_hub_research/data_raw/` và `data_processed/`).

### 3.1. Korean Freight O/D 2022 Main Survey

Nguồn: Bộ Giao thông Hàn Quốc (MOLIT). File gốc: `배포용 (기준년도 2022년) 화물물동량OD_2026.04.06.xlsx` (sheet tiếng Hàn). Dữ liệu này là kết quả điều tra chính 2022 — thu thập qua phỏng vấn 12,000+ doanh nghiệp vận tải và đo đếm tại 250+ trạm cân. Phạm vi: vận chuyển liên vùng nội địa Hàn Quốc, đơn vị tấn/năm.

Schema sau xử lý:

| Cột | Kiểu | Mô tả |
| --- | --- | --- |
| origin_code | str | Mã vùng đi (theo Korean administrative codes) |
| destination_code | str | Mã vùng đến |
| volume_ton | float | Lượng hàng (tấn/năm) |
| year | int | 2022 |

### 3.2. Korean Freight O/D 2024 Update

Nguồn: MOLIT. File: `배포용 장래년도(2025-2050) 도로 전체 물동량OD_2024.12.20.xlsx`. Đây là bản cập nhật giữa kỳ năm 2024 với projection đến 2050. Nghiên cứu dùng phần baseline 2023 đã được clean lưu trong `od_clean_long_2023.csv` để có dữ liệu mới nhất.

### 3.3. Road Transport Performance Data

Nguồn: Korea Transportation Database. Cung cấp các chỉ số: khoảng cách đường bộ giữa các cặp vùng, tốc độ trung bình, thời gian di chuyển dự kiến, độ tin cậy (reliability percentage). Được dùng để tính ma trận khoảng cách $c_{ij}$ chính xác hơn so với khoảng cách haversine thuần tuý.

### 3.4. Warehouse Registration Data

Nguồn: Korea Logistics Association — bộ đăng ký kho công nghiệp. File gốc: `물류창고정보_260508.xls`. Dữ liệu chứa thông tin của 12,847 kho công nghiệp đã đăng ký toàn quốc. Nghiên cứu lọc và geocode các kho có quy mô lớn (≥ 5,000 m²) lưu trong `warehouse_geocoded.csv`. Cộng với bảng tổng hợp công suất theo 17 vùng `warehouse_capacity_17_regions.csv`.

Schema:

| Cột | Mô tả |
| --- | --- |
| warehouse_id | Mã kho duy nhất |
| name | Tên kho |
| region | Vùng hành chính (1 trong 17) |
| lat, lon | Toạ độ địa lý |
| area_m2 | Diện tích (m²) |
| capacity_pallet | Công suất (số pallet) |
| fixed_cost_usd | Chi phí cố định ước tính (USD/năm) |

### 3.5. Optional: Freight Market Reports 2025

Nguồn: Korea Logistics Institute, báo cáo thị trường vận tải hàng năm. Cung cấp các chỉ số bổ sung: giá cước vận tải trung bình theo loại hàng, tỉ lệ tăng trưởng theo phân khúc, dự báo nhu cầu. Nghiên cứu dùng làm nguồn cho **hệ số benchmark ngành** (xem Cost Engine Reference).

### 3.6. GIS / Coordinates / Administrative Boundaries

Nguồn: Statistics Korea (KOSTAT) và Open Data Portal. Cung cấp ranh giới hành chính 17 vùng và 250 đơn vị si/gun/gu, toạ độ trung tâm vùng (centroid). Nghiên cứu dùng centroid 17 vùng làm proxy cho vị trí điểm nhu cầu khi tính khoảng cách.

---

## 4. TIỀN XỬ LÝ DỮ LIỆU (DATA PREPROCESSING)

Dữ liệu thô có nhiều vấn đề cần xử lý trước khi đưa vào mô hình. Nghiên cứu thực hiện 5 bước chính.

### 4.1. Chuẩn hoá tên vùng

Dữ liệu thô có 3 dạng đặt tên: tên tiếng Hàn ("수원시, 경기도"), tên tiếng Anh đầy đủ ("Suwon-si, Gyeonggi-do"), và tên tiếng Anh ngắn ("Suwon"). Để xử lý nhất quán, nghiên cứu xây dựng bảng `REGION_MASTER` ánh xạ tất cả về 17 tên chuẩn (Seoul, Gyeonggi, Incheon, Busan, Daegu, Daejeon, Gwangju, Ulsan, Sejong, Gangwon, Chungbuk, Chungnam, Jeonbuk, Jeonnam, Gyeongbuk, Gyeongnam, Jeju). Mỗi vùng có toạ độ centroid kèm theo.

Sau bước này, mọi shipment record có cùng định dạng vùng, không có duplicate do tên khác nhau.

### 4.2. Làm sạch missing và duplicate

Bước này bao gồm: loại các row có volume = 0 hoặc null, gộp các row trùng (origin, destination, year) bằng cách cộng volume, kiểm tra symmetry (lượng A→B và B→A phải hợp lý không quá lệch). Khoảng 2.1% record bị loại do missing destination_zone.

### 4.3. Geocoding vị trí kho

Warehouse registry gốc chỉ có địa chỉ tiếng Hàn, không có lat/lon. Nghiên cứu dùng dịch vụ geocoding (Google Maps API hoặc Nominatim) để chuyển địa chỉ thành toạ độ. 4 dealer mới (đăng ký 2026) chưa kịp geocode đầy đủ — fallback dùng region centroid.

Tỷ lệ geocode thành công: 97.9% kho được geocode chính xác đến cấp si/gun/gu.

### 4.4. Chuẩn hoá đơn vị volume

Dữ liệu thô có nhiều đơn vị: tấn, kg, mét khối (CBM), số pallet, số chuyến hàng. Nghiên cứu chuẩn về một đơn vị duy nhất: **tấn (ton)**. Bảng quy đổi sử dụng:

| Đơn vị gốc | Hệ số quy đổi sang tấn |
| --- | --- |
| 1 kg | 0.001 |
| 1 pallet (electronics-mix) | ≈ 0.8 |
| 1 CBM (mixed cargo) | ≈ 0.3 |
| 1 box (small electronics) | ≈ 0.025 |
| 1 shipment-equivalent | tuỳ ngành, dùng heuristic |

### 4.5. Tạo dataset phân tích

Bước cuối tổng hợp tất cả dữ liệu đã clean thành 5 dataset chính dùng cho phân tích:

| Dataset | Mô tả | Số dòng |
| --- | --- | ---: |
| `clean_od.csv` | O/D đã clean format long | ~280 |
| `clean_warehouse.csv` | Warehouse đã geocode | ~5,200 |
| `regional_demand.csv` | Demand 17 vùng | 17 |
| `warehouse_capacity_17_regions.csv` | Capacity tổng theo vùng | 17 |
| `top_corridors_17_2023.csv` | Top corridors | 20 |

---

## 5. PHÂN TÍCH MÔ TẢ (DESCRIPTIVE ANALYTICS)

### 5.1. Vùng có demand outbound cao nhất (Top origin regions)

| Hạng | Vùng | Volume outbound (k tấn/năm) | % toàn quốc |
| --- | --- | ---: | ---: |
| 1 | Gyeonggi | 13,420 | 18.2% |
| 2 | Gyeongnam | 9,180 | 12.4% |
| 3 | Chungnam | 7,650 | 10.4% |
| 4 | Gyeongbuk | 6,820 | 9.2% |
| 5 | Jeonnam | 6,540 | 8.9% |

Diễn giải: Gyeonggi đứng đầu vì cụm sản xuất công nghiệp + cảng Incheon. Gyeongnam và Chungnam tiếp theo do là cụm nhà máy ô tô (Hyundai-Ulsan, Kia-Hwaseong) và hoá dầu. Đông Nam và Tây Nam có tỉ trọng outbound lớn — đây là khu vực **sản xuất** chính của Hàn Quốc.

### 5.2. Vùng có demand inbound cao nhất (Top destination regions)

| Hạng | Vùng | Volume inbound (k tấn/năm) | % toàn quốc |
| --- | --- | ---: | ---: |
| 1 | Gyeonggi | 14,890 | 20.1% |
| 2 | Seoul | 8,420 | 11.4% |
| 3 | Busan | 6,750 | 9.1% |
| 4 | Gyeongnam | 5,820 | 7.9% |
| 5 | Daegu | 4,650 | 6.3% |

Diễn giải: Inbound cao nhất ở các vùng đô thị (Seoul, Gyeonggi, Busan) — đây là khu vực **tiêu thụ**. Gyeonggi vừa là origin vừa là destination lớn nhất, phản ánh tính chất "vùng tổ hợp" — vừa sản xuất vừa tiêu thụ và trung chuyển.

### 5.3. Top O/D corridors

| Hạng | Origin → Destination | Volume (k tấn/năm) | % tổng |
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

Top 10 corridor chiếm ~38% tổng volume cả nước. Hành lang tải lớn nhất là **Gyeonggi ↔ Seoul** (cụm metro), tiếp theo là **Chungnam ↔ Gyeonggi** (cụm công nghiệp Asan-Cheonan tới metro), và **Gyeongnam ↔ Busan** (sản xuất tới cảng).

### 5.4. Mật độ kho theo vùng (Warehouse density by region)

| Vùng | Số kho ≥ 5,000 m² | Tổng diện tích (km²) | Capacity (k pallets) |
| --- | ---: | ---: | ---: |
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

### 5.5. Demand-warehouse mismatch

Tính mismatch index = (% inbound demand) / (% warehouse capacity). Index > 1 nghĩa là vùng có nhu cầu cao hơn capacity — cần thêm kho. Index < 1 nghĩa là vùng dư capacity — có thể đóng bớt hoặc tái phân bổ.

| Vùng | % Demand | % Capacity | Mismatch index | Diễn giải |
| --- | ---: | ---: | ---: | --- |
| Seoul | 11.4% | 5.4% | **2.11** | Thiếu kho mạnh |
| Daegu | 6.3% | 4.7% | 1.34 | Hơi thiếu |
| Gangwon | 2.5% | 1.5% | 1.67 | Vùng thưa, distance dài |
| Gyeonggi | 20.1% | 29.6% | 0.68 | Thừa capacity |
| Chungnam | 5.8% | 9.4% | 0.62 | Thừa capacity |
| Jeju | 1.4% | 0.5% | **2.80** | Thiếu kho rất mạnh, đảo |

Diễn giải quan trọng: mismatch lớn nhất ở **Seoul** (2.11) và **Jeju** (2.80). Seoul là vùng đô thị đắt đỏ — kho thường được đẩy ra Gyeonggi. Jeju là đảo, bị surcharge phà cao nên ít kho. Hai vùng này là cơ hội tối ưu hoá mạnh nhất khi triển khai mạng lưới mới.

---

## 6. XÂY DỰNG MÔ HÌNH NGHIÊN CỨU (RESEARCH MODEL CONSTRUCTION)

### 6.1. Ước lượng nhu cầu (Demand Estimation)

Định nghĩa $h_i$ là tổng nhu cầu logistics của vùng $i$, tính bằng tổng inbound + outbound:

$$h_i = D^{in}_i + D^{out}_i = \sum_{o \in I} \text{OD}_{o,i} + \sum_{d \in I} \text{OD}_{i,d}$$

Đối với bài toán phân phối từ trung tâm đi (warehouse → customer), nghiên cứu ưu tiên dùng **inbound demand** vì nó phản ánh nhu cầu tiêu thụ của vùng. Đối với bài toán thu gom (collection), dùng outbound.

Bảng nhu cầu 17 vùng (đơn vị: nghìn tấn/năm, dùng inbound):

| Vùng | $h_i$ (k tấn/năm) | Index (toàn quốc = 100) |
| --- | ---: | ---: |
| Gyeonggi | 14,890 | 100 (ref) |
| Seoul | 8,420 | 57 |
| Busan | 6,750 | 45 |
| Gyeongnam | 5,820 | 39 |
| Daegu | 4,650 | 31 |
| ... (đầy đủ 17 dòng) | | |

### 6.2. Sinh ứng viên hub (Candidate Hub Generation)

Nghiên cứu xét hai cấp độ ứng viên:

**Cấp 1 — Region-level candidates:** Mỗi vùng trong 17 vùng được coi là 1 ứng viên hub với toạ độ centroid và capacity = tổng capacity tất cả kho trong vùng đó. Đây là cấp **chiến lược** — trả lời câu hỏi "hub đặt ở vùng nào".

**Cấp 2 — Warehouse-level candidates:** Mỗi kho cụ thể (≥ 5,000 m²) trong warehouse registry là 1 ứng viên với capacity riêng. Tổng có ~5,200 ứng viên. Đây là cấp **chiến thuật** — trả lời câu hỏi "đặt ở chính xác kho nào trong vùng đã chọn".

Nghiên cứu này tập trung vào **cấp region-level** (17 ứng viên) cho đơn giản và để khớp với granularity của Freight O/D data.

### 6.3. Ma trận khoảng cách / chi phí (Distance / Cost Matrix)

Định nghĩa $c_{ij}$ là chi phí vận chuyển một đơn vị nhu cầu từ vùng $i$ đến hub $j$. Có hai cách tính:

**Cách 1 — Khoảng cách thuần (haversine):**

**[EN] Distance / Cost Matrix**

**Method 1 — Haversine distance:**

$$d_{ij} = R \cdot 2 \cdot \arcsin\sqrt{\sin^2\!\left(\frac{\Delta\phi}{2}\right) + \cos\phi_i \cos\phi_j \sin^2\!\left(\frac{\Delta\lambda}{2}\right)}$$

where $R = 6{,}371$ km, $\phi$ = latitude, $\lambda$ = longitude.

**Method 2 — Transport cost:**

$$c_{ij} = d_{ij} \cdot \text{rate}_{\text{transport}} \cdot (1 + \text{surcharge}_{ij})$$

Average rate: 0.10 USD/ton-km for general cargo. Surcharges: long-haul > 300 km +8%, Jeju island +35%.

**[KO] 거리/비용 행렬**

**방법 1 — 하버사인 거리:**

$$d_{ij} = R \cdot 2 \cdot \arcsin\sqrt{\sin^2\!\left(\frac{\Delta\phi}{2}\right) + \cos\phi_i \cos\phi_j \sin^2\!\left(\frac{\Delta\lambda}{2}\right)}$$

$R = 6{,}371$ km, $\phi$ = 위도, $\lambda$ = 경도.

**방법 2 — 운송 비용:**

$$c_{ij} = d_{ij} \cdot \text{운송요율} \cdot (1 + \text{할증료}_{ij})$$

일반 화물 평균 요율: 톤-km당 0.10 USD. 할증료: 장거리(> 300 km) +8%, 제주도(도서) +35%.


$$d_{ij} = R \cdot 2 \cdot \arcsin\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_i \cos\phi_j \sin^2\left(\frac{\Delta\lambda}{2}\right)}$$

với $R = 6371$ km (bán kính Trái Đất), $\phi$ là vĩ độ, $\lambda$ là kinh độ.

**Cách 2 — Chi phí vận chuyển:**

$$c_{ij} = d_{ij} \cdot \text{rate}_{\text{transport}} \cdot (1 + \text{surcharge}_{ij})$$

Nghiên cứu dùng rate trung bình ngành 0.10 USD/tấn-km cho hàng general cargo, với các surcharge: long-haul > 300km +8%, đảo Jeju +35%.

Ma trận $c_{ij}$ đầy đủ 17×17 = 289 entries. Một số ví dụ:

| Origin → Destination | Distance (km) | Cost (USD/tấn) |
| --- | ---: | ---: |
| Seoul → Busan | 325 | 35.10 |
| Gyeonggi → Daejeon | 145 | 14.50 |
| Gwangju → Jeju (qua phà) | 320 | 43.20 |
| Daegu → Gyeongbuk | 65 | 6.50 |

### 6.4. Chi phí cố định và công suất (Fixed Cost / Capacity)

**Fixed cost $f_j$** — chi phí cố định hàng năm khi mở hub $j$. Được estimate từ:

$$f_j = \text{base\_rent} \cdot \text{area}_j + \text{operations}_j + \text{security}_j + \text{system}_j$$

Trong đó base_rent dao động 50-300 USD/m²/năm tuỳ vùng (Seoul cao nhất, Jeolla thấp nhất), operations ≈ 30% base rent, security 5-15%, system 10-20%.

Bảng $f_j$ benchmark cho hub vùng quy mô ~22,000 m²:

| Vùng | Base rent ($/m²) | $f_j$ (USD/năm) |
| --- | ---: | ---: |
| Seoul | 280 | 8,500,000 |
| Gyeonggi | 180 | 6,800,000 |
| Busan | 150 | 5,800,000 |
| Daejeon | 130 | 5,400,000 |
| Gwangju | 90 | 4,200,000 |
| Jeonnam | 70 | 3,600,000 |
| ... | | |

**Capacity $\text{Cap}_j$** — công suất tối đa hub $j$ phục vụ được trong một năm. Đo bằng tấn/năm. Tính từ:

$$\text{Cap}_j = \text{area}_j \cdot \text{throughput\_per\_m2}$$

với throughput trung bình ngành ~25 tấn/m²/năm cho hàng mixed. Hub vùng chuẩn 22,000 m² → Cap = 550,000 tấn/năm.

---

## 7. CÁC MÔ HÌNH TỐI ƯU HOÁ (OPTIMIZATION MODELS)

### 7.1. P-Median Model

**Phát biểu:**

$$\min \sum_{i \in I}\sum_{j \in J} h_i \cdot c_{ij} \cdot y_{ij}$$

s.t.

$$\sum_{j \in J} x_j = P$$

$$\sum_{j \in J} y_{ij} = 1, \quad \forall i \in I$$

$$y_{ij} \le x_j, \quad \forall i \in I, j \in J$$

$$x_j, y_{ij} \in \{0, 1\}$$

**Khi nào dùng:** doanh nghiệp đã biết trước số hub muốn mở (P) và muốn tìm vị trí tốt nhất. Ví dụ: "Chúng tôi có ngân sách cho 5 kho — đặt ở đâu là tốt nhất?".

**Implementation:** Bằng PuLP với CBC solver. Code:

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

### 7.2. UFLP Model

**Phát biểu:**

$$\min \sum_{j \in J} f_j \cdot x_j + \sum_{i \in I}\sum_{j \in J} h_i \cdot c_{ij} \cdot y_{ij}$$

s.t. cùng các ràng buộc assignment như P-median nhưng **bỏ ràng buộc số hub cố định**.

**Khi nào dùng:** doanh nghiệp chưa quyết định số hub, muốn để mô hình tự cân bằng giữa fixed cost và transport cost. Ví dụ: "Mỗi hub mở thì tốn 5 triệu USD/năm — có nên mở thêm hub thứ 6 không?".

UFLP thường ra số hub thấp hơn nếu fixed cost cao tương đối so với savings từ transport. Sensitivity analysis trên $f_j$ giúp hiểu trade-off.

### 7.3. CFLP Model

**Phát biểu:** UFLP có thêm capacity constraint:

$$\sum_{i \in I} h_i \cdot z_{ij} \le \text{Cap}_j \cdot x_j, \quad \forall j$$

trong đó $z_{ij}$ là **biến luồng liên tục** (lượng demand từ vùng $i$ được phục vụ bởi hub $j$) thay cho biến nhị phân $y_{ij}$ — vì khi có capacity, một vùng có thể được phục vụ bởi nhiều hub:

$$\sum_{j \in J} z_{ij} = h_i, \quad \forall i$$

**Khi nào dùng:** khi capacity là ràng buộc cứng. Ví dụ: "Suwon DC chỉ có throughput 480k tấn/năm — không thể nhồi thêm".

CFLP thường ra số hub cao hơn UFLP vì cần phân tải. Cũng phản ánh thực tế sát hơn — không có hub nào "vô hạn".

---

## 8. THIẾT KẾ KỊCH BẢN (SCENARIO DESIGN)

Để trả lời SQ4 (số lượng hub tối ưu), nghiên cứu thiết kế 5 kịch bản chính + 1 sensitivity analysis:

### 8.1. Kịch bản P = 3, 5, 7 hub (P-Median)

Chạy P-median với P = {3, 5, 7} để xem cost giảm như thế nào khi thêm hub. Bảng kết quả ở Section 9.3.

### 8.2. Current network vs optimized

So sánh **mạng hiện tại** (giả định 3 hub lớn nhất theo capacity: Gyeonggi, Gumi/Gyeongbuk, Busan) với **mạng tối ưu** từ P-median P = 5 và CFLP.

### 8.3. Capacity-constrained scenario (CFLP)

Chạy CFLP với capacity thực từ warehouse registry. Kiểm tra xem 5 hub tối ưu có đủ capacity không, hay cần điều chỉnh.

### 8.4. Existing warehouses only

Hạn chế tập ứng viên về **chỉ kho hiện hữu** trong registry (không xét kho mới). Đây là kịch bản thực tế cho doanh nghiệp không muốn xây kho mới — chỉ tái phân bổ.

### 8.5. Sensitivity analysis

Thay đổi 4 tham số then chốt và xem kết quả thay đổi:

| Tham số | Range thử | Mục đích |
| --- | --- | --- |
| Fixed cost $f_j$ | ±30% | Test độ nhạy với chi phí kho |
| Transport rate | ±15% | Test với thay đổi giá xăng |
| Demand $h_i$ | +20% (stress) | Test với tăng trưởng nhu cầu |
| Capacity $\text{Cap}_j$ | -20% (stress) | Test khi kho bị giới hạn |

---

## 9. GIẢI MÔ HÌNH (MODEL SOLVING)

Tất cả kịch bản chạy bằng PuLP với CBC solver, time limit 15 giây mỗi run, gap rel 5%. Tổng runtime cho 5 kịch bản chính: ~45 giây.

### 9.1. Hub được chọn (Selected hubs)

| Kịch bản | Hub được mở |
| --- | --- |
| P-Median P=3 | Gyeonggi, Daegu, Gwangju |
| P-Median P=5 | **Gyeonggi, Daejeon, Daegu, Gwangju, Busan** |
| P-Median P=7 | Gyeonggi, Daejeon, Daegu, Gwangju, Busan, Chungnam, Gangwon |
| UFLP | Gyeonggi, Daejeon, Busan, Gwangju (4 hub tự chọn) |
| CFLP | Gyeonggi, Daejeon, Daegu, Gwangju, Busan (5 hub) |
| Current (S0) | Gyeonggi, Gyeongbuk (Gumi), Busan |

Diễn giải: 5 vùng xuất hiện trong mọi kịch bản tối ưu là **Gyeonggi, Daejeon, Daegu, Gwangju, Busan** — đây là "core 5". UFLP cắt còn 4 do fixed cost cao tương đối. CFLP giữ 5 do cần đủ capacity.

### 9.2. Phân bổ nhu cầu (Demand allocation) — Kịch bản P-Median P=5

| Vùng | Hub được gán | Distance (km) | Demand allocated (k tấn) |
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
| Jeju | Gwangju (qua phà) | 320 | 920 |
| Busan | Busan | 0 | 6,750 |
| Gyeongnam | Busan | 95 | 5,820 |
| Ulsan | Busan | 70 | 2,950 |

### 9.3. Giá trị hàm mục tiêu (Objective value)

| Kịch bản | Total cost (USD/năm) | Cost index (P=3 = 100) |
| --- | ---: | ---: |
| Current (S0, 3 hub) | 142,500,000 | 100 |
| P-Median P=3 | 124,800,000 | 87.6 |
| **P-Median P=5** | **108,300,000** | **76.0** |
| P-Median P=7 | 105,700,000 | 74.2 |
| UFLP (auto 4 hub) | 113,200,000 | 79.4 |
| CFLP (5 hub w/ cap) | 110,800,000 | 77.8 |

### 9.4. Cost / coverage / utilization

**Coverage** (tỉ lệ demand được phục vụ trong bán kính 200km):

| Kịch bản | Coverage % |
| --- | ---: |
| Current (S0) | 78.4% |
| P-Median P=3 | 81.2% |
| P-Median P=5 | **96.4%** |
| P-Median P=7 | 98.1% |
| UFLP | 89.5% |
| CFLP | 96.4% |

**Utilization** (tỉ lệ sử dụng capacity của các hub được chọn):

| Kịch bản | Util tb | Util max | Util min |
| --- | ---: | ---: | ---: |
| Current (S0) | 92% | 138% (Gyeonggi) | 60% (Busan) |
| P-Median P=5 | 73% | 91% (Gyeonggi) | 58% (Daegu) |
| CFLP P=5 | 78% | 88% (Gyeonggi) | 65% (Daejeon) |

Diễn giải: Mạng hiện tại có Gyeonggi quá tải kinh niên (138%). Mạng tối ưu P=5 cân bằng utilization tốt hơn nhiều, không có hub nào > 91%.

---

## 10. DIỄN GIẢI KẾT QUẢ (RESULT INTERPRETATION)

### 10.1. Hub nào tối ưu?

5 hub tối ưu theo P-Median P=5 và CFLP là **Gyeonggi, Daejeon, Daegu, Gwangju, Busan**. Đây là 5 vùng đồng thuận xuất hiện ở mọi mô hình.

### 10.2. Tại sao 5 hub này được chọn?

**Gyeonggi** — vùng demand lớn nhất (20.1% inbound toàn quốc), có capacity hạ tầng sẵn. Bắt buộc phải có.

**Daejeon** — vị trí địa lý trung tâm, là điểm tối ưu để phục vụ cụm vùng trung tâm (Sejong, Chungbuk, Chungnam, Gangwon) mà không phải đi qua Gyeonggi. Giảm long-haul đáng kể.

**Daegu** — đại diện cụm Đông Nam (Daegu + Gyeongbuk). Khoảng cách ngắn đến cụm sản xuất Gumi.

**Gwangju** — đại diện Tây Nam (Gwangju + Jeolla). Bắt buộc vì cụm Tây Nam quá xa nếu phục vụ từ Gyeonggi (320km+).

**Busan** — đại diện Nam (Busan + Gyeongnam + Ulsan). Có cảng cho xuất nhập khẩu, cụm công nghiệp lớn.

### 10.3. Mỗi hub phục vụ vùng nào?

| Hub | Vùng phục vụ | Tổng demand allocated (k tấn) |
| --- | --- | ---: |
| Gyeonggi | Seoul, Gyeonggi, Incheon | 27,520 |
| Daejeon | Daejeon, Sejong, Chungbuk, Chungnam, Gangwon | 12,270 |
| Daegu | Daegu, Gyeongbuk | 8,470 |
| Gwangju | Gwangju, Jeonbuk, Jeonnam, Jeju | 8,590 |
| Busan | Busan, Gyeongnam, Ulsan | 15,520 |

Tổng allocated = 72,370 k tấn = tổng demand 17 vùng (verification pass).

### 10.4. Trade-offs giữa các kịch bản

**P=3 vs P=5:** Tăng từ 3 lên 5 hub giảm cost 12.4% (124.8M → 108.3M USD/năm) nhưng tăng fixed cost ~10M USD/năm (do 2 hub thêm). Coverage tăng mạnh từ 81% lên 96%. **Net benefit dương rõ rệt.**

**P=5 vs P=7:** Tăng từ 5 lên 7 hub chỉ giảm cost 2.4% (108.3M → 105.7M) nhưng tăng fixed cost ~10M. **Net benefit âm hoặc gần 0.** 5 là sweet spot.

**UFLP (4 hub) vs P=5:** UFLP rẻ hơn về tổng cost nhưng coverage chỉ 89.5% so với 96.4% — 4 hub không phục vụ đủ Tây Nam và Đông Nam. **Trade-off cost vs service.**

**CFLP vs P=5:** CFLP gần như giống P=5 về kết quả nhưng utilization cân bằng hơn (max 88% thay vì 91%). **CFLP an toàn hơn về capacity risk.**

---

## 11. THẢO LUẬN (DISCUSSION)

### 11.1. Hệ quả quản trị (Managerial implications)

Đối với các doanh nghiệp lớn có hoạt động phân phối toàn Hàn Quốc (Samsung, LG, Hyundai, CJ), kết quả nghiên cứu cho thấy **mạng 5-hub là cấu hình tối ưu** ở mức chiến lược. Hub nên đặt ở 5 cụm vùng: metro (Gyeonggi), trung tâm (Daejeon), Đông Nam (Daegu), Tây Nam (Gwangju), Nam (Busan).

Doanh nghiệp đang vận hành mạng 3-hub (production-adjacent) thường gặp 3 vấn đề: hub metro quá tải, long-haul cao đến Tây Nam và Nam, phục vụ vùng Trung tâm và Gangwon kém. Cải thiện chính: tách hub Trung tâm thành node riêng (Daejeon) và mở thêm node Tây Nam (Gwangju).

Đối với doanh nghiệp có yêu cầu logistics đặc thù theo dòng sản phẩm (như Samsung với 4 dòng: chip, mobile, gia dụng, phụ tùng), nên cân nhắc bổ sung thêm 1 secure node cho dòng giá trị cao — tạo thành mạng **6-node hybrid** thay vì 5-node thuần (xem `Outcome_Sample_Samsung_Mobile_10Models.md` để tham khảo case 5-node tách theo vòng đời sản phẩm).

### 11.2. Hệ quả chính sách (Policy implications)

Đối với chính phủ Hàn Quốc, kết quả nghiên cứu gợi ý:

Một là **đầu tư hạ tầng logistics tại Daejeon, Gwangju cao hơn hiện tại**. Hai vùng này đang underused (mismatch index < 1 cho Chungnam, gần 1 cho Jeolla) trong khi vai trò chiến lược là rõ ràng. Đầu tư hạ tầng đường bộ + kho công nghiệp ở 2 vùng này tạo điều kiện cho doanh nghiệp triển khai mạng 5-hub.

Hai là **cải thiện kết nối Mainland - Jeju**. Mismatch index của Jeju là 2.80 — cao nhất cả nước. Đây là dấu hiệu Jeju đang phục vụ kém về logistics, ảnh hưởng đến kinh tế đảo. Chính sách trợ giá phà hoặc hạ tầng cảng có thể giảm surcharge.

Ba là **cập nhật Freight O/D Survey thường xuyên hơn**. Hiện tại 5 năm/lần hơi chậm với tốc độ thay đổi của ngành logistics (e-commerce growth, EV truck, etc.). 2-3 năm/lần sẽ phù hợp hơn.

### 11.3. Hạn chế của nghiên cứu (Research limitations)

**Hạn chế 1 — Dùng O/D công khai làm proxy.** Dữ liệu Korean Freight O/D không phân biệt theo doanh nghiệp hay theo dòng sản phẩm cụ thể. Khi doanh nghiệp dùng thật, cần feed shipment data nội bộ để có kết quả chính xác. Sai số ước tính ±20-40% so với production engine có data thật.

**Hạn chế 2 — Hệ số chi phí là benchmark ngành.** Rate vận chuyển 0.10 USD/tấn-km, fixed cost benchmark theo loại hub, holding cost percentage theo dòng sản phẩm — tất cả đều từ literature ngành chứ không phải hợp đồng thực tế. Sai số ±20-40%.

**Hạn chế 3 — Chỉ xét cấp 17 vùng.** Granularity 17 vùng đủ cho quyết định chiến lược nhưng không đủ cho chiến thuật (ví dụ chọn kho cụ thể trong vùng). Nghiên cứu tiếp theo cần xét cấp 250 si/gun/gu hoặc thậm chí cấp district trong vùng đô thị.

**Hạn chế 4 — Mô hình tĩnh, không xét động học.** P-median, UFLP, CFLP đều là mô hình quyết định một lần. Thực tế doanh nghiệp triển khai theo nhiều giai đoạn, có cập nhật khi nhu cầu thay đổi. Mô hình động (multi-period) sẽ phù hợp hơn cho roadmap dài hạn.

**Hạn chế 5 — Không xét rủi ro / disruption.** Nghiên cứu giả định mạng vận hành ổn định. Thực tế có rủi ro: thiên tai, đình công, đóng cửa cảng. Mô hình stochastic / robust optimization phù hợp hơn cho phân tích rủi ro.

### 11.4. Hướng nghiên cứu tiếp theo (Future research directions)

**Hướng 1 — Chuyển từ proxy engine sang production engine.** Pilot với 1-2 doanh nghiệp Hàn Quốc hoặc Việt Nam thật, ký NDA, xin shipment data nội bộ, chạy engine, đối chứng kết quả với mạng hiện tại của họ.

**Hướng 2 — Mở rộng sang multi-period và stochastic.** Bổ sung chiều thời gian (5 năm) và biến cố ngẫu nhiên (demand uncertainty, transport disruption). Mô hình MILP biến thành Stochastic MILP — phức tạp hơn nhưng phản ánh thực tế tốt hơn.

**Hướng 3 — Tích hợp inventory decisions.** Hiện tại chỉ tối ưu vị trí hub. Mở rộng sang đồng thời tối ưu vị trí + inventory level tại mỗi hub (joint location-inventory model — Daskin et al., 2002).

**Hướng 4 — Multi-product với vòng đời.** Như case Samsung Mobile cho thấy, mạng tối ưu phụ thuộc vào vòng đời sản phẩm (launch / steady / phase-out). Nghiên cứu tiếp theo có thể formal hoá biến thời gian của vòng đời vào mô hình.

**Hướng 5 — Kết hợp last-mile delivery.** Mô hình hiện tại dừng ở hub-to-region. Mở rộng đến hub-to-customer cuối (last-mile) sẽ phù hợp hơn cho e-commerce. Đây là bài toán Vehicle Routing Problem (VRP) lồng vào Facility Location.

**Hướng 6 — Áp dụng machine learning.** Dùng ML để dự báo demand thay vì giả định stationary, dùng reinforcement learning để học chính sách điều phối real-time.

---

## 12. KẾT LUẬN (CONCLUSION)

Nghiên cứu này đã xây dựng thành công một engine phân tích và tối ưu hoá mạng lưới kho hàng cho doanh nghiệp lớn tại Hàn Quốc, dựa trên dữ liệu Freight O/D công khai làm proxy cho data nội bộ doanh nghiệp. Engine gồm 10 module xử lý nối tiếp, áp dụng ba mô hình tối ưu hoá kinh điển (P-median, UFLP, CFLP) và chạy 5 kịch bản chính cộng sensitivity analysis.

**[EN] 12. CONCLUSION**

This study successfully developed an analytical and optimization engine for Korean logistics hub networks using public Freight O/D data as a proxy. The 10-module engine applies P-median, UFLP, and CFLP across 5 scenarios.

**Key result: the 5-hub network is strategically optimal.** The 5 optimal hubs are **Gyeonggi, Daejeon, Daegu, Gwangju, and Busan**. This reduces logistics costs ~24% vs. the 3-hub baseline (USD 108.3M vs. 142.5M/yr) and raises 200 km coverage from 78% to 96%. Expanding to 7 hubs saves only 2.4% more—insufficient to offset added fixed costs—confirming 5 as the sweet spot.

The engine can be reused for specific enterprises by substituting internal shipment data without changing architecture or code, making it a core asset for future SaaS commercialization.

**[KO] 12. 결론**

본 연구는 공개 화물 O/D 데이터를 대리값으로 활용하여 한국 물류 허브 네트워크 분석·최적화 엔진을 성공적으로 구축하였다. 10개 모듈 엔진이 5개 시나리오에서 P-중앙값, UFLP, CFLP를 적용한다.

**핵심 결과: 5-허브 네트워크가 전략적 최적 구성이다.** 5개 최적 허브는 **경기, 대전, 대구, 광주, 부산**이다. 이는 기존 3-허브 대비 물류 비용을 약 24% 절감(연간 1억 830만 달러 vs. 1억 4,250만 달러)하고 반경 200 km 서비스율을 78%에서 96%로 향상시킨다. 7-허브로 확장 시 추가 절감은 2.4%에 불과하여 고정 비용 증가를 상쇄하지 못하므로 5개가 최적점임을 확인하였다.

엔진은 아키텍처와 코드를 변경하지 않고 내부 물류 데이터를 입력하는 것만으로 특정 기업에 재활용할 수 있어 향후 SaaS 상용화의 핵심 자산이 된다.


Kết quả chính: **mạng 5-hub là cấu hình tối ưu** ở mức chiến lược cho doanh nghiệp lớn tại Hàn Quốc. 5 hub tối ưu là **Gyeonggi, Daejeon, Daegu, Gwangju, Busan**. Mạng này giảm chi phí logistics khoảng 24% so với mạng 3-hub hiện tại (108.3M USD/năm so với 142.5M USD/năm) và nâng coverage trong bán kính 200km từ 78% lên 96%. Tăng từ 5 lên 7 hub chỉ giảm cost thêm 2.4% — không bù được fixed cost — nên 5 là sweet spot.

Engine này có thể tái sử dụng cho các doanh nghiệp cụ thể bằng cách feed shipment data nội bộ thay cho proxy data, không cần thay đổi kiến trúc hay code. Đây là tài sản cốt lõi cho việc thương mại hoá thành sản phẩm SaaS trong tương lai.

Đóng góp chính của nghiên cứu là (1) **demonstrate kiến trúc engine 10 module** từ data ingestion đến outcome generation hoạt động end-to-end trên Korean Freight O/D thật, (2) **so sánh có hệ thống 5 kịch bản** với 3 trục cost-coverage-utilization, (3) **xây dựng template outcome 16 mục** mô phỏng output cấp senior supply chain manager, và (4) **xác định lộ trình production engine** trong 7-8 tháng sau nghiên cứu này.

Hạn chế chính của nghiên cứu nằm ở việc dùng proxy data và hệ số benchmark ngành. Hướng tiếp theo là pilot với doanh nghiệp thật, mở rộng sang multi-period stochastic model, và tích hợp inventory + last-mile vào mô hình.

LogiHub Intelligence với engine này có tiềm năng trở thành công cụ quyết định mạng lưới logistics cho doanh nghiệp lớn tại Hàn Quốc và mở rộng ra Đông Nam Á.

---

## TÀI LIỆU THAM KHẢO

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

## PHỤ LỤC A — JSON CONTRACT SCHEMA

(Xem file `engine_contract.schema.json` và mục 13 của tài liệu `LogiHub_Engine_v2_Redesign.md`)

## PHỤ LỤC B — SAMPLE CSV OUTPUT

(Xem các file trong `output/tables/`: `regional_demand.csv`, `od_matrix_17_region.csv`, `top_od_lanes.csv`, `scenario_comparison.csv`)

## PHỤ LỤC C — OUTCOME MARKDOWN MẪU

(Xem file `outcome_sample_full.md` — bản phân tích 12-15 trang sinh tự động bởi engine)

## PHỤ LỤC D — CODE BASE

Repository: `logihub_application_code/backend/engine/` với 17 file Python module. Chi tiết kiến trúc trong `LogiHub_Engine_v2_Redesign.md`.

## PHỤ LỤC E — DISCLAIMER VỀ PROXY DATA

*Bản phân tích này được sinh bởi LogiHub Engine v1.0 chạy trên Korean Freight O/D 2023 (công khai) đóng vai trò proxy cho data shipment doanh nghiệp. Cấu trúc phân tích, kiến trúc khuyến nghị, và logic tối ưu hoá có chất lượng tương đương phiên bản production. Các con số tuyệt đối là demonstration. Khi áp dụng cho một doanh nghiệp cụ thể (Samsung, LG, ...), engine cần được feed shipment data nội bộ để có kết quả chính xác.*

---

*Báo cáo này thuộc đề tài nghiên cứu LogiHub Intelligence — đội phát triển 3 thành viên, tháng 5/2026. Tài liệu được duy trì đồng bộ với 6 file canonical khác của dự án: `LogiHub_Engine_v2_Redesign.md`, `LogiHub_Midterm_Plan_3People_18days.md`, `LogiHub_Onboarding_Tong_Quan.md`, `LogiHub_Proxy_Engine_Definition_Roadmap.md`, `LogiHub_Cost_Engine_6_Components_Reference.md`, `LogiHub_WBS_Proxy_Engine_Midterm.md`.*
