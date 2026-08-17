# Deployment Documentation

## GitHub Pages Deployment

### Setup Steps:

1. **Configure Repository Settings:**
   - Go to your GitHub repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

2. **Add Environment Variables (Optional):**
   - Go to repository Settings → Actions → Variables
   - Add any custom environment variables you need

3. **Add Secrets (Optional):**
   - Go to repository Settings → Actions → Secrets
   - Add secrets like `VITE_GOOGLE_CLIENT_ID`, `VITE_GITHUB_CLIENT_ID`, etc.

4. **Trigger Deployment:**
   - Push to `main` branch or manually trigger workflow
   - Go to Actions → "Deploy to GitHub Pages" → Run workflow

5. **Custom Domain (Optional):**
   - Add a `CNAME` file with your domain
   - Update DNS settings for your domain

### Environment Variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BASE_PATH` | Base path for GitHub Pages | `/repository-name/` |
| `VITE_API_URL` | Backend API URL | `/api` |
| `VITE_SOCKET_URL` | WebSocket server URL | `http://localhost:5000` |
| `VITE_ENABLE_AI_FEATURES` | Enable AI features | `false` |
| `VITE_ENABLE_NOTIFICATIONS` | Enable notifications | `false` |
| `VITE_ENABLE_COLLABORATION` | Enable collaboration | `false` |
| `VITE_ENABLE_REALTIME` | Enable realtime features | `false` |

---

## Render Deployment

### Setup Steps:

1. **Connect to Render:**
   - Go to [render.com](https://render.com)
   - Sign in with GitHub
   - Click "New +" → "Blueprint"

2. **Connect Repository:**
   - Select your repository
   - Render will detect the `render.yaml` file

3. **Configure Environment Variables:**
   - For Frontend: Set static site variables
   - For Backend: Set MongoDB URI, JWT secret, API keys, etc.

4. **Deploy:**
   - Click "Apply" to create services
   - Wait for deployment to complete

### Required Backend Secrets:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `EMAIL_USER` | Email service username |
| `EMAIL_PASS` | Email service password |
| `CLIENT_URL` | Frontend URL for CORS |
| `SESSION_SECRET` | Session signing secret |

### Free Tier Limitations:

- **Frontend:** Free static site hosting
- **Backend:** Free web services spin down after 15 minutes of inactivity
- **Database:** Free tier available with limited storage

### Custom Domain:

1. Go to service dashboard
2. Click "Settings" → "Custom Domain"
3. Add your domain
4. Update DNS records as instructed

---

## Netlify Deployment

### Setup Steps:

1. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select repository

2. **Build Settings:**
   - Build command: `cd frontend && pnpm install && pnpm build`
   - Publish directory: `frontend/dist`

3. **Environment Variables:**
   - Add all `VITE_*` variables in Site Settings → Build & Deploy → Environment

4. **Deploy:**
   - Click "Deploy site"
   - Subsequent pushes to `main` will auto-deploy

---

## Local Development

```bash
# Frontend
cd frontend
pnpm install
pnpm dev

# Backend
cd backend
pnpm install
pnpm dev

# Or use Docker Compose
docker-compose up -d
```

---

## Troubleshooting

### GitHub Pages 404 on refresh:
- Ensure SPA routing is handled (configured in workflow)
- Check `VITE_BASE_PATH` matches your repository name

### Backend connection errors:
- Verify `VITE_API_URL` points to correct backend URL
- Check CORS settings in backend
- Ensure backend service is running

### Environment variables not working:
- Variables must start with `VITE_` prefix
- Rebuild application after changing variables
- Clear browser cache
