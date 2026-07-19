from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

print("Starting backtest request...")
payload = {
    "ticker": "SPY",
    "startDate": "2023-01-01",
    "endDate": "2024-01-01",
    "alphaCode": "def alpha(data):\n    data['signal'] = 'HOLD'\n    return data['signal']",
    "alphaType": "Python"
}

try:
    with client.stream("POST", "/api/backtest/run", json=payload) as response:
        print(f"Status code: {response.status_code}")
        for line in response.iter_lines():
            if line:
                print(f"Received chunk: {line[:100]}...")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Test failed: {e}")
