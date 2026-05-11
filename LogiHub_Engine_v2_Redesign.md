# LOGIHUB LOGISTICS ENGINE v2 — TÁI ĐỊNH HÌNH KIẾN TRÚC

*Tài liệu thiết kế lại lõi tính toán của LogiHub dựa trên Expected Outcome Analysis (case Samsung Electronics) và các bộ dữ liệu đã thu thập (Freight O/D, Warehouse Registry, Cost / Lead-time / Capacity).*

---

## 0. TÓM TẮT THAY ĐỔI

Engine hiện tại (v1) chỉ là một **single-layer optimizer**: nhận một bảng demand đồng nhất (`demand_tons` theo region), một bảng candidate hubs, một ma trận khoảng cách, rồi chạy một trong năm mô hình (Baseline, P-Median, UFLP, CFLP, MCLP) và trả về danh sách hub được chọn cùng map phân bổ. Output cuối là một con số `total_cost` quy về `$/ton-km`.

Outcome Analysis của Samsung lại yêu cầu engine phải nói được những điều rất khác: hub nào phục vụ dòng sản phẩm nào, mùa cao điểm cần thêm capacity ở đâu, kịch bản nào nên triển khai, và tại sao một secure-node cho bán dẫn lại tách khỏi metro hub. Một câu trả lời ở mức độ đó không thể sinh ra từ một mô hình UFLP/CFLP đơn thuần — nó cần một **engine nhiều tầng** trong đó tối ưu hoá toán học chỉ là một mắt xích.

Engine v2 được tái định hình thành **7 tầng** chạy nối tiếp, mỗi tầng có input/output rõ ràng và có thể cắm thêm mô hình mới mà không phá vỡ tầng khác:

1. **Data Ingestion & Standardization** — nạp và chuẩn hoá dữ liệu doanh nghiệp + dữ liệu công khai.
2. **Demand Segmentation Engine** — tách demand theo region × product family × season (mới).
3. **Cost Modeling Engine** — sinh 6 thành phần chi phí thay vì một (mới).
4. **Network Design Optimizer** — tổ hợp P-Median / UFLP / CFLP / MCLP chạy trên demand đã segment, có ràng buộc product-aware (mở rộng từ v1).
5. **Scenario Simulation Engine** — chạy song song S0–S5 và so sánh trên 3 trục cost / service / risk (mới).
6. **Strategic Synthesis Engine** — biến kết quả số học thành khuyến nghị quản trị: vai trò từng hub, allocation theo dòng sản phẩm, lộ trình triển khai (mới).
7. **Decision Cockpit Output** — chuẩn hoá payload để frontend render Dashboard, Network Map, Scenario Comparison, Recommendation, Business Case.

Phần còn lại của tài liệu mô tả từng tầng, schema dữ liệu mới, và lộ trình tích hợp vào code base hiện có (`backend/models.py`, `backend/main.py`, các view ở `frontend/src/components`).

---

## 1. CHẨN ĐOÁN ENGINE v1

### 1.1. Engine v1 đang giả định gì

Đọc `backend/models.py` cho thấy v1 đứng trên ba giả định ngầm: demand chỉ có một loại (`demand_tons`), chi phí chỉ có một loại (transport quy đổi tuyến tính `$0.10/ton-km` cộng tuỳ chọn fixed cost), và không tồn tại thời gian (không có mùa, không có launch window, không có SLA). Với những giả định đó, v1 hoàn toàn đủ để trả lời câu hỏi *"đặt mấy kho ở đâu để rẻ nhất"* nhưng không thể trả lời câu hỏi *"mùa Galaxy launch nên dồn hàng về đâu"* hay *"chip Pyeongtaek có nên dùng chung hub với tủ lạnh Gwangju không"*.

### 1.2. Khoảng cách so với Outcome Analysis

