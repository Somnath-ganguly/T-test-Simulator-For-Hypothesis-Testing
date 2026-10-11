# Interactive T-Test Simulator

A full-stack statistical analysis application and visual simulator for hypothesis testing, powered by **FastAPI**, **SciPy**, **React.js**, **Vite**, **Tailwind CSS**, and **Recharts**.

---

## 🌟 Architecture Overview

```text
ttest-simulator/
├── frontend/             # React.js + Vite + Tailwind CSS + Recharts
│   ├── src/
│   │   ├── components/   # UI Sidebar, Form, Results, Distribution & BoxPlot Charts
│   │   ├── services/     # Axios REST client (api.js)
│   │   ├── App.jsx       # Main Dashboard orchestrator
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/              # Python FastAPI REST API
│   ├── app/
│   │   ├── main.py       # FastAPI app & CORS middleware
│   │   ├── api/          # Route handlers (/health, /generate-data, /ttest, /upload-csv)
│   │   ├── schemas/      # Pydantic V2 validation schemas
│   │   └── services/     # Statistical engine (statistics.py, data_generator.py, interpretation.py)
│   ├── tests/            # Pytest test suite validating against SciPy benchmarks
│   └── requirements.txt
├── sample_data/          # Example datasets (exam scores, drug trial, weight loss)
└── README.md
```

### 📡 API Contracts

#### 1. `GET /api/health`
- **Response:** `{"status": "ok", "version": "1.0.0"}`

#### 2. `POST /api/generate-data`
- **Request Body:**
  ```json
  {
    "test_type": "independent",
    "n_a": 30,
    "mean_a": 100.0,
    "std_a": 15.0,
    "n_b": 30,
    "mean_b": 108.0,
    "std_b": 14.0,
    "distribution": "normal",
    "seed": 42
  }
  ```
- **Response:** `sample_a` array, `sample_b` array, seed, and descriptive summaries.

#### 3. `POST /api/ttest`
- **Request Body:**
  ```json
  {
    "test_type": "independent",
    "alternative": "two-sided",
    "alpha": 0.05,
    "mu_0": 0.0,
    "equal_var": false,
    "sample_a": [10.2, 11.5, 9.8, 10.5, 11.0],
    "sample_b": [8.5, 9.2, 8.8, 9.5, 10.0],
    "label_a": "Placebo",
    "label_b": "Treatment"
  }
  ```
- **Response:** `t_statistic`, `p_value`, `df`, `diff_mean`, `std_err`, `ci_lower`, `ci_upper`, `cohens_d`, `effect_size_label`, `decision`, `is_significant`, `normality_p_a`, `levene_p`, `interpretation`, `distribution_curve`, `histograms`.

#### 4. `POST /api/upload-csv`
- **Form Data:** `file` (.csv)
- **Response:** Extracted numeric columns and sample observations.

#### 5. `GET /api/docs`
- Interactive OpenAPI / Swagger Documentation provided automatically by FastAPI.

---

## 🚀 Execution & Setup Guide (Windows PowerShell)

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### Terminal 1: Launch Backend (FastAPI Server)

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\Activate.ps1

# Upgrade pip & install backend dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Run pytest unit test suite to verify math
pytest

# Launch FastAPI development server
uvicorn app.main:app --reload --port 8000
```
*Backend API will run at `http://127.0.0.1:8000` (Swagger Docs at `http://127.0.0.1:8000/api/docs`).*

---

### Terminal 2: Launch Frontend (React + Vite App)

```powershell
# Navigate to frontend folder
cd frontend

# Install Node dependencies
cmd /c npm install

# Run Vitest component test suite
cmd /c npm test

# Launch Vite development server
cmd /c npm run dev
```
*Frontend application will run at `http://localhost:5173`.*

---

## 📐 Formulas & Statistical Principles

1. **One-Sample t-Test:**
   $$t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}, \quad \text{df} = n - 1$$

2. **Welch's Independent Two-Sample t-Test (Unequal Variances):**
   $$t = \frac{(\bar{x}_1 - \bar{x}_2) - \Delta_0}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}$$
   $$\text{df} = \frac{\left(\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}\right)^2}{\frac{(s_1^2/n_1)^2}{n_1-1} + \frac{(s_2^2/n_2)^2}{n_2-1}}$$

3. **Student's Independent Two-Sample t-Test (Pooled Variance):**
   $$s_p^2 = \frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1+n_2-2}, \quad t = \frac{(\bar{x}_1 - \bar{x}_2) - \Delta_0}{\sqrt{s_p^2 \left(\frac{1}{n_1} + \frac{1}{n_2}\right)}}, \quad \text{df} = n_1 + n_2 - 2$$

4. **Paired Samples t-Test:**
   $$t = \frac{\bar{d} - \Delta_0}{s_d / \sqrt{n}}, \quad \text{df} = n - 1$$

5. **Cohen's d Effect Size:**
   $$d = \frac{\bar{x}_1 - \bar{x}_2}{s_{\text{pooled}}}$$
   - $|d| < 0.2$: Negligible
   - $0.2 \le |d| < 0.5$: Small
   - $0.5 \le |d| < 0.8$: Medium
   - $|d| \ge 0.8$: Large

---

## 🔍 Assumptions & Limitations
- **Normality:** Shapiro-Wilk test is performed on samples ($n < 5000$). Departure from normality triggers a diagnostic badge, but does not block computation (central limit theorem applies for $N \ge 30$).
- **Variance Equality:** Levene's test checks variance equality for independent groups. Welch's t-test is used by default as standard best practice.
- **Zero Variance:** Constant samples (all identical values) raise informative 400 validation errors.
