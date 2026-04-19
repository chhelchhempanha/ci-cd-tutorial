const { Pool } = require("pg");

// Database connection pool configuration
const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 30000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

pool.on("connect", () => {
  console.log("✅ New client connected to PostgreSQL");
});

module.exports = pool;
