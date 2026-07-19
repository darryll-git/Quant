import React, { useState } from 'react';
import { Play, Activity, Zap, Save, Trash2 } from 'lucide-react';
import { SaveStrategyModal } from './SaveStrategyModal';

interface ControlBarProps {
  ticker: string;
  setTicker: (v: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (v: { start: string; end: string }) => void;
  strategy: string;
  setStrategy: (v: string) => void;
  strategiesList: string[];
  onSaveStrategy: (name: string) => void;
  onDeleteStrategy: () => void;
  onRun: () => void;
  isStreaming: boolean;
  equity: number;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
  ticker, setTicker, dateRange, setDateRange, strategy, setStrategy, strategiesList, onSaveStrategy, onDeleteStrategy, onRun, isStreaming, equity 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="h-16 panel-border bg-gray-900 flex items-center px-4 gap-6 border-x-0 border-t-0">
        <div className="flex items-center gap-2">
          <Activity className="text-accent-cyan w-5 h-5" />
          <span className="font-bold text-lg tracking-tighter text-white">QUANT<span className="text-accent-cyan">CORE</span></span>
        </div>

        <div className="h-8 w-[1px] bg-gray-800"></div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 uppercase font-bold">Ticker</label>
            <input 
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="bg-transparent border-b border-gray-800 text-accent-yellow outline-none text-sm w-20 focus:border-accent-cyan transition-colors"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 uppercase font-bold">Strategy</label>
            <div className="flex items-center gap-2">
              <select 
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="bg-transparent border-b border-gray-800 text-white outline-none text-sm focus:border-accent-cyan transition-colors cursor-pointer w-40"
              >
                <option value="SMA Crossover" className="bg-gray-900">SMA Crossover</option>
                {strategiesList.map(s => (
                  <option key={s} value={s} className="bg-gray-900">{s}</option>
                ))}
              </select>
              <button 
                onClick={() => setIsModalOpen(true)}
                title="Save Current Editor Strategy"
                className="text-gray-500 hover:text-accent-cyan transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              {strategy !== 'SMA Crossover' && (
                <button 
                  onClick={onDeleteStrategy}
                  title="Delete Selected Strategy"
                  className="text-gray-500 hover:text-accent-red transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        <div className="flex flex-col">
          <label className="text-[10px] text-gray-500 uppercase font-bold">Date Range</label>
          <div className="flex gap-2 items-center">
            <input 
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="bg-transparent border-b border-gray-800 text-white outline-none text-xs focus:border-accent-cyan"
            />
            <span className="text-gray-600">→</span>
            <input 
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="bg-transparent border-b border-gray-800 text-white outline-none text-xs focus:border-accent-cyan"
            />
          </div>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="flex flex-col items-end mr-4">
        <label className="text-[10px] text-gray-500 uppercase font-bold">Portfolio Equity</label>
        <span className="text-xl font-bold text-white tabular-nums">
          ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <button 
        onClick={onRun}
        disabled={isStreaming}
        className={`px-6 py-2 flex items-center gap-2 font-bold uppercase text-xs transition-all ${
          isStreaming 
          ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/50' 
          : 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan hover:bg-accent-cyan/30'
        }`}
      >
        {isStreaming ? (
          <><Zap className="w-4 h-4 animate-pulse" /> Streaming...</>
        ) : (
          <><Play className="w-4 h-4" /> Run Backtest</>
        )}
      </button>
    </div>
      <SaveStrategyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={onSaveStrategy} 
      />
    </>
  );
};
