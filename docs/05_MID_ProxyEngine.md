# PROXY ENGINE — ĐỊNH NGHĨA VÀ KẾ HOẠCH HOÀN THIỆN

*Tài liệu này làm rõ khái niệm "proxy engine" trong LogiHub, mapping cụ thể 10 phần engine theo độ "thật" của data, và lộ trình hoàn thiện từ midterm đến production.*

---

## 1. PROXY ENGINE LÀ GÌ?

### 1.1. Định nghĩa một câu

**Proxy engine** là phiên bản LogiHub Logistics Engine chạy trên **dữ liệu công khai làm proxy cho dữ liệu doanh nghiệp thật** — kết quả là engine demonstrate được toàn bộ kiến trúc và logic xử lý mà không cần ký NDA hay tiếp cận data nội bộ.

### 1.2. Phân biệt 3 phiên bản engine

Để hiểu rõ proxy engine, cần đặt nó trong tương quan với 2 phiên bản còn lại:

| Phiên bản | Data đầu vào | Output chất lượng | Khi nào dùng |
| --- | --- | --- | --- |
| **Mock engine** | Dữ liệu giả lập sinh từ generator | Demonstration kỹ thuật | Phát triển nội bộ, unit test |
| **Proxy engine (← MIDTERM)** | Korean Freight O/D + Warehouse Registry công khai + heuristic | Demonstration grade — hợp lý về mặt quy mô và cấu trúc nhưng không phải số chính xác của một doanh nghiệp cụ thể | Midterm, pitch, academic research |
| **Production engine** | Shipment data nội bộ + master data SKU + cost contract thật của 1 doanh nghiệp | Production grade — số chính xác đến từng đơn vị, trực tiếp triển khai được | Pilot khách hàng thật, roll-out thương mại |

Ba phiên bản này không phải 3 engine khác nhau — **chỉ là một engine duy nhất** chạy trên 3 loại data đầu vào khác nhau. Kiến trúc, code, logic giống hệt; chỉ thay file CSV input.

### 1.3. Nguyên lý cốt lõi của proxy approach

Korean Freight O/D 2022/2023 ghi nhận **toàn bộ vận chuyển hàng hoá liên vùng tại Hàn Quốc** của tất cả ngành — không phân biệt doanh nghiệp, không phân biệt sản phẩm. Mặc dù không phải data Samsung riêng, nó phản ánh chính xác cấu trúc địa lý của nhu cầu logistics quốc gia. Vì Samsung là một trong những doanh nghiệp đóng góp lớn nhất vào dòng vận chuyển này, **cấu trúc địa lý nhu cầu của Samsung tương tự với cấu trúc tổng đến mức scale** — Seoul/Gyeonggi vẫn là vùng trọng yếu, Busan vẫn là cụm phía Nam, Pyeongtaek vẫn là khu công nghệ cao.

Proxy engine khai thác sự tương tự cấu trúc này. Nó **không cố mô phỏng số liệu Samsung chính xác** — nó demonstrate rằng nếu một doanh nghiệp như Samsung feed data thật vào engine, engine sẽ ra được output có cấu trúc và chất lượng phân tích tương tự với những gì hội đồng đang xem.

---

## 2. TẠI SAO CHỌN PROXY ENGINE CHO MIDTERM

Có 4 lý do thực tế dẫn đến quyết định này.

**Lý do 1 — Bí mật kinh doanh.** Shipment data nội bộ của bất kỳ doanh nghiệp nào (Samsung, LG, Hyundai, Vinamilk) là tài sản chiến lược. Doanh nghiệp không bao giờ public, không có dataset học thuật nào chứa, và đội sinh viên trong khuôn khổ midterm không thể ký NDA với doanh nghiệp lớn để xin data.

**Lý do 2 — Quy mô data thực tế quá lớn.** Một doanh nghiệp như Samsung Mobile xử lý ~14 triệu units/năm × ~30 thuộc tính/shipment = hàng trăm GB data raw. Ngay cả khi có data, infrastructure cần để xử lý vượt khả năng máy tính cá nhân của sinh viên. Proxy data nhỏ hơn 100-1000 lần nhưng đủ để demonstrate kiến trúc.

