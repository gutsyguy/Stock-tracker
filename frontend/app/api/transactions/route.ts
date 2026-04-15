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

      // 1.5 Get CASH Stock ID for ledger
      let cashStockId;
      const { data: cashRes } = await supabase.from('stocks').select('id').eq('symbol', 'CASH').single();
      if (cashRes) {
        cashStockId = cashRes.id;
      } else {
        const { data: newCash } = await supabase.from('stocks').insert([{ symbol: 'CASH', name: 'US Dollars' }]).select('id').single();
        if (newCash) cashStockId = newCash.id;
      }

      const totalValue = quantity * price;

      // 1.8 Verify Funds for Buying
      if (transaction_type === 'BUY' && cashStockId) {
        const { data: cashTrans } = await supabase
          .from('user_stock_transactions')
          .select('transaction_type, quantity')
          .eq('user_id', userId)
          .eq('stock_id', cashStockId);

        let cashBalance = 0;
        if (cashTrans) {
          cashTrans.forEach(t => {
            if (t.transaction_type === 'BUY') cashBalance += Number(t.quantity);
            else if (t.transaction_type === 'SELL') cashBalance -= Number(t.quantity);
          });
        }

        if (cashBalance < totalValue) {
          return NextResponse.json({ error: 'Insufficient funds for this transaction' }, { status: 400 });
        }
      }

      // 2. Insert Stock Transaction
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

      // 3. Insert paired CASH Transaction (Double-entry Ledger)
      if (cashStockId) {
        await supabase.from('user_stock_transactions').insert([{
           user_id: userId,
           stock_id: cashStockId,
           transaction_type: transaction_type === 'BUY' ? 'SELL' : 'BUY',
           quantity: totalValue,
           price: 1.0
        }]);
      }

      return NextResponse.json(transRes, { status: 201 });
    } catch (e) {
      throw e;
    }
  } catch (error: unknown) {
    console.error('Transaction error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
