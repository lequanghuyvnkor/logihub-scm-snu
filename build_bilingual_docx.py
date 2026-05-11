"""
Build bilingual EN–KO Word document from LogiHub_Research_Report_Full.md
Strategy: generate a bilingual markdown, then call Pandoc → DOCX with math=mathml
"""

import subprocess, re, os

SRC = r"c:\Users\PC\Downloads\LogiHub_Project_Archive\LogiHub_Research_Report_Full.md"
OUT_MD = r"c:\Users\PC\Downloads\LogiHub_Project_Archive\LogiHub_Report_EN_KO.md"
OUT_DOCX = r"c:\Users\PC\Downloads\LogiHub_Project_Archive\LogiHub_Report_EN_KO.docx"

# ── Translation map (Vietnamese → English + Korean) ─────────────────────────
# Each entry: (vi_pattern, en_text, ko_text)
# Used for section headers & labels; paragraph text translated inline below.

HEADER_MAP = {
    "BÁO CÁO NGHIÊN CỨU": ("RESEARCH REPORT", "연구 보고서"),
    "Tối ưu hoá mạng lưới kho phân phối tại Hàn Quốc dựa trên dữ liệu Freight Origin-Destination":
        ("Optimizing Logistics Hub Networks in Korea Using Freight Origin-Destination Data",
         "화물 기종점(O/D) 데이터 기반 한국 물류 허브 네트워크 최적화"),
    "TÓM TẮT (ABSTRACT)": ("ABSTRACT", "초록"),
    "ĐỊNH HƯỚNG NGHIÊN CỨU (DEFINE RESEARCH DIRECTION)":
        ("1. RESEARCH DIRECTION", "1. 연구 방향"),
    "Chủ đề nghiên cứu (Research Topic)": ("1.1 Research Topic", "1.1 연구 주제"),
    "Câu hỏi nghiên cứu chính (Main Research Question)":
        ("1.2 Main Research Question", "1.2 핵심 연구 질문"),
    "Câu hỏi nghiên cứu phụ (Sub Research Questions)":
        ("1.3 Sub Research Questions", "1.3 세부 연구 질문"),
    "CƠ SỞ LÝ THUYẾT (LITERATURE & CONCEPTUAL FOUNDATION)":
        ("2. LITERATURE & CONCEPTUAL FOUNDATION", "2. 이론적 배경"),
    "Logistics Network Design": ("2.1 Logistics Network Design", "2.1 물류 네트워크 설계"),
    "Facility Location Models": ("2.2 Facility Location Models", "2.2 설비 입지 모델"),
    "Freight Origin-Destination Analysis":
        ("2.3 Freight O/D Analysis", "2.3 화물 기종점 분석"),
    "Warehouse Infrastructure Analysis":
        ("2.4 Warehouse Infrastructure Analysis", "2.4 물류창고 인프라 분석"),
    "THU THẬP DỮ LIỆU (DATA ACQUISITION)":
        ("3. DATA ACQUISITION", "3. 데이터 수집"),
    "TIỀN XỬ LÝ DỮ LIỆU (DATA PREPROCESSING)":
        ("4. DATA PREPROCESSING", "4. 데이터 전처리"),
    "PHÂN TÍCH MÔ TẢ (DESCRIPTIVE ANALYTICS)":
        ("5. DESCRIPTIVE ANALYTICS", "5. 기술 분석"),
    "XÂY DỰNG MÔ HÌNH NGHIÊN CỨU (RESEARCH MODEL CONSTRUCTION)":
        ("6. RESEARCH MODEL CONSTRUCTION", "6. 연구 모델 구축"),
    "CÁC MÔ HÌNH TỐI ƯU HOÁ (OPTIMIZATION MODELS)":
        ("7. OPTIMIZATION MODELS", "7. 최적화 모델"),
    "THIẾT KẾ KỊCH BẢN (SCENARIO DESIGN)":
        ("8. SCENARIO DESIGN", "8. 시나리오 설계"),
    "GIẢI MÔ HÌNH (MODEL SOLVING)":
        ("9. MODEL SOLVING & RESULTS", "9. 모델 풀이 및 결과"),
    "DIỄN GIẢI KẾT QUẢ (RESULT INTERPRETATION)":
        ("10. RESULT INTERPRETATION", "10. 결과 해석"),
    "THẢO LUẬN (DISCUSSION)": ("11. DISCUSSION", "11. 논의"),
    "KẾT LUẬN (CONCLUSION)": ("12. CONCLUSION", "12. 결론"),
    "TÀI LIỆU THAM KHẢO": ("REFERENCES", "참고문헌"),
    "PHỤ LỤC": ("APPENDIX", "부록"),
}

