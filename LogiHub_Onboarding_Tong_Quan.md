# GIỚI THIỆU DỰ ÁN LOGIHUB — TÀI LIỆU CHO NGƯỜI MỚI

*Đọc tài liệu này từ đầu đến cuối, bạn sẽ hiểu LogiHub là gì, làm như thế nào, dữ liệu ở đâu, kết quả ra cái gì, và nhóm 3 người đang làm việc thế nào để hoàn thành dự án trước giữa kỳ ngày 27/5/2026.*

*Thời gian đọc ước tính: 30-40 phút.*

---

## MỤC LỤC

1. Dự án LogiHub là gì?
2. Vấn đề thực tế dự án đang giải quyết
3. Sản phẩm LogiHub Intelligence — bức tranh tổng thể
4. Engine — bộ não của LogiHub
5. Đầu vào — những dữ liệu engine cần
6. 10 phần xử lý của engine — đi từ dữ liệu thô đến khuyến nghị
7. Đầu ra — engine sinh ra cái gì
8. Bản phân tích mẫu — sản phẩm trung tâm
9. Đội phát triển — 3 sinh viên chia 3 nhóm
10. Cách làm việc của đội — mô hình async
11. Lịch 18 ngày đến giữa kỳ
12. Bốn sản phẩm phải nộp ngày 27/5
13. Vai trò của AI trong dự án
14. Các khái niệm chuyên môn cần biết
15. Cấu trúc thư mục dự án
16. Các file tài liệu liên quan
17. Hướng dẫn người mới bắt đầu
18. Câu hỏi thường gặp

---

## 1. DỰ ÁN LOGIHUB LÀ GÌ?

LogiHub Intelligence là một sản phẩm phần mềm giúp các doanh nghiệp lớn quyết định nên đặt kho hàng (warehouse, hub) ở đâu, mỗi kho phục vụ những vùng nào, và mạng lưới đó có chi phí bao nhiêu. Đối tượng sử dụng là các doanh nghiệp có hệ thống chuỗi cung ứng phức tạp — ví dụ Samsung Electronics có nhà máy điện thoại, nhà máy chip bán dẫn, nhà máy đồ gia dụng, hệ thống bán lẻ và dịch vụ trải khắp Hàn Quốc.

Sản phẩm gồm hai phần. **Phần đầu là một engine xử lý** (lõi thuật toán) chạy phía sau hậu trường, nhận dữ liệu logistics thô của doanh nghiệp và trả ra các khuyến nghị chiến lược. **Phần thứ hai là một website** (frontend) cho phép người dùng upload dữ liệu, xem kết quả trên bản đồ, so sánh các kịch bản, và đọc các phân tích.

Đội phát triển hiện tại là 3 sinh viên Việt Nam. Đây là dự án nghiên cứu kết thúc bằng buổi thuyết trình giữa kỳ ngày 27/5/2026. Trong phạm vi giữa kỳ, đội tập trung 100% vào **engine** — phần website sẽ được dựng bởi AI assistance dựa trên kết quả engine xuất ra dưới dạng JSON.

---

## 2. VẤN ĐỀ THỰC TẾ DỰ ÁN ĐANG GIẢI QUYẾT

### 2.1. Tại sao doanh nghiệp lớn cần phần mềm quyết định mạng lưới kho?

Hãy hình dung một doanh nghiệp như Samsung Electronics ở Hàn Quốc. Họ có nhiều dòng sản phẩm rất khác nhau: điện thoại Galaxy ra mắt mỗi quý, đồ gia dụng cồng kềnh như tủ lạnh và máy giặt, chip bán dẫn giá trị cao cần bảo mật cao khi vận chuyển, và phụ tùng dịch vụ phải giao trong 24-48 giờ. Mỗi dòng sản phẩm có yêu cầu logistics khác nhau.

Cùng lúc, họ phải phục vụ 17 vùng hành chính của Hàn Quốc, mỗi vùng có nhu cầu khác nhau và đặc điểm khác nhau. Seoul và Gyeonggi là vùng đô thị dày đặc với nhu cầu thương mại điện tử cao. Busan có cảng biển quan trọng cho xuất nhập khẩu. Gwangju là trung tâm sản xuất đồ gia dụng. Pyeongtaek/Hwaseong là cụm nhà máy chip. Đảo Jeju cách xa đất liền và phải có làn vận chuyển riêng.

Câu hỏi mà giám đốc chuỗi cung ứng phải trả lời: nên đặt bao nhiêu kho? Đặt ở đâu? Mỗi kho phục vụ vùng nào? Kho nào xử lý dòng sản phẩm nào? Mùa cao điểm có cần thuê thêm kho ngoài không? Triển khai theo lộ trình nào để giảm rủi ro?

### 2.2. Cách hiện tại doanh nghiệp đang làm

Hầu hết doanh nghiệp dùng kết hợp ba thứ: kinh nghiệm cá nhân của giám đốc, các bảng tính Excel phức tạp, và thỉnh thoảng thuê tư vấn bên ngoài. Cách này có ba vấn đề lớn. Một là chậm — phân tích một mạng lưới mới mất vài tuần đến vài tháng. Hai là khó cập nhật — khi nhu cầu thay đổi (ví dụ giá xăng tăng, sản phẩm mới ra mắt) thì phải làm lại từ đầu. Ba là khó so sánh nhiều phương án — Excel chỉ chạy được một kịch bản tại một thời điểm.

### 2.3. Cách LogiHub đề xuất

LogiHub tự động hoá toàn bộ quá trình phân tích bằng cách kết hợp ba thứ: dữ liệu logistics thực của doanh nghiệp (hoặc dữ liệu công khai như Korean Freight O/D), các mô hình tối ưu hoá toán học (P-median, UFLP, CFLP, MCLP), và một bộ template "kể chuyện" để biến kết quả số học thành ngôn ngữ quản trị mà giám đốc đọc hiểu được.

Kết quả là doanh nghiệp upload data → bấm nút Run → trong vài phút có một bản phân tích 12-15 trang nói rõ nên làm gì, tại sao, và lộ trình triển khai ra sao.

---

## 3. SẢN PHẨM LOGIHUB INTELLIGENCE — BỨC TRANH TỔNG THỂ

```
┌──────────────────────────────────────────────────────────────┐
│  NGƯỜI DÙNG (giám đốc chuỗi cung ứng / nhà phân tích)        │
└──────────────────────────────────────────────────────────────┘
                              │
                  upload data │ xem kết quả
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  WEBSITE (frontend Next.js — AI assistance dựng cho midterm) │
│  · Trang upload dữ liệu                                       │
│  · Bản đồ mạng lưới                                           │
│  · Bảng so sánh kịch bản                                      │
│  · Trang xem outcome markdown                                 │
└──────────────────────────────────────────────────────────────┘
                              │
                          API │ JSON
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  ENGINE (Python · backend · ĐỘI 3 NGƯỜI LÀM)                  │
│                                                              │
│  Phần 1: Đọc dữ liệu                                          │
│  Phần 2: Chuẩn hoá                                            │
│  Phần 3: Xây ma trận O/D                                      │
│  Phần 4: Nhu cầu theo tháng + dòng sản phẩm                   │
│  Phần 5: Phân loại sản phẩm                                   │
│  Phần 6: Tính 6 thành phần chi phí                            │
│  Phần 7: Tính công suất kho                                   │
│  Phần 8: Chẩn đoán mạng lưới hiện tại                         │
│  Phần 9: Chạy 9 kịch bản tối ưu hoá                          │
│  Phần 10: Sinh khuyến nghị + bản phân tích markdown           │
└──────────────────────────────────────────────────────────────┘
                              │
                       đọc từ │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  DỮ LIỆU                                                      │
│  · Korean Freight O/D 2022/2023 (công khai)                   │
│  · Warehouse Registry Hàn Quốc (công khai)                    │
│  · Shipment data của doanh nghiệp (giả lập cho midterm)       │
└──────────────────────────────────────────────────────────────┘
```

