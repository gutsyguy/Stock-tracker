import { ChangeEvent, useEffect, useState } from "react";
import { SearchResults } from "../interfaces/types";
import Image from "next/image";

const SearchBar = () => {
  const [search, setSearch] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [focus, setFocus] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<SearchResults | null>(null);

  useEffect(() => {
    console.log(stock);
  }, [stock]);

  useEffect(() => {
    if (!search) return;
    const fetchStockData = async () => {
      try {
        const response = await fetch(
          `/api/autocomplete/${encodeURIComponent(search)}`
        );
        const data = await response.json();

        setFilteredData(data);
        console.log(filteredData);
      } catch (error) {
        console.error("Failed to fetch autocomplete data", error);
      }
    };

    fetchStockData();
  }, [search]);

  return (
    <div>
      <div className="flex flex-row border border-black">
        <Image src={"/Search.svg"} alt="20" width={20} height={20} />
        <input
          className=" outline-none w-[30vw]"
          type="text"
          placeholder="Search"
          value={search}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />
      </div>
      {filteredData && (
        <ul className="text-black">
          {filteredData.data.quotes.map((item: any) => (
            // <SearchResult onChange={setStock()} item={item} key={item.symbol} />
            <div
              className="flex flex-row hover:bg-gray-200"
              onClick={() => setStock(item.symbol)}
            >
              <h1 className="min-w-[10vw]">{item.symbol}</h1>
              <h2>{item.shortname}</h2>
            </div>
          ))}
        </ul>
      )}
      {!filteredData && focus && (
        <div>
          <h1>Stocks</h1>
        </div>
      )}
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
