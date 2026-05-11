# 6 THÀNH PHẦN CHI PHÍ + HỆ SỐ BENCHMARK NGÀNH — REFERENCE

*Tài liệu giải thích chi tiết Module 6 (Cost Engine) của LogiHub. Nhóm B implement Module 6 dùng tài liệu này làm nguồn tham chiếu duy nhất.*

---

## 1. TỔNG QUAN TRONG MỘT CÂU

Khi engine LogiHub tính tổng chi phí của một mạng lưới logistics, nó cộng **6 loại chi phí khác nhau** lại. Mỗi loại có một công thức riêng và mỗi công thức cần một hoặc nhiều **hệ số** (rate, percentage, fixed value). Vì đội không có hợp đồng vận chuyển thật của Samsung, các hệ số này được lấy từ **giá trị benchmark trung bình của ngành logistics** — gọi là "hệ số benchmark ngành".

---

## 2. CÔNG THỨC TỔNG CHI PHÍ

```
TỔNG CHI PHÍ LOGISTICS / NĂM
=
(1) Chi phí vận chuyển
+ (2) Chi phí cố định kho
+ (3) Chi phí xử lý hàng
+ (4) Chi phí lưu kho hàng tồn
+ (5) Chi phí linh hoạt mùa cao điểm
+ (6) Phạt SLA / chi phí giao trễ
```

Mỗi thành phần có thể tính theo (vùng nhu cầu × kho × dòng sản phẩm × tháng) để có chi tiết — engine lưu dưới dạng **cost tensor** 5 chiều `C[i, j, p, t, k]` với k là chỉ số 6 thành phần.

---

## 3. CHI TIẾT TỪNG THÀNH PHẦN

### 3.1. Chi phí vận chuyển (Transport cost)

**Định nghĩa:** Tiền trả cho xe tải / tàu / máy bay chở hàng từ kho đến điểm tiêu thụ.

**Công thức:**

```
TransportCost = Demand (tấn) × Distance (km) × Rate (USD/tấn-km) × (1 + Surcharge)
```

**Hệ số rate theo dòng sản phẩm:**

| Dòng sản phẩm | Rate (USD/tấn-km) | Lý do khác nhau |
| --- | ---: | --- |
| Mobile launch (điện thoại ra mắt) | 0.18 | Express priority + bảo hiểm cao |
| Bulky appliance (đồ gia dụng) | 0.13 | Cồng kềnh nhưng vận chuyển bình thường |
| High-value secure (chip) | 0.35 | Bảo mật cao, xe chuyên dụng, escort |
| Finished goods (hàng thông thường) | 0.10 | Standard trucking rate |
| Spare parts (phụ tùng) | 0.15 | Express delivery 24-48h |
| E-commerce small | 0.12 | Phân phối cuối gửi nhỏ lẻ |

**Surcharge:**

| Điều kiện | Surcharge |
| --- | ---: |
| Long-haul > 300 km | +8% |
| Đảo Jeju | +35% |
| Hàng cồng kềnh | +20% |
| Bảo mật cao | +25% |
| Khẩn cấp (expedite) | +50% |

**Ví dụ:** Vận chuyển 100 tấn điện thoại từ Suwon đến Busan (385 km), surcharge long-haul +8%:

```
= 100 × 385 × 0.18 × 1.08 = 7,484 USD
```

### 3.2. Chi phí cố định kho (Warehouse fixed cost)

**Định nghĩa:** Tiền thuê đất, vận hành, bảo vệ, hệ thống của một kho — phải trả hàng năm bất kể lượng hàng đi qua kho ít hay nhiều.

**Công thức:**

```
WarehouseFixedCost (j) = F (j) × y (j)
```

Trong đó: F(j) = chi phí cố định hàng năm của kho j; y(j) = 1 nếu kho mở, 0 nếu không.

**Hệ số benchmark theo loại kho (USD/năm):**

| Loại kho | Diện tích chuẩn | Fixed cost/năm |
| --- | ---: | ---: |
| Kho metro (Seoul/Suwon) | 25,000 m² | 6,800,000 |
| Kho vùng (Daejeon/Busan/Gwangju) | 22,000 m² | 5,400,000 |
| Kho launch chuyên dụng (Gumi) | 18,000 m² | 4,200,000 |
| Service node nhỏ | 14,000 m² | 3,400,000 |
| Secure node (chip) | 20,000 m² + bảo mật | 7,500,000 |

**Lý do khác nhau:** vị trí địa lý (đất Seoul đắt hơn Gwangju), security level (kho chip cần camera, sensor, biometric access), automation level.

### 3.3. Chi phí xử lý hàng (Handling cost)

**Định nghĩa:** Mỗi tấn hàng đi qua kho phải tốn một khoản để bốc dỡ, đóng gói, kiểm đếm, dán nhãn.

