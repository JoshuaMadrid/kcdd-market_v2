#!/bin/bash

# ============================================
# KCDD Market v3 - Automated Setup Script
# ============================================
# Sets up the complete Vite + Clerk + Stripe stack
#
# Usage: ./setup-vite.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup
print_header "🚀 KCDD Market v3 Setup"
echo "This script will set up your development environment"
echo ""

# Check prerequisites
print_header "📋 Checking Prerequisites"

if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION"
else
    print_error "npm not found"
    exit 1
fi

if command_exists docker; then
    print_success "Docker installed"
else
    print_warning "Docker not found. You'll need it for local Supabase."
    print_info "Download from: https://www.docker.com/products/docker-desktop"
fi

# Install frontend dependencies
print_header "📦 Installing Frontend Dependencies"
cd frontend-vite
print_info "Running npm install in frontend-vite..."
npm install
print_success "Frontend dependencies installed"
cd ..

# Install backend API dependencies
print_header "📦 Installing Backend API Dependencies"
cd backend/api
print_info "Running npm install in backend/api..."
npm install
print_success "Backend API dependencies installed"
cd ../..

# Setup environment files
print_header "⚙️  Setting Up Environment Files"

# Frontend environment
if [ ! -f "frontend-vite/.env.local" ]; then
    print_info "Creating frontend-vite/.env.local from .env.example..."
    cp frontend-vite/.env.example frontend-vite/.env.local 2>/dev/null || \
        echo "# Copy .env.example and fill in your values" > frontend-vite/.env.local
    print_warning "Please edit frontend-vite/.env.local with your API keys"
else
    print_success "frontend-vite/.env.local already exists"
fi

# Backend environment
if [ ! -f "backend/api/.env" ]; then
    print_info "Creating backend/api/.env from .env.example..."
    cp backend/api/.env.example backend/api/.env 2>/dev/null || \
        echo "# Copy .env.example and fill in your values" > backend/api/.env
    print_warning "Please edit backend/api/.env with your API keys"
else
    print_success "backend/api/.env already exists"
fi

# Start Supabase (if Docker is available)
print_header "🗄️  Starting Supabase"

if command_exists docker; then
    print_info "Starting Supabase with Docker Compose..."
    cd backend
    docker-compose up -d
    print_success "Supabase started!"
    print_info "Supabase Studio: http://localhost:54323"
    print_info "Inbucket (Email): http://localhost:54324"
    cd ..
else
    print_warning "Docker not available. Skipping Supabase startup."
    print_info "Install Docker and run: cd backend && docker-compose up -d"
fi

# Summary
print_header "🎉 Setup Complete!"

echo -e "${GREEN}Your development environment is ready!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Get your API keys:"
echo "   - Clerk:  https://dashboard.clerk.com"
echo "   - Stripe: https://dashboard.stripe.com"
echo ""
echo "2. Update environment files:"
echo "   - frontend-vite/.env.local"
echo "   - backend/api/.env"
echo ""
echo "3. Start the application:"
echo "   ${BLUE}# Terminal 1: Backend API${NC}"
echo "   cd backend/api && npm start"
echo ""
echo "   ${BLUE}# Terminal 2: Frontend${NC}"
echo "   cd frontend-vite && npm run dev"
echo ""
echo "4. Open your browser:"
echo "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "5. Read the full guide:"
echo "   ${BLUE}cat SETUP_GUIDE.md${NC}"
echo ""
echo "Need help? Check SETUP_GUIDE.md or visit:"
echo "📚 https://clerk.com/docs"
echo "📚 https://supabase.com/docs"
echo "📚 https://stripe.com/docs"
echo ""
print_success "Happy coding! 🚀"

