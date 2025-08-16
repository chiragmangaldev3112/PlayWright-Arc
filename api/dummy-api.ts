/**
 * DummyJSON API Client for Secure Testing
 * 
 * Uses DummyJSON public API for testing authentication, timing,
 * status codes, and response formats without exposing real credentials.
 * 
 * Enhanced with comprehensive performance metrics, network diagnostics,
 * and detailed reporting capabilities.
 * 
 * API Documentation: https://dummyjson.com/docs/auth
 */

import { APIRequestContext } from '@playwright/test';
import { BaseApi } from './base-api';
import { logger } from '@utils/core/logger';
import { config } from '@config/config-loader';
import { NetworkHelpers, type NetworkMetrics } from '@utils/network/network-helpers';
import { FormatHelpers } from '@utils/formatting/format-helpers';
import { DateHelpers } from '@utils/formatting/date-helpers';
import { ValidationHelpers } from '@utils/data/validation-helpers';
import { DataHelpers } from '@utils/data/data-helpers';
import { CryptoHelpers } from '@utils/security/crypto-helpers';
import { EnvironmentHelpers } from '@utils/system/environment-helpers';
import { WaitHelpers } from '@utils/testing/wait-helpers';

/**
 * DummyJSON user interface
 */
export interface DummyUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Login credentials for DummyJSON
 */
export interface DummyCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

/**
 * Comprehensive API performance metrics
 */
export interface ApiPerformanceMetrics {
  // Timing metrics
  requestStart: number;
  responseEnd: number;
  totalDuration: number;
  
  // Connection metrics
  dnsLookupTime?: number;
  connectionTime?: number;
  tlsHandshakeTime?: number;
  
  // Request/Response metrics
  requestSentTime?: number;
  firstByteTime?: number;
  contentDownloadTime?: number;
  
  // HTTP details
  status: number;
  statusText: string;
  statusCategory: 'informational' | 'success' | 'redirection' | 'client_error' | 'server_error' | 'unknown';
  
  // Response details
  contentLength?: number;
  contentType?: string;
  responseHeaders?: Record<string, string>;
  
  // Network metrics
  networkMetrics?: NetworkMetrics;
  
  // Additional metadata
  timestamp: string;
  requestId: string;
  endpoint: string;
  method: string;
  
  // Error details (if any)
  error?: {
    type: string;
    message: string;
    code?: string;
  };
}

/**
 * HTTP status code categories for analysis
 */
export interface HttpStatusAnalysis {
  code: number;
  category: 'informational' | 'success' | 'redirection' | 'client_error' | 'server_error' | 'unknown';
  description: string;
  isSuccess: boolean;
  isError: boolean;
  isRetryable: boolean;
}

/**
 * API test report with comprehensive metrics
 */
export interface ApiTestReport {
  testId: string;
  testName: string;
  startTime: string;
  endTime: string;
  totalDuration: number;
  
  // Request details
  endpoint: string;
  method: string;
  requestSize?: number;
  
  // Response details
  status: number;
  statusAnalysis: HttpStatusAnalysis;
  responseSize?: number;
  
  // Performance metrics
  metrics: ApiPerformanceMetrics;
  
  // Test results
  success: boolean;
  errors: string[];
  warnings: string[];
  
  // Environment info
  environment: string;
  userAgent?: string;
  
  // Additional metadata
  tags: string[];
  metadata: Record<string, any>;
}

/**
 * DummyJSON API client for secure testing with comprehensive performance metrics
 */
export class DummyApi extends BaseApi {
  // API endpoints
  private static readonly AUTH_ENDPOINT = '/auth/login';
  private static readonly ME_ENDPOINT = '/auth/me';
  private static readonly REFRESH_ENDPOINT = '/auth/refresh';
  private static readonly USERS_ENDPOINT = '/users';
  
  // Predefined test users (public test data - no security risk)
  private static readonly TEST_USERS: DummyCredentials[] = [
    { username: 'emilys', password: 'emilyspass' },
    { username: 'michaelw', password: 'michaelwpass' },
    { username: 'sophiab', password: 'sophiabpass' },
    { username: 'jamesd', password: 'jamesdpass' },
    { username: 'emmaj', password: 'emmajapass' }
  ];
  
  private readonly apiConfig: any;
  protected override readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;
  private readonly responseTimeThreshold: number;
  private readonly successRateThreshold: number;
  
  // Utility helpers
  private readonly networkHelpers: NetworkHelpers;
  private readonly formatHelpers: FormatHelpers;
  private readonly dateHelpers: DateHelpers;
  private readonly validationHelpers: ValidationHelpers;
  private readonly dataHelpers: DataHelpers;
  private readonly cryptoHelpers: CryptoHelpers;
  private readonly environmentHelpers: EnvironmentHelpers;
  private readonly waitHelpers: WaitHelpers;
  
  // Performance tracking
  private readonly testReports: Map<string, ApiTestReport> = new Map();
  private readonly performanceMetrics: ApiPerformanceMetrics[] = [];

