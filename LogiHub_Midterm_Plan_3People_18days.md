# KẾ HOẠCH ĐỘI LOGIHUB · LÀM VIỆC ĐỘC LẬP

*Từ ngày 9/5/2026 đến 27/5/2026 · 18 ngày · 3 sinh viên · Gặp nhau tối đa 1 lần/tuần*

---

## 1. TÓM TẮT NHANH

Đến ngày 27/5 đội phải nộp bốn thứ: một bộ engine hoàn chỉnh chạy được từ đầu đến cuối, một bản phân tích mẫu (outcome) khoảng 12-15 trang, một báo cáo Word khoảng 30 trang, và một bộ slide thuyết trình. Phần website AI sẽ giúp dựng dựa trên kết quả engine.

Vì 3 thành viên là sinh viên, không thể ngồi làm việc cùng nhau, đội tổ chức theo mô hình **làm việc độc lập (async)**. Cụ thể: tối đa 3 buổi gặp Saturday (10/5, 17/5, 24/5) cộng 1 buổi sync ngắn tối thứ 3 trước midterm. Còn lại mỗi người làm việc một mình tại nhà, cập nhật tiến độ qua channel chat, review PR của nhau trong 48 giờ.

Yếu tố sống còn của mô hình async là **buổi gặp đầu tiên (10/5)**. Tại buổi này đội phải lock contract dữ liệu giữa các phần engine, sinh mock data đầy đủ, và phân chia rõ ai làm gì. Sau buổi đó, mỗi người về nhà phải có đủ thứ để chạy độc lập — không ai phải chờ ai.

---

## 2. NGUYÊN TẮC LÀM VIỆC ĐỘC LẬP

### 2.1. Mỗi người tự chạy được toàn bộ engine

Nguyên tắc cốt lõi: ai cũng có thể chạy `python -m engine.cli run` trên máy mình bất cứ lúc nào, dù 2 người kia chưa làm xong phần của họ. Cách làm: **mock data**. Mỗi phần engine có một file output mẫu giả (mock) để các phần phụ thuộc vào nó dùng tạm trong khi chờ phần thật chạy được.

Ví dụ: Nhóm B cần output của Nhóm A để tính chi phí. Trong tuần 1 khi Nhóm A chưa xong, Nhóm B dùng file `mocks/regional_demand.csv` (sinh ở buổi gặp 1) thay cho output thật. Khi Nhóm A push code thật vào branch `main`, Nhóm B chỉ cần xoá mock và pull để dùng output thật. Mọi thứ vẫn chạy.

### 2.2. Contract phải lock ngay buổi đầu tiên

Vì không có cơ hội gặp lại sớm, mọi quyết định cấu trúc phải được lock tại buổi gặp 1 (10/5). Sau buổi đó nếu phải đổi schema thì phải có cuộc gọi 1-1 giữa người đề xuất và người bị ảnh hưởng — không có chuyện đổi rồi mới báo.

Bốn thứ phải lock ngày 10/5: (1) JSON contract output cuối cùng của engine, (2) schema từng bảng dữ liệu intermediate giữa 10 phần, (3) phân chia ai sở hữu phần nào, (4) bộ mock data đầy đủ.

### 2.3. Cập nhật tiến độ async qua channel

Hằng ngày mỗi người post một dòng trong channel `#logihub-midterm`:

```
[ngày]
- Hôm nay xong: ...
- Mai làm: ...
- Block: ... (nếu có)
- PR mở: link
```

Không cần họp 9h sáng. Không cần video call. Chỉ cần text. Ai có block thì 2 người kia phản hồi trong 24 giờ qua channel hoặc DM.

### 2.4. PR review trong 48 giờ

PR review chéo: A duyệt B, B duyệt C, C duyệt A. SLA review là 48 giờ thay vì 24 giờ như mô hình đồng bộ. Nếu sau 48 giờ chưa có review thì người mở PR có quyền tự merge với bình luận "auto-merge sau 48h theo SLA".

### 2.5. Mỗi phần có CLI riêng test được độc lập

Ngoài CLI chung `python -m engine.cli run`, mỗi nhóm có CLI nhỏ riêng để test phần mình:

- Nhóm A: `python -m engine.cli build-od --input data/ --output output/`
- Nhóm B: `python -m engine.cli run-scenarios --demand mocks/demand.csv --output output/`
- Nhóm C: `python -m engine.cli render-outcome --scenarios mocks/scenarios.json --output output/`

Mỗi CLI nhỏ phải chạy được từ đầu đến cuối **chỉ với mock data** mà không cần 2 phần kia. Đây là điều kiện bắt buộc để làm việc độc lập.

---

## 3. LỊCH GẶP MẶT

