# Slide Deck: LogiHub Statistics (Ch06 - Ch08)

**Style Guide (Klaviyo Aesthetic):**
- **Background Color (배경색):** Warm Off-White (예: `#F9F7F5` 또는 `#FAFAFA`)
- **Primary Text Color (기본 텍스트 색상):** Charcoal Black (예: `#222222`)
- **Accent Colors (포인트 색상):** Peach/Salmon (`#FF9E80`), Muted Green (`#4E6E5D`)
- **Typography (글꼴):** Bold Serif for Headers (예: *Playfair Display*, *Merriweather*), Clean Sans-Serif for Body (예: *Inter*, *Pretendard*)
- **Layout (레이아웃):** 여백(Whitespace)을 충분히 활용한 미니멀리스트 디자인, 명확한 시각적 계층 구조.

> **💡 OML (Office Math) 사용 팁:**
> 아래의 수식들은 LaTeX 코드(`\frac`, `\mu` 등)를 제외하고 유니코드 텍스트 형식으로 작성되었습니다. 이 텍스트를 파워포인트 텍스트 상자에 그대로 복사하여 붙여넣기 하시면 글꼴 깨짐 없이 자연스럽게 표시됩니다. (PowerPoint 수식 편집기를 켤 필요 없이 텍스트로 바로 사용 가능합니다.)

---

## [Slide 1] Title / 제목
**(Visual: Minimalist LogiHub network graphic / 미니멀한 물류 네트워크 그래픽)**
- **[EN]** Applied Statistics in Logistics: The LogiHub Case (Ch 06 - 08)
- **[KO]** 물류 응용 통계학: LogiHub 사례 연구 (Ch 06 - 08)
- **Subtitle:** Descriptive Statistics, Point Estimation, and Statistical Intervals
- **부제:** 기술 통계, 점 추정 및 표본 분포, 단일 표본 통계적 구간
- **Presenter:** [Team Name / 팀 이름]

---

## [Slide 2] Introduction to LogiHub / LogiHub 소개
**(Visual: 5,900+ Hubs map icon / 5,900개 이상의 물류센터 지도 아이콘)**
- **[EN]** What is LogiHub? A logistics decision cockpit that optimizes warehouse categorization and delivery networks across 5,900+ logistics hubs in Korea using Korean Freight O/D data.
- **[KO]** LogiHub란? 한국 화물 O/D 데이터를 활용하여 국내 5,900개 이상의 물류센터를 분류하고 배송 네트워크를 최적화하는 물류 의사결정 시스템입니다.
- **[EN]** Today's Goal: Apply statistical concepts to analyze and optimize this logistics network.
- **[KO]** 오늘의 목표: 통계적 개념을 적용하여 이 물류 네트워크를 분석하고 최적화합니다.

---

### [Part 1] Ch06: Descriptive Statistics (기술 통계) - Presenter 1

## [Slide 3] Ch06: Understanding Warehouse Data / 물류센터 데이터 이해
- **[EN]** Descriptive statistics help us summarize the features of our 5,900+ warehouses.
- **[KO]** 기술 통계는 5,900개 이상의 물류센터 특징을 요약하는 데 도움을 줍니다.
- **[EN]** Key Measures:
  - Sample Mean (x̄) = (Σ xi) / n : Average daily throughput per hub.
  - Sample Variance (s²) = Σ (xi - x̄)² / (n - 1) : Variability in capacity among hubs.
- **[KO]** 주요 척도:
  - 표본 평균 (x̄) = (Σ xi) / n : 허브당 일평균 처리량.
  - 표본 분산 (s²) = Σ (xi - x̄)² / (n - 1) : 허브 간 수용 능력의 변동성.

## [Slide 4] Ch06: Visualizing the Network / 네트워크 시각화
**(Visual: Box plot and Histogram in Klaviyo Peach/Green colors / Klaviyo 톤의 상자 수염 그림 및 히스토그램)**
- **[EN]** Histogram: Displays the frequency distribution of delivery times (e.g., right-skewed if most deliveries are fast, but some are delayed).
- **[KO]** 히스토그램: 배송 시간의 빈도 분포를 보여줍니다 (대부분 빠른 배송이지만 일부 지연이 있는 경우 우측 꼬리 분포).
- **[EN]** Box Plot: Identifies outliers in our Korean Freight O/D dataset (e.g., unexpectedly high transportation costs).
- **[KO]** 상자 수염 그림: 한국 화물 O/D 데이터셋에서 이상치를 식별합니다 (예: 예상치 못하게 높은 운송 비용).

---

### [Part 2] Ch07: Point Estimation & Sampling Distribution (점 추정 및 표본 분포) - Presenter 2

## [Slide 5] Ch07: Point Estimation in LogiHub / LogiHub의 점 추정
- **[EN]** Point Estimator: A single value used to estimate a population parameter (e.g., true average delivery cost μ).
- **[KO]** 점 추정량: 모집단 모수(예: 실제 평균 배송 비용 μ)를 추정하는 데 사용되는 단일 값.
- **[EN]** Unbiased Estimator: E(Θ̂) = θ. In LogiHub, our sample mean (x̄) of 100 random shipments is an unbiased estimator of the total population mean delivery time (μ).
- **[KO]** 불편 추정량: E(Θ̂) = θ. LogiHub에서 100개의 무작위 화물 표본 평균(x̄)은 전체 모집단 평균 배송 시간(μ)의 불편 추정량입니다.

