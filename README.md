# 📈 Quant: Algorithmic Backtesting & Market Analytics Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TradingView Charts](https://img.shields.io/badge/Charts-TradingView%20Lightweight-131722?style=flat)](https://www.tradingview.com/lightweight-charts/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance quantitative trading terminal and backtesting suite designed for quantitative researchers, algorithmic traders, and financial engineers. **Quant** combines an asynchronous Python/FastAPI calculation engine with a reactive, dockable React/TypeScript workspace featuring in-browser strategy scripting and real-time financial charting.

---

## ⚡ Key Features

- **📊 High-Performance Charting:** Integrated with **TradingView Lightweight Charts** for smooth, zero-latency candlestick charts, technical indicators, and strategy overlay rendering.
- **💻 In-Browser Strategy Editor:** Powered by **Monaco Editor** (the engine behind VS Code) for writing, inspecting, and modifying quantitative strategies with syntax highlighting.
- **⚙️ Algorithmic Backtesting Engine:** Evaluates custom trading strategies across historical market periods with vectorized metrics (Sharpe ratio, max drawdown, win rate, CAGR).
- **📡 Real-Time Data Streaming:** Server-Sent Events (SSE) stream backtest execution progress and market telemetry from the FastAPI backend to the client.
- **⚡ Caching & Persistence:** Ultra-fast market data retrieval using `yfinance` paired with columnar `PyArrow` serialization for instant offline playback.
- **🖥️ Bloomberg-Style Dockable UI:** Built with `react-resizable-panels` and Tailwind CSS for custom multi-window financial workspace layouts.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React + TypeScript UI                │
│  - Monaco Code Editor (Strategy Scripting)             │
│  - TradingView Lightweight Charts (Visualizations)     │
│  - Resizable Dock Panels & Real-Time Telemetry Stream  │
└───────────────────────────▲────────────────────────────┘
                            │ HTTP & Server-Sent Events (SSE)
┌───────────────────────────▼────────────────────────────┐
│                    FastAPI Backend                     │
│  - /api/backtest: Vectorized strategy simulation       │
│  - /api/data: Real-time & historical market feed       │
│  - /api/strategies: Strategy storage & evaluation      │
└───────────────────────────▲────────────────────────────┘
                            │
               ┌────────────┴────────────┐
               │                         │
      PyArrow Disk Cache         yfinance Data Engine
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS, `clsx`, `tailwind-merge`
- **Charting:** TradingView Lightweight Charts
- **Code Editor:** `@monaco-editor/react`
- **Window Management:** `react-resizable-panels`, `lucide-react`

### Backend
- **Framework:** FastAPI, Uvicorn
- **Quantitative & Data:** NumPy, Pandas, PyArrow, Pydantic
- **Market Data:** `yfinance`
- **Streaming:** `sse-starlette` (Server-Sent Events)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Clone the Repository
```bash
git clone https://github.com/darryll-git/Quant.git
cd Quant
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*API documentation will be accessible at: `http://localhost:8000/docs`*

### 3. Frontend Setup
In a new terminal:
```bash
# Return to root directory
cd Quant

npm install
npm run dev
```
*The interactive dashboard will be accessible at: `http://localhost:5173`*

---

## 🧪 Testing

Run backend tests for data fetching, execution engine, and statistical sandbox:
```bash
python test_fetch.py
python test_sse.py
python backend/test_math.py
python backend/test_engine.py
```

---

## 📄 License
This project is licensed under the MIT License.
