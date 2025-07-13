"use client";

import AMRNChart from "./components/AMRNChart";
import SearchBar from "./components/SearchBar";
import { ChangeEvent, useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import StockDisplay from "./components/StockDisplay";
import { AlpacaStockDataResponse } from "./interfaces/types"; 

export interface UserStock {
  email: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [stocks, setStocks] = useState<UserStock[]>([])

  useEffect(() => {
    const getAllStocks = async () =>{
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/api/stock/all?email=${user?.email}`, {
            method: "GET",
            // headers: {
            //     "Content-Type": "application/json",
            // },
        });

        const result = await response.json();
        console.log("✅ Retrieved:", result);
        
        setStocks(result)
        
    } catch (error) {
        console.error("❌ Failed to retrieve stocks:", error);
    } 
  }
  getAllStocks()
  },[user])

  // useEffect(() => {
  //   const fetchCharts = async () => {
  //     const newChartData: { [symbol: string]: AlpacaStockDataResponse } = {};
  //     await Promise.all(
  //       stocks.map(async (stock) => {
  //         const res = await fetch(`/api/getStock?symbol=${stock.symbol}&range=1d&interval=5m`);
  //         const data = await res.json();
  //         newChartData[stock.symbol] = data;
  //       })
  //     );
  //     setChartData(newChartData);
  //   };
  //   if (stocks.length > 0) fetchCharts();
  // }, [stocks]);

  return (
    <div className="flex justify-center">
      {isAuthenticated ? (
        <div>
          <h1>Owned Stocks</h1>
          {
            stocks.map((stock, index) => (
              <div key={stock.symbol}>
                <StockDisplay
                  symbol={stock.symbol}
                  shares={stock.shares}
                  marketPrice={stock.currentPrice}
                  purchasePrice={stock.purchasePrice}
                />
              </div>
            ))
          } 
          
        </div>
      ) : (
        <div>Please sign in</div>
      )}
    </div>
  );
}