**Lý do 3 — Validation kỹ thuật trước, validation kinh doanh sau.** Mục tiêu midterm là chứng minh kiến trúc engine 10 module hoạt động end-to-end và sinh được output chất lượng. Đây là **validation kỹ thuật**. Validation kinh doanh (số có chính xác không, doanh nghiệp đồng ý không) thuộc về phase pilot sau midterm.

**Lý do 4 — Tái sử dụng cho pitch sau này.** Sau midterm, đội có thể dùng chính proxy engine để pitch cho doanh nghiệp tiềm năng: "đây là output chúng tôi sinh được trên data công khai Hàn Quốc — nếu các bạn cho chúng tôi shipment data thật, output sẽ chính xác cho doanh nghiệp các bạn". Đây là cách startup logistics intelligence thường làm để vượt qua "chicken-and-egg problem" của data.

---

## 3. MAPPING 10 PHẦN ENGINE — REAL / PROXY / HEURISTIC

Không phải toàn bộ 10 phần engine đều là "proxy". Một số phần chạy trên data hoàn toàn thật, một số là proxy thuần, một số là heuristic không cần data. Bảng dưới đây phân loại từng phần:

| Phần | Trạng thái | Data đầu vào | Quality so với production |
| --- | --- | --- | --- |
| **1. Đọc dữ liệu** | 🟢 **Real** | Korean Freight O/D 2023 + Warehouse Registry | Identical — đọc CSV/Excel là đọc CSV/Excel |
| **2. Chuẩn hoá** | 🟢 **Real** | Mapping 17 vùng + đơn vị tấn | Identical — quy chuẩn không đổi |
| **3. Ma trận O/D** | 🟡 **Proxy** | Tổng hợp từ Korean Freight O/D | Cấu trúc giống production, số tổng hơi khác |
| **4. Nhu cầu mùa vụ** | 🟠 **Heuristic** | Bảng chỉ số mùa từ literature ngành | Pattern hợp lý nhưng không phải data thực |
| **5. Phân loại sản phẩm** | 🟠 **Heuristic** | 7 quy luật rule-based theo vùng | Đoán dựa trên cluster nhà máy, không phải SKU thật |
| **6. Chi phí 6 thành phần** | 🟠 **Heuristic** | Hệ số benchmark ngành | Tỉ lệ giữa các thành phần hợp lý, số tuyệt đối là benchmark |
| **7. Công suất kho** | 🟡 **Proxy** | Warehouse Registry công khai | Capacity danh nghĩa từ đăng ký, không phải utilization thật |
| **8. Chẩn đoán current network** | 🟠 **Heuristic** | Giả định 3 hub lớn nhất là current | Demonstration vì không có data current network thật |
| **9. Tối ưu hoá 9 kịch bản** | 🟢 **Real** | Tối ưu trên data của 3-7-8 ở trên | Logic toán học giống hệt production |
| **10. Khuyến nghị + outcome** | 🟢 **Real** | Tổng hợp từ 1-9 | Template + logic giống production |

### 3.1. Phần "Real" (3 phần — 30% engine)

Phần 1, 2, 9, 10 — đây là các phần mà **logic và code không thay đổi giữa proxy và production**. Khi doanh nghiệp dùng thật, đội chỉ cần thay file input — code phần này chạy như cũ.

### 3.2. Phần "Proxy" (2 phần — 20% engine)

Phần 3 và 7 — dùng dữ liệu công khai làm proxy cho dữ liệu nội bộ. Cấu trúc kết quả tương tự nhưng **số tuyệt đối khác** (vì nguồn data khác). Khi lên production, đội thay file input thì output sẽ chính xác cho doanh nghiệp đó.

### 3.3. Phần "Heuristic" (4 phần — 40% engine)

Phần 4, 5, 6, 8 — dùng quy luật/hệ số không phụ thuộc data input. Đây là phần **bị ảnh hưởng nhiều nhất** khi chuyển sang production:

