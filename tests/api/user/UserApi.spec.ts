import { test, expect } from '@playwright/test';
import { UserApi } from '@api/user/UserApi';
import type * as Models from '@api/user/UserApiModels';
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
 * Test: Get user by ID
 * Method: GET
 * Expected Status: 200
 * Tags: @high, @ui, @smoke
 */
test('@high @ui @smoke Get user by ID', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.getUser({ 
  data: undefined,
  params: {
    "id": 1
  } as Models.GetUserQuery
});
  const data = await response.json();
  expectResponseValidation(data, {
  "structure": {
    "id": 1,
    "username": "string",
    "email": "string",
    "createdAt": "string"
  },
  "requiredKeys": [
    "id",
    "username",
    "email"
  ],
  "dataTypes": {
    "id": "number",
    "username": "string",
    "email": "string",
    "createdAt": "string"
  }
});

});

/**
 * Test: Get user by ID - Missing required parameter validation
 * Parameter: id
 * Expected Status: 400 (Bad Request)
 */
test('@high @ui @smoke Get user by ID - Missing required param: id', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.getUser({ 
  data: undefined,
  params: {
    "id": null
  } as Models.GetUserQuery
});
  await api.expectStatus(response, 400);
});

/**
 * Test: Get user by ID - Get user with invalid ID
 * Expected Status: 404
 * Message Key: error.userNotFound
 * Tags: @medium, @ui, @regression
 */
test('@medium @ui @regression Get user by ID - Get user with invalid ID', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.getUser({ 
  data: undefined,
  params: {
    "id": 99999
  } as Models.GetUserValidation1Query
});
  await api.expectStatus(response, 404);
  const data = await response.json();
  expectResponseValidation(data, {
  "structure": {
    "error": "string",
    "code": 404
  },
  "requiredKeys": [
    "error"
  ],
  "values": {
    "code": 404
  }
});

});

/**
 * Test: Create a new user
 * Method: POST
 * Expected Status: 201
 * Tags: @critical, @ui, @e2e
 */
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
  expectResponseValidation(data, {
  "structure": {
    "id": 1,
    "username": "string",
    "email": "string",
    "createdAt": "string"
  },
  "requiredKeys": [
    "id",
    "username",
    "email"
  ],
  "dataTypes": {
    "id": "number",
    "username": "string",
    "email": "string",
    "createdAt": "string"
  }
});
  await expectDatabaseValidation({
  "table": "users",
  "where": {
    "username": "{{requestData.username}}",
    "email": "{{requestData.email}}"
  },
  "expectedCount": 1,
  "compareWith": "requestData",
  "expectedData": {
    "username": "username",
    "email": "email",
    "status": "active"
  }
}, {
    "username": "string",
    "email": "string"
  } as Models.CreateUserRequest, data);
});

/**
 * Test: Create a new user - Missing required field validation
 * Field: username
 * Expected Status: 400 (Bad Request)
 */
test('@critical @ui @e2e Create a new user - Missing required field: username', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.createUser({ 
  data: {
    "username": null,
    "email": "string"
  } as Models.CreateUserRequest,
  params: undefined
});
  await api.expectStatus(response, 400);
});

/**
 * Test: Create a new user - Missing required field validation
 * Field: email
 * Expected Status: 400 (Bad Request)
 */
test('@critical @ui @e2e Create a new user - Missing required field: email', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.createUser({ 
  data: {
    "username": "string",
    "email": null
  } as Models.CreateUserRequest,
  params: undefined
});
  await api.expectStatus(response, 400);
});

/**
 * Test: Create a new user - Create user with missing email
 * Expected Status: 400
 * Message Key: error.missingEmail
 * Tags: @high, @ui, @regression
 */
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
  await expectDatabaseValidation({
  "table": "users",
  "where": {
    "username": "{{requestData.username}}"
  },
  "expectedCount": 0
}, {
    "username": "string",
    "email": null
  } as Models.CreateUserValidation1Request, data);
});

