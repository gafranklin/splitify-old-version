// Run with: node scripts/run-sql.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const sqlFile = process.argv[2] || './scripts/create-tables.sql';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Create a new pool using the connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runSqlFile() {
  console.log(`Reading SQL file: ${sqlFile}`);
  
  try {
    // Read the SQL file
    const sqlPath = path.resolve(sqlFile);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    try {
      console.log('Executing SQL script...');
      await client.query(sql);
      console.log('SQL script executed successfully');
    } finally {
      client.release();
    }
    
    console.log('All done!');
  } catch (err) {
    console.error('Error executing SQL file:', err);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

runSqlFile().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 