# Smart Health Assistant - Python Backend

## 🐍 Python ML Backend API

This is the **Machine Learning backend** for the Smart Health Assistant, written in **Python** using **Flask** and **NumPy**.

### 📦 Files:

```
backend/
├── app.py                  # Flask REST API server
├── disease_predictor.py    # ML Disease Prediction Model
├── health_analyzer.py      # Statistical Health Analysis
└── requirements.txt        # Python dependencies
```

### 🧠 Python Features:

1. **Machine Learning Model** (`disease_predictor.py`)
   - Weighted scoring algorithm
   - Pattern recognition using regex
   - Disease classification system

2. **Statistical Analysis** (`health_analyzer.py`)
   - NumPy for numerical computations
   - Trend analysis and variance calculation
   - Health insights generation

3. **REST API** (`app.py`)
   - Flask web framework
   - JSON API endpoints
   - CORS enabled for React frontend

### 🚀 Installation:

```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt
```

### ▶️ Run Python Server:

```bash
python app.py
```

Server runs on: **http://localhost:5000**

### 📡 API Endpoints:

- `GET /api/health` - Health check
- `POST /api/analyze-symptoms` - Predict diseases from symptoms
- `POST /api/health-insights` - Analyze health trends

### 🔬 Algorithms Used:

1. **Weighted Scoring Algorithm** - For severity calculation
2. **Pattern Matching** - Regex-based symptom detection
3. **Statistical Analysis** - NumPy mean, variance, trends
4. **Classification** - Rule-based disease prediction
