import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase, ensureUserExists } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { symbol, name, transaction_type, quantity, price } = body;

    if (!symbol || !transaction_type || quantity == null || price == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (transaction_type !== 'BUY' && transaction_type !== 'SELL') {
      return NextResponse.json({ error: 'transaction_type must be BUY or SELL' }, { status: 400 });
    }

    const userId = await ensureUserExists(session.user.email, session.user.name);
    
    try {
      // 1. Get or Insert Stock
      let stockId;
      const { data: stockRes, error: stockSelectErr } = await supabase
        .from('stocks')
        .select('id')
        .eq('symbol', symbol)
        .single();

      if (stockSelectErr && stockSelectErr.code !== 'PGRST116') {
        throw stockSelectErr;
      }

      if (stockRes) {
        stockId = stockRes.id;
      } else {
        const { data: insertStock, error: stockInsertErr } = await supabase
          .from('stocks')
          .insert([{ symbol, name: name || symbol }])
          .select('id')
          .single();
        
        if (stockInsertErr) throw stockInsertErr;
        stockId = insertStock.id;
      }

      // 2. Insert Transaction
      const { data: transRes, error: transErr } = await supabase
        .from('user_stock_transactions')
        .insert([{
          user_id: userId,
          stock_id: stockId,
          transaction_type,
          quantity,
          price
        }])
        .select('*')
        .single();
        
      if (transErr) throw transErr;

      return NextResponse.json(transRes, { status: 201 });
    } catch (e) {
      throw e;
    }
  } catch (error: unknown) {
    console.error('Transaction error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
