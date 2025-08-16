/**
 * Enterprise Automation Framework - Type Definitions
 * 
 * This file contains all custom TypeScript types, interfaces, and enums
 * used throughout the automation framework for type safety and consistency.
 */

// =============================================================================
// ENVIRONMENT & CONFIGURATION TYPES
// =============================================================================

/**
 * Supported test environments
 */
export enum Environment {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  QA = 'qa',
}

/**
 * Test execution modes
 */
export enum TestMode {
  HEADLESS = 'headless',
  HEADED = 'headed',
  DEBUG = 'debug',
}

/**
 * Browser types supported by the framework
 */
export enum BrowserType {
  CHROMIUM = 'chromium',
  FIREFOX = 'firefox',
  WEBKIT = 'webkit',
  CHROME = 'chrome',
  EDGE = 'msedge',
}

/**
 * Device categories for mobile testing
 */
export enum DeviceCategory {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  name: Environment;
  baseUrl: string;
  apiBaseUrl: string;
  timeout: number;
  retries: number;
  workers: number;
  headless: boolean;
}

// =============================================================================
// USER & AUTHENTICATION TYPES
// =============================================================================

/**
 * User roles for role-based testing
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
  MODERATOR = 'moderator',
  VIEWER = 'viewer',
}

/**
 * User credentials interface
 */
export interface UserCredentials {
  username: string;
  password: string;
  email?: string;
  role: UserRole;
}

/**
 * Authentication token interface
 */
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  scope?: string[];
}

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// =============================================================================
// API TESTING TYPES
// =============================================================================

/**
 * HTTP methods supported by API tests
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

/**
 * HTTP status code categories
 */
export enum HttpStatusCategory {
  SUCCESS = '2xx',
  REDIRECT = '3xx',
  CLIENT_ERROR = '4xx',
  SERVER_ERROR = '5xx',
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string | number>;
  timeout?: number;
}

/**
 * API response interface
 */
export interface ApiResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  url: string;
  ok: boolean;
}

/**
 * API error response interface
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
}

// =============================================================================
// TEST DATA TYPES
// =============================================================================

/**
 * Test data sources
 */
export enum TestDataSource {
  JSON = 'json',
  CSV = 'csv',
  DATABASE = 'database',
  API = 'api',
  FAKER = 'faker',
}

/**
 * Test data interface
 */
export interface TestData {
  id: string;
  scenario: string;
  data: Record<string, unknown>;
  tags?: string[];
  priority?: TestPriority;
}

/**
 * Test priority levels
 */
export enum TestPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// =============================================================================
// PAGE OBJECT MODEL TYPES
// =============================================================================

/**
 * Base page interface for Page Object Model
 */
export interface BasePage {
  url: string;
  title: string;
  isLoaded(): Promise<boolean>;
  navigate(): Promise<void>;
  waitForLoad(): Promise<void>;
}

/**
 * Element locator strategies
 */
export enum LocatorStrategy {
  ID = 'id',
  CLASS = 'class',
  CSS = 'css',
  XPATH = 'xpath',
  TEXT = 'text',
  PLACEHOLDER = 'placeholder',
  ROLE = 'role',
  TEST_ID = 'testId',
}

/**
 * Element locator interface
 */
export interface ElementLocator {
  strategy: LocatorStrategy;
  value: string;
  description?: string;
}

// =============================================================================
// REPORTING & LOGGING TYPES
// =============================================================================

/**
 * Log levels for the logging system
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

/**
 * Test result status
 */
export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  PENDING = 'pending',
  FLAKY = 'flaky',
}

/**
 * Test execution result interface
 */
export interface TestResult {
  testId: string;
  title: string;
  status: TestStatus;
  duration: number;
  error?: string;
  screenshots?: string[];
  videos?: string[];
  traces?: string[];
  tags?: string[];
  retryCount: number;
}

/**
 * Test suite result interface
 */
export interface TestSuiteResult {
  suiteName: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  results: TestResult[];
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Screenshot configuration
 */
export interface ScreenshotConfig {
  fullPage: boolean;
  quality?: number;
  type?: 'png' | 'jpeg';
  path?: string;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Wait conditions for element interactions
 */
export enum WaitCondition {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  ATTACHED = 'attached',
  DETACHED = 'detached',
  STABLE = 'stable',
}

/**
 * File upload configuration
 */
export interface FileUploadConfig {
  filePath: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

// =============================================================================
// CUSTOM PLAYWRIGHT FIXTURES
// =============================================================================

/**
 * Custom test fixtures interface
 */
export interface CustomTestFixtures {
  authenticatedUser: UserCredentials;
  apiClient: ApiClient;
  testData: TestData;
  logger: Logger;
  screenshotHelper: ScreenshotHelper;
}

/**
 * Custom worker fixtures interface
 */
export interface CustomWorkerFixtures {
  environment: Environment;
  browserConfig: BrowserConfig;
}

/**
 * Browser configuration interface
 */
export interface BrowserConfig {
  type: BrowserType;
  headless: boolean;
  viewport: {
    width: number;
    height: number;
  };
  deviceScaleFactor?: number;
  userAgent?: string;
}

// =============================================================================
// HELPER INTERFACES
// =============================================================================

/**
 * API client interface
 */
export interface ApiClient {
  get<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
}

/**
 * Logger interface
 */
export interface Logger {
  error(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  debug(message: string, meta?: unknown): void;
  verbose(message: string, meta?: unknown): void;
}

/**
 * Screenshot helper interface
 */
export interface ScreenshotHelper {
  captureFullPage(name: string): Promise<string>;
  captureElement(selector: string, name: string): Promise<string>;
  captureOnFailure(): Promise<string>;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is an API error response
 */
export function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ApiErrorResponse).error === 'object'
  );
}

/**
 * Type guard to check if a value is a valid user role
 */
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * Type guard to check if a value is a valid environment
 */
export function isValidEnvironment(env: string): env is Environment {
  return Object.values(Environment).includes(env as Environment);
}