| Ngày | Loại | Thời lượng | Mục tiêu |
| --- | --- | --- | --- |
| **Thứ 7 — 10/5** | Buổi 1 — Kickoff | 4 giờ | Lock contract + sinh mock + phân việc rõ ràng |
| **Thứ 7 — 17/5** | Buổi 2 — Integration | 3 giờ | Tích hợp output thật, replace mock, chạy end-to-end |
| **Thứ 7 — 24/5** | Buổi 3 — Polish | 3 giờ | Đọc outcome v1.7, plan báo cáo + slide chia phần |
| **Thứ 3 — 26/5 tối** | Sync ngắn | 1.5 giờ | Dry run thuyết trình, fix bug cuối, kiểm tra demo |
| **Thứ 4 — 27/5** | MIDTERM | — | Thuyết trình theo lịch hội đồng |

Nếu một thành viên không thể tham gia buổi nào thì: (1) phải xem recording trong vòng 24 giờ, (2) phải đọc meeting notes do thành viên khác viết, (3) phải approve các quyết định async qua channel, (4) có thể đặt 1-1 với người khác để catch up.

---

## 4. CHIA VIỆC CHO 3 NHÓM

Đội chia thành 3 nhóm theo phần engine sở hữu. Mỗi nhóm có một slice từ đầu đến cuối — bao gồm code engine, viết phần báo cáo của mình, viết phần outcome của mình, viết phần slide của mình. Mục đích là **mỗi nhóm tự đủ để hoàn thành phần mình mà không cần đợi nhóm khác**.

### 4.1. Nhóm A — Dữ liệu và Nhu cầu

**Code engine:** Phần 1 (đọc dữ liệu), Phần 2 (chuẩn hoá), Phần 3 (ma trận O/D), Phần 4 (nhu cầu theo tháng + dòng sản phẩm).

**Bảng output cần làm:** `regional_demand.csv`, `od_matrix_17_region.csv`, `top_od_lanes.csv`, `monthly_demand_by_region.csv`, `monthly_demand_by_region_product.csv`, `seasonal_index.csv`.

**Phần outcome viết riêng:** mục 1 (Phân lớp nhu cầu), mục 2 (Phân tích nhu cầu theo 17 vùng), nửa đầu mục 10 (Seasonal demand). Cộng các bảng số dùng trong các mục khác.

**Phần báo cáo viết riêng:** Phần "Dữ liệu và Phương pháp xử lý" (6-8 trang) — nguồn data Korean Freight, quy trình chuẩn hoá 17 vùng, công thức O/D builder, kết quả demand 17 vùng kèm hình.

**Phần slide viết riêng:** 3-4 slide gồm slide nguồn dữ liệu, slide bảng nhu cầu 17 vùng, slide top corridors.

**CLI riêng để test độc lập:** `python -m engine.cli build-od --input data/ --output output/`. Chạy CLI này phải ra đủ 6 bảng output trên mà không cần Nhóm B/C.

### 4.2. Nhóm B — Chi phí, Công suất, Tối ưu hoá

**Code engine:** Phần 6 (chi phí 6 thành phần), Phần 7 (công suất kho), Phần 9 (5 model tối ưu + 9 kịch bản + Hybrid-CFLP).

**Bảng output cần làm:** `transport_cost_by_lane.csv`, `warehouse_fixed_cost_by_hub.csv`, `handling_cost_by_product_hub.csv`, `inventory_holding_cost_by_month.csv`, `seasonal_flex_cost.csv`, `sla_penalty_by_lane.csv`, `utilization_by_hub_month.csv`, `selected_hubs_by_scenario.csv`, `scenario_comparison.csv`.

**Phần outcome viết riêng:** mục 4 (Cost structure), mục 5 (High-cost lane diagnosis), mục 6 (Recommended hub strategy), mục 7 (Recommended network design), mục 9 (Hub utilization), mục 11 (Scenario comparison). Đây là phần "kết quả số" của outcome.

**Phần báo cáo viết riêng:** Phần "Cơ sở lý thuyết" (5-6 trang, viết về P-median/UFLP/CFLP/MCLP/Aggregate Planning) + Phần "Kết quả thực nghiệm 9 kịch bản" (5-6 trang, gồm bảng so sánh + figures).

**Phần slide viết riêng:** 4-5 slide gồm slide 5 mô hình tối ưu, slide 9 kịch bản design, slide bảng so sánh kết quả, slide chi phí leakage.

**CLI riêng để test độc lập:** `python -m engine.cli run-scenarios --demand mocks/demand.csv --warehouse mocks/warehouse.csv --output output/`. Chạy CLI này phải ra đủ 9 kịch bản chỉ với mock data của Nhóm A.

