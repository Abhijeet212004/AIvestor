# AIvestor - Financial AI Assistant

## Deployment Guide for Render

This document provides step-by-step instructions for deploying the AIvestor application on Render.

### Project Structure

AIvestor consists of:

1. **Frontend**: React application
2. **Backend Services**:
   - Chatbot Server (Python Flask)
   - Stock Data Server (Python Flask)
   - Upstox Server (Node.js)

### Deployment Instructions

#### 1. Create a Render Account

- Sign up at [render.com](https://render.com) if you don't have an account

#### 2. Deploy Backend API (Combined Server)

1. From your Render dashboard, click **New** and select **Web Service**
2. Connect your GitHub repository containing the AIvestor code
3. Configure the service with these settings:
   - **Name**: `aivestor-api`
   - **Environment**: `Docker`
   - **Build Command**: Leave empty (handled by Dockerfile)
   - **Start Command**: Leave empty (handled by Dockerfile)
   - **Plan**: Select an appropriate plan (at least 1GB RAM recommended)

4. Add the following environment variables under the "Environment" tab:
   - `UPSTOX_API_KEY`: Your Upstox API key
   - `UPSTOX_ACCESS_TOKEN`: Your Upstox access token
   - `RAPIDAPI_KEY`: Your RapidAPI key for Yahoo Finance
   - `GOOGLE_API_KEY`: Your Google AI API key for chatbot functionality
   - `PORT`: 8080
   - Add any Firebase credentials if you're using Firebase

5. Click **Create Web Service**

#### 3. Deploy Frontend

1. From your Render dashboard, click **New** and select **Static Site**
2. Connect your GitHub repository containing the AIvestor code
3. Configure the service with these settings:
   - **Name**: `aivestor-frontend`
   - **Build Command**: `cd finai-assistant && npm install && npm run build`
   - **Publish Directory**: `finai-assistant/build`
   - **Plan**: Free plan is usually sufficient

4. Add the following environment variable:
   - `REACT_APP_API_URL`: URL of your backend API service from step 2 (ex: https://aivestor-api.onrender.com)

5. Click **Create Static Site**

### Important Notes

1. The combined server approach allows all three backend services to run within a single Render instance, saving costs
2. If you encounter issues, check the logs in the Render dashboard
3. Set up automatic deploys to update when you push changes to GitHub
4. For improved reliability, consider upgrading to a paid plan on Render

### Local Development

To run the application locally after cloning the repository:

1. Install dependencies:
   ```bash
   npm install
   cd finai-assistant
   npm install
   ```

2. Create a `.env` file in the root directory based on `.env.sample`

3. Start the services using the start.bat script (Windows) or manually start each service

### Troubleshooting

If you encounter issues with the deployment:

1. Verify all environment variables are correctly set
2. Check the Render logs for error messages
3. Ensure your API keys for external services are valid
4. Check if your local .env file contains all required variables before pushing to GitHub