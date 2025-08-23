# 🎯 Playwright Test Automation Framework - Code Generation Guide

## Overview

This framework provides powerful code generation tools for creating Playwright tests with TypeScript, following the Page Object Model (POM) pattern. The generator creates:

- Type-safe Page Object Models
- Well-structured test files
- Proper TypeScript types and interfaces
- Comprehensive logging and error handling
- Video recording and screenshot capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Playwright installed (`npm install -D @playwright/test`)
- TypeScript configured in your project

### Code Generation Workflow

1. **Record Test Actions**
   ```bash
   # Record test actions and save to codegen-raw directory
   npx playwright codegen https://parabank.parasoft.com/parabank/index.html --output codegen-raw/raw-bank.ts
   ```

2. **Generate Page Objects and Tests**
   ```bash
   # Generate Page Object and test file from recorded actions
   node generator.js --pageName=TransferFund --testPrefix=transfer-funds --tags="@ui @critical"
   ```

   This will create:
   - `pages/TransferFund.ts` - Page Object Model
   - `tests/web/transfer-funds.spec.ts` - Test file with your recorded actions

### Basic Usage

#### Generate Web Test with Page Object

```bash
# Generate a web test with page object
node generator.js --pageName=LoginPage --testPrefix=login-test --tags="@ui @critical"
```

#### Generate API Test

```bash
# Generate an API test
node generator.js --api --testPrefix=api-auth-test --tags="@api @critical"
```

#### Generate with Custom Options

```bash
# Generate with custom test data path
node generator.js \
  --pageName=CheckoutPage \
  --testPrefix=checkout-flow \
  --testData=./data/checkout.json \
  --tags="@e2e @critical"
```

## 📋 Available Commands

| Option | Description | Example |
|--------|-------------|---------|
| `--pageName` | Name of the page object class | `--pageName=LoginPage` |
| `--testPrefix` | Base name for test files | `--testPrefix=login-test` |
| `--tags` | Test tags for filtering | `--tags="@ui @critical"` |
| `--api` | Generate API test instead of UI test | `--api` |
| `--testData` | Path to test data file | `--testData=./data/test.json` |
| `--watch` | Watch for file changes | `--watch` |

### Interactive Mode

```bash
# Launch interactive mode for guided setup
./scripts/codegen-wrapper.sh -i https://www.saucedemo.com
```

## 📁 Generated File Structure

### Test Files
Generated tests follow our folder architecture:

```
tests/
├── web/
│   ├── sauce-demo/
│   │   ├── auth/
│   │   │   └── login-functionality.spec.ts
│   │   └── checkout/
│   │       └── checkout-flow.spec.ts
│   └── generated/
│       └── example-test.spec.ts
├── api/
│   └── generated/
│       └── api-test.spec.ts
├── mobile/
│   └── generated/
│       └── mobile-test.spec.ts
└── e2e/
    └── generated/
        └── e2e-test.spec.ts
```

### Page Objects (Optional)
When using `-p` flag, page objects are generated:

```
src/pages/
├── web/
│   ├── sauce-demo/
│   │   ├── auth/
│   │   │   └── login-functionality-page.ts
│   │   └── checkout/
│   │       └── checkout-flow-page.ts
│   └── generated/
│       └── example-page.ts
```

## 🏷️ Automatic Tag Generation

The system automatically suggests tags based on URL patterns:

| URL Pattern | Generated Tags |
|-------------|----------------|
| `*login*`, `*auth*` | `@auth` |
| `*api*` | `@api` |
| `*checkout*`, `*payment*` | `@critical` |
| `*admin*` | `@admin` |
| Mobile device | `@mobile @ui` |
| API endpoints | `@api` |
| E2E workflows | `@e2e @regression` |
| Default | `@web @ui` |

Base tags always include: `@generated @medium`

## 🛠️ Command Options

### Basic Options

