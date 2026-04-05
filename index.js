const app = require("./app");
const config = require("dotenv").config;
const initializeDatabase = require("./src/utils/initDatabase");

config();

const PORT = process.env.PORT || 8080;

/**
 * Start server with database initialization
 */
async function startServer() {
  try {
    // Initialize database schema
    console.log("🔌 Initializing database connection...");
    await initializeDatabase();
    console.log("✅ Database initialized successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏠 Home Page: http://localhost:${PORT}/`);
      console.log(`👋 Welcome Endpoint: http://localhost:${PORT}/welcome`);
      console.log(`📦 Product API: http://localhost:${PORT}/api/products`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
