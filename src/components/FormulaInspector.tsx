import React from 'react';
import type { LogEntry } from '../lib/backtestEngine';

interface FormulaInspectorProps {
  log: LogEntry | null;
}

export const FormulaInspector: React.FC<FormulaInspectorProps> = ({ log }) => {
  if (!log) return (
    <div className="flex-1 flex items-center justify-center text-gray-700 italic text-xs">
      Select a log entry to inspect formula
    </div>
  );

  return (
    <div className="p-3 text-[10px] flex-1 overflow-y-auto bg-black/40">
      <div className="space-y-3">
        <div>
          <div className="text-gray-500 mb-1 border-b border-gray-800 pb-1 flex justify-between">
            <span>INPUT STATE @ {log.time}</span>
            <span className="text-accent-cyan">STOKC: {log.price.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-400">
            <span>SMA_SHORT (20):</span> <span className="text-white text-right">{log.smaShort.toFixed(4)}</span>
            <span>SMA_LONG (50):</span> <span className="text-white text-right">{log.smaLong.toFixed(4)}</span>
            <span>PREV_SIGNAL:</span> <span className="text-white text-right">{log.signal === 'BUY' ? 'SELL' : 'HOLD'}</span>
            <span>CURRENT_PNL:</span> <span className={`${log.pnl >= 0 ? 'text-accent-green' : 'text-accent-red'} text-right`}>{log.pnl.toFixed(4)}%</span>
          </div>
        </div>

        <div>
          <div className="text-gray-500 mb-1 border-b border-gray-800 pb-1 uppercase">Logic Evaluation</div>
          <div className="bg-gray-900/50 p-2 font-mono whitespace-pre text-[9px] border-l-2 border-accent-cyan">
            {`IF (SMA_20 > SMA_50) AND (PREV_STATE == 'IDLE'):\n  SIGNAL = BUY\nELSE IF (SMA_20 < SMA_50) AND (PREV_STATE == 'LONG'):\n  SIGNAL = SELL\nELSE:\n  SIGNAL = HOLD`}
          </div>
        </div>

        <div>
          <div className="text-gray-500 mb-1 border-b border-gray-800 pb-1 uppercase">Math Resolution</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>ΔSMA:</span>
              <span className={log.smaShort > log.smaLong ? 'text-accent-green' : 'text-accent-red'}>
                {(log.smaShort - log.smaLong).toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>PnL Calculation:</span>
              <span>((Price / Entry) - 1) * 100</span>
            </div>
            <div className="text-accent-yellow mt-2">
              RESULT: {log.signal === 'HOLD' ? 'NO_CROSSOVER_DETECTED' : `TRIGGER_${log.signal}_SIGNAL`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