| Option | Description | Example |
|--------|-------------|---------|
| `-o, --output` | Output file path (relative to tests/) | `-o web/sauce-demo/auth/login.spec.ts` |
| `-n, --name` | Test name (kebab-case) | `-n login-functionality` |
| `-d, --describe` | Test describe block name | `-d "User Authentication"` |
| `--tags` | Test tags | `--tags '@smoke @auth @critical'` |
| `-t, --type` | Test type (web, api, mobile, e2e) | `-t web` |

### Advanced Options

| Option | Description | Example |
|--------|-------------|---------|
| `-b, --browser` | Browser to use | `-b firefox` |
| `--device` | Device to emulate | `--device 'iPhone 12'` |
| `-p, --page-object` | Generate page object | `-p` |
| `-i, --interactive` | Interactive mode | `-i` |

## 📝 Generated Test Template

### Standard Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { logger } from '@utils/core/logger';
import type { TestInfo } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    logger.info('🚀 Setting up test environment');
    // Add any common setup here
  });

  test.afterEach(async ({ page }, testInfo: TestInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      logger.error('❌ Test failed', { 
        testName: testInfo.title,
        error: testInfo.error?.message 
      });
    }
  });

  test('should login successfully @smoke @auth @critical', async ({ page }) => {
    logger.info('🎯 Starting test: should login successfully');
    
    try {
      // Your recorded test steps here
      await page.goto('https://www.saucedemo.com');
      await page.click('[data-test="username"]');
      await page.fill('[data-test="username"]', 'standard_user');
      // ... more steps
      
      logger.info('✅ Test completed successfully');
    } catch (error) {
      logger.error('❌ Test execution failed', { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  });
});
```

### Generated Page Object Structure

```typescript
import { BasePage } from '@pages/base-page';
import { logger } from '@utils/core/logger';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Login Functionality
 * Handles login functionality and interactions
 */
export class LoginFunctionalityPage extends BasePage {
  // Page URL and title
  protected readonly url = '/';
  protected readonly pageTitle = 'User Authentication';

  // Page elements
  private readonly usernameInput: Locator = this.page.locator('[data-test="username"]');
  private readonly passwordInput: Locator = this.page.locator('[data-test="password"]');
  private readonly loginButton: Locator = this.page.locator('[data-test="login-button"]');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the Login Functionality page
   */
  async navigateTo(): Promise<void> {
    logger.info('🧭 Navigating to Login Functionality page');
    await this.goto(this.url);
    await this.waitForPageSpecificElements();
    logger.info('✅ Successfully navigated to Login Functionality page');
  }

  /**
   * Verify that all essential page elements are present
   */
  async verifyPageElements(): Promise<void> {
    logger.info('🔍 Verifying Login Functionality page elements');
    
    await this.waitForVisible(this.usernameInput);
    await this.waitForVisible(this.passwordInput);
    await this.waitForVisible(this.loginButton);
    
    logger.info('✅ All Login Functionality page elements verified');
  }

  /**
   * Wait for page-specific elements to be visible
   */
  async waitForPageSpecificElements(): Promise<void> {
    await this.waitForVisible(this.usernameInput);
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    logger.info('🔐 Performing login');
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    logger.info('✅ Login completed successfully');
  }
}
```

## 🎯 Usage Examples

### 1. Basic Web Test Generation

```bash
# Record a simple login test
./scripts/codegen-wrapper.sh -n login-test --tags '@smoke @auth' https://www.saucedemo.com

# This generates:
# - tests/web/generated/login-test.spec.ts
# - Automatic tag suggestions based on URL
# - Proper imports and logging structure
```

### 2. E2E Test with Page Object

```bash
# Record complete checkout flow with page object
./scripts/codegen-wrapper.sh \
  -n complete-checkout \
  -d "Complete Checkout Flow" \
  --tags '@e2e @critical @regression' \
  -t e2e \
  -p \
  https://www.saucedemo.com

# This generates:
# - tests/e2e/generated/complete-checkout.spec.ts
# - src/pages/e2e/generated/complete-checkout-page.ts
# - Full page object with methods and elements
```

### 3. Mobile Test Generation

```bash
# Record mobile-specific interactions
./scripts/codegen-wrapper.sh \
  --device 'iPhone 12' \
  -n mobile-navigation \
  -o mobile/ios/navigation.spec.ts \
  --tags '@mobile @ui @navigation' \
  https://m.example.com

# This generates:
# - tests/mobile/ios/navigation.spec.ts
# - Mobile viewport configuration
# - Touch-specific interactions
```

### 4. API Test Generation

```bash
# Generate API test structure
./scripts/codegen-wrapper.sh \
  -t api \
  -n user-endpoints \
  -o api/users/user-endpoints.spec.ts \
  --tags '@api @integration' \
  https://api.example.com

# This generates:
# - tests/api/users/user-endpoints.spec.ts
# - API-specific imports and structure
# - Request/response validation patterns
```

### 5. Interactive Mode

```bash
# Launch interactive mode for guided setup
./scripts/codegen-wrapper.sh -i https://www.saucedemo.com

# Interactive prompts will ask for:
# - Test type selection
# - Test name and description
# - Tag selection from available options
# - Output directory structure
# - Page object generation preference
```

## 🔧 Customization

### Custom Templates

Templates are located in `codegen-templates/`:

- `test-template.ts` - Base test structure
- `page-object-template.ts` - Page object structure
- `codegen-config.js` - Configuration and logic

### Modifying Templates

1. Edit template files to change structure
2. Update placeholder variables (e.g., `{{TEST_NAME}}`)
3. Modify `codegen-config.js` for custom logic

### Adding New Test Types

1. Update `determine_test_type()` function in `codegen-wrapper.sh`
2. Add new case in `generate_output_path()` function
3. Create custom template if needed

## 🏃‍♂️ Integration with Existing Workflow

### Using Generated Tests

```bash
# Run generated test
npx playwright test tests/web/generated/login-test.spec.ts

# Run with specific tags
npx playwright test --grep "@generated"

# Run all generated tests
npx playwright test tests/**/generated/
```

### Customizing Generated Tests

1. **Review selectors**: Update to use `data-test` attributes
2. **Add assertions**: Include proper validation logic
3. **Error handling**: Enhance error scenarios
4. **Page object methods**: Add business logic methods

### Best Practices

1. **Always review generated code** before committing
2. **Update selectors** to use semantic attributes
3. **Add meaningful assertions** beyond basic navigation
4. **Include error scenarios** and edge cases
5. **Follow naming conventions** from CODING_STANDARDS.md

## 🚀 Advanced Features

### Batch Generation

```bash
# Generate multiple tests from a list
while IFS= read -r url; do
  ./scripts/codegen-wrapper.sh -n "$(basename "$url")-test" "$url"
done < urls.txt
```

### CI/CD Integration

```bash
# Generate tests in CI pipeline
./scripts/codegen-wrapper.sh \
  -n automated-test \
  --tags '@automated @ci' \
  -o ci/generated/automated-test.spec.ts \
  "$TARGET_URL"
```

### Custom Tag Strategies

```bash
# Environment-specific tags
./scripts/codegen-wrapper.sh --tags '@staging @smoke' "$STAGING_URL"

# Feature-specific tags
./scripts/codegen-wrapper.sh --tags '@feature-xyz @regression' "$FEATURE_URL"
```

## 🔍 Troubleshooting

### Common Issues

1. **Generated test fails to run**
   - Check imports are correct
   - Verify selectors exist on page
   - Update to use framework patterns

2. **Page object not generated**
   - Ensure `-p` flag is used
   - Check test type is 'web'
   - Verify output directory permissions

3. **Tags not applied correctly**
   - Use quotes around tag strings
   - Check tag format (@tag-name)
   - Verify no typos in tag names

### Debug Mode

```bash
# Run with verbose output
DEBUG=1 ./scripts/codegen-wrapper.sh -i https://example.com
```

## 📚 Related Documentation

- [CODING_STANDARDS.md](./CODING_STANDARDS.md) - Coding standards and conventions
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick command reference
- [README.md](./README.md) - Framework overview and setup

---

*This guide covers the custom codegen system. For standard Playwright codegen, refer to the [official documentation](https://playwright.dev/docs/codegen).*
