# Model Arena - Deployment Guide

## Local Development (Docker Compose)

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env and add your OpenRouter API key

# 2. Build and run
docker compose up --build
```

Visit http://localhost:3000

---

## Railway Deployment

### Prerequisites
- Railway account (railway.app)
- OpenRouter API key
- GitHub account with repo access

### Quick Start

1. **Create Backend Service**
   - Go to [railway.app](https://railway.app) and create/open a project
   - Click "+ New" → "Service" → "GitHub repo"
   - Select your repo, choose "backend/Dockerfile"
   - Add env var: `OPENROUTER_API_KEY=your_key_here`
   - Deploy

2. **Create Frontend Service**
   - In the same project, click "+ New" → "Service" → "GitHub repo"
   - Select repo, choose "frontend/Dockerfile"
   - Add env var: `BACKEND_URL=model-arena-backend.railway.internal`
   - Deploy

3. **Access Your App**
   - Frontend URL shown in Railway dashboard
   - Auto-deploys on git push
   - Check logs if issues arise

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
