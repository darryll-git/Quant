import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, AreaSeries } from 'lightweight-charts';
import type { IChartApi, CandlestickData, LineData, UTCTimestamp } from 'lightweight-charts';
import type { CandleData, SMAData } from '../lib/backtestEngine';

interface VisualizerProps {
  candles: CandleData[];
  smaShort: SMAData[];
  smaLong: SMAData[];
  equity: { time: string; value: number }[];
}

export const Visualizer: React.FC<VisualizerProps> = ({ candles, smaShort, smaLong, equity }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#9ca3af',
        fontFamily: 'JetBrains Mono',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    // Main Series: Candlesticks
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    // SMA Series
    const smaShortSeries = chart.addSeries(LineSeries, {
      color: '#06b6d4', // accent-cyan
      lineWidth: 1,
      priceLineVisible: false,
    });

    const smaLongSeries = chart.addSeries(LineSeries, {
      color: '#eab308', // accent-yellow
      lineWidth: 1,
      priceLineVisible: false,
    });

    // Equity Curve (Area Series)
    const equitySeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(6, 182, 212, 0.4)',
      bottomColor: 'rgba(6, 182, 212, 0)',
      lineColor: '#06b6d4',
      lineWidth: 2,
      priceScaleId: 'equity',
    });

    chart.priceScale('equity').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
      visible: true,
      borderColor: '#374151',
    });

    // Initial Data or Update
    if (candles.length > 0) {
      candlestickSeries.setData(candles as unknown as CandlestickData<UTCTimestamp>[]);
      smaShortSeries.setData(smaShort as unknown as LineData<UTCTimestamp>[]);
      smaLongSeries.setData(smaLong as unknown as LineData<UTCTimestamp>[]);
    }

    const interval = setInterval(() => {
      if (equity.length > 0) {
        equitySeries.setData(equity as unknown as LineData<UTCTimestamp>[]);
      }
    }, 100);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      clearInterval(interval);
    };
  }, [candles, smaShort, smaLong]); // Only re-create if base data changes

  // Update Equity in real-time without re-creating chart
  useEffect(() => {
    // This is handled by the data propagation in parent
  }, [equity]);

  return <div ref={chartContainerRef} className="flex-1 w-full h-full" />;
};
