# Complete CI/CD Pipeline Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Repository                             │
│  Branches: main (production) | staging (staging)                │
└────────────────┬──────────────────────────────┬─────────────────┘
                 │                              │
         Push to staging              Create GitHub Release
                 │                              │
                 ▼                              ▼
      ┌──────────────────┐          ┌──────────────────┐
      │  CI Pipeline     │          │  CI Pipeline     │
      │  (ci-pipeline)   │          │  (cd-pipeline)   │
      └────────┬─────────┘          └────────┬─────────┘
               │                             │
        1. Checkout code              1. Checkout code
        2. npm install                2. npm install
        3. npm test                   3. npm test
        │                             │
        └──────────────────┬──────────┘
                           │
                    All tests pass?
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
    ┌──────────┐                         ┌──────────┐
    │ STAGING  │                         │PRODUCTION│
    └────┬─────┘                         └────┬─────┘
         │                                     │
    BUILD STEP                             BUILD STEP
    1. Docker build                       1. Docker build
    2. Docker login                       2. Docker login
    3. Docker push                        3. Docker push
         │                                     │
         ▼                                     ▼
    DEPLOY STEP                          DEPLOY STEP
    1. Auth to GCP                       1. Auth to GCP
    2. Deploy to Cloud Run               2. Deploy to Cloud Run
    3. Pass env vars:                    3. Pass env vars:
       - PGHOST                             - PGHOST
       - PGDATABASE                        - PGDATABASE
       - PGUSER                            - PGUSER
       - PGPASSWORD                        - PGPASSWORD
       - NODE_ENV=staging                  - NODE_ENV=production
         │                                     │
         ▼                                     ▼
    ci-cd-api-staging                   ci-cd-api-prod
    (Cloud Run Service)                 (Cloud Run Service)
         │                                     │
         └─────────────┬──────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  PostgreSQL Database │
            │  (Neon)              │
            │  products table      │
            └──────────────────────┘
```

## Workflows

### 1. CI Pipeline (Runs on every PR to staging/main)

**File:** `.github/workflows/ci-pipeline.yml`

**Trigger Events:**
- Pull request to `staging` branch
- Pull request to `main` branch

**Steps:**
1. Checkout code
2. Install dependencies: `npm ci`
3. Run tests: `npm test`
4. Build check: `npm run build --if-present`

**Status:** ✅ Pass or ❌ Fail  
**Time:** ~1-2 minutes

### 2. CD Pipeline (Runs on push to staging OR GitHub Release)

**File:** `.github/workflows/cd-pipeline.yml`

**Trigger Events:**
- Push to `staging` branch → **Deploy to staging**
- GitHub Release (tag) from `main` → **Deploy to production**
- Manual trigger (workflow_dispatch)

**Steps:**

1. **Test Stage** (same as CI)
   - Checkout
   - Install dependencies
   - Run tests

2. **Build Stage**
   - Authenticate with GCP
   - Authenticate with Docker Hub
   - Build Docker image
   - Push to Docker Hub
   - Enable Billing API in GCP

3. **Deploy Stage**
   - **To Staging:** Deploy if not on main branch
   - **To Production:** Deploy only on GitHub Release from main branch
   - Both pass environment variables to Cloud Run

**Status:** ✅ Deployed or ❌ Failed  
**Time:** ~5-10 minutes

## Environment Variables Flow

### Testing Stage (CI)
```
GitHub Actions Runner
├─ No database needed
└─ Tests run with mocks or in-memory data
```

### Staging Deployment (CD)
```
GitHub Actions Secrets
├─ PGHOST
├─ PGDATABASE
├─ PGUSER
├─ PGPASSWORD
├─ PGPORT
└─ (pass via --set-env-vars)
       ↓
Cloud Run Environment
├─ NODE_ENV=staging
├─ PORT=8080
└─ PostgreSQL env vars
       ↓
Application (index.js)
├─ require("dotenv").config()
└─ Connect to Neon Database
```

### Production Deployment (CD)
```
Same as Staging, but:
└─ NODE_ENV=production
└─ Different Cloud Run service
```

## How to Deploy

### Deploy to Staging

```bash
# 1. Make changes
git checkout staging
git pull origin staging

# 2. Make code changes and commit
git add .
git commit -m "Add new feature"

# 3. Push to staging
git push origin staging

# 4. GitHub Actions runs automatically
# Check at: https://github.com/YOUR_REPO/actions

# 5. Deployment completes
# Access at: https://ci-cd-api-staging-RANDOM.us-central1.run.app
```

### Deploy to Production

```bash
# Option 1: GitHub Release (Recommended)

# 1. Merge code to main branch
git checkout main
git pull origin main
git merge staging
git push origin main

# 2. Create a GitHub Release
# Go to GitHub → Releases → Draft a new release
# Tag: v1.0.0 (semantic versioning)
# Title: Version 1.0.0
# Description: Changes and improvements
# Target: main branch
# Publish

# 3. GitHub Actions runs cd-pipeline
# Deploys to production Cloud Run service

# 4. Access at: https://ci-cd-api-prod-RANDOM.us-central1.run.app

# Option 2: Manual workflow trigger
# Go to GitHub → Actions → CD Pipeline
# Click "Run workflow" → Select main branch → Run

# Option 3: Via gcloud CLI
gcloud run deploy ci-cd-api-prod \
  --image gcr.io/PROJECT/IMAGE:TAG \
  --region us-central1 \
  --set-env-vars PGHOST=...,PGDATABASE=...
