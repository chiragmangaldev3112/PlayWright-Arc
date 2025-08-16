#!/bin/bash

# =============================================================================
# Test Report Generator Script
# =============================================================================
# Generates comprehensive test reports from Playwright test results
# Usage: ./scripts/generate-report.sh [options]

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
REPORT_TYPE="all"
OUTPUT_DIR="reports"
OPEN_REPORT="false"
MERGE_REPORTS="false"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to show usage
show_usage() {
    echo -e "${BLUE}Test Report Generator${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo "  ./scripts/generate-report.sh [OPTIONS]"
    echo ""
    echo -e "${CYAN}Options:${NC}"
    echo "  -t, --type TYPE           Report type (html|json|junit|allure|all)"
    echo "  -o, --output DIR          Output directory (default: reports)"
    echo "  --open                    Open report after generation"
    echo "  --merge                   Merge multiple test results"
    echo "  -h, --help                Show this help message"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo "  ./scripts/generate-report.sh --type html --open"
    echo "  ./scripts/generate-report.sh --type allure --output custom-reports"
    echo "  ./scripts/generate-report.sh --merge --open"
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
            -t|--type)
                REPORT_TYPE="$2"
                shift 2
                ;;
            -o|--output)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            --open)
                OPEN_REPORT="true"
                shift
                ;;
            --merge)
                MERGE_REPORTS="true"
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

# Validate arguments
validate_arguments() {
    if [[ ! "$REPORT_TYPE" =~ ^(html|json|junit|allure|all)$ ]]; then
        print_error "Invalid report type: $REPORT_TYPE"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if test results exist
    if [ ! -d "test-results" ] || [ -z "$(ls -A test-results 2>/dev/null)" ]; then
        print_warning "No test results found. Please run tests first."
        return 1
    fi
    
    # Check for Allure if needed
    if [[ "$REPORT_TYPE" == "allure" || "$REPORT_TYPE" == "all" ]]; then
        if ! command -v allure &> /dev/null; then
            print_warning "Allure is not installed. Skipping Allure report generation."
            print_info "Install Allure: npm install -g allure-commandline"
        fi
    fi
    
    print_success "Prerequisites checked"
}

# Create output directory
create_output_dir() {
    print_info "Creating output directory: $OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
    print_success "Output directory created"
}

