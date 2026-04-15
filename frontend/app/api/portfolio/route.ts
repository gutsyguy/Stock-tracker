import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase, ensureUserExists } from '@/lib/db';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await ensureUserExists(session.user.email, session.user.name);

  try {
    // Fetch all transactions + joined stock data
    const { data: transData, error } = await supabase
      .from('user_stock_transactions')
      .select(`
        transaction_type, quantity, price,
        stocks ( id, symbol, name )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    if (!transData) {
      return NextResponse.json({ portfolio: [], count: 0 });
    }

    // JS Aggregation to match Group By format
    interface AggregatedStock {
      stockId: string;
      symbol: string;
      name: string;
      net_quantity: number;
      total_buy_quantity: number;
      total_buy_spend: number;
    }
    const aggregated: Record<string, AggregatedStock> = {};

    for (const record of transData) {
      // Supabase nested joined objects come back as `stocks` object or array of objects depending on relationship 
      // but strictly here stock_id is a foreign key, so it returns single object:
      const stock = Array.isArray(record.stocks) ? record.stocks[0] : record.stocks;
      if (!stock) continue;

      const symbol = stock.symbol;
      
      if (!aggregated[symbol]) {
        aggregated[symbol] = {
          stockId: stock.id,
          symbol,
          name: stock.name,
          net_quantity: 0,
          total_buy_quantity: 0,
          total_buy_spend: 0
        };
      }

      const rowQuantity = Number(record.quantity);
      const rowPrice = Number(record.price);

      if (record.transaction_type === 'BUY') {
        aggregated[symbol].net_quantity += rowQuantity;
        aggregated[symbol].total_buy_quantity += rowQuantity;
        aggregated[symbol].total_buy_spend += rowQuantity * rowPrice;
      } else if (record.transaction_type === 'SELL') {
        aggregated[symbol].net_quantity -= rowQuantity;
      }
    }

    // Map aggregated keys mapping to expected NextJS output:
    const portfolio = Object.values(aggregated)
      .filter((s: AggregatedStock) => s.net_quantity > 0)
      .map((s: AggregatedStock) => {
        // Average buy price logic
        const avgBuyPrice = s.total_buy_quantity > 0 ? (s.total_buy_spend / s.total_buy_quantity) : 0;
        
        return {
          stock: {
            id: s.stockId,
            symbol: s.symbol,
            name: s.name
          },
          netQuantity: s.net_quantity,
          avgBuyPrice: avgBuyPrice,
          currentValue: s.net_quantity * avgBuyPrice,
          
          symbol: s.symbol,
          shares: s.net_quantity,
          purchasePrice: avgBuyPrice,
          currentPrice: avgBuyPrice,
          email: session.user?.email
        };
      });

    return NextResponse.json({
      portfolio,
      count: portfolio.length
    });
  } catch (error: unknown) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
     return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const userId = await ensureUserExists(session.user.email, session.user.name);

  try {
    const { data: stockRes, error: stockErr } = await supabase
      .from('stocks')
      .select('id')
      .eq('symbol', symbol)
      .single();

    if (stockErr || !stockRes) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    const { error: deleteErr } = await supabase
      .from('user_stock_transactions')
      .delete()
      .eq('user_id', userId)
      .eq('stock_id', stockRes.id);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