Trong dự án giữa kỳ, đội tập trung vào **Engine** (ô giữa). Phần website (ô trên) sẽ được AI dựng dựa trên JSON contract mà engine xuất ra.

---

## 4. ENGINE — BỘ NÃO CỦA LOGIHUB

### 4.1. Engine không phải là một solver đơn lẻ

Nhiều người nghĩ một phần mềm quyết định kho chỉ cần một mô hình toán học (ví dụ P-median) chạy là xong. Sai. Để ra được khuyến nghị chất lượng cao, engine phải có một chuỗi xử lý gồm 10 phần nối tiếp nhau: đọc dữ liệu, làm sạch, tổng hợp, tính chi phí, tính công suất, chẩn đoán hiện trạng, tối ưu hoá, mô phỏng kịch bản, sinh khuyến nghị quản trị.

Bài toán tối ưu hoá chỉ là một mắt xích trong chuỗi — chiếm khoảng 30% giá trị. 70% còn lại nằm ở việc chuẩn bị dữ liệu đúng, mô hình hoá chi phí đầy đủ, mô phỏng nhiều kịch bản, và biến kết quả số học thành ngôn ngữ quản trị.

### 4.2. So sánh "engine thường" và "engine cao cấp"

Một engine thường chỉ trả lời được một câu hỏi: "nên mở 5 kho ở đâu?". Engine cao cấp như LogiHub trả lời được 10 câu hỏi cùng lúc:

1. Nên mở bao nhiêu kho?
2. Mỗi kho phục vụ dòng sản phẩm nào?
3. Vùng nào được phục vụ bởi kho nào?
4. Kho nào sẽ quá tải vào tháng nào?
5. Tại sao mạng lưới hiện tại đang đắt?
6. Kịch bản nào tối ưu về chi phí?
7. Kịch bản nào tối ưu về dịch vụ?
8. Kịch bản nào tốt nhất trong mùa cao điểm?
9. Có nên dùng thuê kho ngoài (3PL) không?
10. Phương án triển khai theo từng giai đoạn là gì?

Để trả lời được 10 câu trên, engine phải có 5 năng lực: thông minh về nhu cầu (demand intelligence), thông minh về chi phí (cost intelligence), thông minh về công suất (capacity intelligence), thông minh về tối ưu hoá (optimization intelligence), và thông minh về khuyến nghị (recommendation intelligence).

---

## 5. ĐẦU VÀO — NHỮNG DỮ LIỆU ENGINE CẦN

### 5.1. Hai nguồn dữ liệu chính cho phiên bản midterm

**Nguồn 1 — Korean Freight O/D 2022/2023 (công khai).** Đây là bộ dữ liệu vận chuyển hàng hoá toàn quốc của Hàn Quốc do Bộ Giao thông Hàn Quốc xuất bản. File gốc là Excel, có sheet tiếng Hàn. Đội đã có file đã processed `od_clean_long_2023.csv` trong thư mục `logistics_hub_research/data_processed/`. Cấu trúc file: mỗi dòng là một cặp (vùng đi, vùng đến, lượng hàng tấn/năm).

**Nguồn 2 — Warehouse Registry Hàn Quốc (công khai).** Bộ đăng ký kho công nghiệp của Hàn Quốc. File đã processed: `warehouse_geocoded.csv` (đã thêm toạ độ kinh độ vĩ độ) và `warehouse_capacity_17_regions.csv` (đã tổng hợp công suất theo 17 vùng). Mỗi dòng là một kho với các cột: warehouse_id, vùng, toạ độ, diện tích, công suất (số pallet hoặc tấn).

### 5.2. Dữ liệu giả lập cho doanh nghiệp

Vì đây là dự án midterm chưa có khách hàng thật, engine vẫn phải xử lý được dữ liệu doanh nghiệp giả lập. Cụ thể:

- **Shipment data:** chuyến hàng từ nhà máy đến khách hàng. Cột chính: shipment_id, origin (nhà máy), destination (khách hàng), volume, ngày.
- **Order data:** đơn hàng theo vùng. Cột chính: order_id, customer_region, quantity, ngày.
- **Cost data:** giá cước theo tuyến vận chuyển. Cột: lane, carrier, rate, mode (đường bộ, hàng không, đường biển).
- **Lead time data:** thời gian giao hàng. Cột: origin, destination, days.

Engine có một file generator (`generate_mock_data.py`) sinh dữ liệu giả lập để test. Đội dùng generator này khi chưa có dữ liệu doanh nghiệp thật.

### 5.3. Tại sao Korean Freight O/D đóng vai trò proxy thay cho data doanh nghiệp thật?

Đây là **quyết định thiết kế cốt lõi** của dự án, người mới cần hiểu rõ trước khi đi tiếp.

**Vấn đề:** Engine LogiHub được thiết kế cho doanh nghiệp như Samsung, LG, Hyundai sử dụng. Đầu vào lý tưởng là dữ liệu vận chuyển nội bộ của họ — hàng triệu chuyến hàng có ghi rõ SKU (mã sản phẩm), số lượng, vùng đi, vùng đến, ngày, khách hàng cuối, hợp đồng vận chuyển, chi phí thực tế. Nhưng dữ liệu này thuộc loại **bí mật kinh doanh tuyệt đối** — không doanh nghiệp nào public, không có dataset học thuật nào chứa, và đội sinh viên không thể tiếp cận trong khuôn khổ dự án midterm.

**Giải pháp proxy:** Thay vì có data của một doanh nghiệp cụ thể, đội dùng **Korean Freight O/D 2022/2023** do Bộ Giao thông Hàn Quốc xuất bản. Dataset này tổng hợp toàn bộ vận chuyển hàng hoá liên vùng tại Hàn Quốc của tất cả ngành — không phân biệt doanh nghiệp, không phân biệt sản phẩm, chỉ có cặp (vùng đi, vùng đến, lượng hàng năm).

**Tại sao proxy này hợp lý:** dòng vận chuyển tổng của Hàn Quốc phản ánh khá chính xác **cấu trúc địa lý của nhu cầu logistics quốc gia** — vùng nào tiêu thụ nhiều, vùng nào sản xuất nhiều, hành lang nào tải lớn. Một doanh nghiệp lớn như Samsung tham gia đáng kể vào dòng vận chuyển tổng đó, nên cấu trúc địa lý của nhu cầu Samsung tương tự với cấu trúc tổng (đến mức scale).

**Hệ quả của việc dùng proxy:**

Một là **engine không biết shipment đó là sản phẩm gì**. Korean Freight O/D chỉ có volume, không có SKU. Vì vậy Phần 5 (Phân loại sản phẩm) phải **đoán** dòng sản phẩm dựa trên đặc điểm vùng đi và vùng đến: tuyến từ Gumi đi có 35% xác suất là điện thoại (vì Gumi có nhà máy Samsung điện thoại), tuyến từ Gwangju đi có 50% xác suất là đồ gia dụng (vì Gwangju có nhà máy đồ gia dụng), v.v. Đây là 7 quy luật phân loại trong `classifier_rules.json`.

Hai là **demand theo dòng sản phẩm là ước lượng, không phải đo trực tiếp**. Engine xuất `demand_by_product_family.csv` với độ tin cậy thấp hơn `regional_demand.csv`. Báo cáo phải nêu rõ giả định này.

