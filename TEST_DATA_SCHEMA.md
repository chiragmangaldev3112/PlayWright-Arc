# Test Data Schema Documentation

This document explains the structure and usage of the `test-data.json` file for generating Playwright API tests with comprehensive response validation.

## Overview

The test data file contains an array of API definitions. Each API definition generates:
- TypeScript models for request/response data
- Page Object Model classes for API interactions
- Comprehensive test files with response validation

## Root Structure

```json
[
  {
    "pageName": "string",
    "folder": "string",
    "baseRoute": "string", 
    "cases": [...]
  }
]
```

## API Definition Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `pageName` | string | Name of the API class (e.g., "AuthApi", "UserApi") |
| `baseRoute` | string | Base URL path for all endpoints (e.g., "/auth", "/users") |
| `cases` | array | Array of test case definitions |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `folder` | string | Subfolder for organizing generated files (e.g., "auth", "user") |

## Test Case Structure

### Required Case Fields

| Field | Type | Description |
|-------|------|-------------|
| `methodName` | string | Method name for the API class (e.g., "login", "getUser") |
| `description` | string | Human-readable test description |
| `expectStatus` | number | Expected HTTP status code (200, 201, 400, 404, etc.) |

### Optional Case Fields

| Field | Type | Description |
|-------|------|-------------|
| `method` | string | HTTP method ("GET", "POST", "PUT", "DELETE"). Default: "POST" |
| `data` | object | Request body data for POST/PUT requests |
| `params` | object | Query parameters or path parameters |
| `tags` | array | Test tags for filtering (e.g., ["@smoke", "@critical"]) |
| `requiredFields` | array | Fields that must be present in request data |
| `requiredParams` | array | Parameters that must be present in request |
| `validations` | array | Additional validation test cases |
| `expectedResponse` | object | Response validation configuration |
| `databaseValidation` | object | Database state validation configuration |

## Response Validation Schema

The `expectedResponse` field supports comprehensive response validation:

### Structure Validation
```json
"expectedResponse": {
  "structure": {
    "token": "string",
    "user": {
      "id": 1,
      "username": "string"
    }
  }
}
```
Validates the overall shape of the response object.

### Required Keys
```json
"expectedResponse": {
  "requiredKeys": ["token", "user", "id"]
}
```
Ensures specified keys are present in the response.

### Data Type Validation
```json
"expectedResponse": {
  "dataTypes": {
    "id": "number",
    "username": "string",
    "isActive": "boolean"
  }
}
```
Validates field data types. Supported types: `string`, `number`, `boolean`, `object`.

### Exact Value Matching
```json
"expectedResponse": {
  "values": {
    "status": "success",
    "code": 200
  }
}
```
Validates exact field values.

### Array Validation
```json
"expectedResponse": {
  "arrayValidation": {
    "minLength": 1,
    "maxLength": 10,
    "itemStructure": {
      "id": "number",
      "name": "string"
    }
  }
}
```
Validates array responses with length constraints and item structure.

## Database Validation Schema

The `databaseValidation` field allows you to validate database state after API operations:

### Basic Database Validation
```json
"databaseValidation": {
  "table": "users",
  "where": {
    "id": "{{params.id}}"
  },
  "expectedCount": 1
}
```
Validates that exactly one record exists in the users table with the specified ID.

### Field-Specific Validation
```json
"databaseValidation": {
  "table": "users",
  "fields": ["id", "username", "email", "status"],
  "where": {
    "username": "{{requestData.username}}"
  },
  "expectedData": {
    "status": "active",
    "email_verified": true
  }
}
```
Validates specific field values in the database record.

### Data Comparison Validation
```json
"databaseValidation": {
  "table": "users",
  "where": {
    "id": "{{responseData.id}}"
  },
  "compareWith": "requestData",
  "expectedData": {
    "username": "username",
    "email": "email"
  }
}
```
Compares database values with request or response data.

### Custom Query Validation
```json
"databaseValidation": {
  "query": "SELECT COUNT(*) as count FROM user_sessions WHERE user_id = ? AND status = 'active'",
  "where": {
    "user_id": "{{responseData.id}}"
  },
  "expectedCount": 1
}
```
Uses custom SQL queries for complex validation scenarios.

### Database Validation Fields

| Field | Type | Description |
|-------|------|-------------|
| `table` | string | Database table name (required if no custom query) |
| `query` | string | Custom SQL query (optional, overrides table-based query) |
| `where` | object | WHERE clause conditions with template support |
| `expectedData` | object | Expected field values in the database record |
| `expectedCount` | number | Expected number of records returned |
| `fields` | array | Specific fields to select (default: all fields) |
| `compareWith` | string | Compare with 'requestData', 'responseData', or 'customData' |
| `customData` | object | Custom data for comparison when compareWith is 'customData' |

### Template Variables

Use template variables in `where` clauses and `expectedData`:

- `{{requestData.fieldName}}` - Values from request data
- `{{responseData.fieldName}}` - Values from response data  
- `{{params.paramName}}` - Values from request parameters
- `{{customData.fieldName}}` - Values from custom data object

## Validation Cases

Validation cases allow testing error scenarios and edge cases:

```json
"validations": [
  {
    "description": "Login with empty username",
    "data": { "username": "", "password": "string" },
    "expectStatus": 400,
    "messageKey": "error.emptyUsername",
    "tags": ["@regression"],
    "expectedResponse": {
      "structure": { "error": "string", "code": 400 },
      "values": { "code": 400 }
    },
    "databaseValidation": {
      "table": "user_sessions",
      "where": {
        "user_id": "{{requestData.username}}"
      },
      "expectedCount": 0
    }
  }
]
```

