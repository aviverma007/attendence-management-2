# Full-Stack Deployment Guide for Render.com

## 🚀 Overview
This is a complete full-stack attendance management system with:
- **Backend**: FastAPI with MongoDB
- **Frontend**: React with Tailwind CSS
- **Features**: 9 sites, 10 teams, employee management, attendance tracking, role-based access

## 📋 Deployment Configuration

### Build Settings
- **Build Command**: `./build.sh`
- **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- **Runtime**: Python 3.13

### Environment Variables
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=attendance_db
JWT_SECRET_KEY=smartworld-secret-key-2024
```

### Port Configuration
- The app will run on the port provided by Render in the `$PORT` environment variable
- Frontend and backend are served from the same port (full-stack setup)

## 🔧 How It Works

1. **Build Process** (`build.sh`):
   - Installs Python dependencies
   - Installs Node.js and Yarn
   - Builds React frontend into `/frontend/build/`
   - Creates optimized production build

2. **Runtime** (`server.py`):
   - FastAPI serves API endpoints under `/api/`
   - FastAPI serves React static files for all other routes
   - Single-port deployment (full-stack)

## 🌐 Access Your App

After deployment:
- **Frontend**: Your main Render URL (e.g., `https://your-app.onrender.com`)
- **API**: Your Render URL + `/api/` (e.g., `https://your-app.onrender.com/api/`)

## 🔑 Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## 🎯 Features Available

### For Admin Users:
- Dashboard with attendance overview
- Team attendance visualization with charts
- Site-wise analytics
- Employee management (add/edit/delete)
- User management (create users with roles)
- Dark/Light mode toggle

### Role-Based Access:
- **Admin**: Full access to all features
- **President**: View all sites, manage employees
- **Head**: View team data, manage team attendance
- **User**: View own data, apply for leave

## 📊 Sample Data

The system comes with pre-populated data:
- 9 sites across different locations
- 10 teams (Frontend, Backend, DevOps, QA, etc.)
- 20+ employees with realistic attendance data
- Multiple user roles for testing

## 🛠️ Technical Details

### Backend Stack:
- FastAPI (Python)
- MongoDB (database)
- JWT authentication
- Role-based permissions
- Async/await pattern

### Frontend Stack:
- React 19
- Tailwind CSS
- Chart.js for visualizations
- Axios for API calls
- Heroicons for icons

## 🔄 Database

The system uses MongoDB with automatic initialization:
- Creates sample data on first run
- Supports attendance tracking with biometric simulation
- Leave management system
- User authentication and authorization

## 🚀 Deployment Steps

1. Connect your repository to Render
2. Set build command to `./build.sh`
3. Set start command to `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (optional - defaults provided)
5. Deploy!

Your full-stack attendance management system will be live and accessible as a web application!