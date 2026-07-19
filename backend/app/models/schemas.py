from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class BacktestRequest(BaseModel):
    ticker: str
    startDate: str
    endDate: str
    alphaCode: str
    alphaType: Literal["Python", "Math"]

class OHLCVBar(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class SMAData(BaseModel):
    time: str
    value: float

class LogEntry(BaseModel):
    time: str
    price: float
    smaShort: float
    smaLong: float
    signal: Literal["BUY", "SELL", "HOLD"]
    pnl: float
    action: Optional[str] = None

class PerformanceMetrics(BaseModel):
    totalReturn: float
    cagr: float
    maxDrawdown: float
    sharpeRatio: float
    sortinoRatio: float
    calmarRatio: float
    winRate: float
    totalTrades: int

class EquityPoint(BaseModel):
    time: str
    value: float

class StreamEvent(BaseModel):
    progress: int
    logs: List[LogEntry] = []
    equity: List[EquityPoint] = []
    candles: List[OHLCVBar] = []
    smaShort: List[SMAData] = []
    smaLong: List[SMAData] = []
    metrics: Optional[PerformanceMetrics] = None
    error: Optional[str] = None

class SavedStrategy(BaseModel):
    name: str
    code: str
    type: str = "Python"
