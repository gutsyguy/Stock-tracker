import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize global supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Polyfill check to warn if credentials missing
if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Warning: Supabase URL or Key is missing from environment variables.");
}

export async function ensureUserExists(email: string, name?: string | null): Promise<string> {
  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    // Other than "Row not found"
    throw selectError;
  }

  if (existingUser) {
    return existingUser.id;
  }

  // User doesn't exist, insert them
  const username = name || email.split('@')[0];
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{ name: username, email: email }])
    .select('id')
    .single();

  if (insertError) {
    throw insertError;
  }

  // Seed new user with $100,000 in mock CASH
  let cashStockId;
  const { data: cashRes } = await supabase.from('stocks').select('id').eq('symbol', 'CASH').single();
  if (cashRes) {
    cashStockId = cashRes.id;
  } else {
    const { data: newCash } = await supabase.from('stocks').insert([{ symbol: 'CASH', name: 'US Dollars' }]).select('id').single();
    if (newCash) cashStockId = newCash.id;
  }

  if (cashStockId) {
    await supabase.from('user_stock_transactions').insert([{
      user_id: newUser.id,
      stock_id: cashStockId,
      transaction_type: 'BUY',
      quantity: 100000.0,
      price: 1.00
    }]);
  }

  return newUser.id;
}
