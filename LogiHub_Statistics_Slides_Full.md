# Slide Deck: Applied Statistics in Logistics (LogiHub Case Study - Comprehensive 65-Slide Course)

**Style Guide (Klaviyo Aesthetic):**
- **Background Color (배경색):** Warm Off-White (`#F9F7F5`)
- **Primary Text Color (기본 텍스트 색상):** Charcoal Black (`#222222`)
- **Accent Colors (포인트 색상):** Peach/Salmon (`#FF9E80`), Muted Green (`#4E6E5D`)
- **Typography (글꼴):** Bold Serif for Headers (*Playfair Display*), Clean Sans-Serif for Body (*Inter*, *Pretendard*)
- **Layout (레이아웃):** Minimalist with ample whitespace, clear visual hierarchy.

> **💡 OML (Office Math) Usage Tip / OML 사용 팁:**
> The formulas in this document use Unicode text (OML-friendly) instead of LaTeX (e.g., `\frac`, `\mu`). You can copy and paste them directly into PowerPoint text boxes without layout breakage.
> 본 문서의 수식들은 LaTeX 대신 유니코드 텍스트(OML 친화적)로 작성되었습니다. 파워포인트 텍스트 상자에 그대로 복사하여 붙여넣기 하시면 글꼴 깨짐 없이 표시됩니다.

---

## [Slide 1] Course Title / 강의 제목
**(Visual: Minimalist LogiHub network graphic with Peach and Muted Green accents / 피치 및 뮤트 그린 포인트의 미니멀한 LogiHub 네트워크 그래픽)**
- **[EN]** Applied Statistics in Logistics: The LogiHub Case Study (Ch 06 - 08)
- **[KO]** 물류 응용 통계학: LogiHub 사례 연구 (Ch 06 - 08)
- **Subtitle:** Descriptive Statistics, Point Estimation, and Statistical Intervals
- **부제:** 기술 통계, 점 추정 및 표본 분포, 단일 표본 통계적 구간
- **Presenter:** [Your Name / Instructor Name]

---

## [Slide 2] Course Overview / 강의 개요
- **[EN]** Master the statistical foundations required for logistics network optimization.
- **[KO]** 물류 네트워크 최적화에 필요한 통계적 기초를 마스터합니다.
- **[EN]** Structure:
  - Part 1: Ch 06 - Descriptive Statistics (Slides 3-23)
  - Part 2: Ch 07 - Point Estimation & Sampling Distributions (Slides 24-42)
  - Part 3: Ch 08 - Statistical Intervals for a Single Sample (Slides 43-65)
- **[KO]** 구성:
  - 1부: Ch 06 - 기술 통계 (Slide 3-23)
  - 2부: Ch 07 - 점 추정 및 표본 분포 (Slide 24-42)
  - 3부: Ch 08 - 단일 표본 통계적 구간 (Slide 43-65)

---

# [Part 1] Chapter 06: Descriptive Statistics / 6장: 기술 통계

## [Slide 3] Ch06: Introduction to Descriptive Statistics / 기술 통계학 개요
- **[EN]** What is Descriptive Statistics? Methods for organizing, summarizing, and presenting logistics data in an informative way.
- **[KO]** 기술 통계학이란? 물류 데이터를 유용한 방식으로 정리, 요약, 제시하는 방법론입니다.
- **[EN]** Goal: Transform raw Korean Freight O/D data into actionable logistics intelligence.
- **[KO]** 목표: 정제되지 않은 한국 화물 O/D 데이터를 실행 가능한 물류 인텔리전스로 변환합니다.

## [Slide 4] Ch06: Population vs. Sample in LogiHub / 모집단 vs. 표본
- **[EN]** **Population (N):** Entire set of all 5,900+ logistics hubs in Korea.
- **[KO]** **모집단 (N):** 국내 5,900개 이상의 전체 물류 허브 세트.
- **[EN]** **Sample (n):** A subset selected from the population (e.g., 100 randomly selected hubs for detailed cost auditing).
- **[KO]** **표본 (n):** 모집단에서 선택된 하위 세트 (예: 상세 비용 감사를 위해 무작위로 선택된 100개 허브).

## [Slide 5] Ch06: Quantitative vs. Qualitative Logistics Data / 양적 vs. 질적 물류 데이터
- **[EN]** **Qualitative Data (Categorical):** Warehouse industry categories (e.g., Cold Chain, General Cargo, Dangerous Goods).
- **[KO]** **질적 데이터 (범주형):** 물류창고 업종 분류 (예: 콜드체인, 일반화물, 위험물).
- **[EN]** **Quantitative Data (Numerical):** Number of daily shipments, weight of cargo, delivery duration.
- **[KO]** **양적 데이터 (수치형):** 일일 배송 건수, 화물 무게, 배송 소요 시간.

## [Slide 6] Ch06: Discrete vs. Continuous Metrics / 이산 vs. 연속형 지표
- **[EN]** **Discrete Metrics:** Countable values.
  - Example: Daily truck arrivals at LogiHub Seoul (e.g., 15, 16 trucks).
- **[KO]** **이산형 지표:** 셀 수 있는 값.
  - 예시: LogiHub 서울 센터의 일일 트럭 도착 대수 (예: 15대, 16대).
- **[EN]** **Continuous Metrics:** Uncountable values on a scale.
  - Example: Exact transit time between Busan Hub and Daejeon Hub (e.g., 3.42 hours).
- **[KO]** **연속형 지표:** 연속적인 척도 위의 값.
  - 예시: 부산 허브와 대전 허브 사이의 정확한 수송 시간 (예: 3.42시간).

## [Slide 7] Ch06: Graphical Summaries Overview / 시각적 요약 개요
- **[EN]** Why visualize? Tables of 5,900+ rows are impossible to read. Graphical methods show patterns, shapes, and anomalies instantly.
- **[KO]** 시각화가 필요한 이유: 5,900개 이상의 행으로 구성된 표는 한눈에 읽기 어렵습니다. 시각적 요약은 패턴, 분포의 형태, 이상치를 즉시 드러냅니다.
- **[EN]** We will cover: Stem-and-leaf, Histograms, Box plots, Time sequence, Scatter, and Normal probability plots.
- **[KO]** 다룰 내용: 줄기-잎 그림, 히스토그램, 상자 그림, 시계열 그림, 산점도, 정규 확률도.

