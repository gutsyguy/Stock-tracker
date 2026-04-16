import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get('symbol') || 'SPY').trim();

  try {
    const finnhubKey = process.env.FINNEON_API_KEY;
    if (!finnhubKey) {
      throw new Error("FINNEON_API_KEY is not defined");
    }

    const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(symbol)}&token=${finnhubKey}`, {
      next: { revalidate: 60 } 
    });

    if (!res.ok) {
        throw new Error(`Finnhub returned ${res.status}`);
    }

    const data = await res.json();
    
    const mappedQuotes = (data.result || []).map((item: any) => ({
        symbol: item.displaySymbol || item.symbol,
        shortname: item.description
    }));

    return NextResponse.json({ data: { quotes: mappedQuotes.slice(0, 15) } });
  } catch (err) {
    console.error("Finnhub autocomplete error:", err);
    return NextResponse.json({ data: { quotes: [] } });
  }
}