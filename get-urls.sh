#!/bin/bash

# SkillSwap Application URLs
echo "🚀 SkillSwap Application URLs"
echo "=============================="
echo ""

# Backend API
echo "🔗 Backend API:"
echo "   https://jm11mtpkb9.execute-api.eu-north-1.amazonaws.com/prod"
echo "   Health: https://jm11mtpkb9.execute-api.eu-north-1.amazonaws.com/prod/health"
echo "   Docs:   https://jm11mtpkb9.execute-api.eu-north-1.amazonaws.com/prod/api/docs"
echo ""

# Frontend Website
echo "🌐 Frontend Website:"
echo "   http://skillswap-frontend-prod.s3-website-eu-north-1.amazonaws.com"
echo ""

# Test status
echo "📊 Quick Status Check:"
echo -n "   Backend: "
if curl -s "https://jm11mtpkb9.execute-api.eu-north-1.amazonaws.com/prod/health" > /dev/null 2>&1; then
    echo "✅ Online"
else
    echo "❌ Offline"
fi

echo -n "   Frontend: "
if curl -s "http://skillswap-frontend-prod.s3-website-eu-north-1.amazonaws.com" > /dev/null 2>&1; then
    echo "✅ Online"
else
    echo "❌ Offline (S3 website hosting issue)"
fi

echo ""
echo "💡 Run this script anytime with: ./get-urls.sh" 