#!/bin/bash

# =============================================================================
# Project Cleanup Script
# =============================================================================
# Cleans up test artifacts, reports, logs, and temporary files
# Usage: ./scripts/clean.sh [options]

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
CLEAN_ALL="false"
CLEAN_REPORTS="false"
CLEAN_LOGS="false"
CLEAN_SCREENSHOTS="false"
CLEAN_VIDEOS="false"
CLEAN_TRACES="false"
CLEAN_CACHE="false"
CLEAN_DEPS="false"
DRY_RUN="false"
VERBOSE="false"

# Function to show usage
show_usage() {
    echo -e "${BLUE}Project Cleanup Script${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo "  ./scripts/clean.sh [OPTIONS]"
    echo ""
    echo -e "${CYAN}Options:${NC}"
    echo "  --all                 Clean everything (reports, logs, artifacts, cache)"
    echo "  --reports             Clean test reports and HTML output"
    echo "  --logs                Clean log files"
    echo "  --screenshots         Clean screenshot files"
    echo "  --videos              Clean video recordings"
    echo "  --traces              Clean trace files"
    echo "  --cache               Clean npm cache and node_modules"
    echo "  --deps                Clean and reinstall dependencies"
    echo "  --dry-run             Show what would be deleted without deleting"
    echo "  -v, --verbose         Verbose output"
    echo "  -h, --help            Show this help message"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo "  ./scripts/clean.sh --reports --logs"
    echo "  ./scripts/clean.sh --all --dry-run"
    echo "  ./scripts/clean.sh --cache --deps"
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

print_verbose() {
    if [ "$VERBOSE" = "true" ]; then
        echo -e "${CYAN}  $1${NC}"
    fi
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)
                CLEAN_ALL="true"
                shift
                ;;
            --reports)
                CLEAN_REPORTS="true"
                shift
                ;;
            --logs)
                CLEAN_LOGS="true"
                shift
                ;;
            --screenshots)
                CLEAN_SCREENSHOTS="true"
                shift
                ;;
            --videos)
                CLEAN_VIDEOS="true"
                shift
                ;;
            --traces)
                CLEAN_TRACES="true"
                shift
                ;;
            --cache)
                CLEAN_CACHE="true"
                shift
                ;;
            --deps)
                CLEAN_DEPS="true"
                shift
                ;;
            --dry-run)
                DRY_RUN="true"
                shift
                ;;
            -v|--verbose)
                VERBOSE="true"
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
}

# Set flags if --all is specified
set_all_flags() {
    if [ "$CLEAN_ALL" = "true" ]; then
        CLEAN_REPORTS="true"
        CLEAN_LOGS="true"
        CLEAN_SCREENSHOTS="true"
        CLEAN_VIDEOS="true"
        CLEAN_TRACES="true"
        CLEAN_CACHE="true"
    fi
}

# Function to safely remove files/directories
safe_remove() {
    local target="$1"
    local description="$2"
    
    if [ ! -e "$target" ]; then
        print_verbose "Skipping $description (not found): $target"
        return 0
    fi
    
    if [ "$DRY_RUN" = "true" ]; then
        if [ -d "$target" ]; then
            local count=$(find "$target" -type f 2>/dev/null | wc -l | tr -d ' ')
            print_info "[DRY RUN] Would remove $description: $target ($count files)"
        else
            print_info "[DRY RUN] Would remove $description: $target"
        fi
    else
        if [ -d "$target" ]; then
            local count=$(find "$target" -type f 2>/dev/null | wc -l | tr -d ' ')
            rm -rf "$target"
            print_success "Removed $description: $target ($count files)"
        else
            rm -f "$target"
            print_success "Removed $description: $target"
        fi
    fi
}

# Function to get directory size
get_size() {
    local target="$1"
    if [ -e "$target" ]; then
        if command -v du &> /dev/null; then
            du -sh "$target" 2>/dev/null | cut -f1
        else
            echo "unknown"
        fi
    else
        echo "0"
    fi
}

# Clean test reports
clean_reports() {
    print_header "=== Cleaning Test Reports ==="
    
    # Playwright reports
    safe_remove "playwright-report" "Playwright HTML report"
    safe_remove "test-results" "Playwright test results"
    safe_remove "reports" "Custom reports directory"
    
    # Allure reports
    safe_remove "allure-report" "Allure HTML report"
    safe_remove "allure-results" "Allure results"
    
    # JUnit reports
    find . -name "junit*.xml" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "JUnit report"
    done
    
    # JSON reports
    find . -name "*-results.json" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "JSON report"
    done
    
    print_success "Test reports cleanup completed"
}

# Clean log files
clean_logs() {
    print_header "=== Cleaning Log Files ==="
    
    # Log directories
    safe_remove "logs" "Logs directory"
    safe_remove "debug-logs" "Debug logs directory"
    
    # Individual log files
    find . -name "*.log" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "Log file"
    done
    
    # NPM debug logs
    find . -name "npm-debug.log*" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "NPM debug log"
    done
    
    # Yarn error logs
    find . -name "yarn-error.log" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "Yarn error log"
    done
    
    print_success "Log files cleanup completed"
}

# Clean screenshots
clean_screenshots() {
    print_header "=== Cleaning Screenshots ==="
    
    safe_remove "screenshots" "Screenshots directory"
    safe_remove "test-results/*/test-failed-*.png" "Failed test screenshots"
    
    # Find screenshot files in test results
    find test-results -name "*.png" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "Screenshot"
    done
    
    print_success "Screenshots cleanup completed"
}

