require('dotenv').config();
const { Client } = require('pg');

async function addAutomationColumn() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URI
  });

  try {
    await client.connect();
    
    // Add is_automation_enabled to market_source_parser_profiles
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='market_source_parser_profiles' AND column_name='is_automation_enabled';
    `;
    const res = await client.query(checkQuery);
    
    if (res.rows.length === 0) {
      console.log('Adding is_automation_enabled column...');
      await client.query(`
        ALTER TABLE market_source_parser_profiles 
        ADD COLUMN is_automation_enabled BOOLEAN DEFAULT false;
      `);
      console.log('Column added successfully.');
    } else {
      console.log('Column already exists.');
    }
    
  } catch (err) {
    console.error('Error adding column', err);
  } finally {
    await client.end();
  }
}

addAutomationColumn();
