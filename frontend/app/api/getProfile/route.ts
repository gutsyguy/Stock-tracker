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
          'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST!,
          // 'x-rapidapi-key': "5fc88df8a2msh2fabb3ffd664437p155b31jsna642614ab149",
          // 'x-rapidapi-host': "apidojo-yahoo-finance-v1.p.rapidapi.com"
		    }
    })
  const data = await res.json()
 
  return Response.json({ data })
}