### 4.3. Nhóm C — Phân loại, Chẩn đoán, Tổng hợp khuyến nghị

**Code engine:** Phần 5 (phân loại sản phẩm), Phần 8 (chẩn đoán mạng lưới hiện tại), Phần 10 (gán vai trò kho + sách tay mùa vụ + lộ trình + business case + render outcome markdown).

**Bảng output cần làm:** `classifier_rules.json`, `current_network_health.csv`, `recommended_network.csv`, `hub_role_assignment.csv`, `region_to_hub_allocation_by_product.csv`, `seasonal_playbook.json`, `implementation_roadmap.json`, `business_case_summary.md`, **và centerpiece là `outcome_sample_full.md`**.

**Phần outcome viết riêng:** mục 0 (Tóm tắt điều hành), mục 3 (Vấn đề mạng lưới hiện tại), mục 8 (Region-to-hub allocation), nửa sau mục 10 (Seasonal strategy), mục 12 (Final recommendation), mục 13 (Implementation roadmap), mục 14-16 (Executive output, differences, value statement). Đây là phần "kể chuyện" của outcome. Cộng nhiệm vụ **glue toàn bộ outcome lại thành một file mạch lạc**.

**Phần báo cáo viết riêng:** Phần "Tóm tắt điều hành" + "Vấn đề và mục tiêu" + "Kiến trúc engine 10 module" + "Outcome sample preview" + "Kết luận" (~10 trang tổng).

**Phần slide viết riêng:** 6-7 slide gồm slide hook, slide vấn đề, slide kiến trúc engine, slide outcome preview (2 slide), slide roadmap, slide Q&A backup.

**CLI riêng để test độc lập:** `python -m engine.cli render-outcome --scenarios mocks/scenarios.json --diagnosis mocks/diagnosis.json --output output/`. Chạy CLI này phải ra outcome markdown đầy đủ 16 mục chỉ với mock data của Nhóm A và B.

### 4.4. Việc dùng chung 3 nhóm

| Việc | Người chính | Người phụ |
| --- | --- | --- |
| Định nghĩa JSON contract đầu cuối engine | Nhóm A draft, cả 3 lock tại buổi 1 | — |
| Sinh mock data cho 3 nhóm | Cả 3 cùng làm tại buổi 1 | — |
| Tạo Git repo + branch protection | Nhóm B | — |
| Setup channel chat + pin tài liệu | Nhóm C | — |
| Viết meeting notes 3 buổi gặp | Nhóm C | A, B duyệt |
| Tổng hợp báo cáo Word cuối cùng | Nhóm C | A, B nộp phần riêng |
| Tổng hợp slide cuối cùng | Nhóm C | A, B nộp phần riêng |
| Final integration test | Nhóm B | A, C đứng cạnh xem |

---

## 5. BUỔI GẶP 1 — KICKOFF (Thứ 7, 10/5, 4 giờ)

Đây là buổi quan trọng nhất. Sau buổi này, 3 người về nhà và làm độc lập trong 7 ngày. Nếu buổi này lỏng lẻo, cả tuần sau sẽ trật hướng.

### Chuẩn bị trước (mỗi người đến với):

- Đã đọc 2 file: `LogiHub_Engine_v2_Redesign.md` và file kế hoạch này
- Đã đọc bản Samsung outcome mẫu trong `[SMProject] Logistics Engine.md`
- Đã chạy `git clone` repo và setup môi trường Python local
- Mang laptop, sạc, headphone (nếu họp online)

### Agenda (4 giờ):

**Phút 0-30 — Thống nhất mục tiêu và scope.** Cả 3 cùng đọc lại Phần 2 (mục tiêu) và Phần 4 (chia việc) của file này. Confirm scope: 10 phần engine, 6 chi phí, 9 kịch bản, outcome 16 mục. Nếu ai không đồng ý điều gì thì raise ngay tại đây — sau buổi này không đổi nữa.

**Phút 30-90 — Lock JSON contract.** Mở file template `engine_contract.schema.json`. Cùng đi qua từng khối (kịch bản, mạng lưới, chi phí, chẩn đoán, sách tay mùa vụ, lộ trình, business case, data quality). Cả 3 cùng comment, fix tại chỗ. Cuối phần này commit file vào repo, tag là `v1.0-locked`.

**Phút 90-150 — Lock schema 12 bảng intermediate.** Đi qua 12 bảng output mà engine sinh ra (xem Phần 4 ở trên). Mỗi bảng phải có schema cố định: tên cột, kiểu dữ liệu, đơn vị. Cùng viết vào doc `data_schemas.md` ngay tại đây.

