import { test, expect } from '@playwright/test';
import { UserApi } from '@api/user/UserApi';
import type * as Models from '@api/user/UserApiModels';
import { I18n } from '@utils/i18n/i18n';

test('Get user by ID', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.getUser({ 
  data: undefined,
  params: {
    "id": 1
  } as Models.GetUserQuery
});
  const data = await response.json();
  console.log(data);
});

test('Get user by ID - Get user with invalid ID', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.getUser({ 
  data: undefined,
  params: {
    "id": 99999
  } as Models.GetUserValidation1Query
});
  await api.expectStatus(response, 404);
  const json = await response.json(); expect(json.message || json.error).toContain(I18n.t('error.userNotFound'));
});
