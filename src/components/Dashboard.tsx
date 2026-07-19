import React, { useState } from 'react';
import { ControlBar } from './ControlBar';
import { ExecutionLog } from './ExecutionLog';
import { Visualizer } from './Visualizer';
import { PerformanceMetrics } from './PerformanceMetrics';
import { FormulaInspector } from './FormulaInspector';
import { AlphaEditor } from './AlphaEditor';
// @ts-ignore
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { runBacktestService, fetchStrategies, saveStrategy, deleteStrategy } from '../lib/backtestEngine';
import type { LogEntry, StreamEvent, CandleData, SMAData, EquityPoint, PerformanceMetrics as Metrics, SavedStrategy } from '../lib/backtestEngine';

const Dashboard: React.FC = () => {
  // State for accumulated stream data
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [smaShort, setSmaShort] = useState<SMAData[]>([]);
  const [smaLong, setSmaLong] = useState<SMAData[]>([]);
  const [equity, setEquity] = useState<EquityPoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [ticker, setTicker] = useState('SPY');
  const [dateRange, setDateRange] = useState({ start: '2023-01-01', end: '2024-01-01' });
  const [strategy, setStrategy] = useState('SMA Crossover');
  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [alphaType, setAlphaType] = useState<'Python' | 'Math'>('Python');
  
  // Update default code to use pandas vectorized logic which works with the new Sandbox
  const defaultCode = `def alpha(data):
    # Vectorized pandas logic
    data["signal"] = "HOLD"
    data.loc[data["smaShort"] > data["smaLong"], "signal"] = "BUY"
    data.loc[data["smaShort"] < data["smaLong"], "signal"] = "SELL"
    return data["signal"]
`;
  const defaultMathCode = `// Vectorized Math logic
BUY = smaShort > smaLong
SELL = smaShort < smaLong and smaShort > 0
`;
  const [alphaCode, setAlphaCode] = useState(defaultCode);

  React.useEffect(() => {
    fetchStrategies().then(strats => {
      setSavedStrategies(strats);
    }).catch(e => console.error("Failed to load strategies", e));
  }, []);

  const handleAlphaTypeChange = (newType: 'Python' | 'Math') => {
    setAlphaType(newType);
    if (strategy === 'SMA Crossover') {
      setAlphaCode(newType === 'Python' ? defaultCode : defaultMathCode);
    }
  };

  const handleSaveStrategy = async (name: string) => {
    try {
      const newStrategy: SavedStrategy = { name, code: alphaCode, type: alphaType };
      await saveStrategy(newStrategy);
      const strats = await fetchStrategies();
      setSavedStrategies(strats);
      setStrategy(name);
    } catch (e) {
      console.error("Failed to save strategy", e);
      alert("Failed to save strategy");
    }
  };

  const handleDeleteStrategy = async () => {
    if (strategy === 'SMA Crossover') return;
    if (confirm(`Are you sure you want to delete ${strategy}?`)) {
      try {
        await deleteStrategy(strategy);
        const strats = await fetchStrategies();
        setSavedStrategies(strats);
        setStrategy('SMA Crossover');
        setAlphaCode(defaultCode);
      } catch (e) {
        console.error("Failed to delete strategy", e);
        alert("Failed to delete strategy");
      }
    }
  };

  const handleStrategyChange = (newStrategy: string) => {
    setStrategy(newStrategy);
    if (newStrategy === 'SMA Crossover') {
      setAlphaCode(defaultCode);
      setAlphaType('Python');
      return;
    }
    const found = savedStrategies.find(s => s.name === newStrategy);
    if (found) {
      setAlphaCode(found.code);
      setAlphaType(found.type || 'Python');
    }
  };

  const handleRun = async () => {
    // Reset state for new run
    setCandles([]);
    setSmaShort([]);
    setSmaLong([]);
    setEquity([]);
    setLogs([]);
    setMetrics(null);
    setProgress(0);
    setError(null);
    setIsStreaming(true);

    try {
      await runBacktestService(
        ticker,
        dateRange.start,
        dateRange.end,
        alphaCode,
        alphaType,
        (event: StreamEvent) => {
          if (event.error) {
            setError(event.error);
            setIsStreaming(false);
            return;
          }
          
          setProgress(event.progress);
          
          if (event.candles && event.candles.length > 0) {
             setCandles(prev => [...prev, ...event.candles]);
          }
          if (event.smaShort && event.smaShort.length > 0) {
             setSmaShort(prev => [...prev, ...event.smaShort]);
          }
          if (event.smaLong && event.smaLong.length > 0) {
             setSmaLong(prev => [...prev, ...event.smaLong]);
          }
          if (event.equity && event.equity.length > 0) {
             setEquity(prev => [...prev, ...event.equity]);
          }
          if (event.logs && event.logs.length > 0) {
             setLogs(prev => [...prev, ...event.logs]);
          }
          if (event.metrics) {
             setMetrics(event.metrics);
             setIsStreaming(false);
          }
        }
      );
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setIsStreaming(false);
    }
  };

  const currentEquity = equity.length > 0 ? equity[equity.length - 1].value : 100000;

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden text-gray-300 font-mono">
      {/* Top Control Bar */}
      <ControlBar 
        ticker={ticker} 
        setTicker={setTicker}
        dateRange={dateRange}
        setDateRange={setDateRange}
        strategy={strategy}
        setStrategy={handleStrategyChange}
        strategiesList={savedStrategies.map(s => s.name)}
        onSaveStrategy={handleSaveStrategy}
        onDeleteStrategy={handleDeleteStrategy}
        onRun={handleRun}
        isStreaming={isStreaming}
        equity={currentEquity}
      />
      
      {/* Progress Bar & Error Display */}
      {isStreaming && progress < 100 && !error && (
        <div className="w-full h-1 bg-gray-800">
          <div className="h-full bg-accent-cyan transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {error && (
        <div className="w-full bg-red-900/50 text-red-400 p-2 text-xs text-center border-b border-red-800">
          ERROR: {error}
        </div>
      )}

      {/* Main Resizable Layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel: Execution Log */}
          <Panel defaultSize={20} minSize={15} className="panel-border bg-panel flex flex-col">
            <div className="p-2 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <span className="text-xs font-bold text-accent-cyan tracking-widest uppercase">Execution Log</span>
              <span className="text-[10px] text-gray-500">Live Terminal</span>
            </div>
            <ExecutionLog logs={logs} onSelect={setSelectedLog} selectedLog={selectedLog} />
          </Panel>

          <PanelResizeHandle className="ResizeHandleOuter" />

          {/* Right Content */}
          <Panel minSize={30} className="flex flex-col">
            <PanelGroup direction="vertical">
              {/* Top Right: Visualizer */}
              <Panel defaultSize={60} minSize={20} className="panel-border bg-panel flex flex-col">
                <div className="p-2 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                  <span className="text-xs font-bold text-accent-cyan tracking-widest uppercase">Strategy Visualizer</span>
                  <div className="flex gap-4 text-[10px]">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-accent-cyan"></div> SMA 20</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-accent-yellow"></div> SMA 50</span>
                  </div>
                </div>
                <Visualizer 
                  candles={candles} 
                  smaShort={smaShort} 
                  smaLong={smaLong} 
                  equity={equity}
                />
              </Panel>

              <PanelResizeHandle className="ResizeHandleOuter" />

              {/* Bottom Right: Editor & Metrics */}
              <Panel defaultSize={40} minSize={20} className="flex flex-col">
                <PanelGroup direction="horizontal">
                  {/* Bottom Left: Alpha Editor */}
                  <Panel defaultSize={50} minSize={20} className="panel-border bg-panel flex flex-col border-t-0">
                    <AlphaEditor 
                      alphaType={alphaType} 
                      setAlphaType={handleAlphaTypeChange} 
                      alphaCode={alphaCode} 
                      setAlphaCode={setAlphaCode} 
                    />
                  </Panel>

                  <PanelResizeHandle className="ResizeHandleOuter" />

                  {/* Bottom Right: Metrics & Inspector */}
                  <Panel defaultSize={50} minSize={20} className="flex flex-col">
                    <PanelGroup direction="vertical">
                      <Panel defaultSize={50} minSize={20} className="panel-border bg-panel flex flex-col border-t-0 border-l-0">
                        <div className="p-2 border-b border-gray-800 bg-gray-900/50">
                          <span className="text-xs font-bold text-accent-cyan tracking-widest uppercase">Performance Analytics</span>
                        </div>
                        <PerformanceMetrics metrics={metrics || undefined} />
                      </Panel>
                      
                      <PanelResizeHandle className="ResizeHandleOuter" />
                      
                      <Panel defaultSize={50} minSize={20} className="panel-border bg-panel flex flex-col border-t-0 border-l-0">
                        <div className="p-2 border-b border-gray-800 bg-gray-900/50">
                          <span className="text-xs font-bold text-accent-cyan tracking-widest uppercase">Formula Inspector</span>
                        </div>
                        <FormulaInspector log={selectedLog} />
                      </Panel>
                    </PanelGroup>
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Dashboard;