Ba là **chi phí và SLA cũng dựa trên hệ số mặc định**, không phải hợp đồng thật của Samsung. Hệ số `0.18 USD/ton-km` cho điện thoại là benchmark ngành, không phải giá hợp đồng thật. Output engine vì vậy có chất lượng "demonstration grade" chứ không phải "production grade".

**Bù lại bằng case mẫu Samsung Mobile:** Để outcome mẫu thuyết phục, đội xây một case study cụ thể cho Samsung Mobile (10 mẫu Galaxy) trong file `Outcome_Sample_Samsung_Mobile_10Models.md`. Case này **giả định** đầy đủ data Samsung mà engine sẽ có nếu Samsung thật sự dùng sản phẩm — bao gồm 1.18 triệu units/tháng phân bổ chi tiết theo 17 vùng × 4 nhóm vòng đời, calendar 4 sự kiện peak, master data 10 SKU. Nói cách khác: case Samsung là một bản phân tích "what if Samsung actually used LogiHub", còn engine bản midterm chạy trên Korean Freight O/D thật để chứng minh kỹ thuật.

**Tóm lại trong một câu:** Korean Freight O/D đóng vai trò proxy cho data Samsung thật với chi phí mất một phần độ chính xác về phân loại sản phẩm, đổi lại cho phép đội sinh viên xây và validate engine end-to-end trong khuôn khổ midterm mà không cần ký NDA với doanh nghiệp.

### 5.4. Cấu trúc dữ liệu chuẩn hoá nội bộ

Sau khi đọc dữ liệu thô, engine biến mọi thứ về cấu trúc chuẩn:

- **17 vùng hành chính của Hàn Quốc:** Seoul, Gyeonggi, Incheon, Busan, Daegu, Daejeon, Gwangju, Ulsan, Sejong, Gangwon, Chungbuk, Chungnam, Jeonbuk, Jeonnam, Gyeongbuk, Gyeongnam, Jeju.
- **6 dòng sản phẩm:** mobile_launch (điện thoại di động ra mắt), bulky_appliance (đồ gia dụng cồng kềnh), high_value_secure (hàng giá trị cao như chip), finished_goods (hàng thành phẩm thông thường), spare_parts (phụ tùng), ecommerce_small (hàng thương mại điện tử nhỏ).
- **12 tháng:** từ tháng 1 đến tháng 12, mỗi sản phẩm có hệ số mùa vụ riêng.
- **Đơn vị chuẩn:** tấn (ton). Mọi thứ khác (kg, mét khối, hộp) được chuyển đổi về tấn theo bảng quy đổi.

---

## 6. 10 PHẦN XỬ LÝ CỦA ENGINE — ĐI TỪ DỮ LIỆU THÔ ĐẾN KHUYẾN NGHỊ

Hãy hình dung engine là một dây chuyền nhà máy. Dữ liệu đi vào ở phần 1, đi qua từng phần và được biến đổi/làm giàu, đến phần 10 thì sinh ra bản phân tích.

### Phần 1 — Đọc dữ liệu thô

Đây là phần đơn giản nhất nhưng dễ sai nhất. Nó mở các file Excel/CSV gốc và biến thành bảng dữ liệu (DataFrame) trong Python để các phần sau dùng. Vì file Hàn Quốc có sheet tiếng Hàn nên phần này phải biết encoding UTF-8 và tên cột tiếng Hàn ánh xạ sang tiếng Anh.

### Phần 2 — Chuẩn hoá dữ liệu

Dữ liệu thô luôn lộn xộn. Một số ghi "Suwon-si, Gyeonggi-do", một số ghi "수원시, 경기도", một số ghi "Suwon". Phần này biến tất cả về một định dạng chuẩn: 17 vùng hành chính chính thức. Đồng thời chuyển đơn vị (kg → tấn, hộp → tấn-tương-đương), thêm toạ độ trung tâm vùng nếu thiếu.

### Phần 3 — Xây ma trận O/D

Doanh nghiệp thường không có file tên "ma trận O/D". Họ có dữ liệu vận chuyển từng chuyến. Phần này tổng hợp tất cả các chuyến thành một ma trận 17×17 — mỗi ô là tổng lượng hàng từ vùng A đến vùng B. Sau đó tính ra nhu cầu của từng vùng (vào, ra, tổng) và liệt kê 20 tuyến lớn nhất.

### Phần 4 — Nhu cầu theo tháng và theo dòng sản phẩm

Dữ liệu chỉ cho biết nhu cầu cả năm. Để biết tháng nào cao điểm, engine nhân với một bảng chỉ số mùa vụ. Ví dụ: điện thoại có chỉ số 1.35 vào tháng 12 (Galaxy ra mắt + khuyến mãi cuối năm), 0.95 vào tháng 1. Đồ gia dụng có chỉ số 1.40 vào tháng 5 (chuẩn bị mùa nóng), 0.85 vào tháng 9.

### Phần 5 — Phân loại theo dòng sản phẩm

Vì dữ liệu Korean Freight O/D không nói rõ chuyến nào là điện thoại hay tủ lạnh, engine phải đoán dựa trên đặc điểm tuyến đường. Có 7 quy luật phân loại. Ví dụ: tuyến từ Gumi đi thường có 35% điện thoại (vì Gumi có nhà máy Samsung điện thoại). Tuyến từ Gwangju đi thường có 50% đồ gia dụng. Tuyến vào cụm Pyeongtaek/Hwaseong thường có chip bán dẫn.

### Phần 6 — Tính 6 thành phần chi phí

Tổng chi phí của một mạng lưới kho gồm 6 thành phần:

1. **Vận chuyển** — chi phí xe tải/tàu chở hàng từ kho ra khách hàng. Tỷ lệ với khoảng cách × khối lượng × giá cước.
2. **Cố định kho** — tiền thuê đất, vận hành, bảo vệ kho. Trả hàng năm bất kể có hàng hay không.
3. **Xử lý hàng** — bốc dỡ, đóng gói, kiểm đếm. Mỗi tấn hàng đi qua kho tốn một khoản.
4. **Lưu kho hàng tồn** — tiền "đắp" trong hàng tồn kho. Hàng giá trị cao thì tốn nhiều hơn.
5. **Linh hoạt mùa cao điểm** — làm thêm giờ + thuê kho ngoài (3PL) khi vượt công suất.
6. **Phạt SLA** — đền bù khách hàng nếu giao trễ.

Mỗi dòng sản phẩm có giá khác nhau cho từng thành phần.

### Phần 7 — Công suất kho

Mỗi kho có công suất cơ bản (số tấn/tháng). Có thể nới ra thêm 20% bằng làm thêm giờ, thêm 30% bằng thuê 3PL. Engine tính tỉ lệ sử dụng theo từng tháng cho từng kho, phân thành 5 trạng thái: dư công suất (<70%), khoẻ (70-90%), cảnh báo (90-100%), quá tải (100-110%), khủng hoảng (>110%).

### Phần 8 — Chẩn đoán mạng lưới hiện tại

Trước khi đề xuất mạng lưới mới, engine phải nói được mạng lưới hiện tại có gì sai. Phần này giả định mạng lưới hiện tại là 3 kho lớn nhất (vì ta không có data thật về mạng lưới hiện tại của doanh nghiệp), tính các chỉ số: kho nào quá tải, kho nào dư công suất, tuyến nào tốn chi phí cao, vùng nào phục vụ kém.

### Phần 9 — Tối ưu hoá và 9 kịch bản

Đây là tim của engine. Có 5 mô hình toán học:

