#!/bin/bash

# 🎯 Test Generator Script
# Generates Playwright tests following coding standards and folder architecture
# Usage: ./scripts/generate-test.sh [options]

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
TEST_TYPE=""
TEST_NAME=""
DESCRIBE_BLOCK=""
TAGS=""
OUTPUT_DIR=""
PAGE_OBJECT=""
INTERACTIVE=false

# Function to display usage
show_usage() {
    echo -e "${CYAN}🎯 Playwright Test Generator${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./scripts/generate-test.sh [OPTIONS]"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  -t, --type TYPE          Test type (web, api, mobile, e2e)"
    echo "  -n, --name NAME          Test name (kebab-case)"
    echo "  -d, --describe DESC      Test describe block name"
    echo "  --tags TAGS              Test tags (e.g., '@smoke @critical')"
    echo "  -o, --output DIR         Output directory (relative to tests/)"
    echo "  -p, --page-object        Generate page object along with test"
    echo "  -i, --interactive        Interactive mode"
    echo "  -h, --help               Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  # Interactive mode"
    echo "  ./scripts/generate-test.sh -i"
    echo ""
    echo "  # Generate web test"
    echo "  ./scripts/generate-test.sh -t web -n login-functionality -d 'User Authentication' --tags '@smoke @auth @critical'"
    echo ""
    echo "  # Generate API test with page object"
    echo "  ./scripts/generate-test.sh -t api -n user-management -p -o api/users"
    echo ""
    echo -e "${YELLOW}Test Types & Folder Structure:${NC}"
    echo "  web     → tests/web/[domain]/[category]/"
    echo "  api     → tests/api/[service]/[endpoint]/"
    echo "  mobile  → tests/mobile/[platform]/[feature]/"
    echo "  e2e     → tests/e2e/[workflow]/"
}

# Function for interactive mode
interactive_mode() {
    echo -e "${CYAN}🎯 Interactive Test Generator${NC}"
    echo ""
    
    # Test type selection
    echo -e "${YELLOW}Select test type:${NC}"
    echo "1) Web UI Test"
    echo "2) API Test"
    echo "3) Mobile Test"
    echo "4) End-to-End Test"
    read -p "Enter choice (1-4): " type_choice
    
    case $type_choice in
        1) TEST_TYPE="web" ;;
        2) TEST_TYPE="api" ;;
        3) TEST_TYPE="mobile" ;;
        4) TEST_TYPE="e2e" ;;
        *) echo -e "${RED}❌ Invalid choice${NC}"; exit 1 ;;
    esac
    
    # Test name
    read -p "Enter test name (kebab-case): " TEST_NAME
    
    # Describe block
    read -p "Enter describe block name: " DESCRIBE_BLOCK
    
    # Tags
    echo -e "${YELLOW}Common tags:${NC}"
    echo "@smoke @regression @critical @high @medium @low"
    echo "@auth @api @ui @performance @security @accessibility"
    echo "@data-integrity @error-handling @user-types"
    read -p "Enter tags (space-separated): " TAGS
    
    # Output directory
    case $TEST_TYPE in
        "web")
            read -p "Enter domain/category (e.g., sauce-demo/auth): " OUTPUT_DIR
            OUTPUT_DIR="web/$OUTPUT_DIR"
            ;;
        "api")
            read -p "Enter service/endpoint (e.g., users/authentication): " OUTPUT_DIR
            OUTPUT_DIR="api/$OUTPUT_DIR"
            ;;
        "mobile")
            read -p "Enter platform/feature (e.g., ios/navigation): " OUTPUT_DIR
            OUTPUT_DIR="mobile/$OUTPUT_DIR"
            ;;
        "e2e")
            read -p "Enter workflow name (e.g., complete-checkout): " OUTPUT_DIR
            OUTPUT_DIR="e2e/$OUTPUT_DIR"
            ;;
    esac
    
    # Page object generation
    if [[ "$TEST_TYPE" == "web" ]]; then
        read -p "Generate page object? (y/n): " generate_po
        if [[ "$generate_po" == "y" || "$generate_po" == "Y" ]]; then
            PAGE_OBJECT=true
        fi
    fi
}

