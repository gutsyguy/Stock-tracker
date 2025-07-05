import { NextResponse } from 'next/server';
import { RAPIDAPI_KEY, RAPIDAPI_HOST } from '@/app/environment/environment'

interface YahooQuote {
  symbol: string;
  longname?: string;
  shortname?: string;
  exchDisp: string;
  typeDisp: string;
  sector?: string;
  industry?: string;
}

interface ProcessedQuote {
  symbol: string;
  longname: string;
  exchange: string;
  type: string;
  sector?: string;
  industry?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { search: string } }
) {
  const { search } = params;

  const url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com";
  
  try {
    const res = await fetch(`${url}/auto-complete?region=US&q=${search}`, {
      headers: {
       'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST!,
      }
    });

    const data = await res.json();
    
    // Process the response to focus on company longnames
    const processedData = data.quotes?.map((quote: YahooQuote): ProcessedQuote => ({
      symbol: quote.symbol,
      longname: quote.longname || quote.shortname || '', // Fallback to shortname if longname is not available
      exchange: quote.exchDisp,
      type: quote.typeDisp,
      sector: quote.sector,
      industry: quote.industry
    })) || [];

    // Filter out items without a name and sort by relevance to search term
    const filteredData = processedData
      .filter((item: ProcessedQuote) => item.longname)
      .sort((a: ProcessedQuote, b: ProcessedQuote) => {
        const aMatch = a.longname.toLowerCase().includes(search.toLowerCase());
        const bMatch = b.longname.toLowerCase().includes(search.toLowerCase());
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });

    return NextResponse.json({ data: filteredData });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch autocomplete data' }, { status: 500 });
  }
}
