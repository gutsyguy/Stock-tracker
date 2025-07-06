// File: /app/api/getProfile/route.ts

// import { RAPIDAPI_HOST, RAPIDAPI_KEY } from '@/app/environment/environment'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const symbol = searchParams.get('symbol') || 'SPY'
  const url = 'apidojo-yahoo-finance-v1.p.rapidapi.com'

  try {
    const res = await fetch(`https://${url}/stock/v3/get-profile?symbol=${symbol}&region=US&lang=en-US`, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST!,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: res.status })
    }

    const data = await res.json()

    if (!data) {
      return NextResponse.json({
        error: 'No profile data available for this symbol',
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
