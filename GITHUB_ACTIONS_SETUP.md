# GitHub Actions Secrets Setup Guide

## Overview

This guide explains how to configure GitHub Actions secrets for deploying your Node.js application to Google Cloud Run with PostgreSQL (Neon) database credentials.

## Secrets Required

Your GitHub Actions workflows need the following secrets configured:

### 1. **GCP Secrets** (Required for Cloud Run deployment)
- `GCP_SERVICE_ACCOUNT` - JSON service account credentials
- `GCP_PROJECT_ID` - Google Cloud Project ID

### 2. **Docker Hub Secrets** (Required for pushing images)
- `DOCKER_USER` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub access token

### 3. **Database Secrets** (Required for PostgreSQL/Neon)
- `PGHOST` - Neon database host
- `PGDATABASE` - Database name
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGPORT` - Database port (usually 5432)

## Step-by-Step Setup

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. In the sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add GCP Credentials

#### Create a Google Cloud Service Account

```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create a service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Get the service account email
gcloud iam service-accounts list

# Bind necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download the key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

#### Add GCP Secret in GitHub

1. Click **New repository secret**
2. Name: `GCP_SERVICE_ACCOUNT`
3. Value: Paste the entire content of `key.json`
4. Click **Add secret**

Also add your GCP Project ID:

1. Click **New repository secret**
2. Name: `GCP_PROJECT_ID`
3. Value: Your Google Cloud Project ID (e.g., `my-project-123456`)
4. Click **Add secret**

### Step 3: Add Docker Hub Credentials

1. Click **New repository secret**
2. Name: `DOCKER_USER`
3. Value: Your Docker Hub username
4. Click **Add secret**

---

1. Click **New repository secret**
2. Name: `DOCKER_PASSWORD`
3. Value: Your Docker Hub **access token** (not password!)
   - Go to docker.com → Account Settings → Security → New Access Token
4. Click **Add secret**

### Step 4: Add Database Credentials

Add each database secret individually:

#### PGHOST
1. Click **New repository secret**
2. Name: `PGHOST`
3. Value: Your Neon database host (e.g., `ep-billowing-dawn-aefg6qm4-pooler.c-2.us-east-2.aws.neon.tech`)
4. Click **Add secret**

#### PGDATABASE
1. Click **New repository secret**
2. Name: `PGDATABASE`
3. Value: Database name (e.g., `neondb`)
4. Click **Add secret**

#### PGUSER
1. Click **New repository secret**
2. Name: `PGUSER`
3. Value: Database user (e.g., `neondb_owner`)
4. Click **Add secret**

#### PGPASSWORD
1. Click **New repository secret**
2. Name: `PGPASSWORD`
3. Value: Database password
4. Click **Add secret**

#### PGPORT
1. Click **New repository secret**
2. Name: `PGPORT`
3. Value: `5432`
4. Click **Add secret**

## Verify Secrets

After adding all secrets, verify them in GitHub:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all secrets listed (with masked values):
   - ✅ `GCP_SERVICE_ACCOUNT`
   - ✅ `GCP_PROJECT_ID`
   - ✅ `DOCKER_USER`
   - ✅ `DOCKER_PASSWORD`
   - ✅ `PGHOST`
   - ✅ `PGDATABASE`
   - ✅ `PGUSER`
   - ✅ `PGPASSWORD`
   - ✅ `PGPORT`

## Repository Variables

You also need to configure GitHub **Variables** (not secrets - these are public):

1. Go to **Settings** → **Secrets and variables** → **Variables**
2. Click **New repository variable**

Add these variables:

| Name | Value | Example |
|------|-------|---------|
| `IMAGE` | Docker Hub image name | `your-username/ci-cd-tutorial` |
| `GCR_PROJECT_NAME` | Cloud Run service name (production) | `ci-cd-api-prod` |
| `GCR_STAGING_PROJECT_NAME` | Cloud Run service name (staging) | `ci-cd-api-staging` |
| `GCR_REGION` | Google Cloud region | `us-central1` |

## How It Works in CI/CD

When your workflow runs:

1. **Test Stage**
   - Checks out code
   - Installs dependencies
   - Runs tests
   - No environment variables needed

2. **Build Stage**
   - Builds Docker image
   - Pushes to Docker Hub
   - Uses `DOCKER_USER` and `DOCKER_PASSWORD` secrets

3. **Deploy Stage**
   - Deploys to Google Cloud Run
   - Passes database environment variables:
     ```bash
     --set-env-vars="PGHOST=${{secrets.PGHOST}},PGDATABASE=${{secrets.PGDATABASE}},..."
     ```
   - Uses `GCP_SERVICE_ACCOUNT` to authenticate

## Environment Variable Handling

Your application receives these environment variables at runtime:

```javascript
// In your Node.js app
require("dotenv").config();

// These are set by Google Cloud Run:
const dbHost = process.env.PGHOST;
const database = process.env.PGDATABASE;
const user = process.env.PGUSER;
const password = process.env.PGPASSWORD;
const port = process.env.PORT; // Set to 8080
```

The database connection is established automatically when the server starts:

```bash
node index.js
  ↓
initializeDatabase()
  ↓
Creates PostgreSQL connection pool
  ↓
Creates products table if needed
  ↓
Server ready on port 8080
```

## Security Best Practices

✅ **Do:**
- Use repository secrets for sensitive data
- Use organization secrets for multi-repo sharing
- Rotate credentials regularly
- Use minimal IAM roles (least privilege)
- Use service accounts instead of personal credentials

❌ **Don't:**
- Commit `.env` files to repository
- Expose secrets in logs or error messages
- Share credentials in chat/email
- Use personal accounts for CI/CD

## Troubleshooting

### Deploy fails with "Permission denied"
- Check `GCP_SERVICE_ACCOUNT` has correct roles
- Run: `gcloud iam service-accounts get-policy-binding <SERVICE_ACCOUNT>`

### Deploy fails with "Database connection refused"
- Verify all `PG*` secrets are correct
- Check Neon instance is active
- Verify network allows connections from Google Cloud

### Docker push fails
- Verify `DOCKER_USER` and `DOCKER_PASSWORD`
- Check Docker Hub login separately: `docker login`

### Environment variables not passed to Cloud Run
- Check the `--set-env-vars` syntax in workflow
- Use comma-separated format without spaces
- All secrets must exist in GitHub

## Manual Testing

Test deployment locally:

```bash
# With local .env file
npm start

# Or with explicit environment variables
PGHOST=... PGDATABASE=... npm start
```

## Next Steps

1. ✅ Add all secrets to GitHub
2. ✅ Push code to `staging` branch to trigger workflow
3. ✅ Check Actions tab to see workflow run
4. ✅ Verify app deployed to Cloud Run
5. ✅ Test API at deployed URL
