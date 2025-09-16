"use client";


export interface UserStock {
  email: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

export default function Home() {

  return (
    <div className="flex justify-center">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Welcome to Stock Tracker</h1>
          <p className="text-gray-600">Please sign in to view your portfolio</p>
        </div>
    </div>
  );
}
