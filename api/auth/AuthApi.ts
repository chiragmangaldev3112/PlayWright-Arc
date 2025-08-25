
import { BaseApi } from '../base-api';
import type { APIRequestContext } from '@playwright/test';
import type * as Models from './AuthApiModels';

/**
 * AuthApi - API client for /auth endpoints
 * @class AuthApi
 * @extends {BaseApi}
 */
export class AuthApi extends BaseApi {
  /**
   * Creates an instance of AuthApi
   * @param {APIRequestContext} request - Playwright API request context
   * @param {string} [baseUrl] - Optional base URL override
   */
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }
  
  /**
   * Login with valid credentials
   * @param {Object} overrides - Optional data and parameter overrides
   * @param {Models.LoginRequest} overrides.data - Request body data
   * @param {any} overrides.params - Request parameters
   * @returns {Promise<Response>} API response
   */
  public async login(overrides?: { data?: Models.LoginRequest; params?: any }) {
    const requestData = overrides?.data || {} as Models.LoginRequest;
    const requestParams = overrides?.params || {};
    const response = await this.post('/auth', requestData, { params: requestParams });
    await this.expectStatus(response, 200);
    return response;
  }

  /**
   * Logout current user
   * @param {Object} overrides - Optional data and parameter overrides
   * @param {any} overrides.data - Request body data
   * @param {any} overrides.params - Request parameters
   * @returns {Promise<Response>} API response
   */
  public async logout(overrides?: { data?: any; params?: any }) {
    const requestData = overrides?.data || {};
    const requestParams = overrides?.params || {};
    const response = await this.post('/auth', requestData, { params: requestParams });
    await this.expectStatus(response, 200);
    return response;
  }
}
