# 🚀 Playwright Test Automation Framework

A modern, type-safe test automation framework built with Playwright and TypeScript, featuring powerful code generation, comprehensive reporting, and enterprise-grade architecture.

## ✨ Key Features

- **TypeScript First**: Full TypeScript support with strict type checking
- **Page Object Model**: Clean, maintainable architecture with type-safe page objects
- **Smart Code Generation**: Generate tests and page objects with a single command
- **Multi-Environment**: Test across different environments with ease
- **Parallel Testing**: Built-in support for parallel test execution
- **Visual Testing**: Screenshot and video recording capabilities
- **API Testing**: Integrated API testing support
- **Comprehensive Reporting**: HTML, JUnit, and Allure reporting
- **CI/CD Ready**: GitHub Actions and Jenkins integration
- **Modern Tooling**: ESLint, Prettier, and Husky for code quality

## 🚀 Quick Start

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- Git for version control

### Installation and Setup

1. **Clone and install dependencies**
   ```bash
   # Clone the repository
   git clone https://github.com/your-org/playwright-framework.git
   cd playwright-framework
   
   # Install dependencies
   npm install
   
   # Install Playwright browsers
   npx playwright install
   ```

2. **Record your first test**
   ```bash
   # Start recording test actions
   npx playwright codegen https://parabank.parasoft.com/parabank/index.html --output codegen-raw/raw-bank.ts
   ```
   
   Perform your test actions in the browser, then close it when done.

3. **Generate Page Object and Test**
   ```bash
   # Generate Page Object and test file
   node generator.js --pageName=TransferFund --testPrefix=transfer-funds --tags="@ui @critical"
   ```

4. **Run your test**
   ```bash
   # Run the generated test
   npx playwright test tests/web/transfer-funds.spec.ts
   ```

```bash
# Clone the repository
git clone https://github.com/your-org/playwright-framework.git
cd playwright-framework

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Generate Your First Test

```bash
# Generate a web test with page object
node generator.js --pageName=LoginPage --testPrefix=login-test --tags="@ui @critical"

# Generate an API test
node generator.js --api --testPrefix=api-auth-test --tags="@api @critical"
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests with specific tags
npm test -- --grep @critical

# Run in UI mode
npm run test:ui

# Run with Allure reporting
npm run test:report
```

### 3. What Gets Generated
```
tests/web/generated/
└── automationexercise-test.spec.ts  # Enterprise test with logging

pages/automationexercise/
├── login-page.ts                    # Login page object
├── signup-page.ts                   # Signup page object
└── cart-page.ts                     # Cart page object
```

### 4. Run Your Test
```bash
# Run the generated test
npx playwright test tests/web/generated/automationexercise-test.spec.ts

# With video and screenshots automatically captured
npx playwright test --headed  # See it run in browser
```

### 5. Available Codegen Commands
```bash
# Basic test generation
codegen https://example.com

# With page objects (recommended)
codegen -p https://example.com

