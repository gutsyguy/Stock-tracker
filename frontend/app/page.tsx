"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import StockDisplay from "./components/StockDisplay";
import Link from "next/link";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load portfolio from localStorage for demo purposes
    const loadPortfolio = () => {
      setLoading(true);
      try {
        const savedPortfolio = localStorage.getItem(`portfolio_${user?.email}`);
        if (savedPortfolio) {
          setPortfolio(JSON.parse(savedPortfolio));
        }
      } catch (error) {
        console.error("Failed to load portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      loadPortfolio();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Welcome to Stock Tracker</h1>
          <p className="text-gray-600">Please sign in to view your portfolio</p>
        </div>
    </div>
  );
}
