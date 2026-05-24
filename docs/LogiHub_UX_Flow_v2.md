# LogiHub · Quy trình UX v2

> Tài liệu mô tả lại toàn bộ luồng người dùng để dùng làm brief cho **Claude Design** khi chỉnh lại UI.
> Mục tiêu: từ dữ liệu thô của doanh nghiệp → đưa ra phương án phân bổ kho + xác định kho.

---

## 1. Triết lý luồng mới

**Nguyên tắc 1 — Tuyến tính có cổng (Gated linear flow).**
Người dùng đi theo trục thời gian: **Khai báo → Nạp dữ liệu → Chạy tối ưu → Xem kết quả → Khám phá tình huống**. Mỗi bước chỉ mở khoá khi bước trước hoàn tất. Trạng thái mở/khoá hiển thị trực quan trên sidebar.

**Nguyên tắc 2 — 3 tầng (3 lớp).**
Sidebar gom 14 trang hiện tại thành **3 tầng**, đúng theo cách người dùng nghĩ:

| Tầng | Mục đích | Trang |
|---|---|---|
| **A. Setup** (Cấu hình) | Khai báo + nạp dữ liệu — *bắt buộc* | 1. Company Profile · 2. Data Upload · 3. Existing Warehouses |
| **B. Decision** (Quyết định) | Chạy tối ưu, xem kết quả lõi — *trục chính* | 4. Run Optimization · 5. Warehouse Map · 6. Warehouse Roles |
| **C. Explore** (Khám phá) | Đào sâu, giả lập, thuyết phục — *tuỳ chọn* | 7. Demand Forecast · 8. Seasonal Events · 9. Scenarios · 10. Event Playbook · 11. Business Case · 12. Roadmap · 13. Export |

**Nguyên tắc 3 — Mỗi trang có 3 vùng cố định.**
1. *Header*: tên bước + 1 dòng mô tả "bước này dùng để làm gì".
2. *Body*: nội dung chính (form, bảng, biểu đồ, bản đồ).
3. *Footer*: thanh CTA cố định ở dưới cùng — `← Back` · `Save draft` · `Next: [Tên bước kế] →`.

---

## 2. Tổng quan luồng (sơ đồ ngang)

```
┌─────────── A. SETUP (bắt buộc) ───────────┐  ┌──── B. DECISION (trục chính) ────┐  ┌─── C. EXPLORE (tuỳ chọn) ────┐
│ 1.Profile → 2.Upload → 3.Owned WH (opt.) │ →│ 4.Run Opt → 5.Map → 6.Roles      │ →│ 7.Forecast · 8.Events ·      │
│                                          │  │                                  │  │ 9.Scenarios · 10.Playbook ·  │
│ Gate: tất cả "required" file đã upload   │  │ Gate: optimisation đã solve xong │  │ 11.Business Case · 12.Roadmap│
│ Gate: profile đã save                    │  │                                  │  │ → 13.Export báo cáo PDF/PPTX │
└──────────────────────────────────────────┘  └──────────────────────────────────┘  └──────────────────────────────┘
```

Thanh tiến trình ngang (`Pipeline component` đã có sẵn trong `shell.jsx`) hiển thị **5 bước lớn**: `Setup → Optimize → Decide → Explore → Export`. Bỏ pipeline 5 bước hiện tại (Upload/Forecast/Optimize/Diagnose/Report) vì nó pha trộn giữa "input" và "output" — không trùng với mental model người dùng.

---

## 3. Chi tiết từng bước

### Bước 0 · Overview (trang đáp xuống / landing)

- **Khi nào hiện**: Mặc định khi mở app.
- **Mục tiêu**: Trạng thái tổng thể + CTA lớn đưa vào bước đang dang dở.
- **Body**:
  - Banner trên cùng: nếu user **mới**, hiển thị "Bắt đầu phân tích → Bước 1: Company Profile". Nếu user **đã chạy 1 lần**, hiển thị KPI chính (plan đề xuất, tiết kiệm/tháng, ROI, payback) + nút "Re-run with new data".
  - Pipeline 5-step kèm checkmark cho từng tầng.
  - Card "Resume": "Bạn dừng ở bước 4 — Run Optimization" + nút Continue.
