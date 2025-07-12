'use client'

import React, { useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi, ColorType, CandlestickSeries } from 'lightweight-charts'

type CandleData = {
  time: string
  open: number
  close: number
  high: number
  low: number
}

interface TradingViewChartProps {
  data: CandleData[];
}

export default function TradingViewChart({ data }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: {
          color: 'transparent',
        },
        horzLines: {
          color: 'transparent',
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(42, 46, 57, 0.8)',
      },
      crosshair: {
        mode: 0,
      },
      localization: {
        dateFormat: 'yyyy-MM-dd',
      }
    });

    chartRef.current = chart;

    const newSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#4bffb5',
      downColor: '#ff4976',
      borderDownColor: '#ff4976',
      borderUpColor: '#4bffb5',
      wickDownColor: '#838ca1',
      wickUpColor: '#838ca1',
      priceLineVisible: false,
    });
    candleSeriesRef.current = newSeries;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== chartContainerRef.current) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      if (chartContainerRef.current != null)
        resizeObserver.unobserve(chartContainerRef.current);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (candleSeriesRef.current && data) {
      candleSeriesRef.current.setData(data);
    }
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="h-full w-full"
      style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
    </div>
  )
}