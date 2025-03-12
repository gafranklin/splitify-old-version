// Run with: node scripts/check-tables.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Create a new pool using the connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkTables() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    try {
      console.log('Checking database tables...');
      const { rows } = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log('\nTables in the database:');
      rows.forEach(row => {
        console.log(` - ${row.table_name}`);
      });
      
      // Check if expenses table exists and its structure
      if (rows.some(row => row.table_name === 'expenses')) {
        console.log('\nExpenses table exists. Checking its structure:');
        const { rows: expensesColumns } = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'expenses'
          ORDER BY ordinal_position;
        `);
        
        console.log('\nColumns in expenses table:');
        expensesColumns.forEach(col => {
          console.log(` - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
      } else {
        console.log('\nExpenses table does NOT exist!');
      }
      
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error checking tables:', err);
  } finally {
    await pool.end();
  }
}

checkTables().then(() => {
  console.log('\nTable check completed.');
}).catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 