- **Footer CTA**: `Start setup →` hoặc `Continue from [bước n] →`.

---

### Tầng A — Setup

#### Bước 1 · Company Profile

- **Input người dùng**: 5 trường — Company name · Size band · Industry · Delivery SLA (h) · Budget cap (₩/yr) · Priority regions (tuỳ chọn).
- **Hệ thống tự tính**: late tolerance, cancellation rate, reputation multiplier (theo size band).
- **Validation gate để qua bước 2**: tối thiểu **3 trường**: Company name + Size band + Industry.
- **Footer CTA**: `Save profile & continue → Data Upload`.
- **Lưu ý design**: ô "Auto-tuned parameters" hiển thị bên phải để user thấy nhập 1 trường thì tham số nào tự đổi → tăng cảm giác "smart system".

#### Bước 2 · Data Upload

- **Mục tiêu**: Nạp **tất cả dữ liệu doanh nghiệp cần** cho bài toán tối ưu.
- **Cấu trúc UI mới — chia thành 4 ô "slot"**, mỗi slot là 1 thẻ với trạng thái Required/Optional, có vùng kéo-thả riêng:

  | Slot | File | Bắt buộc? | Định dạng | Mục đích |
  |---|---|---|---|---|
  | 1 | **Shipping history** (O/D · SKU · date · weight) | ✅ Required | .xlsx/.csv | Demand input |
  | 2 | **Existing warehouses** (capacity · cost · location) | ⚠️ Optional | .xlsx/.csv | Bật mode "Improve existing" |
  | 3 | **Product master / SKU taxonomy** | ⚠️ Optional | .xlsx/.csv | Map SKU → 70 product groups |
  | 4 | **Cost overrides** (giá thuê kho theo vùng, tariff…) | ⚠️ Optional | .xlsx/.csv | Override default proxy data |

- **Sau khi user thả file**: hiển thị **7-step validation** (đã có) như một timeline ngang.
- **Sau validation thành công**: hiển thị **100-row preview** (đã có) — user phải confirm ≥ 90% rows mới mở khoá bước kế.
- **Snapshot/audit log**: giữ nguyên panel bên phải (immutable hash, override log).
- **Gate**: Slot 1 đã upload + validation pass + ≥ 90% preview confirmed.
- **Footer CTA**: `Confirm & continue → Existing Warehouses` (hoặc skip nếu user không có WH).

#### Bước 3 · Existing Warehouses *(tuỳ chọn)*

- Giữ nguyên trang hiện tại (`PageOwned`).
- Thêm rõ ràng 2 lựa chọn ngay đầu trang:
  - **A · Improve existing** — "Tôi đã có X kho, cần đánh giá lại và mở thêm nếu cần."
  - **B · Design from scratch** — "Tôi muốn hệ thống đề xuất mạng kho từ đầu." → nhảy thẳng qua bước 4.
- **Gate**: nếu chọn A thì cần ≥ 1 kho khai báo; nếu B thì pass luôn.
- **Footer CTA**: `Run optimization →` (nút primary, lớn — đây là transition lớn nhất của app).

---

### Tầng B — Decision

#### Bước 4 · Run Optimization *(màn hình mới — merge "Optimize" hiện tại + 1 màn loading)*

- **Trang này thay đổi nhiều nhất so với hiện tại**. Hiện tại Optimize là 1 trang xem kết quả; chuyển thành **2 trạng thái**:

  - **4a · Configure run** (trước khi solve):
    - Tóm tắt nhanh: profile, dataset, mode (improve/design).
    - Cho user chọn **plan flavour cần solve**: P1 (Max coverage) · P2 (Min cost) · P3 (Resilience) — mặc định bật cả 3.
    - Cho phép chỉnh siêu tham số nâng cao (giờ làm việc kho, max distance, % SLA target) — collapsible "Advanced".
    - Nút lớn `Run engine` ở giữa.
  - **4b · Running** (animation):
    - Animation các stage chạy song song: Demand forecast → Distance matrix → P1 solver · P2 solver · P3 solver → Diagnosis.
    - Thanh tiến trình + ước lượng thời gian còn lại.
    - Logs nhỏ ở dưới (collapsible).
  - **4c · Done** (kết quả):
    - 3 thẻ lớn so sánh P1/P2/P3: tổng chi phí, SLA met, resilience score, payback.
    - Thẻ "Recommended plan" có nhãn vàng — engine chọn 1 plan.
    - Hai CTA: `See on map →` (chuyển bước 5) hoặc `Compare in scenarios` (chuyển tầng C).
