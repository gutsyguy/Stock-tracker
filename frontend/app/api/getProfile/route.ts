import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "TSLA";

  try {
    const finnhubKey = process.env.FINNEON_API_KEY;
    if (!finnhubKey) {
      throw new Error("FINNEON_API_KEY is not defined");
    }

    const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${finnhubKey}`, {
      next: { revalidate: 3600 } // Cache this for an hour to keep API limits safe
    });
    
    if (!res.ok) {
      throw new Error(`Finnhub returned ${res.status}`);
    }

    const data = await res.json();
    
    // Finnhub returns an empty object {} if symbol isn't found
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Finnhub getProfile Error:", error);
    return NextResponse.json({ error: error ? String(error) : "Unknown error" }, { status: 500 });
  }
}
