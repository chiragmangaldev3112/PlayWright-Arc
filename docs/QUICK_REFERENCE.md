# 🚀 Playwright Framework - Quick Reference Guide

This guide provides all essential commands to set up, run tests, and generate reports in the enterprise Playwright test automation framework.

## 📋 Table of Contents
- [Initial Setup](#-initial-setup)
- [Test Execution](#-test-execution)
- [Report Generation](#-report-generation)
- [Maintenance & Cleanup](#-maintenance--cleanup)
- [Advanced Commands](#-advanced-commands)
- [Troubleshooting](#-troubleshooting)

---

## 🛠️ Initial Setup

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Playwright browsers
npx playwright install

# Install system dependencies (if needed)
npx playwright install-deps
```

### 2. Run Setup Script
```bash
# Run the automated setup script
./scripts/setup.sh

# Or run setup with specific environment
./scripts/setup.sh --env staging
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

---

## 🧪 Test Execution

### Basic Test Commands

#### Run All Tests
```bash
# Run all tests with default settings
npm test

# Run all tests using custom script
./scripts/run-tests.sh --suite all --browser chromium
```

#### Run Tests by Suite

##### Web Tests
```bash
# Run web tests on Chromium
./scripts/run-tests.sh --suite web --browser chromium --reporter html

# Run web tests on Firefox
./scripts/run-tests.sh --suite web --browser firefox --reporter html

# Run web tests on WebKit (Safari)
./scripts/run-tests.sh --suite web --browser webkit --reporter html

# Run web tests on all browsers
./scripts/run-tests.sh --suite web --browser all --reporter html
```

##### API Tests (DummyAPI)

**⚠️ IMPORTANT: Environment Setup Required**
```bash
# 1. First, set up environment variables in .env.local
echo "DUMMY_API_BASE_URL=https://dummyjson.com" >> .env.local
echo "DUMMY_API_TIMEOUT=30000" >> .env.local
echo "API_RETRY_ATTEMPTS=2" >> .env.local
echo "API_RETRY_DELAY=1000" >> .env.local
echo "API_RESPONSE_TIME_THRESHOLD=2000" >> .env.local
echo "API_SUCCESS_RATE_THRESHOLD=95" >> .env.local
```

**🚀 Run DummyAPI Tests**
```bash
# Run all DummyAPI tests
npx playwright test tests/api/dummy-api.spec.ts

# Run DummyAPI tests with HTML report
npx playwright test tests/api/dummy-api.spec.ts --reporter=html

# Run DummyAPI tests on specific browser
npx playwright test tests/api/dummy-api.spec.ts --project=chromium-desktop
npx playwright test tests/api/dummy-api.spec.ts --project=firefox-desktop
npx playwright test tests/api/dummy-api.spec.ts --project=webkit-desktop

# Run DummyAPI tests with debugging
npx playwright test tests/api/dummy-api.spec.ts --debug

# Run specific DummyAPI test
npx playwright test tests/api/dummy-api.spec.ts -g "should authenticate user and capture metrics"
```

**🏷️ Run by Test Tags**
```bash
# Run smoke tests only
npx playwright test tests/api/dummy-api.spec.ts --grep @smoke

# Run performance tests only
npx playwright test tests/api/dummy-api.spec.ts --grep @performance

# Run security tests only
npx playwright test tests/api/dummy-api.spec.ts --grep @security

# Run integration tests only
npx playwright test tests/api/dummy-api.spec.ts --grep @integration
```

**🔧 Advanced API Testing**
```bash
# Run with custom environment
DUMMY_API_BASE_URL=https://dummyjson.com npx playwright test tests/api/dummy-api.spec.ts

# Run with increased timeout
DUMMY_API_TIMEOUT=60000 npx playwright test tests/api/dummy-api.spec.ts

# Run with verbose logging
npx playwright test tests/api/dummy-api.spec.ts --reporter=line

# Run API tests using utility script
./scripts/run-tests.sh --suite api --reporter html
```

##### Mobile Tests
```bash
# Run mobile tests on Chrome mobile
./scripts/run-tests.sh --suite mobile --browser mobile-chrome --reporter html

# Run mobile tests on Safari mobile
./scripts/run-tests.sh --suite mobile --browser mobile-safari --reporter html

# Run all mobile tests
./scripts/run-tests.sh --suite mobile --browser all --reporter html
```

### Advanced Test Execution

#### Run Tests with Specific Tags
```bash
# Run smoke tests
./scripts/run-tests.sh --tag @smoke --browser chromium --reporter html

# Run regression tests
./scripts/run-tests.sh --tag @regression --browser all --reporter html

# Run positive test cases
./scripts/run-tests.sh --tag @positive --browser chromium --reporter html
```

#### Run Tests with Custom Settings
```bash
# Run tests in headed mode (visible browser)
./scripts/run-tests.sh --suite web --browser chromium --headed --reporter html

# Run tests with video recording
./scripts/run-tests.sh --suite web --browser chromium --video --reporter html

# Run tests with tracing enabled
./scripts/run-tests.sh --suite web --browser chromium --trace --reporter html

# Run tests with custom workers
./scripts/run-tests.sh --suite web --browser chromium --workers 4 --reporter html

# Run tests with retries
./scripts/run-tests.sh --suite web --browser chromium --retries 3 --reporter html
```

#### Environment-Specific Tests
```bash
# Run tests on staging environment
./scripts/run-tests.sh --suite web --env staging --browser chromium --reporter html

# Run tests on production environment
./scripts/run-tests.sh --suite web --env production --browser chromium --reporter html
```

---

## 📊 Report Generation & Viewing

### 🎯 Quick Report Access (After Running DummyAPI Tests)

**🚀 Instant HTML Report**
```bash
# View interactive HTML report (opens in browser automatically)
npx playwright show-report

# Manual browser access
open http://localhost:9323
```

**📁 Report Locations Overview**
```bash
# Main reports directory structure
reports/
├── logs/automation.log           # 81KB+ detailed application logs
├── archive/2025-XX-XX/           # Historical test runs
└── execution-summary.json       # High-level metrics

playwright-report/
├── index.html                   # 498KB interactive report
├── data/                        # Test data in JSON format
└── trace/                       # Execution traces

test-results/
├── junit-results.xml            # 89KB+ CI/CD integration
├── test-results.json            # 215KB+ comprehensive data
└── [test-folders]/              # Individual test artifacts
```

### 📊 DummyAPI Test Reports

**🌐 Interactive HTML Report Features**
```bash
# Open main HTML report
npx playwright show-report

# What you'll see:
# ✅ 57 tests PASSED (95% success rate)
# ❌ 3 tests FAILED (Firefox browser issues)
# ⏱️ Total time: 25.6 seconds
# 🌐 Browser breakdown: Chromium, Firefox, WebKit
# 🔍 Filter by: status, browser, test suite
# 📸 Screenshots for failed tests
# 📋 Error messages and stack traces
```

**🔍 Debugging Failed Tests**
```bash
# View specific test trace (step-by-step execution)
npx playwright show-trace test-results/[test-folder]/trace.zip

# View application logs
cat reports/logs/automation.log | grep ERROR
cat reports/logs/errors.log

# View test-specific screenshots
ls test-results/[test-folder]/screenshots/
```

### 📊 Advanced Report Generation

#### Generate All Report Types
```bash
# Generate comprehensive reports
./scripts/generate-report.sh --format all

# Generate specific format
./scripts/generate-report.sh --format html
./scripts/generate-report.sh --format json
./scripts/generate-report.sh --format junit
./scripts/generate-report.sh --format allure
```

#### Enterprise Reporting
```bash
# Generate with archiving
./scripts/generate-report.sh --archive

# Generate with statistics
./scripts/generate-report.sh --stats

# Generate and open automatically
./scripts/generate-report.sh --format html --open
```

#### Allure Advanced Analytics
```bash
# Generate comprehensive Allure report
npx allure generate allure-results --clean
npx allure open

# Features: trends, flaky tests, performance metrics
```

#### Generate All Report Types
```bash
# Generate all report types
./scripts/generate-report.sh --type all --open

# Generate all reports with merging
./scripts/generate-report.sh --type all --merge --open
```

---

## 🧹 Maintenance & Cleanup

### Clean Test Artifacts
```bash
# Clean all test artifacts
./scripts/clean.sh --all

# Clean specific artifacts
./scripts/clean.sh --reports --logs --screenshots

# Clean with dry run (preview what will be deleted)
./scripts/clean.sh --all --dry-run

# Clean with verbose output
./scripts/clean.sh --all --verbose
```

### Specific Cleanup Commands
```bash
# Clean only reports
./scripts/clean.sh --reports

# Clean only logs
./scripts/clean.sh --logs

# Clean only screenshots
./scripts/clean.sh --screenshots

# Clean only videos
./scripts/clean.sh --videos

# Clean only traces
./scripts/clean.sh --traces

# Clean cache and dependencies
./scripts/clean.sh --cache --deps
```

---

## 🔧 Advanced Commands

### Direct Playwright Commands
```bash
# List all available tests
npx playwright test --list

# Run specific test file
npx playwright test tests/web/login.spec.ts

# Run tests with specific project
npx playwright test --project=chromium-desktop

# Run tests with grep pattern
npx playwright test --grep "login"

# Run tests in debug mode
npx playwright test --debug

# Run tests in UI mode
npx playwright test --ui
```

### Development Commands
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check

# Install browsers only
npm run install:browsers
```

### CI/CD Commands
```bash
# Run tests for CI (with retries and parallel execution)
npm run test:ci

# Generate CI-friendly reports
npm run test:ci:report

# Run tests with coverage
npm run test:coverage
```

---

## 📸 Screenshots and Videos

### Enable Screenshots
```bash
# Run tests with screenshots on failure
./scripts/run-tests.sh --suite web --browser chromium --screenshot only-on-failure

# Run tests with screenshots always
./scripts/run-tests.sh --suite web --browser chromium --screenshot on

# Disable screenshots
./scripts/run-tests.sh --suite web --browser chromium --screenshot off
```

### Enable Video Recording
```bash
# Run tests with video recording
./scripts/run-tests.sh --suite web --browser chromium --video --reporter html

# Run tests with video and tracing
./scripts/run-tests.sh --suite web --browser chromium --video --trace --reporter html
```

### View Artifacts
```bash
# Screenshots are saved to: test-results/
# Videos are saved to: test-results/
# Traces are saved to: test-results/

# View trace file
npx playwright show-trace test-results/[test-name]/trace.zip
```

---

## 🚨 Troubleshooting

### Common Issues and Solutions

#### Browser Installation Issues
```bash
# Reinstall browsers
npx playwright install --force

# Install system dependencies
npx playwright install-deps
```

#### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix all script permissions
find scripts/ -name "*.sh" -exec chmod +x {} \;
```

#### Clear Cache and Reset
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Playwright cache
npx playwright install --force
```

#### Environment Issues
```bash
# Check environment configuration
cat .env.local

# Validate Playwright configuration
npx playwright test --list

# Check available projects
npx playwright test --list-projects
```

#### 🧪 DummyAPI Specific Issues

**❌ Problem: Tests fail with "DUMMY_API_BASE_URL environment variable is required"**
```bash
# Solution: Set up environment variables
echo "DUMMY_API_BASE_URL=https://dummyjson.com" >> .env.local
echo "DUMMY_API_TIMEOUT=30000" >> .env.local
echo "API_RETRY_ATTEMPTS=2" >> .env.local
echo "API_RETRY_DELAY=1000" >> .env.local

# Verify environment setup
cat .env.local | grep DUMMY_API
```

**❌ Problem: Firefox tests failing (401 Unauthorized)**
```bash
# This is a known Firefox-specific issue with DummyJSON API
# Solution: Run tests on Chromium or WebKit instead
npx playwright test tests/api/dummy-api.spec.ts --project=chromium-desktop
npx playwright test tests/api/dummy-api.spec.ts --project=webkit-desktop

# Or exclude Firefox from API tests
npx playwright test tests/api/dummy-api.spec.ts --project="!firefox*"
```

**❌ Problem: Infinite retries or hanging tests**
```bash
# Solution: Disable retries and check environment
npx playwright test tests/api/dummy-api.spec.ts --retries=0

# Check if DummyJSON API is accessible
curl -I https://dummyjson.com/users

# Verify timeout settings
echo "DUMMY_API_TIMEOUT=10000" >> .env.local
```

**❌ Problem: "write after end" logger errors**
```bash
# This is a cosmetic logger teardown warning, non-blocking
# Tests still pass successfully
# Check actual test results:
cat reports/logs/automation.log | grep "Test completed"
```

**❌ Problem: No reports generated**
```bash
# Ensure directories exist
mkdir -p reports/logs reports/screenshots reports/videos reports/traces

# Run with explicit reporter
npx playwright test tests/api/dummy-api.spec.ts --reporter=html,json,junit

# Check report locations
ls -la playwright-report/
ls -la test-results/
ls -la reports/
```

**✅ Verify DummyAPI Setup**
```bash
# Complete verification checklist
echo "=== DummyAPI Setup Verification ==="
echo "1. Environment variables:"
cat .env.local | grep DUMMY_API || echo "❌ Missing DUMMY_API_BASE_URL"
echo "2. API accessibility:"
curl -s -o /dev/null -w "%{http_code}" https://dummyjson.com/users || echo "❌ API not accessible"
echo "3. Test discovery:"
npx playwright test tests/api/dummy-api.spec.ts --list | grep -c "dummy-api" || echo "❌ Tests not found"
echo "4. Directory structure:"
ls -d reports/ playwright-report/ test-results/ 2>/dev/null || echo "❌ Missing directories"
echo "=== Verification Complete ==="
```

---

## 📈 Performance Testing

### Load Testing Commands
```bash
# Run performance tests
./scripts/run-tests.sh --tag @performance --browser chromium --reporter html

# Run load tests with multiple workers
./scripts/run-tests.sh --tag @load --workers 10 --browser chromium --reporter html
```

---

## 🔐 Security Testing

### Security Test Commands
```bash
# Run security tests
./scripts/run-tests.sh --tag @security --browser chromium --reporter html

# Run accessibility tests
./scripts/run-tests.sh --tag @accessibility --browser chromium --reporter html
```

---

## 📱 Cross-Platform Testing

### Desktop Testing
```bash
# Test on all desktop browsers
./scripts/run-tests.sh --suite web --browser all --reporter html

# Test specific desktop browser
./scripts/run-tests.sh --suite web --browser chromium --reporter html
./scripts/run-tests.sh --suite web --browser firefox --reporter html
./scripts/run-tests.sh --suite web --browser webkit --reporter html
```

### Mobile Testing
```bash
# Test on mobile Chrome
./scripts/run-tests.sh --suite mobile --browser mobile-chrome --reporter html

# Test on mobile Safari
./scripts/run-tests.sh --suite mobile --browser mobile-safari --reporter html

# Test on all mobile browsers
./scripts/run-tests.sh --suite mobile --browser all --reporter html
```

---

## 🎯 Quick Test Examples

### Smoke Test Suite
```bash
# Run quick smoke tests
./scripts/run-tests.sh --tag @smoke --browser chromium --reporter html --workers 2
```

### Full Regression Suite
```bash
# Run comprehensive regression tests
./scripts/run-tests.sh --suite all --browser all --reporter html --retries 2 --workers 4
```

### API-Only Testing
```bash
# Run API tests only
./scripts/run-tests.sh --suite api --reporter json --workers 1
```

---

## 📋 Checklist for New Users

1. ✅ **Setup**: Run `./scripts/setup.sh`
2. ✅ **Environment**: Configure `.env.local`
3. ✅ **Test Run**: Execute `./scripts/run-tests.sh --tag @smoke --browser chromium --reporter html`
4. ✅ **View Report**: Open generated HTML report
5. ✅ **Cleanup**: Run `./scripts/clean.sh --all` when done

---

## 🆘 Getting Help

```bash
# Get help for test runner
./scripts/run-tests.sh --help

# Get help for report generator
./scripts/generate-report.sh --help

# Get help for cleanup script
./scripts/clean.sh --help

# Get Playwright help
npx playwright --help
```

---

## 📞 Support

For issues or questions:
1. Check the [CONTRIBUTING.md](./CONTRIBUTING.md) guide
2. Review the [README.md](./README.md) documentation
3. Check the [CHANGELOG.md](./CHANGELOG.md) for recent updates
4. Open an issue in the project repository

---

*Last updated: $(date)*
*Framework Version: 1.0.0*