- **Gate**: ≥ 1 plan đã solve thành công.

#### Bước 5 · Warehouse Map *(trang mới — tách từ "Diagnosis" hiện tại)*

- **Mục tiêu**: trả lời câu hỏi *"Theo phương án đề xuất, kho nào ở đâu?"*
- **Body**:
  - Bản đồ Korea (đã có `KoreaMap` component) chiếm **70% chiều rộng**.
  - Pin kho phân loại 4 màu: ✅ Keep · ➕ Open new · ⬇️ Downgrade · ❌ Close.
  - Đường flow O/D dạng dashed line đến từng vùng tiêu thụ.
  - Bên phải: list 13 kho có filter (Keep/Open/Downgrade/Close) + search.
  - Click một kho → modal/drawer hiện chi tiết (capacity, cost, util, blind-zone risk).
- **Toggle ở trên cùng**: chuyển giữa P1/P2/P3 để so sánh bản đồ.
- **Footer CTA**: `See roles & responsibilities → Warehouse Roles`.

#### Bước 6 · Warehouse Roles

- **Mục tiêu**: trả lời *"Mỗi kho làm nhiệm vụ gì?"*
- **Body**: bảng + ma trận 2D.
  - Cột: kho được giữ + kho mở mới.
  - Hàng: vai trò (Primary hub · Regional spoke · Cross-dock · Cold-chain · Returns · DTC last-mile · Backup/surge).
  - Mỗi cell: % volume + product groups chính được phân về kho đó.
- **Card phụ**: "Why these roles" — nêu lý do logic của solver (chi phí, SLA, capability).
- **Footer CTA**: `Explore demand & scenarios →` (chuyển tầng C).

---

### Tầng C — Explore

> Từ đây người dùng không còn bị bắt phải đi theo thứ tự. Sidebar tầng C đổi từ "step number" sang "tab pill". Tuy nhiên vẫn nên có **đường gợi ý**: 7 → 8 → 9 → 10 → 11.

#### Bước 7 · Demand Forecast

- Giữ nguyên trang hiện tại (Filter 1 + Filter 2 + Output).
- Đổi vị trí trong sidebar: từ "ENGINE" sang "EXPLORE", đặt sau Roles.
- Bổ sung CTA cuối trang: `See seasonal events →`.

#### Bước 8 · Seasonal Events

- Giữ nguyên trang hiện tại.
- CTA cuối: `Build a scenario →`.

#### Bước 9 · Scenarios *(merge with current "Diagnosis" nâng cao)*

- **Mục tiêu**: cho user nghịch giả lập "Nếu Chuseok bùng 2.5×?", "Nếu mất kho Busan?"
- **Body**: form chọn event → tạo scenario → so sánh KPI base vs scenario.
- Có thư viện scenario lưu sẵn (3–5 cái mẫu).

#### Bước 10 · Event Playbook

- Sổ tay xử lý: với mỗi event lớn (peak Chuseok, đình công cảng, mưa lụt) → đề xuất hành động chi tiết (mở kho backup, thuê 3PL, đảo nhân sự).
- Liên kết ngược về Scenarios.

#### Bước 11 · Business Case

- ROI dài hạn, payback period, NPV.
- 3 tab: **Financial** (tiền) · **Operational** (SLA, throughput) · **Strategic** (rủi ro, resilience).
- CTA cuối: `Build implementation roadmap →`.

#### Bước 12 · Roadmap

- Timeline triển khai 6-18 tháng: T+1 pilot, T+3 nhân rộng, T+6 đóng kho yếu...
- Gantt đơn giản + checklist nhân sự/CapEx.

#### Bước 13 · Export

- Xuất gói báo cáo: PDF executive summary · PPTX cho board · XLSX raw output · ZIP toàn bộ.
- Nút lớn `Generate report bundle`.

---

## 4. Thay đổi cụ thể cần làm với UI

### 4.1 Sidebar mới

