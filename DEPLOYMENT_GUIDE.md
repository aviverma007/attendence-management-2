# Render.com Deployment Guide for Attendance Management System

## Prerequisites

Before deploying to Render, make sure you have:

1. **MongoDB Atlas Account** (free tier available)
2. **Render.com Account** (free tier available)
3. **GitHub Repository** with your code

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority`)

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Fork/Clone this repository** to your GitHub account

2. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign in and go to your dashboard

3. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select this repository

4. **Configure Environment Variables**
   Add these environment variables in Render:
   ```
   MONGO_URL=your-mongodb-atlas-connection-string
   DB_NAME=attendance_db
   JWT_SECRET_KEY=your-super-secret-jwt-key
   ```

5. **Deploy**
   - Render will automatically use the `render.yaml` configuration
   - The build should complete successfully

### Option B: Manual Configuration

If render.yaml doesn't work:

1. **Create New Web Service**
   - Runtime: Python 3.11
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port 10000`

2. **Set Environment Variables** (same as above)

## Step 3: Verify Deployment

After deployment, test these endpoints:

1. **Health Check**: `https://your-app-name.onrender.com/`
2. **API Root**: `https://your-app-name.onrender.com/api/`
3. **Login**: `https://your-app-name.onrender.com/api/login`

## Common Issues and Solutions

### 1. Build Failure with pydantic-core

If you get Rust compilation errors:
- The requirements.txt has been updated with compatible versions
- Make sure runtime.txt specifies Python 3.11.9

### 2. MongoDB Connection Issues

- Ensure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` for Render
- Check that your connection string is correct
- Make sure the database user has proper permissions

### 3. Environment Variables

Critical environment variables:
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name
DB_NAME=attendance_db
JWT_SECRET_KEY=your-random-secret-key
```

## Sample Environment Configuration

For testing, you can use these sample values:

```
MONGO_URL=mongodb+srv://test:test123@cluster0.mongodb.net/attendance_db?retryWrites=true&w=majority
DB_NAME=attendance_db
JWT_SECRET_KEY=smartworld-attendance-secret-2024
```

## Post-Deployment Setup

1. **Initialize Sample Data**
   - The app will automatically create sample data on first run
   - This includes 9 sites, 10 teams, and 20+ employees

2. **Test Login**
   - Default admin credentials: `admin` / `admin123`
   - Other test users are available in the system

3. **Frontend Deployment** (if needed)
   - The frontend can be deployed separately on Render
   - Update `REACT_APP_BACKEND_URL` to point to your backend URL

## Support

If you encounter issues:
1. Check Render build logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas is properly configured
4. Check that your GitHub repository is up to date

## Alternative: Local Development

To run locally:
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload

# Frontend (separate terminal)
cd frontend
yarn install
yarn start
```

Make sure to update the `.env` files with your local MongoDB connection.