- **Phần 4 (mùa vụ):** production cần time-series shipment data 2-3 năm để decompose seasonal pattern thật, thay cho bảng heuristic.
- **Phần 5 (phân loại sản phẩm):** production có SKU master data → biết chính xác mỗi shipment thuộc dòng sản phẩm nào, không cần đoán bằng quy luật vùng.
- **Phần 6 (chi phí):** production có cost contract thật của doanh nghiệp với các 3PL/carrier → thay benchmark ngành.
- **Phần 8 (chẩn đoán current):** production có data warehouse network hiện tại của doanh nghiệp → thay giả định "3 hub lớn nhất".

---

## 4. PROXY ENGINE LÀM ĐƯỢC GÌ VÀ KHÔNG LÀM ĐƯỢC GÌ

### 4.1. Bốn việc proxy engine làm tốt

**Một, demonstrate toàn bộ kiến trúc 10 phần.** Hội đồng có thể chạy CLI, xem 10 phần chạy nối tiếp, đọc output từng phần. Đây là chứng minh kỹ thuật.

**Hai, sinh outcome 16 mục có cấu trúc và độ sâu của một bản phân tích senior SCM manager.** Số có thể không phải Samsung thật nhưng cấu trúc lập luận, các bảng, các diễn giải, các khuyến nghị đều giống output production.

**Ba, validate mô hình tối ưu hoá toán học.** Phần 9 chạy đúng P-median, UFLP, CFLP, MCLP, Hybrid-CFLP trên data proxy. Solver trả về nghiệm tối ưu. Điều này chứng minh OR component của engine hoạt động.

**Bốn, làm bằng chứng pitch sau này.** Đội có thể đem proxy engine + outcome mẫu đi pitch cho doanh nghiệp Việt Nam: "đây là cái engine sẽ làm cho công ty của bạn nếu được feed data thật".

### 4.2. Bốn việc proxy engine không làm được

**Một, không nói được số chính xác cho một doanh nghiệp cụ thể.** Nếu hỏi "Samsung tiết kiệm bao nhiêu?", proxy engine không trả lời được. Outcome mẫu Samsung Mobile (file `Outcome_Sample_Samsung_Mobile_10Models.md`) là **giả định cho minh hoạ**, không phải kết quả engine chạy trên data Samsung thật.

**Hai, không validate được seasonal pattern của doanh nghiệp cụ thể.** Bảng chỉ số mùa trong Phần 4 là heuristic ngành — Samsung có thể có pattern khác (ví dụ Galaxy launch dịch chuyển 1 tháng), engine proxy không phát hiện được.

**Ba, không tối ưu được phân loại sản phẩm chính xác.** Classifier 7 rule chỉ đoán dòng sản phẩm dựa trên đặc điểm vùng. Production có SKU master data sẽ chính xác hơn nhiều.

**Bốn, không phản ánh cost contract thực tế.** Hệ số chi phí trong proxy engine là benchmark ngành. Doanh nghiệp thật có giá hợp đồng với carrier riêng — đôi khi rẻ hơn 30% benchmark, đôi khi đắt hơn 20%.

### 4.3. Hệ quả về cách trình bày

Mọi outcome do proxy engine sinh ra phải có **disclaimer** ở đầu, ví dụ:

> *Bản phân tích này được sinh bởi LogiHub Logistics Engine v2 chạy trên Korean Freight O/D 2023 (công khai) đóng vai trò proxy cho data shipment doanh nghiệp. Cấu trúc phân tích, kiến trúc khuyến nghị, và logic tối ưu hoá có chất lượng tương đương với phiên bản production. Số tuyệt đối là demonstration — doanh nghiệp dùng thật cần feed data nội bộ để có số chính xác.*

Disclaimer này phải có trong báo cáo Word, slide thuyết trình (slide 2 hoặc 3), và outcome markdown. Đây là minh bạch trí tuệ cần có để hội đồng không hiểu lầm.

---

## 5. KẾ HOẠCH HOÀN THIỆN PROXY ENGINE CHO MIDTERM

### 5.1. Danh sách task hoàn thiện theo từng phần

Đây là phần kết hợp với plan 18 ngày — mỗi phần engine có checklist cụ thể để được coi là "proxy-complete":

