#!/bin/bash

# Test Deployment Script
# Quick verification that both frontend and backend are working

echo "🧪 SkillSwap Deployment Test"
echo "============================"
echo ""

# Test Backend
echo "🔗 Testing Backend API..."
BACKEND_URL="https://jm11mtpkb9.execute-api.eu-north-1.amazonaws.com/prod/health"
backend_response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" || echo "000")

if [ "$backend_response" = "200" ]; then
    echo "✅ Backend API: WORKING"
    echo "   Health endpoint returns 200 OK"
else
    echo "❌ Backend API: FAILED"
    echo "   Status code: $backend_response"
fi

echo ""

# Test Frontend
echo "🌐 Testing Frontend Website..."
FRONTEND_URL="http://skillswap-frontend-prod.s3-website-eu-north-1.amazonaws.com"
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")

if [ "$frontend_response" = "200" ]; then
    echo "✅ Frontend Website: WORKING"
    echo "   Successfully loading React app"
else
    echo "❌ Frontend Website: FAILED"
    echo "   Status code: $frontend_response"
    echo "   💡 Run './manual-frontend-fix.sh' to fix S3 configuration"
fi

echo ""

# Summary
echo "📋 Summary:"
if [ "$backend_response" = "200" ] && [ "$frontend_response" = "200" ]; then
    echo "🎉 All systems operational!"
    echo "🌐 Access your app: $FRONTEND_URL"
elif [ "$backend_response" = "200" ]; then
    echo "⚠️  Backend working, frontend needs fixing"
    echo "🔧 Run: ./manual-frontend-fix.sh"
else
    echo "❌ Major issues detected - check AWS console"
fi

echo ""
echo "🔗 Quick Links:"
echo "   Frontend: $FRONTEND_URL" 
echo "   Backend:  https://jm11mtpkb9.execute-api.eu-north-1.amazonaws.com/prod"
echo "   API Docs: https://jm11mtpkb9.execute-api.eu-north-1.amazonaws.com/prod/api/docs" 