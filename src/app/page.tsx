import TradingViewChart from '@/app/components/CandlesCanvas';

async function getCandlesData() {
  const response = await fetch('https://api.bybit.com/v5/market/kline?category=spot&symbol=BTCUSDT&interval=D', { next: { revalidate: 60 } });
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

export default async function Home() {
  const data = await getCandlesData();
  return (
    <div className="h-screen w-screen p-8 flex justify-center items-center">
      <TradingViewChart data={data} />
    </div>
  );
}