**Công thức:**

```
HandlingCost = Volume (tấn) × HandlingRate (USD/tấn)
```

**Hệ số benchmark theo dòng sản phẩm (USD/tấn):**

| Dòng sản phẩm | Handling rate |
| --- | ---: |
| Mobile launch | 25 |
| Bulky appliance | 45 |
| High-value secure | 80 |
| Finished goods | 18 |
| Spare parts | 22 |
| E-commerce small | 20 |

**Lý do khác nhau:** đồ gia dụng cần forklift chuyên dụng + nhân công 2 người (45), hàng giá trị cao cần kiểm tra serial + camera + biometric (80), mobile launch cần kit-pack với hộp riêng (25), hàng thường chỉ cần pallet trống (18).

### 3.4. Chi phí lưu kho hàng tồn (Inventory holding cost)

**Định nghĩa:** "Tiền đắp" trong hàng tồn kho — nếu kho chứa 1 tỷ won hàng trong 1 tháng, doanh nghiệp mất chi phí cơ hội tương đương lãi suất + chi phí kho.

**Công thức:**

```
InventoryHoldingCost = AvgInventory (tấn) × UnitValue (USD/tấn) × HoldingPct/tháng
```

Trong đó: AvgInventory ≈ 0.5 × monthly demand (giả định turnover ratio).

**Hệ số benchmark:**

| Dòng sản phẩm | Unit value (USD/tấn) | Holding pct/tháng |
| --- | ---: | ---: |
| Mobile launch | 50,000 | 2.5% |
| Bulky appliance | 8,000 | 1.2% |
| High-value secure | 200,000 | 4.0% |
| Finished goods | 12,000 | 1.5% |
| Spare parts | 30,000 | 2.0% |
| E-commerce small | 15,000 | 1.8% |

**Lý do khác nhau:** chip bán dẫn 200,000 USD/tấn — chỉ cần lưu 1 tháng đã mất 8,000 USD/tấn chi phí cơ hội. Đồ gia dụng giá thấp + holding pct thấp (kho thường) chỉ mất 96 USD/tấn/tháng. Đây là lý do **chip bắt buộc phải fast-moving**, không stockpile được.

**Ví dụ:** Kho có 200 tấn điện thoại trung bình (avg inventory):

```
= 200 × 50,000 × 0.025 = 250,000 USD/tháng
```

### 3.5. Chi phí linh hoạt mùa cao điểm (Seasonal flex cost)

**Định nghĩa:** Khi nhu cầu vượt công suất thường (ví dụ tháng Galaxy launch), kho phải làm thêm giờ (overtime) hoặc thuê kho ngoài (3PL — third-party logistics). Hai khoản này đắt hơn vận hành thường.

**Công thức:**

```
Overflow = max(0, MonthlyDemand - BaseCapacity)
OvertimeCost = min(Overflow, BaseCapacity × 0.20) × BaseRate × 1.5
ThreePLCost = max(0, Overflow - BaseCapacity × 0.20) × BaseRate × 2.0
SeasonalFlexCost = OvertimeCost + ThreePLCost
```

Logic: phần đầu tiên (≤ 20% công suất cơ bản) dùng làm thêm giờ với hệ số 1.5x. Phần vượt quá dùng 3PL với hệ số 2.0x.

**Hệ số benchmark:**

| Multiplier | Giá trị | Lý do |
| --- | ---: | --- |
| Overtime rate | 1.5× | Lương ngoài giờ luật lao động Hàn Quốc |
| 3PL rate | 2.0× | 3PL có lợi nhuận + chi phí setup |

**Ví dụ:** Suwon DC có công suất 480,000 units/tháng (BaseCapacity), tháng Galaxy launch lên 752,000 units (Overflow 272,000):

```
Overtime portion = min(272,000, 480,000 × 0.20) = 96,000 units
3PL portion = 272,000 - 96,000 = 176,000 units
OvertimeCost = 96,000 × handling_rate × 1.5
ThreePLCost = 176,000 × handling_rate × 2.0
```

### 3.6. Phạt SLA / chi phí giao trễ (SLA penalty)

**Định nghĩa:** Khi kho cách quá xa vùng phục vụ và không đáp ứng được thời hạn giao hàng cam kết với khách (Service Level Agreement), doanh nghiệp phải đền bù: hoàn tiền vận chuyển, voucher, đôi khi compensate giá hàng.

**Công thức:**

```
Nếu Distance(i, j) > SLARadius(p):
    SLAPenalty = Demand(i, p, t) × PenaltyRate(p)
Nếu không:
    SLAPenalty = 0
```

**Hệ số benchmark:**

