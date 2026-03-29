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
- Docker Hub account (optional, for image caching)
- OpenRouter API key

### Steps

1. **Connect your repo to Railway**
   - Go to railway.app and create a new project
   - Connect your GitHub repository
   - Select this repo

2. **Configure environment variables**
   - In Railway dashboard, go to your project
   - Click "+ New" → "Database" → select **PostgreSQL** (if using database)
   - Or create a new service for the backend

3. **Backend Service**
   - Railway will auto-detect the Dockerfile
   - Set environment variable: `OPENROUTER_API_KEY=your_key`
   - Note the internal URL (shows in Railway console)

4. **Frontend Service**
   - Build from `frontend/Dockerfile`
   - Set `BACKEND_URL=model-arena-backend.railway.internal` (Railway's internal networking)
   - Expose port 80

5. **Deploy**
   - Railway auto-deploys on git push
   - Monitor logs in the dashboard

---

## Render Deployment

### Prerequisites
- Render account (render.com)
- OpenRouter API key
- Git repository

### Steps

1. **Create Backend Service**
   - Go to render.com dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`
   - Set Runtime Path: `backend`
   - Environment Variables:
     - `OPENROUTER_API_KEY=your_key`
     - `DATA_DIR=/data`
   - Deploy

2. **Create Frontend Service**
   - Click "New +" → "Web Service"
   - Same repo
   - **Dockerfile Path**: `frontend/Dockerfile`
   - Environment Variables:
     - `BACKEND_URL=<your-backend-service>.onrender.com`
   - Deploy

3. **Connect Services**
   - Update `BACKEND_URL` in frontend to your backend's public URL
   - Redeploy frontend

4. **Verify**
   - Visit your frontend URL
   - Check browser console for any CORS/connection errors

---

## Common Issues & Fixes

### Issue: "Cannot GET /api/..."
**Cause**: Frontend cannot connect to backend
**Fix**:
- Check `BACKEND_URL` environment variable
- Verify backend service is running and healthy
- Check nginx logs in frontend container: `docker logs <frontend-container>`

### Issue: CORS errors in browser console
**Cause**: Backend CORS policy not configured correctly
**Fix**:
- Ensure `allow_origins=["*"]` in `main.py` is set
- Or replace with specific domain in production

### Issue: "502 Bad Gateway"
**Cause**: Backend service unreachable
**Fix**:
- Check backend health: `curl https://<backend-url>/api/health`
- Verify `BACKEND_URL` in frontend matches backend's public URL

### Issue: Build failing on Render/Railway
**Cause**: Missing dependencies
**Fix**:
- Ensure `requirements.txt` has all packages
- Ensure `package.json` has all npm dependencies
- Check Dockerfile build logs

---

## Production Tips

1. **Store API keys securely**
   - Use platform's secret/environment variable system
   - Never commit `.env` files
   - Rotate keys periodically

2. **Add health checks**
   - Both services have `/api/health` endpoint
   - Configure platform health checks accordingly

3. **Monitor logs**
   - Railway: Dashboard → Project → Service → Logs
   - Render: Dashboard → Service → Logs

4. **Set resource limits**
   - Backend: Min 512MB RAM
   - Frontend: Min 256MB RAM
   - Adjust based on usage

5. **Enable auto-deploys**
   - Both platforms support git push → auto-deploy
   - Configure in project settings

---

## Testing Connectivity

After deployment, test the API:

```bash
# Test health
curl https://<your-frontend-url>/api/health

# List models
curl https://<your-frontend-url>/api/models
```

If these work, the deployment is successful!
