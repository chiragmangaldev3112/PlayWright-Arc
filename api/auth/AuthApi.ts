
import { BaseApi } from '../base-api';
import type { APIRequestContext } from '@playwright/test';
import type * as Models from './AuthApiModels';

export class AuthApi extends BaseApi {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }
  
  public async login(overrides?: { data?: Models.LoginRequest; params?: any }) {
    const requestData = overrides?.data || {} as Models.LoginRequest;
    const requestParams = overrides?.params || {};
    const response = await this.post('/auth', requestData, { params: requestParams });
    await this.expectStatus(response, 200);
    return response;
  }
}
