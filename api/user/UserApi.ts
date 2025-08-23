
import { BaseApi } from '../base-api';
import type { APIRequestContext } from '@playwright/test';
import type * as Models from './UserApiModels';

export class UserApi extends BaseApi {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }
  
  public async getUser(overrides?: { data?: any; params?: Models.GetUserQuery }) {
    const requestData = overrides?.data || {};
    const requestParams = overrides?.params || {} as Models.GetUserQuery;
    const response = await this.get('/users', requestData, { params: requestParams });
    await this.expectStatus(response, 200);
    return response;
  }

  public async createUser(overrides?: { data?: Models.CreateUserRequest; params?: any }) {
    const requestData = overrides?.data || {} as Models.CreateUserRequest;
    const requestParams = overrides?.params || {};
    const response = await this.post('/users', requestData, { params: requestParams });
    await this.expectStatus(response, 201);
    return response;
  }

  public async updateUser(overrides?: { data?: Models.UpdateUserRequest; params?: Models.UpdateUserQuery }) {
    const requestData = overrides?.data || {} as Models.UpdateUserRequest;
    const requestParams = overrides?.params || {} as Models.UpdateUserQuery;
    const response = await this.put('/users', requestData, { params: requestParams });
    await this.expectStatus(response, 200);
    return response;
  }

  public async deleteUser(overrides?: { data?: any; params?: Models.DeleteUserQuery }) {
    const requestData = overrides?.data || {};
    const requestParams = overrides?.params || {} as Models.DeleteUserQuery;
    const response = await this.delete('/users', requestData, { params: requestParams });
    await this.expectStatus(response, 204);
    return response;
  }
}
