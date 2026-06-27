import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../lib/backtestEngine';

interface ExecutionLogProps {
  logs: LogEntry[];
  selectedLog: LogEntry | null;
  onSelect: (log: LogEntry) => void;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({ logs, selectedLog, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto bg-black p-0 text-[11px] leading-relaxed scrollbar-thin"
    >
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-gray-950 border-b border-gray-800 text-gray-500 uppercase">
          <tr>
            <th className="p-1 px-2 text-left font-normal border-r border-gray-800 w-20">Time</th>
            <th className="p-1 px-2 text-left font-normal border-r border-gray-800">Signal</th>
            <th className="p-1 px-2 text-right font-normal">PnL%</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-700 italic">Waiting for execution...</td>
            </tr>
          ) : (
            logs.map((log, i) => (
              <tr 
                key={i} 
                onClick={() => onSelect(log)}
                className={`border-b border-gray-900 cursor-pointer hover:bg-gray-800/50 transition-colors ${
                  selectedLog?.time === log.time ? 'bg-accent-cyan/10' : ''
                }`}
              >
                <td className="p-1 px-2 border-r border-gray-900 text-gray-500">{log.time}</td>
                <td className="p-1 px-2 border-r border-gray-900">
                  <div className="flex flex-col">
                    <span className={`font-bold ${
                      log.signal === 'BUY' ? 'text-accent-green' : 
                      log.signal === 'SELL' ? 'text-accent-red' : 'text-gray-400'
                    }`}>
                      {log.signal === 'HOLD' ? 'TICK' : log.signal}
                    </span>
                    <span className="text-[9px] text-gray-600 truncate">{log.action}</span>
                  </div>
                </td>
                <td className={`p-1 px-2 text-right tabular-nums ${
                  log.pnl > 0 ? 'text-accent-green' : log.pnl < 0 ? 'text-accent-red' : 'text-gray-500'
                }`}>
                  {log.pnl !== 0 ? `${log.pnl > 0 ? '+' : ''}${log.pnl.toFixed(2)}%` : '0.00%'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