## [Slide 8] Ch06: Stem-and-Leaf Diagrams / 줄기-잎 그림
- **[EN]** **Definition:** A graphical tool that helps visualize the distribution of a small quantitative dataset while preserving individual values.
- **[KO]** **정의:** 개별 데이터 값을 보존하면서 소규모 양적 데이터셋의 분포를 시각화하는 도구입니다.
- **[EN]** **Structure:**
  - **Stem:** Leading digits (tens, hundreds).
  - **Leaf:** Trailing digits (units).
- **[KO]** **구조:**
  - **줄기 (Stem):** 앞자리 숫자 (십의 자리, 백의 자리).
  - **잎 (Leaf):** 뒷자리 숫자 (일의 자리).

## [Slide 9] Ch06: Stem-and-Leaf (LogiHub Cost Example) / 줄기-잎 그림 예시
- **[EN]** Sample of 15 delivery costs (USD): 21, 23, 23, 26, 30, 32, 35, 35, 38, 41, 44, 45, 48, 52, 57.
- **[KO]** 15개 배송 비용 샘플 (USD): 21, 23, 23, 26, 30, 32, 35, 35, 38, 41, 44, 45, 48, 52, 57.
- **[EN]** Representation:
  - 2 | 1 3 3 6
  - 3 | 0 2 5 5 8
  - 4 | 1 4 5 8
  - 5 | 2 7
- **[KO]** 시각화 결과:
  - 2 | 1 3 3 6
  - 3 | 0 2 5 5 8
  - 4 | 1 4 5 8
  - 5 | 2 7

## [Slide 10] Ch06: Frequency Distributions / 빈도 분포
- **[EN]** **Definition:** A table summarizing quantitative data by dividing them into non-overlapping intervals (classes) and counting the frequency of observations in each class.
- **[KO]** **정의:** 양적 데이터를 중복되지 않는 구간(계급)으로 나누고, 각 구간에 속하는 데이터의 빈도를 집계한 표입니다.
- **[EN]** Helps identify the "shape" of LogiHub's delivery performance across various regions.
- **[KO]** 다양한 지역에 걸친 LogiHub의 배송 성과 "형태"를 파악하는 데 유용합니다.

## [Slide 11] Ch06: Histograms in Logistics / 물류에서의 히스토그램
**(Visual: Muted Green histogram showing right-skewed delivery times / 우측으로 꼬리가 긴 배송 시간을 보여주는 뮤트 그린 히스토그램)**
- **[EN]** Graphical representation of a frequency distribution.
- **[KO]** 빈도 분포를 시각적으로 표현한 그래프입니다.
- **[EN]** **Key Insight:** Left/Right skewness.
  - LogiHub delivery times are typically **Right-Skewed**: a high concentration of fast deliveries on the left, and a long tail of delayed deliveries on the right.
- **[KO]** **핵심 인사이트:** 좌측/우측 왜도.
  - LogiHub 배송 시간은 일반적으로 **우측 편향 (우측 꼬리 분포)**을 보입니다. 즉, 빠른 배송은 왼쪽에 밀집되어 있고 지연 배송은 우측으로 긴 꼬리를 형성합니다.

## [Slide 12] Ch06: Relative & Cumulative Frequency / 상대 빈도 및 누적 빈도
- **[EN]** **Relative Frequency:** Class Frequency / Total Sample Size (n). Tells us the proportion (percentage) of shipments.
- **[KO]** **상대 빈도:** 계급 빈도 / 전체 표본 크기 (n). 배송 건수의 비율(백분율)을 나타냅니다.
- **[EN]** **Cumulative Relative Frequency:** Running total of relative frequencies.
  - Application: "What percentage of LogiHub orders are delivered within 4 hours?"
- **[KO]** **누적 상대 빈도:** 상대 빈도의 누적 합계.
  - 적용: "LogiHub 주문의 몇 퍼센트가 4시간 이내에 배송 완료되는가?"

## [Slide 13] Ch06: Box Plots (Definition) / 상자 그림 (정의)
- **[EN]** A standardized way of displaying the distribution of data based on a five-number summary: Minimum, Q1 (25th percentile), Median (50th percentile), Q3 (75th percentile), Maximum.
- **[KO]** 다섯 수치 요약(최솟값, 제1사분위수 Q1, 중앙값 Q2, 제3사분위수 Q3, 최댓값)을 바탕으로 데이터 분포를 보여주는 표준화된 그래프입니다.
- **[EN]** Used heavily in LogiHub to monitor cost variance and stability.
- **[KO]** LogiHub에서 비용 변동성과 안정성을 모니터링하기 위해 광범위하게 사용됩니다.

## [Slide 14] Ch06: Box Plots (LogiHub Outliers) / 상자 그림 (이상치 탐지)
**(Visual: Box plot highlighting outlier nodes in Peach color / 피치 색상으로 이상치 노드를 강조한 상자 그림)**
- **[EN]** **Interquartile Range (IQR) = Q3 - Q1**
- **[KO]** **사분위간 범위 (IQR) = Q3 - Q1**
- **[EN]** **Outlier Rules:**
  - Lower Limit = Q1 - 1.5 * IQR
  - Upper Limit = Q3 + 1.5 * IQR
  - Values outside limits are marked as outliers (e.g., severe transport delays due to heavy snow).
- **[KO]** **이상치 규칙:**
  - 하한선 = Q1 - 1.5 * IQR
  - 상한선 = Q3 + 1.5 * IQR
  - 한계선을 벗어나는 값들은 이상치로 표시됩니다 (예: 폭설로 인한 극심한 운송 지연).

## [Slide 15] Ch06: Time Sequence Plots / 시계열 그림
- **[EN]** Displays observations plotted in order of time to reveal trends, cycles, or seasonal movements.
- **[KO]** 트렌드, 주기 또는 계절적 변동을 파악하기 위해 데이터를 시간 순서대로 표시한 그래프입니다.
- **[EN]** **LogiHub Application:**
  - X-axis: Days of the month.
  - Y-axis: Total volume of freight processed.
  - Reveals heavy demand spikes every Monday.
