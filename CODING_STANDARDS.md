# 📋 Playwright Test Automation - Coding Standards

## 🏷️ Test Tagging Conventions

### Standard Test Tags

All tests must be properly tagged for categorization, filtering, and CI/CD pipeline execution.

#### **Priority Tags**
- `@critical` - Business-critical functionality (blocking issues)
- `@high` - High-impact features (major functionality)
- `@medium` - Standard functionality (default priority)
- `@low` - Edge cases and non-critical features

#### **Test Type Tags**
- `@smoke` - Basic verification tests (fast execution)
- `@regression` - Full regression suite (comprehensive)
- `@sanity` - Quick health checks (pre-commit/PR)
- `@e2e` - End-to-end user flows
- `@api` - API contract and integration tests
- `@visual` - Visual regression tests

#### **Functional Area Tags**
- `@auth` - Authentication & authorization
- `@ui` - User interface components
- `@api` - API endpoints and services
- `@mobile` - Mobile-specific tests
- `@security` - Security testing
- `@performance` - Performance benchmarks
- `@a11y` - Accessibility compliance

## 🛠️ TypeScript Standards

### Type Definitions
- Use TypeScript interfaces for all data structures
- Prefer `type` over `interface` for unions and mapped types
- Use `readonly` for immutable properties
- Avoid `any` - use `unknown` with type guards

### Page Objects
```typescript
class LoginPage extends BasePage {
  // Locators
  private readonly usernameInput = this.page.locator('#username');
  private readonly passwordInput = this.page.locator('#password');
  private readonly loginButton = this.page.locator('button[type="submit"]');

  // Actions
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

### Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

// Test suite with metadata
test.describe('Authentication', () => {
  // Test case with tags
  test('should login with valid credentials @smoke @auth', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'password');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## ✅ Best Practices

### Selectors
- Prefer text-based selectors: `page.getByText('Submit')`
- Use data-testid attributes: `page.getByTestId('submit-button')`
- Avoid XPath selectors when possible
- Keep selectors short and stable

### Error Handling
- Use custom error classes for expected errors
- Implement retry logic for flaky operations
- Add meaningful error messages
- Include context in error logs

### Test Data
- Keep test data in separate JSON/TS files
- Use factories for complex test data
- Clean up test data after tests
- Use unique identifiers for test data

### **Tag Usage Examples**

```typescript
// Single tag
test('should login successfully @smoke', async () => {
  // Test implementation
});

// Multiple tags
test('should complete checkout process @critical @e2e @regression', async () => {
  // Test implementation
});

// Descriptive test with multiple categories
test('should validate user permissions across roles @security @user-types @high', async () => {
  // Test implementation
});
```

### **Tag Filtering Commands**

```bash
# Run smoke tests only
npx playwright test --grep "@smoke"

# Run critical tests
npx playwright test --grep "@critical"

# Run multiple tag combinations
npx playwright test --grep "@smoke|@critical"

# Exclude specific tags
npx playwright test --grep "^(?!.*@slow).*$"

# Using framework scripts
./scripts/run-tests.sh --tag @smoke
./scripts/run-tests.sh --tag "@critical|@high"
```

---

## 📁 Import Standards

### TypeScript Path Aliases

**Always use TypeScript path aliases instead of relative imports:**

```typescript
// ✅ CORRECT - Use path aliases
import type { UserRole, TestData } from '@types';
import { logger } from '@utils/core/logger';
import { BasePage } from '@pages/base-page';
import { BaseApi } from '@api/base-api';
import { config } from '@config/config-loader';

// ❌ INCORRECT - Avoid relative paths
import type { UserRole } from '../types/user-types';
import { logger } from '../../utils/core/logger';
import { BasePage } from '../pages/base-page';
```

### **Available Path Aliases**
- `@types` - Type definitions and interfaces
- `@utils` - Utility functions and helpers
- `@pages` - Page object models
- `@api` - API clients and services
- `@config` - Configuration files
- `@data` - Test data files

---

## 🧪 Test Structure Standards

### **Test File Naming**
- Use descriptive names: `login.spec.ts`, `checkout-flow.spec.ts`
- Include test type: `api-users.spec.ts`, `mobile-navigation.spec.ts`
- Use kebab-case for file names

### **Test Organization**
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/sauce-demo/auth/login-page';
import { logger } from '@utils/core/logger';

test.describe('User Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test('should login with valid credentials @smoke @auth @critical', async () => {
    // Test implementation with clear steps
    logger.info('🔐 Testing valid user login');
    
    await loginPage.login({
      username: 'standard_user',
      password: 'secret_sauce'
    });
    
    await expect(loginPage.page).toHaveURL(/.*inventory.html/);
    logger.info('✅ Login successful');
  });

  test('should show error for invalid credentials @auth @error-handling @medium', async () => {
    // Error scenario testing
  });
});
```

---

## 📝 Code Documentation Standards

