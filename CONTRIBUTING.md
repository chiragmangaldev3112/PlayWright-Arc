# Contributing to Playwright Enterprise Framework

Thank you for your interest in contributing to our enterprise-grade Playwright test automation framework! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to help us maintain a welcoming and inclusive community.

## 🚀 Getting Started

### Prerequisites

Before you begin contributing, ensure you have:

- Node.js 18 or higher
- npm 9 or higher
- Git
- A code editor (VS Code recommended)
- Basic knowledge of TypeScript and Playwright

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/your-username/playwright-enterprise-framework.git
   cd playwright-enterprise-framework
   ```

2. **Set up the development environment**
   ```bash
   # Run the setup script
   ./scripts/setup.sh local
   
   # Or manually:
   npm install
   npx playwright install --with-deps
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Verify setup**
   ```bash
   npm test -- --grep "@smoke"
   ```

## 🛠️ Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes** - Fix issues in existing code
- **New features** - Add new functionality
- **Documentation** - Improve or add documentation
- **Tests** - Add or improve test coverage
- **Performance** - Optimize existing code
- **Refactoring** - Improve code structure without changing functionality

### Before You Start

1. **Check existing issues** - Look for existing issues or discussions
2. **Create an issue** - For new features or significant changes
3. **Discuss your approach** - Comment on the issue with your proposed solution
4. **Get approval** - Wait for maintainer approval before starting work

## 📝 Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Provide explicit type annotations for public APIs
- Use interfaces for object shapes
- Prefer `const` over `let` when possible
- Use meaningful variable and function names

```typescript
// ✅ Good
interface UserCredentials {
  username: string;
  password: string;
  role: 'admin' | 'user' | 'manager';
}

const loginUser = async (credentials: UserCredentials): Promise<void> => {
  // Implementation
};

// ❌ Bad
const login = async (creds: any) => {
  // Implementation
};
```

### Page Object Model Guidelines

- Extend from `BasePage` for all page objects
- Use descriptive locator names
- Implement proper wait conditions
- Add comprehensive JSDoc comments

```typescript
// ✅ Good
export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.locator('[data-testid="username"]');
  private readonly passwordInput = this.page.locator('[data-testid="password"]');
  private readonly loginButton = this.page.locator('[data-testid="login-button"]');

  /**
   * Performs login with provided credentials
   * @param credentials - User login credentials
   */
  async login(credentials: UserCredentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
    await this.waitForLoginComplete();
  }
}
```

### Test Writing Guidelines

- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Use appropriate test tags
- Include proper error handling

```typescript
// ✅ Good
test('should successfully login with valid admin credentials @web @positive @login', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);
  const credentials = dataHelpers.getUserCredentials('admin');
  
  // Act
  await loginPage.goto();
  await loginPage.login(credentials);
  
  // Assert
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

### File Organization

```
src/
├── pages/           # Page Object Models
├── api/            # API clients and helpers
├── tests/          # Test files
│   ├── web/        # Web UI tests
│   ├── api/        # API tests
│   └── mobile/     # Mobile tests
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── config/         # Configuration files
```

### Naming Conventions

- **Files**: Use kebab-case (`login-page.ts`, `user-api.ts`)
- **Classes**: Use PascalCase (`LoginPage`, `UserApi`)
- **Functions/Variables**: Use camelCase (`getUserCredentials`, `loginButton`)
- **Constants**: Use UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`, `API_BASE_URL`)
- **Test files**: Use `.spec.ts` suffix (`login.spec.ts`)

## 🧪 Testing Guidelines

### Test Categories

Use appropriate tags for test categorization:

- `@web` - Web UI tests
- `@api` - API tests
- `@mobile` - Mobile tests
- `@positive` - Positive test scenarios
- `@negative` - Negative test scenarios
- `@smoke` - Smoke tests
- `@regression` - Regression tests

### Test Data Management

- Store test data in `test-data/` directory
- Use JSON files for structured data
- Generate dynamic data using `dataHelpers`
- Never hardcode sensitive information

### Error Handling

```typescript
test('should handle network errors gracefully @negative @api', async ({ request }) => {
  const api = new UserApi(request);
  
  // Simulate network error
  await expect(async () => {
    await api.getUser('invalid-id');
  }).rejects.toThrow('Network error');
});
```

## 🔄 Pull Request Process

### Before Submitting

1. **Run all checks**
   ```bash
   npm run lint
   npm run format:check
   npm test
   ```

2. **Update documentation** if needed

3. **Add tests** for new functionality

4. **Update CHANGELOG.md** with your changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Added new tests
- [ ] Updated existing tests
- [ ] All tests pass locally

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by at least one maintainer
3. **Manual testing** if applicable
4. **Documentation review** for user-facing changes

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template and include:

- **Environment details** (OS, Node.js version, browser)
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots/logs** if applicable
- **Minimal reproduction case**

### Feature Requests

Use the feature request template and include:

- **Use case description**
- **Proposed solution**
- **Alternative solutions considered**
- **Additional context**

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high/medium/low` - Issue priority

## 📚 Documentation

### Types of Documentation

1. **Code Documentation** - JSDoc comments for functions and classes
2. **API Documentation** - Document public APIs and interfaces
3. **User Documentation** - README, setup guides, tutorials
4. **Architecture Documentation** - Design decisions and patterns

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up-to-date with code changes
- Use proper markdown formatting

### JSDoc Examples

```typescript
/**
 * Represents a user login page with authentication functionality
 * @example
 * ```typescript
 * const loginPage = new LoginPage(page);
 * await loginPage.login({ username: 'user@example.com', password: 'password' });
 * ```
 */
export class LoginPage extends BasePage {
  /**
   * Performs user login with provided credentials
   * @param credentials - The user login credentials
   * @param options - Additional login options
   * @returns Promise that resolves when login is complete
   * @throws {Error} When login fails due to invalid credentials
   */
  async login(credentials: UserCredentials, options?: LoginOptions): Promise<void> {
    // Implementation
  }
}
```

## 🏆 Recognition

Contributors will be recognized in:

- **CONTRIBUTORS.md** file
- **Release notes** for significant contributions
- **GitHub contributors** section

## 📞 Getting Help

If you need help:

1. **Check documentation** - README and wiki
2. **Search issues** - Existing questions and answers
3. **Ask in discussions** - GitHub Discussions
4. **Contact maintainers** - For urgent matters

## 🔄 Development Workflow

### Typical Workflow

1. **Pick an issue** or create one
2. **Fork and clone** the repository
3. **Create feature branch** from `develop`
4. **Make changes** following guidelines
5. **Add tests** and documentation
6. **Run checks** locally
7. **Submit pull request**
8. **Address feedback**
9. **Merge** after approval

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical production fixes

### Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(auth): add social login support
fix(api): handle timeout errors properly
docs(readme): update installation instructions
test(login): add negative test cases
```

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to the Playwright Enterprise Framework! Your efforts help make this project better for everyone. 🚀