## [Slide 6] Ch07: Central Limit Theorem (CLT) / 중심극한정리
- **[EN]** Even if individual delivery times are not normally distributed, the average delivery time of a large sample (n ≥ 30) will be approximately normally distributed.
- **[KO]** 개별 배송 시간이 정규 분포를 따르지 않더라도, 대규모 표본(n ≥ 30)의 평균 배송 시간은 근사적으로 정규 분포를 따릅니다.
- **[EN]** Formula: Z = (x̄ - μ) / (σ / √n)  ~  N(0, 1)
- **[KO]** 공식: Z = (x̄ - μ) / (σ / √n)  ~  N(0, 1)
- **[EN]** Application: This allows us to predict the probability of meeting our SLA (Service Level Agreement) targets reliably!
- **[KO]** 적용: 이를 통해 SLA(서비스 수준 협약) 목표를 달성할 확률을 신뢰할 수 있게 예측할 수 있습니다!

---

### [Part 3] Ch08: Statistical Intervals for a Single Sample (단일 표본 통계적 구간) - Presenter 3

## [Slide 7] Ch08: Confidence Intervals (CI) / 신뢰 구간
- **[EN]** A point estimate (x̄) isn't enough. We need an interval to express our uncertainty.
- **[KO]** 점 추정치(x̄)만으로는 불충분합니다. 불확실성을 표현하기 위해 구간이 필요합니다.
- **[EN]** 95% Confidence Interval for Mean Delivery Cost (when σ is known):
- **[KO]** 평균 배송 비용에 대한 95% 신뢰 구간 (σ를 아는 경우):
- **Formula:** x̄ - z_α/2 * (σ / √n) ≤ μ ≤ x̄ + z_α/2 * (σ / √n)
- **[EN]** Interpretation: We are 95% confident that the true average transportation cost of LogiHub operations falls within this interval.
- **[KO]** 해석: 우리는 LogiHub 운영의 실제 평균 운송 비용이 이 구간 내에 속한다고 95% 확신합니다.

## [Slide 8] Ch08: When Population Variance is Unknown / 모분산을 모를 때 (t-Distribution)
- **[EN]** In reality, we don't know the population variance (σ²) of the Korean Freight O/D data. We use sample variance (s²) and the t-distribution.
- **[KO]** 현실적으로 우리는 한국 화물 O/D 데이터의 모분산(σ²)을 모릅니다. 따라서 표본 분산(s²)과 t-분포를 사용합니다.
- **Formula:** x̄ ± t_(α/2, n-1) * (s / √n)
- **[EN]** Large sample (n > 40) allows t-distribution to approximate standard normal (z).
- **[KO]** 대규모 표본(n > 40)의 경우 t-분포는 표준 정규 분포(z)에 근사합니다.

## [Slide 9] Ch08: Prediction & Tolerance Intervals / 예측 및 허용 구간
- **[EN]** Prediction Interval: Predicts the delivery time of ONE future shipment. (Wider than CI)
- **[KO]** 예측 구간: 향후 발생할 '단일' 화물의 배송 시간을 예측합니다. (신뢰 구간보다 넓음)
- **[EN]** Tolerance Interval: Captures a specified proportion (e.g., 99%) of all shipments with a certain confidence level. Crucial for robust logistics testing!
- **[KO]** 허용 구간: 특정 신뢰 수준에서 전체 화물의 특정 비율(예: 99%)을 포함합니다. 강력한 물류 테스트에 필수적입니다!

---

## [Slide 10] Conclusion & YouTube Assignment Reminder / 결론 및 유튜브 과제 리마인더
- **[EN]** Through Descriptive Statistics, Estimations, and Confidence Intervals, we can confidently design and evaluate the LogiHub network.
- **[KO]** 기술 통계, 추정 및 신뢰 구간을 통해 우리는 LogiHub 네트워크를 자신 있게 설계하고 평가할 수 있습니다.
- **[EN]** Assignment Checklist:
  - [ ] Camera ON showing all members faces.
  - [ ] Equal participation (1 person explains to the rest of the team).
  - [ ] Video length: 40 - 60 minutes.
  - [ ] Upload video and add the link to the Google Sheet (YouTube Assignment 2 tab).
- **[KO]** 과제 제출 전 필수 확인 사항:
  - [ ] 모든 팀원의 얼굴이 보이도록 카메라 ON 상태 유지.
  - [ ] 분량을 균등하게 배분하고, 한 명이 다른 팀원들에게 설명하는 방식 진행.
  - [ ] 촬영 분량: 최소 40분 이상 최대 1시간 이내.
  - [ ] 영상 업로드 후 구글 시트의 '유튜브 과제 2 링크' 탭에 링크 추가 완료.
