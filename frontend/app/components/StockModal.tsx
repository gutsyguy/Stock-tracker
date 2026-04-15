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

  const bars: AlpacaBar[] | undefined =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stockData?.data?.bars as any)?.[symbol]?.[symbol];

  useEffect(() => {
    if (bars && bars.length > 0) {
      setMarketPrice(bars[bars.length - 1].c);
    }
  }, [bars]);

  const [optionSelection, setOptionSelection] = useState<string>("save");

  useEffect(() => {
    const getUserStock = async () => {
      if (!user?.email) {
        setUserStock(null);
        return;
      }

      try {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
          const data = await res.json();
          const stock = data.portfolio.find((s: UserStock) => s.symbol === symbol);
          setUserStock(stock || null);
        } else {
          setUserStock(null);
        }
      } catch (error) {
        console.error("❌ Failed to retrieve user stock:", error);
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
      console.error("User not authenticated or no stock to sell");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/portfolio?symbol=${symbol}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        console.log("✅ All shares sold");
        setUserStock(null);
        window.location.reload();
      } else {
        console.error("Failed to sell all shares");
      }
    } catch (error) {
      console.error("❌ Error selling all shares:", error);
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

    if (userStock && finalShares > userStock.shares) {
      console.error("Cannot sell more shares than you own");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          transaction_type: "SELL",
          quantity: finalShares,
          price: marketPrice,
        }),
      });

      if (res.ok) {
        console.log("✅ Stock sold");
        window.location.reload();
      } else {
        console.error("Failed to sell stock");
      }
    } catch (error) {
      console.error("❌ Error selling stock:", error);
    } finally {
      setIsSubmitting(false);
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
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          transaction_type: "BUY",
          quantity: finalShares,
          price: marketPrice,
        }),
      });

      if (res.ok) {
        console.log("✅ Stock added to portfolio");
        window.location.reload();
      } else {
        console.error("Failed to save stock");
      }
    } catch (error) {
      console.error("❌ Error saving stock:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full text-black flex items-center justify-end pr-8 z-50">
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPurchaseOption(e.target.value)}
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPurchaseOption(e.target.value)}
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
