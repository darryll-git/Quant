import React, { useState, useEffect } from 'react';
import { ControlBar } from './ControlBar';
import { ExecutionLog } from './ExecutionLog';
import { Visualizer } from './Visualizer';
import { PerformanceMetrics } from './PerformanceMetrics';
import { FormulaInspector } from './FormulaInspector';
import { AlphaEditor } from './AlphaEditor';
// @ts-ignore
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { runBacktestService } from '../lib/backtestEngine';
import type { BacktestResult, LogEntry } from '../lib/backtestEngine';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<BacktestResult | null>(null);
  const [ticker, setTicker] = useState('NVDA');
  const [dateRange, setDateRange] = useState({ start: '2024-08-01', end: '2024-10-31' });
  const [strategy, setStrategy] = useState('SMA Crossover');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [alphaType, setAlphaType] = useState<'Python' | 'Math'>('Python');
  const [alphaCode, setAlphaCode] = useState('def alpha(data):\n    # Write your strategy here\n    if data["smaShort"] > data["smaLong"]:\n        return "BUY"\n    elif data["smaShort"] < data["smaLong"]:\n        return "SELL"\n    return "HOLD"\n');

  const handleRun = async () => {
    try {
      const result = await runBacktestService(ticker, dateRange.start, dateRange.end, alphaCode, alphaType);
      setData(result);
      setCurrentIndex(0);
      setIsStreaming(true);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isStreaming && data && currentIndex < data.logs.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSelectedLog(data.logs[currentIndex]);
      }, 100);
      return () => clearTimeout(timer);
    } else if (data && currentIndex >= data.logs.length) {
      setIsStreaming(false);
    }
  }, [isStreaming, currentIndex, data]);

  const visibleLogs = data ? data.logs.slice(0, currentIndex) : [];
  const visibleEquity = data ? data.equity.slice(0, currentIndex) : [];

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden text-gray-300 font-mono">
      {/* Top Control Bar */}
      <ControlBar 
        ticker={ticker} 
        setTicker={setTicker}
        dateRange={dateRange}
        setDateRange={setDateRange}
        strategy={strategy}
        setStrategy={setStrategy}
        onRun={handleRun}
        isStreaming={isStreaming}
        equity={visibleEquity.length > 0 ? visibleEquity[visibleEquity.length - 1].value : 100000}
      />

      {/* Main Resizable Layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel: Execution Log */}
          <Panel defaultSize={20} minSize={15} className="panel-border bg-panel flex flex-col">
            <div className="p-2 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <span className="text-xs font-bold text-accent-cyan tracking-widest uppercase">Execution Log</span>
              <span className="text-[10px] text-gray-500">Live Terminal</span>
            </div>
            <ExecutionLog logs={visibleLogs} onSelect={setSelectedLog} selectedLog={selectedLog} />
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
                  candles={data?.candles || []} 
                  smaShort={data?.smaShort || []} 
                  smaLong={data?.smaLong || []} 
                  equity={visibleEquity}
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
                      setAlphaType={setAlphaType} 
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
                        <PerformanceMetrics metrics={data?.metrics} />
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