```

## GitHub Secrets Required

All these must be added in: **Settings → Secrets and variables → Actions**

```
Required Secrets:
├─ GCP_SERVICE_ACCOUNT     (JSON credentials)
├─ GCP_PROJECT_ID          (Google Cloud project)
├─ DOCKER_USER             (Docker Hub username)
├─ DOCKER_PASSWORD         (Docker Hub token)
├─ PGHOST                  (Neon database host)
├─ PGDATABASE              (Neon database name)
├─ PGUSER                  (Neon user)
├─ PGPASSWORD              (Neon password)
└─ PGPORT                  (Neon port, default 5432)
```

## GitHub Variables Required

All these must be added in: **Settings → Secrets and variables → Variables**

```
Required Variables:
├─ IMAGE                   (e.g., username/repo-name)
├─ GCR_PROJECT_NAME        (e.g., ci-cd-api-prod)
├─ GCR_STAGING_PROJECT_NAME (e.g., ci-cd-api-staging)
└─ GCR_REGION              (e.g., us-central1)
```

## Project Structure

```
ci-cd-tutorial/
├── src/
│   ├── models/
│   │   └── Product.js           # Product data model
│   ├── services/
│   │   └── productService.js    # Business logic (CRUD + DB)
│   ├── controllers/
│   │   └── productController.js # HTTP handlers
│   ├── routes/
│   │   └── productRoutes.js     # API route definitions
│   └── utils/
│       ├── database.js           # PostgreSQL connection pool
│       └── initDatabase.js       # Schema initialization
├── __tests__/
│   ├── products.test.js          # CRUD API tests
│   └── index.test.js             # Home page tests
├── scripts/
│   └── testDbConnection.js       # Database connection tester
├── .github/workflows/
│   ├── ci-pipeline.yml           # CI workflow
│   └── cd-pipeline.yml           # CD workflow
├── app.js                        # Express app setup + Swagger
├── index.js                      # Server entry point
├── package.json                  # Dependencies
├── .env                          # Local environment variables
├── .env.example                  # Template
├── .gitignore                    # Ignored files
├── Dockerfile                    # Container image definition
├── .dockerignore                 # Docker context ignore
├── DATABASE_SETUP.md             # Database configuration guide
├── GITHUB_ACTIONS_SETUP.md       # GitHub Actions secrets guide
├── DEPLOYMENT_CHECKLIST.md       # Pre/post deployment checklist
└── README.md                     # Project documentation
```

## API Endpoints

All endpoints documented in Swagger: `/api-docs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Home page (HTML) |
| GET | `/welcome` | Welcome message (JSON) |
| GET | `/api-docs` | Swagger API documentation |
| POST | `/api/products` | Create product |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/search?q=name` | Search products |

## Monitoring & Logs

### GitHub Actions Logs
```
GitHub → Actions → Select workflow run → View logs
- Shows each step execution
- Useful for debugging CI/CD failures
```

### Cloud Run Logs
```
Google Cloud Console → Cloud Run → Select service → Logs
- Application logs
- Request/response traffic
- Errors and exceptions
```

### Local Testing
```bash
node scripts/testDbConnection.js  # Test db connection
npm test                          # Run all tests
npm start                         # Start locally
```

## Troubleshooting

### Tests Failing
```bash
npm install    # Reinstall dependencies
npm test       # Run tests locally
# Check error messages, fix issues, commit
```

### Docker Build Fails
```bash
docker build -t test .  # Build locally
docker run test         # Test image
# If it works locally but fails in Actions, check env vars
```

### Cloud Run Deployment Fails
```bash
# Check these:
gcloud run services list
gcloud logging read "resource.type=cloud_run_revision" --limit 50
gcloud run services describe SERVICE_NAME
```

### Database Connection Issues
```bash
# Check Neon is active
# Verify PGHOST, PGUSER, PGPASSWORD in GitHub secrets
# Test locally: node scripts/testDbConnection.js
```

## Performance

| Stage | Time | Typical Issues |
|-------|------|----------------|
| CI Tests | 1-2 min | Dependencies, test timeouts |
| Docker Build | 2-3 min | Large dependencies, network |
| Docker Push | 1-2 min | Docker Hub rate limits |
| Cloud Run Deploy | 2-3 min | Quota limits, billing API |
| **Total** | **~8-12 min** | — |

## Cost Estimation

**Google Cloud Run:**
- Free tier: 2M requests/month
- Compute: $0.00001667 per CPU-second
- Memory: Included in compute price

**Neon PostgreSQL:**
- Free tier: 5 GB storage
- Professional: $15/month

**Docker Hub:**
- Free tier: Unlimited pulls
- No cost for private repos (free plan limits to 1 private repo)

## Security Considerations

✅ **Best Practices:**
- Store all secrets in GitHub Actions secrets (masked)
- Use service accounts instead of personal credentials
- Enable audit logging in GCP
- Use minimal IAM roles
- Rotate credentials periodically
- Use SSL for database connections

❌ **Avoid:**
- Hardcoding credentials
- Committing `.env` to git
- Using personal accounts for CI/CD
- Over-permissive IAM roles

## Rollback Procedure

If production deployment fails:

```bash
# 1. Identify the issue
gcloud logging read "..." --limit 100

# 2. Revert code
git revert COMMIT_HASH
git push origin main

# 3. Create new GitHub Release
# Or trigger workflow manually

# 4. Manual rollback if urgent
gcloud run deploy ci-cd-api-prod \
  --image PREVIOUS_IMAGE_URI \
  --region us-central1
```

---

**Need Help?**
- Check logs in GitHub Actions tab
- Check Cloud Run logs in GCP Console
- Review error messages carefully
- Search troubleshooting section
