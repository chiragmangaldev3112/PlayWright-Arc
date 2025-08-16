#!/bin/bash

# =============================================================================
# Playwright Enterprise Framework Setup Script
# =============================================================================
# This script sets up the complete test automation environment
# Usage: ./scripts/setup.sh [environment]
# Example: ./scripts/setup.sh local

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-local}

echo -e "${BLUE}🚀 Setting up Playwright Enterprise Framework...${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Node.js is installed
check_node() {
    echo "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is >= 18
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    echo "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    echo "Installing project dependencies..."
    if npm ci; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Install Playwright browsers
install_browsers() {
    echo "Installing Playwright browsers..."
    if npx playwright install --with-deps; then
        print_status "Playwright browsers installed successfully"
    else
        print_error "Failed to install Playwright browsers"
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    echo "Creating necessary directories..."
    
    directories=(
        "test-results"
        "playwright-report"
        "screenshots"
        "logs"
        "allure-results"
        "allure-report"
        "reports"
        "test-data/generated"
        "test-data/temp"
        "config/environments"
    )
    
    for dir in "${directories[@]}"; do
        if mkdir -p "$dir"; then
            print_status "Created directory: $dir"
        else
            print_warning "Failed to create directory: $dir"
        fi
    done
}

# Setup environment configuration
setup_environment() {
    echo "Setting up environment configuration..."
    
    ENV_FILE=".env.${ENVIRONMENT}"
    
    if [ ! -f "$ENV_FILE" ]; then
        if cp .env.example "$ENV_FILE"; then
            print_status "Created environment file: $ENV_FILE"
            print_warning "Please update $ENV_FILE with your specific configuration"
        else
            print_error "Failed to create environment file: $ENV_FILE"
            exit 1
        fi
    else
        print_status "Environment file already exists: $ENV_FILE"
    fi
    
    # Create local env file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        print_status "Created .env.local file"
        print_warning "Please update .env.local with your local configuration"
    fi
}

# Verify Playwright installation
verify_installation() {
    echo "Verifying Playwright installation..."
    
    if npx playwright --version &> /dev/null; then
        PLAYWRIGHT_VERSION=$(npx playwright --version)
        print_status "Playwright is installed: $PLAYWRIGHT_VERSION"
    else
        print_error "Playwright verification failed"
        exit 1
    fi
}

# Generate sample test data
generate_test_data() {
    echo "Generating sample test data..."
    
    # Create credentials file if it doesn't exist
    if [ ! -f "test-data/credentials.json" ]; then
        cat > "test-data/credentials.json" << 'EOF'
{
  "admin": {
    "username": "admin@example.com",
    "password": "AdminPassword123!",
    "role": "admin"
  },
  "user": {
    "username": "user@example.com",
    "password": "UserPassword123!",
    "role": "user"
  },
  "manager": {
    "username": "manager@example.com",
    "password": "ManagerPassword123!",
    "role": "manager"
  },
  "guest": {
    "username": "guest@example.com",
    "password": "GuestPassword123!",
    "role": "guest"
  }
}
EOF
        print_status "Created credentials.json file"
    else
        print_status "credentials.json already exists"
    fi
}

# Setup Git hooks (optional)
setup_git_hooks() {
    echo "Setting up Git hooks..."
    
    if [ -d ".git" ]; then
        # Create pre-commit hook
        cat > ".git/hooks/pre-commit" << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix the issues before committing."
    exit 1
fi

# Run formatting check
npm run format:check
if [ $? -ne 0 ]; then
    echo "Code formatting issues found. Please run 'npm run format' to fix them."
    exit 1
fi

echo "Pre-commit checks passed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_status "Git pre-commit hook installed"
    else
        print_warning "Not a Git repository - skipping Git hooks setup"
    fi
}

# Main setup process
main() {
    echo -e "${BLUE}Starting setup process...${NC}"
    echo ""
    
    check_node
    check_npm
    install_dependencies
    install_browsers
    create_directories
    setup_environment
    verify_installation
    generate_test_data
    setup_git_hooks
    
    echo ""
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Update your environment configuration in .env.${ENVIRONMENT}"
    echo "2. Update test data in test-data/ directory"
    echo "3. Run your first test: npm test"
    echo "4. View test report: npm run test:report"
    echo ""
    echo -e "${BLUE}Useful commands:${NC}"
    echo "• npm test                 - Run all tests"
    echo "• npm run test:web         - Run web tests only"
    echo "• npm run test:api         - Run API tests only"
    echo "• npm run test:mobile      - Run mobile tests only"
    echo "• npm run test:headed      - Run tests in headed mode"
    echo "• npm run test:debug       - Run tests in debug mode"
    echo "• npm run test:report      - Show test report"
    echo ""
    echo -e "${GREEN}Happy testing! 🚀${NC}"
}

# Run main function
main