| Yêu cầu trong Outcome | Engine v1 đáp ứng? | Khoảng cách |
| --- | --- | --- |
| Phân lớp demand theo 4 dòng sản phẩm | ❌ | Cần Demand Segmentation Engine |
| 6 thành phần chi phí (transport, warehouse, handling, inventory, seasonal flex, SLA penalty) | ❌ (chỉ 1–2) | Cần Cost Modeling Engine |
| Hub specialization (metro vs secure node vs bulky vs port) | ❌ | Cần product-aware constraints + Strategic Synthesis |
| Mùa cao điểm (Galaxy launch, appliance season, Q4, semiconductor surge) | ❌ | Cần seasonal demand profile |
| So sánh 6 kịch bản S0–S5 trên cost / service / risk | ⚠️ (chạy lẻ từng model) | Cần Scenario Simulation Engine |
| Allocation 17 vùng × dòng sản phẩm | ⚠️ (chỉ region) | Cần output 2 chiều |
| Khuyến nghị quản trị + roadmap 4 phase | ❌ | Cần Strategic Synthesis Engine |
| Hub utilization current vs recommended | ❌ | Cần utilization computation |

Tóm tắt: engine v1 dừng ở **tầng 4** trong kiến trúc mới, ba tầng còn lại chưa tồn tại.

---

## 2. KIẾN TRÚC ENGINE v2 — 7 TẦNG

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ INPUT: Enterprise data (shipment, warehouse, factory, cost) + Public data     │
│        (Freight O/D 2022/2024, GIS, Road performance, Warehouse registry)     │
└───────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 1 — Data Ingestion & Standardization                                     │
│   Adapters → Schema validation → Geocoding → Volume normalization             │
└───────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 2 — Demand Segmentation Engine                                           │
│   Region × Product family × Season → demand cube h[i, p, t]                   │
└───────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 3 — Cost Modeling Engine                                                 │
│   Sinh 6 cost components per (i, j, p) thành ma trận c[i, j, p]               │
└───────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 4 — Network Design Optimizer (product-aware)                             │
│   P-Median / UFLP / CFLP / MCLP / Hybrid-CFLP với constraint theo product     │
└───────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 5 — Scenario Simulation Engine                                           │
│   Chạy S0 (current) → S5 (hybrid + 3PL flex), so sánh cost / service / risk   │
└───────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 6 — Strategic Synthesis Engine                                           │
│   Hub roles + Product allocation + Utilization + Roadmap + Business case      │
└───────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 7 — Decision Cockpit Output (JSON contract cho frontend)                 │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. ĐẶC TẢ TỪNG TẦNG

### Tầng 1 — Data Ingestion & Standardization

Mục tiêu của tầng này là biến mọi nguồn dữ liệu hỗn tạp (shipment ERP của doanh nghiệp, Freight O/D 2022/2024 của bộ giao thông, warehouse registry, GIS, cost/lead-time) thành ba bảng chuẩn hoá nội bộ: `demand_records`, `warehouse_registry`, `network_arcs`. Engine v1 đang nhận trực tiếp các CSV này qua `main.py`; v2 chèn một lớp adapter để (a) chấp nhận nhiều schema đầu vào, (b) chạy validation rõ ràng, (c) geocode mọi địa chỉ về `lat/lon`, (d) chuẩn hoá đơn vị thể tích/khối lượng (CBM, ton, pallet equivalent).

Output chuẩn hoá của tầng 1 là tiền đề cho mọi tầng phía sau. Nếu thiếu cột bắt buộc, engine sẽ trả về `data_quality_report` thay vì cố chạy — đây là khác biệt quan trọng so với v1, vốn chạy ngầm rồi rơi vào fallback (`run_p_median` thay cho `run_cflp` khi thiếu fixed cost).

### Tầng 2 — Demand Segmentation Engine (mới)

Tầng 2 là điểm thay đổi lớn nhất về mặt khái niệm. Thay vì một vector `demand_tons[region]`, engine v2 dựng một **demand cube** ba chiều:

```
h[i, p, t]  với  i ∈ regions, p ∈ product_families, t ∈ seasons
```

Bốn dòng sản phẩm chuẩn (có thể mở rộng theo doanh nghiệp): `finished_goods`, `mobile_launch`, `bulky_appliance`, `high_value_secure`. Bốn season chuẩn: `Q1_launch`, `Q2_appliance`, `Q3_refresh`, `Q4_promo`, cộng một slice `peak_event` cho các sự kiện đột biến (ra mắt sản phẩm, semiconductor surge).

Cube này được sinh từ shipment history bằng quy tắc phân loại sản phẩm (mapping table `sku → product_family`) cộng phân rã mùa (time-series decomposition trên dữ liệu O/D nhiều năm). Khi doanh nghiệp không có shipment-level data, engine fallback dùng tỉ lệ ngành (industry priors) — ví dụ với electronics manufacturer ở Hàn Quốc, prior mặc định cho mobile_launch là ~22% volume nhưng ~40% peak intensity ở Q1.

Tầng 2 phải xuất thêm hai sản phẩm phụ: `regional_demand_profile` (giống bảng 2.1 trong outcome) và `mismatch_index[i]` đo độ lệch giữa nơi có demand và nơi có warehouse. `mismatch_index` chính là chẩn đoán "demand–warehouse mismatch" mà outcome đã yêu cầu.

### Tầng 3 — Cost Modeling Engine (mới)

Engine v1 dùng đúng một công thức `transport_cost = 0.1 * dist * flow`. Engine v2 sinh **6 cost components** cho từng cặp (region i, hub j, product family p):

| Thành phần | Công thức rút gọn | Phụ thuộc product |
| --- | --- | --- |
| Transport cost | `rate_p × distance_ij × flow_ipj` | rate khác nhau giữa bulky vs mobile vs secure |
| Warehouse fixed cost | `f_j × y_j` (sẵn trong v1) | Có (secure node có overhead bảo mật cao hơn) |
| Handling cost | `handling_rate_p × flow_ipj` | Có (appliance handling đắt hơn carton) |
| Inventory holding cost | `α × avg_stock_jp × unit_value_p` | Có (semiconductor unit value cực cao) |
| Seasonal flex cost | `β_t × overflow_jpt` | Có và phụ thuộc t |
| SLA / expedite penalty | `π_p × prob_late_ijp × demand_ipj` | Có (mobile launch & semiconductor penalty cao) |

Sáu thành phần này là **input cho tầng 4** (qua hệ số trọng số trong objective) **và** là **output báo cáo độc lập** (để Decision Cockpit có thể phân rã chi phí theo lane / theo product family — chính là bảng 5.1 high-cost lane diagnosis trong outcome).

Engine v2 lưu sáu thành phần dưới dạng tensor `C[i, j, p, t, k]` với k là chỉ số 6 cost components. Nhờ đó frontend có thể vẽ stacked bar "transport vs handling vs inventory" cho từng lane mà không phải chạy lại mô hình.

### Tầng 4 — Network Design Optimizer (mở rộng)

Tầng 4 giữ nguyên các solver hiện có nhưng **product-aware**: thay vì một biến `x[i, j]`, ta có `x[i, j, p]`. Hub `j` chỉ được phép phục vụ product family `p` nếu `eligible[j, p] = 1`. Ràng buộc eligibility cho phép biểu diễn "secure node chỉ chạy semiconductor", "Gwangju hub không chạy chip", v.v.

Mô hình mới mặc định cho engine v2 là **Hybrid-CFLP** — biến thể CFLP với:

- biến mở hub `y[j]` nhị phân,
- biến luồng `x[i, j, p]` liên tục theo product family,
- ràng buộc capacity theo product `Σ_i x[i,j,p] ≤ cap[j,p] · y[j]`,
- ràng buộc eligibility `x[i,j,p] ≤ M · eligible[j,p]`,
- objective tổ hợp 6 cost components ở tầng 3 với trọng số chính sách (trọng số mặc định = 1, có thể chỉnh để ưu tiên service vs cost),
- ràng buộc service-level `Σ_p x[i,j,p] · 1{dist_ij ≤ R_p} ≥ SL_target_p · h[i,p]` cho mỗi product family p (lấy từ MCLP).