**Phút 150-210 — Sinh mock data.** Mỗi người làm một bộ mock cho 2-3 bảng. Mock không cần thật, chỉ cần đúng schema và có 5-10 hàng. Lưu vào folder `mocks/`. Cuối phần này có đủ mock cho tất cả 12 bảng.

**Phút 210-240 — Phân việc cụ thể tuần 1.** Mỗi người liệt kê 5-8 task cho tuần (10-16/5). Viết vào doc shared. Confirm rằng mỗi người có thể chạy CLI riêng của mình bằng mock data sau tuần 1.

### Output buổi 1:

- [ ] File `engine_contract.schema.json` locked, tag `v1.0-locked`
- [ ] File `data_schemas.md` mô tả 12 bảng intermediate
- [ ] Folder `mocks/` có đủ 12 file mock
- [ ] Doc `meeting_1_notes.md` ghi quyết định + task list tuần 1
- [ ] Mỗi người confirm bằng tin nhắn channel: "Tôi nhận task X, Y, Z, sẽ xong trước buổi 2"

---

## 6. TUẦN 1 ASYNC (11/5 → 16/5, 6 ngày)

Mỗi người làm việc một mình tại nhà. Mục tiêu cuối tuần: mỗi người chạy được CLI riêng của mình ra đủ output bảng với mock data.

### Nhóm A — Tuần 1

**Mục tiêu cuối tuần:** chạy `python -m engine.cli build-od --input data/ --output output/` ra đủ 6 bảng (không cần test với data thật, chỉ cần với data đã processed `od_clean_long_2023.csv`).

**Việc cần làm:**

1. Tạo skeleton `engine/ingestion.py`, `engine/normalization.py`, `engine/od_builder.py`, `engine/demand.py`.
2. Implement đọc file `od_clean_long_2023.csv` và `warehouse_geocoded.csv`.
3. Chuẩn hoá tên 17 vùng — viết bảng `REGION_MASTER` đầy đủ 17 entries với toạ độ trung tâm.
4. Xây ma trận O/D 17×17 và xuất 3 bảng đầu (`regional_demand.csv`, `od_matrix_17_region.csv`, `top_od_lanes.csv`).
5. Implement seasonal index theo bảng 12 tháng × 6 dòng sản phẩm trong config.
6. Sinh nhu cầu theo tháng, xuất 3 bảng còn lại.
7. Viết unit test — coverage 70% cho 4 module.
8. Push PR mỗi cuối ngày, tag Nhóm B/C review trong 48h.

### Nhóm B — Tuần 1

**Mục tiêu cuối tuần:** chạy `python -m engine.cli run-scenarios --demand mocks/demand.csv --warehouse mocks/warehouse.csv --output output/` ra ít nhất 3 kịch bản (S0, S2, S3) với 3 thành phần chi phí đầu.

**Việc cần làm:**

1. Tạo skeleton `engine/cost.py`, `engine/capacity.py`, `engine/optimizer.py`, `engine/scenarios.py`.
2. Refactor 4 model cũ từ `models.py` (P-median, UFLP, CFLP, MCLP) thành chữ ký thống nhất trả về `SolverResult`.
3. Implement 3 thành phần chi phí đầu: vận chuyển (theo dòng sản phẩm), cố định kho, xử lý hàng. Hệ số mặc định trong `engine/config.py`.
4. Viết Hybrid-CFLP với chiều dòng sản phẩm.
5. Viết runner cho 3 kịch bản: S0 (lock current), S2 (P-median 5), S3 (Hybrid-CFLP 6).
6. Implement engine công suất với 5 trạng thái (dư/khoẻ/cảnh báo/quá tải/khủng hoảng).
7. Viết CLI nhỏ `run-scenarios` chạy độc lập với mock của Nhóm A.
8. Push PR mỗi 2-3 ngày, tag Nhóm A/C review trong 48h.

### Nhóm C — Tuần 1

**Mục tiêu cuối tuần:** chạy `python -m engine.cli render-outcome --scenarios mocks/scenarios.json --diagnosis mocks/diagnosis.json --output output/` ra outcome markdown đầy đủ 16 section header (phần lớn còn placeholder).

**Việc cần làm:**

1. Tạo skeleton `engine/segmentation.py`, `engine/diagnosis.py`, `engine/synthesis.py`, `engine/outcome_generator.py`.
2. Viết `engine/templates/outcome_template.md` với 16 mục đầy đủ tiêu đề + bảng có placeholder.
3. Liệt kê 50-60 placeholder cần thay (lưu trong code dưới dạng dict).
4. Implement classifier sản phẩm với 7 quy luật, lưu trong `classifier_rules.json`.
5. Implement chẩn đoán mạng lưới hiện tại (giả định 3 hub lớn nhất).
6. Implement gán vai trò kho theo `ROLE_RULES`.
7. Implement render outcome đọc template + thay placeholder.
8. Viết CLI nhỏ `render-outcome` chạy độc lập với mock của Nhóm B.
9. Push PR mỗi 2-3 ngày, tag Nhóm A/B review trong 48h.

