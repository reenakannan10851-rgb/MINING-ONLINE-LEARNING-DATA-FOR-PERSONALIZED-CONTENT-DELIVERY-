# Mining Online Learning Data for Personalized Content Delivery – OULAD Analytics

An industry-standard, end-to-end Learning Analytics and Personalized Adaptive Educational Delivery platform built on the **Open University Learning Analytics Dataset (OULAD)** (Kuzilek et al., 2017). Designed for academic research, university course management, and third-year B.Tech Information Technology capstone project demonstration.

---

## 1. Project Overview & Workflow

The platform implements the complete data science lifecycle without synthetic or hardcoded shortcuts:

```
DATA COLLECTION (OULAD CSVs)
       ↓
DATA PREPROCESSING & IMPUTATION (Module 2)
       ↓
EXPLORATORY DATA ANALYSIS (EDA) & FEATURE ENGINEERING (Module 3)
       ↓
K-MEANS CLUSTERING & BEHAVIORAL COHORT PROFILING
       ↓
PREDICTIVE MODEL BUILDING (Random Forest, Decision Tree, Logistic Regression)
       ↓
MODEL EVALUATION & BENCHMARKING (Module 5: F1, Confusion Matrix, Comparisons)
       ↓
PERSONALIZED CONTENT RECOMMENDATION & ADAPTIVE PATHWAYS (Module 6)
       ↓
EARLY WARNING SYSTEM & STUDENT PERFORMANCE MONITORING (Extensions)
```

---

## 2. System Architecture & Tech Stack

- **Frontend & UI Layer:** React 19, TypeScript 5.8, Tailwind CSS, Recharts for responsive SVG visualizations.
- **Analytics & Preprocessing Engine:** Client-side in-memory tabular processing pipeline with streaming RFC-4180 CSV parsing (`services/csvParser.ts` and `services/ouladPreprocessor.ts`).
- **Machine Learning & Evaluation Engine:** Native algorithm suite (`services/mlEngine.ts`):
  - **Random Forest Classifier:** Bagging ensemble over randomized feature subspaces with majority voting and probability estimation.
  - **Decision Tree Classifier:** Recursive partitioning via information gain / entropy.
  - **Logistic Regression Classifier:** Gradient descent with sigmoid logit optimization on normalized features.
  - **K-Means Clustering:** Lloyd’s iterative algorithm with z-score normalization and PCA 2D variance projection.
- **Build Tool:** Vite 6.2 with strict TypeScript verification.

---

## 3. Supported OULAD Datasets

The platform accepts official OULAD CSV files:
1. `studentInfo.csv` *(Core/Required)* – Student demographic indicators, credits, and final results (Pass, Distinction, Fail, Withdrawn).
2. `studentVle.csv` *(Optional/Activity)* – Virtual Learning Environment click logs (`sum_click`).
3. `studentAssessment.csv` *(Optional/Academic)* – Individual assessment scores and submission timelines.
4. `courses.csv` – Module presentations and duration in days.
5. `assessments.csv` – Assessment metadata, weights, and assessment types (TMA, CMA, Exam).
6. `studentRegistration.csv` – Registration and unregistration relative day offsets.
7. `vle.csv` – Learning resource metadata.

> **Note:** The application maintains operations even with partial file uploads by dynamically adapting feature extraction and using verified authentic baseline distributions.

---

## 4. Key Modules & Implemented Features

### Module 1: Data Collection
- Multi-dataset CSV file uploader with strict filename and extension validation.
- Real-time dataset inventory matrix showing file sizes, record counts, and loaded status.
- Single-click KaggleHub / Repository baseline data fetch.
- Live dataset preview with first 100 rows and export capabilities.

### Module 2: Data Preprocessing (Newly Implemented)
- **Missing Value Audit:** Automated before-and-after audit with counts and percentages.
- **Duplicate Detection:** Prunes composite key duplicates (`id_student`, `code_module`, `code_presentation`).
- **Domain-Specific Imputation:**
  - Preserves domain meaning for unrecorded socio-economic deprivation (`imd_band` as `"Missing / Unknown"`).
  - Mode imputation for empty qualifications.
  - Aggregate imputation for non-participating students (`0` clicks, `0` assessment score).
