import React, { useEffect, useState } from "react";
import AMRNChart from "./AMRNChart";
import { AlpacaStockDataResponse } from "../interfaces/types";
import AMRNChartMini from "./AMRNChartMini";

interface StockDisplayProps {
  symbol: string;
  shares: number;
  marketPrice: number;
  purchasePrice: number;
}

const StockDisplay: React.FC<StockDisplayProps> = ({
  symbol,
  shares,
  marketPrice,
  purchasePrice,
}) => {
  const [stockData, setStockData] = useState<AlpacaStockDataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/getStock?symbol=${symbol}&range=5d&interval=15m`);
        const data = await res.json();
        setStockData(data);
      } catch (err) {
        setStockData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [symbol]);

  // Calculate gain/loss percentage
  const percentChange =
    purchasePrice > 0
      ? ((marketPrice - purchasePrice) / purchasePrice) * 100
      : 0;
  const isUp = percentChange >= 0;

  return (
    <div className="bg-white text-black rounded-lg p-4 flex flex-col min-w-[250px] max-w-[320px] shadow-lg border border-gray-800">
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-lg">{symbol}</span>
        <span className="text-xl font-semibold">${marketPrice.toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-[80px] max-w-[120px] h-[32px]">
          {loading ? (
            <div className="text-xs text-gray-400">Loading chart...</div>
          ) : stockData ? (
            <AMRNChartMini stockData={stockData} symbol={symbol}/>
            
          ) : (
            <div className="text-xs text-red-400">No chart</div>
          )}
        </div>
        <div className="ml-2 text-sm truncate">
          {shares.toFixed(6)} Shar...
        </div>
      </div>
      <div className="flex justify-end mt-1">
        <span
          className={`font-semibold ${
            isUp ? "text-green-400" : "text-red-400"
          }`}
        >
          {isUp ? "+" : ""}
          {percentChange.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export default StockDisplay;
