const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:yWjIJMVFMo0Q5Msm@db.hvrghcjsyecnnizahrby.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    // Check if column exists
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' and column_name='cash_balance';
    `);
    if (res.rows.length === 0) {
      await client.query(`ALTER TABLE users ADD COLUMN cash_balance NUMERIC DEFAULT 100000.00;`);
      console.log("Added cash_balance column.");
    } else {
      console.log("cash_balance already exists.");
    }
    
    // Create new table for portfolio over time if needed, OR we can just calculate PnL dynamically from Alpaca.
    // Daily PnL can be calculated dynamically.
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
