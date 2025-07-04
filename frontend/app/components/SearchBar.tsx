import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface ProcessedQuote {
  symbol: string;
  longname: string;
  exchange: string;
  type: string;
  sector?: string;
  industry?: string;
}

const SearchBar = () => {
  const [search, setSearch] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [focus, setFocus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<ProcessedQuote[] | null>(
    null
  );

  useEffect(() => {
    if (!search) {
      setFilteredData(null);
      return;
    }

    const fetchStockData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/autocomplete/${encodeURIComponent(search)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        const data = await response.json();
        console.log("API Response:", data);
        if (Array.isArray(data.data)) {
          setFilteredData(data.data);
        } else {
          console.error("Unexpected data format:", data);
          setFilteredData(null);
        }
      } catch (error) {
        console.error("Failed to fetch autocomplete data", error);
        setFilteredData(null);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchStockData, 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  return (
    <div className={focus ? "bg-gray-200 rounded-lg" : ""}>
      <div className="flex flex-row border border-black rounded-lg p-2">
        <Image
          src={"/Search.svg"}
          alt="Search"
          width={20}
          height={20}
          className="mr-2"
        />
        <input
          className="outline-none w-[30vw] bg-transparent"
          type="text"
          placeholder="Search stocks..."
          value={search}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />
      </div>
      <div className="z-10 relative">
        {isLoading && search && focus && (
          <div className="absolute w-full bg-white shadow-lg rounded-b-lg p-4">
            <p className="text-gray-500">Loading...</p>
          </div>
        )}
        {!isLoading && filteredData && focus && filteredData.length > 0 && (
          <ul className="absolute w-full bg-white shadow-lg rounded-b-lg">
            {filteredData.map((item: ProcessedQuote) => (
              <li key={item.symbol}>
                <Link
                  href={`/stock/${item.symbol}`}
                  className="flex flex-row p-2 hover:bg-gray-100"
                >
                  <h1 className="min-w-[10vw] font-semibold">{item.symbol}</h1>
                  <h2 className="text-gray-600">{item.longname}</h2>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!isLoading &&
          (!filteredData || filteredData.length === 0) &&
          focus &&
          search && (
            <div className="absolute w-full bg-white shadow-lg rounded-b-lg p-4">
              <h1 className="text-gray-500">No results found</h1>
            </div>
          )}
      </div>
    </div>
  );
};

const SearchResult = ({ item }: any, onChange: any) => {
  return (
    <div
      className="flex flex-row hover:bg-gray-200"
      onClick={() => onChange(item.symbol)}
    >
      <h1 className="min-w-[10vw]">{item.symbol}</h1>
      <h2>{item.shortname}</h2>
    </div>
  );
};

export default SearchBar;