**Phần 1 — Đọc dữ liệu.** Status: 🟢 Real. Task hoàn thiện: đọc được `od_clean_long_2023.csv`, `warehouse_geocoded.csv`, `warehouse_capacity_17_regions.csv` không lỗi. Output: 3 raw DataFrame trong RunContext. Owner: Nhóm A. Deadline: 12/5.

**Phần 2 — Chuẩn hoá.** Status: 🟢 Real. Task: REGION_MASTER 17 entries chính xác với toạ độ centroid. Hàm `clean_od()` và `clean_warehouse()` không có row null. Owner: Nhóm A. Deadline: 13/5.

**Phần 3 — Ma trận O/D.** Status: 🟡 Proxy. Task: ma trận 17×17 đầy đủ + bảng `regional_demand.csv` + `top_od_lanes.csv`. Sai số tổng < 1%. Owner: Nhóm A. Deadline: 14/5.

**Phần 4 — Nhu cầu mùa vụ.** Status: 🟠 Heuristic. Task: bảng chỉ số mùa 12 tháng × 6 dòng sản phẩm trong `engine/config.py`. Mỗi cột trung bình ≈ 1.0 (sai số ±2%). Hàm `expand_to_monthly()` áp dụng đúng. **Disclaimer:** số mùa vụ là heuristic ngành, không phải seasonal pattern Samsung thật. Owner: Nhóm A. Deadline: 17/5.

**Phần 5 — Phân loại sản phẩm.** Status: 🟠 Heuristic. Task: file `classifier_rules.json` với 7 quy luật. Mọi lane trong O/D matrix đều match ít nhất 1 rule (không fall through 100% default). Tỉ lệ tổng theo product family hợp lý (mobile 18-25%, bulky 15-20%, secure 8-12%). **Disclaimer:** classifier là rule-based, không có SKU master data. Owner: Nhóm C. Deadline: 11-17/5 (làm hai pass).

**Phần 6 — Chi phí 6 thành phần.** Status: 🟠 Heuristic. Task: cả 6 thành phần đều có output bảng riêng, không NaN. Tỉ lệ giữa 6 thành phần hợp lý (transport 35-50%, warehouse 10-20%, handling 8-15%, inventory 10-18%, flex 5-12%, sla 3-10%). **Disclaimer:** hệ số là benchmark ngành, không phải hợp đồng thật. Owner: Nhóm B. Deadline: 14/5 (3 thành phần đầu) + 17/5 (3 thành phần cuối).

**Phần 7 — Công suất kho.** Status: 🟡 Proxy. Task: bảng `base_capacity_by_hub.csv` cho mọi warehouse trong registry. Effective capacity tính đúng theo formula. Status mapping đúng UTILIZATION_BANDS. **Disclaimer:** capacity từ đăng ký công khai, không phải utilization vận hành thật. Owner: Nhóm B. Deadline: 18/5.

**Phần 8 — Chẩn đoán current network.** Status: 🟠 Heuristic. Task: hàm `assume_current_network()` chọn 3 hub lớn nhất. 5 hàm chẩn đoán (allocation, high-cost lanes, overloaded, underused, poor coverage) đều có output. Service risk text > 100 từ generated từ template. **Disclaimer:** current network là giả định, không phải data thật. Owner: Nhóm C. Deadline: 13/5 skeleton, 16/5 chi tiết.

**Phần 9 — Tối ưu hoá 9 kịch bản.** Status: 🟢 Real. Task: 9 kịch bản chạy parallel < 90s. S3 cost < S0 × 0.85. S6 cost > S3 × 1.15. recommended_scenario_id ∈ {S3, S5}. Owner: Nhóm B. Deadline: 18/5.

**Phần 10 — Khuyến nghị + outcome.** Status: 🟢 Real. Task: hub_role_assignment cho 6 hub. seasonal_playbook ≥ 4 events. roadmap 4 phase. business_case có cost_saving_pct ∈ [10%, 25%]. **★ outcome_sample_full.md** 12-15 trang đầy đủ 16 mục, đạt test 3 câu ≥ 2/3. Owner: Nhóm C. Deadline: 16-21/5.

