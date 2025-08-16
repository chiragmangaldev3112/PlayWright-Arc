/**
 * Base API Client
 * 
 * Provides a comprehensive base class for API testing with Playwright's APIRequestContext.
 * Includes authentication, request/response logging, error handling, and common API patterns.
 */

import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import type {
  ApiRequestConfig,
  ApiErrorResponse,
  UserCredentials,
} from '@types';
import { HttpMethod } from '@types';
import { logger } from '@utils/core/logger';
import { config } from '@config/config-loader';

/**
 * Base API Client Class
 * Provides common functionality for all API endpoints
 */
export class BaseApi {
  protected request: APIRequestContext;
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;
  protected authToken?: string;

  /**
   * Constructor
   * @param request - Playwright APIRequestContext
   * @param baseUrl - Base URL for API requests (optional, uses config if not provided)
   */
  constructor(request: APIRequestContext, baseUrl?: string) {
    this.request = request;
    this.baseUrl = baseUrl || config.getConfig().apiBaseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Playwright-API-Tests/1.0',
    };
  }

  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================

  /**
   * Set authentication token
   * @param token - Authentication token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    this.defaultHeaders = {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${token}`
    };
    logger.debug('Authentication token set');
  }

  /**
   * Clear authentication token
   */
  public clearAuthToken(): void {
    delete this.authToken;
    const { Authorization, ...headers } = this.defaultHeaders;
    this.defaultHeaders = headers;
    logger.debug('Authentication token cleared');
  }

  /**
   * Login and set authentication token
   * @param credentials - User credentials
   * @returns Promise<string> - Authentication token
   */
  public async login(credentials: UserCredentials): Promise<string> {
    logger.info(`Logging in user: ${credentials.username}`);

    try {
      const response = await this.post('/auth/login', {
        username: credentials.username,
        password: credentials.password,
      });

      await this.expectSuccessResponse(response);
      const responseData = await response.json();
      
      if (!responseData.token) {
        throw new Error('No authentication token received in login response');
      }

      this.setAuthToken(responseData.token);
      logger.info(`Successfully logged in user: ${credentials.username}`);
      
      return responseData.token;
    } catch (error) {
      logger.error(`Login failed for user: ${credentials.username}`, error);
      throw error;
    }
  }

  /**
   * Logout and clear authentication token
   * @returns Promise<void>
   */
  public async logout(): Promise<void> {
    if (!this.authToken) {
      logger.debug('No authentication token to logout');
      return;
    }

    try {
      await this.post('/auth/logout');
      this.clearAuthToken();
      logger.info('Successfully logged out');
    } catch (error) {
      logger.error('Logout failed', error);
      this.clearAuthToken(); // Clear token even if logout fails
      throw error;
    }
  }

  // =============================================================================
  // HTTP REQUEST METHODS
  // =============================================================================

  /**
   * Make GET request
   * @param endpoint - API endpoint
   * @param options - Request options
   * @returns Promise<APIResponse> - API response
   */
  public async get(
    endpoint: string,
    options: Partial<Omit<ApiRequestConfig, 'method' | 'data' | 'url'>> = {}
  ): Promise<APIResponse> {
    return this.makeRequest(HttpMethod.GET, endpoint, { ...options });
  }

  /**
   * Make POST request
   * @param endpoint - API endpoint
   * @param data - Request data
   * @param options - Request options
   * @returns Promise<APIResponse> - API response
   */
  public async post(
    endpoint: string,
    data?: unknown,
    options: Partial<Omit<ApiRequestConfig, 'method' | 'url'>> = {}
  ): Promise<APIResponse> {
    return this.makeRequest(HttpMethod.POST, endpoint, { data, ...options });
  }

  /**
   * Make PUT request
   * @param endpoint - API endpoint
   * @param data - Request data
   * @param options - Request options
   * @returns Promise<APIResponse> - API response
   */
  public async put(
    endpoint: string,
    data?: unknown,
    options: Partial<Omit<ApiRequestConfig, 'method' | 'url'>> = {}
  ): Promise<APIResponse> {
    return this.makeRequest(HttpMethod.PUT, endpoint, { data, ...options });
  }

  /**
   * Make PATCH request
   * @param endpoint - API endpoint
   * @param data - Request data
   * @param options - Request options
   * @returns Promise<APIResponse> - API response
   */
  public async patch(
    endpoint: string,
    data?: unknown,
    options: Partial<Omit<ApiRequestConfig, 'method' | 'url'>> = {}
  ): Promise<APIResponse> {
    return this.makeRequest(HttpMethod.PATCH, endpoint, { data, ...options });
  }

  /**
   * Make DELETE request
   * @param endpoint - API endpoint
   * @param options - Request options
   * @returns Promise<APIResponse> - API response
   */
  public async delete(
    endpoint: string,
    options: Partial<Omit<ApiRequestConfig, 'method' | 'data' | 'url'>> = {}
  ): Promise<APIResponse> {
    return this.makeRequest(HttpMethod.DELETE, endpoint, { ...options });
  }

  // =============================================================================
  // CORE REQUEST METHOD
  // =============================================================================

  /**
   * Make HTTP request
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param options - Request options
   * @returns Promise<APIResponse> - API response
   */
  protected async makeRequest(
    method: HttpMethod, 
    endpoint: string, 
    options: Omit<ApiRequestConfig, 'method' | 'url'> = {}
  ): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...options.headers };

    // Log request
    logger.apiRequest(method, url, options.data);

    const startTime = Date.now();

    try {
      const requestOptions: any = {
        method,
        headers,
        timeout: options.timeout || 30000,
      };
      
      if (options.data) {
        requestOptions.data = JSON.stringify(options.data);
      }
      
      if (options.params) {
        requestOptions.params = options.params;
      }
      
      const response = await this.request.fetch(url, requestOptions);

      // Log response
      logger.apiResponse(method, url, response.status());

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('API request failed', {
        method,
        url,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  // =============================================================================
  // RESPONSE ASSERTION METHODS
  // =============================================================================

  /**
   * Assert response is successful (2xx status)
   * @param response - API response
   * @returns Promise<void>
   */
  public async expectSuccessResponse(response: APIResponse): Promise<void> {
    const status = response.status();
    expect(status, `Expected successful response, got ${status}`).toBeGreaterThanOrEqual(200);
    expect(status, `Expected successful response, got ${status}`).toBeLessThan(300);
  }

  /**
   * Assert response has specific status code
   * @param response - API response
   * @param expectedStatus - Expected status code
   * @returns Promise<void>
   */
  public async expectStatus(response: APIResponse, expectedStatus: number): Promise<void> {
    const actualStatus = response.status();
    expect(actualStatus, `Expected status ${expectedStatus}, got ${actualStatus}`).toBe(expectedStatus);
  }

  /**
   * Assert response contains specific data
   * @param response - API response
   * @param expectedData - Expected data (partial match)
   * @returns Promise<void>
   */
  public async expectResponseData(response: APIResponse, expectedData: Record<string, unknown>): Promise<void> {
    const responseData = await response.json();
    
    for (const [key, value] of Object.entries(expectedData)) {
      expect(responseData).toHaveProperty(key, value);
    }
  }

  /**
   * Assert response has required fields
   * @param response - API response
   * @param requiredFields - Array of required field names
   * @returns Promise<void>
   */
  public async expectRequiredFields(response: APIResponse, requiredFields: string[]): Promise<void> {
    const responseData = await response.json();
    
    for (const field of requiredFields) {
      expect(responseData, `Missing required field: ${field}`).toHaveProperty(field);
    }
  }

  /**
   * Assert response is an array with minimum length
   * @param response - API response
   * @param minLength - Minimum array length (default: 0)
   * @returns Promise<void>
   */
  public async expectArrayResponse(response: APIResponse, minLength: number = 0): Promise<void> {
    const responseData = await response.json();
    expect(Array.isArray(responseData), 'Response should be an array').toBe(true);
    expect(responseData.length, `Array should have at least ${minLength} items`).toBeGreaterThanOrEqual(minLength);
  }

  /**
   * Assert error response
   * @param response - API response
   * @param expectedError - Expected error details
   * @returns Promise<void>
   */
  public async expectErrorResponse(response: APIResponse, expectedError?: Partial<ApiErrorResponse['error']>): Promise<void> {
    const status = response.status();
    expect(status, `Expected error response, got ${status}`).toBeGreaterThanOrEqual(400);

    if (expectedError) {
      const responseData = await response.json();
      
      if (expectedError.message) {
        expect(responseData.message || responseData.error).toContain(expectedError.message);
      }
      
      if (expectedError.code) {
        expect(responseData.code).toBe(expectedError.code);
      }
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get response data as JSON
   * @param response - API response
   * @returns Promise<T> - Parsed JSON data
   */
  public async getResponseData<T = unknown>(response: APIResponse): Promise<T> {
    await this.expectSuccessResponse(response);
    return response.json() as Promise<T>;
  }

  /**
   * Build full URL from endpoint
   * @param endpoint - API endpoint
   * @returns string - Full URL
   */
  protected buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  /**
   * Generate unique request ID for logging
   * @returns string - Request ID
   */
  protected generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize headers for logging (remove sensitive data)
   * @param headers - Request headers
   * @returns Record<string, string> - Sanitized headers
   */
  protected sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    
    // Mask sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '***MASKED***';
      }
      if (sanitized[header.toLowerCase()]) {
        sanitized[header.toLowerCase()] = '***MASKED***';
      }
    }
    
    return sanitized;
  }

  /**
   * Wait for specific response condition
   * @param endpoint - API endpoint
   * @param condition - Condition function
   * @param options - Wait options
   * @returns Promise<APIResponse> - API response that meets condition
   */
  public async waitForCondition(
    endpoint: string,
    condition: (response: APIResponse) => Promise<boolean>,
    options: {
      timeout?: number;
      interval?: number;
      method?: HttpMethod;
    } = {}
  ): Promise<APIResponse> {
    const timeout = options.timeout || 30000;
    const interval = options.interval || 1000;
    const method = options.method || HttpMethod.GET;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const response = await this.makeRequest(method, endpoint);
      
      if (await condition(response)) {
        return response;
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(`Condition not met within ${timeout}ms for endpoint: ${endpoint}`);
  }

  /**
   * Retry request with exponential backoff
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param options - Request options
   * @param retryOptions - Retry configuration
   * @returns Promise<APIResponse> - API response
   */
  public async retryRequest(
    method: HttpMethod,
    endpoint: string,
    options: Omit<ApiRequestConfig, 'method' | 'url'> = {},
    retryOptions: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
    } = {}
  ): Promise<APIResponse> {
    const maxRetries = retryOptions.maxRetries || 3;
    const baseDelay = retryOptions.baseDelay || 1000;
    const maxDelay = retryOptions.maxDelay || 10000;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.makeRequest(method, endpoint, options);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          break;
        }

        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`, {
          endpoint,
          error: lastError.message,
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }
}
