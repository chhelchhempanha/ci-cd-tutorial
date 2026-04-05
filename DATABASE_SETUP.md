# PostgreSQL/Neon Database Integration Guide

## Setup Complete! ✅

Your application is now configured to use **Neon PostgreSQL** database instead of in-memory storage.

## Files Created/Modified

### New Files
- `src/utils/database.js` - PostgreSQL connection pool configuration
- `src/utils/initDatabase.js` - Database schema initialization
- `scripts/testDbConnection.js` - Database connection test utility
- `.env` - Environment configuration with Neon credentials
- `.env.example` - Template for environment variables

### Updated Files
- `src/services/productService.js` - Converted to async PostgreSQL queries
- `src/controllers/productController.js` - Updated to handle async operations
- `index.js` - Added database initialization on startup
- `package.json` - Added `pg` and `dotenv` dependencies

## Environment Setup

### 1. Configure Your Environment

Create a `.env` file in the project root with your Neon database credentials:

```env
PORT=8080
NODE_ENV=development

# PostgreSQL/Neon Database Configuration
PGHOST=ep-billowing-dawn-aefg6qm4-pooler.c-2.us-east-2.aws.neon.tech
PGDATABASE=neondb
PGUSER=neondb_owner
PGPASSWORD=npg_ZQct0iYPe9gI
PGPORT=5432
PGSSLMODE=require
PGCHANNELBINDING=require
```

**⚠️ IMPORTANT**: Never commit `.env` to git! It's already in `.gitignore`.

### 2. Test Database Connection

```bash
# Test the connection without starting the server
node scripts/testDbConnection.js
```

### 3. Start the Application

```bash
npm start
```

The server will:
1. Connect to your Neon PostgreSQL database
2. Create the `products` table automatically if it doesn't exist
3. Create an index on the product name column for faster searches
4. Start listening on port 8080

## Database Schema

The application automatically creates this table:

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_name ON products (name);
```

## API Endpoints (Now Using PostgreSQL)

### Create Product
```bash
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Optional description",
  "price": 29.99,
  "quantity": 10
}
```

### Get All Products
```bash
GET /api/products
```

### Get Product by ID
```bash
GET /api/products/1
```

### Update Product
```bash
PUT /api/products/1
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 39.99
}
```

### Delete Product
```bash
DELETE /api/products/1
```

### Search Products
```bash
GET /api/products/search?q=laptop
```

## Connection Troubleshooting

### Issue: "Connection timeout"

**Possible Causes:**
- Network connectivity issues
- Firewall blocking the connection
- Neon database endpoint unreachable

**Solutions:**
1. Verify your internet connection
2. Check Neon credentials are correct
3. Ensure your machine's firewall allows outbound connections to AWS
4. Verify the Neon instance is active in the Neon console

### Issue: "Authentication failed"

**Possible Causes:**
- Invalid credentials in `.env`
- Neon password changed

**Solutions:**
1. Double-check credentials match your Neon console
2. Reset the password if needed
3. Ensure no special characters are unescaped

### Issue: "SSL/TLS error"

**Solution:**
The connection uses SSL by default. Ensure your Neon instance supports SSL connections (which it does).

## Data Persistence

All product data is now stored in PostgreSQL!

- **Before**: Data was lost when the server restarted
- **Now**: Data persists across server restarts and deployments

## Docker Deployment

When deploying with Docker to Google Cloud Run:

1. The `.env` file will NOT be included (good for security)
2. Pass environment variables to the container:

```bash
gcloud run deploy SERVICE_NAME \
  --image gcr.io/PROJECT/IMAGE \
  --set-env-vars PGHOST=xxx,PGDATABASE=neondb,... \
  --region us-central1 \
  --allow-unauthenticated
```

Or set secrets in Google Cloud Run console.

## Testing

Run tests (uses in-memory data for tests, not database):

```bash
npm test
```

To test with real database, update the test file to connect to PostgreSQL.

## Swagger Documentation

Access interactive API docs:

```
http://localhost:8080/api-docs
```

All endpoints are documented with request/response examples!

## Next Steps

1. ✅ Database connection configured
2. ✅ PostgreSQL models and services set up
3. ✅ CRUD operations ready
4. Next: Deploy to Google Cloud Run with environment variables