# Function to generate test file
generate_test_file() {
    local template_file="codegen-templates/test-template.ts"
    local output_file="tests/${OUTPUT_DIR}/${TEST_NAME}.spec.ts"
    local output_path="tests/${OUTPUT_DIR}"
    
    # Create output directory
    mkdir -p "$output_path"
    
    # Read template
    if [[ ! -f "$template_file" ]]; then
        echo -e "${RED}❌ Template file not found: $template_file${NC}"
        exit 1
    fi
    
    # Generate test content
    local test_content=$(cat "$template_file")
    
    # Replace placeholders
    test_content=${test_content//\{\{DESCRIBE_BLOCK\}\}/$DESCRIBE_BLOCK}
    test_content=${test_content//\{\{TEST_NAME\}\}/$TEST_NAME}
    test_content=${test_content//\{\{TAGS\}\}/$TAGS}
    
    # Generate test steps based on type
    local test_steps=""
    case $TEST_TYPE in
        "web")
            test_steps="// Navigate to the page
      await page.goto('https://example.com');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Add your test steps here
      // Example: await page.click('[data-test=\"login-button\"]');
      
      // Add assertions
      // Example: await expect(page).toHaveURL(/.*dashboard/);
      await expect(page).toHaveTitle(/.*/);"
            ;;
        "api")
            test_steps="// Create API request context
      const apiContext = await request.newContext();
      
      // Make API request
      const response = await apiContext.get('/api/endpoint');
      
      // Validate response
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('data');"
            ;;
        "mobile")
            test_steps="// Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to mobile page
      await page.goto('https://example.com');
      
      // Add mobile-specific interactions
      // Example: await page.tap('[data-test=\"mobile-menu\"]');
      
      // Add assertions
      await expect(page.locator('[data-test=\"mobile-content\"]')).toBeVisible();"
            ;;
        "e2e")
            test_steps="// Complete end-to-end workflow
      await page.goto('https://example.com');
      
      // Step 1: Authentication
      // Add login steps here
      
      // Step 2: Main workflow
      // Add main business logic steps
      
      // Step 3: Verification
      // Add final verification steps
      
      // Final assertion
      await expect(page).toHaveURL(/.*success/);"
            ;;
    esac
    
    test_content=${test_content//\{\{TEST_STEPS\}\}/$test_steps}
    
    # Add imports based on test type
    local imports=""
    case $TEST_TYPE in
        "web")
            if [[ "$PAGE_OBJECT" == true ]]; then
                local page_class_name=$(echo "$TEST_NAME" | sed 's/-/ /g' | sed 's/\b\w/\U&/g' | sed 's/ //g')Page
                imports="import { ${page_class_name} } from '@pages/${OUTPUT_DIR}/${TEST_NAME}-page';"
            fi
            ;;
        "api")
            imports="import { request } from '@playwright/test';"
            ;;
    esac
    
    if [[ -n "$imports" ]]; then
        test_content="${imports}\n${test_content}"
    fi
    
    # Write test file
    echo -e "$test_content" > "$output_file"
    
    echo -e "${GREEN}✅ Generated test file: $output_file${NC}"
}

