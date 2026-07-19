import numpy as np
import pandas as pd
from app.core.config import settings

def calculate_metrics(equity_df: pd.DataFrame, trades: int, wins: int) -> dict:
    """
    Calculates quantitative performance metrics for a backtest equity curve.
    """
    if len(equity_df) < 2:
        return {
            "totalReturn": 0.0,
            "cagr": 0.0,
            "maxDrawdown": 0.0,
            "sharpeRatio": 0.0,
            "sortinoRatio": 0.0,
            "calmarRatio": 0.0,
            "winRate": 0.0,
            "totalTrades": 0
        }
        
    start_equity = equity_df['value'].iloc[0]
    end_equity = equity_df['value'].iloc[-1]
    
    total_return = ((end_equity - start_equity) / start_equity) * 100
    
    days = (equity_df['time'].iloc[-1] - equity_df['time'].iloc[0]).days
    years = days / 365.25 if days > 0 else 1
    
    cagr = ((end_equity / start_equity) ** (1/years) - 1) * 100 if years > 0 and end_equity > 0 else 0
    
    # Drawdown
    roll_max = equity_df['value'].cummax()
    drawdown = (roll_max - equity_df['value']) / roll_max
    max_dd = drawdown.max() * 100
    
    # Daily Returns
    equity_df['return'] = equity_df['value'].pct_change()
    avg_daily = equity_df['return'].mean()
    std_dev = equity_df['return'].std()
    
    # Sharpe Ratio
    # Risk-free rate is annual, convert to daily for adjustment
    daily_rf = settings.RISK_FREE_RATE / 252
    excess_return = equity_df['return'] - daily_rf
    avg_excess = excess_return.mean()
    sharpe = (avg_excess / std_dev * np.sqrt(252)) if std_dev > 0 else 0
    
    # Sortino Ratio
    neg_returns = excess_return[excess_return < 0]
    downside_std = np.sqrt((neg_returns**2).mean()) if len(neg_returns) > 0 else 0
    sortino = (avg_excess / downside_std * np.sqrt(252)) if downside_std > 0 else 0
    
    # Calmar Ratio
    calmar = (cagr / max_dd) if max_dd > 0 else 0
    
    win_rate = (wins / trades * 100) if trades > 0 else 0
    
    return {
        "totalReturn": round(total_return, 2),
        "cagr": round(cagr, 2),
        "maxDrawdown": round(max_dd, 2),
        "sharpeRatio": round(sharpe, 2),
        "sortinoRatio": round(sortino, 2),
        "calmarRatio": round(calmar, 2),
        "winRate": round(win_rate, 2),
        "totalTrades": trades
    }