### **Method Documentation**
```typescript
/**
 * Logs in a user with provided credentials
 * @param credentials - User login credentials
 * @param credentials.username - Username for login
 * @param credentials.password - Password for login
 * @throws {Error} When login fails or elements are not found
 * @example
 * ```typescript
 * await loginPage.login({
 *   username: 'standard_user',
 *   password: 'secret_sauce'
 * });
 * ```
 */
async login(credentials: LoginCredentials): Promise<void> {
  logger.info('🔐 Attempting user login', { username: credentials.username });
  // Implementation
}
```

### **Class Documentation**
```typescript
/**
 * Page Object Model for the login page functionality
 * Handles user authentication, form validation, and error scenarios
 * 
 * @example
 * ```typescript
 * const loginPage = new LoginPage(page);
 * await loginPage.navigateToLogin();
 * await loginPage.login({ username: 'user', password: 'pass' });
 * ```
 */
export class LoginPage extends BasePage {
  // Implementation
}
```

---

## 🎯 Naming Conventions

### **Variables and Functions**
- Use `camelCase` for variables and functions
- Use descriptive names: `userCredentials`, `validateLoginForm()`
- Avoid abbreviations: `username` not `usr`, `password` not `pwd`

### **Constants**
- Use `UPPER_SNAKE_CASE` for constants
- Group related constants in enums or objects

```typescript
const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  USERS: '/api/users'
} as const;

const DEFAULT_TIMEOUT = 30000;
const MAX_RETRY_ATTEMPTS = 3;
```

### **Classes and Interfaces**
- Use `PascalCase` for classes and interfaces
- Use descriptive names: `LoginPage`, `UserCredentials`, `ApiResponse`
- Prefix interfaces with `I` if needed: `IUserService`

---

## 🔧 Error Handling Standards

### **Consistent Error Handling**
```typescript
try {
  await this.performAction();
  logger.info('✅ Action completed successfully');
} catch (error) {
  logger.error('❌ Action failed', { 
    error: error.message,
    stack: error.stack 
  });
  throw new Error(`Failed to perform action: ${error.message}`);
}
```

### **Custom Error Types**
```typescript
export class LoginError extends Error {
  constructor(message: string, public readonly username?: string) {
    super(message);
    this.name = 'LoginError';
  }
}
```

---

## 📊 Logging Standards

### **Log Levels and Usage**
```typescript
// Information logging
logger.info('🔐 Starting login process', { username });

// Warning for recoverable issues
logger.warn('⚠️ Slow response detected', { responseTime: 5000 });

// Error for failures
logger.error('❌ Login failed', { error: error.message, username });

// Debug for development
logger.debug('🔍 Element found', { selector: '.login-button' });
```

### **Structured Logging**
```typescript
logger.info('User action completed', {
  action: 'login',
  username: credentials.username,
  timestamp: new Date().toISOString(),
  duration: Date.now() - startTime,
  success: true
});
```

---

## 🧹 Code Quality Standards

### **TypeScript Strict Mode**
- Enable strict mode in `tsconfig.json`
- Use proper type annotations
- Avoid `any` type - use specific types or `unknown`

### **ESLint and Prettier**
- Follow configured ESLint rules
- Use Prettier for consistent formatting
- Run linting before commits

### **Testing Best Practices**
- Write descriptive test names
- Use proper assertions with meaningful error messages
- Keep tests independent and idempotent
- Use appropriate wait strategies (avoid hard waits)

---

## 🚀 Performance Guidelines

### **Efficient Selectors**
```typescript
// ✅ GOOD - Use data attributes
await page.locator('[data-test="login-button"]').click();

// ✅ GOOD - Use specific selectors
await page.locator('#username-input').fill(username);

// ❌ AVOID - Generic selectors
await page.locator('button').nth(2).click();
```

### **Wait Strategies**
```typescript
// ✅ GOOD - Wait for specific conditions
await page.waitForURL('**/inventory.html');
await page.waitForSelector('[data-test="product-list"]');

// ❌ AVOID - Hard waits
await page.waitForTimeout(5000);
```

---

## 📋 Checklist for Code Reviews

### **Before Submitting**
- [ ] All tests pass locally
- [ ] Code follows naming conventions
- [ ] Proper error handling implemented
- [ ] Logging added for key actions
- [ ] Documentation updated
- [ ] TypeScript strict mode compliance
- [ ] ESLint warnings resolved
- [ ] Test tags properly applied

### **Review Criteria**
- [ ] Code is readable and maintainable
- [ ] Proper abstraction and reusability
- [ ] Error scenarios covered
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Consistent with framework patterns

---

## 🔄 Continuous Improvement

### **Regular Reviews**
- Review and update standards quarterly
- Gather team feedback on conventions
- Update based on framework evolution
- Document new patterns and practices

### **Training and Onboarding**
- New team members must review this document
- Regular training sessions on best practices
- Code review sessions for knowledge sharing
- Maintain examples and templates

---

*This document is a living standard that evolves with the framework and team needs. Last updated: $(date)*
