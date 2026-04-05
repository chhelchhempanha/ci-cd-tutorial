# Deployment Checklist

Complete this checklist to deploy your application to Google Cloud Run with PostgreSQL.

## Pre-Deployment Setup

### 1. Google Cloud Setup
- [ ] Create a Google Cloud Project
- [ ] Enable these APIs in your project:
  - [ ] Cloud Run API
  - [ ] Container Registry API
  - [ ] Cloud Billing API
  - [ ] Cloud IAM API
- [ ] Create a service account for GitHub Actions
- [ ] Download service account JSON credentials
- [ ] Assign these roles to the service account:
  - [ ] `roles/run.admin` (Cloud Run Admin)
  - [ ] `roles/iam.serviceAccountUser` (Service Account User)

### 2. Docker Hub Setup
- [ ] Create Docker Hub account (if not already)
- [ ] Create Docker Hub repository
- [ ] Generate access token (not password)

### 3. Neon Database Setup
- [ ] Create Neon project
- [ ] Create database (neondb)
- [ ] Get connection credentials:
  - [ ] Host
  - [ ] Database name
  - [ ] Username
  - [ ] Password
  - [ ] Port (5432)
- [ ] Test local connection: `node scripts/testDbConnection.js`

### 4. Local Testing
- [ ] Clone repository
- [ ] Create `.env` file with database credentials
- [ ] Run `npm install`
- [ ] Run `npm test` - all tests should pass
- [ ] Run `npm start` - server should start without errors
- [ ] Test API endpoints locally:
  - [ ] GET `/` - returns HTML
  - [ ] GET `/welcome` - returns JSON
  - [ ] GET `/api-docs` - Swagger UI loads
  - [ ] POST `/api/products` - create product
  - [ ] GET `/api/products` - list products

### 5. GitHub Repository Setup
- [ ] Push code to GitHub `staging` branch
- [ ] Verify `.gitignore` includes `.env`
- [ ] Verify `.env.example` exists with template values

### 6. GitHub Actions Secrets
- [ ] Add `GCP_SERVICE_ACCOUNT` secret
- [ ] Add `GCP_PROJECT_ID` secret
- [ ] Add `DOCKER_USER` secret
- [ ] Add `DOCKER_PASSWORD` secret
- [ ] Add `PGHOST` secret
- [ ] Add `PGDATABASE` secret
- [ ] Add `PGUSER` secret
- [ ] Add `PGPASSWORD` secret
- [ ] Add `PGPORT` secret

### 7. GitHub Repository Variables
- [ ] Add `IMAGE` variable (e.g., `username/ci-cd-tutorial`)
- [ ] Add `GCR_PROJECT_NAME` variable (production service name)
- [ ] Add `GCR_STAGING_PROJECT_NAME` variable (staging service name)
- [ ] Add `GCR_REGION` variable (e.g., `us-central1`)

## Deployment Process

### Staging Deployment
- [ ] Make code changes
- [ ] Commit and push to `staging` branch
- [ ] GitHub Actions workflow starts automatically
- [ ] Check Actions tab for workflow status
- [ ] Wait for Build step to complete
- [ ] Deployment to staging Cloud Run service begins
- [ ] Test deployed app at staging URL:
  ```
  https://ci-cd-api-staging-RANDOM.us-central1.run.app
  ```
- [ ] Verify endpoints work:
  - [ ] Home page loads
  - [ ] Swagger docs accessible
  - [ ] Create a test product
  - [ ] Retrieve products from database

### Production Deployment
- [ ] Code review and approval on main branch
- [ ] Create a GitHub Release
- [ ] Tag version (e.g., `v1.0.0`)
- [ ] GitHub Actions workflow starts
- [ ] Build and push to Docker Hub
- [ ] Wait for deployment to complete
- [ ] Test at production URL:
  ```
  https://ci-cd-api-prod-RANDOM.us-central1.run.app
  ```

## Post-Deployment Verification

### Health Checks
- [ ] API responds to requests
- [ ] Database connection established
- [ ] All endpoints responding with correct status codes
- [ ] Swagger documentation loads
- [ ] Products can be created and retrieved

### Monitoring
- [ ] Check Cloud Run logs in Google Cloud Console
- [ ] Monitor error rates
- [ ] Check database query performance
- [ ] Monitor API response times

## Monitoring & Maintenance

### Regular Tasks
- [ ] Review Cloud Run logs weekly
- [ ] Monitor database performance
- [ ] Check for security updates in dependencies
- [ ] Backup important data from database

### Troubleshooting Commands

```bash
# Check workflow logs
# Go to: https://github.com/YOUR_REPO/actions

# Check Cloud Run deployments
gcloud run services list --region us-central1

# View service logs
gcloud run services describe SERVICE_NAME --region us-central1

# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND SERVICE_NAME" --limit 50

# SSH into running container (if needed)
# Use Cloud Run logs in Console instead
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Connection timeout to database" | Check database is active, firewall allows connections |
| "Invalid credentials" | Verify all `PG*` secrets in GitHub are correct |
| "Docker push fails" | Check Docker Hub credentials and token |
| "Cloud Run deployment fails" | Check service account has correct IAM roles |
| "Port already in use" | Change PORT env var in Cloud Run settings |
| "Database table doesn't exist" | App auto-creates on startup, check logs |

## Rollback Plan

If deployment fails:

1. **Identify the issue**
   ```bash
   gcloud run services describe SERVICE_NAME
   gcloud logging read ... --limit 100
   ```

2. **Revert code** (if code issue)
   ```bash
   git revert COMMIT_HASH
   git push staging
   ```

3. **Manual rollback** (if urgent)
   ```bash
   gcloud run deploy SERVICE_NAME \
     --image PREVIOUS_IMAGE_URI \
     --region us-central1
   ```

## Security Checklist

- [ ] No credentials in code or git history
- [ ] `.env` in `.gitignore`
- [ ] All secrets use GitHub Actions secrets (not variables)
- [ ] Service account uses minimal IAM roles
- [ ] Database password is strong and unique
- [ ] HTTPS/SSL enabled for database connection
- [ ] Cloud Run service has authentication disabled only if public API
- [ ] Firebase authentication set up (if needed)

## Performance Optimization

Before production deployment:

- [ ] Database indexes created for frequently searched fields
  - [ ] `idx_products_name` created automatically
- [ ] Connection pooling configured
  - [ ] Max 10 connections in pool
- [ ] Response times tested
- [ ] Load testing performed

## Documentation

- [ ] README.md updated with deployment steps
- [ ] API documentation complete in Swagger
- [ ] Database schema documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide available

## Success Criteria

Your deployment is successful when:

✅ All tests pass in CI pipeline  
✅ Docker image builds and pushes to Docker Hub  
✅ Cloud Run deployment completes without errors  
✅ API endpoints respond correctly  
✅ Database operations work (CRUD)  
✅ Swagger documentation accessible  
✅ No errors in Cloud Run logs  
✅ Performance is acceptable (< 200ms response time)  

---

**Estimated Time:** 2-4 hours for first-time setup  
**Support:** Check logs in GitHub Actions and Google Cloud Console