# Alternative aliases
gen-test -p https://example.com
record-test -p https://example.com
codegen-full https://example.com
```

## 📁 Comprehensive File Structure & Details

### 🎯 **Core Framework Files**

```
playwrite-arc/
├── 📋 Configuration Files
│   ├── playwright.config.ts         # Main Playwright configuration (6.2KB)
│   ├── tsconfig.json               # TypeScript configuration (4.6KB)
│   ├── package.json                # Dependencies and npm scripts (1.8KB)
│   ├── .eslintrc.js               # Code linting rules (3.8KB)
│   ├── .prettierrc                # Code formatting rules (387B)
│   ├── .env.example               # Environment variables template (5.2KB)
│   └── .gitignore                 # Git ignore patterns (1.5KB)
│
├── 🛠️ **SCRIPTS DIRECTORY - Your Automation Toolkit**
│   ├── setup.sh                   # 🚀 Initial environment setup (7.0KB)
│   │   └── Commands:
│   │       ├── ./scripts/setup.sh local     # Set up local development
│   │       ├── ./scripts/setup.sh staging   # Set up staging environment
│   │       └── ./scripts/setup.sh prod      # Set up production environment
│   │
│   ├── run-tests.sh               # 🏃‍♂️ Advanced test runner (11.9KB)
│   │   └── Commands:
│   │       ├── ./scripts/run-tests.sh                           # Run all tests
│   │       ├── ./scripts/run-tests.sh --suite api               # API tests only
│   │       ├── ./scripts/run-tests.sh --suite web               # Web UI tests only
│   │       ├── ./scripts/run-tests.sh --suite mobile            # Mobile tests only
│   │       ├── ./scripts/run-tests.sh --suite smoke             # Smoke tests only
│   │       ├── ./scripts/run-tests.sh --browser firefox         # Firefox browser
│   │       ├── ./scripts/run-tests.sh --browser webkit          # WebKit browser
│   │       ├── ./scripts/run-tests.sh --browser all             # All browsers
│   │       ├── ./scripts/run-tests.sh --tag @performance        # Performance tests
│   │       ├── ./scripts/run-tests.sh --tag @security           # Security tests
│   │       ├── ./scripts/run-tests.sh --workers 8               # 8 parallel workers
│   │       ├── ./scripts/run-tests.sh --retries 0               # No retries
│   │       ├── ./scripts/run-tests.sh --headless false          # Show browser
│   │       ├── ./scripts/run-tests.sh --debug true              # Debug mode
│   │       ├── ./scripts/run-tests.sh --video --trace           # Record video & traces
│   │       └── ./scripts/run-tests.sh --environment staging     # Staging environment
│   │
│   ├── generate-report.sh         # 📊 Report generator (12.1KB)
│   │   └── Commands:
│   │       ├── ./scripts/generate-report.sh --type html --open  # HTML report + open
│   │       ├── ./scripts/generate-report.sh --type json         # JSON report
│   │       ├── ./scripts/generate-report.sh --type junit        # JUnit XML report
│   │       ├── ./scripts/generate-report.sh --type allure       # Allure report
│   │       ├── ./scripts/generate-report.sh --type all          # All report types
│   │       ├── ./scripts/generate-report.sh --merge             # Merge multiple runs
│   │       ├── ./scripts/generate-report.sh --archive           # Archive reports
│   │       └── ./scripts/generate-report.sh --stats             # Generate statistics
│   │
│   └── clean.sh                   # 🧹 Project cleanup (12.6KB)
│       └── Commands:
│           ├── ./scripts/clean.sh --all                         # Clean everything
│           ├── ./scripts/clean.sh --reports                     # Clean reports only
│           ├── ./scripts/clean.sh --logs                        # Clean logs only
│           ├── ./scripts/clean.sh --screenshots                 # Clean screenshots
│           ├── ./scripts/clean.sh --videos                      # Clean videos
│           ├── ./scripts/clean.sh --traces                      # Clean traces
│           ├── ./scripts/clean.sh --cache                       # Clean npm cache
│           ├── ./scripts/clean.sh --deps                        # Clean dependencies
│           ├── ./scripts/clean.sh --all --dry-run               # Preview cleanup
│           └── ./scripts/clean.sh --all --verbose               # Verbose output
│
├── 🌐 **API Layer**
│   ├── api/
│   │   ├── base-api.ts             # Base API client with auth & utilities (14.7KB)
│   │   └── dummy-api.ts            # DummyJSON API client for secure testing (17.3KB)
│   └── config/
│       └── config-loader.ts        # Environment configuration loader (8.2KB)
│
├── 📄 **Page Objects**
│   ├── pages/
│   │   ├── base-page.ts            # Base page with common functionality (22.7KB)
│   │   ├── login-page.ts           # Login page object model (13.4KB)
│   │   └── dashboard-page.ts       # Dashboard page object model (19.4KB)
│
├── 🧪 **Test Suites**
│   ├── tests/
│   │   └── api/
│   │       └── dummy-api.spec.ts   # Comprehensive DummyAPI tests (10.1KB)
│   │
│   └── data/
│       └── test-data.json          # Test data and fixtures (2.1KB)
│
├── 🔧 **Utilities & Helpers**
│   ├── utils/
│   │   ├── index.ts                # Utility exports (957B)
│   │   ├── core/                   # Core utilities (3 files)
│   │   ├── data/                   # Data management utilities (2 files)
│   │   ├── formatting/             # Formatting helpers (2 files)
│   │   ├── network/                # Network utilities (1 file)
│   │   ├── security/               # Security helpers (1 file)
│   │   ├── system/                 # System utilities (2 files)
│   │   └── testing/                # Testing utilities (2 files)
│   │
│   └── types/
│       └── index.ts                # TypeScript type definitions (3.1KB)
│
├── 📊 **Reporting & Results**
│   ├── reports/                    # Enterprise reporting hub
│   │   ├── logs/                  # Application logs (automation.log, errors.log)
│   │   ├── screenshots/           # Visual evidence and debugging screenshots
│   │   ├── videos/                # Test execution recordings
│   │   ├── traces/                # Detailed execution traces
│   │   ├── archive/               # Historical test runs with timestamps
│   │   └── execution-summary.json # High-level test metrics and summaries
│   │
│   ├── playwright-report/          # Playwright's interactive HTML report
│   ├── test-results/              # Raw Playwright test data (JSON, XML, traces)
│   └── allure-results/            # Allure reporting data for advanced analytics
│
├── 🐳 **DevOps & CI/CD**
│   ├── .github/
│   │   └── workflows/
│   │       └── playwright.yml     # GitHub Actions workflow
│   ├── Dockerfile                 # Docker container configuration (1.1KB)
│   ├── docker-compose.yml         # Docker Compose orchestration (2.5KB)
│   └── Jenkinsfile               # Jenkins pipeline configuration (11.2KB)
│
└── 📚 **Documentation**
    ├── README.md                  # Main documentation (18.5KB)
    ├── QUICK_REFERENCE.md         # Command reference guide (16.6KB)
    ├── CONTRIBUTING.md            # Contributor guidelines (10.6KB)
    └── CHANGELOG.md              # Version history (6.2KB)
