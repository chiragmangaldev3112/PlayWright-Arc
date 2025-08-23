import { test, expect } from '@playwright/test';
import { UserApi } from '@api/user/UserApi';
import type * as Models from '@api/user/UserApiModels';
import { I18n } from '@utils/i18n/i18n';

test('@high @ui @smoke Get user by ID', async ({ request }) => {
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

test('@medium @ui @regression Get user by ID - Get user with invalid ID', async ({ request }) => {
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

test('@critical @ui @e2e Create a new user', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.createUser({ 
  data: {
    "username": "string",
    "email": "string"
  } as Models.CreateUserRequest,
  params: undefined
});
  const data = await response.json();
  console.log(data);
});

test('@high @ui @regression Create a new user - Create user with missing email', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.createUser({ 
  data: {
    "username": "string",
    "email": null
  } as Models.CreateUserValidation1Request,
  params: undefined
});
  await api.expectStatus(response, 400);
  const json = await response.json(); expect(json.message || json.error).toContain(I18n.t('error.missingEmail'));
});

test('@high @ui @regression Update existing user', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.updateUser({ 
  data: {
    "username": "string",
    "email": "string"
  } as Models.UpdateUserRequest,
  params: {
    "id": 1
  } as Models.UpdateUserQuery
});
  const data = await response.json();
  console.log(data);
});

test('@medium @ui @regression Update existing user - Update user with invalid ID', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.updateUser({ 
  data: {
    "username": "string",
    "email": "string"
  } as Models.UpdateUserRequest,
  params: {
    "id": 99999
  } as Models.UpdateUserValidation1Query
});
  await api.expectStatus(response, 404);
  const json = await response.json(); expect(json.message || json.error).toContain(I18n.t('error.userNotFound'));
});

test('@medium @ui @regression Delete user by ID', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.deleteUser({ 
  data: undefined,
  params: {
    "id": 1
  } as Models.DeleteUserQuery
});
  const data = await response.json();
  console.log(data);
});

test('@low @ui @regression Delete user by ID - Delete non-existent user', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.deleteUser({ 
  data: undefined,
  params: {
    "id": 99999
  } as Models.DeleteUserValidation1Query
});
  await api.expectStatus(response, 404);
  const json = await response.json(); expect(json.message || json.error).toContain(I18n.t('error.userNotFound'));
});
