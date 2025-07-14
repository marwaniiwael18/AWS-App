#!/bin/bash

# Manual Frontend S3 Bucket Fix
# This script manually creates and configures the S3 bucket for frontend hosting

BUCKET_NAME="skillswap-frontend-prod"
REGION="eu-north-1"

echo "🔧 Manual Frontend Fix Script"
echo "=============================="
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is configured
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

# Check if bucket exists
echo "🔍 Checking if bucket exists..."
if aws s3api head-bucket --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null; then
    echo "✅ Bucket exists"
else
    echo "❌ Bucket does not exist. Creating..."
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    echo "✅ Bucket created"
fi

# Enable static website hosting
echo "🌐 Configuring static website hosting..."
aws s3 website "s3://$BUCKET_NAME" --index-document index.html --error-document index.html --region "$REGION"
echo "✅ Website hosting enabled"

# Set bucket policy for public read access
echo "🔓 Setting bucket policy for public access..."
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://bucket-policy.json --region "$REGION"
rm bucket-policy.json
echo "✅ Bucket policy set"

# Disable public access blocks (required for website hosting)
echo "🔐 Disabling public access blocks..."
aws s3api put-public-access-block --bucket "$BUCKET_NAME" --region "$REGION" \
  --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false
echo "✅ Public access blocks disabled"

# Build and deploy frontend
echo "🏗️ Building and deploying frontend..."
cd frontend
echo "📦 Installing dependencies..."
npm ci

echo "🏗️ Building frontend with production API..."
VITE_API_URL="https://jm11mtpkb9.execute-api.eu-north-1.amazonaws.com/prod" \
VITE_BYPASS_AUTH=false \
npm run build

echo "📤 Uploading to S3..."
aws s3 sync dist/ "s3://$BUCKET_NAME/" --delete --region "$REGION"

cd ..
echo "✅ Frontend deployed"

# Test the deployment
echo "🧪 Testing deployment..."
sleep 10
FRONTEND_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Frontend is now accessible!"
    echo "🌐 URL: $FRONTEND_URL"
else
    echo "⚠️ Frontend might need a few more minutes for DNS propagation"
    echo "🌐 URL: $FRONTEND_URL"
    echo "📝 Try accessing it in 5-10 minutes"
fi

echo ""
echo "🎉 Manual frontend fix completed!"
echo "📋 Summary:"
echo "   • Bucket: $BUCKET_NAME"
echo "   • Website URL: $FRONTEND_URL"
echo "   • Backend API: https://jm11mtpkb9.execute-api.eu-north-1.amazonaws.com/prod" 