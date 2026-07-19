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

export interface EquityPoint {
  time: string;
  value: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  cagr: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  winRate: number;
  totalTrades: number;
}

export interface SavedStrategy {
  name: string;
  code: string;
  type?: 'Python' | 'Math';
}

export const fetchStrategies = async (): Promise<SavedStrategy[]> => {
  const res = await fetch('http://localhost:8000/api/strategies/');
  return res.json();
};

export const saveStrategy = async (strategy: SavedStrategy) => {
  const res = await fetch('http://localhost:8000/api/strategies/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(strategy),
  });
  return res.json();
};

export const deleteStrategy = async (name: string) => {
  const res = await fetch(`http://localhost:8000/api/strategies/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
  return res.json();
};

export interface StreamEvent {
  progress: number;
  logs: LogEntry[];
  equity: EquityPoint[];
  candles: CandleData[];
  smaShort: SMAData[];
  smaLong: SMAData[];
  metrics?: PerformanceMetrics;
  error?: string;
}

export const runBacktestService = async (
  ticker: string, 
  startDate: string, 
  endDate: string,
  alphaCode: string,
  alphaType: string,
  onMessage: (event: StreamEvent) => void
): Promise<void> => {
  const response = await fetch('http://localhost:8000/api/backtest/run', {
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
    throw new Error(`Failed to run backtest: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No readable stream available");

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // SSE sends "data: {...}\n\n"
    const lines = buffer.split(/\r?\n\r?\n/);
    buffer = lines.pop() || ''; // Keep the incomplete chunk in the buffer
    
    for (const line of lines) {
      if (line.trim().startsWith('data: ')) {
        const dataStr = line.replace('data: ', '').trim();
        try {
          const eventData: StreamEvent = JSON.parse(dataStr);
          onMessage(eventData);
        } catch (e) {
          console.error("Error parsing SSE JSON chunk", e, dataStr);
        }
      } else if (line.trim().startsWith('{')) {
         // Fallback if not strictly standard SSE format (Starlette EventSourceResponse sometimes yields just JSON if not formatted fully by the user)
         // Wait, EventSourceResponse from sse_starlette automatically formats if you pass a dict or string, actually it expects a dict with 'data' key or strings.
         // Let me check what I yielded in backend: yield json.dumps(event_data.model_dump())
         // sse_starlette's EventSourceResponse takes an async generator yielding dicts or strings.
         // If yielding string, it treats it as data payload.
         try {
           const eventData: StreamEvent = JSON.parse(line.trim());
           onMessage(eventData);
         } catch (e) {
           // ignore empty lines
         }
      }
    }
  }
};