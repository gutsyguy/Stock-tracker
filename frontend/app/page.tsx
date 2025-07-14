"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import StockDisplay from "./components/StockDisplay";

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

  return (
    <div className="flex justify-center">
      {isAuthenticated ? (
        <div>
          <h1>Owned Stocks</h1>
          {
            stocks.map((stock) => (
              <div key={stock.symbol}>
                <StockDisplay
                  symbol={stock.symbol}
                  shares={stock.shares}
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
