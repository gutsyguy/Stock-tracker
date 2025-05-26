import { NextResponse } from 'next/server';
import { RAPIDAPI_KEY, RAPIDAPI_HOST } from '@/app/environment/environment'

export async function GET(
  request: Request,
  { params }: { params: { search: string } }
) {
  const { search } = params;

  const url = process.env.url 
  
  try {
    const res = await fetch(`${url}/auto-complete?region=US&q=${search}`, {
      headers: {
       'x-rapidapi_key': process.env.RAPIDAPI_KEY!,
      'x-rapidapi_host': process.env.RAPIDAPI_HOST!,
      }
    });

    const data = await res.json();
    return NextResponse.json({ data });


  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch autocomplete data' }, { status: 500 });
  }
}
