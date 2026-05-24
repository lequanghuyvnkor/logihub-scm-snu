# 📄 LOGIHUB ONBOARDING MASTER DOC — NHÓM C (DIAGNOSIS & OUTCOME)

## I. TỔNG QUAN DỰ ÁN (PROJECT CONTEXT)
**LogiHub Intelligence** là một công cụ hỗ trợ quyết định (Decision Cockpit) giúp các doanh nghiệp tối ưu hóa mạng lưới kho bãi và vận tải tại Hàn Quốc.
*   **Dữ liệu đầu vào:** Freight Origin-Destination (OD) thực tế của Hàn Quốc.
*   **Mục tiêu:** Giảm chi phí vận hành, đảm bảo SLA (mức độ phục vụ) và đưa ra lộ trình (Roadmap) cải thiện mạng lưới logistics.
*   **Cơ chế vận hành:** Chia làm 3 Engine (A, B, C) kết nối qua một bản hợp đồng dữ liệu chung (JSON Contract v1.0).

---

## II. VAI TRÒ CỦA NHÓM C (THE STRATEGIST)
Nhóm C giữ vai trò là "Bộ não chiến lược" và "Người phát ngôn" của dự án. Bạn đứng ở cuối quy trình để chuyển hóa con số thành quyết định kinh doanh.
1.  **Phân đoạn (Segmentation):** Gán nhãn chiến lược cho hàng hóa.
2.  **Chẩn đoán (Diagnosis):** Tìm ra "bệnh" của mạng lưới hiện tại.
3.  **Tổng hợp (Synthesis):** Xây dựng kịch bản tối ưu và lộ trình đầu tư (ROI).
4.  **Báo cáo (Outcome):** Trình bày kết quả dưới dạng Markdown/Word/Slides chuyên nghiệp.

---

## III. CHI TIẾT CÁC NHIỆM VỤ THỰC THI (WBS C1 - C12)

### 1. Phân loại sản phẩm (C1 - Product Segmentation)
*   **Nhiệm vụ:** Viết bộ phân loại 7 nhóm sản phẩm (Mobile, Bulky, Secure, Spare parts, Ecommerce, Finished goods, General cargo).
*   **Logic:** Sử dụng Heuristic (phỏng đoán thông minh) dựa trên Origin/Destination/Volume.
*   **Mục tiêu tỷ lệ:** Mobile (18-25%), Bulky (15-20%), Secure (8-12%).
*   **Sản phẩm:** `classifier_rules.json` và `od_by_product.csv`.

### 2. Chẩn đoán mạng lưới (C2 - Network Diagnosis)
*   **Nhiệm vụ:** Xác định kho nào quá tải (>90%), kho nào bỏ trống (<30%), vùng nào xa kho (SLA Gap).
*   **Sản phẩm:** 5 bảng chẩn đoán (Health Score, High-Cost Lanes, Capacity Utilization, Coverage Gap, Risk Report).

### 3. Vai trò kho bãi (C3 - Hub Role Assignment)
*   **Nhiệm vụ:** Gán 6 vai trò chiến lược cho các kho (Mega Hub, Regional Hub, Secure Node, Service Node, Port/Cross-dock, Overflow).
*   **Sản phẩm:** `hub_role_assignment.csv`.

### 4. Kế hoạch mùa vụ (C4 - Seasonal Playbook)
*   **Nhiệm vụ:** Xây dựng cẩm nang ứng phó khi nhu cầu tăng đột biến (ví dụ: Peak Detection cho các sự kiện ra mắt sản phẩm).
*   **Sản phẩm:** `seasonal_playbook.json`.

### 5. Bài toán kinh doanh & Lộ trình (C5 - Business Case & Roadmap)
*   **Nhiệm vụ:** Tính toán ROI (Vốn đầu tư/Tiền tiết kiệm) và chia lộ trình triển khai (Phase 1, 2, 3).
*   **Sản phẩm:** `implementation_roadmap.json`, `business_case_summary.md`.

### 6. Quản trị đầu ra (C6 - C12)
*   **Nhiệm vụ:** Thiết kế Template 16 mục, render dữ liệu thành báo cáo hoàn chỉnh (15-20 trang), và lắp ráp Slides thuyết trình.

---

## IV. KIẾN TRÚC DỮ LIỆU "LOCKED CONTRACT V1.0"
Đây là tiêu chuẩn kỹ thuật bắt buộc để kết nối với Nhóm A, B và Frontend:
*   **File Schema:** `engine_contract.schema.json`
*   **Contract Version:** `v1.0-locked`
*   **Nguyên tắc:** Mọi Key và Type dữ liệu đầu ra của bạn phải khớp chính xác với định nghĩa trong Schema này.

---

## V. TIẾN ĐỘ & CÁC CỘT MỐC QUAN TRỌNG (MILESTONES)
*   **Tuần 3-4:** Hoàn thành logic Engine C (C1, C2, C3).
*   **Tuần 5:** Tích hợp (Integration) lần 1. Ráp luồng dữ liệu A -> B -> C.
*   **Tuần 6:** Hoàn thiện Outcome v2 (Báo cáo biên tập chuyên nghiệp).
*   **Tuần 7:** Tự động hóa xuất báo cáo qua CLI `render-outcome`.
*   **Tuần 8:** Thuyết trình giữa kỳ (Midterm Presentation).

---

## VI. PHƯƠNG PHÁP LÀM VIỆC (BEST PRACTICES)
1.  **Mock-driven Development:** Sử dụng dữ liệu trong thư mục `mocks/` để viết code ngay lập tức mà không cần đợi Nhóm A và B xong dữ liệu thật.
2.  **Hash-based Heuristic:** Sử dụng hàm băm (Hash) trên Lane ID để đảm bảo tính nhất quán của việc phân loại hàng hóa.
3.  **Data Integrity:** Luôn kiểm tra tính toàn vẹn dữ liệu ("Every lane must map to ≥ 1 rule").
4.  **Git Workflow:** Thực hiện `git pull --rebase` hàng ngày để tránh xung đột code với các thành viên khác.

---
*Tài liệu này được biên soạn riêng cho Nhóm C - LogiHub Project.*