- **[KO]** **LogiHub 적용:**
  - X축: 한 달 중 일자.
  - Y축: 총 화물 처리량.
  - 매주 월요일마다 화물량 수요가 급증하는 패턴을 파악할 수 있습니다.

## [Slide 16] Ch06: Scatter Diagrams / 산점도
- **[EN]** Plot of paired quantitative observations (x, y) used to examine the relationship between two variables.
- **[KO]** 두 변수 사이의 관계를 조사하기 위해 짝을 이룬 양적 데이터 (x, y)를 타점한 그래프입니다.
- **[EN]** **Variables:**
  - Independent (x): Transit Distance (km).
  - Dependent (y): Total Fuel/Toll Cost (KRW).
- **[KO]** **변수 설정:**
  - 독립변수 (x): 이동 거리 (km).
  - 종속변수 (y): 총 연료/통행료 비용 (KRW).

## [Slide 17] Ch06: Scatter Diagrams (Interpretation) / 산점도 해석
- **[EN]** Patterns to observe:
  - Positive linear correlation: Cost increases proportionally with distance.
  - Negative correlation: Unit cost decreases as package volume increases.
  - No correlation: Random distribution.
- **[KO]** 관찰할 수 있는 패턴:
  - 양의 선형 상관관계: 거리가 멀어질수록 비용이 비례하여 증가합니다.
  - 음의 상관관계: 화물 부피가 커질수록 단위당 배송 비용이 감소합니다.
  - 상관관계 없음: 무작위 분포 형태를 띱니다.

## [Slide 18] Ch06: Normal Probability Plots / 정규 확률도
- **[EN]** A graphical technique for assessing whether a dataset is approximately normally distributed.
- **[KO]** 데이터셋이 근사적으로 정규 분포를 따르는지 평가하기 위한 시각적 기법입니다.
- **[EN]** **Interpretation:**
  - If the plotted points fall close to a straight diagonal line, the data follows a normal distribution.
  - S-shaped curves indicate heavy-tailed distributions (higher volatility).
- **[KO]** **해석 방법:**
  - 플로팅된 점들이 직선 대각선에 가깝게 정렬되면 데이터가 정규 분포를 따르는 것입니다.
  - S자 모양의 곡선은 꼬리가 두꺼운 분포(높은 변동성)를 나타냅니다.

## [Slide 19] Ch06: Measures of Location: Mean & Median / 중심 위치의 측도: 평균과 중앙값
- **[EN]** **Sample Mean (x̄) = (Σ xi) / n**
  - Balance point of the dataset. Highly sensitive to outliers.
- **[KO]** **표본 평균 (x̄) = (Σ xi) / n**
  - 데이터셋의 균형점입니다. 이상치에 매우 민감합니다.
