"use client";

import { useEffect, useState } from "react";
import AMRNChart from "@/app/components/AMRNChart";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import type { AlpacaStockDataResponse } from "@/app/interfaces/types";
import type { YahooFinanceAssetProfileResponse } from "@/app/interfaces/types";
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
  const [interval, setInterval] = useState(
    searchParams.get("interval") ?? "1wk"
  );
  const [stockData, setStockData] = useState<AlpacaStockDataResponse | null>(
    null
  );
  const [companyData, setCompanyData] =
    useState<YahooFinanceAssetProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userStock, setUserStock] = useState<null | UserStock>(null);
  const [marketPrice, setMarketPrice] =
    useState<null | AlpacaRealtimeQuoteResponse>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/getStock?symbol=${symbol}&range=${range}&interval=${interval}`
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
  }, [range, interval, symbol]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/getProfile?symbol=${symbol}`);
        const data: YahooFinanceAssetProfileResponse = await response.json();

        if (!response.ok || data.data == null) {
          throw new Error("Failed to fetch company profile");
        }

        setCompanyData(data);
      } catch (error) {
        console.error(error);
        setCompanyData(null);
      }
    };

    fetchCompanyData();
  }, [symbol]);

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const res = await fetch(`/api/getStockRealtime?symbol=${symbol}`);
        const data = await res.json();
        console.log(data);
        setMarketPrice(data);
      } catch {
        setMarketPrice(null);
      }
    };
    fetchCurrentPrice();
  }, [symbol]);

  useEffect(() => {
    const getUserStock = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/api/stock/get?email=${user?.email}&symbol=${symbol}`,
          { method: "GET" }
        );

        if (!response.ok) {
          console.error("❌ HTTP error:", response.status);
          setUserStock(null);
          return;
        }

        const result = await response.json();

        // Optional: check if result is valid object
        if (!result || Object.keys(result).length === 0) {
          setUserStock(null);
          return;
        }

        setUserStock(result);
      } catch (error) {
        console.error("❌ Failed to retrieve stocks:", error);
        setUserStock(null);
      }
    };

    getUserStock();
  }, [user, symbol, baseUrl]);

  return (
    <div className="flex justify-center">
      <div className="mt-10">
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <AMRNChart stockData={stockData as any} symbol={symbol as string} />
        )}

        <div className="flex items-center flex-col">
          <ul className="flex w-1/2 justify-evenly text-sm text-gray-500">
            {rangeIntervalPairs.map((pair, index) => (
              <li
                key={index}
                onClick={() => {
                  setRange(pair.range);
                  setInterval(pair.interval);
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
          <div className="flex items-center flex-col mt-8 px-6 text-gray-700">
            <h1 className="text-xl font-semibold mb-2">About {symbol}</h1>
            <p className="text-start max-w-3xl text-sm ">
              {companyData.data.assetProfile.longBusinessSummary}
            </p>

            <div className="flex w-[80%] justify-evenly py-4">
              <div>
                <h2>CEO</h2>
                <h2>
                  {companyData.data.assetProfile.companyOfficers[0].name.slice(
                    3,
                    companyData.data.assetProfile.companyOfficers[0].name.length
                  )}
                </h2>
              </div>
              <div>
                <h2>Employees</h2>
                <h2>{companyData.data.assetProfile.fullTimeEmployees}</h2>
              </div>
              <div>
                <h2>HQ</h2>
                <h2>
                  {companyData.data.assetProfile.city},{" "}
                  {companyData.data.assetProfile.state},{" "}
                  {companyData.data.assetProfile.country}
                </h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock;