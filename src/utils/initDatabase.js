const pool = require("./database");

/**
 * Initialize database schema
 * Creates the products table if it doesn't exist
 */
async function initializeDatabase() {
  let client;
  try {
    console.log("🔌 Attempting to connect to PostgreSQL...");
    client = await pool.connect();

    console.log("✅ Successfully connected to PostgreSQL");
    console.log("📋 Creating products table if not exists...");

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createTableQuery);
    console.log("✅ Products table ready");

    // Create index on name for faster searches
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_products_name 
      ON products (name);
    `;

    await client.query(createIndexQuery);
    console.log("✅ Index on product name created");

    // Test with a simple query
    const testResult = await client.query("SELECT COUNT(*) as product_count FROM products;");
    console.log(`📊 Products in database: ${testResult.rows[0].product_count}`);

    return true;
  } catch (error) {
    console.error("❌ Database initialization error:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("⚠️  Connection refused. Make sure PostgreSQL is running.");
    } else if (error.code === "ETIMEDOUT") {
      console.error("⚠️  Connection timed out. Check your network/firewall settings.");
    }
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = initializeDatabase;