### 5.2. Tổng số phải hoàn thiện trước midterm

10 phần × tổng task ~50 sub-task. Phân bổ thời gian:
- Tuần 1 (10-16/5): hoàn thiện skeleton 10 phần với mock data, mỗi phần chạy được CLI riêng → ~30% xong.
- Tuần 2 (17-23/5): integration + đào sâu → 90% xong.
- Tuần 3 (24-26/5): polish + báo cáo + slide → 100% xong cho midterm.

Ngày 27/5: đội nộp proxy engine v1.0.

### 5.3. Tiêu chí "proxy engine v1.0" được coi là hoàn thiện

- [ ] CLI `python -m engine.cli run` chạy end-to-end < 90s không crash
- [ ] 9 kịch bản đều có output, S3 là kịch bản khuyến nghị
- [ ] 12 bảng intermediate trong `output/tables/` đầy đủ schema
- [ ] JSON output validate được bởi `engine_contract.schema.json`
- [ ] `outcome_sample_full.md` 12-15 trang, 16 mục, mọi placeholder fill, đạt test 3 câu ≥ 2/3
- [ ] Disclaimer xuất hiện ở 3 nơi: outcome markdown header, báo cáo abstract, slide 2-3
- [ ] AI-generated frontend render được JSON output (đã verify trong tuần 3)
- [ ] Backup CLI demo screencast 60s sẵn sàng

---

## 6. LỘ TRÌNH TỪ PROXY ENGINE → PRODUCTION ENGINE

### 6.1. Bốn giai đoạn hoàn thiện sau midterm

**Giai đoạn 1 — Củng cố proxy engine (tháng 6/2026, 4 tuần sau midterm).**

Sau khi nộp midterm, đội có 4 tuần buffer trước khi nghỉ hè hoặc bước vào dự án tiếp theo. Đây là cơ hội polish proxy engine thành "demo-grade" trước khi đem đi pitch.

Việc cần làm: bổ sung LLM-driven executive summary cho Phần 10 (thay vì template thuần); thêm provenance tracking để hội đồng/khách click vào số nào cũng truy về được data nguồn; thêm sensitivity analysis tự động (kéo thanh để tăng giảm hệ số xem cost thay đổi); fix các bug phát hiện sau midterm.

**Giai đoạn 2 — Pilot với case Việt Nam (tháng 7-8/2026, 8 tuần).**

Tìm 1 doanh nghiệp Việt Nam tầm trung (FMCG, 3PL, hoặc retail) sẵn lòng cung cấp data shipment 6 tháng để chạy thử. Đây là bước **đầu tiên engine chạm vào data thật** — chuyển từ proxy sang production cho 1 case cụ thể.

Việc cần làm: ký NDA với doanh nghiệp; xây pipeline ingest data nội bộ của họ (có thể ERP export khác Korean Freight O/D); chạy engine, so sánh output với mạng lưới hiện tại của họ; viết whitepaper case study.

Phần engine bị ảnh hưởng nhiều nhất khi chuyển sang production: Phần 5 (classifier) thay bằng SKU mapping thật; Phần 6 (chi phí) thay benchmark bằng cost contract của doanh nghiệp; Phần 8 (chẩn đoán) thay giả định bằng current network thật.

**Giai đoạn 3 — Mở rộng case + product polish (tháng 9-12/2026, 16 tuần).**

Mở rộng từ 1 case lên 3-5 case khách hàng. Mỗi case có thể là ngành khác nhau (FMCG, electronics, pharmaceuticals). Validate engine hoạt động xuyên ngành.

Việc cần làm: tạo template config theo ngành (mỗi ngành có hệ số chi phí, dòng sản phẩm, mùa vụ khác nhau); hoàn thiện frontend chuyên nghiệp (không AI-generated); đăng ký bản quyền engine logic; xây pricing model SaaS.

**Giai đoạn 4 — Thương mại hoá (2027 trở đi).**

Chuyển từ research project sang sản phẩm thương mại. Pricing dạng SaaS hoặc consulting + license. Đội có thể spin-off thành startup hoặc license cho công ty logistics có sẵn.

