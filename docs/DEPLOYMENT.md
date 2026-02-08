# Deployment Guide

This document provides instructions for deploying the AI Schedule Manager application to various platforms.

## Table of Contents
- [GitHub Pages](#github-pages)
- [Netlify](#netlify)
- [Render](#render)
- [Environment Variables](#environment-variables)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)

## GitHub Pages

### Prerequisites
- A GitHub repository with the application code
- GitHub Actions enabled for the repository

### Steps
1. Ensure your repository has a `main` branch
2. The GitHub Actions workflow will automatically deploy to GitHub Pages when changes are pushed to the `main` branch
3. Configure the following secrets in your GitHub repository settings:
   - `VITE_API_URL`: The URL of your backend API (e.g., `https://your-backend.herokuapp.com/api`)
   - `VITE_ENABLE_AI_FEATURES`: Enable AI features (`true` or `false`)
   - `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID (optional)
   - `VITE_GITHUB_CLIENT_ID`: GitHub OAuth client ID (optional)
   - Any other VITE_* environment variables you need

4. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Select "GitHub Actions" as the source

### Notes
- GitHub Pages only hosts the frontend application
- You'll need a separate backend service for API requests
- The frontend will be built and deployed automatically

## Netlify

### Prerequisites
- A Netlify account
- The application code in a Git repository

### Steps
1. Connect your Git repository to Netlify
2. Netlify will automatically detect the `netlify.toml` configuration file
3. Configure the following environment variables in Netlify dashboard:
   - `VITE_API_URL`: The URL of your backend API (e.g., `https://your-backend.herokuapp.com/api`)
   - `VITE_ENABLE_AI_FEATURES`: Enable AI features (`true` or `false`)
   - `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID (optional)
   - `VITE_GITHUB_CLIENT_ID`: GitHub OAuth client ID (optional)
   - Any other VITE_* environment variables you need

4. Deploy! Netlify will automatically build and deploy your application

### Custom Domain
1. In Netlify dashboard, go to Domain Settings
2. Add your custom domain
3. Update DNS records as instructed by Netlify

## Render

### Prerequisites
- A Render account
- The application code in a Git repository

### Steps
1. Connect your Git repository to Render
2. Render will automatically detect the `render.yaml` configuration file
3. The configuration sets up both frontend and backend services
4. Configure the following environment variables in Render dashboard:
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `OPENAI_API_KEY`: OpenAI API key (optional)
   - `EMAIL_USER`: Email username for sending notifications
   - `EMAIL_PASS`: Email password or app-specific password
   - `CLIENT_URL`: URL of your frontend application
   - Any other environment variables needed

5. Deploy! Render will automatically build and deploy both services

### Notes
- Render deploys both frontend and backend services
- The backend service serves as the API for the frontend
- Health checks are configured to monitor the backend service

## Environment Variables

### Frontend Variables (VITE_* prefix)
These variables are exposed to the frontend application:

- `VITE_API_URL`: Base URL for API requests (default: `/api`)
- `VITE_ENABLE_AI_FEATURES`: Enable AI features (`true` or `false`)
- `VITE_ENABLE_NOTIFICATIONS`: Enable notifications (`true` or `false`)
- `VITE_ENABLE_COLLABORATION`: Enable collaboration features (`true` or `false`)
- `VITE_ENABLE_REALTIME`: Enable real-time features (`true` or `false`)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `VITE_ANALYTICS_ID`: Analytics tracking ID
- `VITE_MAX_TASKS_PER_DAY`: Maximum tasks per day limit
- `VITE_MAX_TEAM_MEMBERS`: Maximum team members limit
- `VITE_IMAGE_UPLOAD_LIMIT`: Image upload size limit in bytes
- `VITE_DEBUG_MODE`: Enable debug mode (`true` or `false`)
- `VITE_MOCK_DATA`: Use mock data instead of API calls (`true` or `false`)
- `VITE_ASSET_BASE_URL`: Base URL for assets
- `VITE_SOCKET_URL`: WebSocket server URL
- `VITE_SOCKET_TIMEOUT`: WebSocket timeout in milliseconds

### Backend Variables
These variables are used by the backend application:

- `PORT`: Port number for the server (default: 5000)
- `NODE_ENV`: Environment mode (`development`, `production`, etc.)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT expiration time (e.g., `7d` for 7 days)
- `OPENAI_API_KEY`: OpenAI API key
- `OPENAI_MODEL`: OpenAI model to use (default: `gpt-4`)
- `EMAIL_USER`: Email username for sending notifications
- `EMAIL_PASS`: Email password or app-specific password
- `CLIENT_URL`: URL of the frontend application
- `MAX_FILE_SIZE`: Maximum file upload size in bytes
- `UPLOAD_PATH`: Directory for uploaded files
- `RATE_LIMIT_WINDOW_MS`: Time window for rate limiting in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per time window
- `SESSION_SECRET`: Secret key for session encryption
- `REDIS_URL`: Redis connection string (optional)
- `LOG_LEVEL`: Log level (`info`, `error`, `warn`, etc.)

## MongoDB Atlas Setup

### Steps
1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Add your IP address to the IP whitelist (or allow access from anywhere for development)
5. Get the connection string from the Atlas dashboard
6. Update the connection string with your database username and password
7. Use the connection string as the value for `MONGODB_URI` environment variable

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

### Example
```
mongodb+srv://myUser:myPassword@cluster0.ab123.mongodb.net/myDatabase?retryWrites=true&w=majority
```

### Security Best Practices
- Use strong passwords for database users
- Restrict IP addresses that can access your database
- Regularly rotate database credentials
- Monitor database access logs

## Troubleshooting

### Common Issues

#### GitHub Pages
- API requests may fail if the backend is not accessible from the browser
- Solution: Ensure your backend allows CORS from your GitHub Pages URL

#### Netlify
- Build failures due to missing dependencies
- Solution: Ensure all dependencies are listed in package.json

#### Render
- Backend service not starting
- Solution: Check logs in Render dashboard for error messages

### Debugging Tips
- Check browser console for frontend errors
- Check server logs for backend errors
- Verify all required environment variables are set
- Test API endpoints independently using tools like Postman