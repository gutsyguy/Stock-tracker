"use client";

import { useAuth } from "./contexts/AuthContext";
import AuthButton from "./components/AuthButton";

export interface UserStock {
  email: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="flex justify-center">
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Welcome to Stock Tracker</h1>
        {isAuthenticated ? (
          <div>
            <p className="text-gray-600 mb-4">Welcome back, {user?.name}!</p>
            <p className="text-gray-600">Your portfolio is ready to view.</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">Please sign in to view your portfolio</p>
            <div className="flex justify-center">
              <AuthButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