### Cập nhật tiến độ trong tuần

Mỗi tối trước khi nghỉ, mỗi người post 1 tin nhắn trong channel:

```
[ngày]
Hôm nay xong: [list]
Mai làm: [list]
Block: [nếu có]
PR mở: [link]
```

Nếu ai có block thì 2 người kia phản hồi qua channel hoặc DM trong 24 giờ. Nếu vẫn chưa giải quyết được sau 24 giờ → đặt video call 30 phút riêng giữa 2 người liên quan.

### Tiêu chí hoàn thành tuần 1 (chuẩn bị cho buổi 2)

- [ ] Nhóm A: chạy `build-od` ra 6 bảng, push lên repo
- [ ] Nhóm B: chạy `run-scenarios` ra 3 kịch bản, push lên repo
- [ ] Nhóm C: chạy `render-outcome` ra outcome markdown 16 mục, push lên repo
- [ ] Cả 3 đều có ít nhất 1 PR đã merge
- [ ] Channel chat có cập nhật ít nhất 5/6 ngày từ mỗi người

---

## 7. BUỔI GẶP 2 — INTEGRATION (Thứ 7, 17/5, 3 giờ)

Sau tuần 1, 3 người mang về 3 phần engine chạy được riêng lẻ với mock. Buổi này là lúc nối lại thành một engine duy nhất.

### Chuẩn bị trước (mỗi người mang đến):

- Output cuối tuần 1 đã push lên `main`
- Một list các blocker còn tồn đọng từ tuần 1
- Một list các thay đổi schema họ đã phát hiện trong tuần (nếu có)

### Agenda (3 giờ):

**Phút 0-20 — Tổng hợp blocker.** Mỗi người trình 5 phút phần mình. Note blocker chung. Ưu tiên 3 blocker ảnh hưởng nhiều người nhất.

**Phút 20-90 — Integration thật.** Cả 3 cùng chạy `python -m engine.cli run` end-to-end (không phải CLI nhỏ). Lần đầu chắc chắn sẽ fail vì schema mismatch hoặc tên cột. Cùng debug, fix tại chỗ. Chạy lại đến khi pipeline thông từ A → B → C ra outcome markdown.

**Phút 90-150 — Đọc outcome v0.5 (đã có data thật một phần).** Mỗi người đọc 1 phần (A đọc mục 1-5, B đọc 6-11, C đọc 12-16). Note 5 vấn đề lớn nhất. Đây là input cho tuần 2.

**Phút 150-180 — Phân việc tuần 2.** Mỗi người liệt kê việc cần làm để outcome v1 đạt 12-15 trang đầy đủ chất lượng. Confirm bằng channel.

### Output buổi 2:

- [ ] Pipeline `engine.cli run` end-to-end chạy thông
- [ ] Outcome v0.5 với một phần data thật, đã có note vấn đề
- [ ] Doc `meeting_2_notes.md` ghi quyết định + task list tuần 2
- [ ] Mỗi người confirm task tuần 2 trong channel

---

## 8. TUẦN 2 ASYNC (18/5 → 23/5, 6 ngày)

Tuần đào sâu. Mục tiêu: outcome v1 đầy đủ 12-15 trang, 9 kịch bản, 6 thành phần chi phí, classifier thật, vai trò kho.

### Nhóm A — Tuần 2

**Mục tiêu cuối tuần:** unit test coverage 75%, tích hợp output classifier của Nhóm C để tách demand theo dòng sản phẩm chính xác hơn.

**Việc cần làm:**

1. Apply output classifier của Nhóm C để tách `monthly_demand_by_region_product` chính xác (thay cho tỉ lệ ngành mặc định).
2. Bổ sung time-series decomposition nếu có dữ liệu O/D đa năm.
3. Cross-validate: tổng demand trong Phần 3 = tổng trong Phần 4 = tổng trong Phần 5 (sai số <1%).
4. Hoàn thiện unit tests, đẩy coverage lên 75%.
5. Bắt đầu draft phần "Dữ liệu và Phương pháp xử lý" trong báo cáo (3-4 trang trước, polish ở tuần 3).

### Nhóm B — Tuần 2

**Mục tiêu cuối tuần:** 9 kịch bản chạy parallel < 90 giây, đủ 6 thành phần chi phí.

**Việc cần làm:**

