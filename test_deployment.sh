#!/bin/bash
# Deployment Test Script
# Usage: ./test_deployment.sh https://your-app-name.onrender.com

if [ $# -eq 0 ]; then
    echo "Usage: $0 <your-render-url>"
    echo "Example: $0 https://attendance-backend.onrender.com"
    exit 1
fi

BASE_URL=$1
echo "🧪 Testing deployment at: $BASE_URL"
echo "=================================="

# Test 1: Health Check
echo "1. 🏥 Health Check..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/")
if echo "$HEALTH_RESPONSE" | grep -q "Smartworld Developers Attendance System"; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    echo "Response: $HEALTH_RESPONSE"
fi

# Test 2: API Root
echo ""
echo "2. 🔌 API Root..."
API_RESPONSE=$(curl -s "$BASE_URL/api/")
if echo "$API_RESPONSE" | grep -q "Smartworld Developers Attendance System"; then
    echo "✅ API root accessible"
else
    echo "❌ API root failed"
    echo "Response: $API_RESPONSE"
fi

# Test 3: Login Test
echo ""
echo "3. 🔐 Login Test..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/login" \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo "✅ Login successful"
    echo "✅ Authentication system working"
else
    echo "❌ Login failed"
    echo "Response: $LOGIN_RESPONSE"
fi

# Test 4: Extract and test JWT token
echo ""
echo "4. 🎫 Token Validation..."
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('access_token', ''))
except:
    print('')
")

if [ -n "$TOKEN" ]; then
    echo "✅ JWT token extracted successfully"
    
    # Test authenticated endpoint
    ME_RESPONSE=$(curl -s "$BASE_URL/api/me" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$ME_RESPONSE" | grep -q "username"; then
        echo "✅ Authenticated endpoint working"
    else
        echo "❌ Authenticated endpoint failed"
        echo "Response: $ME_RESPONSE"
    fi
else
    echo "❌ No JWT token received"
fi

echo ""
echo "=================================="
echo "🎯 DEPLOYMENT TEST SUMMARY"
echo "=================================="
echo "Your attendance management system should now be fully functional!"
echo ""
echo "📱 Demo Credentials:"
echo "  Admin: admin / admin123"
echo "  President: president / president123"
echo "  Head: head1 / head123"
echo "  User: user1 / user123"
echo ""
echo "🎉 Visit your application at: $BASE_URL"