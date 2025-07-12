'use client';

import { useEffect, useRef, useState } from 'react';
import TradingViewChart from '@/app/components/TradingViewChart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"

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

const CRYPTOS = ['BTC', 'ETH', 'SOL'];

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
  const [interval, setInterval] = useState('D');
  const [symbol, setSymbol] = useState('BTC');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCandlesData(symbol, interval).then(setData);
  }, [interval, symbol]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setPopoverOpen(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setPopoverOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (popoverOpen) {
      setTimeout(() => {
        commandInputRef.current?.focus();
      }, 100);
    }
  }, [popoverOpen]);

  return (
    <div className="h-screen w-screen p-8 flex flex-col justify-center items-center">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div />
        </PopoverTrigger>
        <PopoverContent className="w-80 mx-auto">
          <Command>
            <CommandInput ref={commandInputRef} placeholder="Search crypto..." />
            <CommandEmpty>No crypto found.</CommandEmpty>
            <CommandGroup>
              {CRYPTOS.map((crypto) => (
                <CommandItem
                  key={crypto}
                  onSelect={() => {
                    setSymbol(crypto);
                    setPopoverOpen(false);
                  }}
                >
                  {crypto}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
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