Các solver cũ (P-Median, UFLP, CFLP, MCLP) trở thành các *case con* của Hybrid-CFLP khi bật/tắt biến và ràng buộc — engine giữ chúng để chạy nhanh các kịch bản đơn giản trong tầng 5.

### Tầng 5 — Scenario Simulation Engine (mới)

Tầng 5 chạy song song nhiều cấu hình mạng và xuất bảng so sánh. Sáu kịch bản chuẩn theo outcome:

| Mã | Cấu hình | Mục đích |
| --- | --- | --- |
| S0 | Mạng hiện tại (lock `y_j` theo warehouse_registry hiện hữu) | Baseline để đo cải thiện |
| S1 | Cost-min 4-node (UFLP với ràng buộc `Σ y_j ≤ 4`) | Kiểm tra phương án rẻ nhất |
| S2 | Generic 5-hub (P-Median P=5, không phân product) | So sánh khi bỏ qua segment |
| S3 | Hybrid 6-node (Hybrid-CFLP đầy đủ) | Phương án khuyến nghị |
| S4 | High-service 8-node (MCLP với P=8, R nhỏ) | Đo trade-off khi tăng hub |
| S5 | S3 + seasonal 3PL flex (S3 với capacity nới rộng theo `peak_event`) | Mô hình vận hành thực tế |

Mỗi kịch bản trả về 3 trục đánh giá: **cost index** (chuẩn hoá theo S0=100), **service level %** (tỉ lệ demand được phục vụ trong bán kính SLA), **risk score** (composite của over-utilization, single-point-of-failure, secure-handling exposure).

Engine v2 thực hiện so sánh trên ba trục này và phát signal `recommended_scenario` — đây là dòng "Adopt S3 as base, activate S5 in peak" mà outcome yêu cầu.

### Tầng 6 — Strategic Synthesis Engine (mới)

Đây là tầng biến số học thành ngôn ngữ quản trị. Input là kết quả tầng 5; output gồm:

1. **Hub role assignment** — gán mỗi hub mở một "role" trong tập {`metro_fulfillment`, `secure_node`, `central_balancing`, `launch_hub`, `bulky_appliance`, `southern_port`}. Logic gán dựa trên: vị trí địa lý, product family chiếm ưu thế trong allocation, lân cận với cluster sản xuất / cảng / sân bay.
2. **Product–region allocation matrix** — bảng 17×n (region × hub) phân theo từng dòng sản phẩm, kèm "business logic" tự sinh (template-based rationale).
3. **Hub utilization comparison** — current vs recommended, cờ `watchlist` / `healthy` / `seasonal_watch`.
4. **Seasonal playbook** — cho mỗi `peak_event`, tự sinh khuyến nghị pre-position / temporary 3PL / route reservation.
5. **Implementation roadmap** — 4 phase (network reallocation → specialized node → seasonal model → control tower) với các action tự suy ra từ delta giữa S0 và S3.
6. **Business case** — chênh lệch cost & service giữa S0 và S3, payback ước tính, risk reduction summary.

Tầng này dùng kết hợp rule-based template + LLM call (qua `cowork.askClaude` ở tầng frontend hoặc một service summarization riêng ở backend) để rationale đọc tự nhiên thay vì lệnh máy.

### Tầng 7 — Decision Cockpit Output

Tầng 7 đóng gói toàn bộ artefact của tầng 5–6 thành một payload JSON duy nhất theo contract cố định để frontend (`DashboardView`, `MapViewer`, `ScenariosView`, `BusinessCaseView`) bind dữ liệu một cách thuần khiết, không cần biết engine bên trong dùng solver nào.

