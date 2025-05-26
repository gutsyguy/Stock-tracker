"use client";

import AMRNChart from "./components/AMRNChart";
import SearchBar from "./components/SearchBar";
import { ChangeEvent, useEffect, useState } from "react";
import { StockData } from "./interfaces/types";

export default function Home() {
  return (
    <div className="flex justify-center bg-white text-black min-h-screen">
      <div className="flex flex-col w-[50vw]">
        <SearchBar />
        <h1>Search for stocks</h1>
      </div>
    </div>
  );
}