- **P-median** chọn đúng P kho sao cho tổng nhu cầu × khoảng cách nhỏ nhất.
- **UFLP** (Uncapacitated Facility Location) tự chọn số kho dựa trên cân bằng giữa chi phí cố định và vận chuyển.
- **CFLP** (Capacitated FLP) giống UFLP nhưng có ràng buộc công suất.
- **MCLP** (Maximal Covering Location Problem) tối đa nhu cầu được phục vụ trong một bán kính.
- **Hybrid-CFLP** là CFLP có thêm chiều dòng sản phẩm — kho nào được phép xử lý dòng nào.

Sau khi có 5 mô hình, engine chạy 9 kịch bản song song:

| Mã | Tên | Mô tả |
| --- | --- | --- |
| S0 | Hiện tại | Mạng lưới đối chứng |
| S1 | Tối thiểu chi phí 4 kho | Cắt số kho xuống còn 4 |
| S2 | Generic 5 kho | Không phân loại sản phẩm |
| S3 | Hybrid 6-node | **Khuyến nghị chính** — 5 kho vùng + 1 node bảo mật cho chip |
| S4 | High-service 8 kho | Dịch vụ cao, chi phí cao |
| S5 | S3 + thuê 3PL mùa cao điểm | Phương án vận hành thực tế |
| S6 | Stress test demand +20% | Kiểm tra khi nhu cầu tăng đột biến |
| S7 | Stress test fuel +15% | Kiểm tra khi giá xăng tăng |
| S8 | Stress test gián đoạn 1 kho | Kiểm tra resilience |

Mỗi kịch bản trả về 3 chỉ số: chỉ số chi phí (so với S0=100), tỉ lệ phục vụ %, điểm rủi ro (0-1).

### Phần 10 — Sinh khuyến nghị và bản phân tích

Phần cuối biến kết quả số thành ngôn ngữ quản trị. Bốn việc cụ thể:

Một là **gán vai trò cho mỗi kho mở** trong S3. Có 6 vai trò: kho metro (phục vụ đô thị), node bảo mật (cho chip), kho cân bằng trung tâm, kho ra mắt sản phẩm, kho hàng cồng kềnh, kho phía nam và cảng. Việc gán dựa trên vị trí địa lý + dòng sản phẩm chiếm tỉ lệ lớn nhất trong nhu cầu kho phục vụ.

Hai là **xây ma trận phân bổ** vùng × dòng sản phẩm × kho nào phục vụ.

Ba là **sinh sách tay mùa vụ**: với mỗi sự kiện cao điểm (ra mắt Galaxy Q1, mùa gia dụng Q2-Q3, khuyến mãi Q4, chip cao điểm), engine đề xuất 2-3 hành động cụ thể.

Bốn là **sinh lộ trình triển khai 4 giai đoạn** từ tái phân bổ vùng đến control tower vận hành.

Sau đó engine ghép tất cả vào một template markdown 16 mục, thay các placeholder bằng dữ liệu thật, ra file `outcome_sample_full.md`.

---

## 7. ĐẦU RA — ENGINE SINH RA CÁI GÌ

Khi chạy `python -m engine.cli run --input data/ --output output/`, engine sinh ra ba nhóm output.

### 7.1. 12 bảng CSV trong `output/tables/`

Các bảng dữ liệu trung gian, mỗi bảng có schema cố định:

| Nhóm | Bảng |
| --- | --- |
| Nhu cầu | regional_demand, monthly_demand_by_region, monthly_demand_by_region_product, top_od_lanes |
| Chi phí | transport_cost_by_lane, warehouse_fixed_cost_by_hub, handling_cost_by_product_hub, inventory_holding_cost_by_month, seasonal_flex_cost, sla_penalty_by_lane |
| Công suất | utilization_by_hub_month, capacity_gap_by_peak_period |
| Tối ưu hoá | selected_hubs_by_scenario, scenario_comparison, region_to_hub_allocation_by_product |
| Chẩn đoán | current_network_health, high_cost_lanes, overloaded_hubs |
| Khuyến nghị | hub_role_assignment, recommended_network |

### 7.2. File JSON `engine_run_<timestamp>.json`

Đây là output chính cho frontend. Một file JSON đầy đủ tuân theo `engine_contract.schema.json`. Cấu trúc gồm các khối: thông tin chạy, mảng 9 kịch bản với chi tiết từng kịch bản, mạng lưới (kho + phân bổ), phân tích chi phí 6 thành phần, chẩn đoán, sách tay mùa vụ, lộ trình, business case, báo cáo chất lượng dữ liệu.

Frontend (do AI dựng) đọc JSON này và render thành Dashboard, Network Map, Scenario Comparison, Business Case views.

### 7.3. File markdown `outcome_sample_full.md`

Đây là **deliverable trung tâm** của midterm. Một file markdown 12-15 trang được sinh tự động bằng cách áp template 16 mục với data thật từ engine.

Đây là file quan trọng nhất vì hội đồng có thể không bấm thử frontend, nhưng họ sẽ đọc bản phân tích này để đánh giá chất lượng engine.

---

## 8. BẢN PHÂN TÍCH MẪU — SẢN PHẨM TRUNG TÂM

### 8.1. Bản phân tích là gì?

`outcome_sample_full.md` là một file markdown 12-15 trang trông giống như báo cáo của một giám đốc chuỗi cung ứng cấp cao viết cho ban giám đốc. Nội dung gồm 16 mục theo cấu trúc của bản Samsung mẫu mà đội đã tham khảo.

### 8.2. Cấu trúc 16 mục

| Mục | Tên | Trang | Người viết |
| --- | --- | --- | --- |
| 0 | Tóm tắt điều hành | 1 | Nhóm C |
| 1 | Phân lớp nhu cầu theo đặc thù sản phẩm | 0.5 | Nhóm A |
| 2 | Phân tích nhu cầu theo 17 vùng | 1 | Nhóm A |
| 3 | Vấn đề mạng lưới hiện tại | 1 | Nhóm C |
| 4 | Cấu trúc chi phí | 0.5 | Nhóm B |
| 5 | Chẩn đoán tuyến chi phí cao | 0.5 | Nhóm B |
| 6 | Chiến lược số kho | 0.3 | Nhóm B |
| 7 | Thiết kế mạng lưới khuyến nghị | 0.7 | Nhóm B |
| 8 | Phân bổ vùng → kho | 0.7 | Nhóm C |
| 9 | Phân tích công suất sử dụng | 0.5 | Nhóm B |
| 10 | Phân tích nhu cầu mùa vụ | 0.7 | Nhóm A + C |
| 11 | So sánh 9 kịch bản | 0.7 | Nhóm B |
| 12 | Khuyến nghị cuối cùng | 0.5 | Nhóm C |
| 13 | Lộ trình triển khai | 1 | Nhóm C |
| 14 | Output điều hành | 0.3 | Nhóm C |
| 15 | Khác biệt với output thông thường | 0.3 | Nhóm C |
| 16 | One-line product value | 0.1 | Nhóm C |

### 8.3. Tiêu chuẩn vàng cho bản phân tích

Mọi con số trong bản phân tích phải do engine sinh ra, không gõ tay. Mỗi bảng số phải có ít nhất 1-2 câu diễn giải kiểu "manager đọc rồi hiểu". Ngôn ngữ phải là "senior SCM manager", không phải "academic paper". Phải có ít nhất 2 nguồn tham chiếu công khai để tăng độ tin cậy.

### 8.4. Bài test 3 câu

Bản phân tích đạt chuẩn nếu một người ngoài đội đọc 5 phút rồi giải thích lại được ba câu:

1. Tại sao engine đề xuất 6 kho thay vì 5?
2. Tại sao Pyeongtaek có node riêng?
3. Tháng nào cần thêm 3PL flex?

