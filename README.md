# CI/CD Tutorial - Node.js Express API with PostgreSQL

A complete CI/CD pipeline example demonstrating:
- ✅ GitHub Actions for automated testing and deployment
- ✅ Docker containerization
- ✅ Google Cloud Run deployment
- ✅ PostgreSQL (Neon) database integration
- ✅ RESTful API with CRUD operations
- ✅ Swagger API documentation
- ✅ Comprehensive unit tests

## Quick Links

📚 **Documentation:**
- [CI/CD Pipeline Guide](CI_CD_PIPELINE_GUIDE.md) - Complete architecture overview
- [GitHub Actions Setup](GITHUB_ACTIONS_SETUP.md) - Step-by-step secrets configuration
- [Database Setup](DATABASE_SETUP.md) - PostgreSQL/Neon configuration
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Pre/post deployment tasks

## Project Overview

This is a production-ready Node.js application with:

- **Backend:** Express.js REST API
- **Database:** PostgreSQL (Neon)
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Deployment:** Google Cloud Run
- **Documentation:** Swagger/OpenAPI

## Tech Stack

```
Frontend: None (REST API only)
Backend: Node.js + Express.js
Database: PostgreSQL (Neon)
Testing: Jest + Supertest
Containerization: Docker
CI/CD: GitHub Actions
Cloud: Google Cloud Run
```

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- PostgreSQL (or Neon account)
- Docker (for local container testing)
- Git

### Installation

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/ci-cd-tutorial.git
cd ci-cd-tutorial

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your database credentials
```

### Environment Variables

```env
PORT=8080
NODE_ENV=development

PGHOST=your-neon-host.neon.tech
PGDATABASE=neondb
PGUSER=neondb_owner
PGPASSWORD=your_password
PGPORT=5432
PGSSLMODE=require
```

### Running Locally

```bash
# Start the server
npm start

# Access in browser:
# - Home: http://localhost:8080
# - Welcome: http://localhost:8080/welcome
# - Swagger: http://localhost:8080/api-docs

# In another terminal, test the API:
curl http://localhost:8080/api/products
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test products.test.js
```

## API Endpoints

### Home
```
GET /
Returns: HTML home page
```

### Welcome
```
GET /welcome
Returns: JSON welcome message
```

### API Documentation
```
GET /api-docs
Returns: Swagger UI with interactive API documentation
```

### Products CRUD

**Create Product**
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

**List All Products**
```bash
GET /api/products
```

**Get Product by ID**
```bash
GET /api/products/1
```

**Update Product**
```bash
PUT /api/products/1
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 39.99
}
```

**Delete Product**
```bash
DELETE /api/products/1
```

**Search Products**
```bash
GET /api/products/search?q=laptop
```

## Database

### Schema

Automatically created on first run:

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

### Connection

- **Provider:** Neon PostgreSQL
- **Host:** Amazon AWS (us-east-2)
- **Connection Pool:** Max 10 connections
- **Timeout:** 2 seconds
- **SSL:** Required

## Docker

### Build and Run Locally

```bash
# Build image
docker build -t ci-cd-tutorial .

# Run container
docker run -p 8080:8080 \
  -e PGHOST=your-host \
  -e PGDATABASE=neondb \
  -e PGUSER=user \
  -e PGPASSWORD=password \
  ci-cd-tutorial
```

### Docker Optimizations

- Multi-stage build (reduces size ~70%)
- Only production dependencies included
- Runs as non-root user
- Uses slim base image

## GitHub Actions

### Workflows

**CI Pipeline** (`.github/workflows/ci-pipeline.yml`)
- Triggers: PR to `staging` or `main`
- Tests: npm test
- Status: Must pass before merge

**CD Pipeline** (`.github/workflows/cd-pipeline.yml`)
- Triggers: Push to `staging` or GitHub Release from `main`
- Builds: Docker image
- Deploys: To Google Cloud Run
- Staging: Auto-deploy on push
- Production: Manual trigger (GitHub Release)

### Required Secrets

Add these to GitHub repository: **Settings → Secrets and variables → Actions**

```
✅ GCP_SERVICE_ACCOUNT    (JSON credentials)
✅ GCP_PROJECT_ID         (Google Cloud project ID)
✅ DOCKER_USER            (Docker Hub username)
✅ DOCKER_PASSWORD        (Docker Hub access token)
✅ PGHOST                 (Database host)
✅ PGDATABASE             (Database name)
✅ PGUSER                 (Database user)
✅ PGPASSWORD             (Database password)
✅ PGPORT                 (Database port)
```

### Required Variables

Add these to GitHub repository: **Settings → Secrets and variables → Variables**

```
✅ IMAGE                        (e.g., username/repo-name)
✅ GCR_PROJECT_NAME             (e.g., ci-cd-api-prod)
✅ GCR_STAGING_PROJECT_NAME     (e.g., ci-cd-api-staging)
✅ GCR_REGION                   (e.g., us-central1)
```

## Deployment

### Staging (Automatic)

```bash
# 1. Make changes
git add .
git commit -m "Add feature"

