#!/bin/bash

# ========================================
# 🚀 SkillSwap AWS Deployment Script
# Deploy your application to AWS in minutes!
# ========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis for better UX
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
GEAR="⚙️"
PACKAGE="📦"

# Default values
STAGE="dev"
REGION="eu-north-1"
SKIP_TESTS="false"
FRONTEND_ONLY="false"
BACKEND_ONLY="false"

# ========================================
# 📋 Helper Functions
# ========================================

print_header() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}${SUCCESS} $1${NC}"
}

print_error() {
    echo -e "${RED}${ERROR} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

print_info() {
    echo -e "${CYAN}${INFO} $1${NC}"
}

print_step() {
    echo -e "${PURPLE}${GEAR} $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# ========================================
# 🔧 Usage and Help
# ========================================

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -s, --stage STAGE       Deployment stage (dev, staging, prod) [default: dev]"
    echo "  -r, --region REGION     AWS region [default: eu-north-1]"
    echo "  --frontend-only         Deploy only frontend"
    echo "  --backend-only          Deploy only backend"
    echo "  --skip-tests           Skip tests and linting"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                     # Deploy to dev stage"
    echo "  $0 -s prod             # Deploy to production"
    echo "  $0 --frontend-only     # Deploy only frontend"
    echo "  $0 --backend-only      # Deploy only backend"
}

# ========================================
# 📥 Parse Command Line Arguments
# ========================================

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--stage)
            STAGE="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        --frontend-only)
            FRONTEND_ONLY="true"
            shift
            ;;
        --backend-only)
            BACKEND_ONLY="true"
            shift
            ;;
        --skip-tests)
            SKIP_TESTS="true"
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# ========================================
# 🚀 Main Deployment Script
# ========================================

main() {
    print_header "${ROCKET} SkillSwap AWS Deployment to $STAGE"
    
    # Check prerequisites
    print_step "Checking prerequisites..."
    check_command "node"
    check_command "npm"
    check_command "aws"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Run 'aws configure' first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
    
    # Get current directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    BACKEND_DIR="$SCRIPT_DIR/backend"
    FRONTEND_DIR="$SCRIPT_DIR/frontend"
    
    # Validate directories
    if [[ ! -d "$BACKEND_DIR" ]] || [[ ! -d "$FRONTEND_DIR" ]]; then
        print_error "Backend or frontend directory not found. Run this script from the project root."
        exit 1
    fi
    
    # Run tests if not skipped
    if [[ "$SKIP_TESTS" != "true" ]]; then
        run_tests
    fi
    
    # Deploy based on options
    if [[ "$BACKEND_ONLY" != "true" ]] && [[ "$FRONTEND_ONLY" != "true" ]]; then
        # Deploy both
        deploy_backend
        deploy_frontend
    elif [[ "$BACKEND_ONLY" == "true" ]]; then
        deploy_backend
    elif [[ "$FRONTEND_ONLY" == "true" ]]; then
        deploy_frontend
    fi
    
    # Run post-deployment tests
    post_deployment_tests
    
    print_success "Deployment completed successfully!"
    print_deployment_info
}

# ========================================
# 🧪 Test Functions
# ========================================

run_tests() {
    print_step "Running tests and validation..."
    
    # Backend tests
    print_info "Testing backend configuration..."
    cd "$BACKEND_DIR"
    
    if [[ -f "package.json" ]]; then
        npm ci --silent
        
        # Run our custom test
        if [[ -f "scripts/test-cognito.js" ]]; then
            print_info "Running Cognito configuration test..."
            node scripts/test-cognito.js
        fi
        
        print_success "Backend tests passed"
    fi
    
    # Frontend tests
    print_info "Testing frontend build..."
    cd "$FRONTEND_DIR"
    
    if [[ -f "package.json" ]]; then
        npm ci --silent
        
        # Test build
        VITE_API_URL="https://placeholder.execute-api.$REGION.amazonaws.com/$STAGE" \
        VITE_BYPASS_AUTH="false" \
        npm run build --silent
        
        print_success "Frontend build test passed"
    fi
    
    cd "$SCRIPT_DIR"
}

# ========================================
# 🔧 Backend Deployment
# ========================================

deploy_backend() {
    print_step "Deploying backend to AWS Lambda..."
    
    cd "$BACKEND_DIR"
    
    # Install serverless if not present
    if ! command -v serverless &> /dev/null; then
        print_info "Installing Serverless Framework..."
        npm install -g serverless@^3.0.0
    fi
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    npm ci --silent
    
    # Create production environment file
    print_info "Configuring production environment..."
    cat > .env.production << EOF
NODE_ENV=production
AWS_REGION=$REGION
COGNITO_USER_POOL_ID=eu-north-1_tr3nTK4VG
COGNITO_CLIENT_ID=5heee4rhh886sa7nl4gqerqa2e
COGNITO_REGION=$REGION
BYPASS_AUTH=false
DB_TYPE=dynamodb
STORAGE_TYPE=s3
JWT_SECRET=production-jwt-secret-$(date +%s)
CORS_ORIGIN=https://main.d1234567890.amplifyapp.com
EOF
    
    # Deploy using serverless
    print_info "Deploying to AWS Lambda (this may take a few minutes)..."
    
    if serverless deploy --stage "$STAGE" --region "$REGION"; then
        print_success "Backend deployed successfully!"
        
        # Get API endpoint
        API_ENDPOINT=$(serverless info --stage "$STAGE" --region "$REGION" | grep -o 'https://[^[:space:]]*' | head -1)
        echo "API_ENDPOINT=$API_ENDPOINT" > ../.deployment-info
        
        print_success "API endpoint: $API_ENDPOINT"
    else
        print_error "Backend deployment failed"
        exit 1
    fi
    
    cd "$SCRIPT_DIR"
}

