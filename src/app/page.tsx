'use client';

import { useEffect, useRef, useState } from 'react';
import TradingViewChart from '@/app/components/TradingViewChart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

async function getCandlesData(symbol: string, interval: string) {
  const response = await fetch(`https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}USDT&interval=${interval}`, { next: { revalidate: 60 } });
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
  const [interval, setInterval] = useState('240');
  const [symbol, setSymbol] = useState('BTC');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [cryptos, setCryptos] = useState<string[]>([]);

  useEffect(() => {
    fetch('/cryptos.json')
      .then(response => response.json())
      .then(data => setCryptos(data));
  }, []);

  useEffect(() => {
    if (cryptos.length > 0) {
      getCandlesData(symbol, interval).then(setData);
    }
  }, [interval, symbol, cryptos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        if (cryptos.length === 0) return;
        const currentIndex = cryptos.indexOf(symbol);
        if (currentIndex !== -1) {
          const nextIndex = e.key === 'ArrowUp'
            ? (currentIndex - 1 + cryptos.length) % cryptos.length
            : (currentIndex + 1) % cryptos.length;
          setSymbol(cryptos[nextIndex]);
        } else {
          setSymbol(cryptos[0]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cryptos, symbol]);

  return (
    <div className='h-screen w-screen p-8 flex flex-col justify-center items-center'>
      <div className='flex gap-24 items-center mb-4'>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div className='font-bold cursor-pointer'>
              {symbol}
            </div>
          </PopoverTrigger>
          <PopoverContent className='w-80 mx-auto max-h-60 overflow-y-auto'>
            <RadioGroup value={symbol} onValueChange={(value) => {
              setSymbol(value);
              setPopoverOpen(false);
            }} className='flex flex-col gap-2'>
              {cryptos.map((crypto) => (
                <div key={crypto} className='flex items-center space-x-2'>
                  <RadioGroupItem value={crypto} id={crypto} />
                  <label htmlFor={crypto}>{crypto}</label>
                </div>
              ))}
            </RadioGroup>
          </PopoverContent>
        </Popover>
        <ToggleGroup type='single' value={interval} onValueChange={setInterval}>
          {Object.entries(INTERVALS).map(([label, value]) => (
            <ToggleGroupItem key={value} value={value}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className='w-full h-full'>
        <TradingViewChart data={data} />
      </div>
    </div>
  );
}