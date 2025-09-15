"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import StockDisplay from "./components/StockDisplay";
import Link from "next/link";
import { apiClient, PortfolioItem } from "./services/api";

export interface UserStock {
  email: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPortfolio = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.getUserPortfolio(user.id);
        
        if (response.error) {
          setError(response.error);
          return;
        }

        if (response.data) {
          setPortfolio(response.data.portfolio ?? []);
        }
        
      } catch (error) {
        console.error("❌ Failed to retrieve portfolio:", error);
        setError("Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    };

    getPortfolio();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      {isAuthenticated ? (
        <div>
          <h1 className="text-2xl font-bold mb-6">Your Portfolio</h1>
          {portfolio.length === 0 ? (
            <div className="text-gray-500 text-center">
              <p>No stocks in your portfolio yet.</p>
              <p>Search for stocks to start building your portfolio!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.map((item) => (
                <Link href={`/stock/${item.stock.symbol}`} key={item.stock.id}>
                  <StockDisplay
                    symbol={item.stock.symbol}
                    shares={item.netQuantity}
                    purchasePrice={item.avgBuyPrice}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Stock Tracker</h1>
          <p className="text-gray-600">Please sign in to view your portfolio</p>
        </div>
      )}
    </div>
  );
}
