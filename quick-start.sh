#!/bin/bash

# SkillSwap Quick Start Script
# This script helps you get started with the SkillSwap application quickly

echo "🚀 SkillSwap Quick Start Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is installed${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm is installed${NC}"

# Function to create environment files
create_env_files() {
    echo -e "${BLUE}📝 Creating environment files...${NC}"
    
    # Create backend .env file
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✅ Created backend/.env${NC}"
        echo -e "${YELLOW}⚠️  Please edit backend/.env with your actual credentials${NC}"
    else
        echo -e "${YELLOW}⚠️  backend/.env already exists${NC}"
    fi
    
    # Create frontend .env.local file
    if [ ! -f "frontend/.env.local" ]; then
        cp frontend/.env.example frontend/.env.local
        echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
        echo -e "${YELLOW}⚠️  Please edit frontend/.env.local with your actual credentials${NC}"
    else
        echo -e "${YELLOW}⚠️  frontend/.env.local already exists${NC}"
    fi
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Install backend dependencies
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    cd backend
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
    
    # Install frontend dependencies
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd ../frontend
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
    
    cd ..
}

# Function to create start scripts
create_start_scripts() {
    echo -e "${BLUE}📝 Creating start scripts...${NC}"
    
    # Create start-backend.sh
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting SkillSwap Backend..."
cd backend
npm run dev
EOF
    chmod +x start-backend.sh
    
    # Create start-frontend.sh
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting SkillSwap Frontend..."
cd frontend
npm run dev
EOF
    chmod +x start-frontend.sh
    
    # Create start-both.sh
    cat > start-both.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting SkillSwap (Frontend + Backend)..."

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT

# Start backend in background
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Both servers are starting..."
echo "📱 Frontend: http://localhost:5173 (or next available port)"
echo "🔧 Backend: http://localhost:3000"
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
EOF
    chmod +x start-both.sh
    
    echo -e "${GREEN}✅ Start scripts created${NC}"
}

# Function to show next steps
show_next_steps() {
    echo -e "${GREEN}🎉 Quick Start Setup Complete!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo ""
    echo -e "${YELLOW}1. Configure your environment variables:${NC}"
    echo "   - Edit backend/.env with your database and AWS credentials"
    echo "   - Edit frontend/.env.local with your AWS Cognito settings"
    echo ""
    echo -e "${YELLOW}2. Set up your database (choose one):${NC}"
    echo "   - For DynamoDB: Follow AWS setup in SETUP_GUIDE.md"
    echo "   - For MongoDB: Install MongoDB or use MongoDB Atlas"
    echo "   - For PostgreSQL: Install PostgreSQL locally"
    echo "   - For testing: Use in-memory storage (no setup needed)"
    echo ""
    echo -e "${YELLOW}3. Start the application:${NC}"
    echo "   - Run both servers: ./start-both.sh"
    echo "   - Or separately:"
    echo "     • Backend only: ./start-backend.sh"
    echo "     • Frontend only: ./start-frontend.sh"
    echo ""
    echo -e "${YELLOW}4. Access your application:${NC}"
    echo "   - Frontend: http://localhost:5173"
    echo "   - Backend API: http://localhost:3000"
    echo ""
    echo -e "${BLUE}📚 For detailed setup instructions, see SETUP_GUIDE.md${NC}"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Main execution
echo -e "${BLUE}Starting quick setup...${NC}"
echo ""

create_env_files
echo ""

install_dependencies
echo ""

create_start_scripts
echo ""

show_next_steps 