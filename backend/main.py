from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BacktestRequest(BaseModel):
    ticker: str
    startDate: str
    endDate: str
    alphaCode: str
    alphaType: str

@app.post("/api/backtest/run")
def run_backtest(req: BacktestRequest):
    # Generate mock daily data
    start = datetime.datetime.strptime(req.startDate, "%Y-%m-%d")
    end = datetime.datetime.strptime(req.endDate, "%Y-%m-%d")
    days = (end - start).days
    
    data_rows = []
    current_price = 110.0
    
    for i in range(days + 1):
        d = start + datetime.timedelta(days=i)
        if d.weekday() >= 5: continue
        
        # Sine wave volatility to ensure crossovers
        wave = np.sin(i / 5.0) * 10
        change = (np.random.random() - 0.5) * 8 + (wave if i % 20 == 0 else 0)
        
        open_price = current_price
        current_price += change
        close_price = current_price
        
        data_rows.append({
            "time": d.strftime("%Y-%m-%d"),
            "open": open_price,
            "close": close_price,
            "high": max(open_price, close_price) + np.random.random() * 2,
            "low": min(open_price, close_price) - np.random.random() * 2,
            "volume": 50000000 + np.random.random() * 100000000
        })

    df = pd.DataFrame(data_rows)
    
    df['smaShort'] = df['close'].rolling(window=20).mean().fillna(0)
    df['smaLong'] = df['close'].rolling(window=50).mean().fillna(0)
    
    # Simulation Logic
    logs = []
    equity_curve = []
    current_equity = 100000.0
    position = 0
    buy_price = 0.0
    trades = 0
    wins = 0
    max_equity = current_equity
    max_dd = 0.0
    
    def evaluate_alpha(data):
        if req.alphaType == 'Python':
            local_env = {"data": data}
            try:
                exec(req.alphaCode, globals(), local_env)
                if 'alpha' in local_env:
                    return local_env['alpha'](data)
                return "HOLD"
            except Exception as e:
                print(f"Alpha Exec Error: {e}")
                return "HOLD"
        else:
            try:
                return eval(req.alphaCode, {"data": data})
            except:
                if data['smaShort'] > data['smaLong'] and data['position'] == 0:
                    return "BUY"
                elif data['smaShort'] < data['smaLong'] and data['position'] == 1:
                    return "SELL"
                return "HOLD"

    valid_start = 50
    for i in range(valid_start, len(df)):
        row = df.iloc[i]
        prev_row = df.iloc[i-1]
        
        data_state = {
            "price": row['close'],
            "smaShort": row['smaShort'],
            "smaLong": row['smaLong'],
            "prevShort": prev_row['smaShort'],
            "prevLong": prev_row['smaLong'],
            "position": position
        }
        
        signal = evaluate_alpha(data_state)
        if signal not in ["BUY", "SELL", "HOLD"]:
            signal = "HOLD"
            
        action = "Position held"
        pnl = 0.0
        
        if signal == "BUY" and position == 0:
            position = 1
            buy_price = row['close']
            action = f"BUY SIGNAL @ {row['close']:.2f}"
            trades += 1
        elif signal == "SELL" and position == 1:
            position = 0
            trade_pnl = (row['close'] - buy_price) / buy_price
            if trade_pnl > 0: wins += 1
            current_equity *= (1 + trade_pnl)
            action = f"SELL SIGNAL @ {row['close']:.2f} | PnL: {(trade_pnl * 100):.2f}%"
            trades += 1
            
        if position == 1:
            pnl = (row['close'] - buy_price) / buy_price
            
        current_port_value = current_equity * (1 + pnl) if position == 1 else current_equity
        max_equity = max(max_equity, current_port_value)
        dd = (max_equity - current_port_value) / max_equity
        max_dd = max(max_dd, dd)
        
        equity_curve.append({"time": row['time'], "value": current_port_value})
        logs.append({
            "time": row['time'],
            "price": row['close'],
            "smaShort": row['smaShort'],
            "smaLong": row['smaLong'],
            "signal": signal,
            "pnl": pnl * 100,
            "action": action
        })
        
    total_return = ((current_equity - 100000) / 100000) * 100
    
    if len(equity_curve) > 1:
        equity_df = pd.DataFrame(equity_curve)
        equity_df['return'] = equity_df['value'].pct_change()
        avg_daily = equity_df['return'].mean()
        std_dev = equity_df['return'].std()
        neg_returns = equity_df[equity_df['return'] < 0]['return']
        downside_std = np.sqrt((neg_returns**2).mean()) if len(neg_returns) > 0 else 0
        sharpe = (avg_daily / std_dev * np.sqrt(252)) if std_dev > 0 else 0
        sortino = (avg_daily / downside_std * np.sqrt(252)) if downside_std > 0 else 0
    else:
        sharpe = sortino = 0

    years = days / 365.25 if days > 0 else 1
    cagr = ((current_equity / 100000) ** (1/years) - 1) * 100 if years > 0 else 0
    calmar = (cagr / 100) / max_dd if max_dd > 0 else 0
    win_rate = (wins / (trades / 2) * 100) if trades > 0 else 0

    candles = df[['time', 'open', 'high', 'low', 'close', 'volume']].to_dict(orient='records')
    sma_short = df[['time', 'smaShort']].rename(columns={'smaShort': 'value'}).to_dict(orient='records')
    sma_long = df[['time', 'smaLong']].rename(columns={'smaLong': 'value'}).to_dict(orient='records')

    return {
        "candles": candles,
        "smaShort": sma_short,
        "smaLong": sma_long,
        "equity": equity_curve,
        "logs": logs,
        "metrics": {
            "totalReturn": round(total_return, 2),
            "cagr": round(cagr, 2),
            "maxDrawdown": round(max_dd * 100, 2),
            "sharpeRatio": round(sharpe, 2),
            "sortinoRatio": round(sortino, 2),
            "calmarRatio": round(calmar, 2),
            "winRate": round(win_rate, 2),
            "totalTrades": trades
        }
    }
