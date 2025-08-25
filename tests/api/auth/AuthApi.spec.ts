import { test, expect } from '@playwright/test';
import { AuthApi } from '@api/auth/AuthApi';
import type * as Models from '@api/auth/AuthApiModels';
import { I18n } from '@utils/i18n/i18n';

test('Login with valid credentials', async ({ request }) => {
  const api = new AuthApi(request);
  const response = await api.login({ 
  data: {
    "username": "string",
    "password": "string"
  } as Models.LoginRequest,
  params: undefined
});
  const data = await response.json();
  console.log(data);
});

test('Login with valid credentials - Login with invalid password', async ({ request }) => {
  const api = new AuthApi(request);
  const response = await api.login({ 
  data: {
    "username": "testuser",
    "password": "wrongpass"
  } as Models.LoginValidation1Request,
  params: undefined
});
  await api.expectStatus(response, 401);
  const json = await response.json(); expect(json.message || json.error).toContain(I18n.t('error.invalidCredentials'));
});

test('Login with valid credentials - Login with missing username', async ({ request }) => {
  const api = new AuthApi(request);
  const response = await api.login({ 
  data: {
    "password": "somepass"
  } as Models.LoginValidation2Request,
  params: undefined
});
  await api.expectStatus(response, 400);
  const json = await response.json(); expect(json.message || json.error).toContain(I18n.t('error.usernameRequired'));
});