---

## 4. SCHEMA DỮ LIỆU MỚI

### 4.1. Input bắt buộc / tuỳ chọn

| Bảng | Cột bắt buộc | Cột mới (v2) | Nguồn gốc |
| --- | --- | --- | --- |
| `shipment_records` | `from_id`, `to_id`, `tons`, `date` | `sku`, `product_family`, `unit_value_usd`, `service_class` | ERP doanh nghiệp |
| `warehouse_registry` | `hub_id`, `lat`, `lon`, `capacity_tons` | `capacity_by_product`, `security_level`, `near_port`, `near_airport`, `fixed_cost` | Doanh nghiệp + bộ đăng ký kho |
| `factory_customer_port` | `node_id`, `type`, `lat`, `lon` | `product_families_handled` | Doanh nghiệp |
| `cost_lead_time` | `from_id`, `to_id`, `distance_km`, `lead_time_hr` | `transport_rate_by_product`, `reliability_pct` | Road transport performance |
| `freight_od_public` | `origin_region`, `dest_region`, `volume` | (như cũ) | Freight O/D 2022 / 2024 |
| `gis_admin` | `region_code`, `geometry` | (như cũ) | GIS quốc gia |

`product_family` là khoá nối tất cả các tầng. Nếu doanh nghiệp không cung cấp, tầng 1 sẽ chạy **product classifier** (rule-based + ML phụ trợ) trên `sku` hoặc `description`.

### 4.2. Output payload (contract của tầng 7)

```jsonc
{
  "scenario_run_id": "uuid",
  "recommended_scenario": "S3",
  "scenarios": [
    {
      "id": "S0", "label": "Current",
      "cost_index": 100, "service_level": 0.90, "risk_score": 0.72,
      "opened_hubs": [...], "assignments": [...]
    },
    /* ... S1..S5 ... */
  ],
  "network": {
    "hubs": [
      {
        "hub_id": "GG_METRO",
        "role": "metro_fulfillment",
        "lat": 37.41, "lon": 127.0,
        "product_scope": ["mobile_launch", "finished_goods", "spare_parts"],
        "current_utilization": 1.32,
        "recommended_utilization": 0.91,
        "status": "watchlist"
      }
      /* ... */
    ],
    "allocations": [
      { "region": "Seoul", "hub_id": "GG_METRO", "product": "mobile_launch", "tons": 1240, "rationale": "..." }
    ]
  },
  "cost_breakdown": {
    "by_component": { "transport": 0.41, "warehouse": 0.18, "handling": 0.12, "inventory": 0.14, "seasonal_flex": 0.08, "sla_penalty": 0.07 },
    "by_lane_top10": [ { "lane": "Gyeonggi → Busan", "cost_share": 0.09, "driver": "long north-south line-haul" } ]
  },
  "seasonal_playbook": [
    { "event": "Q1_galaxy_launch", "actions": ["pre-position mobile inventory at Gyeonggi+Daejeon", "reserve Gumi→metro line-haul"] }
  ],
  "roadmap": [
    { "phase": 1, "timeline_months": "0-2", "actions": [...] },
    { "phase": 2, "timeline_months": "2-4", "actions": [...] },
    { "phase": 3, "timeline_months": "4-6", "actions": [...] },
    { "phase": 4, "timeline_months": "ongoing", "actions": [...] }
  ],
  "business_case": {
    "cost_saving_pct_vs_current": 0.19,
    "service_improvement_pct": 0.06,
    "risk_reduction": "high",
    "executive_summary": "..."
  },
  "data_quality_report": {
    "missing_fields": [], "imputed_fields": ["product_family"], "warnings": []
  }
}
```

Frontend hiện tại (`DashboardView.tsx`, `MapViewer.tsx`, `ScenariosView.tsx`, `BusinessCaseView.tsx`) đã có placeholder cho đa số khối này — v2 chỉ cần điền đầy đủ và bổ sung view phụ cho `cost_breakdown.by_component` và `seasonal_playbook`.

