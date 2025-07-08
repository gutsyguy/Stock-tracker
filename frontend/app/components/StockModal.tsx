import { useEffect, useState } from "react"
import { AlpacaBar, AlpacaStockDataResponse } from "../interfaces/types"

const StockModal = ({stockData, symbol }:{stockData:AlpacaStockDataResponse, symbol:string}) =>{
    const [purchaseOption, setPurchaseOption] = useState<string>("shares")
    const [shares, setShares] = useState<string>("");
    const [dollars, setDollars] = useState<string>("");
    const [marketPrice, setMarketPrice] = useState<number>(0)
    
    // setMarketPrice(stockData.data[symbol][symbol].)
    //@ts-ignore
    const bars: AlpacaBar[] | undefined = stockData?.data?.bars?.[symbol]?.[symbol];

    useEffect(() => {
      if (bars && bars.length > 0) {
        setMarketPrice(bars[bars.length - 1].c);
      }
    }, [bars]);

    const [optionSelection, setOptionSelection] = useState<string>("save")

    useEffect(() => {
        console.log(purchaseOption)
    }, [purchaseOption])

    const dollarsNumber = Number(dollars);
    const sharesNumber = Number(shares);

    return(
        <div className="fixed top-0 right-0 h-full flex items-center justify-end pr-8 z-50">
            <div className="bg-white shadow-2xl rounded-lg h-[70vh] flex flex-col justify-evenly p-8">
                <div className="flex justify-evenly">
                    <h1
                        className={`text-center text-md font-bold mb-4 hover:underline ${optionSelection === "save" ? "text-blue-400" : ""}`}
                        onMouseDown={() => setOptionSelection("save")}
                    >
                        Save {symbol} Stock
                    </h1>
                    <h1
                        className={`text-center text-md font-bold mb-4 hover:underline ${optionSelection === "delete" ? "text-blue-400" : ""}`}
                        onMouseDown={() => setOptionSelection("delete")}
                    >
                        Delete {symbol} Stock
                    </h1>
                </div>
                <div className="flex flex-1 flex-row justify-evenly items-center gap-8">
                    <div className="flex flex-col justify-evenly h-full gap-6 flex-1">
                        <h2>Bought in</h2>
                        {
                            purchaseOption == "dollars" ?
                            <div>
                                <h2>Dollars</h2>
                            </div>
                            :
                            <div>
                                <h2>Shares</h2>
                            </div>
                        }
                        

                        {
                            purchaseOption == "shares" ? 
                            <h2>Market Price</h2> : ""
                        }
                        {
                            purchaseOption == "dollars" ? 
                            <h2>Estimated Shares</h2> :
                            <h2>Estimated Cost</h2>
                        }
                        
                    </div>
                    <div className="flex flex-col justify-evenly h-full gap-6 flex-1">
                        <select className="border border-gray-400 w-full" name="" value={purchaseOption} id="" onChange={(e:any) => setPurchaseOption(e.target.value)}>
                            <option value="shares">Shares</option>
                            <option value="dollars">Dollars</option>
                        </select>
                        <div>
                            {
                                purchaseOption == "dollars" ? 
                                <div>
                                    <input className="border border-gray-400" type="number" placeholder="0" value={dollars} onChange={(e) => setDollars(e.target.value)} />
                                </div>:
                                <div>
                                    <input className="border border-gray-400" type="number" placeholder="0" value={shares} onChange={(e) => setShares(e.target.value)} />
                                </div>
                            }
                        </div>
                        {
                            purchaseOption == "shares" ? 
                            <h2>{marketPrice}</h2> : ""
                        }
                        {
                            purchaseOption == "dollars" ?
                            <h2>{dollarsNumber/marketPrice}</h2>:
                            <h2>{sharesNumber * marketPrice}</h2>
                        }
                    </div>
                </div>
                <button className="mt-8 py-2 px-6 bg-blue-600 text-white rounded-lg self-center">Review Stock</button>
            </div>
        </div>
    )
}

export default StockModal