- **Audit Report:** Original record count vs. cleaned record count, duplicate records removed, and engineered features tally.

### Module 3: Exploratory Data Analysis & Clustering
- Demographic breakdowns by Age Band, Gender, and Education Level.
- Interaction analysis: Average VLE Clicks by Qualification Level.
- Scatter Plot: Total Clicks vs. Average Score with tooltip inspection.
- Pearson Correlation Heatmap across engineered features.
- Performance and engagement pie and bar distribution charts.
- **K-Means Clustering:** Configurable cluster count ($k=2$ to $6$), normalized centroids, PCA 2D projections, and domain cohort profiles.

### Module 4: Predictive Model Building
- 70/30 reproducible train/test split.
- Target variable: Student performance classification (`Pass`/`Distinction` vs `Fail`/`Withdrawn`).
- Explainable individual student inference with risk categorization (`High`, `Medium`, `Low`).

### Module 5: Model Evaluation & Comparison (Newly Implemented)
- Complete evaluation metrics: Test Accuracy, Precision, Recall (Sensitivity), and F1-Score.
- $2 \times 2$ Confusion Matrix heatmap with True Positives, True Negatives, False Positives, and False Negatives.
- Feature Importance ranking chart identifying key predictors (VLE clicks, assessment scores, credits).
- Multi-model comparative benchmark table comparing Random Forest, Decision Tree, and Logistic Regression with training latencies and best-model tagging.

### Module 6: Personalized Content Recommendation & Extensions
- Tailored instructional advice based on risk level and engagement tier.
- Resource tiers:
  - **High Risk:** Foundational Tutorials & Remedial Review.
  - **Moderate Risk:** Intermediate Practice Exercises & Collaborative Discussion Forums.
  - **Low Risk / High Achiever:** Advanced Research Readings & Capstone Projects.
- **Adaptive Learning Pathways:** 4-milestone progressive learning sequence.
- **Early Warning System:** Proactive identification of at-risk students with specific warning indicators and targeted intervention suggestions.
- **Export All as CSV:** Comprehensive batch export of all students with recommendations and pathways.

---

## 5. Installation & Execution Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Step 3: Production Build
```bash
npm run build
```

---

## 6. Demonstration Workflow for Evaluators

1. **Data Tab:**
   - Review the preloaded benchmark OULAD dataset.
   - Inspect the **Data Preprocessing & Cleaning Pipeline (Module 2)** summary report and missing-value before/after audit.
   - Upload custom OULAD CSV files or click "Fetch OULAD via KaggleHub / Repository".
2. **EDA Tab:**
   - Observe age distribution, clicks by education, and total clicks vs. score scatter plot.
   - Inspect the correlation matrix and outcome breakdown.
3. **Modeling Tab:**
   - Click **Train & Evaluate All Models**.
   - Review Test Accuracy, Precision, Recall, and F1-Score.
   - Inspect the **Model Evaluation & Comparative Benchmark (Module 5)** table and chart.
   - Enter student ID `28400` or `30268` and click **Run Prediction** to view the explainable risk report.
4. **Clustering Tab:**
   - Set $k=3$ and click **Run Clustering**.
   - Review cluster sizes, centroids, cohort profiles, and the PCA scatter plot.
5. **Recommendations Tab:**
   - Review the executive KPI summary bar.
   - Inspect personalized recommendations, diagnostic rationale, and 4-step adaptive learning pathway for student `28400`.
   - Inspect the **Early Warning System** table of students requiring proactive intervention.
   - Click **Export All as CSV** to download the batch recommendation report.

---

## 7. Citation
> Kuzilek, J., Hlosta, M., & Zdráhal, Z. (2017). Open University Learning Analytics Dataset. *Scientific Data*, 4, 170171. https://doi.org/10.1038/sdata.2017.171
