export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SMAData {
  time: string;
  value: number;
}

export interface LogEntry {
  time: string;
  price: number;
  smaShort: number;
  smaLong: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  pnl: number;
  action?: string;
}

export interface BacktestResult {
  candles: CandleData[];
  smaShort: SMAData[];
  smaLong: SMAData[];
  equity: { time: string; value: number }[];
  logs: LogEntry[];
  metrics: {
    totalReturn: number;
    cagr: number;
    maxDrawdown: number;
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;
    winRate: number;
    totalTrades: number;
  };
}

export const runBacktestService = async (
  ticker: string, 
  startDate: string, 
  endDate: string,
  alphaCode: string,
  alphaType: string
): Promise<BacktestResult> => {
  const response = await fetch('/api/backtest/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ticker,
      startDate,
      endDate,
      alphaCode,
      alphaType
    })
  });

  if (!response.ok) {
    throw new Error('Failed to run backtest');
  }

  const data: BacktestResult = await response.json();
  return data;
};