  constructor(context: APIRequestContext) {
    super(context);
    
    // Load configuration from config-loader
    this.apiConfig = config.getDummyApiConfig();
    this.baseUrl = this.apiConfig.baseUrl;
    this.timeout = this.apiConfig.timeout;
    this.retryAttempts = this.apiConfig.retryAttempts;
    this.retryDelay = this.apiConfig.retryDelay;
    this.responseTimeThreshold = this.apiConfig.responseTimeThreshold;
    this.successRateThreshold = this.apiConfig.successRateThreshold;
    
    // Initialize utility helpers
    this.networkHelpers = NetworkHelpers.getInstance();
    this.formatHelpers = FormatHelpers.getInstance();
    this.dateHelpers = DateHelpers.getInstance();
    this.validationHelpers = ValidationHelpers.getInstance();
    this.dataHelpers = DataHelpers.getInstance();
    this.cryptoHelpers = CryptoHelpers.getInstance();
    this.environmentHelpers = EnvironmentHelpers.getInstance();
    // Note: WaitHelpers requires a Page instance, will initialize when needed
    this.waitHelpers = null as any; // Will be set when page is available

    logger.info('DummyAPI client initialized with comprehensive utilities', {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      retryAttempts: this.retryAttempts,
      retryDelay: this.retryDelay,
      responseTimeThreshold: this.responseTimeThreshold,
      successRateThreshold: this.successRateThreshold,
      environment: this.environmentHelpers.getEnvironmentConfig().type,
      timestamp: this.dateHelpers.getCurrentTimestamp('iso') as string
    });
  }

  /**
   * Get a random test user for secure testing
   */
  public getRandomTestUser(): DummyCredentials {
    const randomIndex = Math.floor(Math.random() * DummyApi.TEST_USERS.length);
    const user = DummyApi.TEST_USERS[randomIndex];
    if (!user) {
      throw new Error('No test users available');
    }
    
    const result: DummyCredentials = {
      username: user.username,
      password: user.password
    };
    
    if (user.expiresInMins !== undefined) {
      result.expiresInMins = user.expiresInMins;
    }
    
    return result;
  }

