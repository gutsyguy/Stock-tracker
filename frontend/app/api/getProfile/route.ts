import { NextRequest, NextResponse } from 'next/server'
import yahooFinance from "yahoo-finance2";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "TSLA";


  try {
  const quoteSummary = await yahooFinance.quoteSummary(symbol, {
    modules: ["assetProfile"],
  });

    return NextResponse.json({ data: quoteSummary });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch company data" }, { status: 500 });
  }
}
