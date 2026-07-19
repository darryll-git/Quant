from app.services.data_fetcher import DataFetcher
import sys

try:
    print("Fetching data...")
    df = DataFetcher.get_historical_data("SPY", "2023-01-01", "2024-01-01")
    print(f"Success! {len(df)} rows.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
