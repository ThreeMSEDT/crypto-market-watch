'use client';

import { useEffect, useState } from 'react';
import TradingViewChart from '@/app/components/TradingViewChart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const INTERVALS = {
  '1m': '1',
  '5m': '5',
  '15m': '15',
  '1H': '60',
  '4H': '240',
  '1D': 'D',
  '1W': 'W',
  '1M': 'M',
};

async function getCandlesData(interval: string) {
  const response = await fetch(`https://api.bybit.com/v5/market/kline?category=spot&symbol=BTCUSDT&interval=${interval}`, { next: { revalidate: 60 } });
  const { result } = await response.json();
  const { list } = result;
  return list.map(([time, open, high, low, close]: string[]) => ({
    time: parseInt(time) / 1000,
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
  })).reverse();
}

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [interval, setInterval] = useState('D');

  useEffect(() => {
    getCandlesData(interval).then(setData);
  }, [interval]);

  return (
    <div className="h-screen w-screen p-8 flex flex-col justify-center items-center">
      <ToggleGroup type="single" value={interval} onValueChange={setInterval} className="mb-4">
        {Object.entries(INTERVALS).map(([label, value]) => (
          <ToggleGroupItem key={value} value={value}>
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="w-full h-full">
        <TradingViewChart data={data} />
      </div>
    </div>
  );
}