### 6.2. Bảng so sánh proxy engine vs production engine

| Khía cạnh | Proxy engine (midterm) | Production engine (sau pilot) |
| --- | --- | --- |
| Data source | Korean Freight O/D + Registry công khai | Shipment data nội bộ doanh nghiệp |
| Phân loại sản phẩm | 7 rule heuristic | SKU master data |
| Hệ số chi phí | Benchmark ngành | Cost contract thật của doanh nghiệp |
| Mùa vụ | Bảng heuristic | Time-series decomposition trên 2-3 năm data |
| Current network | Giả định 3 hub lớn nhất | Network thật của doanh nghiệp |
| Số liệu output | Demonstration grade | Production grade |
| Frontend | AI-generated | Self-built professional |
| Disclaimer | Bắt buộc | Không cần |
| Mục đích | Validate kỹ thuật + pitch | Triển khai khách hàng thật |

### 6.3. Effort estimate cho từng giai đoạn

| Giai đoạn | Thời gian | Effort (person-day) | Output chính |
| --- | --- | ---: | --- |
| 1. Củng cố proxy | 4 tuần | 60 | Engine v1.5 + LLM summary + provenance |
| 2. Pilot Việt Nam | 8 tuần | 120 | Whitepaper case study + Engine v2.0 |
| 3. Mở rộng + polish | 16 tuần | 360 | 3-5 case study + Frontend pro + Engine v3.0 |
| 4. Thương mại hoá | open | open | Sản phẩm SaaS |

**Tổng từ midterm đến launch sản phẩm thương mại: ~7-8 tháng** với đội 3 người làm part-time.

---

## 7. CHIẾN LƯỢC TRÌNH BÀY PROXY ENGINE TRƯỚC HỘI ĐỒNG

### 7.1. Three-tier message để tránh hiểu lầm

Khi thuyết trình midterm, đội phải truyền tải 3 thông điệp song song:

**Tier 1 — Engine có kiến trúc đầy đủ và chạy được.** "Đây là engine 10 phần xử lý từ data thô đến outcome 16 mục, chạy 9 kịch bản tối ưu hoá song song trong dưới 90 giây, sinh được bản phân tích markdown chất lượng senior SCM manager."

**Tier 2 — Engine đang chạy trên proxy data, không phải data Samsung thật.** "Vì shipment data nội bộ của doanh nghiệp là bí mật kinh doanh, đội dùng Korean Freight O/D công khai làm proxy. Cấu trúc phân tích và logic tối ưu hoá là production-grade; số tuyệt đối là demonstration."

**Tier 3 — Engine sẽ ra số chính xác khi feed data thật.** "Khi một doanh nghiệp như Samsung dùng thật, họ chỉ cần feed shipment data nội bộ vào — kiến trúc engine không đổi, code không đổi, chỉ thay file CSV input. Số sẽ chính xác cho doanh nghiệp đó."

Ba tier này không mâu thuẫn — chúng cho thấy đội hiểu rõ bài toán và làm việc một cách trí tuệ trí trong khuôn khổ ràng buộc data.

### 7.2. Slide đề xuất cho midterm

Trong cấu trúc 18 slide đã có, slide 2-3 dành riêng cho proxy approach:

| Slide | Nội dung |
| --- | --- |
| Slide 2 | "Vấn đề" — doanh nghiệp lớn cần engine quyết định mạng lưới kho |
| Slide 3 | **"Phạm vi nghiên cứu — Proxy Engine"** — giới thiệu approach: dùng Korean Freight O/D làm proxy, lý do, hệ quả, disclaimer |
| Slide 4 | "Mục tiêu sản phẩm" — engine 5 năng lực |
| ... | ... |
| Slide 14 | **"Lộ trình production"** — 4 giai đoạn từ proxy đến triển khai khách hàng thật |

Hai slide proxy là điểm phân biệt quan trọng giữa "đội biết mình đang làm gì" và "đội nhầm lẫn proxy với production".

### 7.3. Câu hỏi Q&A thường gặp về proxy

