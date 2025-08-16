#!/bin/bash

# =============================================================================
# Playwright Test Runner Script
# =============================================================================
# Advanced test runner with multiple options and configurations
# Usage: ./scripts/run-tests.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
SUITE="all"
BROWSER="chromium"
ENVIRONMENT="local"
HEADLESS="true"
WORKERS="4"
RETRIES="2"
TIMEOUT="30000"
REPORTER="html"
TAG=""
GREP=""
PARALLEL="true"
DEBUG="false"
TRACE="false"
VIDEO="false"
SCREENSHOT="only-on-failure"

# Function to show usage
show_usage() {
    echo -e "${BLUE}Playwright Test Runner${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo "  ./scripts/run-tests.sh [OPTIONS]"
    echo ""
    echo -e "${CYAN}Options:${NC}"
    echo "  -s, --suite SUITE         Test suite to run (all|web|api|mobile|smoke|regression)"
    echo "  -b, --browser BROWSER     Browser to use (chromium|firefox|webkit|all)"
    echo "  -e, --environment ENV     Environment to test (local|dev|staging|prod)"
    echo "  -w, --workers NUMBER      Number of parallel workers (default: 4)"
    echo "  -r, --retries NUMBER      Number of retries on failure (default: 2)"
    echo "  -t, --timeout NUMBER      Test timeout in milliseconds (default: 30000)"
    echo "  --reporter REPORTER       Test reporter (html|json|junit|allure|line|dot)"
    echo "  --tag TAG                 Run tests with specific tag"
    echo "  --grep PATTERN            Run tests matching pattern"
    echo "  --headed                  Run tests in headed mode"
    echo "  --headless                Run tests in headless mode (default)"
    echo "  --debug                   Run tests in debug mode"
    echo "  --trace                   Enable tracing"
    echo "  --video                   Record video"
    echo "  --no-parallel             Disable parallel execution"
    echo "  --screenshot MODE         Screenshot mode (on|off|only-on-failure)"
    echo "  -h, --help                Show this help message"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo "  ./scripts/run-tests.sh --suite web --browser chromium --headed"
    echo "  ./scripts/run-tests.sh --suite api --environment staging"
    echo "  ./scripts/run-tests.sh --tag @smoke --workers 2"
    echo "  ./scripts/run-tests.sh --grep login --debug"
    echo "  ./scripts/run-tests.sh --suite mobile --trace --video"
}

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -s|--suite)
                SUITE="$2"
                shift 2
                ;;
            -b|--browser)
                BROWSER="$2"
                shift 2
                ;;
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -w|--workers)
                WORKERS="$2"
                shift 2
                ;;
            -r|--retries)
                RETRIES="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            --reporter)
                REPORTER="$2"
                shift 2
                ;;
            --tag)
                TAG="$2"
                shift 2
                ;;
            --grep)
                GREP="$2"
                shift 2
                ;;
            --headed)
                HEADLESS="false"
                shift
                ;;
            --headless)
                HEADLESS="true"
                shift
                ;;
            --debug)
                DEBUG="true"
                HEADLESS="false"
                WORKERS="1"
                shift
                ;;
            --trace)
                TRACE="true"
                shift
                ;;
            --video)
                VIDEO="true"
                shift
                ;;
            --no-parallel)
                PARALLEL="false"
                WORKERS="1"
                shift
                ;;
            --screenshot)
                SCREENSHOT="$2"
                shift 2
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
}

# Validate arguments
validate_arguments() {
    # Validate suite
    if [[ ! "$SUITE" =~ ^(all|web|api|mobile|smoke|regression)$ ]]; then
        print_error "Invalid suite: $SUITE"
        exit 1
    fi
    
    # Validate browser
    if [[ ! "$BROWSER" =~ ^(chromium|firefox|webkit|all)$ ]]; then
        print_error "Invalid browser: $BROWSER"
        exit 1
    fi
    
    # Validate environment
    if [[ ! "$ENVIRONMENT" =~ ^(local|dev|staging|prod)$ ]]; then
        print_error "Invalid environment: $ENVIRONMENT"
        exit 1
    fi
    
    # Validate reporter
    if [[ ! "$REPORTER" =~ ^(html|json|junit|allure|line|dot)$ ]]; then
        print_error "Invalid reporter: $REPORTER"
        exit 1
    fi
    
    # Validate screenshot mode
    if [[ ! "$SCREENSHOT" =~ ^(on|off|only-on-failure)$ ]]; then
        print_error "Invalid screenshot mode: $SCREENSHOT"
        exit 1
    fi
}

# Setup environment
setup_environment() {
    print_info "Setting up environment: $ENVIRONMENT"
    
    # Load environment file
    ENV_FILE=".env.$ENVIRONMENT"
    if [ -f "$ENV_FILE" ]; then
        export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
        print_success "Loaded environment file: $ENV_FILE"
    else
        print_warning "Environment file not found: $ENV_FILE"
        print_info "Using default configuration"
    fi
    
    # Override with command line arguments
    export HEADLESS="$HEADLESS"
    export MAX_WORKERS="$WORKERS"
    export RETRIES="$RETRIES"
    export BROWSER_TIMEOUT="$TIMEOUT"
}

