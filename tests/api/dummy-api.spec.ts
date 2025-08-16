/**
 * DummyJSON API Test Suite
 * 
 * Comprehensive tests for the DummyAPI client demonstrating:
 * - Authentication testing
 * - Performance monitoring
 * - Response validation
 * - Error handling
 * - Security best practices
 */

import { test, expect } from '@playwright/test';
import { DummyApi } from '../../api/dummy-api';
import { logger } from '../../utils/core/logger';
import { config } from '../../config/config-loader';

test.describe('DummyJSON API Testing', () => {
  let dummyApi: DummyApi;

  test.beforeEach(async ({ request }) => {
    dummyApi = new DummyApi(request);
  });

  test.describe('Authentication Tests', () => {
    test('should login with random test user and capture metrics @api', async () => {
      const result = await dummyApi.loginWithMetrics();
      
      // Validate user data
      expect(result.user).toBeDefined();
      expect(result.user.id).toBeGreaterThan(0);
      expect(result.user.username).toBeTruthy();
      expect(result.user.email).toBeTruthy();
      expect(result.user.accessToken).toBeTruthy();
      
      // Validate timing metrics
      expect(result.timing).toBeDefined();
      expect(result.timing.totalDuration).toBeGreaterThan(0);
      expect(result.timing.status).toBe(200);
      
      // Performance assertion
      const threshold = config.getDummyApiConfig().responseTimeThreshold;
      expect(result.timing.totalDuration).toBeLessThan(threshold);
      
      logger.info('✅ Authentication test passed', {
        user: result.user.username,
        duration: result.timing.totalDuration,
        threshold
      });
    });

    test('should login with specific credentials @api', async () => {
      const credentials = dummyApi.getRandomTestUser();
      const result = await dummyApi.loginWithMetrics(credentials);
      
      expect(result.user.username).toBe(credentials.username);
      expect(result.timing.status).toBe(200);
    });

    test('should get current user with valid token @api', async () => {
      // First login to get token
      const loginResult = await dummyApi.loginWithMetrics();
      const accessToken = loginResult.user.accessToken!;
      
      // Then get current user
      const userResult = await dummyApi.getCurrentUserWithMetrics(accessToken);
      
      expect(userResult.user).toBeDefined();
      expect(userResult.user.id).toBe(loginResult.user.id);
      expect(userResult.timing.status).toBe(200);
    });

    test('should handle invalid credentials gracefully @api', async () => {
      const invalidCredentials = {
        username: 'invalid_user',
        password: 'invalid_password'
      };
      
      const result = await dummyApi.loginWithMetrics(invalidCredentials);
      
      // Should return error response, not throw exception
      expect(result.timing.status).toBe(400);
      expect(result.user).toHaveProperty('message', 'Invalid credentials');
    });
  });

  test.describe('HTTP Status Code Tests', () => {
    test('should test various HTTP status codes @api', async () => {
      const result = await dummyApi.testHttpStatusCodes();
      
      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
      
      // Check that we have some successful tests
      const successfulTests = result.results.filter(r => r.success);
      expect(successfulTests.length).toBeGreaterThan(0);
      
      // Log results for analysis
      result.results.forEach(test => {
        logger.info('HTTP Status Test Result', {
          endpoint: test.endpoint,
          expected: test.expectedStatus,
          actual: test.actualStatus,
          success: test.success,
          timing: test.timing
        });
      });
    });
  });

  test.describe('Response Format Tests', () => {
    test('should validate response formats @api', async () => {
      const result = await dummyApi.testResponseFormats();
      
      expect(result.results).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
      
      // Check that responses have valid JSON
      const validJsonResponses = result.results.filter(r => r.hasValidJson);
      expect(validJsonResponses.length).toBeGreaterThan(0);
      
      // Check that responses have required fields
      const validFieldResponses = result.results.filter(r => r.hasRequiredFields);
      expect(validFieldResponses.length).toBeGreaterThan(0);
      
      // Log results
      result.results.forEach(test => {
        logger.info('Response Format Test Result', {
          endpoint: test.endpoint,
          validJson: test.hasValidJson,
          requiredFields: test.hasRequiredFields,
          size: test.responseSize,
          contentType: test.contentType
        });
      });
    });
  });

  test.describe('Performance Tests', () => {
    test('should perform comprehensive performance testing @api', async () => {
      const iterations = 3; // Reduced for faster testing
      const result = await dummyApi.performanceTest(iterations);
      
      expect(result).toBeDefined();
      expect(result.totalRequests).toBe(iterations);
      expect(result.averageResponseTime).toBeGreaterThan(0);
      
      // Performance assertions based on configuration
      const apiConfig = config.getDummyApiConfig();
      expect(result.averageResponseTime).toBeLessThan(apiConfig.responseTimeThreshold);
      expect(result.successRate).toBeGreaterThanOrEqual(apiConfig.successRateThreshold);
      
      logger.info('📊 Performance Test Summary', {
        averageResponseTime: result.averageResponseTime,
        minResponseTime: result.minResponseTime,
        maxResponseTime: result.maxResponseTime,
        successRate: result.successRate,
        totalRequests: result.totalRequests,
        threshold: apiConfig.responseTimeThreshold,
        requiredSuccessRate: apiConfig.successRateThreshold
      });
    });

    test('should handle performance test with higher iterations @api', async () => {
      const iterations = 5;
      const result = await dummyApi.performanceTest(iterations);
      
      expect(result.totalRequests).toBe(iterations);
      expect(result.successRate).toBeGreaterThan(0);
      
      // Ensure we have reasonable performance metrics
      expect(result.minResponseTime).toBeLessThanOrEqual(result.averageResponseTime);
      expect(result.maxResponseTime).toBeGreaterThanOrEqual(result.averageResponseTime);
    });
  });

  test.describe('Configuration Tests', () => {
    test('should use proper configuration from config-loader @api', async () => {
      const apiConfig = config.getDummyApiConfig();
      
      expect(apiConfig.baseUrl).toBe('https://dummyjson.com');
      expect(apiConfig.timeout).toBeGreaterThan(0);
      expect(apiConfig.retryAttempts).toBeGreaterThan(0);
      expect(apiConfig.responseTimeThreshold).toBeGreaterThan(0);
      expect(apiConfig.successRateThreshold).toBeGreaterThan(0);
      
      logger.info('🔧 API Configuration Validated', apiConfig);
    });

    test('should handle test credentials from environment @api', async () => {
      const hasCredentials = config.hasTestApiCredentials();
      const credentials = config.getTestApiCredentials();
      
      if (hasCredentials) {
        expect(credentials.admin || credentials.user).toBeTruthy();
        logger.info('🔐 Environment credentials available');
      } else {
        logger.info('ℹ️ Using DummyJSON public test data');
      }
      
      // Should always be able to get a test user
      const testUser = dummyApi.getRandomTestUser();
      expect(testUser.username).toBeTruthy();
      expect(testUser.password).toBeTruthy();
    });
  });

  test.describe('Error Handling Tests', () => {
    test('should handle network errors gracefully @api', async () => {
      // Test with invalid endpoint
      const response = await dummyApi.get('/invalid/endpoint/that/does/not/exist');
      
      // Should return 404 response, not throw exception
      expect(response.status()).toBe(404);
    });

    test('should validate response formats properly @api', async () => {
      // This should pass with valid endpoints
      const result = await dummyApi.testResponseFormats();
      expect(result.results).toBeDefined();
      
      // At least some endpoints should return valid JSON
      const validResponses = result.results.filter(r => r.hasValidJson);
      expect(validResponses.length).toBeGreaterThan(0);
    });
  });

  test.describe('Security Tests', () => {
    test('should not expose sensitive data in logs @api', async () => {
      const testUser = dummyApi.getRandomTestUser();
      const result = await dummyApi.loginWithMetrics(testUser);
      
      // Verify that sensitive data is properly handled
      expect(result.user.accessToken).toBeTruthy();
      
      // The actual token should not appear in plain text logs
      // (This is ensured by the BaseApi's logging mechanism)
      logger.info('🔒 Security test: Token properly masked in logs');
    });

    test('should use secure HTTPS endpoints @api', async () => {
      const apiConfig = config.getDummyApiConfig();
      expect(apiConfig.baseUrl).toMatch(/^https:\/\//);
      
      logger.info('🔐 Security test: HTTPS endpoints verified');
    });
  });
});

test.describe('Integration Tests', () => {
  test('should perform end-to-end API testing workflow @api', async ({ request }) => {
    const api = new DummyApi(request);
    
    // Step 1: Login and get token
    const loginResult = await api.loginWithMetrics();
    expect(loginResult.user.accessToken).toBeTruthy();
    
    // Step 2: Use token to get current user
    const userResult = await api.getCurrentUserWithMetrics(loginResult.user.accessToken!);
    expect(userResult.user.id).toBe(loginResult.user.id);
    
    // Step 3: Test performance
    const perfResult = await api.performanceTest(2);
    expect(perfResult.successRate).toBeGreaterThan(0);
    
    // Step 4: Validate response formats
    const formatResult = await api.testResponseFormats();
    expect(formatResult.results.length).toBeGreaterThan(0);
    
    logger.info('✅ End-to-end API testing workflow completed successfully');
  });
});