### Validation Case Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Description of the validation scenario |
| `expectStatus` | number | Expected HTTP status for this validation |
| `data` | object | Modified request data for this test |
| `params` | object | Modified parameters for this test |
| `messageKey` | string | i18n key for error message validation |
| `tags` | array | Test tags specific to this validation |
| `expectedResponse` | object | Response validation for this scenario |
| `databaseValidation` | object | Database state validation for this scenario |

## Complete Example

```json
{
  "pageName": "AuthApi",
  "folder": "auth",
  "baseRoute": "/auth",
  "cases": [
    {
      "methodName": "login",
      "description": "Login with valid credentials",
      "method": "POST",
      "data": {
        "username": "string",
        "password": "string"
      },
      "requiredFields": ["username", "password"],
      "expectStatus": 200,
      "tags": ["@critical", "@auth", "@smoke"],
      "expectedResponse": {
        "structure": {
          "token": "string",
          "user": {
            "id": 1,
            "username": "string"
          }
        },
        "requiredKeys": ["token", "user"],
        "dataTypes": {
          "token": "string",
          "user": "object"
        }
      },
      "databaseValidation": {
        "table": "user_sessions",
        "where": {
          "user_id": "{{responseData.user.id}}"
        },
        "expectedCount": 1,
        "expectedData": {
          "status": "active",
          "login_time": "recent"
        }
      },
      "validations": [
        {
          "description": "Login with empty username",
          "data": { "username": "", "password": "string" },
          "expectStatus": 400,
          "messageKey": "error.emptyUsername",
          "tags": ["@high", "@auth", "@regression"],
          "expectedResponse": {
            "structure": { "error": "string", "code": 400 },
            "requiredKeys": ["error"],
            "dataTypes": { "error": "string", "code": "number" },
            "values": { "code": 400 }
          },
          "databaseValidation": {
            "table": "user_sessions",
            "where": {
              "user_id": "{{requestData.username}}"
            },
            "expectedCount": 0
          }
        }
      ]
    }
  ]
}
```

## Generated Test Types

The generator creates several types of tests:

### 1. Main Test Cases
Tests the primary functionality with full response validation.

### 2. Required Field Tests
Automatically generated tests that remove each required field to test validation.

### 3. Required Parameter Tests
Automatically generated tests that remove each required parameter.

### 4. Validation Tests
Custom test cases defined in the `validations` array.

## Usage Instructions

1. **Create/Update** `data/test-data.json` with your API definitions
2. **Configure Database**: Set environment variables for database connection:
   ```bash
   DB_TYPE=postgresql  # or mysql, sqlite
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=test_db
   DB_USER=test_user
   DB_PASSWORD=test_password
   ```
3. **Run Generator**: `node --experimental-loader=ts-node/esm ./scripts/generate-test.ts ./data/test-data.json`
4. **Generated Files**:
   - `api/{folder}/{pageName}.ts` - API class
   - `api/{folder}/{pageName}Models.ts` - TypeScript interfaces
   - `tests/api/{folder}/{pageName}.spec.ts` - Test file with database validation

## Best Practices

### Response Validation
- Use `structure` for loose object shape validation
- Use `requiredKeys` to ensure critical fields exist
- Use `dataTypes` for type safety
- Use `values` for exact value matching (status codes, etc.)
- Combine multiple validation types for comprehensive testing

### Database Validation
- Use `expectedCount` to verify record creation/deletion
- Use `compareWith` to ensure API data matches database state
- Use `fields` to limit queries to relevant columns for performance
- Use template variables for dynamic value matching
- Combine database validation with response validation for end-to-end testing

### Test Organization
- Use descriptive `methodName` and `description` fields
- Organize related APIs using the `folder` field
- Use consistent tagging strategy (`@smoke`, `@regression`, `@critical`)
- Group validation scenarios logically

### Error Handling
- Always specify `expectStatus` for error cases
- Use `messageKey` for i18n error message validation
- Include `expectedResponse` for error response structure validation
- Use database validation to ensure failed operations don't affect database state

## Common Patterns

### Success Response Validation
```json
"expectedResponse": {
  "structure": { "id": 1, "name": "string", "email": "string" },
  "requiredKeys": ["id", "name", "email"],
  "dataTypes": { "id": "number", "name": "string", "email": "string" }
}
```

### Error Response Validation
```json
"expectedResponse": {
  "structure": { "error": "string", "code": 400 },
  "requiredKeys": ["error"],
  "values": { "code": 400 }
}
```

### No Response Body (204)
```json
"expectStatus": 204,
"expectedResponse": null
```

### Array Response
```json
"expectedResponse": {
  "arrayValidation": {
    "minLength": 0,
    "itemStructure": { "id": "number", "name": "string" }
  }
}
```

### Database State Validation Patterns

#### Create Operation
```json
"databaseValidation": {
  "table": "users",
  "where": { "email": "{{requestData.email}}" },
  "expectedCount": 1,
  "compareWith": "requestData",
  "expectedData": { "username": "username", "status": "active" }
}
```

#### Update Operation
```json
"databaseValidation": {
  "table": "users",
  "where": { "id": "{{params.id}}" },
  "compareWith": "requestData",
  "expectedData": { "username": "username", "email": "email" },
  "fields": ["id", "username", "email", "updated_at"]
}
```

#### Delete Operation
```json
"databaseValidation": {
  "table": "users",
  "where": { "id": "{{params.id}}" },
  "expectedCount": 0
}
```

#### Complex Validation
```json
"databaseValidation": {
  "query": "SELECT u.*, p.role FROM users u JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?",
  "where": { "id": "{{responseData.id}}" },
  "expectedData": { "role": "user", "status": "active" }
}