1. Implement 3 thành phần chi phí còn lại: lưu kho hàng tồn, linh hoạt mùa cao điểm, phạt SLA.
2. Implement đủ 9 kịch bản: thêm S1 (UFLP 4-hub), S4 (MCLP 8-hub), S5 (S3 + flex), S6 (demand+20%), S7 (fuel+15%), S8 (hub disruption).
3. Song song hoá bằng `multiprocessing.Pool(4)`. Đo runtime, tinh chỉnh để < 90s.
4. Tuning hệ số trong config: đảm bảo S3 cost < S0 × 0.85, S6 cost > S3 × 1.15.
5. Output đầy đủ `scenario_comparison.csv` 3 trục cost/service/risk.
6. Bắt đầu draft phần "Cơ sở lý thuyết" + "Kết quả thực nghiệm" trong báo cáo.

### Nhóm C — Tuần 2

**Mục tiêu cuối tuần:** outcome v1 đầy đủ 12-15 trang, mọi placeholder đã được fill bằng data thật.

**Việc cần làm:**

1. Sinh sách tay mùa vụ với 4-5 sự kiện (Q1 launch, Q2 appliance, Q3 refresh, Q4 promo, semiconductor surge).
2. Sinh lộ trình 4 giai đoạn dựa trên delta giữa S0 và S3.
3. Sinh business case: cost_saving_pct, service_improvement_pct, executive summary 2-3 câu.
4. Render outcome v1 với data thật. Đọc lại từ đầu đến cuối, ghi note 10-15 vấn đề.
5. Polish v1.5 (apply note tự đọc).
6. Test 3-câu với người ngoài đội (giảng viên, sinh viên năm trên, hoặc Claude/ChatGPT đóng vai SCM manager): "Tại sao 6 hub thay vì 5? Tại sao Pyeongtaek có node riêng? Tháng nào cần 3PL?". Nếu đạt 2/3 thì OK, polish thêm; nếu 0-1/3 thì viết lại template phần liên quan.
7. Bắt đầu draft phần "Tóm tắt điều hành" + "Kiến trúc engine" trong báo cáo.

### Tiêu chí hoàn thành tuần 2 (chuẩn bị cho buổi 3)

- [ ] 9 kịch bản chạy parallel < 90s
- [ ] 6 thành phần chi phí đầy đủ, không NaN
- [ ] Hub roles gán cho 6 hub trong S3
- [ ] Sách tay mùa vụ + lộ trình + business case xong
- [ ] Outcome v1.5 đã polish, đạt test 3-câu ≥ 2/3
- [ ] Mỗi nhóm đã có draft 3-4 trang phần báo cáo của mình

---

## 9. BUỔI GẶP 3 — POLISH & PLAN DELIVERY (Thứ 7, 24/5, 3 giờ)

Sau tuần 2, engine đã hoàn chỉnh và outcome v1.5 đã có chất lượng tốt. Buổi này tập trung vào 3 deliverable phi-code: outcome final, báo cáo, slide.

### Chuẩn bị trước:

- Outcome v1.5 đã polish, push lên repo
- Mỗi nhóm có draft 3-4 trang phần báo cáo
- Nhóm C có sketch slide structure

### Agenda (3 giờ):

**Phút 0-60 — Đọc outcome v1.5 chung.** Mỗi người đọc lại từ đầu đến cuối. Note thêm 5-10 vấn đề chưa fix. Quyết định: outcome final cần thêm gì, bỏ gì, polish gì.

**Phút 60-120 — Plan báo cáo cuối.** Đi qua từng phần báo cáo (9 phần). Confirm ai viết phần nào, deadline cụ thể trong tuần 3, format chuẩn (font, margin, citation style). Lập checklist.

**Phút 120-180 — Plan slide + Q&A.** Đi qua 18 slide (slide structure đã có từ buổi 1). Confirm ai trình bày phần nào. Brainstorm 10 câu Q&A có thể bị hỏi và câu trả lời sẵn.

### Output buổi 3:

- [ ] Doc `meeting_3_notes.md` với note polish outcome + plan báo cáo + plan slide + Q&A
- [ ] Mỗi nhóm confirm task tuần 3 (24-26/5) trong channel
- [ ] Lịch sync ngắn 26/5 tối đã được book

---

## 10. TUẦN 3 ASYNC (24/5 → 26/5, 3 ngày)

Tuần ngắn. Chỉ làm 3 việc: polish outcome final, viết báo cáo, làm slide. Không thêm tính năng engine.

### Nhóm A — Tuần 3

1. **Ngày 24/5 (Chủ nhật):** Hoàn thiện phần "Dữ liệu và Phương pháp xử lý" trong báo cáo (6-8 trang final). Bao gồm hình + bảng từ output engine.
2. **Ngày 25/5 (Thứ 2):** Slide section "Dữ liệu" 3-4 slide. Reproducibility check: clone repo trên máy khác và chạy CLI từ đầu, output phải y hệt.
3. **Ngày 26/5 (Thứ 3):** Bug bash phần mình. Đến tối đi sync ngắn.

