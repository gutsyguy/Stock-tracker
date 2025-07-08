// File: /app/api/getStock/route.ts
import { AlpacaBar, AlpacaStockDataResponse } from "@/app/interfaces/types"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Map UI intervals to Alpaca timeframes
const INTERVAL_MAP: Record<string, string> = {
  "5m": "5Min",
  "15m": "15Min",
  "30m": "30Min",
  "1d": "1Day",
  "1wk": "1Week",
  "1mo": "1Month",
}

// Map UI ranges to ISO date offsets
const RANGE_TO_MONTHS: Record<string, number> = {
  "1d": 0,
  "5d": 0,
  "1mo": 1,
  "3mo": 3,
  "6mo": 6,
  "1y": 12,
  "2y": 24,
  "5y": 60,
  "10y": 120,
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const symbol = searchParams.get("symbol") || "AAPL"
  const range = searchParams.get("range") || "6mo"
  const interval = searchParams.get("interval") || "1wk"

  // Calculate start date based on range
  const now = new Date()
  let startISO: string
  if (range === "1d" || range === "5d") {
    // For 1d and 5d, use days
    const days = range === "1d" ? 1 : 5
    const start = new Date(now)
    start.setDate(now.getDate() - days)
    startISO = start.toISOString()
  } else {
    // For other ranges, use months
    const months = RANGE_TO_MONTHS[range] || 6
    const start = new Date(now)
    start.setMonth(now.getMonth() - months)
    startISO = start.toISOString()
  }
  const endISO = now.toISOString()

  // Map interval to Alpaca timeframe
  const timeframe = INTERVAL_MAP[interval] || "1Day"

  const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=${timeframe}&start=${startISO}&end=${endISO}&limit=1000&adjustment=raw&feed=sip&sort=asc`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "APCA-API-KEY-ID": process.env.ALPACA_API!,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET!,
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data from Alpaca" },
        { status: res.status }
      )
    }

    const data = await res.json()

    if (!data.bars || data.bars.length === 0) {
      return NextResponse.json(
        { error: "No chart data available", data: null },
        { status: 404 }
      )
    }

    return NextResponse.json({ data:{bars:{[symbol]: data.bars}} } as AlpacaStockDataResponse)
  } catch (error) {
    console.error("Alpaca API Error:", error)
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    )
  }
}
