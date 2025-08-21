# 🚀 CSVGenie Deployment Guide

This guide will help you deploy your CSV Generator app to production using Render (backend) and Vercel (frontend).

## 📋 Prerequisites

- Git repository initialized and committed
- GitHub account (for connecting to deployment platforms)
- Render account (free tier available)
- Vercel account (free tier available)

## 🔧 Backend Deployment (Render)

### Option 1: Using Render Blueprint (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy using the script:**
   ```bash
   chmod +x deploy-backend.sh
   ./deploy-backend.sh
   ```

3. **Manual deployment steps:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder
   - Configure:
     - **Name:** `csvgenie-backend`
     - **Environment:** `Python 3`
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Click "Create Web Service"

### Option 2: Using Docker

1. **Build and push Docker image:**
   ```bash
   docker build -t csvgenie-backend .
   docker tag csvgenie-backend your-registry/csvgenie-backend:latest
   docker push your-registry/csvgenie-backend:latest
   ```

2. **Deploy on Render:**
   - Use the Docker deployment option
   - Set the image URL to your registry

### Environment Variables

Set these in your Render service:

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `8000` | Port for the application |
| `DEBUG` | `false` | Production mode |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Frontend URL for CORS |

## 🎨 Frontend Deployment (Vercel)

### Option 1: Using Vercel CLI (Recommended)

1. **Deploy using the script:**
   ```bash
   chmod +x deploy-frontend.sh
   ./deploy-frontend.sh
   ```

2. **Manual deployment steps:**
   ```bash
   cd frontend
   npm install
   npm run build
   vercel --prod
   ```

### Option 2: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
5. Click "Deploy"

### Environment Variables

Set these in your Vercel project:

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend.onrender.com` | Backend API URL |

## 🔗 Connecting Frontend and Backend

### 1. Update CORS Settings

After deploying your backend, update the `ALLOWED_ORIGINS` in `render.yaml`:

```yaml
- key: ALLOWED_ORIGINS
  value: "https://your-frontend-name.vercel.app,http://localhost:3000"
```

### 2. Update Frontend API URL

After deploying your frontend, set the environment variable in Vercel:

```bash
vercel env add REACT_APP_API_URL
# Enter: https://your-backend-name.onrender.com
```

## 🧪 Testing Your Deployment

### Backend Health Check
```bash
curl https://your-backend-name.onrender.com/health
```

### Frontend Test
1. Open your Vercel URL
2. Try uploading a test file
3. Check browser console for API calls

## 🔄 Continuous Deployment

Both platforms support automatic deployments:

- **Render:** Automatically deploys on git push to main branch
- **Vercel:** Automatically deploys on git push to main branch

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check `ALLOWED_ORIGINS` in backend
   - Ensure frontend URL is correct

2. **Build Failures:**
   - Check dependency versions
   - Verify Python/Node.js versions

3. **Environment Variables:**
   - Ensure all required variables are set
   - Check variable names match exactly

### Debug Mode

To enable debug mode temporarily:
```bash
# Backend
vercel env add DEBUG
# Enter: true

# Frontend
vercel env add REACT_APP_DEBUG
# Enter: true
```

## 📊 Monitoring

- **Render:** Built-in logs and metrics
- **Vercel:** Built-in analytics and performance monitoring

## 💰 Cost Optimization

- **Free Tiers:**
  - Render: 750 hours/month
  - Vercel: Unlimited static sites
- **Upgrade when needed:**
  - More compute resources
  - Custom domains
  - Advanced features

## 🎯 Next Steps

1. Set up custom domains
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Implement CI/CD pipelines
5. Add database (Supabase/PlanetScale) if needed

---

**Need help?** Check the platform documentation:
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