```

## 🚀 **Quick Start with Scripts**

### **1️⃣ Initial Setup (Run Once)**
```bash
# Set up everything automatically
./scripts/setup.sh local

# What it does:
# ✅ Validates Node.js 18+ and npm
# ✅ Installs all dependencies
# ✅ Downloads Playwright browsers
# ✅ Creates required directories
# ✅ Sets up environment files
# ✅ Makes scripts executable
```

### **2️⃣ Run Your First Test**
```bash
# Run DummyAPI tests (recommended first test)
./scripts/run-tests.sh --suite api --browser chromium

# Run all tests
./scripts/run-tests.sh

# Run smoke tests (quick validation)
./scripts/run-tests.sh --suite smoke
```

### **3️⃣ View Beautiful Reports**
```bash
# Generate and open HTML report
./scripts/generate-report.sh --type html --open

# Generate all report types
./scripts/generate-report.sh --type all
```

### **4️⃣ Clean Up When Needed**
```bash
# Clean test artifacts
./scripts/clean.sh --reports --logs

# Clean everything
./scripts/clean.sh --all
```

---

## 🛠️ Manual Setup and Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playwrite-arc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Create test data directories**
   ```bash
   mkdir -p test-data reports screenshots logs
   ```

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Environment Configuration
NODE_ENV=local
TEST_ENV=local

# Application URLs
BASE_URL=https://your-app.com
API_BASE_URL=https://api.your-app.com

# Test User Credentials
ADMIN_USERNAME=admin@example.com
ADMIN_PASSWORD=AdminPassword123!
USER_USERNAME=user@example.com
USER_PASSWORD=UserPassword123!

# Test Execution Settings
HEADLESS=false
BROWSER=chromium
TIMEOUT=30000
RETRIES=2
WORKERS=4

# Reporting Configuration
GENERATE_HTML_REPORT=true
GENERATE_JSON_REPORT=true
GENERATE_JUNIT_REPORT=true
```

### Playwright Configuration

The framework uses `playwright.config.ts` for configuration:

- **Multiple browsers**: Chromium, Firefox, Safari, Edge
- **Mobile devices**: iPhone, iPad, Android devices
- **Parallel execution**: Configurable worker count
- **Retries**: Automatic retry on failure
- **Timeouts**: Configurable timeouts for different operations
- **Reporters**: HTML, JSON, JUnit, and custom reporters

## 🏃‍♂️ Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run web tests only
npm run test:web

# Run API tests only
npm run test:api

# Run mobile tests only
npm run test:mobile

# Run tests in headed mode
npm run test:headed

# Run tests with specific browser
npx playwright test --project=chromium

# Run tests with tags
npx playwright test --grep "@positive"
npx playwright test --grep "@login"
```

### Advanced Commands

```bash
# Run tests in parallel
npx playwright test --workers=4

# Run tests with retries
npx playwright test --retries=3

# Run specific test file
npx playwright test tests/web/login.spec.ts

# Run tests in debug mode
npx playwright test --debug