  /**
   * Login with comprehensive testing metrics
   */
  public async loginWithMetrics(credentials?: DummyCredentials): Promise<{
    user: DummyUser;
    timing: ApiPerformanceMetrics;
    headers: Record<string, string>;
  }> {
    const testUser = credentials || this.getRandomTestUser();
    const startTime = Date.now();

    logger.info('🔐 Attempting login with DummyJSON API', { 
      username: testUser.username,
      endpoint: DummyApi.AUTH_ENDPOINT 
    });

    try {
      const response = await this.post(DummyApi.AUTH_ENDPOINT, {
        username: testUser.username,
        password: testUser.password,
        expiresInMins: testUser.expiresInMins || 30
      });

      const endTime = Date.now();
      const timing: ApiPerformanceMetrics = {
        requestStart: startTime,
        responseEnd: endTime,
        totalDuration: endTime - startTime,
        status: response.status(),
        statusText: response.statusText(),
        statusCategory: this.getStatusCategory(response.status()),
        timestamp: this.dateHelpers.getCurrentTimestamp('iso') as string,
        requestId: this.cryptoHelpers.generateUUID(),
        endpoint: '/auth/login',
        method: 'POST'
      };

      // Validate response format
      await this.validateResponseFormat(response);
      
      const user = await response.json() as DummyUser;
      const headers = response.headers();

      logger.info('✅ Login successful', {
        userId: user.id,
        username: user.username,
        duration: timing.totalDuration,
        status: timing.status
      });

      return { user, timing, headers };

    } catch (error) {
      const endTime = Date.now();
      logger.error('❌ Login failed', {
        username: testUser.username,
        duration: endTime - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get current authenticated user with timing
   */
  public async getCurrentUserWithMetrics(accessToken: string): Promise<{
    user: DummyUser;
    timing: ApiPerformanceMetrics;
  }> {
    const startTime = Date.now();

    logger.info('👤 Fetching current user profile');

    try {
      const response = await this.get(DummyApi.ME_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const endTime = Date.now();
      const timing: ApiPerformanceMetrics = {
        requestStart: startTime,
        responseEnd: endTime,
        totalDuration: endTime - startTime,
        status: response.status(),
        statusText: response.statusText(),
        statusCategory: this.getStatusCategory(response.status()),
        timestamp: this.dateHelpers.getCurrentTimestamp('iso') as string,
        requestId: this.cryptoHelpers.generateUUID(),
        endpoint: '/auth/me',
        method: 'GET'
      };

      await this.validateResponseFormat(response);
      const user = await response.json() as DummyUser;

      logger.info('✅ User profile fetched', {
        userId: user.id,
        duration: timing.totalDuration,
        status: timing.status
      });

      return { user, timing };

    } catch (error) {
      const endTime = Date.now();
      logger.error('❌ Failed to fetch user profile', {
        duration: endTime - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get status category based on HTTP status code
   * @param status - HTTP status code
   * @returns Status category
   */
  private getStatusCategory(status: number): 'informational' | 'success' | 'redirection' | 'client_error' | 'server_error' | 'unknown' {
    if (status >= 100 && status < 200) return 'informational';
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'redirection';
    if (status >= 400 && status < 500) return 'client_error';
    if (status >= 500 && status < 600) return 'server_error';
    return 'unknown';
  }

  /**
   * Test various HTTP status codes
   */
  public async testHttpStatusCodes(): Promise<{
    results: Array<{
      endpoint: string;
      expectedStatus: number;
      actualStatus: number;
      success: boolean;
      timing: number;
    }>;
  }> {
    const testCases = [
      { endpoint: '/users/1', expectedStatus: 200, description: 'Valid user' },
      { endpoint: '/users/999999', expectedStatus: 404, description: 'Non-existent user' },
      { endpoint: '/products', expectedStatus: 200, description: 'Products list' },
      { endpoint: '/posts/1', expectedStatus: 200, description: 'Valid post' }
    ];

    const results = [];

    for (const testCase of testCases) {
      const startTime = Date.now();
      
      try {
        const response = await this.get(testCase.endpoint);
        const duration = Date.now() - startTime;
        const actualStatus = response.status();
        const success = actualStatus === testCase.expectedStatus;

        results.push({
          endpoint: testCase.endpoint,
          expectedStatus: testCase.expectedStatus,
          actualStatus,
          success,
          timing: duration
        });

        logger.info(`${success ? '✅' : '❌'} Status code test`, {
          endpoint: testCase.endpoint,
          expected: testCase.expectedStatus,
          actual: actualStatus,
          duration
        });

      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          endpoint: testCase.endpoint,
          expectedStatus: testCase.expectedStatus,
          actualStatus: 0,
          success: false,
          timing: duration
        });

        logger.error('❌ Status code test failed', {
          endpoint: testCase.endpoint,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { results };
  }

  /**
   * Test API response format validation
   */
  public async testResponseFormats(): Promise<{
    results: Array<{
      endpoint: string;
      hasValidJson: boolean;
      hasRequiredFields: boolean;
      responseSize: number;
      contentType: string;
    }>;
  }> {
    const testEndpoints = [
      { endpoint: '/users/1', requiredFields: ['id', 'username', 'email'] },
      { endpoint: '/products/1', requiredFields: ['id', 'title', 'price'] },
      { endpoint: '/posts/1', requiredFields: ['id', 'title', 'body'] }
    ];

    const results = [];

    for (const test of testEndpoints) {
      try {
        const response = await this.get(test.endpoint);
        const contentType = response.headers()['content-type'] || '';
        const responseText = await response.text();
        const responseSize = responseText.length;

        let hasValidJson = false;
        let hasRequiredFields = false;
        let data: any = null;

        try {
          data = JSON.parse(responseText);
          hasValidJson = true;

          // Check required fields
          hasRequiredFields = test.requiredFields.every(field => 
            data && typeof data === 'object' && field in data
          );

        } catch (jsonError) {
          hasValidJson = false;
        }

        results.push({
          endpoint: test.endpoint,
          hasValidJson,
          hasRequiredFields,
          responseSize,
          contentType
        });

        logger.info('📋 Response format test', {
          endpoint: test.endpoint,
          validJson: hasValidJson,
          requiredFields: hasRequiredFields,
          size: responseSize
        });

      } catch (error) {
        results.push({
          endpoint: test.endpoint,
          hasValidJson: false,
          hasRequiredFields: false,
          responseSize: 0,
          contentType: ''
        });

        logger.error('❌ Response format test failed', {
          endpoint: test.endpoint,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { results };
  }

  /**
   * Comprehensive API performance test
   */
  public async performanceTest(iterations: number = 5): Promise<{
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    successRate: number;
    totalRequests: number;
  }> {
    const responseTimes: number[] = [];
    let successCount = 0;

    logger.info('🚀 Starting API performance test', { iterations });

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      try {
        const response = await this.get('/users?limit=10');
        const duration = Date.now() - startTime;
        
        if (response.ok()) {
          responseTimes.push(duration);
          successCount++;
        }

        logger.info(`📊 Performance test ${i + 1}/${iterations}`, {
          duration,
          status: response.status()
        });

      } catch (error) {
        logger.error(`❌ Performance test ${i + 1} failed`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    const results = {
      averageResponseTime,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      successRate: (successCount / iterations) * 100,
      totalRequests: iterations
    };

    logger.info('📈 Performance test completed', results);
    return results;
  }

  /**
   * Validate response format and structure
   */
  private async validateResponseFormat(response: any): Promise<void> {
    // Check if response is JSON
    const contentType = response.headers()['content-type'];
    if (!contentType?.includes('application/json')) {
      throw new Error(`Expected JSON response, got: ${contentType}`);
    }

    // Check if response can be parsed as JSON
    try {
      await response.json();
    } catch (error) {
      throw new Error('Response is not valid JSON');
    }
  }
}