# Build test command
build_command() {
    local cmd="npx playwright test"
    
    # Add suite filter
    case $SUITE in
        web)
            cmd="$cmd --grep @web"
            ;;
        api)
            cmd="$cmd --grep @api"
            ;;
        mobile)
            cmd="$cmd --grep @mobile"
            ;;
        smoke)
            cmd="$cmd --grep @smoke"
            ;;
        regression)
            cmd="$cmd --grep @regression"
            ;;
        all)
            # No filter for all tests
            ;;
    esac
    
    # Add tag filter
    if [ -n "$TAG" ]; then
        cmd="$cmd --grep $TAG"
    fi
    
    # Add grep pattern
    if [ -n "$GREP" ]; then
        cmd="$cmd --grep $GREP"
    fi
    
    # Add browser project
    if [ "$BROWSER" != "all" ]; then
        case $BROWSER in
            chromium)
                cmd="$cmd --project=chromium-desktop"
                ;;
            firefox)
                cmd="$cmd --project=firefox-desktop"
                ;;
            webkit)
                cmd="$cmd --project=webkit-desktop"
                ;;
            *)
                cmd="$cmd --project=$BROWSER"
                ;;
        esac
    fi
    
    # Add workers
    if [ "$PARALLEL" = "true" ]; then
        cmd="$cmd --workers=$WORKERS"
    else
        cmd="$cmd --workers=1"
    fi
    
    # Add retries
    cmd="$cmd --retries=$RETRIES"
    
    # Add reporter
    cmd="$cmd --reporter=$REPORTER"
    
    # Add debug mode
    if [ "$DEBUG" = "true" ]; then
        cmd="$cmd --debug"
    fi
    
    # Add trace
    if [ "$TRACE" = "true" ]; then
        cmd="$cmd --trace=on"
    fi
    
    echo "$cmd"
}

# Create test directories
create_directories() {
    print_info "Creating test directories..."
    
    directories=(
        "test-results"
        "playwright-report"
        "screenshots"
        "logs"
        "allure-results"
        "reports"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
    done
    
    print_success "Test directories created"
}

# Clean previous results
clean_results() {
    print_info "Cleaning previous test results..."
    
    rm -rf test-results/*
    rm -rf playwright-report/*
    rm -rf screenshots/*
    rm -rf allure-results/*
    rm -rf reports/*
    
    print_success "Previous results cleaned"
}

# Display test configuration
display_config() {
    print_header "=== Test Configuration ==="
    echo -e "${CYAN}Suite:${NC}        $SUITE"
    echo -e "${CYAN}Browser:${NC}      $BROWSER"
    echo -e "${CYAN}Environment:${NC}  $ENVIRONMENT"
    echo -e "${CYAN}Headless:${NC}     $HEADLESS"
    echo -e "${CYAN}Workers:${NC}      $WORKERS"
    echo -e "${CYAN}Retries:${NC}      $RETRIES"
    echo -e "${CYAN}Timeout:${NC}      $TIMEOUT ms"
    echo -e "${CYAN}Reporter:${NC}     $REPORTER"
    echo -e "${CYAN}Debug:${NC}        $DEBUG"
    echo -e "${CYAN}Trace:${NC}        $TRACE"
    echo -e "${CYAN}Video:${NC}        $VIDEO"
    echo -e "${CYAN}Screenshot:${NC}   $SCREENSHOT"
    
    if [ -n "$TAG" ]; then
        echo -e "${CYAN}Tag:${NC}          $TAG"
    fi
    
    if [ -n "$GREP" ]; then
        echo -e "${CYAN}Grep:${NC}         $GREP"
    fi
    
    echo ""
}

# Run tests
run_tests() {
    local cmd=$(build_command)
    
    print_header "=== Running Tests ==="
    print_info "Command: $cmd"
    echo ""
    
    # Start timer
    local start_time=$(date +%s)
    
    # Run the tests
    if eval "$cmd"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        print_success "Tests completed successfully in ${duration}s"
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        print_error "Tests failed after ${duration}s"
        return 1
    fi
}

# Generate reports
generate_reports() {
    print_info "Generating additional reports..."
    
    # Generate HTML report if not already generated
    if [ "$REPORTER" != "html" ] && [ -d "test-results" ]; then
        npx playwright show-report --host 0.0.0.0 > /dev/null 2>&1 &
        print_success "HTML report generated"
    fi
    
    # Generate Allure report if allure-results exists
    if [ -d "allure-results" ] && command -v allure &> /dev/null; then
        allure generate allure-results --clean -o allure-report
        print_success "Allure report generated"
    fi
}

# Main function
main() {
    print_header "🎭 Playwright Enterprise Test Runner"
    echo ""
    
    # Parse and validate arguments
    parse_arguments "$@"
    validate_arguments
    
    # Setup
    setup_environment
    create_directories
    clean_results
    display_config
    
    # Run tests
    if run_tests; then
        generate_reports
        
        print_header "=== Test Summary ==="
        print_success "All tests completed successfully!"
        
        if [ "$REPORTER" = "html" ]; then
            print_info "View HTML report: npx playwright show-report"
        fi
        
        if [ -d "allure-report" ]; then
            print_info "View Allure report: allure open allure-report"
        fi
        
        exit 0
    else
        print_header "=== Test Summary ==="
        print_error "Some tests failed. Check the reports for details."
        
        if [ "$REPORTER" = "html" ]; then
            print_info "View HTML report: npx playwright show-report"
        fi
        
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
