"use client";

import { useEffect, useState } from "react";
import AMRNChart from "@/app/components/AMRNChart";
import StockModal from "@/app/components/StockModal";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import type { AlpacaStockDataResponse } from "@/app/interfaces/types";
import type { FinnhubCompanyProfileResponse } from "@/app/interfaces/types";
import type { UserStock } from "@/app/page";
import { useAuth } from "@/app/contexts/AuthContext";
import { AlpacaRealtimeQuoteResponse } from "@/app/components/StockDisplay";

const Stock = () => {
  const router = useRouter();
  const { user } = useAuth();

  const rangeIntervalPairs = [
    { range: "1d", interval: "5m" },
    { range: "5d", interval: "15m" },
    { range: "1mo", interval: "1d" },
    { range: "3mo", interval: "1d" },
    { range: "6mo", interval: "1wk" },
    { range: "1y", interval: "1wk" },
    { range: "2y", interval: "1wk" },
    { range: "5y", interval: "1mo" },
  ];

  const { id: symbol } = useParams();
  const searchParams = useSearchParams();
  const [range, setRange] = useState(searchParams.get("range") ?? "6mo");
  const [intervalSetting, setIntervalSetting] = useState(
    searchParams.get("interval") ?? "1wk"
  );
  const [stockData, setStockData] = useState<AlpacaStockDataResponse | null>(
    null
  );
  const [companyData, setCompanyData] =
    useState<FinnhubCompanyProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userStock, setUserStock] = useState<null | UserStock>(null);
  const [marketPrice, setMarketPrice] =
    useState<null | AlpacaRealtimeQuoteResponse>(null);
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [liveWsPrice, setLiveWsPrice] = useState<number | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  // Legacy baseUrl removed since we fetch natively from NextJS API

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/getStock?symbol=${symbol}&range=${range}&interval=${intervalSetting}`
        );
        const data: AlpacaStockDataResponse = await response.json();

        if (!response.ok || data.data.bars[symbol as string]?.length === 0) {
          throw new Error("Failed to fetch stock data");
        }

        setStockData(data);
      } catch (error) {
        console.error(error);
        setError(error instanceof Error ? error.message : "An error occurred");
        setStockData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [range, intervalSetting, symbol]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/getProfile?symbol=${symbol}`);
        const data: FinnhubCompanyProfileResponse = await response.json();

        if (!response.ok || !data?.data) {
          console.warn("Company profile not available or rate limited.");
          setCompanyData(null);
          return;
        }

        setCompanyData(data);
      } catch (error) {
        console.error("Error fetching company data:", error);
        setCompanyData(null);
      }
    };

    fetchCompanyData();
  }, [symbol]);

  useEffect(() => {
    // 1. Initial snapshot using Alpaca
    const fetchCurrentPrice = async () => {
      try {
        const res = await fetch(`/api/getStockRealtime?symbol=${symbol}`);
        if (res.ok) {
            const data = await res.json();
            setMarketPrice(data);
        }
      } catch {
        // Keep old price to prevent UI jitter
      }
    };
    
    fetchCurrentPrice();
    setLiveWsPrice(null); // Reset live ws price on symbol change

    // 2. High frequency websocket streaming
    let ws: WebSocket;
    
    if (range === "1d") {
      const connectWebSocket = async () => {
        try {
          const res = await fetch('/api/ws-token');
          const { token } = await res.json();
          if (!token) return;

          ws = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
          
          ws.onopen = () => {
            console.log(`📡 WebSocket connected for ${symbol}`);
            ws.send(JSON.stringify({ type: "subscribe", symbol: symbol }));
          };

          ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'trade' && message.data?.length > 0) {
              const latestTrade = message.data[message.data.length - 1];
              if (latestTrade?.p) {
                setLiveWsPrice(latestTrade.p);
              }
            }
          };

          ws.onerror = (err) => console.error("WebSocket error", err);
          
        } catch (error) {
          console.error("Failed to connect Finnhub WebSockets", error);
        }
      };

      connectWebSocket();
    }

    return () => {
       if (ws) {
         if (ws.readyState === WebSocket.OPEN) {
           ws.send(JSON.stringify({ type: "unsubscribe", symbol: symbol }));
         }
         ws.close();
         console.log(`🔌 WebSocket disconnected for ${symbol}`);
       }
    }
  }, [symbol, range]);

  useEffect(() => {
    const getUserStock = async () => {
      try {
        const response = await fetch('/api/portfolio', { method: "GET" });

        if (!response.ok) {
          console.error("❌ HTTP error:", response.status);
          setUserStock(null);
          return;
        }

        const result = await response.json();

        // Ensure portfolio array exists
        if (!result || !Array.isArray(result.portfolio)) {
          setUserStock(null);
          return;
        }

        // Find precisely this stock in the returned portfolio
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchedStock = result.portfolio.find((s: any) => s.symbol.toUpperCase() === (symbol as string).toUpperCase());
        
        if (matchedStock && matchedStock.shares > 0) {
          setUserStock(matchedStock);
        } else {
          setUserStock(null);
        }
      } catch (error) {
        console.error("❌ Failed to retrieve stocks:", error);
        setUserStock(null);
      }
    };

    getUserStock();
  }, [user, symbol]);

  return (
    <div className="flex justify-center">
      <div className="mt-10 w-[80%]">
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {stockData && !isLoading && !error && (
          <div className="w-full flex flex-col items-center">
            {/* Robinhood Style Giant Price Header */}
            <div className="mb-4 mt-2 text-center relative w-full max-w-5xl">
              <h1 className="text-6xl font-light text-gray-900 tracking-tighter">
                ${(hoveredPrice ?? liveWsPrice ?? marketPrice?.data.quote.bp ?? marketPrice?.data.quote.ap ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <h2 className="text-gray-500 text-lg mt-1 h-6 font-medium">
                 {hoveredLabel ? hoveredLabel : "Live Data"}
              </h2>
              
              <div className="absolute right-0 top-4">
                 <button 
                   onClick={() => setIsTradeModalOpen(true)}
                   className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
                 >
                   Trade {symbol}
                 </button>
              </div>
            </div>
            
            <div className="w-full max-w-5xl border border-black">
              <AMRNChart 
                stockData={stockData as any} 
                symbol={symbol as string} 
                livePrice={liveWsPrice || marketPrice?.data.quote.bp || marketPrice?.data.quote.ap}
                onHoverData={(price, label) => {
                  setHoveredPrice(price);
                  setHoveredLabel(label);
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center flex-col">
          <ul className="flex w-1/2 justify-evenly text-sm text-gray-500">
            {rangeIntervalPairs.map((pair, index) => (
              <li
                key={index}
                onClick={() => {
                  setRange(pair.range);
                  setIntervalSetting(pair.interval);
                  router.replace(
                    `/stock/${symbol}?range=${pair.range}&interval=${pair.interval}`,
                    { scroll: false }
                  );
                }}
                className={`cursor-pointer hover:text-gray-700 ${
                  range === pair.range ? "text-blue-600 font-semibold" : ""
                }`}
              >
                {pair.range}
              </li>
            ))}
          </ul>
        </div>

        {userStock && marketPrice !== null && (
          <div className="flex flex-row justify-evenly text-lg text-gray-700 mt-[3vw]">
            <div className="border border-gray-500 px-[1vw] w-[40%] h-[10vw] flex justify-center flex-col">
              <h1>Your market value</h1>
              <h2 className="text-2xl font-bold">
                $
                {(
                  Number(marketPrice.data.quote.bp) * Number(userStock.shares)
                ).toFixed(2)}
              </h2>
              <div className="flex flex-row justify-between">
                <h2>Total return: </h2>
                <h3>
                  {marketPrice.data.quote.bp - userStock.purchasePrice < 0 ? (
                    <div>
                      -$
                      {(
                        Number(
                          Math.abs(
                            marketPrice.data.quote.bp - userStock.purchasePrice
                          )
                        ) * Number(userStock.shares)
                      ).toFixed(2)}{" "}
                      (-
                      {(
                        100 -
                        (marketPrice.data.quote.bp / userStock.purchasePrice) *
                          100
                      ).toFixed(4)}
                      %)
                    </div>
                  ) : (
                    <div>
                      +$
                      {(
                        Number(
                          Math.abs(
                            marketPrice.data.quote.bp - userStock.purchasePrice
                          )
                        ) * Number(userStock.shares)
                      ).toFixed(2)}{" "}
                      (+
                      {(
                        100 -
                        (marketPrice.data.quote.bp / userStock.purchasePrice) *
                          100
                      ).toFixed(3)}
                      %)
                    </div>
                  )}
                </h3>
              </div>
            </div>
            <div className="border border-gray-500 px-[1vw] w-[40%] h-[10vw] flex justify-center flex-col">
              <h1>Your Average Cost</h1>
              <h2 className="text-2xl font-bold">${userStock.purchasePrice}</h2>
              <div className="flex flex-row justify-between">
                <h2>Shares: </h2>
                <h3>{userStock.shares}</h3>
              </div>
            </div>
          </div>
        )}

        {companyData && (
          <div className="flex items-center flex-col mt-8 px-6 text-gray-700 w-full mb-10">
            <h1 className="text-2xl font-bold mb-4">{companyData.data.name}</h1>
            <div className="flex w-[80%] justify-evenly py-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Industry</span>
                    <span className="text-lg font-medium">{companyData.data.finnhubIndustry}</span>
                </div>
                <div className="flex flex-col items-center hidden sm:flex">
                    <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Exchange</span>
                    <span className="text-lg font-medium">{companyData.data.exchange}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Market Cap</span>
                    <span className="text-lg font-medium">${(companyData.data.marketCapitalization / 1000).toFixed(2)}B</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">IPO Date</span>
                    <span className="text-lg font-medium">{companyData.data.ipo}</span>
                </div>
            </div>
            
            {companyData.data.weburl && (
              <a href={companyData.data.weburl} target="_blank" rel="noopener noreferrer" className="mt-4 text-blue-600 hover:text-blue-800 underline">
                  Visit Official Website
              </a>
            )}
          </div>
        )}

        {isTradeModalOpen && stockData && (
          <StockModal 
            stockData={stockData as any} 
            symbol={symbol as string} 
            onClose={() => setIsTradeModalOpen(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default Stock;