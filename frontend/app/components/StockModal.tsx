import { useEffect, useState } from "react";
import {
  AlpacaBar,
  AlpacaStockDataResponse,
  UserStock,
} from "../interfaces/types";
import { useAuth } from "../contexts/AuthContext";

const StockModal = ({
  stockData,
  symbol,
}: {
  stockData: AlpacaStockDataResponse;
  symbol: string;
}) => {
  const { user } = useAuth();
  const [purchaseOption, setPurchaseOption] = useState<string>("shares");
  const [shares, setShares] = useState<string>("");
  const [dollars, setDollars] = useState<string>("");
  const [marketPrice, setMarketPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userStock, setUserStock] = useState<null | UserStock>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  //@ts-ignore
  const bars: AlpacaBar[] | undefined =
    //@ts-ignore
    stockData?.data?.bars?.[symbol]?.[symbol];

  useEffect(() => {
    if (bars && bars.length > 0) {
      setMarketPrice(bars[bars.length - 1].c);
    }
  }, [bars]);

  const [optionSelection, setOptionSelection] = useState<string>("save");

  useEffect(() => {
    const getUserStock = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/api/stock/get?email=${user?.email}&symbol=${symbol}`,
          { method: "GET" }
        );

        if (!response.ok) {
          console.error("❌ HTTP error:", response.status);
          setUserStock(null);
          return;
        }

        const result = await response.json();

        // Optional: check if result is valid object
        if (!result || Object.keys(result).length === 0) {
          setUserStock(null);
          return;
        }
        console.log(result);

        setUserStock(result);
      } catch (error) {
        console.error("❌ Failed to retrieve stocks:", error);
        setUserStock(null);
      }
    };

    getUserStock();
  }, [user, symbol]);

  useEffect(() => {
    console.log(purchaseOption);
  }, [purchaseOption]);

  const dollarsNumber = Number(dollars);
  const sharesNumber = Number(shares);

  const getFinalShares = (): number => {
    if (purchaseOption === "dollars") {
      return dollarsNumber / marketPrice;
    } else {
      return sharesNumber;
    }
  };

  const sellAllShares = async () => {
    if (!user?.email || !userStock) {
      console.error("User not authenticated or no stock to delete");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${baseUrl}/api/stock/delete?email=${user.email}&symbol=${symbol}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.text();
      console.log("✅ All shares sold:", result);
      setUserStock(null);
    } catch (error) {
      console.error("❌ Error deleting stock:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSellStock = async () => {
    if (!user?.email) {
      console.error("User not authenticated");
      return;
    }

    const finalShares = getFinalShares();

    if (finalShares <= 0) {
      console.error("Invalid shares amount");
      return;
    }

    setIsSubmitting(true);

    if (userStock && finalShares < userStock.shares) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/api/stock/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock: {
              email: user.email,
              symbol: symbol,
              shares: userStock.shares - finalShares,
            },
          }),
        });

        const result = await response.text();
        console.log("✅ Stock updated:", result);
      } catch (error) {
        console.error("❌ Error updating stock:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        const response = await fetch(
          `${baseUrl}/api/stock/delete?email=${user?.email}&symbol=${symbol}"`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.text();
        console.log("✅ Stock updated:", result);
      } catch (error) {
        console.error("❌ Error updating stock:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCreateStock = async () => {
    if (!user?.email) {
      console.error("User not authenticated");
      return;
    }

    const finalShares = getFinalShares();

    if (finalShares <= 0) {
      console.error("Invalid shares amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (userStock) {
        // Update: add new shares to existing
        const updatedShares =
          Math.round((userStock.shares + finalShares) * 100) / 100;

        const response = await fetch(`${baseUrl}/api/stock/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock: {
              email: user.email,
              symbol: symbol,
              shares: updatedShares,
            },
          }),
        });

        const result = await response.text();
        console.log("✅ Stock updated:", result);
      } else {
        // Create: new stock entry
        const response = await fetch(`${baseUrl}/api/stock/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock: {
              email: user.email,
              symbol: symbol,
              shares: Math.round(finalShares * 100) / 100,
              purchasePrice: marketPrice,
              currentPrice: marketPrice,
            },
          }),
        });

        const result = await response.text();
        console.log("✅ Stock created:", result);
      }
    } catch (error) {
      console.error("❌ Error saving stock:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full flex items-center justify-end pr-8 z-50 w-[100vw]">
      <div className="bg-white shadow-2xl rounded-lg h-[70vh] flex flex-col justify-evenly p-8">
        <div className="flex justify-evenly">
          <h1
            className={`text-center text-md font-bold mb-4 hover:underline ${
              optionSelection === "save" ? "text-blue-400" : ""
            }`}
            onMouseDown={() => setOptionSelection("save")}
          >
            Save {symbol} Stock
          </h1>
          {userStock ? (
            <h1
              className={`text-center text-md font-bold mb-4 hover:underline ${
                optionSelection === "delete" ? "text-blue-400" : ""
              }`}
              onMouseDown={() => setOptionSelection("delete")}
            >
              Delete {symbol} Stock
            </h1>
          ) : (
            <></>
          )}
        </div>
        {optionSelection === "save" ? (
          <div>
            <div className="flex flex-1 flex-row justify-evenly items-center gap-8">
              <div className="flex flex-col justify-evenly h-full gap-6 flex-1">
                <h2>Bought in</h2>
                {purchaseOption == "dollars" ? (
                  <div>
                    <h2>Dollars</h2>
                  </div>
                ) : (
                  <div>
                    <h2>Shares</h2>
                  </div>
                )}

                {purchaseOption == "shares" ? <h2>Market Price</h2> : ""}
                {purchaseOption == "dollars" ? (
                  <h2>Estimated Shares</h2>
                ) : (
                  <h2>Estimated Cost</h2>
                )}
              </div>
              <div className="flex flex-col justify-evenly h-full gap-6 flex-1">
                <select
                  className="border border-gray-400 w-full"
                  name=""
                  value={purchaseOption}
                  id=""
                  onChange={(e: any) => setPurchaseOption(e.target.value)}
                >
                  <option value="shares">Shares</option>
                  <option value="dollars">Dollars</option>
                </select>
                <div>
                  {purchaseOption == "dollars" ? (
                    <div>
                      <input
                        className="border border-gray-400"
                        type="number"
                        placeholder="0"
                        value={dollars}
                        onChange={(e) => setDollars(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        className="border border-gray-400"
                        type="number"
                        placeholder="0"
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                {purchaseOption == "shares" ? <h2>{marketPrice}</h2> : ""}
                {purchaseOption == "dollars" ? (
                  <h2>{dollarsNumber / marketPrice}</h2>
                ) : (
                  <h2>{sharesNumber * marketPrice}</h2>
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <button
                className="mt-8 py-2 px-6 bg-blue-600 text-white rounded-lg self-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleCreateStock}
                disabled={isSubmitting || !user?.email}
              >
                {isSubmitting ? "Creating..." : "Review Stock"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-1 flex-row justify-evenly items-center gap-8">
              <div className="flex flex-col justify-evenly h-full gap-6 flex-1">
                <h2>Sell in</h2>
                {purchaseOption == "dollars" ? (
                  <div>
                    <h2>Dollars</h2>
                  </div>
                ) : (
                  <div>
                    <h2>Shares</h2>
                  </div>
                )}

                {purchaseOption == "shares" ? <h2>Market Price</h2> : ""}
                {purchaseOption == "dollars" ? (
                  <h2>Estimated Quantity</h2>
                ) : (
                  <h2>Estimated Credit</h2>
                )}
              </div>
              <div className="flex flex-col justify-evenly h-full gap-6 flex-1">
                <select
                  className="border border-gray-400 w-full"
                  name=""
                  value={purchaseOption}
                  id=""
                  onChange={(e: any) => setPurchaseOption(e.target.value)}
                >
                  <option value="shares">Shares</option>
                  <option value="dollars">Dollars</option>
                </select>
                <div>
                  {purchaseOption == "dollars" ? (
                    <div>
                      <input
                        className="border border-gray-400"
                        type="number"
                        placeholder="0"
                        value={dollars}
                        onChange={(e) => setDollars(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        className="border border-gray-400"
                        type="number"
                        placeholder="0"
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                {purchaseOption == "shares" ? <h2>{marketPrice}</h2> : ""}
                {purchaseOption == "dollars" ? (
                  <h2>{dollarsNumber / marketPrice}</h2>
                ) : (
                  <h2>{sharesNumber * marketPrice}</h2>
                )}
              </div>
            </div>
            <div className="flex flex-row  justify-between">
              <button
                className="mt-8 py-2 px-6 bg-blue-600 text-white rounded-lg self-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleSellStock}
                disabled={isSubmitting || !user?.email}
              >
                {isSubmitting ? "Creating..." : "Review Stock"}
              </button>
              <button
                className="mt-8 py-2 px-6 bg-red-600 text-white rounded-lg self-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={sellAllShares}
                disabled={isSubmitting || !user?.email}
              >
                {isSubmitting ? "Creating..." : "Sell All Shares"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockModal;