# ── Paragraph-level bilingual translations ────────────────────────────────────
# Each tuple: (vi_start_pattern, english_para, korean_para)
PARA_MAP = [
    # Abstract
    ("Nghiên cứu này xây dựng một engine phân tích",
     "This study develops an analytical and optimization engine for logistics hub networks of large enterprises in Korea, using the publicly available Korean Freight Origin-Destination (O/D) data from the Ministry of Land, Infrastructure and Transport (MOLIT) as a proxy for internal enterprise shipment data. The engine consists of 10 sequential processing modules—from raw data ingestion to management recommendation generation—applying three classical optimization models in Facility Location theory: P-median, Uncapacitated Facility Location Problem (UFLP), and Capacitated Facility Location Problem (CFLP). The study designs 5 main scenarios (P = 3, 5, 7 hubs; current vs. optimized network; capacity-constrained) plus one sensitivity analysis, running across 17 administrative regions of Korea. Results show the 5-hub network achieves the optimal trade-off among cost, service coverage, and resilience—reducing logistics costs by approximately 18% and improving the service rate within a 200 km radius from 78% to 96% compared to the current 3-hub network. The final outcome report is automatically generated in 16-section markdown format, simulating senior supply chain manager-level output. *Important note: cost coefficients in this study are derived from industry-average benchmark values, not actual enterprise contracts; the analytical framework and optimization logic are of production-equivalent quality, while absolute figures are for demonstration.*",
     "본 연구는 한국 대기업의 물류 허브 네트워크 분석·최적화 엔진을 구축한다. 한국 국토교통부(MOLIT)가 공개한 화물 기종점(O/D) 데이터를 기업 내부 물류 데이터의 대리(proxy)로 활용하였다. 엔진은 원시 데이터 수집부터 경영 권고안 생성까지 10개 순차 처리 모듈로 구성되며, 설비 입지 이론의 세 가지 고전 최적화 모델—P-중앙값(P-median), 비용량 설비 입지 문제(UFLP), 용량 제약 설비 입지 문제(CFLP)—을 적용한다. 한국 17개 행정 구역을 대상으로 5개 주요 시나리오(P = 3, 5, 7개 허브; 현행 대비 최적 네트워크; 용량 제약)와 민감도 분석을 수행하였다. 결과적으로 5-허브 네트워크가 비용·서비스 범위·견고성 간 최적의 균형점을 달성하였으며, 기존 3-허브 대비 물류 비용을 약 18% 절감하고 반경 200 km 내 서비스율을 78%에서 96%로 향상시켰다. 최종 결과 보고서는 16개 섹션 마크다운 형식으로 자동 생성되며, 시니어 공급망 관리자 수준의 출력을 모사한다. *중요 참고: 본 연구의 비용 계수는 물류 업계 평균 벤치마크 값에서 도출된 것으로 실제 기업 계약 기준이 아니다. 분석 구조 및 최적화 논리는 실제 운영 엔진 수준이며, 절대적 수치는 시연용이다.*"),

    # Section 1.1
    ("Nghiên cứu này tập trung vào bài toán",
     "This study focuses on the problem of **optimal logistics hub network design for large enterprises in Korea**, a core problem in modern supply chain management. In particular, it builds an engine that automates the entire analytical process—from ingesting raw freight data and estimating regional demand to running mathematical optimization models and generating management recommendations. The geographic scope covers 17 administrative regions of Korea (Seoul, Gyeonggi, Incheon, Busan, Daegu, Daejeon, Gwangju, Ulsan, Sejong, Gangwon, Chungbuk, Chungnam, Jeonbuk, Jeonnam, Gyeongbuk, Gyeongnam, Jeju). The time frame uses Freight O/D data from 2022 (main survey) and 2024 (update). Target enterprises are assumed to be large conglomerates such as Samsung, LG, and Hyundai with nationwide distribution operations.",
     "본 연구는 한국 대기업을 위한 **최적 물류 허브 네트워크 설계 문제**에 집중한다. 이는 현대 공급망 관리의 핵심 과제이다. 특히 원시 화물 데이터 수집, 지역 수요 추정, 수학적 최적화 모델 실행, 경영 권고안 생성에 이르는 전체 분석 과정을 자동화하는 엔진을 구축한다. 지리적 범위는 한국 17개 행정 구역(서울, 경기, 인천, 부산, 대구, 대전, 광주, 울산, 세종, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주)이다. 분석 기간은 2022년 본조사 및 2024년 갱신 화물 O/D 데이터를 사용한다. 대상 기업은 삼성, LG, 현대 등 전국 유통망을 보유한 대기업을 가정한다."),

    # Main research question
    ("Mạng lưới kho phân phối tối ưu",
     "> **What is the optimal distribution hub network for a large enterprise in Korea—how many hubs, in which regions, which regions does each hub serve, and what are the trade-offs among fixed costs, transportation costs, service coverage, and capacity utilization?**",
     "> **한국 대기업을 위한 최적 물류 허브 네트워크는 몇 개의 허브로 구성되어야 하며, 각 허브는 어느 지역에 위치해야 하고, 어느 지역을 담당해야 하며, 고정 비용·운송 비용·서비스 범위·설비 가동률 간의 상충 관계는 어떠한가?**"),

    # Section 2 intro
    ("Logistics Network Design là nhánh",
     "Logistics Network Design is a research branch focusing on three strategic supply chain decisions: **facility location**, **capacity allocation**, and **market and supply allocation**. According to Chopra and Meindl (2016), logistics network design is a long-term decision affecting a firm's cost efficiency for many years after implementation. Christopher (2016) emphasizes that a logistics network must balance **cost**, **service level**, **flexibility**, and **resilience**. Simchi-Levi et al. (2008) classify network design decisions into three levels: strategic (facility location, capacity, distribution network), tactical (inventory allocation, carrier selection), and operational (scheduling, order management). This study focuses on the **strategic** level.",
     "물류 네트워크 설계는 공급망의 세 가지 전략적 의사결정—**설비 입지**, **용량 할당**, **시장·공급 할당**—에 초점을 맞춘 연구 분야이다. Chopra와 Meindl(2016)에 따르면 물류 네트워크 설계는 구현 이후 수년간 기업의 비용 효율성에 영향을 미치는 장기적 결정이다. Christopher(2016)는 물류 네트워크가 **비용**, **서비스 수준**, **유연성**, **회복탄력성** 간 균형을 맞춰야 한다고 강조한다. Simchi-Levi 등(2008)은 네트워크 설계 의사결정을 전략(설비 위치·용량·유통망), 전술(재고 할당·운송사 선택), 운영(일정 수립·주문 관리) 세 단계로 분류한다. 본 연구는 **전략** 단계에 집중한다."),

    # Conclusion
    ("Nghiên cứu này đã xây dựng thành công",
     "This study successfully developed an analytical and optimization engine for the logistics hub network of large enterprises in Korea, using publicly available Freight O/D data as a proxy for internal enterprise data. The engine comprises 10 sequential modules, applying three classical optimization models (P-median, UFLP, CFLP) across 5 main scenarios plus sensitivity analysis.\n\nKey finding: **the 5-hub network is the optimal strategic configuration** for large enterprises in Korea. The 5 optimal hubs are **Gyeonggi, Daejeon, Daegu, Gwangju, and Busan**. This network reduces logistics costs by approximately 24% compared to the current 3-hub network (USD 108.3M vs. USD 142.5M per year) and raises coverage within a 200 km radius from 78% to 96%. Increasing from 5 to 7 hubs saves only an additional 2.4% in cost—insufficient to offset the added fixed costs—making 5 the sweet spot.\n\nThis engine can be reused for specific enterprises by feeding internal shipment data in place of proxy data, without changing the architecture or code. This is a core asset for future commercialization as a SaaS product.",
     "본 연구는 한국 대기업의 물류 허브 네트워크 분석·최적화 엔진을 성공적으로 구축하였다. 공개된 화물 O/D 데이터를 기업 내부 데이터의 대리값으로 활용하였으며, 10개 순차 처리 모듈과 세 가지 고전 최적화 모델(P-중앙값, UFLP, CFLP)을 적용하여 5개 주요 시나리오와 민감도 분석을 수행하였다.\n\n핵심 결과: **5-허브 네트워크가 전략적 수준의 최적 구성**이다. 5개 최적 허브는 **경기, 대전, 대구, 광주, 부산**이다. 이 네트워크는 현행 3-허브 대비 물류 비용을 약 24% 절감(연간 1억 425만 달러 → 1억 830만 달러)하고 반경 200 km 내 서비스율을 78%에서 96%로 향상시킨다. 5개에서 7개로 허브를 늘리면 비용이 2.4%만 추가 절감되어 고정 비용 증가를 상쇄하지 못하므로 5개가 최적점이다.\n\n본 엔진은 아키텍처나 코드를 변경하지 않고 내부 물류 데이터를 입력하는 것만으로 특정 기업에 재활용할 수 있어 향후 SaaS 제품 상용화의 핵심 자산이 된다."),
]

