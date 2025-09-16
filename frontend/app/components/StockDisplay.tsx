import React, { useEffect, useState } from "react";
import { AlpacaStockDataResponse } from "../interfaces/types";
import AMRNChartMini from "./AMRNChartMini";

interface StockDisplayProps {
  symbol: string;
  shares: number;
  purchasePrice: number;
}

export interface AlpacaRealtimeQuoteResponse {
  data: {
    quote: {
      ap: number;     
      as: number;      
      ax: string;      
      bp: number;      
      bs: number;      
      bx: string;      
      c: string[];     
      t: string;       
      z: string;       
    };
  };
}

const StockDisplay: React.FC<StockDisplayProps> = ({
  symbol,
  shares,
  purchasePrice,
}) => {
  const [stockData, setStockData] = useState<AlpacaStockDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [marketPrice, setMarketPrice] = useState<null| AlpacaRealtimeQuoteResponse>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/getStock?symbol=${symbol}&range=5d&interval=15m`);
        const data = await res.json();
        setStockData(data);
      } catch {
        setStockData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [symbol]);

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const res = await fetch(`/api/getStockRealtime?symbol=${symbol}`);
        const data = await res.json();
        setMarketPrice(data);
      } catch {
        setMarketPrice(null);
      }
    };
    fetchCurrentPrice();
  }, [symbol]);


  const bidPrice = marketPrice?.data.quote.bp;
  useEffect(() => {
    if (bidPrice == null) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/getStockRealtime?symbol=${symbol}`);
        const data = await res.json();
        setMarketPrice(data);
      } catch (error) {
        console.error("Error fetching real-time price:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [bidPrice, symbol]);
  
    const validPurchasePrice = typeof purchasePrice === "number" && !isNaN(purchasePrice) && purchasePrice !== 0;
    const validBidPrice = typeof bidPrice === "number" && !isNaN(bidPrice);

    const percentChange =
      validPurchasePrice && validBidPrice
        ? ((bidPrice - purchasePrice) / purchasePrice) * 100
        : 0;
      const isUp = percentChange >= 0;

  useEffect(() => {
    if (bidPrice == null) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/getStockRealtime?symbol=${symbol}`);
        const data = await res.json();
        setMarketPrice(data);
      } catch (error) {
        console.error("Error fetching real-time price:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [bidPrice, symbol]);

  return (
    <div className="bg-white text-black rounded-lg p-4 flex flex-col min-w-[250px] max-w-[320px] shadow-lg border border-gray-800">
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-lg">{symbol}</span>
        <span className="text-xl font-semibold">{validBidPrice ? `$${bidPrice.toFixed(2)}` : "N/A"}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-[80px] max-w-[120px] h-[32px]">
          {loading ? (
            <div className="text-xs text-gray-400">Loading chart...</div>
          ) : stockData ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <AMRNChartMini stockData={stockData as any} symbol={symbol}/>
            
          ) : (
            <div className="text-xs text-red-400">No chart</div>
          )}
        </div>
        <div className="ml-2 text-sm truncate">
          {shares.toFixed(3)} Shares
        </div>
      </div>
      <div className="flex justify-end mt-1">
        <span
          className={`font-semibold ${
            isUp ? "text-green-400" : "text-red-400"
          }`}
        >
          {isUp ? "+" : ""}
          {validPurchasePrice && validBidPrice
            ? `${percentChange.toFixed(2)}%`
            : "N/A"}
        </span>
      </div>
    </div>
  );
};

export default StockDisplay;
