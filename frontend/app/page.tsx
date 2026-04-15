"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import AuthButton from "./components/AuthButton";
import PortfolioAnalytics from "./components/PortfolioAnalytics";

export interface UserStock {
  email: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [portfolio, setPortfolio] = useState<UserStock[]>([]);
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPortfolio = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/portfolio");
        if (res.ok) {
          const data = await res.json();
          setPortfolio(data.portfolio || []);
          setCashBalance(data.cashBalance || 0);
        }
      } catch (err) {
        console.error("Failed to load portfolio", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortfolio();
  }, [isAuthenticated, user]);

  return (
    <div className="flex justify-center mt-6">
      <div className="text-center py-10 w-full">
        <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">Stock Tracker</h1>
        {isAuthenticated ? (
          <div className="w-full flex flex-col items-center mt-6">
            <p className="text-gray-500 font-medium tracking-wide">Welcome back, {user?.name}</p>
            {isLoading ? (
              <p className="mt-8 text-gray-400 animate-pulse">Loading your dashboard...</p>
            ) : (
              <PortfolioAnalytics portfolio={portfolio} cashBalance={cashBalance} />
            )}
          </div>
        ) : (
          <div className="mt-16">
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Please sign in to access your $100,000 Paper Trading balance and start building your portfolio.</p>
            <div className="flex justify-center">
              <AuthButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
