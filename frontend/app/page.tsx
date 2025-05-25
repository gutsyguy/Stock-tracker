"use client";

import AMRNChart from "./components/AMRNChart";
import SearchBar from "./components/SearchBar";
import { ChangeEvent, useEffect, useState } from "react";
import { StockData } from "./interfaces/types";

export default function Home() {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [search, setSearch] = useState("");
  const [symbol, setSymbol] = useState("");

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch("/api/getStock");
        const data = await response.json();
        console.log(data);
        setStockData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div className="bg-white text-black min-h-screen">
      <div className="flex justify-center w-[100%]">
        <SearchBar />
      </div>
      {stockData && <AMRNChart stockData={stockData} />}
    </div>
  );
}
