import yfinance as yf
print("Starting fetch...")
yf_ticker = yf.Ticker("SPY")
df = yf_ticker.history(start="2023-01-01", end="2024-01-01")
print(f"Fetched {len(df)} rows.")
