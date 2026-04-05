/**
 * Database Connection Test Utility
 * Tests the PostgreSQL connection without starting the server
 */

require("dotenv").config();
const pool = require("../src/utils/database");

async function testConnection() {
  try {
    console.log("🔌 Testing PostgreSQL connection to Neon...");
    console.log(`Host: ${process.env.PGHOST}`);
    console.log(`Database: ${process.env.PGDATABASE}`);
    console.log(`User: ${process.env.PGUSER}`);

    const client = await pool.connect();
    console.log("✅ Connected to Neon PostgreSQL successfully!");

    // Test query
    const result = await client.query("SELECT NOW();");
    console.log("✅ Query successful. Current timestamp:", result.rows[0].now);

    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log("📊 Tables in database:", tablesResult.rows);

    client.release();
    console.log("✅ Connection test completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    process.exit(1);
  }
}

testConnection();
