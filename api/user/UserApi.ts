
import { BaseApi } from '../base-api';
import type { APIRequestContext } from '@playwright/test';
import type * as Models from './UserApiModels';

/**
 * UserApi - API client for /users endpoints
 * @class UserApi
 * @extends {BaseApi}
 */
export class UserApi extends BaseApi {
  /**
   * Creates an instance of UserApi
   * @param {APIRequestContext} request - Playwright API request context
   * @param {string} [baseUrl] - Optional base URL override
   */
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }
  
  /**
   * Get user by ID
   * @param {Object} overrides - Optional data and parameter overrides
   * @param {any} overrides.data - Request body data
   * @param {Models.GetUserQuery} overrides.params - Request parameters
   * @returns {Promise<Response>} API response
   */
  public async getUser(overrides?: { data?: any; params?: Models.GetUserQuery }) {
    const requestData = overrides?.data || {};
    const requestParams = overrides?.params || {} as Models.GetUserQuery;
    const response = await this.get('/users', requestData, { params: requestParams });
    await this.expectStatus(response, 200);
    return response;
  }

  /**
   * Create a new user
   * @param {Object} overrides - Optional data and parameter overrides
   * @param {Models.CreateUserRequest} overrides.data - Request body data
   * @param {any} overrides.params - Request parameters
   * @returns {Promise<Response>} API response
   */
  public async createUser(overrides?: { data?: Models.CreateUserRequest; params?: any }) {
    const requestData = overrides?.data || {} as Models.CreateUserRequest;
    const requestParams = overrides?.params || {};
    const response = await this.post('/users', requestData, { params: requestParams });
    await this.expectStatus(response, 201);
    return response;
  }

  /**
   * Update existing user
   * @param {Object} overrides - Optional data and parameter overrides
   * @param {Models.UpdateUserRequest} overrides.data - Request body data
   * @param {Models.UpdateUserQuery} overrides.params - Request parameters
   * @returns {Promise<Response>} API response
   */
  public async updateUser(overrides?: { data?: Models.UpdateUserRequest; params?: Models.UpdateUserQuery }) {
    const requestData = overrides?.data || {} as Models.UpdateUserRequest;
    const requestParams = overrides?.params || {} as Models.UpdateUserQuery;
    const response = await this.put('/users', requestData, { params: requestParams });
    await this.expectStatus(response, 200);
    return response;
  }

  /**
   * Delete user by ID
   * @param {Object} overrides - Optional data and parameter overrides
   * @param {any} overrides.data - Request body data
   * @param {Models.DeleteUserQuery} overrides.params - Request parameters
   * @returns {Promise<Response>} API response
   */
  public async deleteUser(overrides?: { data?: any; params?: Models.DeleteUserQuery }) {
    const requestData = overrides?.data || {};
    const requestParams = overrides?.params || {} as Models.DeleteUserQuery;
    const response = await this.delete('/users', requestData, { params: requestParams });
    await this.expectStatus(response, 204);
    return response;
  }
}