# Generate HTML report
generate_html_report() {
    print_info "Generating HTML report..."
    
    local html_dir="$OUTPUT_DIR/html-$TIMESTAMP"
    mkdir -p "$html_dir"
    
    # Generate Playwright HTML report
    if npx playwright show-report --host 0.0.0.0 --port 0 > /dev/null 2>&1; then
        # Copy the generated report
        if [ -d "playwright-report" ]; then
            cp -r playwright-report/* "$html_dir/"
            print_success "HTML report generated: $html_dir/index.html"
            
            if [ "$OPEN_REPORT" = "true" ]; then
                if command -v open &> /dev/null; then
                    open "$html_dir/index.html"
                elif command -v xdg-open &> /dev/null; then
                    xdg-open "$html_dir/index.html"
                fi
            fi
        else
            print_warning "Playwright report directory not found"
        fi
    else
        print_error "Failed to generate HTML report"
    fi
}

# Generate JSON report
generate_json_report() {
    print_info "Generating JSON report..."
    
    local json_file="$OUTPUT_DIR/results-$TIMESTAMP.json"
    
    # Find the latest JSON result file
    local latest_json=$(find test-results -name "*.json" -type f -exec ls -t {} + | head -n1)
    
    if [ -n "$latest_json" ]; then
        cp "$latest_json" "$json_file"
        print_success "JSON report generated: $json_file"
        
        # Generate summary
        generate_json_summary "$json_file"
    else
        print_warning "No JSON results found"
    fi
}

# Generate JSON summary
generate_json_summary() {
    local json_file="$1"
    local summary_file="$OUTPUT_DIR/summary-$TIMESTAMP.json"
    
    print_info "Generating test summary..."
    
    # Extract summary using jq if available
    if command -v jq &> /dev/null && [ -f "$json_file" ]; then
        cat > "$summary_file" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": $(jq '{
    total: .stats.total,
    passed: .stats.passed,
    failed: .stats.failed,
    skipped: .stats.skipped,
    duration: .stats.duration,
    passRate: ((.stats.passed / .stats.total) * 100 | floor)
  }' "$json_file"),
  "environment": {
    "os": "$(uname -s)",
    "node": "$(node --version 2>/dev/null || echo 'N/A')",
    "playwright": "$(npx playwright --version 2>/dev/null || echo 'N/A')"
  }
}
EOF
        print_success "Test summary generated: $summary_file"
    else
        print_warning "jq not available or JSON file not found. Skipping summary generation."
    fi
}

# Generate JUnit report
generate_junit_report() {
    print_info "Generating JUnit report..."
    
    local junit_file="$OUTPUT_DIR/junit-$TIMESTAMP.xml"
    
    # Find JUnit XML files
    local junit_files=$(find test-results -name "*.xml" -type f)
    
    if [ -n "$junit_files" ]; then
        # If multiple files, merge them
        if [ $(echo "$junit_files" | wc -l) -gt 1 ]; then
            print_info "Merging multiple JUnit files..."
            merge_junit_files "$junit_files" "$junit_file"
        else
            cp $junit_files "$junit_file"
        fi
        
        print_success "JUnit report generated: $junit_file"
    else
        print_warning "No JUnit XML files found"
    fi
}

# Merge JUnit files
merge_junit_files() {
    local files="$1"
    local output="$2"
    
    # Simple XML merge (basic implementation)
    echo '<?xml version="1.0" encoding="UTF-8"?>' > "$output"
    echo '<testsuites>' >> "$output"
    
    for file in $files; do
        # Extract testsuite content (skip XML declaration and root)
        sed -n '/<testsuite/,/<\/testsuite>/p' "$file" >> "$output"
    done
    
    echo '</testsuites>' >> "$output"
}

# Generate Allure report
generate_allure_report() {
    print_info "Generating Allure report..."
    
    if ! command -v allure &> /dev/null; then
        print_warning "Allure is not installed. Skipping Allure report."
        return
    fi
    
    local allure_dir="$OUTPUT_DIR/allure-$TIMESTAMP"
    
    if [ -d "allure-results" ] && [ -n "$(ls -A allure-results 2>/dev/null)" ]; then
        allure generate allure-results --clean -o "$allure_dir"
        print_success "Allure report generated: $allure_dir/index.html"
        
        if [ "$OPEN_REPORT" = "true" ]; then
            allure open "$allure_dir"
        fi
    else
        print_warning "No Allure results found"
    fi
}

# Merge multiple test results
merge_test_results() {
    print_info "Merging test results..."
    
    # Find all test result directories
    local result_dirs=$(find . -name "test-results-*" -type d 2>/dev/null)
    
    if [ -n "$result_dirs" ]; then
        local merged_dir="$OUTPUT_DIR/merged-results-$TIMESTAMP"
        mkdir -p "$merged_dir"
        
        for dir in $result_dirs; do
            cp -r "$dir"/* "$merged_dir/" 2>/dev/null || true
        done
        
        print_success "Test results merged: $merged_dir"
        
        # Generate merged reports
        MERGE_REPORTS="false"  # Prevent infinite recursion
        generate_reports_from_dir "$merged_dir"
    else
        print_warning "No multiple test result directories found"
    fi
}

# Generate reports from specific directory
generate_reports_from_dir() {
    local source_dir="$1"
    local original_results="test-results"
    
    # Temporarily point to the source directory
    if [ "$source_dir" != "test-results" ]; then
        mv test-results test-results-backup 2>/dev/null || true
        ln -s "$(pwd)/$source_dir" test-results
    fi
    
    # Generate reports
    case $REPORT_TYPE in
        html)
            generate_html_report
            ;;
        json)
            generate_json_report
            ;;
        junit)
            generate_junit_report
            ;;
        allure)
            generate_allure_report
            ;;
        all)
            generate_html_report
            generate_json_report
            generate_junit_report
            generate_allure_report
            ;;
    esac
    
    # Restore original test-results
    if [ "$source_dir" != "test-results" ]; then
        rm -f test-results
        mv test-results-backup test-results 2>/dev/null || true
    fi
}

# Generate test statistics
generate_statistics() {
    print_info "Generating test statistics..."
    
    local stats_file="$OUTPUT_DIR/statistics-$TIMESTAMP.txt"
    
    cat > "$stats_file" << EOF
=== Test Execution Statistics ===
Generated: $(date)
Report Directory: $OUTPUT_DIR

Test Results Summary:
EOF

    # Count test files
    local test_files=$(find test-results -name "*.json" -type f | wc -l)
    echo "Test Result Files: $test_files" >> "$stats_file"
    
    # Count screenshots
    local screenshots=$(find screenshots -name "*.png" -type f 2>/dev/null | wc -l)
    echo "Screenshots: $screenshots" >> "$stats_file"
    
    # Count videos
    local videos=$(find test-results -name "*.webm" -type f 2>/dev/null | wc -l)
    echo "Videos: $videos" >> "$stats_file"
    
    # Count traces
    local traces=$(find test-results -name "*.zip" -type f 2>/dev/null | wc -l)
    echo "Traces: $traces" >> "$stats_file"
    
    print_success "Statistics generated: $stats_file"
}

# Main function
main() {
    print_header "📊 Test Report Generator"
    echo ""
    
    # Parse and validate arguments
    parse_arguments "$@"
    validate_arguments
    
    # Check prerequisites
    if ! check_prerequisites; then
        exit 1
    fi
    
    # Create output directory
    create_output_dir
    
    # Merge results if requested
    if [ "$MERGE_REPORTS" = "true" ]; then
        merge_test_results
        return
    fi
    
    # Generate reports
    print_header "=== Generating Reports ==="
    
    case $REPORT_TYPE in
        html)
            generate_html_report
            ;;
        json)
            generate_json_report
            ;;
        junit)
            generate_junit_report
            ;;
        allure)
            generate_allure_report
            ;;
        all)
            generate_html_report
            generate_json_report
            generate_junit_report
            generate_allure_report
            ;;
    esac
    
    # Generate statistics
    generate_statistics
    
    print_header "=== Report Generation Complete ==="
    print_success "All reports generated successfully!"
    print_info "Reports location: $OUTPUT_DIR"
    
    # List generated files
    echo ""
    print_info "Generated files:"
    find "$OUTPUT_DIR" -type f -name "*$TIMESTAMP*" | sed 's/^/  /'
}

# Run main function with all arguments
main "$@"