# ── Build bilingual markdown ─────────────────────────────────────────────────
def translate_header(line: str) -> str:
    """Replace VI header text with EN | KO bilingual header."""
    for vi, (en, ko) in HEADER_MAP.items():
        if vi in line:
            hashes = re.match(r'^(#+)\s', line)
            prefix = hashes.group(1) + ' ' if hashes else ''
            return f"{prefix}{en} / {ko}\n"
    return line

def insert_bilingual_para(lines: list) -> list:
    """After each translated paragraph, insert EN + KO versions."""
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        matched = False
        for vi_start, en_text, ko_text in PARA_MAP:
            if line.strip().startswith(vi_start[:30]):
                # Collect the full VI paragraph (until blank line)
                # Skip original VI lines
                while i < len(lines) and lines[i].strip():
                    i += 1
                # Insert EN block
                result.append(f"\n{en_text}\n")
                result.append(f"\n{ko_text}\n")
                matched = True
                break
        if not matched:
            result.append(line)
            i += 1
    return result

with open(SRC, encoding="utf-8") as f:
    raw_lines = f.readlines()

# Pass 1: translate headers
processed = [translate_header(l) for l in raw_lines]
# Pass 2: insert bilingual paragraphs
processed = insert_bilingual_para(processed)

# Write bilingual markdown
with open(OUT_MD, "w", encoding="utf-8") as f:
    f.writelines(processed)

