/**
 * Configuration Loader for Enterprise Automation Framework
 * 
 * This module handles loading and validating environment-specific configurations
 * with secure credential management and type safety.
 */

import dotenv from 'dotenv';
import path from 'path';
import type { EnvironmentConfig, UserCredentials } from '@types';
import { Environment, UserRole, isValidEnvironment } from '@types';

/**
 * Configuration Loader Class
 * Handles loading environment-specific configurations with validation
 */
export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: EnvironmentConfig | null = null;
  private environment: Environment;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.environment = this.determineEnvironment();
    this.loadEnvironmentConfig();
  }

  /**
   * Get singleton instance of ConfigLoader
   */
  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Determine the current environment from NODE_ENV or default to 'local'
   */
  private determineEnvironment(): Environment {
    const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'local';
    
    if (!isValidEnvironment(nodeEnv)) {
      console.warn(`Invalid environment '${nodeEnv}', defaulting to 'local'`);
      return Environment.LOCAL;
    }
    
    return nodeEnv as Environment;
  }

  /**
   * Load environment-specific configuration file
   */
  private loadEnvironmentConfig(): void {
    try {
      // Load base .env file first
      const baseEnvPath = path.resolve(process.cwd(), '.env');
      dotenv.config({ path: baseEnvPath });

      // Load environment-specific .env file
      const envFilePath = path.resolve(process.cwd(), `config/.env.${this.environment}`);
      const result = dotenv.config({ path: envFilePath });

      if (result.error && this.environment !== Environment.LOCAL) {
        console.warn(`Warning: Could not load ${envFilePath}. Using default configuration.`);
      }

      this.validateConfiguration();
    } catch (error) {
      console.error('Error loading environment configuration:', error);
      throw new Error(`Failed to load configuration for environment: ${this.environment}`);
    }
  }

  /**
   * Validate that required configuration values are present
   */
  private validateConfiguration(): void {
    const requiredEnvVars = [
      'BASE_URL',
      'API_BASE_URL',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Please ensure your .env.${this.environment} file contains these variables.`
      );
    }
  }

  /**
   * Get the current environment
   */
  public getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Get the complete environment configuration
   */
  public getConfig(): EnvironmentConfig {
    if (!this.config) {
      this.config = {
        name: this.environment,
        baseUrl: this.getRequiredEnvVar('BASE_URL'),
        apiBaseUrl: this.getRequiredEnvVar('API_BASE_URL'),
        timeout: this.getNumberEnvVar('BROWSER_TIMEOUT', 30000),
        retries: this.getNumberEnvVar('RETRIES', 1),
        workers: this.getNumberEnvVar('MAX_WORKERS', 4),
        headless: this.getBooleanEnvVar('HEADLESS', true),
      };
    }
    return this.config;
  }

  /**
   * Get base URL for web application testing
   */
  public getBaseUrl(): string {
    return this.getRequiredEnvVar('BASE_URL');
  }

  /**
   * Get API base URL for API testing
   */
  public getApiBaseUrl(): string {
    return this.getRequiredEnvVar('API_BASE_URL');
  }

  /**
   * Get API authentication token
   */
  public getApiToken(): string {
    return this.getEnvVar('API_TOKEN', '');
  }

  /**
   * Get user credentials for a specific role
   */
  public getUserCredentials(role: UserRole): UserCredentials {
    const roleUpper = role.toUpperCase();
    const username = this.getEnvVar(`${roleUpper}_USERNAME`, '');
    const password = this.getEnvVar(`${roleUpper}_PASSWORD`, '');
    const email = this.getEnvVar(`${roleUpper}_EMAIL`, username);

    if (!username || !password) {
      throw new Error(
        `Missing credentials for role '${role}'. ` +
        `Please set ${roleUpper}_USERNAME and ${roleUpper}_PASSWORD in your environment file.`
      );
    }

    return {
      username,
      password,
      email,
      role,
    };
  }

  /**
   * Get all available user credentials
   */
  public getAllUserCredentials(): Record<UserRole, UserCredentials> {
    const credentials: Partial<Record<UserRole, UserCredentials>> = {};

    for (const role of Object.values(UserRole)) {
      try {
        credentials[role] = this.getUserCredentials(role);
      } catch (error) {
        console.warn(`Could not load credentials for role '${role}':`, error);
      }
    }

    return credentials as Record<UserRole, UserCredentials>;
  }

  /**
   * Check if running in CI environment
   */
  public isCI(): boolean {
    return this.getBooleanEnvVar('CI', false);
  }

  /**
   * Check if debug mode is enabled
   */
  public isDebugMode(): boolean {
    return this.getBooleanEnvVar('DEBUG_MODE', false);
  }

  /**
   * Check if verbose logging is enabled
   */
  public isVerboseLogging(): boolean {
    return this.getBooleanEnvVar('VERBOSE_LOGGING', false);
  }

  /**
   * Get screenshot configuration
   */
  public getScreenshotConfig(): {
    onFailure: boolean;
    fullPage: boolean;
  } {
    return {
      onFailure: this.getBooleanEnvVar('SCREENSHOT_ON_FAILURE', true),
      fullPage: this.getBooleanEnvVar('FULL_PAGE_SCREENSHOTS', true),
    };
  }

  /**
   * Get performance testing thresholds
   */
  public getPerformanceThresholds(): {
    maxLoadTime: number;
    maxFirstContentfulPaint: number;
    maxLargestContentfulPaint: number;
  } {
    return {
      maxLoadTime: this.getNumberEnvVar('MAX_LOAD_TIME', 5000),
      maxFirstContentfulPaint: this.getNumberEnvVar('MAX_FIRST_CONTENTFUL_PAINT', 2000),
      maxLargestContentfulPaint: this.getNumberEnvVar('MAX_LARGEST_CONTENTFUL_PAINT', 4000),
    };
  }

  /**
   * Get test data configuration
   */
  public getTestDataConfig(): {
    source: string;
    path: string;
    generateRandom: boolean;
  } {
    return {
      source: this.getEnvVar('TEST_DATA_SOURCE', 'json'),
      path: this.getEnvVar('TEST_DATA_PATH', './data/test-data.json'),
      generateRandom: this.getBooleanEnvVar('GENERATE_RANDOM_DATA', false),
    };
  }

  /**
   * Get database configuration (if needed for test data)
   */
  public getDatabaseConfig(): {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  } {
    return {
      host: this.getEnvVar('TEST_DB_HOST', 'localhost'),
      port: this.getNumberEnvVar('TEST_DB_PORT', 5432),
      name: this.getEnvVar('TEST_DB_NAME', 'test_db'),
      user: this.getEnvVar('TEST_DB_USER', 'test_user'),
      password: this.getEnvVar('TEST_DB_PASSWORD', ''),
    };
  }

  /**
   * Get DummyJSON API configuration for secure testing
   * @throws {Error} If DUMMY_API_BASE_URL environment variable is not set
   */
  public getDummyApiConfig(): {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    responseTimeThreshold: number;
    successRateThreshold: number;
  } {
    const baseUrl = process.env['DUMMY_API_BASE_URL'];
    if (!baseUrl) {
      throw new Error(
        'DUMMY_API_BASE_URL environment variable is required for secure API testing. ' +
        'Please set it in your .env.local file (e.g., DUMMY_API_BASE_URL=https://dummyjson.com)'
      );
    }

    return {
      baseUrl,
      timeout: this.getNumberEnvVar('DUMMY_API_TIMEOUT', 30000),
      retryAttempts: this.getNumberEnvVar('API_RETRY_ATTEMPTS', 3),
      retryDelay: this.getNumberEnvVar('API_RETRY_DELAY', 1000),
      responseTimeThreshold: this.getNumberEnvVar('API_RESPONSE_TIME_THRESHOLD', 2000),
      successRateThreshold: this.getNumberEnvVar('API_SUCCESS_RATE_THRESHOLD', 95),
    };
  }

  /**
   * Get test API credentials (for DummyJSON or other test APIs)
   */
  public getTestApiCredentials(): {
    admin: { username: string; password: string } | null;
    user: { username: string; password: string } | null;
  } {
    const adminUsername = this.getEnvVar('TEST_ADMIN_USERNAME', '');
    const adminPassword = this.getEnvVar('TEST_ADMIN_PASSWORD', '');
    const userUsername = this.getEnvVar('TEST_USER_USERNAME', '');
    const userPassword = this.getEnvVar('TEST_USER_PASSWORD', '');

    const admin = adminUsername && adminPassword 
      ? { username: adminUsername, password: adminPassword }
      : null;

    const user = userUsername && userPassword
      ? { username: userUsername, password: userPassword }
      : null;

    return { admin, user };
  }

  /**
   * Check if test API credentials are configured
   */
  public hasTestApiCredentials(): boolean {
    const credentials = this.getTestApiCredentials();
    return !!(credentials.admin || credentials.user);
  }

  // =============================================================================
  // PRIVATE UTILITY METHODS
  // =============================================================================

  /**
   * Get required environment variable or throw error
   */
  private getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Required environment variable '${name}' is not set`);
    }
    return value;
  }

  /**
   * Get environment variable with default value
   */
  private getEnvVar(name: string, defaultValue: string): string {
    return process.env[name] || defaultValue;
  }

  /**
   * Get environment variable as number with default value
   */
  private getNumberEnvVar(name: string, defaultValue: number): number {
    const value = process.env[name];
    if (!value) return defaultValue;
    
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      console.warn(`Invalid number value for ${name}: ${value}, using default: ${defaultValue}`);
      return defaultValue;
    }
    
    return parsed;
  }

  /**
   * Get environment variable as boolean with default value
   */
  private getBooleanEnvVar(name: string, defaultValue: boolean): boolean {
    const value = process.env[name]?.toLowerCase();
    if (!value) return defaultValue;
    
    return value === 'true' || value === '1' || value === 'yes';
  }
}

// Export singleton instance
export const config = ConfigLoader.getInstance();