| Dòng sản phẩm | SLA radius (km) | Penalty rate (USD/tấn) |
| --- | ---: | ---: |
| Mobile launch | 200 | 200 |
| Bulky appliance | 400 | 80 |
| High-value secure | 150 | 800 |
| Finished goods | 350 | 60 |
| Spare parts | 200 | 250 |
| E-commerce small | 100 | 100 |

**Lý do khác nhau:** Khách mua điện thoại flagship mới ra mắt kỳ vọng giao trong ngày → SLA radius hẹp 200km, penalty cao. Đồ gia dụng khách chấp nhận chờ 2-3 ngày → radius rộng 400km, penalty thấp. Chip cho khách hàng B2B (LG, Apple) — penalty rất cao 800 USD/tấn vì gây line-stop.

---

## 4. BẢNG TỔNG HỢP TẤT CẢ HỆ SỐ

Tất cả hệ số được lưu trong file `engine/config.py` để dễ tuning. Khi cần đổi 1 con số, chỉ sửa file này — không scatter trong code.

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
OVERTIME_CAPACITY_PCT = 0.20  # Overtime cover được tối đa 20% extra capacity

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

**Tổng cộng có khoảng 50 hệ số** trong file config. Đây là toàn bộ bộ "gia vị" của engine — thay file này thì engine output thay đổi tương ứng.

---

## 5. "BENCHMARK NGÀNH" CÓ NGHĨA LÀ GÌ

### 5.1. Phân biệt 3 loại hệ số có thể dùng

| Loại hệ số | Nguồn | Độ chính xác | Ai dùng |
| --- | --- | --- | --- |
| **Mock** | Đội tự nghĩ ra cho test | Không có | Phát triển nội bộ |
| **Benchmark ngành** ← *đang dùng* | Trung bình ngành từ literature/báo cáo công khai | Vừa phải, ±20-40% so với từng case cụ thể | Proxy engine (midterm) |
| **Cost contract thật** | Hợp đồng vận chuyển + lương kho thật của doanh nghiệp | Chính xác đến từng đơn vị | Production engine (sau pilot) |

### 5.2. Tại sao gọi là "benchmark"

"Benchmark" trong logistics có nghĩa **giá trị tham chiếu trung bình của ngành**. Ví dụ rate vận chuyển đường bộ Hàn Quốc trung bình là 0.10-0.18 USD/tấn-km tuỳ loại hàng. Số chính xác cho một doanh nghiệp cụ thể (ví dụ Samsung) có thể khác do:

- **Quy mô:** Samsung có volume khổng lồ → ký hợp đồng với carrier giá tốt hơn 15-30% so với trung bình.
- **Hợp đồng dài hạn:** Samsung có hợp đồng 3-5 năm → giá ổn định, có thể thấp hơn spot rate.
- **Vị trí:** Samsung gần cảng Busan → cost xuất khẩu thấp hơn doanh nghiệp ở Daegu.
- **Loại xe:** Samsung dùng xe tải chuyên dụng riêng → cost khác công ty thuê 3PL.

Nói cách khác, hệ số benchmark là **thước đo "trung bình ngành"**. Khi áp dụng cho 1 doanh nghiệp cụ thể, sai số có thể ±20-40%. Đây là lý do hệ số benchmark đủ cho **demonstration grade** nhưng không đủ cho **production grade**.

### 5.3. Nguồn gốc các hệ số benchmark trong engine

Đội đã tổng hợp từ 4 nguồn:

**Nguồn 1 — Sách giáo khoa SCM:** Chopra & Meindl "Supply Chain Management" và Simchi-Levi "Designing and Managing the Supply Chain" cho các giá trị tổng quát (transport rate, holding pct, capacity multipliers).

**Nguồn 2 — Báo cáo ngành Hàn Quốc:** Korea Logistics Institute publish hàng năm benchmark cost theo ngành. Đội dùng số 2023-2024 cho rate vận chuyển Hàn Quốc cụ thể.

**Nguồn 3 — Estimate từ giá trị thị trường:** Unit value (USD/tấn) cho 6 dòng sản phẩm được estimate từ giá retail trung bình:
- Điện thoại flagship $850-1,800/máy × ~3,000 máy/tấn ≈ 50,000 USD/tấn
- Đồ gia dụng $400/máy × 20 máy/tấn ≈ 8,000 USD/tấn
- Chip bán dẫn $1,000-50,000/wafer × hàng nghìn wafer/tấn ≈ 200,000 USD/tấn

**Nguồn 4 — Common sense / heuristic:** Một số hệ số được set bằng kinh nghiệm hợp lý — ví dụ overtime multiplier 1.5x là theo Luật Lao động Hàn Quốc, 3PL multiplier 2.0x là quy ước ngành.

### 5.4. Disclaimer bắt buộc trong báo cáo

