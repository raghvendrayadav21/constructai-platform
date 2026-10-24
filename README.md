# ConstructAI — AI-Powered Multimodal Construction Intelligence Platform

A full-stack AI decision-support system for construction professionals.  
Powered by **Google Gemini** · **FastAPI** · **React + Vite**

---

## 🏗️ Features

| Module | Description |
|--------|-------------|
| 🦺 **Safety Monitoring** | Image/text-based AI hazard detection, PPE compliance, risk scoring |
| 🔍 **Crack Detection** | Structural crack analysis with severity, repair costs, urgency levels |
| 🏠 **Real Estate Valuation** | Market-based property valuation, rental yield, investment outlook |
| 📋 **Project Planning** | Full project plan, phase timeline, risk register, cost estimation |
| 💬 **Site Assistance** | AI chat (ConstructAI), automated daily site report generation |
| ⛅ **Weather Advisory** | Real-time weather + construction activity-specific advisories |
| 📚 **Knowledge Hub** | IS code Q&A, drawing analysis, interactive knowledge quiz |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Google Gemini API Key ([get free key](https://aistudio.google.com/app/apikey))

### Step 1 — Configure API Keys
Open `backend/.env` and add your keys:
```
GEMINI_API_KEY=your_actual_gemini_api_key
WEATHER_API_KEY=your_openweathermap_key   # optional, for real weather data
```

### Step 2 — Start Backend
```bash
# Option A: Double-click start_backend.bat (Windows)

# Option B: Manual
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at: **http://localhost:8000**  
API Docs: **http://localhost:8000/docs**

### Step 3 — Start Frontend
```bash
# Option A: Double-click start_frontend.bat (Windows)

# Option B: Manual
cd frontend
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## 📁 Project Structure

```
project 1/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # API keys (edit this!)
│   ├── services/
│   │   └── gemini_service.py    # Gemini AI integration
│   └── routers/
│       ├── safety.py            # Safety monitoring endpoints
│       ├── crack_detection.py   # Crack detection endpoints
│       ├── valuation.py         # Property valuation endpoints
│       ├── planning.py          # Project planning endpoints
│       ├── site_assistance.py   # Chat & daily report endpoints
│       ├── weather.py           # Weather advisory endpoints
│       └── knowledge.py         # Knowledge Q&A endpoints
│
├── frontend/
│   └── src/
│       ├── api/client.js        # Axios API client
│       ├── hooks/useApi.js      # Custom React hooks
│       ├── components/          # Shared UI components
│       │   ├── Sidebar.jsx
│       │   ├── ImageUpload.jsx
│       │   └── UI.jsx
│       ├── pages/               # Feature pages
│       │   ├── Dashboard.jsx
│       │   ├── SafetyMonitoring.jsx
│       │   ├── CrackDetection.jsx
│       │   ├── RealEstateValuation.jsx
│       │   ├── ProjectPlanning.jsx
│       │   ├── SiteAssistance.jsx
│       │   ├── WeatherAdvisory.jsx
│       │   └── KnowledgeHub.jsx
│       ├── index.css            # Global design system
│       └── App.jsx              # Router & layout
│
├── start_backend.bat            # One-click backend start (Windows)
└── start_frontend.bat           # One-click frontend start (Windows)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router, Axios |
| Styling | Vanilla CSS (Premium Dark Mode) |
| Backend | FastAPI (Python 3.8+) |
| AI Engine | Google Gemini 1.5 Flash (multimodal) |
| Weather | OpenWeatherMap API |
| Libraries | Pillow, httpx, python-dotenv |

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/safety/analyze-image` | POST | Analyze site image for hazards |
| `/api/safety/analyze-text` | POST | Analyze site description |
| `/api/crack/analyze` | POST | Detect cracks in image |
| `/api/valuation/estimate` | POST | Estimate property value |
| `/api/valuation/analyze-property-image` | POST | Assess property from image |
| `/api/planning/generate-plan` | POST | Generate full project plan |
| `/api/planning/cost-estimate` | POST | Quick cost estimate |
| `/api/assistance/chat` | POST | AI site assistant chat |
| `/api/assistance/daily-report` | POST | Generate daily site report |
| `/api/weather/advisory` | POST | Weather + construction advisory |
| `/api/knowledge/ask` | POST | Construction Q&A |
| `/api/knowledge/analyze-drawing` | POST | Analyze construction drawing |
| `/api/knowledge/quiz` | POST | Generate knowledge quiz |

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Required | Google Gemini API key |
| `WEATHER_API_KEY` | ⚡ Optional | OpenWeatherMap key (demo data if missing) |
| `HOST` | Optional | Server host (default: 0.0.0.0) |
| `PORT` | Optional | Server port (default: 8000) |

---

*Built for educational and professional use · Powered by Google Gemini AI*