Nếu đạt 3/3 thì xuất sắc. 2/3 là OK nhưng cần polish. 0-1/3 là phải viết lại.

---

## 9. ĐỘI PHÁT TRIỂN — 3 SINH VIÊN CHIA 3 NHÓM

Đội chia thành 3 nhóm theo phần engine sở hữu. Mỗi nhóm tự đủ để hoàn thành phần mình mà không phụ thuộc vào tiến độ của 2 nhóm khác (nhờ mock data — sẽ giải thích ở phần sau).

### Nhóm A — Dữ liệu và Nhu cầu

**Phụ trách:** Phần 1, 2, 3, 4 của engine. Đây là tầng đáy của engine. Nếu sai thì cả engine sai.

**Người phù hợp:** thành viên cẩn thận, thoải mái với pandas, không sợ data tiếng Hàn.

**Bảng output cần làm:** regional_demand, od_matrix_17_region, top_od_lanes, monthly_demand_*, seasonal_index.

**Phần outcome viết:** mục 1, 2, nửa đầu mục 10.

**Phần báo cáo viết:** "Dữ liệu và Phương pháp xử lý" (6-8 trang).

**Phần slide:** 3-4 slide về dữ liệu + nhu cầu.

**CLI riêng:** `python -m engine.cli build-od --input data/ --output output/`

### Nhóm B — Chi phí, Công suất, Tối ưu hoá

**Phụ trách:** Phần 6, 7, 9 của engine. Đây là phần định lượng. Đòi hỏi nhiều OR và toán học.

**Người phù hợp:** thành viên giỏi nhất về Operations Research trong đội, thoải mái với PuLP và debug LP solver.

**Bảng output cần làm:** transport_cost_by_lane, warehouse_fixed_cost_by_hub, handling_cost_by_product_hub, inventory_holding_cost_by_month, seasonal_flex_cost, sla_penalty_by_lane, utilization_by_hub_month, selected_hubs_by_scenario, scenario_comparison.

**Phần outcome viết:** mục 4, 5, 6, 7, 9, 11.

**Phần báo cáo viết:** "Cơ sở lý thuyết" + "Kết quả thực nghiệm 9 kịch bản" (10-12 trang tổng).

**Phần slide:** 4-5 slide về tối ưu hoá + chi phí + kết quả.

**CLI riêng:** `python -m engine.cli run-scenarios --demand mocks/demand.csv --warehouse mocks/warehouse.csv --output output/`

### Nhóm C — Phân loại sản phẩm, Chẩn đoán, Tổng hợp khuyến nghị

**Phụ trách:** Phần 5, 8, 10 của engine. Phần "kể chuyện" cuối cùng. Cộng vai trò trưởng nhóm về báo cáo + slide + outcome final.

**Người phù hợp:** thành viên giỏi viết, có sense business storytelling.

**Bảng output cần làm:** classifier_rules.json, current_network_health, recommended_network, hub_role_assignment, region_to_hub_allocation_by_product, seasonal_playbook.json, implementation_roadmap.json, business_case_summary.md, **và outcome_sample_full.md (centerpiece)**.

**Phần outcome viết:** mục 0, 3, 8, nửa sau mục 10, mục 12-16. Cộng vai trò glue toàn bộ outcome thành 1 file mạch lạc.

**Phần báo cáo viết:** Tóm tắt điều hành + Vấn đề mục tiêu + Kiến trúc engine + Outcome preview + Kết luận (10 trang).

**Phần slide:** 6-7 slide gồm hook, vấn đề, kiến trúc, outcome preview, roadmap, Q&A.

**CLI riêng:** `python -m engine.cli render-outcome --scenarios mocks/scenarios.json --output output/`

---

## 10. CÁCH LÀM VIỆC CỦA ĐỘI — MÔ HÌNH ASYNC

### 10.1. Tại sao chọn async?

3 thành viên là sinh viên với lịch học bận, không thể ngồi làm việc cùng nhau hàng ngày. Tối đa gặp 1 lần/tuần. Vì vậy đội chọn mô hình **làm việc độc lập (async-first)**: mỗi người làm việc một mình tại nhà, gặp nhau chỉ để integrate và đồng bộ chiến lược.

### 10.2. Bốn nguyên tắc của async

**Một, mỗi người tự chạy được toàn bộ engine.** Không ai phải chờ ai để code. Cách làm: dùng mock data.

**Hai, mock data thay cho người ngồi cạnh.** Tại buổi gặp 1, đội sinh mock cho tất cả 12 bảng intermediate. Trong tuần 1, Nhóm B chưa cần Nhóm A xong O/D matrix — họ dùng `mocks/regional_demand.csv` thay tạm. Khi Nhóm A push code thật, Nhóm B chỉ cần xoá mock và pull để dùng output thật.

**Ba, contract lock ngay buổi 1.** Sau buổi gặp đầu tiên, không ai được đổi schema. Nếu phải đổi thì cần cuộc gọi 1-1 giữa 2 người liên quan + thông báo channel.

**Bốn, communication async qua chat + PR.** Daily update là 1 dòng trong channel mỗi tối. PR review SLA 48h. Sau 48h tác giả có quyền tự merge.

### 10.3. Lịch 4 buổi gặp

| Ngày | Loại | Thời lượng | Mục tiêu |
| --- | --- | --- | --- |
| Thứ 7 — 10/5 | Buổi 1: Kickoff | 4 giờ | Lock contract + sinh mock + phân việc |
| Thứ 7 — 17/5 | Buổi 2: Integration | 3 giờ | Tích hợp output thật, replace mock |
| Thứ 7 — 24/5 | Buổi 3: Polish | 3 giờ | Đọc outcome v1.7, plan báo cáo + slide |
| Thứ 3 — 26/5 tối | Sync ngắn | 1.5 giờ | Dry run thuyết trình, fix bug cuối |

Tổng thời gian sync: 11.5 giờ trong 18 ngày. Còn lại là async.

### 10.4. Channel chat hằng ngày

Mỗi tối trước khi nghỉ, mỗi người post 1 tin nhắn:

```
[ngày]
Hôm nay xong: ...
Mai làm: ...
Block: ... (nếu có)
PR mở: link
```

Không cần video call hằng ngày. Không cần meeting 9h sáng. Chỉ cần text. Nếu ai có block thì 2 người kia phản hồi trong 24 giờ.

---

## 11. LỊCH 18 NGÀY ĐẾN GIỮA KỲ

### 11.1. Tuần 1 — Tự xây phần mình (10/5 → 16/5)

**Buổi gặp 1 (Thứ 7, 10/5, 4 giờ):** kickoff. Lock JSON contract. Sinh đủ 12 mock files. Phân việc rõ ràng cho tuần 1.

**Async (11/5 → 16/5, 6 ngày):** mỗi nhóm về nhà làm việc một mình.

- Nhóm A: dựng engine ingestion + chuẩn hoá + ma trận O/D + nhu cầu tháng. Cuối tuần phải chạy được CLI `build-od` ra 6 bảng.
- Nhóm B: dựng 3 thành phần chi phí đầu + 5 model tối ưu + 3 kịch bản (S0, S2, S3). Cuối tuần phải chạy được CLI `run-scenarios` ra 3 kịch bản.
- Nhóm C: dựng classifier 7 quy luật + chẩn đoán mạng lưới + template outcome 16 mục. Cuối tuần phải chạy được CLI `render-outcome` ra outcome markdown.

### 11.2. Tuần 2 — Tích hợp + Đào sâu (17/5 → 23/5)