---

## 5. THAY ĐỔI CỤ THỂ TRONG CODE BASE

### 5.1. Backend (`logihub_application_code/backend`)

- **`models.py`**: tách thành package `engine/` với các module
  - `engine/ingestion.py` (tầng 1)
  - `engine/segmentation.py` (tầng 2 — mới)
  - `engine/costing.py` (tầng 3 — mới)
  - `engine/optimizer.py` (tầng 4 — refactor `run_p_median`, `run_uflp`, `run_cflp`, `run_mclp` thành `solve(model_kind, demand_cube, cost_tensor, eligibility, constraints)` chung; thêm `run_hybrid_cflp`)
  - `engine/scenarios.py` (tầng 5 — mới, định nghĩa S0–S5 và runner song song)
  - `engine/synthesis.py` (tầng 6 — mới, hub role classifier + roadmap generator)
  - `engine/contract.py` (tầng 7 — mới, schema validation cho output)
- **`main.py`**: một endpoint mới `/api/v2/run-engine` nhận `RunRequest{ company_profile, scenario_set }` và trả full payload contract. Endpoint v1 (`/api/optimize`) giữ lại cho tương thích ngược, được cài đặt như một mô phỏng `S2 generic` của engine v2.
- **`utils.py`**: thêm `product_classifier`, `season_decomposer`, `geocode_cached`.

### 5.2. Frontend (`logihub_application_code/frontend/src`)

- **`OptimizerWizard.tsx`** thêm bước "Product family mapping" và "Scenario set selector".
- **`DashboardView.tsx`** hiển thị thêm card `cost_breakdown.by_component` (stacked bar) và `business_case`.
- **`ScenariosView.tsx`** đổi từ list mô hình sang grid S0–S5 với 3 trục đánh giá.
- **`BusinessCaseView.tsx`** hiển thị roadmap 4 phase và executive summary.
- **`MapViewer.tsx`** thêm layer "hub role" (màu khác nhau cho metro / secure / bulky / port) và overlay `seasonal_playbook` theo mùa.

### 5.3. Mock data (`generate_mock_data.py`)

- Sinh thêm `product_family` cho mỗi shipment.
- Sinh `capacity_by_product` cho warehouse.
- Sinh `unit_value_usd` để inventory holding cost có ý nghĩa.
- Sinh `seasonal_factor` để cube `h[i,p,t]` không phẳng.

---

## 6. LỘ TRÌNH TRIỂN KHAI ENGINE v2

| Phase | Thời gian gợi ý | Phạm vi | Tiêu chí hoàn thành |
| --- | --- | --- | --- |
| **P1 — Foundation** | Tuần 1–2 | Refactor `models.py` thành package `engine/`; giữ nguyên hành vi v1 | Test cũ pass, endpoint v1 không vỡ |
| **P2 — Demand Cube + Cost Tensor** | Tuần 3–4 | Hiện thực tầng 2 và tầng 3; cập nhật `generate_mock_data.py` | Cube `h[i,p,t]` và tensor `C[i,j,p,t,k]` chạy end-to-end với mock |
| **P3 — Hybrid-CFLP + Scenarios** | Tuần 5–7 | Hiện thực `run_hybrid_cflp` và scenario runner S0–S5 | Output đầy đủ 6 scenario với 3 trục đánh giá |
| **P4 — Strategic Synthesis** | Tuần 8–9 | Hub role classifier, roadmap generator, business case writer | Payload contract khớp 100% với spec ở mục 4.2 |
| **P5 — Frontend Cockpit v2** | Tuần 10–12 | Cập nhật 5 view + thêm view "Cost Breakdown" và "Seasonal Playbook" | Demo case Samsung tái tạo được output trong Outcome Analysis |
| **P6 — Hardening** | Tuần 13–14 | Test với 2 case khác (FMCG, 3PL), tuning hệ số mặc định, tài liệu hoá API v2 | Sẵn sàng pilot khách hàng |

