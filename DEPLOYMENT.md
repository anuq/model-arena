# Model Arena - Deployment Guide

## Local Development (Docker Compose)

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env and add your OpenRouter API key

# 2. Build and run
docker-compose up --build
```

Visit http://localhost:3000

---

## Railway Deployment

### Prerequisites
- Railway account (railway.app)
- OpenRouter API key
- GitHub account with repo access

### Quick Start

1. **Connect your repo to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "+ New Project"
   - Select "Deploy from GitHub repo"
   - Authorize and select this repository
   - Railway auto-detects both Dockerfiles

2. **Add Backend Service**
   - In Railway dashboard, click "+ New" → "Service" → "GitHub repo"
   - Select the repo, choose "backend/Dockerfile"
   - Set environment variable:
     - `OPENROUTER_API_KEY=your_openrouter_api_key`
   - Click Deploy

3. **Add Frontend Service**
   - Click "+ New" → "Service" → "GitHub repo"
   - Select the repo, choose "frontend/Dockerfile"
   - Set environment variable:
     - `BACKEND_URL=model-arena-backend.railway.internal`
   - Click Deploy

4. **Done!**
   - Railway auto-deploys on git push
   - Your frontend URL will be provided in the dashboard
   - Check logs in the Railway console if issues arise

---

## Troubleshooting

### Issue: "Cannot GET /api/..."
**Cause**: Frontend cannot connect to backend  
**Fix**:
- Verify `BACKEND_URL` environment variable is set correctly
- Backend should be: `model-arena-backend.railway.internal`
- Check Railway logs: dashboard → select backend service → Logs

### Issue: CORS errors in browser console
**Cause**: Backend not accepting requests  
**Fix**:
- Backend has `allow_origins=["*"]` by default (see `main.py`)
- Should work for any frontend URL
- Check backend logs for detailed errors

### Issue: "502 Bad Gateway"
**Cause**: Frontend → backend connection failing  
**Fix**:
- Test backend health: Go to `https://<your-frontend-url>/api/health`
- Check if backend service is running/healthy in Railway
- Verify environment variables are set

### Issue: Build failing on Railway
**Cause**: Missing dependencies or configuration  
**Fix**:
- Check Railway build logs for specific error
- Ensure `requirements.txt` has all dependencies
- Ensure `package.json` has all npm packages
- Verify Dockerfile paths are correct

---

## Production Checklist

- [ ] `OPENROUTER_API_KEY` set as secret in Railway
- [ ] Both services deployed and showing "Running" status
- [ ] Frontend and backend have matching `BACKEND_URL`
- [ ] Health endpoints responding (check in browser)
- [ ] Database directory persists (Railway handles volume automatically)
- [ ] Auto-deploys configured on git push (Railway default)
- [ ] Monitor logs regularly for errors

---

## Testing Connectivity

After deployment, verify everything works:

```bash
# Health check
curl https://<your-frontend-url>/api/health

# List available models
curl https://<your-frontend-url>/api/models

# Try the app in browser
open https://<your-frontend-url>
```

If these work, deployment is successful!
