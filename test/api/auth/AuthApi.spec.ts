import { test, expect } from '@playwright/test';
import { AuthApi } from '@api/auth/AuthApi';
import type * as Models from '@api/auth/AuthApiModels';
import { I18n } from '@utils/i18n/i18n';

test('@critical @auth @smoke Login with valid credentials', async ({ request }) => {
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

test('@high @auth @regression Login with valid credentials - Login with empty username', async ({ request }) => {
  const api = new AuthApi(request);
  const response = await api.login({ 
  data: {
    "username": "",
    "password": "string"
  } as Models.LoginValidation1Request,
  params: undefined
});
  await api.expectStatus(response, 400);
  const json = await response.json(); expect(json.message || json.error).toContain(I18n.t('error.emptyUsername'));
});

test('@high @auth @regression Login with valid credentials - Login with empty password', async ({ request }) => {
  const api = new AuthApi(request);
  const response = await api.login({ 
  data: {
    "username": "string",
    "password": ""
  } as Models.LoginValidation2Request,
  params: undefined
});
  await api.expectStatus(response, 400);
  const json = await response.json(); expect(json.message || json.error).toContain(I18n.t('error.emptyPassword'));
});

test('@medium @auth @smoke Logout current user', async ({ request }) => {
  const api = new AuthApi(request);
  const response = await api.logout({ 
  data: undefined,
  params: undefined
});
  const data = await response.json();
  console.log(data);
});