# Function to generate page object
generate_page_object() {
    if [[ "$PAGE_OBJECT" != true || "$TEST_TYPE" != "web" ]]; then
        return
    fi
    
    local template_file="codegen-templates/page-object-template.ts"
    local output_file="src/pages/${OUTPUT_DIR}/${TEST_NAME}-page.ts"
    local output_path="src/pages/${OUTPUT_DIR}"
    
    # Create output directory
    mkdir -p "$output_path"
    
    # Read template
    if [[ ! -f "$template_file" ]]; then
        echo -e "${RED}❌ Page object template not found: $template_file${NC}"
        return
    fi
    
    # Generate page object content
    local page_content=$(cat "$template_file")
    
    # Generate class name (PascalCase)
    local page_class_name=$(echo "$TEST_NAME" | sed 's/-/ /g' | sed 's/\b\w/\U&/g' | sed 's/ //g')Page
    local camel_case_name=$(echo "$TEST_NAME" | sed 's/-\([a-z]\)/\U\1/g')
    
    # Replace placeholders
    page_content=${page_content//\{\{PAGE_CLASS_NAME\}\}/$page_class_name}
    page_content=${page_content//\{\{CAMEL_CASE_NAME\}\}/$camel_case_name}
    page_content=${page_content//\{\{PAGE_NAME\}\}/$TEST_NAME}
    page_content=${page_content//\{\{PAGE_DESCRIPTION\}\}/Handles $TEST_NAME functionality and interactions}
    page_content=${page_content//\{\{PAGE_URL\}\}/\/}
    page_content=${page_content//\{\{PAGE_TITLE\}\}/$DESCRIBE_BLOCK}
    
    # Generate page elements
    local page_elements="private readonly mainContainer: Locator = this.page.locator('[data-test=\"main-container\"]');
  private readonly submitButton: Locator = this.page.locator('[data-test=\"submit-button\"]');"
    
    page_content=${page_content//\{\{PAGE_ELEMENTS\}\}/$page_elements}
    
    # Generate element verifications
    local element_verifications="await this.waitForVisible(this.mainContainer);
    await this.waitForVisible(this.submitButton);"
    
    page_content=${page_content//\{\{ELEMENT_VERIFICATIONS\}\}/$element_verifications}
    
    # Generate wait for elements
    local wait_elements="await this.waitForVisible(this.mainContainer);"
    
    page_content=${page_content//\{\{WAIT_FOR_ELEMENTS\}\}/$wait_elements}
    
    # Generate custom methods
    local custom_methods="/**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    logger.info('📝 Submitting form');
    await this.click(this.submitButton);
    logger.info('✅ Form submitted successfully');
  }"
    
    page_content=${page_content//\{\{CUSTOM_METHODS\}\}/$custom_methods}
    
    # Write page object file
    echo -e "$page_content" > "$output_file"
    
    echo -e "${GREEN}✅ Generated page object: $output_file${NC}"
}

# Function to update imports in generated test
update_test_imports() {
    if [[ "$PAGE_OBJECT" == true && "$TEST_TYPE" == "web" ]]; then
        local test_file="tests/${OUTPUT_DIR}/${TEST_NAME}.spec.ts"
        local page_class_name=$(echo "$TEST_NAME" | sed 's/-/ /g' | sed 's/\b\w/\U&/g' | sed 's/ //g')Page
        
        # Add page object import
        sed -i '' "1i\\
import { ${page_class_name} } from '@pages/${OUTPUT_DIR}/${TEST_NAME}-page';
" "$test_file"
        
        echo -e "${GREEN}✅ Updated test imports${NC}"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -n|--name)
            TEST_NAME="$2"
            shift 2
            ;;
        -d|--describe)
            DESCRIBE_BLOCK="$2"
            shift 2
            ;;
        --tags)
            TAGS="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -p|--page-object)
            PAGE_OBJECT=true
            shift
            ;;
        -i|--interactive)
            INTERACTIVE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
echo -e "${PURPLE}🎯 Playwright Test Generator${NC}"
echo -e "${PURPLE}================================${NC}"

# Run interactive mode if requested
if [[ "$INTERACTIVE" == true ]]; then
    interactive_mode
fi

# Validate required parameters
if [[ -z "$TEST_TYPE" || -z "$TEST_NAME" ]]; then
    echo -e "${RED}❌ Missing required parameters${NC}"
    show_usage
    exit 1
fi

# Set defaults
if [[ -z "$DESCRIBE_BLOCK" ]]; then
    DESCRIBE_BLOCK=$(echo "$TEST_NAME" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')
fi

if [[ -z "$TAGS" ]]; then
    TAGS="@smoke @medium"
fi

if [[ -z "$OUTPUT_DIR" ]]; then
    OUTPUT_DIR="$TEST_TYPE/generated"
fi

# Display generation summary
echo -e "${CYAN}📋 Generation Summary:${NC}"
echo -e "  Test Type: ${YELLOW}$TEST_TYPE${NC}"
echo -e "  Test Name: ${YELLOW}$TEST_NAME${NC}"
echo -e "  Describe Block: ${YELLOW}$DESCRIBE_BLOCK${NC}"
echo -e "  Tags: ${YELLOW}$TAGS${NC}"
echo -e "  Output Directory: ${YELLOW}tests/$OUTPUT_DIR${NC}"
echo -e "  Page Object: ${YELLOW}$PAGE_OBJECT${NC}"
echo ""

# Generate files
generate_test_file
generate_page_object
update_test_imports

echo ""
echo -e "${GREEN}🎉 Test generation completed successfully!${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "  1. Review generated files"
echo -e "  2. Customize test steps and assertions"
echo -e "  3. Update page object selectors and methods"
echo -e "  4. Run the test: ${YELLOW}npx playwright test tests/${OUTPUT_DIR}/${TEST_NAME}.spec.ts${NC}"
echo ""