```
LogiHub · Decision Engine
─────────────────────────
SETUP                         ← thay vì "ONBOARDING"
  ◐ 1  Company Profile        ← state: required, in-progress
  ○ 2  Data Upload            ← state: locked cho tới khi 1 xong
  ○ 3  Existing Warehouses    ← optional, hiện badge "Optional"

DECISION                      ← thay vì "SYSTEM DATA" + "ENGINE"
  ○ 4  Run Optimization
  ○ 5  Warehouse Map
  ○ 6  Warehouse Roles

EXPLORE                       ← thay vì "REPORT"
  ○ 7  Demand Forecast
  ○ 8  Seasonal Events
  ○ 9  Scenarios
  ○ 10 Event Playbook
  ○ 11 Business Case
  ○ 12 Roadmap
  ○ 13 Export

─── footer ───
Data Mode: [Mock | Proxy | Enterprise]
```

**State icon**: ● completed · ◐ in-progress · ○ locked (xám, không click được) · ◯ available (tầng C).

### 4.2 Top bar

- Crumb hiện tại: `LogiHub / Company Profile` — đổi thành `LogiHub · Setup · Step 1 of 13 · Company Profile`.
- Bên phải: nút **`Resume from where I left off`** thay cho `Re-run engine` khi engine chưa chạy.
- Khi engine đã chạy: nút đổi thành `Re-run engine` (giữ nguyên hiện tại).

### 4.3 Footer CTA cố định (component mới · `StepFooter`)

Mỗi trang có 1 thanh dính dưới cùng:

```
[← Back to Profile]              [Save draft]      [Next: Data Upload →]   (primary)
```

- Nút Next **disabled** nếu chưa đạt gate, kèm tooltip lý do.
- Phím tắt: `Cmd/Ctrl + →` = Next, `Cmd/Ctrl + ←` = Back.

### 4.4 State machine toàn cục (gợi ý kỹ thuật)

Thêm một context React/Zustand `useFlowState` lưu:

```ts
{
  profileSaved: boolean,
  uploadValidated: boolean,
  ownedWHDeclared: 'skip' | 'declared',
  optimizationStatus: 'idle' | 'running' | 'done',
  selectedPlan: 'P1' | 'P2' | 'P3' | null,
  visitedSteps: Set<string>,
}
```

Sidebar và `StepFooter` đọc từ context này để bật/tắt nav. Khi user reload trang, đọc từ `localStorage`/backend session để khôi phục — tránh user phải làm lại từ đầu.

### 4.5 Bỏ / sáp nhập

- "Warehouse Directory" hiện tại → **sáp nhập vào bước 5 Warehouse Map** (chỉ là list view kèm map).
- "Network Diagnosis" hiện tại → **chia đôi**: phần map + status vào bước 5; phần stress-test/blind-zone vào bước 9 Scenarios.
- Pipeline ngang 5 bước cũ → thay bằng pipeline 5-tầng mới: `Setup · Optimize · Decide · Explore · Export`.

---

## 5. Acceptance criteria (cho bản design mới)

1. Một user mới mở app → trong vòng **3 clicks** biết được mình cần làm gì tiếp theo.
2. Không thể vào **Run Optimization** khi chưa upload đủ Slot 1 (Required).
3. Không thể vào tầng C khi optimization chưa solve xong (trừ Demand Forecast / Seasonal — đây là 2 trang xem-được-trước).
4. Sidebar luôn hiển thị rõ "bước nào đã xong, bước nào đang làm, bước nào còn khoá".
5. Mỗi trang đều có CTA `Next →` rõ ràng — không có "ngõ cụt".
6. State được lưu lại — user đóng tab và mở lại vẫn quay về đúng bước đang làm.

---

## 6. Tóm tắt 1 dòng để brief Claude Design

> *"Redesign LogiHub thành luồng tuyến tính có cổng 3-tầng: **Setup (Profile → Upload → Owned WH) → Decision (Run Opt → Map → Roles) → Explore (Forecast, Events, Scenarios, Playbook, Business Case, Roadmap, Export)** — mỗi trang có footer CTA cố định Next/Back, sidebar hiển thị trạng thái khoá/mở của từng bước, không trang nào được phép thành ngõ cụt."*
