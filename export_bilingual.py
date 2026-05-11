import subprocess, sys, os
sys.stdout.reconfigure(encoding='utf-8')

SRC  = r"c:\Users\PC\Downloads\LogiHub_Project_Archive\LogiHub_Research_Report_Full.md"
OUT_MD   = r"c:\Users\PC\Downloads\LogiHub_Project_Archive\LogiHub_Report_EN_KO.md"
OUT_DOCX = r"c:\Users\PC\Downloads\LogiHub_Project_Archive\LogiHub_Report_EN_KO.docx"

# ------------------------------------------------------------------
# Bilingual translation blocks inserted AFTER each Vietnamese section
# Format: (vi_trigger_start, english_block, korean_block)
SECTIONS = [
    # Title
    ("LOGIHUB INTELLIGENCE", None, None),  # keep as-is

    # Abstract
    ("Nghiên cứu này xây dựng một engine",
"""**[EN] ABSTRACT**

This study builds an analytical and optimization engine for logistics hub networks of large Korean enterprises, using publicly available Korean Freight O/D data from MOLIT as a proxy for internal shipment data. The engine has 10 sequential modules applying three classical Facility Location models: P-median, UFLP, and CFLP. Five scenarios (P = 3, 5, 7 hubs; current vs. optimal; capacity-constrained) plus sensitivity analysis are run across 17 Korean administrative regions. The 5-hub network achieves the optimal balance—reducing logistics costs ~18% and raising 200 km service coverage from 78% to 96% vs. the current 3-hub baseline. Results are auto-generated as a 16-section markdown report simulating senior SCM manager output. *Note: cost coefficients are industry-average benchmarks, not actual contracts; analytical structure and optimization logic are production-equivalent; absolute figures are for demonstration.*""",
"""**[KO] 초록**

본 연구는 한국 대기업의 물류 허브 네트워크 분석·최적화 엔진을 구축한다. 국토교통부(MOLIT) 공개 화물 기종점(O/D) 데이터를 기업 내부 물류 데이터의 대리값(proxy)으로 활용하였다. 엔진은 원시 데이터 수집부터 경영 권고안 생성까지 10개 순차 처리 모듈로 구성되며, 설비 입지(Facility Location) 이론의 세 고전 모델—P-중앙값(P-median), 비용량 설비 입지 문제(UFLP), 용량 제약 설비 입지 문제(CFLP)—을 적용한다. 한국 17개 행정 구역을 대상으로 5개 주요 시나리오와 민감도 분석을 수행하였다. 5-허브 네트워크가 비용·서비스 범위·견고성의 최적 균형을 달성하였으며, 기존 3-허브 대비 물류 비용을 약 18% 절감하고 반경 200 km 내 서비스율을 78%에서 96%로 향상시켰다. *참고: 비용 계수는 업계 평균 벤치마크 값이며 실제 계약 기준이 아니다. 분석 구조 및 최적화 논리는 실제 엔진 수준이며, 절대 수치는 시연용이다.*"""),

    # Section 1.1
    ("Nghiên cứu này tập trung vào bài toán",
"""**[EN] 1.1 Research Topic**

This study focuses on the **optimal logistics hub network design problem for large enterprises in Korea**. It builds an engine that automates the full analytical pipeline—from ingesting raw freight data and estimating regional demand to running mathematical optimization models and generating management recommendations. Geographic scope: 17 Korean administrative regions. Time frame: Freight O/D 2022 (main survey) and 2024 (update). Target firms: large conglomerates with nationwide distribution (Samsung, LG, Hyundai).""",
"""**[KO] 1.1 연구 주제**

본 연구는 **한국 대기업을 위한 최적 물류 허브 네트워크 설계 문제**에 집중한다. 원시 화물 데이터 수집, 지역 수요 추정, 수학적 최적화 모델 실행, 경영 권고안 생성까지 전체 분석 파이프라인을 자동화하는 엔진을 구축한다. 지리적 범위: 한국 17개 행정 구역. 분석 기간: 2022년 본조사 및 2024년 갱신 O/D 데이터. 대상 기업: 삼성, LG, 현대 등 전국 유통망 보유 대기업."""),

    # Main RQ
    ("Mạng lưới kho phân phối tối ưu cho một doanh nghiệp",
"""**[EN] Main Research Question**

> What is the optimal distribution hub network for a large Korean enterprise — how many hubs, in which regions, which regions does each hub serve, and what are the trade-offs among fixed costs, transportation costs, service coverage, and capacity utilization?""",
"""**[KO] 핵심 연구 질문**

> 한국 대기업을 위한 최적 물류 허브 네트워크는 몇 개의 허브로 구성되어야 하며, 각 허브는 어느 지역에 위치해야 하고, 어느 지역을 서비스해야 하며, 고정 비용·운송 비용·서비스 범위·설비 가동률 간 상충 관계는 어떠한가?"""),

    # Section 2.2 P-Median
    ("P-Median Problem. Bài toán P-median",
"""**[EN] P-Median Problem**

Proposed by Hakimi (1964), the P-median problem selects exactly P sites from a candidate set to minimize the total weighted distance between demand points and their assigned facilities:

$$\\min \\sum_{i \\in I}\\sum_{j \\in J} h_i \\cdot c_{ij} \\cdot y_{ij}$$

Subject to: exactly P facilities open ($\\sum_j x_j = P$); each demand point assigned to exactly one facility ($\\sum_j y_{ij} = 1\\ \\forall i$); assignment only to open facilities ($y_{ij} \\le x_j$). Variables $x_j, y_{ij} \\in \\{0,1\\}$.""",
"""**[KO] P-중앙값 문제**

Hakimi(1964)가 제안한 P-중앙값 문제는 후보지 집합에서 정확히 P개의 시설을 선택하여 수요 지점과 배정된 시설 간 총 가중 거리를 최소화한다:

$$\\min \\sum_{i \\in I}\\sum_{j \\in J} h_i \\cdot c_{ij} \\cdot y_{ij}$$

제약 조건: 정확히 P개 시설 개설 ($\\sum_j x_j = P$), 각 수요 지점은 하나의 시설에 배정 ($\\sum_j y_{ij} = 1\\ \\forall i$), 개설된 시설에만 배정 ($y_{ij} \\le x_j$). 변수 $x_j, y_{ij} \\in \\{0,1\\}$."""),

    # UFLP
    ("Uncapacitated Facility Location Problem (UFLP). Đề xuất bởi Balinski",
"""**[EN] Uncapacitated Facility Location Problem (UFLP)**

Proposed by Balinski (1965), UFLP does not fix the number of open facilities but selects them by balancing fixed opening costs against transportation savings:

$$\\min \\sum_{j \\in J} f_j \\cdot x_j + \\sum_{i \\in I}\\sum_{j \\in J} h_i \\cdot c_{ij} \\cdot y_{ij}$$

Same assignment constraints as P-median but without the fixed-P constraint. UFLP answers: "Should we open one more facility given it costs $f_j$ annually but reduces transport cost?" """,
"""**[KO] 비용량 설비 입지 문제 (UFLP)**

Balinski(1965)가 제안한 UFLP는 개설 시설 수를 고정하지 않고, 고정 개설 비용과 운송 비용 절감 간 균형으로 시설을 선택한다:

$$\\min \\sum_{j \\in J} f_j \\cdot x_j + \\sum_{i \\in I}\\sum_{j \\in J} h_i \\cdot c_{ij} \\cdot y_{ij}$$

P-중앙값과 동일한 배정 제약이나 고정 P 제약은 없다. UFLP는 "연간 $f_j$의 비용이 드는 시설을 추가로 개설할 것인가?"라는 질문에 답한다."""),

    # CFLP
    ("Capacitated Facility Location Problem (CFLP). Bổ sung ràng buộc capacity",
"""**[EN] Capacitated Facility Location Problem (CFLP)**

Adds a hard capacity constraint to UFLP. Each facility $j$ can serve at most $\\text{Cap}_j$ units of demand:

$$\\sum_{i \\in I} h_i \\cdot z_{ij} \\le \\text{Cap}_j \\cdot x_j \\quad \\forall j$$

Here $z_{ij}$ is a **continuous flow variable** (fraction of demand from region $i$ served by hub $j$), replacing the binary $y_{ij}$, since under capacity constraints one region may be split across multiple hubs. CFLP is closest to real enterprise settings as every warehouse has physical limits.""",
"""**[KO] 용량 제약 설비 입지 문제 (CFLP)**

UFLP에 강한 용량 제약을 추가한다. 각 시설 $j$는 최대 $\\text{Cap}_j$ 단위의 수요만 처리 가능하다:

$$\\sum_{i \\in I} h_i \\cdot z_{ij} \\le \\text{Cap}_j \\cdot x_j \\quad \\forall j$$

$z_{ij}$는 **연속 흐름 변수**(지역 $i$의 수요 중 허브 $j$가 처리하는 비율)로, 이진 변수 $y_{ij}$를 대체한다. 용량 제약 하에서는 한 지역의 수요가 여러 허브에 분산될 수 있기 때문이다. 모든 창고에는 물리적 한계가 있으므로 CFLP가 실제 기업 환경에 가장 적합하다."""),

    # Haversine
    ("Cách 1 — Khoảng cách thuần (haversine):",
"""**[EN] Distance / Cost Matrix**

**Method 1 — Haversine distance:**

$$d_{ij} = R \\cdot 2 \\cdot \\arcsin\\sqrt{\\sin^2\\!\\left(\\frac{\\Delta\\phi}{2}\\right) + \\cos\\phi_i \\cos\\phi_j \\sin^2\\!\\left(\\frac{\\Delta\\lambda}{2}\\right)}$$

where $R = 6{,}371$ km, $\\phi$ = latitude, $\\lambda$ = longitude.

**Method 2 — Transport cost:**

$$c_{ij} = d_{ij} \\cdot \\text{rate}_{\\text{transport}} \\cdot (1 + \\text{surcharge}_{ij})$$

Average rate: 0.10 USD/ton-km for general cargo. Surcharges: long-haul > 300 km +8%, Jeju island +35%.""",
"""**[KO] 거리/비용 행렬**

**방법 1 — 하버사인 거리:**

$$d_{ij} = R \\cdot 2 \\cdot \\arcsin\\sqrt{\\sin^2\\!\\left(\\frac{\\Delta\\phi}{2}\\right) + \\cos\\phi_i \\cos\\phi_j \\sin^2\\!\\left(\\frac{\\Delta\\lambda}{2}\\right)}$$

$R = 6{,}371$ km, $\\phi$ = 위도, $\\lambda$ = 경도.

**방법 2 — 운송 비용:**

$$c_{ij} = d_{ij} \\cdot \\text{운송요율} \\cdot (1 + \\text{할증료}_{ij})$$

일반 화물 평균 요율: 톤-km당 0.10 USD. 할증료: 장거리(> 300 km) +8%, 제주도(도서) +35%."""),

    # Conclusion
    ("Nghiên cứu này đã xây dựng thành công",
"""**[EN] 12. CONCLUSION**

This study successfully developed an analytical and optimization engine for Korean logistics hub networks using public Freight O/D data as a proxy. The 10-module engine applies P-median, UFLP, and CFLP across 5 scenarios.

**Key result: the 5-hub network is strategically optimal.** The 5 optimal hubs are **Gyeonggi, Daejeon, Daegu, Gwangju, and Busan**. This reduces logistics costs ~24% vs. the 3-hub baseline (USD 108.3M vs. 142.5M/yr) and raises 200 km coverage from 78% to 96%. Expanding to 7 hubs saves only 2.4% more—insufficient to offset added fixed costs—confirming 5 as the sweet spot.

The engine can be reused for specific enterprises by substituting internal shipment data without changing architecture or code, making it a core asset for future SaaS commercialization.""",
"""**[KO] 12. 결론**

본 연구는 공개 화물 O/D 데이터를 대리값으로 활용하여 한국 물류 허브 네트워크 분석·최적화 엔진을 성공적으로 구축하였다. 10개 모듈 엔진이 5개 시나리오에서 P-중앙값, UFLP, CFLP를 적용한다.

**핵심 결과: 5-허브 네트워크가 전략적 최적 구성이다.** 5개 최적 허브는 **경기, 대전, 대구, 광주, 부산**이다. 이는 기존 3-허브 대비 물류 비용을 약 24% 절감(연간 1억 830만 달러 vs. 1억 4,250만 달러)하고 반경 200 km 서비스율을 78%에서 96%로 향상시킨다. 7-허브로 확장 시 추가 절감은 2.4%에 불과하여 고정 비용 증가를 상쇄하지 못하므로 5개가 최적점임을 확인하였다.

엔진은 아키텍처와 코드를 변경하지 않고 내부 물류 데이터를 입력하는 것만으로 특정 기업에 재활용할 수 있어 향후 SaaS 상용화의 핵심 자산이 된다."""),
]

