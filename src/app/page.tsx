'use client';

import { useEffect, useState } from 'react';
import TradingViewChart from '@/app/components/TradingViewChart';

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
      <div className="flex gap-2 mb-4">
        {Object.entries(INTERVALS).map(([label, value]) => (
          <button
            key={value}
            onClick={() => setInterval(value)}
            className={`px-4 py-2 rounded-md ${interval === value ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="w-full h-full">
        <TradingViewChart data={data} />
      </div>
    </div>
  );
}