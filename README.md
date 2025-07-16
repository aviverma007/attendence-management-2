# 🏢 Smartworld Developers Attendance Management System

A comprehensive **full-stack** attendance management system built with FastAPI backend and React frontend.

## 🎉 **FULL-STACK WEB APPLICATION**

**✅ Complete Web Application:** Frontend + Backend served together on single deployment

## 🚀 **Key Features**

### **📱 React Frontend**
- Beautiful, modern UI with Tailwind CSS
- Dashboard with real-time attendance stats
- Interactive charts and analytics
- Dark/Light mode toggle
- Mobile-responsive design
- Role-based interface

### **⚡ FastAPI Backend**
- High-performance async API
- JWT authentication
- Role-based permissions
- MongoDB integration
- Automatic data initialization

### **🏢 Multi-Site Management**
- **9 Sites**: Smartworld HQ, Delhi Branch, Bangalore Tech Park, Chennai Office, Hyderabad Hub, Pune Center, Kolkata Branch, Ahmedabad Office, Noida Extension

### **👥 Team Organization**
- **10 Teams**: Frontend Development, Backend Development, DevOps, QA Testing, Mobile Development, Data Science, UI/UX Design, Product Management, Sales, HR

### **📊 Core Functionality**
- Real-time attendance dashboard
- Employee management (Add/Edit/Delete)
- Leave management system
- Site-wise and team-wise analytics
- Role-based access control
- Advanced reporting

## 🛠️ **Technology Stack**

### **Backend**
- **FastAPI 0.110.0** - Modern Python web framework
- **pydantic 1.10.21** - Data validation (Python 3.13 compatible)
- **Motor 3.3.2** - Async MongoDB driver
- **JWT Authentication** - Secure token-based auth
- **bcrypt** - Password hashing
- **Python 3.13** - Latest Python runtime

### **Frontend**
- **React 19.0.0** - Modern React framework
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful icons
- **Recharts** - Data visualization
- **Axios** - HTTP client

### **Database**
- **MongoDB Atlas** - Cloud database
- **Async operations** - High performance
- **Proper indexing** - Optimized queries

## 🎯 **Demo Credentials**

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | admin | admin123 | Full system access |
| **President** | president | president123 | All sites access |
| **Head** | head1 | head123 | Team management |
| **User** | user1 | user123 | Basic access |

## 📋 **API Endpoints**

### **Authentication**
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Current user info

### **Attendance**
- `GET /api/attendance/today` - Today's attendance
- `GET /api/attendance/stats` - Overall statistics
- `GET /api/attendance/team-stats` - Team-wise statistics
- `GET /api/attendance/site-stats` - Site-wise statistics

### **Employee Management**
- `GET /api/employees` - List employees
- `POST /api/employees` - Add employee
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee

### **Sites & Teams**
- `GET /api/sites` - List sites
- `GET /api/teams` - List teams

### **Leave Management**
- `POST /api/leaves` - Apply for leave
- `GET /api/leaves` - List leave requests

### **User Management (Admin only)**
- `GET /api/users` - List users
- `POST /api/users` - Create user

## 🚀 **Full-Stack Deployment Guide**

### **For Render.com (Recommended)**

1. **Repository Setup:**
   ```bash
   git clone your-repo
   cd attendance-management
   ```

2. **Create Render Web Service:**
   - Connect your GitHub repository
   - Runtime: Python 3.13
   - **Build Command**: `./build.sh`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables (Optional):**
   ```bash
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=attendance_db
   JWT_SECRET_KEY=your-secret-key
   ```

4. **Deploy and Access:**
   - Your app will be available at: `https://your-app.onrender.com`
   - Frontend: Accessible at root URL
   - Backend API: Available at `/api/` endpoints

### **How the Full-Stack Works:**

1. **Build Process** (`build.sh`):
   - Installs Python dependencies
   - Installs Node.js and builds React app
   - Creates production-ready frontend in `frontend/build/`

2. **Runtime** (`server.py`):
   - FastAPI serves API endpoints under `/api/`
   - FastAPI serves React app for all other routes
   - Single deployment, single URL

3. **Result**: 
   - Users see beautiful React frontend
   - Frontend communicates with FastAPI backend
   - Complete web application experience

### **Local Development**

1. **Clone repository:**
   ```bash
   git clone https://github.com/yourusername/attendance-management.git
   cd attendance-management
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Create .env file
   echo "MONGO_URL=mongodb://localhost:27017" > .env
   echo "DB_NAME=attendance_db" >> .env
   echo "JWT_SECRET_KEY=your-local-secret-key" >> .env
   
   # Start backend
   uvicorn server:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   yarn install
   yarn start
   ```

## 🧪 **Testing**

### **API Testing**
```bash
# Test all endpoints
curl https://attendence-management-1oi9.onrender.com/api/

# Test authentication
curl -X POST https://attendence-management-1oi9.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Test attendance stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://attendence-management-1oi9.onrender.com/api/attendance/stats
```

### **Frontend Testing**
- Navigate to deployed frontend URL
- Test login with demo credentials
- Verify dashboard functionality
- Test employee management
- Check responsive design

## 🔧 **Configuration**

### **Environment Variables**
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `JWT_SECRET_KEY` - JWT secret key
- `PIP_ONLY_BINARY` - Force binary packages (for Render)

### **Database Schema**
- **Users**: Authentication and permissions
- **Employees**: Employee information
- **Attendance**: Daily attendance records
- **Sites**: Office locations
- **Teams**: Department organization
- **Leaves**: Leave requests and approvals

## 🎊 **Sample Data**

The system automatically initializes with:
- **9 Sites** across major Indian cities
- **10 Teams** covering all departments
- **20+ Employees** with realistic data
- **Sample attendance** for current date
- **Demo users** with different role levels

## 📊 **Statistics Dashboard**

- **Overall Statistics**: Total employees, present, absent, late percentages
- **Team-wise Analytics**: Performance by team with member lists
- **Site-wise Analytics**: Multi-location attendance tracking
- **Real-time Updates**: Live attendance status
- **Visual Charts**: Graphical representation of data

## 🔐 **Security Features**

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Role-based Access Control** - Different permission levels
- **Input Validation** - pydantic for data validation
- **CORS Configuration** - Proper cross-origin setup

## 📱 **Mobile Responsive**

- **Tailwind CSS** - Mobile-first design
- **Responsive Layout** - Works on all devices
- **Touch-friendly** - Optimized for mobile interaction
- **Fast Loading** - Optimized performance

## 🚨 **Troubleshooting**

### **Common Issues**

1. **MongoDB Connection Error**
   - Check connection string format
   - Verify database user permissions
   - Ensure IP whitelist includes `0.0.0.0/0`

2. **Authentication Fails**
   - Initialize sample data: `POST /api/init-data`
   - Use correct credentials: admin/admin123
   - Check JWT secret key configuration

3. **Build Errors**
   - Ensure Python 3.13 compatibility
   - Use `--only-binary=:all:` flag
   - Check all dependencies are compatible

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🙏 **Acknowledgments**

- Built with modern web technologies
- Deployed successfully on Render
- Optimized for production use
- Comprehensive documentation

## 📞 **Support**

For support and questions:
- Check the troubleshooting section
- Review API documentation
- Test with provided demo credentials

---

**🎉 Ready to use! Your attendance management system is production-ready and deployed successfully!**

**Live URL**: https://attendence-management-1oi9.onrender.com

**Test it now**: Try logging in with `admin/admin123` and explore all features!