/**
 * Test: Update existing user
 * Method: PUT
 * Expected Status: 200
 * Tags: @high, @ui, @regression
 */
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
  expectResponseValidation(data, {
  "structure": {
    "id": 1,
    "username": "string",
    "email": "string",
    "createdAt": "string"
  },
  "requiredKeys": [
    "id",
    "username",
    "email"
  ],
  "dataTypes": {
    "id": "number",
    "username": "string",
    "email": "string",
    "createdAt": "string"
  }
});
  await expectDatabaseValidation({
  "table": "users",
  "where": {
    "id": "{{params.id}}"
  },
  "expectedCount": 1,
  "compareWith": "requestData",
  "expectedData": {
    "username": "username",
    "email": "email"
  },
  "fields": [
    "id",
    "username",
    "email",
    "updated_at"
  ]
}, {
    "username": "string",
    "email": "string"
  } as Models.UpdateUserRequest, data);
});

/**
 * Test: Update existing user - Missing required field validation
 * Field: username
 * Expected Status: 400 (Bad Request)
 */
test('@high @ui @regression Update existing user - Missing required field: username', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.updateUser({ 
  data: {
    "username": null,
    "email": "string"
  } as Models.UpdateUserRequest,
  params: {
    "id": 1
  } as Models.UpdateUserQuery
});
  await api.expectStatus(response, 400);
});

/**
 * Test: Update existing user - Missing required field validation
 * Field: email
 * Expected Status: 400 (Bad Request)
 */
test('@high @ui @regression Update existing user - Missing required field: email', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.updateUser({ 
  data: {
    "username": "string",
    "email": null
  } as Models.UpdateUserRequest,
  params: {
    "id": 1
  } as Models.UpdateUserQuery
});
  await api.expectStatus(response, 400);
});

/**
 * Test: Update existing user - Missing required parameter validation
 * Parameter: id
 * Expected Status: 400 (Bad Request)
 */
test('@high @ui @regression Update existing user - Missing required param: id', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.updateUser({ 
  data: {
    "username": "string",
    "email": "string"
  } as Models.UpdateUserRequest,
  params: {
    "id": null
  } as Models.UpdateUserQuery
});
  await api.expectStatus(response, 400);
});

/**
 * Test: Update existing user - Update user with invalid ID
 * Expected Status: 404
 * Message Key: error.userNotFound
 * Tags: @medium, @ui, @regression
 */
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
  const data = await response.json();
  expectResponseValidation(data, {
  "structure": {
    "error": "string",
    "code": 404
  },
  "requiredKeys": [
    "error"
  ],
  "values": {
    "code": 404
  }
});
  await expectDatabaseValidation({
  "table": "users",
  "where": {
    "id": "{{params.id}}"
  },
  "expectedCount": 0
}, {
    "username": "string",
    "email": "string"
  } as Models.UpdateUserRequest, data);
});

/**
 * Test: Delete user by ID
 * Method: DELETE
 * Expected Status: 204
 * Tags: @medium, @ui, @regression
 */
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
  await expectDatabaseValidation({
  "table": "users",
  "where": {
    "id": "{{params.id}}"
  },
  "expectedCount": 0
}, undefined, data);
});

/**
 * Test: Delete user by ID - Missing required parameter validation
 * Parameter: id
 * Expected Status: 400 (Bad Request)
 */
test('@medium @ui @regression Delete user by ID - Missing required param: id', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.deleteUser({ 
  data: undefined,
  params: {
    "id": null
  } as Models.DeleteUserQuery
});
  await api.expectStatus(response, 400);
});

/**
 * Test: Delete user by ID - Delete non-existent user
 * Expected Status: 404
 * Message Key: error.userNotFound
 * Tags: @low, @ui, @regression
 */
test('@low @ui @regression Delete user by ID - Delete non-existent user', async ({ request }) => {
  const api = new UserApi(request);
  const response = await api.deleteUser({ 
  data: undefined,
  params: {
    "id": 99999
  } as Models.DeleteUserValidation1Query
});
  await api.expectStatus(response, 404);
  const data = await response.json();
  expectResponseValidation(data, {
  "structure": {
    "error": "string",
    "code": 404
  },
  "requiredKeys": [
    "error"
  ],
  "values": {
    "code": 404
  }
});
  await expectDatabaseValidation({
  "table": "users",
  "where": {
    "id": "{{params.id}}"
  },
  "expectedCount": 0
}, undefined, data);
});