**Buổi gặp 2 (Thứ 7, 17/5, 3 giờ):** integration. Cùng chạy `python -m engine.cli run` end-to-end. Debug schema mismatch tại chỗ. Đọc outcome v0.5 với một phần data thật.

**Async (18/5 → 23/5, 6 ngày):**

- Nhóm A: apply classifier output từ Nhóm C để tách demand theo dòng sản phẩm chính xác hơn. Coverage test 75%. Bắt đầu draft báo cáo.
- Nhóm B: viết 3 thành phần chi phí còn lại. Implement 6 kịch bản còn lại (S1, S4, S5, S6, S7, S8). Song song hoá để chạy < 90 giây. Tuning hệ số.
- Nhóm C: sinh sách tay mùa vụ + lộ trình + business case. Render outcome v1 đầy đủ với data thật. Test 3 câu với người ngoài đội.

### 11.3. Tuần 3 — Hoàn thiện (24/5 → 26/5)

**Buổi gặp 3 (Thứ 7, 24/5, 3 giờ):** polish. Đọc outcome v1.5 chung. Plan báo cáo Word + slide chia phần. Q&A drill.

**Async (24/5 → 26/5, 3 ngày):**

- 24/5: mỗi nhóm viết phần báo cáo của mình.
- 25/5: mỗi nhóm viết slide của mình. Nhóm C tổng hợp báo cáo Word thành 1 file. Nhóm B chuẩn bị CLI dự phòng demo.
- 26/5: bug bash. Polish slide. Tối có sync ngắn dry run.

**Sync ngắn (Thứ 3, 26/5 tối, 1.5 giờ):** dry run thuyết trình. Q&A drill. Confirm 4 deliverable sẵn sàng.

### 11.4. Ngày midterm (Thứ 4, 27/5)

Sáng (9-11h): buffer fix bug nhỏ. Theo lịch hội đồng: thuyết trình 12-15 phút + Q&A 5-10 phút.

Phân vai trình bày: Nhóm C dẫn mở đầu (4 phút) → Nhóm A trình data (3 phút) → Nhóm B trình tối ưu hoá (4 phút) → Nhóm C kết bằng outcome + demo (4 phút) → Q&A chia nhau theo phần phụ trách.

---

## 12. BỐN SẢN PHẨM PHẢI NỘP NGÀY 27/5

### 12.1. Engine chạy được

Một bộ source code Python trong `logihub_application_code/backend/engine/` có thể chạy bằng:

```bash
python -m engine.cli run --input ../../logistics_hub_research/data_processed --output output/ --parallel
```

Câu lệnh này phải:
- Chạy không crash trên máy mới (clone repo + cài requirements.txt + chạy)
- Kết thúc trong dưới 90 giây
- Sinh ra đầy đủ 12 bảng CSV + 1 file JSON + 1 file markdown

### 12.2. Bản phân tích mẫu (centerpiece)

File `outcome_sample_full.md`. 12-15 trang. Đầy đủ 16 mục. Mọi số từ engine sinh, không gõ tay. Đạt test 3-câu ít nhất 2/3.

### 12.3. Báo cáo Word

File `LogiHub_Midterm_Report.docx`. Khoảng 30 trang. 9 phần: Tóm tắt điều hành, Vấn đề và mục tiêu, Cơ sở lý thuyết, Dữ liệu và phương pháp, Kiến trúc engine, Kết quả thực nghiệm, Outcome sample, Hạn chế và hướng phát triển, Tham khảo + phụ lục. Format A4, font Times New Roman 12, citation APA 7.

### 12.4. Slide thuyết trình

File `LogiHub_Midterm_Slide.pptx`. 15-18 slide. 16:9. Total 12-15 phút. Cấu trúc: hook (1) → vấn đề (1) → mục tiêu (1) → kiến trúc engine (1) → dữ liệu (3) → chẩn đoán (1) → optimization + scenarios (3) → outcome preview (2) → demo (2) → roadmap (1) → Q&A (1).

---

## 13. VAI TRÒ CỦA AI TRONG DỰ ÁN

### 13.1. AI dựng frontend

Vì đội tập trung 100% vào engine cho midterm, AI assistance (Claude, ChatGPT, Cursor, ...) sẽ dựng phần frontend Next.js dựa trên JSON output mà engine xuất ra. Cách làm:

1. Đội chốt JSON contract (file `engine_contract.schema.json`) tại buổi gặp 1.
2. AI đọc contract và dựng các view: Dashboard, Network Map, Scenario Comparison, Business Case.
3. AI hỗ trợ debug khi frontend không khớp với JSON.

Kết quả: midterm có demo web chạy được, dù phần lớn frontend là AI-generated.

### 13.2. AI test bản phân tích

Trong tuần 2, đội dùng Claude/ChatGPT đóng vai "senior SCM manager" để đọc bản phân tích v1 và trả lời 3 câu hỏi test. Đây là cách "ngoại bộ" để kiểm tra chất lượng outcome mà không tốn người thật.

### 13.3. AI hỗ trợ viết báo cáo

Đội có thể dùng AI để polish ngôn ngữ trong báo cáo Word, đặc biệt phần dịch tiếng Việt sang tiếng Anh cho phần Abstract. Tuy nhiên phần methodology phải do đội tự viết, không AI thay thế.

### 13.4. AI KHÔNG được dùng cho

- Code logic engine — đội phải hiểu và viết được toàn bộ engine
- Phân tích outcome chính (logic 16 mục) — đội phải tự thiết kế
- Trả lời Q&A trước hội đồng — đội phải tự trả lời

---

## 14. CÁC KHÁI NIỆM CHUYÊN MÔN CẦN BIẾT

### 14.1. Khái niệm logistics

**Hub / Warehouse / DC (Distribution Center).** Kho hàng đặt giữa nhà máy và khách hàng để gom hàng + phân phối. Trong dự án này, "hub" và "warehouse" dùng thay nhau.

**O/D matrix (Origin-Destination matrix).** Bảng thể hiện lượng hàng từ vùng A đến vùng B. Đơn vị thường là tấn/năm.

**Demand.** Nhu cầu hàng hoá của một vùng. Có thể là demand inbound (hàng nhập vào vùng), outbound (hàng xuất ra), hoặc total (tổng).

**Capacity utilization.** Tỉ lệ % công suất đang dùng. 100% là dùng hết, >100% là quá tải.

**Lead time.** Thời gian từ khi đặt hàng đến khi giao xong. Đo bằng giờ hoặc ngày.

**SLA (Service Level Agreement).** Cam kết thời gian giao hàng với khách. Ví dụ "giao trong 24 giờ với khu vực metro". Vi phạm SLA thì phải đền bù.

**3PL (Third-Party Logistics).** Bên cung cấp dịch vụ logistics thuê ngoài (kho, vận chuyển). Doanh nghiệp dùng 3PL để xử lý mùa cao điểm thay vì xây thêm kho.

### 14.2. Khái niệm tối ưu hoá

**P-median problem.** Bài toán chọn P điểm (kho) sao cho tổng khoảng cách có trọng số đến tất cả các điểm nhu cầu nhỏ nhất. Ví dụ: chọn 5 thành phố làm trung tâm phân phối cho 17 thành phố tổng.

**UFLP (Uncapacitated Facility Location Problem).** Bài toán chọn kho (số lượng tự do) để tối thiểu chi phí cố định + chi phí vận chuyển. Ràng buộc: mỗi khách phục vụ bởi đúng 1 kho.

**CFLP (Capacitated FLP).** UFLP có thêm ràng buộc công suất từng kho.

**MCLP (Maximal Covering Location Problem).** Bài toán đặt P kho để tối đa nhu cầu được phục vụ trong một bán kính (ví dụ 200km).

