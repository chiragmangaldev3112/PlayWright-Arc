#!/bin/bash

# Simple Codegen Wrapper with Fixed Domain Extraction and Test Formatting
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Extract domain name properly
extract_domain() {
    local url="$1"
    # Extract domain: https://automationexercise.com -> automationexercise
    local domain=$(echo "$url" | sed 's|https://||g' | sed 's|http://||g' | sed 's|www\.||' | cut -d'/' -f1)
    # Remove .com and other extensions
    echo "$domain" | sed 's|\.com$||' | sed 's|\.org$||' | sed 's|\.net$||' | sed 's|\..*||'
}

# Parse arguments
GENERATE_PAGE_OBJECT=false
URL=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--page-object) GENERATE_PAGE_OBJECT=true; shift ;;
        *) URL="$1"; shift ;;
    esac
done

if [[ -z "$URL" ]]; then
    echo "Usage: $0 [-p] <URL>"
    exit 1
fi

# Extract clean domain
DOMAIN=$(extract_domain "$URL")
echo -e "${CYAN}Domain extracted: ${YELLOW}$DOMAIN${NC}"

# Set up paths
TEST_FILE="tests/web/generated/${DOMAIN}-test.spec.ts"
mkdir -p tests/web/generated

echo -e "${CYAN}Generating test: ${YELLOW}$TEST_FILE${NC}"

# Run codegen
npx playwright codegen --browser=chromium --target=playwright-test -o "$TEST_FILE" "$URL"

# Apply enterprise standards to test file
if [[ -f "$TEST_FILE" ]]; then
    echo -e "${CYAN}Applying enterprise standards...${NC}"
    
    # Read the raw content and extract test steps
    CONTENT=$(cat "$TEST_FILE")
    TEST_STEPS=$(echo "$CONTENT" | sed -n "/test('test'/,/^});/p" | sed '1d;$d' | sed 's/^  /    /')
    
    # Generate standardized content directly
    cat > "$TEST_FILE" << 'EOF'
import { test, expect } from '@playwright/test';
import { logger } from '@utils/core/logger';
import type { TestInfo } from '@playwright/test';

test.describe('Automation Exercise - User Registration Flow @e2e @auth @registration', () => {
  test.beforeEach(async ({ page }) => {
    logger.info('🚀 Setting up test environment');
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async ({ page }, testInfo: TestInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      logger.error('❌ Test failed', { 
        testName: testInfo.title,
        error: testInfo.error?.message 
      });
      
      // Take screenshot on failure
      await page.screenshot({ 
        path: `test-results/failure-${testInfo.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`,
        fullPage: true 
      });
    }
  });

  test('should complete user registration and add product to cart', async ({ page }) => {
    logger.info('🎯 Starting test: user registration and cart flow');
    
    try {
EOF
    
    # Add the extracted test steps
    echo "$TEST_STEPS" >> "$TEST_FILE"
    
    # Add the closing part
    cat >> "$TEST_FILE" << 'EOF'
      
      // Add your assertions here
      expect(page).toBeTruthy();
      
      logger.info('✅ Test completed successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error('❌ Test execution failed', { 
        error: errorMessage,
        stack: errorStack 
      });
      throw error;
    }
  });
});
EOF
    
    echo -e "${GREEN}✅ Applied enterprise standards${NC}"
fi

# Generate page objects if requested
if [[ "$GENERATE_PAGE_OBJECT" == true ]]; then
    echo -e "${CYAN}Generating page objects...${NC}"
    
    # Create page directory
    mkdir -p "pages/$DOMAIN"
    
    # Analyze test content for routes
    ROUTES=()
    if [[ -f "$TEST_FILE" ]]; then
        content=$(cat "$TEST_FILE")
        
        # Check for login/signup patterns
        if echo "$content" | grep -qi "login\|signin\|sign.in"; then
            ROUTES+=("login")
        fi
        if echo "$content" | grep -qi "signup\|register\|sign.up"; then
            ROUTES+=("signup")
        fi
        if echo "$content" | grep -qi "cart\|basket\|shopping"; then
            ROUTES+=("cart")
        fi
        if echo "$content" | grep -qi "checkout\|payment\|pay\|order"; then
            ROUTES+=("checkout")
        fi
    fi
    
    # If no specific routes found, create main page
    if [[ ${#ROUTES[@]} -eq 0 ]]; then
        ROUTES=("main")
    fi
    
    # Generate page objects for each route
    for route in "${ROUTES[@]}"; do
        page_file="pages/$DOMAIN/${route}-page.ts"
        # Create class name with proper capitalization
        domain_cap=$(echo "$DOMAIN" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        route_cap=$(echo "$route" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        class_name="${domain_cap}${route_cap}Page"
        
        cat > "$page_file" << EOF
import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base-page';
import { logger } from '@utils/core/logger';

/**
 * Page Object for $DOMAIN $route page
 */
export class $class_name extends BasePage {
  protected readonly url = '$URL';
  protected readonly pageTitle = '$DOMAIN - $route';

  constructor(page: Page) {
    super(page);
  }

  override getFullUrl(): string {
    return this.url;
  }

  async verifyPageElements(): Promise<void> {
    await this.waitForPageLoad();
    logger.info('✅ $route page elements verified');
  }

  async waitForPageSpecificElements(): Promise<void> {
    await this.waitForPageLoad();
  }
}
EOF
        
        echo -e "${GREEN}✅ Generated: ${YELLOW}$page_file${NC}"
    done
    
    # Add imports to test file
    temp_file=$(mktemp)
    for route in "${ROUTES[@]}"; do
        domain_cap=$(echo "$DOMAIN" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        route_cap=$(echo "$route" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        class_name="${domain_cap}${route_cap}Page"
        echo "import { $class_name } from '@pages/$DOMAIN/${route}-page';"
    done > "$temp_file"
    echo "" >> "$temp_file"
    cat "$TEST_FILE" >> "$temp_file"
    mv "$temp_file" "$TEST_FILE"
    
    echo -e "${GREEN}✅ Updated test with page object imports${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Codegen completed!${NC}"
echo -e "${CYAN}Generated files:${NC}"
echo -e "  📄 Test: ${YELLOW}$TEST_FILE${NC}"

if [[ "$GENERATE_PAGE_OBJECT" == true ]]; then
    for route in "${ROUTES[@]}"; do
        echo -e "  📄 Page: ${YELLOW}pages/$DOMAIN/${route}-page.ts${NC}"
    done
fi
