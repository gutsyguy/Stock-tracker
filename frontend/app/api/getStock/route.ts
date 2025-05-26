// File: /app/api/chart/route.ts

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const symbol = searchParams.get('symbol') || 'SPY'
  const range = searchParams.get('range') || '1y'
  const interval = searchParams.get('interval') || '1mo'

  const url = process.env.url

  const res = await fetch(`https://${url}/stock/v3/get-chart?interval=${interval}&region=US&symbol=${symbol}&range=${range}&includePrePost=false&useYfid=true&includeAdjustedClose=true&events=capitalGain%2Cdiv%2Csplit`, {
    headers: {
      'x-rapidapi_key': process.env.RAPIDAPI_KEY!,
      'x-rapidapi_host': process.env.RAPIDAPI_HOST!,
    },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json({ data })
}