print(f"[OK] Bilingual markdown written → {OUT_MD}")

# ── Pandoc: markdown → DOCX with Office Math (OMML) ─────────────────────────
# --mathml converts $...$ and $$...$$ to OMML which Word renders natively
pandoc_cmd = [
    "pandoc",
    OUT_MD,
    "-o", OUT_DOCX,
    "--mathml",
    "--toc",
    "--toc-depth=2",
    "-V", "geometry:margin=2.5cm",
    "--reference-doc", "reference.docx",   # will skip if missing
]

# Try with reference.docx first; fall back without it
try:
    result = subprocess.run(pandoc_cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        raise RuntimeError(result.stderr)
except Exception:
    # Fallback: no reference doc
    pandoc_cmd_simple = [
        "pandoc", OUT_MD, "-o", OUT_DOCX,
        "--mathml", "--toc", "--toc-depth=2"
    ]
    result = subprocess.run(pandoc_cmd_simple, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        print(f"[ERROR] Pandoc: {result.stderr}")
    else:
        print(f"[OK] DOCX written → {OUT_DOCX}")
        print("     Formulas rendered as Office Math (OMML) — opens natively in Word.")
else:
    if result.returncode == 0:
        print(f"[OK] DOCX written → {OUT_DOCX}")
        print("     Formulas rendered as Office Math (OMML) — opens natively in Word.")
