import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { headers } from 'next/headers'


export const dynamic = 'force-static'
 
export async function GET() {
    const url="apidojo-yahoo-finance-v1.p.rapidapi.com"
    const symbol = "SPY"
    const range = "1y"
    const interval = "1mo"
    const res = await fetch(`https://${url}/stock/v3/get-chart?interval=${interval}&region=US&symbol=${symbol}&range=${range}&includePrePost=false&useYfid=true&includeAdjustedClose=true&events=capitalGain%2Cdiv%2Csplit`, {
        headers: {
		    'x-rapidapi-key': `${process.env.rapidapiKey}`,
		    'x-rapidapi-host': `${process.env.rapidapiHost}` 
    	}
    })
  const data = await res.json()
 
  return Response.json({ data })
}