**LP solver.** Phần mềm giải bài toán tối ưu hoá tuyến tính. Dự án dùng PuLP với CBC làm solver mặc định. Có thể fallback Gurobi nếu cần tốc độ.

**Objective function.** Hàm mục tiêu — cái mà ta đang muốn tối thiểu hoá hoặc tối đa hoá. Ví dụ: tối thiểu tổng chi phí.

**Constraint.** Ràng buộc — điều kiện mà nghiệm phải thoả. Ví dụ: tổng demand gán cho kho không vượt công suất.

### 14.3. Khái niệm dự án

**Engine.** Lõi xử lý của LogiHub. 10 phần.

**Module / Phần.** Một bước trong engine. Mỗi phần có function `run(ctx)`.

**Pipeline.** Chuỗi 10 phần chạy nối tiếp.

**Mock data.** Dữ liệu giả (đúng schema, không đúng nội dung) để test một phần khi 2 phần kia chưa sẵn sàng.

**JSON contract / Schema.** Định nghĩa cấu trúc JSON output của engine. File `engine_contract.schema.json`.

**Outcome.** Bản phân tích cuối cùng do engine sinh ra. File `outcome_sample_full.md`.

**Scenario.** Một cấu hình mạng lưới được chạy thử. Có 9 scenario S0-S8.

**CLI.** Command-Line Interface. Câu lệnh chạy engine từ terminal.

---

## 15. CẤU TRÚC THƯ MỤC DỰ ÁN

```
LogiHub_Project_Archive/
│
├── logistics_hub_research/                    [phần research, đã có]
│   ├── data_raw/                              dữ liệu thô tiếng Hàn
│   │   └── 20260430173444/                    Korean Freight O/D 2022/2023
│   ├── data_processed/                        dữ liệu đã clean — DÙNG ĐỂ INPUT
│   │   ├── od_clean_long_2023.csv
│   │   ├── demand_17_regions_2023.csv
│   │   ├── top_corridors_17_2023.csv
│   │   ├── warehouse_geocoded.csv
│   │   └── warehouse_capacity_17_regions.csv
│   ├── scripts/                               Python scripts ban đầu
│   ├── outputs/                               kết quả tối ưu hoá ban đầu
│   └── reports/                               báo cáo mẫu ban đầu
│
├── logihub_application_code/                  [code chính của sản phẩm]
│   ├── backend/                               Engine sẽ ở đây
│   │   ├── engine/                            (sẽ tạo trong tuần 1)
│   │   │   ├── ingestion.py
│   │   │   ├── normalization.py
│   │   │   ├── od_builder.py
│   │   │   ├── demand.py
│   │   │   ├── segmentation.py
│   │   │   ├── cost.py
│   │   │   ├── capacity.py
│   │   │   ├── diagnosis.py
│   │   │   ├── optimizer.py
│   │   │   ├── scenarios.py
│   │   │   ├── synthesis.py
│   │   │   ├── outcome_generator.py
│   │   │   ├── runner.py
│   │   │   ├── cli.py
│   │   │   ├── config.py
│   │   │   └── contracts.py
│   │   ├── tests/                             Unit tests
│   │   ├── output/                            Kết quả engine ghi vào đây
│   │   ├── mocks/                             Mock data sinh ở buổi 1
│   │   ├── main.py                            FastAPI server (đã có sẵn)
│   │   ├── models.py                          Optimizer cũ (sẽ refactor)
│   │   └── requirements.txt
│   │
│   ├── frontend/                              Next.js — AI sẽ dựng
│   │   └── src/components/                    DashboardView, MapViewer, etc.
│   │
│   ├── freight_od.csv                         data đã có
│   └── warehouse_registry.csv                 data đã có
│
├── downloads_logistics_documents/             báo cáo cũ
│
├── 4 file canonical:
├── LogiHub_Engine_v2_Redesign.md              kiến trúc engine
├── LogiHub_Midterm_Plan_3People_18days.md     kế hoạch 18 ngày
├── LogiHub_Onboarding_Tong_Quan.md            file này (cho người mới)
└── (sẽ có) engine_contract.schema.json        JSON schema (sinh ngày 10/5)

Sách tham khảo:
├── Logistics Supply Chain Management (Christopher).pdf
├── Designing and managing the supply chain (Simchi-Levi).pdf
└── Supply Chain Excellence SCOR Model.pdf
```

---

## 16. CÁC FILE TÀI LIỆU LIÊN QUAN

Có 5 tài liệu chính trong dự án. Đọc theo thứ tự dưới đây nếu là người mới:

**Bước 1 — Đọc file này (`LogiHub_Onboarding_Tong_Quan.md`).** 30-40 phút. Tổng quan dự án.

**Bước 2 — Đọc spec engine (`[SMProject] Logistics Engine.md` trong uploads).** 30 phút. Mô tả chi tiết 10 phần engine, từng module, từng formula.

**Bước 3 — Đọc bản phân tích Samsung mẫu (`Expected Outcome Analysis.md` trong uploads).** 20 phút. Đây là output mục tiêu mà engine cần tái tạo được. Đọc để hiểu "engine chất lượng cao trông như thế nào".

**Bước 4 — Đọc kiến trúc engine (`LogiHub_Engine_v2_Redesign.md`).** 30 phút. Mô tả engine theo 7 tầng kiến trúc, schema dữ liệu, JSON contract.

**Bước 5 — Đọc kế hoạch (`LogiHub_Midterm_Plan_3People_18days.md`).** 30 phút. Kế hoạch 18 ngày, phân chia 3 nhóm, 4 buổi gặp, 9 rủi ro, checklist.

Tổng thời gian onboarding: ~2-3 giờ. Sau đó người mới biết đủ để tham gia vào nhóm A, B, hoặc C.

---

## 17. HƯỚNG DẪN NGƯỜI MỚI BẮT ĐẦU

### 17.1. Setup môi trường

Các bước cần làm trên máy của bạn (Windows/Mac/Linux):

```bash
# 1. Clone repo (nếu chưa có)
cd C:/Users/PC/Downloads/LogiHub_Project_Archive
git status   # nếu chưa init thì git init

# 2. Vào thư mục backend
cd logihub_application_code/backend

# 3. Tạo Python virtual environment
python -m venv venv

# 4. Kích hoạt venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 5. Cài requirements
pip install -r requirements.txt
pip install pulp pandas pydantic pandera jsonschema multiprocess

# 6. Test môi trường
python -c "import pulp; print('PuLP OK')"
python -c "import pandas; print('Pandas OK')"
```

### 17.2. Đọc dữ liệu mẫu

```bash
cd ../../logistics_hub_research/data_processed
ls -la
head od_clean_long_2023.csv   # xem qua cấu trúc O/D
head warehouse_geocoded.csv   # xem qua cấu trúc warehouse
```

### 17.3. Chạy engine cũ (trước khi refactor)

```bash
cd ../../logihub_application_code/backend
uvicorn main:app --reload    # khởi động API server cũ
```

Mở trình duyệt vào `http://localhost:8000/docs` để xem endpoint API hiện tại.

### 17.4. Tham gia channel chat

Sau khi setup xong:

1. Liên hệ trưởng nhóm (hoặc Nhóm C) để được add vào channel `#logihub-midterm`.
2. Pin 4 file canonical: kế hoạch, kiến trúc engine, contract schema, outcome mẫu.
3. Giới thiệu bản thân + lựa chọn nhóm phù hợp (A, B, hoặc C).

### 17.5. Tham gia buổi gặp gần nhất

