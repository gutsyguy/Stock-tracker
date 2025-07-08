// File: /app/api/getStock/route.ts
import { AlpacaBar, AlpacaStockDataResponse } from "@/app/interfaces/types"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const RESOLUTION_MAP: Record<string, string> = {
  "1": "1Min",
  "5": "5Min",
  "15": "15Min",
  "30": "30Min",
  "60": "1Hour",
  "D": "1Day",
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const symbol = searchParams.get("symbol") || "AAPL"
  const resolutionKey = searchParams.get("resolution") || "D"
  const resolution = RESOLUTION_MAP[resolutionKey] || "1Day"

  const now = new Date()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(now.getMonth() - 6)

  const startISO = sixMonthsAgo.toISOString()
  const endISO = now.toISOString()

  const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=${resolution}&limit=1000&adjustment=raw&feed=sip&sort=asc`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
          "APCA-API-KEY-ID": process.env.ALPACA_API!,
          "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET!
      },
    })

    console.log(process.env.ALPACA_API)
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