# Generate and show HTML report
npx playwright show-report
```

## 📊 Enterprise-Grade Test Reporting

The framework provides comprehensive multi-layered reporting for different stakeholders and use cases:

### 🎯 Report Types Overview

| Report Type | Location | Purpose | Audience |
|-------------|----------|---------|----------|
| **Playwright HTML** | `playwright-report/` | Interactive test results | Developers/QA |
| **Raw Test Data** | `test-results/` | JSON, XML, traces | CI/CD Systems |
| **Enterprise Reports** | `reports/` | Logs, archives, metrics | Enterprise Stakeholders |
| **Allure Analytics** | `allure-results/` | Advanced analytics | Management/Analytics |

### 🌐 Interactive HTML Report
```bash
npx playwright show-report
```
**Features:**
- ✅ Real-time test results with pass/fail status
- 🎥 Screenshots and videos for failed tests
- 📊 Browser-wise test breakdown (Chromium, Firefox, WebKit)
- ⏱️ Detailed execution timeline and performance metrics
- 🔍 Interactive filtering by status, browser, test suite
- 📋 Error messages and stack traces for debugging

### 🏢 Enterprise Reports Hub (`/reports`)

#### **Application Logs** (`reports/logs/`)
```bash
# View comprehensive application logs
cat reports/logs/automation.log    # Main application log (81KB+)
cat reports/logs/errors.log        # Error-specific logs
cat reports/logs/exceptions.log    # Exception tracking
cat reports/logs/rejections.log    # Promise rejection tracking
```

#### **Visual Evidence** (`reports/screenshots/`, `reports/videos/`)
- 📸 **Screenshots**: Automatic capture on test failures
- 🎬 **Videos**: Full test execution recordings
- 🔍 **Traces**: Step-by-step execution traces for debugging

#### **Historical Archives** (`reports/archive/`)
```
reports/archive/
└── 2025-08-16T14-05-15-985Z/     # Timestamped test run
    ├── archive-info.json         # Run metadata
    ├── html-report/              # Archived HTML report
    ├── logs/                     # Archived logs
    ├── screenshots/              # Archived screenshots
    └── test-results/             # Archived test data
```

#### **Executive Summary** (`reports/execution-summary.json`)
- 📈 High-level test metrics and KPIs
- 🎯 Success rates and performance benchmarks
- 📊 Trend analysis and historical comparisons
- 🚨 Critical issues and failure patterns

### 🔧 Raw Test Data (`/test-results`)
```bash
# JUnit XML for CI/CD integration
test-results/junit-results.xml     # 89KB+ detailed results

# JSON data for programmatic access
test-results/test-results.json     # 215KB+ comprehensive data

# Individual test artifacts
test-results/[test-name]/
├── trace.zip                      # Execution trace
├── screenshots/                   # Test-specific screenshots
└── videos/                        # Test-specific recordings
```

### 📈 Advanced Analytics (Allure)
```bash
# Generate comprehensive Allure report
npx allure generate allure-results --clean
npx allure open
```
**Features:**
- 📊 Test execution trends and statistics
- 🎯 Flaky test identification
- 📈 Performance metrics and benchmarks
- 🔍 Detailed test categorization and tagging
- 📋 Historical test execution data

### 🚀 Report Generation Commands
```bash
# Generate all report types
./scripts/generate-report.sh

# Generate specific report format
./scripts/generate-report.sh --format html
./scripts/generate-report.sh --format json
./scripts/generate-report.sh --format junit
./scripts/generate-report.sh --format allure

# Archive current reports
./scripts/generate-report.sh --archive

# Clean old reports
./scripts/clean.sh --reports
```

### 🎯 Understanding Report Contents

#### **Success Metrics**
- ✅ **Pass Rate**: Percentage of successful tests
- ⏱️ **Execution Time**: Total and average test duration
- 🌐 **Browser Coverage**: Results across different browsers
- 🔄 **Retry Statistics**: Flaky test identification

#### **Failure Analysis**
- ❌ **Error Categories**: Grouped by failure type
- 📸 **Visual Evidence**: Screenshots at failure points
- 🔍 **Root Cause**: Detailed stack traces and logs
- 🎯 **Affected Areas**: Impact analysis by test suite

#### **Performance Insights**
- 📊 **Response Times**: API performance metrics
- 🚀 **Load Testing**: Concurrent execution results
- 📈 **Trend Analysis**: Performance over time
- ⚡ **Bottleneck Identification**: Slow test detection

## 🧪 Writing Tests

### Web UI Tests

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login({
    username: 'user@example.com',
    password: 'password123'
  });
  
  await expect(page).toHaveURL('/dashboard');
});
```

### API Tests

```typescript
import { test, expect } from '@playwright/test';
import { DummyApi } from '../api/dummy-api';

test('should perform secure API testing', async ({ request }) => {
  const dummyApi = new DummyApi(request);
  
  // Login with metrics
  const loginResult = await dummyApi.loginWithMetrics();
  expect(loginResult.user.accessToken).toBeTruthy();
  
  // Performance testing
  const perfResult = await dummyApi.performanceTest(3);
  expect(perfResult.successRate).toBeGreaterThan(0.8);
  
  // Validate response formats
  const formatResult = await dummyApi.testResponseFormats();
  expect(formatResult.results.length).toBeGreaterThan(0);
});
```