Lịch gặp định kỳ là thứ 7 hàng tuần. Đến buổi gần nhất với:
- Laptop + sạc + headphone
- Đã đọc 2 file: file này + spec engine
- Đã setup môi trường Python local

Trong buổi đầu, im lặng nghe cách 3 nhóm chạy. Buổi sau bắt đầu đóng góp.

---

## 18. CÂU HỎI THƯỜNG GẶP

**Q1: Tôi không biết Operations Research, có thể tham gia được không?**

A: Được, nhưng nên gia nhập Nhóm A hoặc Nhóm C. Nhóm B yêu cầu nền tảng OR (Operations Research) để hiểu P-median, UFLP, CFLP. Nhóm A chủ yếu là pandas + xử lý dữ liệu. Nhóm C chủ yếu là logic + viết.

**Q2: Tôi không biết tiếng Hàn, có vấn đề gì không?**

A: Không vấn đề. File data đã được processed và có tên cột tiếng Anh. Bạn không bao giờ phải đọc file Excel gốc tiếng Hàn — chỉ làm việc với CSV đã clean.

**Q3: Mock data ở đâu? Tôi không thấy folder `mocks/`.**

A: Mock data sẽ được sinh tại buổi gặp 1 (ngày 10/5/2026) bởi cả 3 nhóm. Trước ngày đó folder này chưa tồn tại. Sau ngày 10/5 nó sẽ ở `logihub_application_code/backend/mocks/`.

**Q4: Tôi không thể đến buổi gặp Saturday, làm thế nào?**

A: Báo trước với 2 thành viên kia. Họ sẽ ghi recording. Sau buổi bạn xem recording trong 24 giờ, đọc meeting notes, approve quyết định trên channel. Có thể đặt 1-1 catch-up với 1 trong 2 người tham gia.

**Q5: Tôi gặp bug code và 2 người kia chưa rep, làm gì?**

A: Theo SLA, bạn được rep trong 24 giờ. Nếu sau 24 giờ vẫn block thì DM trực tiếp người liên quan. Nếu sau 48 giờ vẫn block thì raise trong channel + tag tất cả. Lúc đó cả đội phải dừng tay giúp bạn.

**Q6: Tôi nên dùng AI (Claude/ChatGPT) đến mức nào?**

A: AI có thể dùng để: gợi ý code skeleton, debug error message, polish ngôn ngữ tiếng Việt/tiếng Anh, đóng vai SCM manager để test outcome. AI KHÔNG được dùng để: viết toàn bộ engine logic (đội phải hiểu code), viết phân tích outcome chính, trả lời Q&A trước hội đồng.

**Q7: Code engine cần phải hoàn hảo không?**

A: Không. Mục tiêu midterm là engine "chạy được và đủ thông minh", không phải "perfect code". Sau midterm sẽ có thời gian refactor. Tuy nhiên các nguyên tắc cơ bản (test pass, schema đúng, không có hardcode) phải đảm bảo.

**Q8: Báo cáo phải bằng tiếng Anh hay tiếng Việt?**

A: Tiếng Việt, có Abstract tiếng Anh ở đầu. Trong phần methodology dùng thuật ngữ tiếng Anh kèm giải thích tiếng Việt (ví dụ: "P-median problem (bài toán chọn P trung tâm)").

**Q9: JSON contract có cố định luôn không?**

A: Cố định sau buổi 1 (10/5). Nếu phải đổi (ví dụ phát hiện thiếu trường) thì phải có cuộc gọi 1-1 giữa người đề xuất và người bị ảnh hưởng + tag cả đội trên channel để approve. Không sửa schema trong tuần 3 (đợt hoàn thiện).

**Q10: Nếu engine không chạy được trong buổi midterm thì làm sao?**

A: Có 3 lớp dự phòng:
- Lớp 1: AI-generated frontend chạy trên data pre-computed.
- Lớp 2: Chạy CLI live trước hội đồng (`python -m engine.cli run` chạy 60-90s).
- Lớp 3: Pre-record screencast 60s ngày 25/5, mở video làm backup.
- Lớp 4 cuối cùng: outcome.md đã sẵn sàng trong tab, mở file đọc trực tiếp + JSON output mở trong tab thứ 2.

Nếu cả 4 lớp đều fail thì có vấn đề lớn hơn nhiều — nhưng xác suất là gần 0%.

**Q11: Sau midterm thì sao?**

A: Sau midterm, 3 thứ chính tiếp tục: (1) bổ sung 3 thành phần chi phí còn lại nếu chưa đủ; (2) implement LLM-driven executive summary cho outcome; (3) thử nghiệm với case doanh nghiệp Việt Nam thật. Lộ trình chi tiết có trong file kế hoạch.

**Q12: Nếu tôi muốn đóng góp thêm ngoài phạm vi nhóm mình?**

A: Tốt! Nói chuyện với trưởng nhóm liên quan trước khi mở PR. Không tự ý code phần ngoài lane vì có thể gây xung đột merge hoặc đụng schema. Việc đóng góp thêm thường ở mức: review PR, đề xuất ý tưởng improvement, hỗ trợ debug khi có người block.

**Q13: Tại sao đội dùng Korean Freight O/D thay vì data thật của Samsung?**

A: Vì data shipment nội bộ của Samsung là bí mật kinh doanh, không doanh nghiệp nào public và đội sinh viên không thể tiếp cận. Korean Freight O/D là dataset công khai phản ánh cấu trúc địa lý của nhu cầu logistics quốc gia, đóng vai trò proxy hợp lý. Hệ quả: engine không biết shipment cụ thể là điện thoại hay tủ lạnh nên Phần 5 (classifier) phải đoán dựa trên đặc điểm vùng đi/vùng đến. Chi tiết đầy đủ ở mục 5.3 của tài liệu này. Để bù lại, đội xây thêm case mẫu Samsung Mobile với data giả định đầy đủ trong file `Outcome_Sample_Samsung_Mobile_10Models.md` để chứng minh "engine sẽ làm được gì nếu Samsung thật sự dùng".

**Q14: Vậy outcome engine chạy trên Korean Freight O/D có dùng được cho Samsung không?**

A: Có và không. **Có** ở chỗ kiến trúc engine, kết quả tối ưu hoá vùng phục vụ, và logic chẩn đoán mạng lưới đều áp dụng trực tiếp được. **Không** ở chỗ con số cụ thể (như chi phí 4.82M USD/tháng, SLA 89.2%, ...) là demonstration không phải production. Doanh nghiệp dùng thật phải feed shipment data nội bộ của họ vào engine — lúc đó số ra mới chính xác. Đây là lý do bản phân tích mẫu phải nói rõ "giả định cho minh hoạ" trong abstract.

---

## TẠM KẾT

Sau khi đọc xong tài liệu này, người mới đã có bức tranh tổng thể về dự án LogiHub: vấn đề thực tế đang giải quyết, sản phẩm là gì, engine xử lý như thế nào, dữ liệu ở đâu, output ra sao, đội đang chia việc thế nào, và lịch trình 18 ngày đến giữa kỳ.

Bước tiếp theo: đọc 2 file quan trọng tiếp theo là spec engine (`[SMProject] Logistics Engine.md`) và bản phân tích Samsung mẫu (`Expected Outcome Analysis.md`). Sau đó setup môi trường Python, tham gia channel chat, và đến buổi gặp gần nhất.

Chúc bạn onboarding thuận lợi và đóng góp hiệu quả vào LogiHub Intelligence.

---

*Tài liệu này được duy trì bởi đội phát triển. Nếu phát hiện thông tin sai hoặc lỗi thời, hãy mở PR sửa hoặc tag Nhóm C trong channel để cập nhật.*
