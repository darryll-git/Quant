@echo off
echo Starting Quant Platform...

:: Start the FastAPI backend in a new window
echo Starting Backend...
start cmd /k "cd backend && uvicorn app.main:app --reload --reload-dir app"

:: Start the React/Vite frontend in a new window
echo Starting Frontend...
start cmd /k "npm run dev"

echo Both servers are starting up!
