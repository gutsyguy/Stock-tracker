import { AlpacaStockDataResponse } from "@/app/interfaces/types"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const rangeIntervalToResolution: Record<string, string> = {
  "1d_5m": "5Min",
  "5d_15m": "15Min",
  "1mo_1d": "1Day",
  "3mo_1d": "1Day",
  "6mo_1wk": "1Week",
  "1y_1wk": "1Week",
  "2y_1wk": "1Week",
  "5y_1mo": "1Month",
  "10y_1mo": "1Month",
};

const rangeToDays: Record<string, number> = {
  "1d": 1,
  "5d": 5,
  "1mo": 30,
  "3mo": 90,
  "6mo": 180,
  "1y": 365,
  "2y": 730,
  "5y": 1825,
  "10y": 3650,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const symbols = searchParams.get("symbols") || searchParams.get("symbol") || "AAPL"
  const range = searchParams.get("range") || "6mo";
  const interval = searchParams.get("interval") || "1wk";
  const resolutionKey = `${range}_${interval}`;
  const resolution = rangeIntervalToResolution[resolutionKey] || "1Day";

  let start: Date;
  let end: Date = new Date();

  if (range === "1d") {
    start = new Date();
    start.setDate(start.getDate() - 5);
  } else {
    const days = rangeToDays[range] || 180;
    start = new Date(end);
    start.setDate(end.getDate() - days);
  }

  const startISO = start.toISOString();
  const endISO = end.toISOString();

  const url = `${process.env.ALPACA_URL!}/v2/stocks/bars` +
  `?symbols=${encodeURIComponent(symbols)}` +
  `&timeframe=${encodeURIComponent(resolution)}` +
  `&start=${encodeURIComponent(startISO)}` +
  `&end=${encodeURIComponent(endISO)}` +
  `&limit=1000&adjustment=raw&feed=iex&sort=asc`;
  
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
          "APCA-API-KEY-ID": process.env.ALPACA_API!,
          "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET!
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data from Alpaca" },
        { status: res.status }
      )
    }

    const data = await res.json()

    if (!data.bars || Object.keys(data.bars).length === 0) {
      return NextResponse.json(
        { error: "No chart data available", data: null },
        { status: 404 }
      )
    }

    if (range === "1d") {
      Object.keys(data.bars).forEach((sym) => {
        const barsArray = data.bars[sym];
        if (barsArray.length > 0) {
           const lastBarTime = new Date(barsArray[barsArray.length - 1].t);
           const lastDayString = lastBarTime.toDateString();
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           data.bars[sym] = barsArray.filter((b: any) => new Date(b.t).toDateString() === lastDayString);
        }
      });
    }

    return NextResponse.json({ data:{bars: data.bars} } as AlpacaStockDataResponse)
  } catch (error) {
    console.error("Alpaca API Error:", error)
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    )
  }
}