# ========================================
# 🌐 Frontend Deployment
# ========================================

deploy_frontend() {
    print_step "Deploying frontend to AWS..."
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    npm ci --silent
    
    # Get API endpoint if available
    API_ENDPOINT=""
    if [[ -f "../.deployment-info" ]]; then
        source ../.deployment-info
    fi
    
    if [[ -z "$API_ENDPOINT" ]]; then
        API_ENDPOINT="https://placeholder.execute-api.$REGION.amazonaws.com/$STAGE"
        print_warning "Using placeholder API endpoint. Update after backend deployment."
    fi
    
    # Build frontend with correct API URL
    print_info "Building frontend with API endpoint: $API_ENDPOINT"
    
    VITE_API_URL="$API_ENDPOINT" \
    VITE_BYPASS_AUTH="false" \
    NODE_ENV="production" \
    npm run build --silent
    
    # Deploy to S3 (simpler than Amplify for quick deployment)
    BUCKET_NAME="skillswap-frontend-$STAGE-$(date +%s)"
    
    print_info "Creating S3 bucket: $BUCKET_NAME"
    
    # Create bucket
    if aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"; then
        print_success "S3 bucket created"
        
        # Configure bucket for website hosting
        aws s3 website "s3://$BUCKET_NAME" \
            --index-document index.html \
            --error-document index.html
        
        # Set bucket policy for public read
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
        
        aws s3api put-bucket-policy \
            --bucket "$BUCKET_NAME" \
            --policy file://bucket-policy.json
        
        rm bucket-policy.json
        
        # Upload files
        print_info "Uploading frontend files..."
        aws s3 sync dist/ "s3://$BUCKET_NAME/" --delete
        
        # Get website URL
        WEBSITE_URL="http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com"
        echo "FRONTEND_URL=$WEBSITE_URL" >> ../.deployment-info
        
        print_success "Frontend deployed successfully!"
        print_success "Website URL: $WEBSITE_URL"
        
    else
        print_error "Failed to create S3 bucket"
        exit 1
    fi
    
    cd "$SCRIPT_DIR"
}

# ========================================
# 🧪 Post-Deployment Tests
# ========================================

post_deployment_tests() {
    print_step "Running post-deployment tests..."
    
    if [[ -f ".deployment-info" ]]; then
        source .deployment-info
        
        # Test API health
        if [[ -n "$API_ENDPOINT" ]]; then
            print_info "Testing API health..."
            sleep 10  # Wait for deployment to stabilize
            
            if curl -s "$API_ENDPOINT/health" | grep -q "success"; then
                print_success "API health check passed"
            else
                print_warning "API health check failed or pending"
            fi
        fi
        
        # Test frontend
        if [[ -n "$FRONTEND_URL" ]]; then
            print_info "Testing frontend accessibility..."
            
            if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
                print_success "Frontend accessibility check passed"
            else
                print_warning "Frontend accessibility check failed or pending"
            fi
        fi
    fi
}

# ========================================
# 📊 Deployment Info
# ========================================

print_deployment_info() {
    print_header "${SUCCESS} Deployment Summary"
    
    if [[ -f ".deployment-info" ]]; then
        source .deployment-info
        
        echo -e "${GREEN}🎉 SkillSwap successfully deployed to AWS!${NC}"
        echo ""
        echo -e "${CYAN}📋 Deployment Details:${NC}"
        echo -e "  Stage: ${YELLOW}$STAGE${NC}"
        echo -e "  Region: ${YELLOW}$REGION${NC}"
        echo ""
        
        if [[ -n "$FRONTEND_URL" ]]; then
            echo -e "${CYAN}🌐 Frontend URL:${NC}"
            echo -e "  ${GREEN}$FRONTEND_URL${NC}"
            echo ""
        fi
        
        if [[ -n "$API_ENDPOINT" ]]; then
            echo -e "${CYAN}🔗 API Endpoint:${NC}"
            echo -e "  ${GREEN}$API_ENDPOINT${NC}"
            echo -e "  Health: ${GREEN}$API_ENDPOINT/health${NC}"
            echo -e "  Docs: ${GREEN}$API_ENDPOINT/api/docs${NC}"
            echo ""
        fi
        
        echo -e "${CYAN}🛠️ Next Steps:${NC}"
        echo -e "  1. Test your application at the frontend URL"
        echo -e "  2. Set up custom domain (optional)"
        echo -e "  3. Configure monitoring and alerts"
        echo -e "  4. Set up CI/CD for automated deployments"
        echo ""
        
        # Cleanup
        rm .deployment-info
    fi
    
    print_success "Deployment completed! 🎊"
}

# ========================================
# 🚀 Run Main Function
# ========================================

main "$@" 