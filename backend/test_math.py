from app.services.engine import run_backtest_engine
import pandas as pd

code = """
BUY = smaShort > smaLong
SELL = smaShort < smaLong and smaShort > 0
"""

df = pd.DataFrame({
    "close": [100.0, 101.0, 102.0],
    "time": pd.to_datetime(["2023-01-01", "2023-01-02", "2023-01-03"]),
    "smaShort": [1.0, 2.0, 1.0],
    "smaLong": [2.0, 1.0, 2.0]
})

try:
    print("Running engine with Math parser...")
    res_df, logs, metrics = run_backtest_engine(df, code, "Math")
    print("Success!", len(res_df))
    print(res_df[['smaShort', 'smaLong', 'signal', 'position', 'BUY', 'SELL']])
except Exception as e:
    import traceback
    traceback.print_exc()
    print("Error:", e)