### Nhóm B — Tuần 3

1. **Ngày 24/5:** Hoàn thiện phần "Cơ sở lý thuyết" + "Kết quả thực nghiệm 9 kịch bản" trong báo cáo (10-12 trang tổng). Verify AI-generated frontend render JSON đúng.
2. **Ngày 25/5:** Slide section "Tối ưu hoá" 4-5 slide. Chuẩn bị CLI dự phòng demo: pre-record screencast 60 giây.
3. **Ngày 26/5:** Bug bash. Final integration test. Đến tối đi sync ngắn.

### Nhóm C — Tuần 3

1. **Ngày 24/5:** Polish outcome final lần cuối (đọc lần 3, sửa ngôn ngữ, bổ sung 2-3 trích dẫn). Hoàn thiện phần "Tóm tắt điều hành" + "Kiến trúc engine" + "Outcome preview" + "Kết luận" trong báo cáo (10 trang).
2. **Ngày 25/5:** Tổng hợp toàn bộ báo cáo Word từ 3 nhóm thành 1 file thống nhất. Format chung. Thêm cover, mục lục, page number. Slide v1 đầy đủ 15-18 slide.
3. **Ngày 26/5:** Polish slide cuối cùng. Đến tối đi sync ngắn.

---

## 11. SYNC NGẮN — ĐÊM TRƯỚC MIDTERM (Thứ 3, 26/5 tối, 1.5 giờ)

Buổi sync cuối cùng trước midterm. Chỉ để check 3 thứ và dry run.

### Agenda:

**Phút 0-20 — Check 4 deliverable cuối.** Mở từng file: outcome final, báo cáo Word, slide, demo. Mỗi nhóm confirm phần mình OK.

**Phút 20-60 — Dry run thuyết trình.** Ai trình bày phần đó. Tổng 12-15 phút. Đo timing. Note slide nào quá dài, slide nào quá ngắn.

**Phút 60-90 — Q&A drill.** 10 câu hỏi đã chuẩn bị, mỗi người trả lời ngẫu nhiên 3-4 câu. Note câu nào trả lời chưa thuyết phục, polish overnight.

### Output sync ngắn:

- [ ] Confirm 4 deliverable đã sẵn sàng
- [ ] Slide đã polish theo timing
- [ ] Q&A doc đã được rehearse
- [ ] Plan ngày midterm: ai đi đâu, mang gì, đến mấy giờ

---

## 12. NGÀY MIDTERM (Thứ 4, 27/5)

**Sáng (9-11h):** Buffer fix bug nhỏ nếu cần. Đảm bảo demo URL chạy. Đảm bảo outcome.md mở được trong 30s. Đảm bảo CLI fallback chạy được trong 60s.

**Theo lịch hội đồng:** Thuyết trình 12-15 phút + Q&A 5-10 phút.

**Phân vai trình bày:**
- Nhóm C dẫn mở đầu (slide hook, vấn đề, kiến trúc) — 4 phút
- Nhóm A trình phần dữ liệu (slide nguồn data, demand 17 vùng, top corridors) — 3 phút
- Nhóm B trình phần tối ưu hoá (slide model, 9 kịch bản, kết quả so sánh) — 4 phút
- Nhóm C kết bằng outcome preview + demo + roadmap — 4 phút
- Q&A: chia nhau theo phần phụ trách

---

## 13. RỦI RO ASYNC-SPECIFIC

**Rủi ro async 1 — Buổi 1 không lock được contract đầy đủ.** Nếu cuối buổi 1 mà schema chưa rõ ràng hoặc mock data chưa sinh xong, cả tuần 1 sẽ trật hướng. Cách phòng: ưu tiên buổi 1 đủ 4 giờ, không cắt ngắn dưới 3.5 giờ. Nếu một thành viên đến trễ thì 2 người còn lại cứ tiếp tục agenda, người đến trễ tự catch up.

**Rủi ro async 2 — PR review trễ vượt 48 giờ.** Khi mỗi người làm độc lập, code có thể merge mà không ai review nếu PR không được tag rõ. Cách phòng: SLA 48h là binding, sau 48h tác giả có quyền tự merge với note "auto-merge". Nhưng điều này có thể đẩy bug vào main. Mitigation thêm: mỗi người tự test PR của mình bằng CI script đơn giản (chạy `pytest tests/test_<module>.py` + `python -m engine.cli ... --dry-run`).

