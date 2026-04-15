"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

export interface UserStock {
  email: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

interface PortfolioAnalyticsProps {
  portfolio: UserStock[];
  cashBalance: number;
}

export default function PortfolioAnalytics({
  portfolio,
  cashBalance,
}: PortfolioAnalyticsProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Fetch real-time prices for the entire portfolio
  useEffect(() => {
    if (portfolio.length === 0) {
      setLoadingPrices(false);
      return;
    }

    const fetchLivePrices = async () => {
      try {
        const symbols = portfolio.map((s) => s.symbol).join(",");
        const res = await fetch(`/api/getStockRealtime?symbols=${symbols}`);
        if (res.ok) {
          const data = await res.json();
          const quotes = data.data.quotes;
          
          const pricesMap: Record<string, number> = {};
          Object.keys(quotes).forEach((sym) => {
            pricesMap[sym] = quotes[sym].bp || quotes[sym].ap || 0; // Bid price / ask price
          });
          setLivePrices(pricesMap);
        }
      } catch (err) {
        console.error("Failed to fetch live portfolio prices", err);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchLivePrices();
  }, [portfolio]);

  // Construct chart when prices load
  useEffect(() => {
    if (loadingPrices || !chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = ["Cash", ...portfolio.map((s) => s.symbol)];
    
    // Values
    const stockValues = portfolio.map((s) => {
      const currentPrice = livePrices[s.symbol] || s.purchasePrice; // Fallback to purchase price if no live quote
      return Number(s.shares) * currentPrice;
    });

    const data = [cashBalance, ...stockValues];

    // Colors
    const generateColors = (count: number) => {
      const colors = ["#22c55e"]; // Green for cash
      const baseHues = [210, 270, 330, 30, 300, 150]; // Blue, Purple, Pink, Orange, Magenta, Green-ish
      for (let i = 0; i < count; i++) {
        colors.push(`hsl(${baseHues[i % baseHues.length]}, 70%, 50%)`);
      }
      return colors;
    };

    chartInstance.current = new Chart(chartRef.current, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: generateColors(portfolio.length),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return ` $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
            }
          }
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [portfolio, cashBalance, livePrices, loadingPrices]);

  // Metrics
  const totalStockInvestment = portfolio.reduce((acc, s) => acc + s.shares * s.purchasePrice, 0);
  const totalStockValue = portfolio.reduce((acc, s) => {
    const currentPrice = livePrices[s.symbol] || s.purchasePrice;
    return acc + s.shares * currentPrice;
  }, 0);

  const totalValue = cashBalance + totalStockValue;
  const pnlDollars = totalStockValue - totalStockInvestment;
  const pnlPercent = totalStockInvestment > 0 ? (pnlDollars / totalStockInvestment) * 100 : 0;
  
  const isPositive = pnlDollars >= 0;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100 my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Portfolio Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Metrics Column */}
        <div className="col-span-1 flex flex-col justify-evenly">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Account Value</h3>
            <span className="text-4xl font-bold text-gray-900">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-6">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Cash Balance</h3>
            <span className="text-2xl font-bold text-green-600">${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className={`p-6 rounded-xl border mt-6 ${isPositive ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
              All-Time P&L (Equities)
            </h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}${pnlDollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-lg font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                ({isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Chart Column */}
        <div className="col-span-2 h-[450px] relative">
          {loadingPrices && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="text-gray-500 font-semibold animate-pulse">Loading live market data...</div>
            </div>
          )}
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
