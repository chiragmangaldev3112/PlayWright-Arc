import { test, expect } from '@playwright/test';
import { AuthApi } from '@api/auth/AuthApi';
import type * as Models from '@api/auth/AuthApiModels';
import { I18n } from '@utils/i18n/i18n';
import { db, expectDatabaseValidation } from '@utils/db';

/**
 * Response validation helper function
 * Validates API response structure, data types, and values
 * @param {any} data - Response data to validate
 * @param {any} validation - Validation configuration object
 */
function expectResponseValidation(data: any, validation: any) {
  if (validation.structure) {
    expect(data).toEqual(expect.objectContaining(validation.structure));
  }
  if (validation.requiredKeys) {
    validation.requiredKeys.forEach((key: string) => {
      expect(data).toHaveProperty(key);
    });
  }
  if (validation.optionalKeys) {
    validation.optionalKeys.forEach((key: string) => {
      if (data.hasOwnProperty(key)) {
        expect(data).toHaveProperty(key);
      }
    });
  }
  if (validation.dataTypes) {
    Object.entries(validation.dataTypes).forEach(([key, type]) => {
      expect(typeof data[key]).toBe(type);
    });
  }
  if (validation.values) {
    Object.entries(validation.values).forEach(([key, value]) => {
      expect(data[key]).toBe(value);
    });
  }
  if (validation.arrayValidation && Array.isArray(data)) {
    if (validation.arrayValidation.minLength) {
      expect(data.length).toBeGreaterThanOrEqual(validation.arrayValidation.minLength);
    }
    if (validation.arrayValidation.maxLength) {
      expect(data.length).toBeLessThanOrEqual(validation.arrayValidation.maxLength);
    }
    if (validation.arrayValidation.itemStructure) {
      data.forEach((item: any) => {
        expect(item).toEqual(expect.objectContaining(validation.arrayValidation.itemStructure));
      });
    }
  }
}

/**
 * Test: Login with valid credentials
 * Method: POST
 * Expected Status: 200
 * Tags: @critical, @auth, @smoke
 */
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
  expectResponseValidation(data, {
  "structure": {
    "token": "string",
    "user": {
      "id": 1,
      "username": "string"
    }
  },
  "requiredKeys": [
    "token",
    "user"
  ],
  "dataTypes": {
    "token": "string",
    "user": "object"
  }
});

});

/**
 * Test: Login with valid credentials - Missing required field validation
 * Field: username
 * Expected Status: 400 (Bad Request)
 */
test('@critical @auth @smoke Login with valid credentials - Missing required field: username', async ({ request }) => {
  const api = new AuthApi(request);
  const response = await api.login({ 
  data: {
    "username": null,
    "password": "string"
  } as Models.LoginRequest,
  params: undefined
});
  await api.expectStatus(response, 400);
});

/**
 * Test: Login with valid credentials - Missing required field validation
 * Field: password
 * Expected Status: 400 (Bad Request)
 */
test('@critical @auth @smoke Login with valid credentials - Missing required field: password', async ({ request }) => {
  const api = new AuthApi(request);
  const response = await api.login({ 
  data: {
    "username": "string",
    "password": null
  } as Models.LoginRequest,
  params: undefined
});
  await api.expectStatus(response, 400);
});

/**
 * Test: Login with valid credentials - Login with empty username
 * Expected Status: 400
 * Message Key: error.emptyUsername
 * Tags: @high, @auth, @regression
 */
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
  const data = await response.json();
  expectResponseValidation(data, {
  "structure": {
    "error": "string",
    "code": 400
  },
  "requiredKeys": [
    "error"
  ],
  "dataTypes": {
    "error": "string",
    "code": "number"
  },
  "values": {
    "code": 400
  }
});

});

/**
 * Test: Login with valid credentials - Login with empty password
 * Expected Status: 400
 * Message Key: error.emptyPassword
 * Tags: @high, @auth, @regression
 */
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
  const data = await response.json();
  expectResponseValidation(data, {
  "structure": {
    "error": "string",
    "code": 400
  },
  "requiredKeys": [
    "error"
  ],
  "dataTypes": {
    "error": "string",
    "code": "number"
  }
});

});

/**
 * Test: Logout current user
 * Method: POST
 * Expected Status: 200
 * Tags: @medium, @auth, @smoke
 */
test('@medium @auth @smoke Logout current user', async ({ request }) => {
  const api = new AuthApi(request);
  const response = await api.logout({ 
  data: undefined,
  params: undefined
});
  const data = await response.json();
  console.log(data);

});
