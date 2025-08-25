
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
}
