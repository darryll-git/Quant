from app.services.engine import run_backtest_engine
import pandas as pd

code = """def alpha(data):
    data["signal"] = "HOLD"
    data.loc[data["smaShort"] > data["smaLong"], "signal"] = "BUY"
    data.loc[data["smaShort"] < data["smaLong"], "signal"] = "SELL"
    return data["signal"]
"""

df = pd.DataFrame({
    "close": [100.0, 101.0, 102.0],
    "time": pd.to_datetime(["2023-01-01", "2023-01-02", "2023-01-03"]),
    "smaShort": [1.0, 2.0, 1.0],
    "smaLong": [2.0, 1.0, 2.0]
})

try:
    print("Running engine with new vectorized code...")
    res_df, logs, metrics = run_backtest_engine(df, code, "Python")
    print("Success!", len(res_df))
except Exception as e:
    import traceback
    traceback.print_exc()
    print("Error:", e)
