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

interface TrendAlert {
  symbol: string;
  type: "spike" | "crash" | "upward" | "downward";
  message: string;
}

export default function PortfolioAnalytics({
  portfolio,
  cashBalance,
}: PortfolioAnalyticsProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [trends, setTrends] = useState<TrendAlert[]>([]);

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

    const fetchTrends = async () => {
      try {
        const symbols = portfolio.map((s) => s.symbol).join(",");
        const res = await fetch(`/api/getStock?symbols=${symbols}&range=1mo&interval=1d`);
        if (res.ok) {
          const data = await res.json();
          const targetBars = data.data.bars;
          const detectedTrends: TrendAlert[] = [];
          
          Object.keys(targetBars).forEach((sym) => {
            const history = targetBars[sym];
            if (!history || history.length < 7) return;
            
            // Last 7 days SMA array
            const last7 = history.slice(-7);
            const sma = last7.reduce((acc: number, b: any) => acc + b.c, 0) / 7;
            const latestClose = last7[last7.length - 1].c;
            
            if (latestClose > sma * 1.05) {
              detectedTrends.push({ symbol: sym, type: 'spike', message: `Spiking +${((latestClose/sma - 1)*100).toFixed(1)}% above its 7-day moving average.` });
              return; // Skip basic trend text if spiking
            } else if (latestClose < sma * 0.95) {
              detectedTrends.push({ symbol: sym, type: 'crash', message: `Dropping ${((latestClose/sma - 1)*100).toFixed(1)}% below its 7-day moving average.` });
              return;
            }

            // Up/Down trend count over last 5
            const last5 = history.slice(-5);
            let upDays = 0;
            let downDays = 0;
            for(let i=1; i<last5.length; i++) {
              if (last5[i].c > last5[i-1].c) upDays++;
              else downDays++;
            }
            if (upDays >= 4) {
               detectedTrends.push({ symbol: sym, type: 'upward', message: "Climbing consistently. Up 4 of the last 5 days." });
            } else if (downDays >= 4) {
               detectedTrends.push({ symbol: sym, type: 'downward', message: "Sliding consistently. Down 4 of the last 5 days." });
            }
          });
          
          setTrends(detectedTrends);
        }
      } catch (e) {
        console.error("Failed to fetch historicals for trends", e);
      }
    };

    fetchLivePrices();
    fetchTrends();
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

  // Risk Rating Algo
  let riskScore = 0; 
  let riskLevel = "Low";
  let riskColor = "text-green-600";
  let riskBg = "bg-green-50 border-green-100";
  let riskReason = "Healthy diversification.";

  if (totalValue > 0) {
    const cashPercent = cashBalance / totalValue;
    
    // Find highest concentration
    let topHoldingPercent = 0;
    if (portfolio.length > 0) {
      const highestValue = Math.max(...portfolio.map((s) => {
        const currentPrice = livePrices[s.symbol] || s.purchasePrice;
        return s.shares * currentPrice;
      }));
      topHoldingPercent = highestValue / totalValue;
    }

    if (topHoldingPercent > 0.6) {
      riskScore += 50;
      riskReason = "High volume tied to single asset.";
    } else if (topHoldingPercent > 0.3) {
      riskScore += 25;
      riskReason = "Moderate concentration risk.";
    }

    if (cashPercent < 0.05) {
      riskScore += 30;
      riskReason += (riskReason ? " " : "") + "Very low cash buffer.";
    }

    if (portfolio.length === 0 && cashPercent === 1) {
       riskScore = 0;
       riskReason = "Holding pure cash.";
    } else if (portfolio.length === 1 && topHoldingPercent > 0.9) {
       riskScore += 20;
       riskReason = "Zero diversification (1 asset).";
    }

    if (riskScore >= 60) {
      riskLevel = "High";
      riskColor = "text-red-600";
      riskBg = "bg-red-50 border-red-100";
    } else if (riskScore > 20) {
      riskLevel = "Moderate";
      riskColor = "text-yellow-600";
      riskBg = "bg-yellow-50 border-yellow-100";
    }
  }

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

          <div className={`p-6 rounded-xl border mt-6 ${riskBg}`}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${riskColor}`}>
              Portfolio Risk Level
            </h3>
            <div className="flex flex-col gap-1">
              <span className={`text-3xl font-bold ${riskColor}`}>
                {riskLevel}
              </span>
              <span className={`text-sm font-medium ${riskColor} opacity-80`}>
                {riskReason}
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

      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Market Trends & Alerts</h3>
        {trends.length === 0 ? (
          <p className="text-gray-500 italic py-4 text-center">No significant technical deviations detected in your portfolio today.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.map((t, idx) => {
              let color = "text-gray-600 bg-gray-50 border-gray-200";
              let titleColor = "text-gray-900";
              let icon = "📊";
              if (t.type === "spike") { color = "text-green-800 bg-green-50 border-green-200"; titleColor = "text-green-700"; icon="🚀"; }
              if (t.type === "crash") { color = "text-red-800 bg-red-50 border-red-200"; titleColor = "text-red-700"; icon="⚠️"; }
              if (t.type === "upward") { color = "text-green-800 bg-green-50 border-green-200"; titleColor = "text-green-700"; icon="📈"; }
              if (t.type === "downward") { color = "text-orange-800 bg-orange-50 border-orange-200"; titleColor = "text-orange-700"; icon="📉"; }
              
              return (
                <div key={idx} className={`p-5 rounded-xl border ${color} flex flex-col shadow-sm transition-transform hover:scale-[1.02]`}>
                   <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{icon}</span>
                      <span className={`font-bold text-lg tracking-wide ${titleColor}`}>{t.symbol}</span>
                      {t.type === 'spike' && <span className="ml-auto text-xs font-bold uppercase bg-green-200 text-green-800 py-1 px-2 rounded-full">Surge</span>}
                      {t.type === 'crash' && <span className="ml-auto text-xs font-bold uppercase bg-red-200 text-red-800 py-1 px-2 rounded-full">Plunge</span>}
                   </div>
                   <span className="opacity-90 font-medium text-sm leading-relaxed">{t.message}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
