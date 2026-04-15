import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const symbol = searchParams.get("symbol");
  const symbols = searchParams.get("symbols");

  let url;
  if (symbols) {
    url = `${process.env.ALPACA_URL!}/v2/stocks/quotes/latest?feed=iex&symbols=${encodeURIComponent(symbols)}`;
  } else {
    url = `${process.env.ALPACA_URL!}/v2/stocks/${encodeURIComponent(symbol || 'AAPL')}/quotes/latest?feed=iex`;
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "APCA-API-KEY-ID": process.env.ALPACA_API!,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET!,
      },
      next: { revalidate: 15 } // 15-second cache
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data from Alpaca" },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (symbols) {
      if (!data.quotes) {
        return NextResponse.json({ error: "No quotes data available", data: null }, { status: 404 });
      }
      return NextResponse.json({ data: { quotes: data.quotes } });
    } else {
      if (!data.quote) {
        return NextResponse.json({ error: "No quote data available", data: null }, { status: 404 });
      }
      return NextResponse.json({ data: { quote: data.quote } });
    }
  } catch (error) {
    console.error("Alpaca API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
}