### Mobile Tests

```typescript
import { test, devices } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

test.use({ ...devices['iPhone 13'] });

test('should login on mobile', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login(credentials);
  
  // Mobile-specific assertions
});
```

## 🏗️ Architecture

### Page Object Model

The framework uses the Page Object Model (POM) pattern:

- **BasePage**: Common functionality for all pages
- **Specific Pages**: Login, Dashboard, etc.
- **Element Interactions**: Click, fill, wait, assert methods
- **Page Verification**: URL and element validation

### API Testing Architecture

- **BaseApi**: Common API functionality
- **Specific APIs**: Users, Products, etc.
- **Request/Response Handling**: Typed requests and responses
- **Authentication**: Token-based authentication
- **Error Handling**: Comprehensive error handling

### Utility Classes

- **Logger**: Structured logging with Winston
- **ScreenshotHelper**: Screenshot capture and management
- **WaitHelpers**: Custom wait conditions and retries
- **DataHelpers**: Test data generation and management

## 🔧 Utilities

### Logger

```typescript
import { logger } from '../utils/logger';

logger.info('Test started');
logger.testStep('Performing login');
logger.error('Test failed', error);
```

### Screenshot Helper

```typescript
import { screenshotHelper } from '../utils/screenshot-helper';

await screenshotHelper.captureFullPage(page, 'login-page');
await screenshotHelper.captureElement(page, '.error-message', 'error');
```

### Data Helpers

```typescript
import { dataHelpers } from '../utils/data-helpers';

// Generate fake test data
const fakeEmail = dataHelpers.generateFakeData('email');
const fakeUser = dataHelpers.generateFakeData('user');
const credentials = dataHelpers.getUserCredentials('admin');
```

## 🏷️ Test Tags

Organize tests using tags:

- `@web` - Web UI tests
- `@api` - API tests
- `@mobile` - Mobile tests
- `@positive` - Positive test scenarios
- `@negative` - Negative test scenarios
- `@smoke` - Smoke tests
- `@regression` - Regression tests
- `@login` - Login-related tests
- `@admin` - Admin-specific tests

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Report') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright Report'
                ])
            }
        }
    }
}
```

## 🔍 Debugging

### Debug Mode

```bash
# Run tests in debug mode
npx playwright test --debug

# Debug specific test
npx playwright test tests/web/login.spec.ts --debug

# Debug with headed browser
npx playwright test --headed --debug
```

### VS Code Integration

1. Install Playwright extension
2. Set breakpoints in test files
3. Use "Debug Test" option

### Browser Developer Tools

```typescript
// Pause execution and open dev tools
await page.pause();

// Add console logs
await page.evaluate(() => console.log('Debug info'));
```

## 📈 Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Tag tests appropriately
- Keep tests independent

### Page Objects

- Use meaningful element selectors
- Implement wait conditions
- Add assertion methods
- Handle dynamic content

### API Testing

- Test both positive and negative scenarios
- Validate response schemas
- Handle authentication properly
- Test error conditions

### Data Management

- Use external test data files
- Generate dynamic test data
- Clean up test data after tests
- Avoid hardcoded values

## 🛡️ Security Considerations

- Store credentials securely in environment variables
- Use HTTPS for API endpoints
- Implement proper authentication
- Sanitize test data
- Avoid logging sensitive information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Follow code style guidelines
6. Submit a pull request

### Code Style

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)

## 🐛 Troubleshooting

### Common Issues

1. **Browser Installation Issues**
   ```bash
   npx playwright install --with-deps
   ```

2. **Permission Errors**
   ```bash
   sudo npx playwright install-deps
   ```

3. **Port Conflicts**
   - Check if ports are available
   - Update configuration if needed

4. **Environment Issues**
   - Verify environment variables
   - Check network connectivity
   - Validate test data

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review test logs in the `logs/` directory
- Check screenshot evidence in `screenshots/`
- Consult Playwright documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **QA Engineering Team** - Test framework development
- **DevOps Team** - CI/CD pipeline integration
- **Development Team** - Application integration

---

## 📋 Documentation

- **[CODING_STANDARDS.md](./CODING_STANDARDS.md)** - Comprehensive coding standards, test tagging conventions, and best practices
- **[CODEGEN_GUIDE.md](./CODEGEN_GUIDE.md)** - Custom Playwright codegen system for generating tests following framework standards
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference guide for common commands and operations

**Happy Testing! 🎉**

node --experimental-loader=ts-node/esm ./scripts/generate-test.ts ./data/test-data.json