# Clean video recordings
clean_videos() {
    print_header "=== Cleaning Video Recordings ==="
    
    safe_remove "videos" "Videos directory"
    
    # Find video files in test results
    find test-results -name "*.webm" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "Video recording"
    done
    
    find test-results -name "*.mp4" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "Video recording"
    done
    
    print_success "Video recordings cleanup completed"
}

# Clean trace files
clean_traces() {
    print_header "=== Cleaning Trace Files ==="
    
    safe_remove "traces" "Traces directory"
    
    # Find trace files in test results
    find test-results -name "trace.zip" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "Trace file"
    done
    
    find test-results -name "*.trace" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "Trace file"
    done
    
    print_success "Trace files cleanup completed"
}

# Clean cache and temporary files
clean_cache() {
    print_header "=== Cleaning Cache and Temporary Files ==="
    
    # NPM cache
    if [ "$DRY_RUN" = "false" ]; then
        if command -v npm &> /dev/null; then
            print_info "Cleaning npm cache..."
            npm cache clean --force 2>/dev/null || true
            print_success "NPM cache cleaned"
        fi
    else
        print_info "[DRY RUN] Would clean npm cache"
    fi
    
    # Playwright cache
    safe_remove "$HOME/.cache/ms-playwright" "Playwright browser cache"
    
    # Temporary directories
    safe_remove ".tmp" "Temporary directory"
    safe_remove "tmp" "Temporary directory"
    safe_remove ".cache" "Cache directory"
    
    # OS specific temp files
    find . -name ".DS_Store" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "macOS .DS_Store file"
    done
    
    find . -name "Thumbs.db" -type f 2>/dev/null | while read -r file; do
        safe_remove "$file" "Windows Thumbs.db file"
    done
    
    # IDE temp files
    safe_remove ".vscode/settings.json.bak" "VS Code backup settings"
    safe_remove ".idea/workspace.xml" "IntelliJ workspace file"
    
    print_success "Cache and temporary files cleanup completed"
}

# Clean and reinstall dependencies
clean_deps() {
    print_header "=== Cleaning Dependencies ==="
    
    # Remove node_modules
    safe_remove "node_modules" "Node modules directory"
    
    # Remove lock files
    safe_remove "package-lock.json" "NPM lock file"
    safe_remove "yarn.lock" "Yarn lock file"
    
    if [ "$DRY_RUN" = "false" ]; then
        print_info "Reinstalling dependencies..."
        if command -v npm &> /dev/null; then
            npm install
            print_success "Dependencies reinstalled"
            
            print_info "Installing Playwright browsers..."
            npx playwright install --with-deps
            print_success "Playwright browsers installed"
        else
            print_error "npm not found. Cannot reinstall dependencies."
        fi
    else
        print_info "[DRY RUN] Would reinstall dependencies and Playwright browsers"
    fi
    
    print_success "Dependencies cleanup completed"
}

# Show cleanup summary
show_summary() {
    print_header "=== Cleanup Summary ==="
    
    local total_freed=0
    
    # Calculate freed space (approximate)
    if [ "$DRY_RUN" = "false" ]; then
        print_success "Cleanup completed successfully!"
        print_info "The following items were cleaned:"
        
        [ "$CLEAN_REPORTS" = "true" ] && echo "  • Test reports and results"
        [ "$CLEAN_LOGS" = "true" ] && echo "  • Log files"
        [ "$CLEAN_SCREENSHOTS" = "true" ] && echo "  • Screenshots"
        [ "$CLEAN_VIDEOS" = "true" ] && echo "  • Video recordings"
        [ "$CLEAN_TRACES" = "true" ] && echo "  • Trace files"
        [ "$CLEAN_CACHE" = "true" ] && echo "  • Cache and temporary files"
        [ "$CLEAN_DEPS" = "true" ] && echo "  • Dependencies (and reinstalled)"
        
    else
        print_info "Dry run completed. No files were actually deleted."
        print_info "Run without --dry-run to perform the actual cleanup."
    fi
}

# Check if any cleanup option is specified
check_options() {
    if [ "$CLEAN_ALL" = "false" ] && \
       [ "$CLEAN_REPORTS" = "false" ] && \
       [ "$CLEAN_LOGS" = "false" ] && \
       [ "$CLEAN_SCREENSHOTS" = "false" ] && \
       [ "$CLEAN_VIDEOS" = "false" ] && \
       [ "$CLEAN_TRACES" = "false" ] && \
       [ "$CLEAN_CACHE" = "false" ] && \
       [ "$CLEAN_DEPS" = "false" ]; then
        print_warning "No cleanup options specified."
        print_info "Use --help to see available options or --all to clean everything."
        exit 1
    fi
}

# Main function
main() {
    print_header "🧹 Project Cleanup Script"
    echo ""
    
    # Parse and validate arguments
    parse_arguments "$@"
    set_all_flags
    check_options
    
    if [ "$DRY_RUN" = "true" ]; then
        print_warning "DRY RUN MODE - No files will be deleted"
        echo ""
    fi
    
    # Perform cleanup operations
    [ "$CLEAN_REPORTS" = "true" ] && clean_reports
    [ "$CLEAN_LOGS" = "true" ] && clean_logs
    [ "$CLEAN_SCREENSHOTS" = "true" ] && clean_screenshots
    [ "$CLEAN_VIDEOS" = "true" ] && clean_videos
    [ "$CLEAN_TRACES" = "true" ] && clean_traces
    [ "$CLEAN_CACHE" = "true" ] && clean_cache
    [ "$CLEAN_DEPS" = "true" ] && clean_deps
    
    echo ""
    show_summary
}

# Run main function with all arguments
main "$@"
