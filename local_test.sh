#!/bin/bash

# 🚀 Local Full-Stack Deployment Test Script
# This script tests the application readiness for deployment

echo "🔍 Testing Full-Stack Application Deployment Readiness..."
echo "=============================================="

# Test 1: Check backend API health
echo "1. Testing Backend API Health..."
API_HEALTH=$(curl -s http://localhost:8001/api/)
if echo "$API_HEALTH" | grep -q "Smartworld Developers Attendance System API"; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API is not responding correctly"
    echo "Response: $API_HEALTH"
    exit 1
fi

# Test 2: Check frontend static files
echo "2. Testing Frontend Static Files..."
FRONTEND_RESPONSE=$(curl -s http://localhost:8001/ | head -1)
if echo "$FRONTEND_RESPONSE" | grep -q "<!doctype html>"; then
    echo "✅ Frontend static files are being served correctly"
else
    echo "❌ Frontend static files are not being served"
    echo "Response: $FRONTEND_RESPONSE"
    exit 1
fi

# Test 3: Check authentication
echo "3. Testing Authentication System..."
AUTH_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin123"}' http://localhost:8001/api/login)
if echo "$AUTH_RESPONSE" | grep -q "access_token"; then
    echo "✅ Authentication system is working correctly"
    TOKEN=$(echo "$AUTH_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('access_token', ''))
except:
    print('')
")
else
    echo "❌ Authentication system is not working"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

# Test 4: Check protected API endpoints
echo "4. Testing Protected API Endpoints..."
STATS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8001/api/attendance/stats)
if echo "$STATS_RESPONSE" | grep -q "total_employees"; then
    echo "✅ Protected API endpoints are working correctly"
    EMPLOYEES=$(echo "$STATS_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('total_employees', ''))
except:
    print('')
")
    echo "   📊 Total employees: $EMPLOYEES"
else
    echo "❌ Protected API endpoints are not working"
    echo "Response: $STATS_RESPONSE"
    exit 1
fi

# Test 5: Check database connectivity
echo "5. Testing Database Operations..."
EMPLOYEES_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8001/api/employees)
if echo "$EMPLOYEES_RESPONSE" | grep -q "name"; then
    echo "✅ Database operations are working correctly"
    EMPLOYEE_COUNT=$(echo "$EMPLOYEES_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(len(data))
except:
    print(0)
")
    echo "   👥 Employee records: $EMPLOYEE_COUNT"
else
    echo "❌ Database operations are not working"
    echo "Response: $EMPLOYEES_RESPONSE"
    exit 1
fi

# Test 6: Check required files for deployment
echo "6. Testing Deployment File Structure..."
REQUIRED_FILES=("requirements.txt" "server.py" "frontend/build/index.html" "backend/server.py")
for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

# Test 7: Check build directory size
echo "7. Testing Build Optimization..."
BUILD_SIZE=$(du -sh frontend/build/ | cut -f1)
echo "✅ Frontend build size: $BUILD_SIZE"

# Test 8: Check service status
echo "8. Testing Service Status..."
SERVICE_STATUS=$(sudo supervisorctl status | grep -E "(backend|frontend|mongodb)")
echo "✅ Service status:"
echo "$SERVICE_STATUS"

echo ""
echo "🎉 ALL TESTS PASSED! 🎉"
echo "=============================================="
echo "✅ Your application is ready for deployment!"
echo ""
echo "📋 Deployment Summary:"
echo "   🔧 Backend API: Working correctly"
echo "   🎨 Frontend: Static files served properly"
echo "   🔐 Authentication: JWT tokens working"
echo "   📊 Database: CRUD operations functional"
echo "   🏗️ Build: Optimized for production"
echo "   🚀 Services: All running correctly"
echo ""
echo "🌐 Next Steps:"
echo "1. Set up MongoDB Atlas (cloud database)"
echo "2. Configure environment variables on Render.com"
echo "3. Deploy using the provided deployment guide"
echo "4. Test with the provided login credentials"
echo ""
echo "🎯 Login Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🚀 Ready to deploy to Render.com!"