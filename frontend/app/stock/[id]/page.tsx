"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/app/components/SearchBar";
import AMRNChart from "@/app/components/AMRNChart";
import { StockData } from "@/app/interfaces/types";
import { useParams } from "next/navigation";

const Stock = () => {
  const symbol = useParams().id;
  const [stockData, setStockData] = useState<StockData | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch(
          `/api/getStock?symbol=${symbol}&range=${"1y"}&interval=${"1mo"}`
        );
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
    <div>
      <div className="flex justify-center w-[100%]">
        <SearchBar />
      </div>
      {stockData && <AMRNChart stockData={stockData} />}
    </div>
  );
};

export default Stock;
