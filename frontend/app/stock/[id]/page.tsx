"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/app/components/SearchBar";
import AMRNChart from "@/app/components/AMRNChart";
import { useParams, useSearchParams, useRouter } from "next/navigation";
// import type { AlpacaStockDataResponse, FundProfileResponse } from "@/types";
import type { AlpacaStockDataResponse } from "@/app/interfaces/types";

const Stock = () => {
  const router = useRouter();

  const rangeIntervalPairs = [
    { range: "1d", interval: "5m" },
    { range: "5d", interval: "15m" },
    { range: "1mo", interval: "1d" },
    { range: "3mo", interval: "1d" },
    { range: "6mo", interval: "1wk" },
    { range: "1y", interval: "1wk" },
    { range: "2y", interval: "1wk" },
    { range: "5y", interval: "1mo" },
    { range: "10y", interval: "1mo" },
  ];

  const { id: symbol } = useParams();
  const searchParams = useSearchParams();
  const [range, setRange] = useState(searchParams.get("range") ?? "6mo");
  const [interval, setInterval] = useState(searchParams.get("interval") ?? "1wk");
  const [stockData, setStockData] = useState<AlpacaStockDataResponse | null>(null);
  // const [companyData, setCompanyData] = useState<FundProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // useEffect(() => {
  //   const fetchCompanyData = async () => {
  //     setIsLoading(true);
  //     setError(null);
  //     try {
  //       const response = await fetch(`/api/getProfile?symbol=${symbol}`);
  //       const data = await response.json();

  //       if (!response.ok || data.error) {
  //         throw new Error(data.error || "Failed to fetch company profile");
  //       }

  //       setCompanyData(data);
  //     } catch (error) {
  //       console.error(error);
  //       setError(error instanceof Error ? error.message : "An error occurred");
  //       setCompanyData(null);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchCompanyData();
  // }, [symbol]);

  return (
    <div>
      <div className="flex justify-center w-full mt-10">
        <div className="flex flex-col w-[50vw]">
          <SearchBar />
        </div>
      </div>

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
        <AMRNChart stockData={stockData} symbol={symbol as string} />
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
{/* 
      {companyData && (
        <div className="flex items-center flex-col ">
          <h1>About {companyData?.data.quoteSummary.result[0].fundProfile.family}</h1>
          <h2 className="w-[70%]">
            {companyData?.data.quoteSummary.result[0].summaryProfile.longBusinessSummary}
          </h2>
        </div>
      )} */}
    </div>
  );
};

export default Stock;
