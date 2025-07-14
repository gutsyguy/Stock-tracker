import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const symbol = searchParams.get("symbol") || "AAPL";

  const url = `${process.env.ALPACA_URL!}/v2/stocks/${encodeURIComponent(symbol)}/quotes/latest`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "APCA-API-KEY-ID": process.env.ALPACA_API!,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET!,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data from Alpaca" },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (!data.quote) {
      return NextResponse.json(
        { error: "No quote data available", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { quote: data.quote } });
  } catch (error) {
    console.error("Alpaca API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
