#!/bin/bash

echo "🔍 Frontend Status Checker"
echo "=========================="

FRONTEND_URL="http://skillswap-frontend-prod.s3-website.eu-north-1.amazonaws.com"
MAX_ATTEMPTS=10
ATTEMPT=1

echo "🌐 Testing: $FRONTEND_URL"
echo ""

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "🔄 Attempt $ATTEMPT/$MAX_ATTEMPTS..."
    
    # Test with curl
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ SUCCESS! Frontend is working!"
        echo "🌐 URL: $FRONTEND_URL"
        echo "📱 Open in browser to test the app"
        exit 0
    elif [ "$HTTP_CODE" = "000" ]; then
        echo "❌ DNS resolution failed (NXDOMAIN)"
    else
        echo "⚠️  HTTP Status: $HTTP_CODE"
    fi
    
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        echo "⏱️  Waiting 30 seconds before next attempt..."
        sleep 30
    fi
    
    ((ATTEMPT++))
done

echo ""
echo "❌ Frontend still not accessible after $MAX_ATTEMPTS attempts"
echo "💡 Check GitHub Actions deployment status"
echo "🔗 https://github.com/marwaniiwael18/AWS-App/actions" 