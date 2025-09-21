#!/bin/bash

# Kongu Event Management System - Setup Script
# This script helps with initial project setup

echo "🎓 Kongu College Event Management System - Setup"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_info "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
        return 0
    else
        print_error "Node.js is not installed. Please install Node.js v16 or higher."
        return 1
    fi
}

# Check if npm is installed
check_npm() {
    print_info "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
        return 0
    else
        print_error "npm is not installed. Please install npm."
        return 1
    fi
}

# Check if MongoDB is running
check_mongodb() {
    print_info "Checking MongoDB connection..."
    if command -v mongo &> /dev/null; then
        if mongo --eval "db.adminCommand('ismaster')" &> /dev/null; then
            print_status "MongoDB is running"
            return 0
        else
            print_warning "MongoDB is installed but not running"
            print_info "Please start MongoDB service: sudo systemctl start mongod"
            return 1
        fi
    else
        print_warning "MongoDB not found locally"
        print_info "You can use MongoDB Atlas for cloud database"
        return 1
    fi
}

# Install backend dependencies
install_backend() {
    print_info "Installing backend dependencies..."
    cd backend
    if npm install; then
        print_status "Backend dependencies installed successfully"
        cd ..
        return 0
    else
        print_error "Failed to install backend dependencies"
        cd ..
        return 1
    fi
}

# Install frontend dependencies
install_frontend() {
    print_info "Installing frontend dependencies..."
    cd frontend
    if npm install; then
        print_status "Frontend dependencies installed successfully"
        cd ..
        return 0
    else
        print_error "Failed to install frontend dependencies"
        cd ..
        return 1
    fi
}

# Setup backend environment
setup_backend_env() {
    print_info "Setting up backend environment..."
    cd backend
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_status "Created backend .env file"
        print_warning "Please update the environment variables in backend/.env"
        
        # Generate a random JWT secret
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
        sed -i "s/your_super_secret_jwt_key_here_make_it_very_long_and_complex/$JWT_SECRET/g" .env
        print_status "Generated JWT secret"
    else
        print_status "Backend .env file already exists"
    fi
    
    cd ..
    return 0
}

# Setup frontend environment
setup_frontend_env() {
    print_info "Setting up frontend environment..."
    cd frontend
    
    if [ ! -f .env ]; then
        cp .env.example .env 2>/dev/null || cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
EOF
        print_status "Created frontend .env file"
    else
        print_status "Frontend .env file already exists"
    fi
    
    cd ..
    return 0
}

# Create admin user prompt
create_admin_info() {
    print_info "Default Admin Account Information:"
    echo "  Email: admin@kongu.edu"
    echo "  Password: admin123456"
    print_warning "Please change these credentials after first login!"
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🚀 Setup Complete! Next Steps:"
    echo "=============================="
    print_info "1. Update environment variables:"
    echo "   - Backend: backend/.env"
    echo "   - Frontend: frontend/.env"
    echo ""
    print_info "2. Configure Cloudinary (for image uploads):"
    echo "   - Sign up at https://cloudinary.com"
    echo "   - Add credentials to backend/.env"
    echo ""
    print_info "3. Start the development servers:"
    echo "   Backend:  cd backend && npm run dev"
    echo "   Frontend: cd frontend && npm run dev"
    echo ""
    print_info "4. Access the application:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:5000"
    echo "   - Admin Panel: http://localhost:3000/admin"
    echo ""
}

# Main setup function
main() {
    echo ""
    print_info "Starting setup process..."
    echo ""
    
    # Check prerequisites
    if ! check_nodejs || ! check_npm; then
        print_error "Prerequisites not met. Please install Node.js and npm first."
        exit 1
    fi
    
    # Optional MongoDB check
    check_mongodb
    
    echo ""
    print_info "Installing dependencies..."
    echo ""
    
    # Install dependencies
    if ! install_backend; then
        print_error "Backend setup failed"
        exit 1
    fi
    
    if ! install_frontend; then
        print_error "Frontend setup failed"
        exit 1
    fi
    
    echo ""
    print_info "Configuring environment..."
    echo ""
    
    # Setup environment files
    setup_backend_env
    setup_frontend_env
    
    echo ""
    create_admin_info
    show_next_steps
    
    print_status "Setup completed successfully! 🎉"
}

# Handle script arguments
case "$1" in
    --backend-only)
        print_info "Setting up backend only..."
        check_nodejs && check_npm && install_backend && setup_backend_env
        ;;
    --frontend-only)
        print_info "Setting up frontend only..."
        check_nodejs && check_npm && install_frontend && setup_frontend_env
        ;;
    --env-only)
        print_info "Setting up environment files only..."
        setup_backend_env && setup_frontend_env
        ;;
    --help|-h)
        echo "Kongu Event Management System - Setup Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --backend-only    Setup backend only"
        echo "  --frontend-only   Setup frontend only"
        echo "  --env-only        Setup environment files only"
        echo "  --help, -h        Show this help message"
        echo ""
        echo "Run without arguments for full setup."
        ;;
    *)
        main
        ;;
esac
