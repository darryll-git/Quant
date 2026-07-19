from app.services.data_fetcher import DataFetcher
from app.services.engine import run_backtest_engine
import sys

try:
    print("Fetching data...")
    df = DataFetcher.get_historical_data("SPY", "2023-01-01", "2024-01-01")
    print(f"Data fetched! {len(df)} rows.")
    
    alpha_code = """def alpha(data):
    data["signal"] = "HOLD"
    data.loc[data["smaShort"] > data["smaLong"], "signal"] = "BUY"
    data.loc[data["smaShort"] < data["smaLong"], "signal"] = "SELL"
    return data["signal"]
"""
    print("Running engine...")
    res_df, all_logs, metrics = run_backtest_engine(df, alpha_code, "Python")
    print("Engine succeeded!")
except Exception as e:
    import traceback
    traceback.print_exc()
    sys.exit(1)
