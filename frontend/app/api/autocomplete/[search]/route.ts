// app/api/autocomplete/[search]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { search: string } }
) {
  const { search } = params;

  const url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com";
  
  try {
    const res = await fetch(`${url}/auto-complete?region=US&q=${search}`, {
      headers: {
        'x-rapidapi-key': `${process.env.rapidapiKey}`,
		    'x-rapidapi-host': `${process.env.rapidapiHost}` 
      }
    });

    const data = await res.json();
    return NextResponse.json({ data });


  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch autocomplete data' }, { status: 500 });
  }
}
