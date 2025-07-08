import { NextResponse } from 'next/server';

import yahooFinance from 'yahoo-finance2'

export async function GET( request: Request){
    const { searchParams } = new URL(request.url)

    const symbol = searchParams.get('symbol') || 'SPY'
    try {

      const results = await yahooFinance.search(symbol)
    
    
        return NextResponse.json({ data: results });
    }
    catch(err){
      console.error(err)
    }

}