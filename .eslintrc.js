/**
 * ESLint Configuration for Enterprise Playwright TypeScript Framework
 * 
 * This configuration ensures code quality, consistency, and best practices
 * across the entire automation framework.
 */

module.exports = {
  root: true,
  
  // Environment configuration
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  
  // Parser configuration for TypeScript
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  
  // Plugin configuration
  plugins: [
    '@typescript-eslint',
    'playwright',
    'prettier',
  ],
  
  // Extended configurations
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:playwright/recommended',
    'prettier', // Must be last to override other configs
  ],
  
  // Custom rules for enterprise-grade code quality
  rules: {
    // TypeScript-specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    
    // General JavaScript/TypeScript rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    
    // Playwright-specific rules
    'playwright/missing-playwright-await': 'error',
    'playwright/no-conditional-in-test': 'error',
    'playwright/no-element-handle': 'error',
    'playwright/no-eval': 'error',
    'playwright/no-page-pause': 'error',
    'playwright/no-restricted-matchers': 'error',
    'playwright/no-skipped-test': 'warn',
    'playwright/no-useless-await': 'error',
    'playwright/prefer-web-first-assertions': 'error',
    'playwright/valid-expect': 'error',
    
    // Code style and formatting (handled by Prettier)
    'prettier/prettier': 'error',
    
    // Import/Export rules
    'sort-imports': ['error', {
      ignoreCase: false,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
    }],
  },
  
  // Override rules for specific file patterns
  overrides: [
    {
      // Test files can have more relaxed rules
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        'playwright/expect-expect': 'off', // Allow tests without explicit expects
      },
    },
    {
      // Configuration files
      files: ['*.config.ts', '*.config.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
      },
    },
    {
      // Utility files may need more flexibility
      files: ['utils/**/*.ts'],
      rules: {
        'no-console': 'off', // Allow console in utility files for logging
      },
    },
  ],
  
  // Ignore patterns
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'playwright-report/',
    'test-results/',
    'allure-results/',
    '*.js', // Ignore compiled JavaScript files
  ],
};