**Q: Vậy số 25 triệu USD/năm Samsung tiết kiệm trong outcome có thật không?**

A: Không. Đó là giả định cho minh hoạ. Outcome mẫu Samsung Mobile được xây dựa trên data giả định để demonstrate engine sẽ làm được gì nếu Samsung thật sự dùng. Engine khi chạy trên Korean Freight O/D thật ra số khác — số đó cũng là demonstration vì Korean Freight O/D không phân biệt doanh nghiệp.

**Q: Tại sao không đợi có data thật rồi mới làm engine?**

A: Vì làm engine và xin data là hai bài toán độc lập. Đội xây engine trước trên proxy data → có sản phẩm demo → dùng demo đó để pitch xin data từ doanh nghiệp tiềm năng → sau đó upgrade lên production. Đây là chiến lược chuẩn của startup logistics intelligence.

**Q: Engine có thực sự khác gì với Excel?**

A: Excel chạy được 1 kịch bản tại một thời điểm với formula thủ công. Engine chạy 9 kịch bản parallel với 5 mô hình tối ưu hoá toán học, gồm cả mô hình product-aware không thể biểu diễn trong Excel. Engine cũng tự sinh bản phân tích 16 mục — Excel không làm được.

**Q: Tại sao chọn Korean Freight thay vì Vietnam Freight?**

A: Vì Vietnam không có Freight O/D công khai chất lượng tương đương. Hàn Quốc có Bộ Giao thông xuất bản dataset chuẩn 2 năm/lần. Đội chọn Hàn Quốc để có data tốt; logic engine không phụ thuộc nước nào — khi mở rộng cho Việt Nam, chỉ cần thay region master và data input.

**Q: Phần nào của engine bị ảnh hưởng nhiều nhất khi chuyển production?**

A: Phần 5 (classifier sản phẩm), Phần 6 (chi phí), Phần 8 (chẩn đoán current). Ba phần này hiện là heuristic. Khi production, chúng được thay bằng SKU mapping thật, cost contract thật, current network thật. 7 phần còn lại (1, 2, 3, 4, 7, 9, 10) chuyển production gần như không cần code thay đổi — chỉ thay file input.

---

## 8. TÓM TẮT ĐIỀU CHÍNH

Proxy engine không phải là một engine "kém chất lượng" — nó là engine **đầy đủ về kiến trúc**, chạy trên một bộ data đầu vào khác để demonstrate trong môi trường không tiếp cận được data doanh nghiệp. Trong 10 phần của engine, 3 phần chạy 100% như production, 2 phần dùng public data làm proxy, và 4 phần dùng heuristic.

Kế hoạch hoàn thiện proxy engine cho midterm ngày 27/5/2026 đã được tích hợp vào plan 18 ngày của đội — mỗi phần có deadline và owner cụ thể. Tiêu chí "proxy engine v1.0 hoàn thiện" gồm 8 mục trong section 5.3.

Sau midterm, lộ trình từ proxy lên production gồm 4 giai đoạn trong 7-8 tháng: củng cố proxy → pilot 1 case Việt Nam → mở rộng 3-5 case → thương mại hoá. Phần engine bị ảnh hưởng nhiều nhất khi chuyển production là Phần 5, 6, 8 (các phần heuristic).

Khi thuyết trình hội đồng, đội phải truyền tải three-tier message: (1) engine có kiến trúc đầy đủ và chạy được, (2) đang chạy trên proxy data với disclaimer rõ ràng, (3) ra được số chính xác khi feed data thật. Có 2 slide riêng (slide 3 và slide 14) dành cho proxy approach và roadmap production.

---

*Tài liệu này là một trong những tài liệu canonical của LogiHub. Cùng với `LogiHub_Engine_v2_Redesign.md` (kiến trúc), `LogiHub_Midterm_Plan_3People_18days.md` (kế hoạch), `LogiHub_Onboarding_Tong_Quan.md` (giới thiệu), và `Outcome_Sample_Samsung_Mobile_10Models.md` (outcome mẫu), nó tạo thành bộ 5 file mô tả đầy đủ dự án LogiHub Intelligence trong giai đoạn midterm.*
