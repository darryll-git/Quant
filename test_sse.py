import requests
import json
import sys

payload = {
    "ticker": "SPY",
    "startDate": "2023-01-01",
    "endDate": "2024-01-01",
    "alphaCode": "def alpha(df): return df",
    "alphaType": "Python"
}

try:
    print("Sending POST request to http://localhost:8000/api/backtest/run")
    response = requests.post("http://localhost:8000/api/backtest/run", json=payload, stream=True)
    response.raise_for_status()
    print("Connection established. Reading stream...")
    for line in response.iter_lines():
        if line:
            print("Received:", line.decode("utf-8"))
except Exception as e:
    print("Error:", e)
    sys.exit(1)