# 2. Push to staging
git push origin staging

# 3. GitHub Actions runs automatically
# 4. Deployment to staging Cloud Run service

# 5. Access at:
# https://ci-cd-api-staging-RANDOM.us-central1.run.app
```

### Production (Manual)

```bash
# 1. Merge to main
git checkout main
git merge staging
git push origin main

# 2. Create GitHub Release
# Go to: GitHub → Releases → Draft new release
# Tag: v1.0.0
# Title: Version 1.0.0
# Publish

# 3. GitHub Actions runs
# 4. Deployment to production Cloud Run service

# 5. Access at:
# https://ci-cd-api-prod-RANDOM.us-central1.run.app
```

## Project Structure

```
├── src/
│   ├── models/          # Business logic models
│   ├── services/        # Database operations (CRUD)
│   ├── controllers/     # HTTP request handlers
│   ├── routes/          # Route definitions
│   └── utils/           # Database connection, utilities
├── __tests__/           # Jest test files
├── scripts/             # Helper scripts
├── .github/workflows/   # GitHub Actions CI/CD
├── app.js               # Express app setup
├── index.js             # Server entry point
├── package.json         # Dependencies
├── Dockerfile           # Container configuration
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Testing

### Local Testing

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Expected output:
# Test Suites: 2 passed, 2 total
# Tests:       17 passed, 17 total
```

### Test Coverage

- ✅ Create product validation
- ✅ Read all products
- ✅ Read product by ID
- ✅ Update product
- ✅ Delete product
- ✅ Search functionality
- ✅ Error handling
- ✅ Full CRUD integration

### Database Testing

```bash
# Test connection to Neon
node scripts/testDbConnection.js
```

## Performance

| Operation | Time |
|-----------|------|
| API Response | < 100ms |
| Database Query | < 50ms |
| CI Pipeline | ~1-2 min |
| Docker Build | ~2-3 min |
| Cloud Run Deploy | ~5-7 min |

## Monitoring

### GitHub Actions
- Dashboard: https://github.com/YOUR_REPO/actions
- View workflow runs and logs

### Google Cloud Run
- Console: https://console.cloud.google.com/run
- View deployments, logs, metrics

### Application Logs

```bash
# Local
npm start

# Google Cloud
gcloud logging read "resource.type=cloud_run_revision"
```

## Troubleshooting

### Tests Failing
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm test
```

### Database Connection Error
```bash
# Check credentials
node scripts/testDbConnection.js

# Verify .env file exists and is correct
cat .env
```

### Docker Build Issues
```bash
# Build locally to debug
docker build -t test .
```

### Deployment Failed
- Check GitHub Actions logs
- Check Cloud Run logs in GCP Console
- Verify all secrets are configured

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| PORT | 8080 | No | Server port |
| NODE_ENV | development | No | Environment (dev/staging/prod) |
| PGHOST | — | Yes | PostgreSQL host |
| PGDATABASE | — | Yes | Database name |
| PGUSER | — | Yes | Database user |
| PGPASSWORD | — | Yes | Database password |
| PGPORT | 5432 | No | Database port |
| PGSSLMODE | require | No | SSL mode for DB |

## Security

✅ Best Practices:
- All secrets in GitHub Actions (not in code)
- `.env` in `.gitignore`
- Non-root Docker user
- SSL for database connections
- Input validation on all endpoints
- Error messages don't leak sensitive data

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm test`
3. Commit: `git commit -am "Add feature"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

## License

ISC

## Support

- 📖 [GitHub Actions Setup](GITHUB_ACTIONS_SETUP.md)
- 📖 [Database Setup](DATABASE_SETUP.md)
- 📖 [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- 📖 [CI/CD Pipeline Overview](CI_CD_PIPELINE_GUIDE.md)

## Roadmap

- [ ] Authentication (JWT)
- [ ] Rate limiting
- [ ] Caching (Redis)
- [ ] API versioning
- [ ] Logging aggregation
- [ ] Monitoring/Alerting
- [ ] Database migrations
- [ ] GraphQL API
- [ ] WebSocket support

---

**Created:** 2024  
**Last Updated:** April 2026  
**Repository:** https://github.com/YOUR_USERNAME/ci-cd-tutorial  
**Live:** https://ci-cd-api-prod-RANDOM.us-central1.run.app
