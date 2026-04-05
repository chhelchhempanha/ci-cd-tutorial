# Google Cloud Run Deployment Issues & Solutions

## Issue: PORT is a Reserved Environment Variable

### Error Message:
```
ERROR: (gcloud.run.deploy) spec.template.spec.containers[0].env: 
The following reserved env names were provided: PORT. 
These values are automatically set by the system.
```

### Root Cause:
Google Cloud Run automatically manages the `PORT` environment variable and doesn't allow it to be set via `--set-env-vars`. Cloud Run reserves certain environment variables that are set by the system:
- `PORT` - Always set to 8080
- `K_SERVICE` - Service name
- `K_REVISION` - Revision name
- `K_CONFIGURATION` - Configuration name

### Solution:
Remove `PORT=8080` from the `--set-env-vars` argument in the deployment command.

## Updated Deployment Configuration

### Before (❌ Failed):
```bash
gcloud run deploy SERVICE_NAME \
  --image IMAGE:TAG \
  --set-env-vars="PGHOST=...,PGDATABASE=...,PORT=8080"
```

### After (✅ Works):
```bash
gcloud run deploy SERVICE_NAME \
  --image IMAGE:TAG \
  --set-env-vars="PGHOST=...,PGDATABASE=..."
```

## How Port Handling Works

### Application Code (index.js):
```javascript
const PORT = process.env.PORT || 8080;
```

### Port Assignment Flow:

| Environment | PORT Value | Source |
|-------------|-----------|--------|
| **Local Dev** | 8080 | Default (fallback) |
| **Docker** | 8080 | Default (fallback) |
| **Cloud Run** | 8080 | Cloud Run (automatic) |
| **Tests** | N/A | Mock service |

### What Happens:

1. **Cloud Run boots container**
   - Cloud Run automatically sets `process.env.PORT = 8080`
   
2. **Application starts (index.js)**
   - Reads: `const PORT = process.env.PORT || 8080`
   - Cloud Run's PORT (8080) is used
   
3. **Server listens**
   - `app.listen(PORT)` → listens on port 8080
   - Cloud Run routes traffic to 8080
   
4. **Swagger available**
   - Accessible at: `https://SERVICE_NAME-RANDOM.us-central1.run.app/api-docs`

## Environment Variables in Cloud Run

### Correctly Set (✅):
```
PGHOST=ep-billowing-dawn-aefg6qm4-pooler.c-2.us-east-2.aws.neon.tech
PGDATABASE=neondb
PGUSER=neondb_owner
PGPASSWORD=npg_ZQct0iYPe9gI
PGPORT=5432
PGSSLMODE=require
NODE_ENV=production
```

### Reserved (Cannot be set ❌):
```
PORT (automatically set to 8080 by Cloud Run)
K_SERVICE
K_REVISION
K_CONFIGURATION
```

## Files Updated

- [.github/workflows/cd-pipeline.yml](.github/workflows/cd-pipeline.yml)
  - Removed `PORT=8080` from production deployment
  - Removed `PORT=8080` from staging deployment

## Deployment Command

The corrected deployment now looks like:

```bash
gcloud run deploy ci-cd-api-staging \
  --region us-central1 \
  --image gcr.io/project/image:sha \
  --platform "managed" \
  --allow-unauthenticated \
  --tag staging \
  --set-env-vars="PGHOST=...,PGDATABASE=...,PGUSER=...,PGPASSWORD=...,PGPORT=5432,PGSSLMODE=require,NODE_ENV=staging"
```

## Troubleshooting Similar Issues

### Check Current Environment Variables:
```bash
gcloud run services describe SERVICE_NAME --region us-central1
```

### Debug Cloud Run Service:
```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND service_name=SERVICE_NAME" --limit 50

# View specific service
gcloud run services describe SERVICE_NAME
```

### Test Locally with Same Setup:
```bash
# Simulate Cloud Run environment
PORT=8080 \
PGHOST=... \
PGDATABASE=... \
npm start
```

## Deployment Flow (Fixed)

```
1. Push code to staging
   ↓
2. GitHub Actions triggers
   ↓
3. Run tests (npm test) ✅
   ↓
4. Build Docker image ✅
   ↓
5. Push to Docker Hub ✅
   ↓
6. Deploy to Cloud Run
   - Authenticate: ✅
   - Pass database env vars: ✅
   - Skip PORT (Cloud Run manages it): ✅
   ↓
7. Cloud Run starts container
   - Sets PORT=8080 automatically
   - Sets other reserved env vars automatically
   - App reads from process.env.PGHOST, etc.
   ↓
8. App initializes database ✅
   ↓
9. Server listens on 8080 ✅
   ↓
10. Service accessible online ✅
```

## References

- [Cloud Run Environment Variables](https://cloud.google.com/run/docs/configuring/environment-variables)
- [Cloud Run Reserved Environment Variables](https://cloud.google.com/run/docs/tips/runtime-tips#env_var)
- [Deploy to Cloud Run](https://cloud.google.com/run/docs/quickstarts/deploy-container)

---

**Status:** ✅ Fixed and Ready to Deploy

Next deployment should succeed with the updated workflow!