- **[EN]** **Sample Median (~x):**
  - Midpoint when values are sorted. Robust to outliers (e.g., 1 extremely high freight fee doesn't affect it).
- **[KO]** **표본 중앙값 (~x):**
  - 데이터를 크기순으로 정렬했을 때의 가운데 값입니다. 이상치에 강건합니다 (예: 단 하나의 극단적으로 높은 화물 수수료에 영향을 받지 않음).

## [Slide 20] Ch06: Measures of Variability: Range & Variance / 변동성의 측도: 범위와 분산
- **[EN]** **Range:** Max Value - Min Value.
- **[KO]** **범위:** 최댓값 - 최솟값.
- **[EN]** **Sample Variance (s²):**
  - s² = Σ (xi - x̄)² / (n - 1)
  - Standard deviation (s) is the square root of variance, expressing variation in the original unit (e.g., hours or USD).
- **[KO]** **표본 분산 (s²):**
  - s² = Σ (xi - x̄)² / (n - 1)
  - 표본 표준편차(s)는 분산의 제곱근으로, 변동성을 원래 단위(예: 시간 또는 USD)로 표현합니다.

## [Slide 21] Ch06: Why Divide by n-1? / 왜 n-1로 나누는가?
- **[EN]** If we divided by `n`, the sample variance would systematically underestimate the true population variance (σ²).
- **[KO]** `n`으로 나누면 표본 분산이 모집단 분산(σ²)을 체계적으로 과소평가하게 됩니다.
- **[EN]** Dividing by `n-1` provides an **unbiased estimator** of σ². It compensates for the fact that we use x̄ instead of the true population mean μ.
- **[KO]** `n-1`로 나누어 줌으로써 σ²의 **불편 추정량**을 확보할 수 있습니다. 이는 실제 모평균 μ 대신 표본평균 x̄를 사용하기 때문에 발생하는 편향을 보정합니다.

## [Slide 22] Ch06: Skewness and Kurtosis / 왜도와 첨도
- **[EN]** **Skewness:** Measures asymmetry of the distribution.
  - Positive value = Right-skewed (logistics lead times).
- **[KO]** **왜도 (Skewness):** 분포의 비대칭성을 측정합니다.
  - 양수 (+) = 우측 편향 분포 (물류 리드 타임).
- **[EN]** **Kurtosis:** Measures "peakedness" and tail heaviness.
  - High kurtosis = prone to extreme shipping delay outliers.
- **[KO]** **첨도 (Kurtosis):** 분포의 뾰족한 정도와 꼬리의 두꺼움을 측정합니다.
  - 높은 첨도 = 극단적인 배송 지연 이상치가 발생하기 쉬운 환경.

## [Slide 23] Ch06: Descriptive Statistics Summary / 6장 기술 통계 요약
- **[EN]** By calculating mean, variance, and plotting box plots/histograms, LogiHub diagnostic dashboards can immediately flag inefficient warehouses.
- **[KO]** 평균, 분산을 계산하고 상자 그림/히스토그램을 그림으로써 LogiHub 진단 대시보드는 비효율적인 물류창고를 즉시 찾아낼 수 있습니다.
- **[EN]** Next: How do we use these sample stats to guess true population parameters? (Ch07)
- **[KO]** 다음 단계: 이러한 표본 통계량을 통해 어떻게 실제 모집단 모수를 유추할까요? (7장)

---

# [Part 2] Chapter 07: Point Estimation & Sampling Distributions / 7장: 점 추정 및 표본 분포

## [Slide 24] Ch07: Introduction to Statistical Inference / 통계적 추론 개요
- **[EN]** We use sample statistics (like x̄) to draw conclusions about unknown population parameters (like μ).
- **[KO]** 우리는 미지의 모집단 모수(μ 등)에 대한 결론을 내리기 위해 표본 통계량(x̄ 등)을 사용합니다.
- **[EN]** **Point Estimation:** A single numeric value representing the best guess of the parameter.
- **[KO]** **점 추정 (Point Estimation):** 모수의 최선 추정치를 나타내는 단일 수치 값.

## [Slide 25] Ch07: Parameters vs. Statistics / 모수 vs. 통계량
- **[EN]** **Parameter (Population):**
  - Mean: μ
  - Variance: σ²
  - Proportion: p
- **[KO]** **모수 (모집단 전체):**
  - 평균: μ
  - 분산: σ²
  - 비율: p
- **[EN]** **Statistic (Sample):**
  - Mean: x̄
  - Variance: s²
  - Proportion: p̂
- **[KO]** **통계량 (샘플 표본):**
  - 평균: x̄
  - 분산: s²
  - 비율: p̂

## [Slide 26] Ch07: What is a Point Estimator? / 점 추정량의 개념
- **[EN]** A formula or rule that tells us how to calculate the estimate based on sample data.
- **[KO]** 표본 데이터를 기반으로 추정치를 계산하는 공식이나 규칙입니다.
- **[EN]** Example: The formula x̄ = (Σ xi) / n is a point estimator of μ.
- **[KO]** 예시: 공식 x̄ = (Σ xi) / n은 모평균 μ에 대한 점 추정량입니다.
- **[EN]** The resulting calculated value is called the "point estimate".
- **[KO]** 계산을 통해 도출된 결과값을 "점 추정치"라고 합니다.

## [Slide 27] Ch07: Unbiased Estimators / 불편 추정량
- **[EN]** A point estimator Θ̂ is unbiased if its expected value is equal to the true population parameter:
  **E(Θ̂) = θ**
- **[KO]** 점 추정량 Θ̂의 기댓값이 실제 모집단 모수와 같을 때, 이를 불편 추정량이라고 합니다:
  **E(Θ̂) = θ**
- **[EN]** It means there is no systematic tendency to over- or underestimate the true value.
- **[KO]** 즉, 실제 값을 체계적으로 과대평가하거나 과소평가하는 경향이 없음을 의미합니다.

## [Slide 28] Ch07: Unbiasedness in LogiHub / LogiHub에서의 불편성
- **[EN]** When sampling delivery times of 100 trucks from 5,900+ hubs:
  - Sample mean x̄ is an unbiased estimator of true population mean μ.
  - Sample variance s² is an unbiased estimator of true variance σ².
- **[KO]** 5,900개 이상의 허브에서 100대 트럭의 배송 시간을 무작위 추출할 때:
  - 표본 평균 x̄는 전체 모집단 평균 μ의 불편 추정량입니다.
  - 표본 분산 s²은 전체 모분산 σ²의 불편 추정량입니다.

## [Slide 29] Ch07: Mean Square Error (MSE) / 평균 제곱 오차
- **[EN]** How do we evaluate the quality of an estimator? We measure its Mean Square Error:
  **MSE(Θ̂) = E[ (Θ̂ - θ)² ]**
- **[KO]** 추정량의 품질을 어떻게 평가할까요? 평균 제곱 오차(MSE)를 측정합니다:
  **MSE(Θ̂) = E[ (Θ̂ - θ)² ]**
- **[EN]** It combines both bias and variance into a single metric.
- **[KO]** 이는 편향(Bias)과 분산(Variance)을 단일 지표로 결합한 것입니다.

## [Slide 30] Ch07: Bias-Variance Decomposition / 편향-분산 분해
**(Visual: Target board diagrams illustrating high/low bias and variance / 높고 낮은 편향과 분산을 보여주는 과녁판 다이어그램)**
- **[EN]** Formula: **MSE(Θ̂) = Variance(Θ̂) + [ Bias(Θ̂) ]²**
- **[KO]** 공식: **MSE(Θ̂) = Variance(Θ̂) + [ Bias(Θ̂) ]²**
- **[EN]** LogiHub modeling trade-off:
  - High Bias: Simple model, ignores logistics complexity.
  - High Variance: Over-complex model, overfits to noise in shipping data.
- **[KO]** LogiHub 모델 구축 시의 트레이드오프:
  - 높은 편향: 단순한 모델, 물류의 복잡성을 무시함.
  - 높은 분산: 너무 복잡한 모델, 배송 데이터의 노이즈까지 과적합함.

## [Slide 31] Ch07: Minimum Variance Unbiased Estimator (MVUE) / 최소 분산 불편 추정량
- **[EN]** Among all unbiased estimators of θ, the one with the smallest variance is called the MVUE.
- **[KO]** 모수 θ에 대한 모든 불편 추정량 중에서 분산이 가장 작은 추정량을 MVUE라고 합니다.
- **[EN]** In normal populations, the sample mean x̄ is the MVUE for estimating μ. It is the most precise unbiased guess!
- **[KO]** 정규 분포를 따르는 모집단에서 표본 평균 x̄는 μ에 대한 MVUE입니다. 가장 정밀하고 편향 없는 최선의 추정치입니다!

## [Slide 32] Ch07: Standard Error of an Estimator / 추정량의 표준 오차
- **[EN]** The standard deviation of a point estimator.
  - For sample mean x̄: **SE(x̄) = σ / √n**
- **[KO]** 점 추정량의 표준편차입니다.
  - 표본 평균 x̄의 경우: **SE(x̄) = σ / √n**
- **[EN]** As sample size (n) increases, the standard error decreases. This means our guess becomes more reliable!
- **[KO]** 표본 크기(n)가 증가할수록 표준 오차는 감소합니다. 즉, 우리의 추정이 훨씬 더 신뢰할 수 있게 됨을 뜻합니다!

## [Slide 33] Ch07: What is a Sampling Distribution? / 표본 분포의 개념
- **[EN]** The probability distribution of a statistic (such as x̄).
- **[KO]** 통계량(x̄ 등)의 확률 분포입니다.
- **[EN]** If we took 1,000 separate samples of size n=100 from LogiHub's 5,900 hubs, we would get 1,000 slightly different values of x̄. The histogram of these x̄ values represents the sampling distribution.
- **[KO]** 5,900개 허브에서 표본 크기 n=100인 표본을 1,000번 독립적으로 추출하면 1,000개의 조금씩 다른 x̄ 값을 얻게 됩니다. 이 x̄ 값들의 히스토그램이 바로 표본 분포를 나타냅니다.

## [Slide 34] Ch07: Central Limit Theorem (CLT) - Definition / 중심극한정리 - 정의
- **[EN]** If random samples of size n are taken from ANY population with mean μ and variance σ², the distribution of the sample mean x̄ will be approximately normal with mean μ and variance σ²/n as n gets large.
- **[KO]** 평균이 μ이고 분산이 σ²인 임의의 모집단으로부터 크기가 n인 무작위 표본을 추출할 때, n이 커질수록 표본 평균 x̄의 분포는 근사적으로 평균이 μ이고 분산이 σ²/n인 정규 분포를 따릅니다.

## [Slide 35] Ch07: CLT Formula / 중심극한정리 공식
- **[EN]** Standardized version of the sample mean:
  **Z = (x̄ - μ) / (σ / √n)  ~  N(0, 1)**
- **[KO]** 표본 평균의 표준화 공식:
  **Z = (x̄ - μ) / (σ / √n)  ~  N(0, 1)**
- **[EN]** This holds true regardless of the shape of the original population distribution!
- **[KO]** 이는 원래 모집단의 분포 형태와 상관없이 무조건 성립합니다!

## [Slide 36] Ch07: CLT Rule of Thumb (n >= 30) / 중심극한정리의 실무 기준
- **[EN]** For most populations, if **n ≥ 30**, the normal approximation is good enough for practical engineering use.
- **[KO]** 대부분의 모집단에서, **n ≥ 30**이면 공학적 실무 관점에서 정규 근사법을 충분히 신뢰할 수 있습니다.
- **[EN]** If the population is highly skewed (like LogiHub transport costs), we may need n ≥ 40 or 50.
- **[KO]** 모집단이 매우 편향되어 있는 경우(LogiHub 운송 비용처럼), n ≥ 40 또는 50의 더 큰 표본이 필요할 수 있습니다.

## [Slide 37] Ch07: CLT LogiHub Example / CLT의 LogiHub 실무 적용
- **[EN]** Let LogiHub average delivery cost be μ = $100 with variance σ² = $400 (σ = $20). We take a sample of n = 100 shipments.
- **[KO]** LogiHub의 평균 배송 비용을 μ = $100, 분산을 σ² = $400 (σ = $20)라 가정합시다. n = 100건의 표본을 추출합니다.
- **[EN]** The distribution of our sample mean x̄ will be:
  - Mean = μ = $100
  - Standard Error = σ / √n = 20 / √100 = $2
  - Distribution: x̄ ~ N(100, 2²)
- **[KO]** 이때 표본 평균 x̄의 분포는 다음과 같습니다:
  - 평균 = μ = $100
  - 표준 오차 = σ / √n = 20 / √100 = $2
  - 분포 형태: x̄ ~ N(100, 2²)

## [Slide 38] Ch07: CLT Calculation Walkthrough / CLT 계산 시연
- **[EN]** Problem: Find the probability that the sample mean cost x̄ is greater than $104.
- **[KO]** 문제: 표본 평균 비용 x̄가 $104보다 클 확률을 구하시오.
- **[EN]** Calculation:
  - Z = (104 - 100) / 2 = 4 / 2 = 2.0
  - P(x̄ > 104) = P(Z > 2.0) = 1 - Φ(2.0) = 1 - 0.9772 = 0.0228 (2.28%)
- **[KO]** 계산 과정:
  - Z = (104 - 100) / 2 = 4 / 2 = 2.0
  - P(x̄ > 104) = P(Z > 2.0) = 1 - Φ(2.0) = 1 - 0.9772 = 0.0228 (2.28%)

## [Slide 39] Ch07: Sampling Distribution of Proportion / 모비율의 표본 분포
- **[EN]** If the true proportion of on-time deliveries is p, the sample proportion p̂ of n orders has:
  - Mean = p
  - Standard Error = √ [ p(1-p) / n ]
- **[KO]** 정시 배송률의 실제 비율을 p라고 할 때, n개 주문에 대한 표본 비율 p̂의 특성은 다음과 같습니다:
  - 평균 = p
  - 표준 오차 = √ [ p(1-p) / n ]
- **[EN]** Approximates normal if np ≥ 5 and n(1-p) ≥ 5.
- **[KO]** np ≥ 5 이고 n(1-p) ≥ 5 이면 정규 분포에 근사합니다.

## [Slide 40] Ch07: Point Estimation Methods / 점 추정량 구하는 방법들
- **[EN]** How do we create point estimators in the first place?
- **[KO]** 애초에 점 추정량은 어떻게 설계되는 것일까요?
- **[EN]** Two primary classical methods:
  1. Method of Moments (MoM)
  2. Method of Maximum Likelihood (MLE)
- **[KO]** 고전적인 두 가지 주요 기법:
  1. 적률법 (Method of Moments, MoM)
  2. 최대 우도법 (Method of Maximum Likelihood, MLE)

## [Slide 41] Ch07: Maximum Likelihood Estimation (MLE) / 최대 우도법
- **[EN]** **Concept:** Find the parameter value that maximizes the probability (likelihood) of observing our actual sample data.
- **[KO]** **개념:** 우리가 수집한 실제 표본 데이터를 관측할 확률(우도)을 최대화하는 모수 값을 찾는 것입니다.
- **[EN]** Likelihood function L(θ) = f(x1; θ) * f(x2; θ) * ... * f(xn; θ).
- **[KO]** 우도 함수 L(θ) = f(x1; θ) * f(x2; θ) * ... * f(xn; θ).
- **[EN]** LogiHub uses MLE to estimate arrival rates in queuing models.
- **[KO]** LogiHub는 대기행렬 모델의 도달률을 추정할 때 MLE를 사용합니다.

## [Slide 42] Ch07: Sampling Distribution Summary / 7장 표본 분포 요약
- **[EN]** Thanks to CLT and unbiased estimators, we can trust that our sample statistics represent the true state of 5,900+ Korean logistics hubs.
- **[KO]** 중심극한정리(CLT)와 불편 추정량 덕분에, 우리는 소수의 표본 통계량이 5,900개 이상의 실제 한국 물류센터 모집단의 상태를 반영한다고 신뢰할 수 있습니다.
- **[EN]** Next: How do we construct interval estimates to express uncertainty? (Ch08)
- **[KO]** 다음 단계: 불확실성을 표현하기 위해 어떻게 구간 추정을 설계할까요? (8장)

---

# [Part 3] Chapter 08: Statistical Intervals for a Single Sample / 8장: 단일 표본 통계적 구간

## [Slide 43] Ch08: Point vs. Interval Estimation / 점 추정 vs. 구간 추정
- **[EN]** Point estimation gives a single guess (e.g., "Daily hub volume is 500 boxes").
- **[KO]** 점 추정은 단 하나의 값만 제공합니다 (예: "허브의 일일 처리량은 500박스입니다").
- **[EN]** BUT we don't know the margin of error.
- **[KO]** 하지만 오차 한계를 전혀 파악할 수 없습니다.
- **[EN]** **Interval Estimation:** Provides a range of plausible values (e.g., "Between 480 and 520 boxes").
- **[KO]** **구간 추정:** 타당한 값들의 범위를 제공합니다 (예: "480박스에서 520박스 사이").

## [Slide 44] Ch08: Confidence Interval (CI) Concept / 신뢰 구간의 기본 개념
- **[EN]** An interval built from sample data that is likely to contain the true population parameter.
- **[KO]** 실제 모집단 모수를 포함할 가능성이 높은 표본 데이터 기반의 구간입니다.
- **[EN]** **Confidence Level 100(1-α)%**: The probability that the estimation procedure will generate an interval that captures the true parameter value over repeated sampling.
- **[KO]** **신뢰 수준 100(1-α)%**: 표본 추출 및 구간 계산 과정을 계속 반복했을 때, 도출된 구간들이 실제 모수를 포함할 확률을 의미합니다.

## [Slide 45] Ch08: CI for Mean, σ Known / 모평균의 신뢰구간 (σ를 아는 경우)
- **[EN]** **Assumptions:**
  - Standard deviation σ is known from historical records.
  - Population is normally distributed OR sample size n is large (CLT).
- **[KO]** **가정 사항:**
  - 역사적 기록을 통해 모집단 표준편차 σ를 알고 있음.
  - 모집단이 정규 분포를 따르거나, 표본 크기 n이 충분히 큼 (CLT).
- **[EN]** **Formula:**
  x̄ - z_α/2 * (σ / √n) ≤ μ ≤ x̄ + z_α/2 * (σ / √n)
- **[KO]** **공식:**
  x̄ - z_α/2 * (σ / √n) ≤ μ ≤ x̄ + z_α/2 * (σ / √n)

## [Slide 46] Ch08: Critical Values (z_α/2) / 임계값
- **[EN]** Standard Normal critical values for common confidence levels:
  - 90% Confidence (α = 0.10) ➔ z_0.05 = 1.645
  - 95% Confidence (α = 0.05) ➔ z_0.025 = 1.96
  - 99% Confidence (α = 0.01) ➔ z_0.005 = 2.575
- **[KO]** 자주 사용되는 신뢰 수준별 표준 정규 임계값:
  - 90% 신뢰수준 (α = 0.10) ➔ z_0.05 = 1.645
  - 95% 신뢰수준 (α = 0.05) ➔ z_0.025 = 1.96
  - 99% 신뢰수준 (α = 0.01) ➔ z_0.005 = 2.575

## [Slide 47] Ch08: CI for Mean, σ Known (LogiHub Walkthrough 1) / 모평균 신뢰구간 (LogiHub 실전 연습 1)
- **[EN]** LogiHub analyzes Daejeon Hub transport cost.
  - Known σ = $15.
  - n = 36 shipments sampled.
  - Sample mean x̄ = $120.
  - Calculate 95% Confidence Interval for μ.
- **[KO]** LogiHub에서 대전 허브의 운송 비용을 분석합니다.
  - 알려진 모표준편차 σ = $15.
  - 표본 크기 n = 36건.
  - 표본 평균 x̄ = $120.
  - 실제 모평균 μ에 대한 95% 신뢰구간을 구하시오.

## [Slide 48] Ch08: CI for Mean, σ Known (LogiHub Walkthrough 2) / 모평균 신뢰구간 (LogiHub 실전 연습 2)
- **[EN]** Calculation:
  - x̄ ± z_0.025 * (σ / √n)
  - 120 ± 1.96 * (15 / √36)
  - 120 ± 1.96 * 2.5
  - 120 ± 4.90 ➔ ($115.10, $124.90)
- **[KO]** 계산 과정:
  - x̄ ± z_0.025 * (σ / √n)
  - 120 ± 1.96 * (15 / √36)
  - 120 ± 1.96 * 2.5
  - 120 ± 4.90 ➔ ($115.10, $124.90)
- **[EN]** **Interpretation:** We are 95% confident that the true average transport cost is between $115.10 and $124.90.
- **[KO]** **해석:** 실제 평균 운송 비용이 $115.10에서 $124.90 사이에 존재한다고 95% 확신합니다.

## [Slide 49] Ch08: The Meaning of "Confidence" / "신뢰"의 통계적 의미
**(Visual: Chart showing 20 confidence intervals, with 1 interval missing the true mean / 실제 평균을 놓치는 1개의 구간을 포함한 20개 신뢰구간 차트)**
- **[EN]** Wrong interpretation: "There is a 95% chance that the true mean μ is inside this specific interval." (μ is a fixed constant, not random!).
- **[KO]** 잘못된 해석: "실제 모평균 μ가 이 특정 구간에 포함될 확률이 95%이다." (모평균 μ는 고정된 상수이므로 무작위 변수가 아닙니다!).
- **[EN]** Correct interpretation: "If we construct 100 intervals using 100 independent samples, approximately 95 of them will contain the true mean μ."
- **[KO]** 올바른 해석: "동일한 방식으로 100개의 무작위 표본을 뽑아 100개의 신뢰구간을 계산하면, 그중 약 95개의 구간이 실제 모평균 μ를 포함합니다."

## [Slide 50] Ch08: Sample Size Determination for Mean / 모평균 추정을 위한 표본 크기 결정
- **[EN]** How large must a sample be to ensure the estimation error does not exceed a desired limit?
- **[KO]** 추정 오차가 원하는 한계값을 넘지 않게 하려면 표본 크기가 얼마나 커야 할까요?
- **[EN]** **Margin of Error (d):** Half-width of the confidence interval.
  **d = z_α/2 * (σ / √n)**
- **[KO]** **오차 한계 (d):** 신뢰구간 전체 길이의 절반.
  **d = z_α/2 * (σ / √n)**

## [Slide 51] Ch08: Sample Size Formula / 표본 크기 결정 공식
- **[EN]** Solving for n:
  **n = [ (z_α/2 * σ) / d ]²**
- **[KO]** n에 대해 정리한 공식:
  **n = [ (z_α/2 * σ) / d ]²**
- **[EN]** Always round the resulting value UP to the nearest integer.
- **[KO]** 계산된 n값 소수점 이하는 항상 올림하여 정수로 결정합니다.

## [Slide 52] Ch08: Sample Size LogiHub Example / 표본 크기 LogiHub 적용 예시
- **[EN]** We want to estimate average delivery time within d = 0.5 hours with 95% confidence. Historically, σ = 3 hours.
- **[KO]** 95% 신뢰수준에서 평균 배송 시간을 오차 한계 d = 0.5시간 이내로 추정하고자 합니다. 과거 데이터에 따르면 σ = 3시간입니다.
- **[EN]** Calculation:
  - n = [ (1.96 * 3) / 0.5 ]² = [ 5.88 / 0.5 ]² = [ 11.76 ]² = 138.3 ➔ **139 shipments**
- **[KO]** 계산 과정:
  - n = [ (1.96 * 3) / 0.5 ]² = [ 5.88 / 0.5 ]² = [ 11.76 ]² = 138.3 ➔ **139건의 배송 조사 필요**

## [Slide 53] Ch08: One-Sided Confidence Bounds (σ Known) / 단측 신뢰 한계 (σ를 아는 경우)
- **[EN]** Sometimes we only care about the worst-case scenario (e.g., maximum cost limit or minimum shipping time).
- **[KO]** 때로는 최악의 시나리오만 관리하면 됩니다 (예: 최대 비용 한계선 또는 최소 운송 시간 보장).
- **[EN]** **Upper Confidence Bound:** μ ≤ x̄ + z_α * (σ / √n)
- **[KO]** **신뢰상한:** μ ≤ x̄ + z_α * (σ / √n)
- **[EN]** Note we use **z_α** instead of z_α/2.
- **[KO]** 단측 한계이므로 z_α/2 대신 **z_α**를 사용합니다.

## [Slide 54] Ch08: CI for Mean, σ Unknown / 모평균의 신뢰구간 (σ를 모를 때)
- **[EN]** In real-world logistics, we rarely know the true population standard deviation σ.
- **[KO]** 실제 실무 현장에서는 모집단 표준편차 σ를 알고 있는 경우가 극히 드뭅니다.
- **[EN]** Solution: Replace σ with sample standard deviation `s`, and replace standard normal distribution `Z` with Student's **t-distribution**.
- **[KO]** 해결책: σ 대신 표본 표준편차 `s`를 사용하고, 표준 정규 분포 `Z` 대신 **t-분포**를 사용합니다.

## [Slide 55] Ch08: Student's t-Distribution / 학생의 t-분포
- **[EN]** Developed by William Gosset (under the pen name "Student").
- **[KO]** 윌리엄 고셋이 필명 "Student"로 발표한 분포입니다.
- **[EN]** **Properties:**
  - Symmetric and bell-shaped, but has **heavier tails** than the normal distribution (capturing the extra uncertainty of estimating σ with s).
- **[KO]** **특징:**
  - 대칭형 종 모양이지만 정규 분포보다 **꼬리가 더 두껍습니다** (s로 σ를 추정하면서 발생하는 추가적인 불확실성을 반영하기 때문).

## [Slide 56] Ch08: Degrees of Freedom (df) / 자유도
- **[EN]** t-distribution is completely defined by its Degrees of Freedom: **df = n - 1**
- **[KO]** t-분포는 오직 하나의 매개변수인 자유도에 의해 모양이 결정됩니다: **자유도 (df) = n - 1**
- **[EN]** As n increases, t-distribution converges to the Standard Normal (Z) distribution.
- **[KO]** 표본 크기 n이 커질수록 t-분포는 표준 정규 분포(Z)에 한없이 수렴합니다.

## [Slide 57] Ch08: CI for Mean, σ Unknown Formula / 모평균 신뢰구간 (σ를 모를 때) 공식
- **[EN]** **Formula:**
  **x̄ ± t_(α/2, n-1) * (s / √n)**
- **[KO]** **공식:**
  **x̄ ± t_(α/2, n-1) * (s / √n)**
- **[EN]** Assumptions: Population is approximately normally distributed. (Critical for small samples, n < 30).
- **[KO]** 가정 사항: 모집단이 근사적으로 정규 분포를 따라야 합니다. (표본 크기 n < 30인 경우 필수).

## [Slide 58] Ch08: CI for Mean, σ Unknown (LogiHub Example) / 모평균 신뢰구간 (LogiHub 실전 t-분포 적용)
- **[EN]** Sample of n = 15 warehouses.
  - Sample mean x̄ = 72 hours to clear cargo.
  - Sample standard deviation s = 8 hours.
  - Compute a 95% Confidence Interval.
- **[KO]** n = 15개 창고 샘플 조사.
  - 표본 평균 x̄ = 화물 통관 소요 시간 72시간.
  - 표본 표준편차 s = 8시간.
  - 95% 신뢰구간을 구하시오.
- **[EN]** df = 14. From t-table, t_0.025,14 = 2.145.
- **[KO]** 자유도 df = 14. t-분포표에서 t_0.025,14 = 2.145.

## [Slide 59] Ch08: t-Distribution Calculation / t-분포 계산 완료
- **[EN]** Calculation:
  - 72 ± 2.145 * (8 / √15)
  - 72 ± 2.145 * 2.065
  - 72 ± 4.43 ➔ **(67.57 hours, 76.43 hours)**
- **[KO]** 계산 과정:
  - 72 ± 2.145 * (8 / √15)
  - 72 ± 2.145 * 2.065
  - 72 ± 4.43 ➔ **(67.57시간, 76.43시간)**
- **[EN]** We are 95% confident that the true average clearance time is within this interval.
- **[KO]** 실제 평균 통관 소요 시간이 이 범위 내에 있을 것이라고 95% 확신합니다.

## [Slide 60] Ch08: Inference on Population Proportion / 모비율의 통계적 추론
- **[EN]** When measuring binary outcomes (e.g., Delivery: Success/Delayed, Hub: Large/Small).
- **[KO]** 이분법적인 결과를 측정할 때 (예: 배송: 성공/지연, 허브 크기: 대형/소형).
- **[EN]** **Sample Proportion (p̂) = x / n**
- **[KO]** **표본 비율 (p̂) = x / n**
- **[EN]** For large n, p̂ is approximately normal:
  **p̂ ~ N( p, p(1-p)/n )**
- **[KO]** 표본이 클 때, p̂는 근사적으로 정규 분포를 따릅니다:
  **p̂ ~ N( p, p(1-p)/n )**

## [Slide 61] Ch08: CI for Population Proportion / 모비율 신뢰구간 공식
- **[EN]** **Formula:**
  **p̂ ± z_α/2 * √ [ p̂(1-p̂) / n ]**
- **[KO]** **공식:**
  **p̂ ± z_α/2 * √ [ p̂(1-p̂) / n ]**
- **[EN]** **LogiHub SLA Example:** Out of n = 400 deliveries, 320 arrived on time (p̂ = 320/400 = 0.80).
  - 95% CI: 0.80 ± 1.96 * √ [ 0.80 * 0.20 / 400 ] = 0.80 ± 1.96 * 0.02 = 0.80 ± 0.039 ➔ **(76.1%, 83.9%)**
- **[KO]** **LogiHub SLA 실전 적용:** n = 400건 중 320건 정시 도착 (p̂ = 320/400 = 0.80).
  - 95% 신뢰구간: 0.80 ± 1.96 * √ [ 0.80 * 0.20 / 400 ] = 0.80 ± 1.96 * 0.02 = 0.80 ± 0.039 ➔ **(76.1%, 83.9%)**

## [Slide 62] Ch08: Inference on Variance (Chi-Square) / 모분산에 대한 통계적 추론
- **[EN]** To quantify volatility, we build a CI for variance (σ²) using the **Chi-Square (χ²)** distribution with df = n - 1.
- **[KO]** 배송 지연의 변동성을 평가하기 위해, 자유도가 df = n - 1인 **카이제곱 (χ²)** 분포를 사용하여 모분산(σ²)의 신뢰구간을 구합니다.
- **[EN]** **Formula:**
  **[ (n-1)s² / χ²_(α/2, n-1) ] ≤ σ² ≤ [ (n-1)s² / χ²_(1-α/2, n-1) ]**
- **[KO]** **공식:**
  **[ (n-1)s² / χ²_(α/2, n-1) ] ≤ σ² ≤ [ (n-1)s² / χ²_(1-α/2, n-1) ]**

## [Slide 63] Ch08: Prediction Interval (PI) / 예측 구간
- **[EN]** Predicts a single **future** observation (xn+1). It is wider than the confidence interval of the mean because it accounts for both population variance and estimation error.
- **[KO]** 향후 발생할 **단일** 관측치(xn+1)를 예측합니다. 모평균 추정 오차뿐만 아니라 개별 개체의 변동성까지 반영하므로 평균의 신뢰구간보다 항상 더 넓습니다.
- **[EN]** **Formula (σ unknown):**
  **x̄ ± t_(α/2, n-1) * s * √ [ 1 + 1/n ]**
- **[KO]** **공식 (σ를 모를 때):**
  **x̄ ± t_(α/2, n-1) * s * √ [ 1 + 1/n ]**

## [Slide 64] Ch08: Tolerance Intervals / 허용 구간
- **[EN]** An interval that contains a specified proportion (e.g., 99%) of the population with a specified confidence level (e.g., 95%).
- **[KO]** 정해진 신뢰 수준(예: 95%) 하에서 모집단의 특정 비율(예: 99%)을 포함하는 구간입니다.
- **[EN]** Essential for robust logistics testing to ensure 99% of customers experience acceptable delivery windows.
- **[KO]** 99%의 고객이 안심하고 이용할 수 있는 안정적인 배송 시간대를 보장하기 위한 물류 내구성 설계의 필수 기법입니다.

## [Slide 65] Ch08 Course Summary / Ch08 및 전체 강의 요약
- **[EN]**
  - **Ch 06:** Summarized and visualized raw data (Mean, Outliers, Shapes).
  - **Ch 07:** Understood point estimators (unbiasedness, MLE) and CLT.
  - **Ch 08:** Built Confidence, Prediction, and Tolerance intervals to quantify logistics risks.
- **[KO]**
  - **6장:** 정제되지 않은 기초 데이터를 요약 및 시각화했습니다 (평균, 이상치 탐지, 형태).
  - **7장:** 점 추정량의 정밀성(불편성, MLE)과 중심극한정리(CLT)의 원리를 배웠습니다.
  - **8장:** 물류 리스크 관리를 위한 신뢰 구간, 예측 구간, 허용 구간 설계법을 완벽히 정복했습니다.
