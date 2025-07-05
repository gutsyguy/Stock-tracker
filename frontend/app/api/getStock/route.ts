// File: /app/api/chart/route.ts

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const symbol = searchParams.get('symbol') || 'SPY'
  const range = searchParams.get('range') || '1y'
  const interval = searchParams.get('interval') || '1mo'

  const url = "apidojo-yahoo-finance-v1.p.rapidapi.com"

  try {
    const res = await fetch(`https://${url}/stock/v3/get-chart?interval=${interval}&region=US&symbol=${symbol}&range=${range}&includePrePost=false&useYfid=true&includeAdjustedClose=true&events=capitalGain%2Cdiv%2Csplit`, {
      headers: {
              },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: res.status })
    }

    const data = await res.json()
    
    // Check if the response has valid chart data
    if (!data || !data.chart || !data.chart.result || data.chart.result.length === 0) {
      return NextResponse.json({ 
        error: 'No chart data available for this time range',
        data: null 
      }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      data: null 
    }, { status: 500 })
  }
}