# ------------------------------------------------------------------
# Read source
with open(SRC, encoding='utf-8') as f:
    lines = f.readlines()

out_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    inserted = False
    for entry in SECTIONS:
        trigger = entry[0]
        if len(entry) == 3 and entry[1] and trigger in line:
            en_block = entry[1]
            ko_block = entry[2]
            # Output original VI line
            out_lines.append(line)
            # Collect rest of VI paragraph
            i += 1
            while i < len(lines) and lines[i].strip():
                out_lines.append(lines[i])
                i += 1
            # Insert blank + EN block + blank + KO block
            out_lines.append('\n')
            for b in en_block.splitlines(keepends=False):
                out_lines.append(b + '\n')
            out_lines.append('\n')
            for b in ko_block.splitlines(keepends=False):
                out_lines.append(b + '\n')
            out_lines.append('\n')
            inserted = True
            break
    if not inserted:
        out_lines.append(line)
        i += 1

with open(OUT_MD, 'w', encoding='utf-8') as f:
    f.writelines(out_lines)

print("Bilingual MD written OK")

# ------------------------------------------------------------------
# Pandoc -> DOCX  (--mathml = Office Math OMML, renders in Word natively)
cmd = [
    'pandoc', OUT_MD,
    '-o', OUT_DOCX,
    '--mathml',
    '--toc',
    '--toc-depth=2',
    '-M', 'title=LogiHub Intelligence — Research Report (EN/KO)',
    '-M', 'lang=en',
]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
if r.returncode == 0:
    size = os.path.getsize(OUT_DOCX) // 1024
    print(f"DOCX written OK  ({size} KB)")
    print(f"Path: {OUT_DOCX}")
    print("Formulas: rendered as Office Math (OMML) - opens natively in Word")
else:
    print("Pandoc error:", r.stderr[:500])
