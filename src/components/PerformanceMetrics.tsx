import React from 'react';

interface PerformanceMetricsProps {
  metrics?: {
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

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  const MetricCard = ({ label, value, unit = '', isPositive = true, colorClass = '' }: any) => (
    <div className="flex flex-col border border-gray-800/50 p-2 bg-gray-950/20">
      <span className="text-[9px] text-gray-500 uppercase tracking-tighter">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${colorClass || (isPositive ? 'text-accent-green' : 'text-accent-red')}`}>
        {value}{unit}
      </span>
    </div>
  );

  if (!metrics) return (
    <div className="flex-1 flex items-center justify-center text-gray-700 italic text-xs">
      Run simulation to generate analytics
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-2 p-3 flex-1 overflow-y-auto">
      <MetricCard 
        label="Total Return" 
        value={metrics.totalReturn.toFixed(2)} 
        unit="%" 
        isPositive={metrics.totalReturn >= 0}
      />
      <MetricCard 
        label="CAGR (Est)" 
        value={metrics.cagr.toFixed(2)} 
        unit="%" 
        isPositive={metrics.cagr >= 0}
      />
      <MetricCard 
        label="Max Drawdown" 
        value={metrics.maxDrawdown.toFixed(2)} 
        unit="%" 
        isPositive={false}
      />
      <MetricCard 
        label="Win Rate" 
        value={metrics.winRate.toFixed(2)} 
        unit="%" 
        isPositive={metrics.winRate >= 50}
      />
      
      <MetricCard 
        label="Sharpe Ratio" 
        value={metrics.sharpeRatio.toFixed(2)} 
        colorClass="text-accent-cyan"
      />
      <MetricCard 
        label="Sortino Ratio" 
        value={metrics.sortinoRatio.toFixed(2)} 
        colorClass="text-accent-cyan"
      />
      <MetricCard 
        label="Calmar Ratio" 
        value={metrics.calmarRatio.toFixed(2)} 
        colorClass="text-accent-cyan"
      />
      <MetricCard 
        label="Total Trades" 
        value={metrics.totalTrades} 
        colorClass="text-accent-yellow"
      />
    </div>
  );
};
