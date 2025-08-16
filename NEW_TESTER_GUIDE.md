# 🎯 New Tester Onboarding Guide

## 🚀 Initial Setup (One-Time Only)

### 1. Project Setup
```bash
# Navigate to project directory
cd playwrite-arc

# Install dependencies
npm install

# Set up codegen standards enforcement
./scripts/force-codegen-standards.sh

# Add aliases to your shell profile
echo "source $(pwd)/.codegen-aliases" >> ~/.zshrc    # For zsh users
echo "source $(pwd)/.codegen-aliases" >> ~/.bashrc   # For bash users

# Reload shell
source ~/.zshrc  # or source ~/.bashrc
```

### 2. Verify Setup
```bash
# Test codegen command
codegen --help

# Should show custom wrapper help (not raw Playwright)
```

## 📝 Daily Test Recording

### Quick Commands (Use These!)

```bash
# 🎯 MOST COMMON: Record with page objects
npm run codegen -p https://automationexercise.com/

# 🎯 SIMPLE: Basic recording
npm run codegen https://automationexercise.com/

# 🎯 CUSTOM LOCATION: Specify where to save
npm run codegen -p -o automationexercise/checkout/guest-checkout.spec.ts https://automationexercise.com/

# 🎯 INTERACTIVE: Guided setup for beginners
npm run codegen -i https://automationexercise.com/
```

### Alternative Commands (After alias setup)
```bash
# Simple aliases
codegen -p https://automationexercise.com/
codegen -i https://automationexercise.com/
```

## 🎬 Recording Workflow

### Step 1: Start Recording
```bash
npm run codegen -p https://automationexercise.com/
```

### Step 2: Browser Opens Automatically
- Perform your test actions (click, type, navigate)
- Actions are recorded automatically
- Take your time - no rush!

### Step 3: Stop Recording
- Close the browser window when done
- Or press `Ctrl+C` in terminal

### Step 4: Magic Happens! ✨
The system automatically:
- ✅ Applies your coding standards
- ✅ Creates proper test structure with describe blocks
- ✅ Adds error handling and logging
- ✅ Generates page objects (if you used `-p`)
- ✅ Places files in correct directories
- ✅ Adds proper TypeScript imports
- ✅ Includes test tags (@auth, @e2e, etc.)

## 📁 What You Get

### Generated Files Structure:
```
tests/
  web/
    automationexercise/
      auth/
        login.spec.ts          # Your standardized test
      checkout/
        guest-checkout.spec.ts # Another test
        
pages/                         # Page objects (if -p used)
  automationexercise/
    auth/
      login-page.ts           # Reusable page methods
```

### Sample Generated Test:
```typescript
import { test, expect } from '@playwright/test';
import { logger } from '@utils/core/logger';
import { LoginPage } from '@pages/automationexercise/auth/login-page';

test.describe('Automation Exercise - Login Flow @auth @critical', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    logger.info('🚀 Setting up test environment');
    loginPage = new LoginPage(page);
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    logger.info('🎯 Starting login test');
    
    try {
      // Your recorded actions here - but organized and clean!
      await loginPage.navigateTo();
      await loginPage.login('test@example.com', 'password123');
      
      // Proper assertions
      await expect(page).toHaveURL(/dashboard/);
      
      logger.info('✅ Test completed successfully');
    } catch (error) {
      logger.error('❌ Test failed', { error });
      throw error;
    }
  });
});
```

## 🏃‍♂️ Running Your Tests

```bash
# Run specific test
npx playwright test tests/web/automationexercise/auth/login.spec.ts

# Run all tests
npx playwright test

# Run with visual UI
npx playwright test --ui

# Run tests with specific tags
npx playwright test --grep "@auth"
npx playwright test --grep "@critical"

# Run in specific browser
npx playwright test --project=chromium
```

## 🛠️ Troubleshooting

### Problem: "codegen command not found"
**Solution:**
```bash
# Re-source your shell profile
source ~/.zshrc  # or ~/.bashrc

# Or use npm directly
npm run codegen https://example.com/
```

### Problem: Generated test doesn't follow standards
**Solution:**
```bash
# Apply standards manually to existing file
./scripts/apply-standards.sh tests/web/your-test.spec.ts
```

### Problem: Need to record mobile tests
**Solution:**
```bash
# Record with mobile device emulation
npm run codegen --device "iPhone 12" https://m.example.com/
```

## 📚 Test Sites for Practice

Try recording tests on these sites:

1. **Sauce Demo**: https://www.saucedemo.com/
   - Login: `standard_user` / `secret_sauce`
   - Great for e-commerce flows

2. **Automation Exercise**: https://automationexercise.com/
   - Full registration and checkout flow
   - Good for complex scenarios

3. **DemoQA**: https://demoqa.com/
   - Various UI elements and forms
   - Perfect for learning different interactions

## 🎯 Best Practices

### DO's ✅
- Always use `npm run codegen -p` for page objects
- Use descriptive test names
- Test one user flow per recording
- Close browser cleanly to finish recording

### DON'Ts ❌
- Don't use raw `npx playwright codegen` (bypasses standards)
- Don't record multiple unrelated flows in one test
- Don't forget to add assertions for important validations

## 🆘 Getting Help

1. **Check the help**: `codegen --help`
2. **View documentation**: Check `CODEGEN_GUIDE.md`
3. **Ask team lead** for complex scenarios
4. **Review existing tests** in the `tests/` directory for examples

## 🎉 You're Ready!

Start with this simple command:
```bash
npm run codegen -p https://automationexercise.com/
```

Record a simple flow (like login) and see the magic happen! 🪄