Báo cáo Word phần phương pháp phải nêu rõ:

> *"Hệ số chi phí trong engine được lấy từ giá trị benchmark trung bình ngành logistics, không phải hợp đồng vận chuyển hay cost contract thực tế của một doanh nghiệp cụ thể. Sai số ±20-40% so với cost thực của một doanh nghiệp riêng lẻ. Khi triển khai production cho khách hàng cụ thể (Samsung, LG, ...), các hệ số này được thay bằng hợp đồng thực của doanh nghiệp."*

---

## 6. TỈ LỆ KỲ VỌNG GIỮA 6 THÀNH PHẦN

Sau khi tính 6 thành phần xong, tỉ lệ giữa chúng phải hợp lý. Đội kiểm chéo bằng bảng sau:

| Thành phần | Tỉ lệ kỳ vọng % tổng | Cờ cảnh báo nếu lệch |
| --- | ---: | --- |
| Vận chuyển | 35-50% | < 25% hoặc > 60% → check rate |
| Cố định kho | 10-20% | < 5% hoặc > 30% → check số kho mở |
| Xử lý hàng | 8-15% | < 3% hoặc > 25% → check handling rate |
| Lưu kho hàng tồn | 10-18% | < 5% hoặc > 25% → check unit value |
| Linh hoạt mùa | 5-12% | > 20% → mạng lưới quá yếu, cần thêm hub |
| Phạt SLA | 3-10% | > 15% → mạng lưới quá kém SLA |

**Ví dụ kết quả của outcome Samsung Mobile:**

| Thành phần | USD/tháng | % tổng | Kiểm chéo |
| --- | ---: | ---: | :---: |
| Vận chuyển | 4,820,000 | 42.6% | ✅ Trong range |
| Cố định kho | 1,950,000 | 17.2% | ✅ |
| Xử lý hàng | 1,580,000 | 13.9% | ✅ |
| Lưu kho | 1,420,000 | 12.5% | ✅ |
| Mùa cao điểm | 940,000 | 8.3% | ✅ |
| Phạt SLA | 615,000 | 5.4% | ✅ |
| **Tổng** | **11,325,000** | **100%** | — |

Nếu sau khi tính 6 thành phần mà tỉ lệ không nằm trong range trên → chắc chắn có hệ số bị set sai.

---

## 7. CALIBRATION TEST

Cuối tuần 2 (ngày 19/5), Nhóm B chạy 3 calibration test để verify hệ số hợp lý:

**Test 1 — Linearity test.** Chạy engine với `unit_value_table × 0.5`, ghi total cost. Chạy lại với `× 1.0` (mặc định). Chạy lại với `× 2.0`. Total cost của thành phần inventory holding phải tăng tuyến tính (0.5x → 1.0x → 2.0x). Nếu không tuyến tính → có bug.

**Test 2 — S3 vs S0 ratio test.** S3 cost phải < S0 × 0.85 (tiết kiệm ≥ 15%). Nếu không đủ → engine không demonstrate được giá trị, cần kiểm tra lại logic optimization.

**Test 3 — Stress sensitivity test.** S6 (demand +20%) cost phải > S3 × 1.15 (tăng ≥ 15%). Nếu không tăng → engine không phản ứng đúng với stress.

3 test này pass = hệ số đã calibrate đúng. Khoá file `config.py` lại, không sửa nữa trong tuần 3.

---

## 8. TÓM TẮT

**6 thành phần chi phí** là 6 loại tiền doanh nghiệp phải trả cho mạng lưới logistics — cộng lại ra tổng. Sáu loại này gồm: vận chuyển, cố định kho, xử lý hàng, lưu kho hàng tồn, linh hoạt mùa cao điểm, phạt SLA.

**Hệ số benchmark ngành** là các giá trị rate / percentage / multiplier dùng trong công thức 6 thành phần đó. Vì đội không có hợp đồng thật của Samsung, các hệ số này được lấy từ giá trị trung bình ngành logistics qua 4 nguồn (sách giáo khoa SCM, báo cáo Korea Logistics Institute, estimate từ giá retail, common sense). Sai số ±20-40% so với case cụ thể.

**Bộ hệ số đầy đủ** lưu trong file `engine/config.py` — khoảng 50 con số. Khi cần tuning chỉ sửa file này.

**Calibration** chạy cuối tuần 2 với 3 test để verify hệ số hợp lý. Sau đó khoá lại không sửa.

**Disclaimer** bắt buộc trong báo cáo Word + outcome markdown để phân biệt với cost contract thật của production.

---

*Tài liệu này là reference cho Module 6 (Cost Engine). Nhóm B implement Module 6 dựa trên file này. Khi đổi hệ số, phải cập nhật cả `engine/config.py` và file này để đồng bộ.*
