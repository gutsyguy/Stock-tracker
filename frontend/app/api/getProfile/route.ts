import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { RAPIDAPI_KEY, RAPIDAPI_HOST } from '@/app/environment/environment'


export const dynamic = 'force-static'
 
export async function GET() {
    const url="apidojo-yahoo-finance-v1.p.rapidapi.com"
    const symbol = "SPY"
    const range = "1y"
    const interval = "1mo"
    const res = await fetch(`https://${url}/stock/v3/get-profile?symbol=${symbol}&region=US&lang=en-US`, {
        headers: {
		        	}
    })
  const data = await res.json()
 
  return Response.json({ data })
}