---

## 7. THAM CHIẾU NGƯỢC TỚI OUTCOME ANALYSIS

Để chứng minh engine v2 đủ năng lực sinh ra outcome Samsung, đối chiếu từng mục của outcome với tầng đảm nhiệm:

| Mục Outcome | Tầng đảm nhiệm | Artefact cụ thể |
| --- | --- | --- |
| §1 Phân lớp 4 dòng demand | Tầng 2 | `demand_cube h[i,p,t]` |
| §2 Regional demand profile 17 vùng | Tầng 2 | `regional_demand_profile` |
| §3 Diagnosis hiện trạng | Tầng 5 (S0) + Tầng 6 | `business_case.executive_summary` |
| §4 6 thành phần chi phí | Tầng 3 | `cost_tensor C[...,k]` |
| §5 High-cost lane diagnosis | Tầng 3 + Tầng 7 | `cost_breakdown.by_lane_top10` |
| §6 Số hub đề xuất (6-node hybrid) | Tầng 4 (Hybrid-CFLP) | `network.hubs` |
| §7 Vai trò từng node | Tầng 6 | `hub.role`, `hub.product_scope` |
| §8 Allocation 17 vùng → hub | Tầng 4 + Tầng 6 | `network.allocations` |
| §9 Hub utilization current vs recommended | Tầng 6 | `hub.current_utilization`, `hub.recommended_utilization` |
| §10 Seasonal demand & strategy | Tầng 2 + Tầng 6 | `seasonal_playbook` |
| §11 So sánh 6 kịch bản | Tầng 5 | `scenarios[]` |
| §12 Final recommendation | Tầng 6 | `recommended_scenario` + `business_case` |
| §13 Roadmap 4 phase | Tầng 6 | `roadmap[]` |
| §14 Executive output | Tầng 7 | `business_case.executive_summary` |

---

## 8. NGUYÊN TẮC THIẾT KẾ ĐƯỢC GIỮ XUYÊN SUỐT

Bốn nguyên tắc dẫn dắt mọi quyết định trong engine v2 và là tiêu chí review code khi triển khai:

Nguyên tắc thứ nhất, **mọi tầng phải có hợp đồng rõ ràng**: input/output đều là cấu trúc dữ liệu được validate, không có side-effect ngầm. Một tầng có thể được thay thế bởi triển khai khác (ví dụ thay solver CBC bằng Gurobi) mà không ảnh hưởng tầng khác.

Nguyên tắc thứ hai, **product family là first-class citizen**: bất cứ chỉ số nào — demand, cost, capacity, utilization, allocation — đều phải có thể tra theo `product_family`. Đây là khác biệt căn bản giữa "single-flavor optimizer" và "logistics intelligence engine".

Nguyên tắc thứ ba, **mọi khuyến nghị phải truy vết được**: từ một câu trong `business_case.executive_summary` phải đi ngược về được hub được gán role, allocation, cost components, và assumption ban đầu. Engine v2 lưu `provenance` cho từng artefact để frontend có thể bật chế độ "explain" cho senior manager.

Nguyên tắc thứ tư, **tối ưu là một bước, không phải toàn bộ**: tầng 4 (optimizer) chỉ chiếm khoảng 30% giá trị của engine v2. 70% còn lại nằm ở segmentation đúng (tầng 2), cost modeling đúng (tầng 3), kịch bản phong phú (tầng 5), và synthesis nói được ngôn ngữ quản trị (tầng 6). Đây là lý do engine v1 — vốn dồn 100% effort vào tầng 4 — không thể trả lời câu hỏi của Samsung.

---

*Tài liệu này là input cho cả backend refactor và frontend redesign. Khi triển khai, từng phase cần kết thúc bằng một đợt regression test trên case Samsung để đảm bảo engine v2 tái tạo được Outcome Analysis bằng phép toán thay vì bằng nội dung viết tay.*