**Rủi ro async 3 — Block không được phát hiện sớm.** Khi không có daily standup, một người có thể bị stuck 3-4 ngày mà không ai biết. Cách phòng: post tiến độ hàng ngày là binding (kể cả "hôm nay không xong gì cả" cũng phải post). Nếu 2 ngày liên tiếp một người không post, 2 người kia phải DM hỏi.

**Rủi ro async 4 — Một thành viên không tham gia buổi gặp.** Mất một buổi 4-giờ là mất 25% thời gian sync trong cả dự án. Cách phòng: ghi recording (Zoom record hoặc OBS), người vắng phải xem trong 24h, đọc notes, approve quyết định qua channel, có thể đặt 1-1 catch-up với 1 trong 2 người tham gia.

**Rủi ro async 5 — Schema mismatch tại buổi 2.** Có khả năng tuần 1 ai đó hiểu sai contract và viết code không khớp. Cách phòng: tại buổi 1 không chỉ lock schema mà còn sinh **mock data đúng schema**. Nếu mock chạy được qua tất cả CLI nhỏ thì đảm bảo schema thống nhất.

**Rủi ro async 6 — Outcome v1 không đạt 2/3 test 3-câu.** Đây là rủi ro kế thừa từ bản trước. Trong mô hình async, Nhóm C phải tự test 3-câu giữa tuần 2, không chờ buổi 3. Nếu fail thì alert trong channel và 2 nhóm còn lại hỗ trợ data hoặc viết lại phần outcome của mình.

**Rủi ro async 7 — Demo crash trước hội đồng (vẫn từ bản trước).** Cách phòng: pre-record screencast 60s ngày 25/5 làm backup. Có sẵn outcome.md mở trong tab. Có sẵn JSON output mở. Nếu crash thì chuyển sang screencast và tiếp tục.

---

## 14. CHECKLIST BÁM SÁT TIẾN ĐỘ

### Cuối tuần 1 (16/5 — chuẩn bị buổi 2)

- [ ] Nhóm A: `build-od` chạy ra 6 bảng
- [ ] Nhóm B: `run-scenarios` chạy ra 3 kịch bản
- [ ] Nhóm C: `render-outcome` chạy ra outcome markdown 16 mục với placeholder
- [ ] Mỗi người đã merge ít nhất 1 PR
- [ ] Channel có cập nhật từ mỗi người ít nhất 5/6 ngày

### Cuối tuần 2 (23/5 — chuẩn bị buổi 3)

- [ ] 9 kịch bản chạy parallel < 90s
- [ ] 6 thành phần chi phí đầy đủ
- [ ] Hub roles gán cho 6 hub
- [ ] Outcome v1.5 đạt test 3-câu ≥ 2/3
- [ ] Mỗi nhóm có draft 3-4 trang báo cáo

### Cuối tuần 3 (26/5 — sync ngắn)

- [ ] Báo cáo Word ≥ 30 trang đã tổng hợp
- [ ] Slide ≥ 15 slide đã polish
- [ ] Outcome final đã polish
- [ ] CLI fallback có screencast 60s
- [ ] Q&A doc 10 câu đã rehearse

### Ngày midterm (27/5)

- [ ] Buffer 9-11h sáng để fix bug nhỏ
- [ ] Demo URL accessible
- [ ] Backup screencast ready
- [ ] 3 thành viên có mặt đúng giờ thuyết trình

---

## 15. NGUYÊN TẮC LÀM VIỆC

**Không ai chờ ai.** Mọi phần phải có CLI riêng chạy được với mock. Nếu phải chờ thì có sai trong thiết kế phụ thuộc.

**Mock đầu tiên, code thật sau.** Buổi 1 sinh mock cho tất cả 12 bảng intermediate. Nếu mock chưa đủ, buổi 1 chưa kết thúc.

**Schema lock là bất di bất dịch.** Sau buổi 1 không đổi schema. Nếu phải đổi thì cần cuộc gọi 1-1 giữa 2 người liên quan + thông báo channel.

**PR là kênh giao tiếp chính.** Code nói chuyện qua PR + commit message rõ ràng, không qua DM. Mỗi PR có description đủ để người khác đọc hiểu mà không cần hỏi.

**Tiến độ public mỗi ngày.** Post trong channel 1 dòng/ngày. Không cần dài, không cần đẹp, chỉ cần thật.

**Buổi gặp dùng để integrate, không dùng để code.** 3 buổi Saturday + 1 sync ngắn — tổng 11.5 giờ. Đây là thời gian quý, dùng để giải quyết blocker và tích hợp, không dùng để gõ code chung.

---

*Kế hoạch async-first này thay thế kế hoạch sync trước đó. 4 file canonical (kiến trúc engine, kế hoạch này, JSON contract, outcome mẫu) đảm bảo dù không gặp nhau, cả đội vẫn nhìn về cùng một hướng.*
