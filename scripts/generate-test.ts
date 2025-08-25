import fs from 'fs';
import path from 'path';

/**
 * @fileoverview Playwright API Test Generator
 * Generates TypeScript test files, API classes, and model interfaces from JSON configuration
 * 
 * @author Windsurf Engineering Team
 * @version 1.0.0
 */

// ========================
// Types
// ========================

/** HTTP methods supported by the API generator */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Configuration for response validation in tests
 * @interface ResponseValidation
 */
interface ResponseValidation {
  /** Expected object structure for response validation */
  structure?: Record<string, any>;
  /** Array of keys that must be present in response */
  requiredKeys?: string[];
  /** Array of keys that may be present in response */
  optionalKeys?: string[];
  /** Expected data types for specific fields */
  dataTypes?: Record<string, string>;
  /** Expected exact values for specific fields */
  values?: Record<string, any>;
  /** Validation rules for array responses */
  arrayValidation?: {
    /** Minimum array length */
    minLength?: number;
    /** Maximum array length */
    maxLength?: number;
    /** Expected structure for array items */
    itemStructure?: Record<string, any>;
  };
}

/**
 * Configuration for database validation in tests
 * @interface DatabaseValidation
 */
interface DatabaseValidation {
  /** Database table name to query */
  table: string;
  /** Custom SQL query (optional, overrides table-based query) */
  query?: string;
  /** WHERE clause conditions for table query */
  where?: Record<string, any>;
  /** Expected data values in database records */
  expectedData?: Record<string, any>;
  /** Expected number of records */
  expectedCount?: number;
  /** Specific fields to select from table */
  fields?: string[];
  /** Source of data for comparison */
  compareWith?: 'requestData' | 'responseData' | 'customData';
  /** Custom data for comparison when compareWith is 'customData' */
  customData?: Record<string, any>;
}

/**
 * Configuration for validation test cases
 * @interface ValidationCase
 */
interface ValidationCase {
  /** Description of the validation test case */
  description: string;
  /** Request data for validation test */
  data?: Record<string, any>;
  /** Request parameters for validation test */
  params?: Record<string, any>;
  /** Expected HTTP status code */
  expectStatus: number;
  /** i18n message key for error validation */
  messageKey?: string;
  /** Test tags for categorization */
  tags?: string[];
  /** Response validation configuration */
  expectedResponse?: ResponseValidation;
  /** Database validation configuration */
  databaseValidation?: DatabaseValidation;
}

/**
 * Configuration for API test cases
 * @interface ApiCase
 */
interface ApiCase {
  /** Method name for the API endpoint */
  methodName: string;
  /** Human-readable description of the test case */
  description: string;
  /** HTTP method (defaults to POST if not specified) */
  method?: HttpMethod;
  /** Request body data */
  data?: Record<string, any>;
  /** Request parameters (query params, path params) */
  params?: Record<string, any>;
  /** Expected HTTP status code for successful requests */
  expectStatus: number;
  /** Array of validation test cases */
  validations?: ValidationCase[];
  /** Test tags for categorization */
  tags?: string[];
  /** Required fields in request data */
  requiredFields?: string[];
  /** Required parameters in request */
  requiredParams?: string[];
  /** Response validation configuration */
  expectedResponse?: ResponseValidation;
  /** Database validation configuration */
  databaseValidation?: DatabaseValidation;
}

/**
 * Complete API definition for test generation
 * @interface ApiDefinition
 */
interface ApiDefinition {
  /** Name of the API page class */
  pageName: string;
  /** Optional folder for organizing API files */
  folder?: string;
  /** Base route for all API endpoints */
  baseRoute: string;
  /** Array of test cases for this API */
  cases: ApiCase[];
}

// ========================
// i18n Helper
// ========================

const LOCALE_DIR = path.join(process.cwd(), 'locales');
const LOCALE_FILE = path.join(LOCALE_DIR, 'en.json');

/**
 * Ensures the locale directory exists
 * @function ensureLocaleDir
 */
function ensureLocaleDir() {
  if (!fs.existsSync(LOCALE_DIR)) fs.mkdirSync(LOCALE_DIR, { recursive: true });
}

/**
 * Loads i18n data from locale file
 * @function loadI18n
 * @returns {Record<string, any>} i18n data object
 */
function loadI18n(): Record<string, any> {
  ensureLocaleDir();
  if (!fs.existsSync(LOCALE_FILE)) fs.writeFileSync(LOCALE_FILE, '{}', 'utf-8');
  return JSON.parse(fs.readFileSync(LOCALE_FILE, 'utf-8'));
}

/**
 * Saves i18n data to locale file
 * @function saveI18n
 * @param {Record<string, any>} data - i18n data to save
 */
function saveI18n(data: Record<string, any>) {
  fs.writeFileSync(LOCALE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Adds a new i18n key to the locale file
 * @function addI18nKey
 * @param {string} key - Dot-notation key to add (e.g., 'error.userNotFound')
 */
function addI18nKey(key: string) {
  const i18n: Record<string, any> = loadI18n();
  const parts = key.split('.');
  let current: Record<string, any> = i18n;

  parts.forEach((part, index) => {
    if (!part) return;
    if (index === parts.length - 1) {
      if (!(part in current)) current[part] = key;
    } else {
      if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {};
      }
      current = current[part];
    }
  });

  saveI18n(i18n);
}

// ========================
// Validation
// ========================

/**
 * Validates and normalizes API definition from JSON input
 * @function validateApi
 * @param {any} api - Raw API definition from JSON
 * @returns {ApiDefinition} Validated API definition
 * @throws {Error} When required fields are missing or invalid
 */
function validateApi(api: any): ApiDefinition {
  if (!api.pageName || !api.baseRoute || !api.cases) throw new Error('pageName, baseRoute, and cases are required');
  if (!Array.isArray(api.cases)) throw new Error('cases must be an array');

  api.cases.forEach((tc: any) => {
    if (!tc.methodName || !tc.description || !tc.expectStatus) {
      throw new Error('methodName, description, and expectStatus are required in each case');
    }
    if (tc.validations) {
      if (!Array.isArray(tc.validations)) throw new Error('validations must be an array');
      tc.validations.forEach((val: any) => {
        if (!val.description || !val.expectStatus) throw new Error('description and expectStatus are required in each validation');
        if (val.messageKey) addI18nKey(val.messageKey);
      });
    }
  });

  return api as ApiDefinition;
}

// ========================
// Generate Models
// ========================

/**
 * Generates TypeScript model interfaces from API definition
 * @function generateModels
 * @param {ApiDefinition} api - Validated API definition
 * @returns {Object} Generated models with filename, content, and validation mapping
 * @returns {string} returns.modelFileName - Generated model file name
 * @returns {string} returns.content - TypeScript interface definitions
 * @returns {Record<string, Array<{data: string, params: string}>>} returns.validationMap - Mapping of validation types
 */
function generateModels(api: ApiDefinition) {
  const interfaces: Record<string, Record<string, any>> = {};
  const validationMap: Record<string, Array<{ data: string; params: string }>> = {};

  /**
   * Adds a TypeScript interface to the collection
   * @param {string} name - Interface name
   * @param {Record<string, any>} data - Interface fields
   */
  const addInterface = (name: string, data: Record<string, any>) => {
    if (!interfaces[name]) interfaces[name] = data;
  };

  api.cases.forEach((tc) => {
    const mainDataName = tc.data ? `${capitalize(tc.methodName)}Request` : '';
    const mainParamsName = tc.params ? `${capitalize(tc.methodName)}Query` : '';

    if (tc.data) addInterface(mainDataName, tc.data);
    if (tc.params) addInterface(mainParamsName, tc.params);

    if (tc.validations) {
      if (!validationMap[tc.methodName]) validationMap[tc.methodName] = [];
      tc.validations.forEach((val, idx) => {
        let valDataName = 'any';
        let valParamsName = 'any';

        if (val.data) {
          valDataName =
            JSON.stringify(val.data) === JSON.stringify(tc.data)
              ? mainDataName
              : `${capitalize(tc.methodName)}Validation${idx + 1}Request`;
          addInterface(valDataName, val.data);
        }

        if (val.params) {
          valParamsName =
            JSON.stringify(val.params) === JSON.stringify(tc.params)
              ? mainParamsName
              : `${capitalize(tc.methodName)}Validation${idx + 1}Query`;
          addInterface(valParamsName, val.params);
        }

        validationMap[tc.methodName]?.push({ data: valDataName, params: valParamsName });
      });
    }
  });

  // Generate TypeScript interfaces with optional & nullable fields
  const modelLines: string[] = [];
  Object.entries(interfaces).forEach(([name, fields]) => {
    let body = '{\n';
    for (const key in fields) {
      const value = fields[key];
      let type: string;

      if (value === null) type = 'any | null'; // treat null as any | null
      else {
        const jsType = typeof value;
        type = jsType === 'number' ? 'number' : jsType === 'boolean' ? 'boolean' : 'string';
      }

      // Make field optional and nullable
      body += `  ${key}?: ${type} | null;\n`;
    }
    body += '}';
    modelLines.push(`export interface ${name} ${body}`);
  });

  return {
    modelFileName: `${api.pageName}Models.ts`,
    content: modelLines.join('\n\n'),
    validationMap,
  };
}

// ========================
// Generate Page Class
// ========================

/**
 * Generates Playwright API page class with methods for each endpoint
 * @function generatePageClass
 * @param {ApiDefinition} api - Validated API definition
 * @returns {string} Generated TypeScript class code
 */
function generatePageClass(api: ApiDefinition) {
  const imports = [
    `import { BaseApi } from '../base-api';`,
    `import type { APIRequestContext } from '@playwright/test';`,
    `import type * as Models from './${api.pageName}Models';`
  ];

  const methods = api.cases.map(tc => {
    const dataType = tc.data ? `Models.${capitalize(tc.methodName)}Request` : 'any';
    const paramsType = tc.params ? `Models.${capitalize(tc.methodName)}Query` : 'any';
    const httpMethod = tc.method || 'POST';

    return `
  /**
   * ${tc.description}
   * @param {Object} overrides - Optional data and parameter overrides
   * @param {${dataType}} overrides.data - Request body data
   * @param {${paramsType}} overrides.params - Request parameters
   * @returns {Promise<Response>} API response
   */
  public async ${tc.methodName}(overrides?: { data?: ${dataType}; params?: ${paramsType} }) {
    const requestData = overrides?.data || ${tc.data ? '{} as ' + dataType : '{}'};
    const requestParams = overrides?.params || ${tc.params ? '{} as ' + paramsType : '{}'};
    const response = await this.${httpMethod.toLowerCase()}('${api.baseRoute}', requestData, { params: requestParams });
    await this.expectStatus(response, ${tc.expectStatus});
    return response;
  }`;
  }).join('\n');

  return `
${imports.join('\n')}

/**
 * ${api.pageName} - API client for ${api.baseRoute} endpoints
 * @class ${api.pageName}
 * @extends {BaseApi}
 */
export class ${api.pageName} extends BaseApi {
  /**
   * Creates an instance of ${api.pageName}
   * @param {APIRequestContext} request - Playwright API request context
   * @param {string} [baseUrl] - Optional base URL override
   */
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }
  ${methods}
}
`;
}

// ========================
// Generate Test File
// ========================

/**
 * Generates Playwright test file with comprehensive test cases
 * @function generateTestFile
 * @param {ApiDefinition} api - Validated API definition
 * @param {Record<string, Array<{data: string, params: string}>>} validationMap - Validation type mapping
 * @returns {string} Generated TypeScript test file content
 */
function generateTestFile(
  api: ApiDefinition,
  validationMap: Record<string, Array<{ data: string; params: string }>>
) {
  const folderPath = api.folder ? `${api.folder}/` : '';
  const imports = `import { test, expect } from '@playwright/test';
import { ${api.pageName} } from '@api/${folderPath}${api.pageName}';
import type * as Models from '@api/${folderPath}${api.pageName}Models';
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

`;

  const tests: string[] = [];

  /**
   * Formats data object for TypeScript code generation
   * @param {any} data - Data object to format
   * @param {string} type - TypeScript type annotation
   * @returns {string} Formatted TypeScript code
   */
  const formatData = (data: any, type: string) => {
    if (!data) return 'undefined';
    const json = JSON.stringify(data, null, 2)
      .split('\n')
      .map((line, i) => (i === 0 ? line : `  ${line}`))
      .join('\n');
    return `${json} as ${type}`;
  };

  api.cases.forEach((tc) => {
    const mainTags = tc.tags ? tc.tags.join(' ') + ' ' : '';

    // Main test
    const dataStr = tc.data
      ? formatData(tc.data, `Models.${capitalize(tc.methodName)}Request`)
      : 'undefined';
    const paramsStr = tc.params
      ? formatData(tc.params, `Models.${capitalize(tc.methodName)}Query`)
      : 'undefined';

    const methodCall = `api.${tc.methodName}({ 
  data: ${dataStr},
  params: ${paramsStr}
})`;

    const responseValidation = tc.expectedResponse 
      ? `  const data = await response.json();
  expectResponseValidation(data, ${JSON.stringify(tc.expectedResponse, null, 2)});`
      : `  const data = await response.json();
  console.log(data);`;

    const databaseValidation = tc.databaseValidation 
      ? `  await expectDatabaseValidation(${JSON.stringify(tc.databaseValidation, null, 2)}, ${dataStr}, data);`
      : '';

    tests.push(`/**
 * Test: ${tc.description}
 * Method: ${tc.method || 'POST'}
 * Expected Status: ${tc.expectStatus}
 * Tags: ${tc.tags?.join(', ') || 'none'}
 */
test('${mainTags}${tc.description}', async ({ request }) => {
  const api = new ${api.pageName}(request);
  const response = await ${methodCall};
${responseValidation}
${databaseValidation}
});
`);

    // Required field tests
    if (tc.requiredFields && tc.data) {
      tc.requiredFields.forEach((field) => {
        const dataWithoutField = { ...tc.data };
        dataWithoutField[field] = null;
        
        const dataStr = formatData(dataWithoutField, `Models.${capitalize(tc.methodName)}Request`);
        
        const methodCall = `api.${tc.methodName}({ 
  data: ${dataStr},
  params: ${paramsStr}
})`;
        
        tests.push(`/**
 * Test: ${tc.description} - Missing required field validation
 * Field: ${field}
 * Expected Status: 400 (Bad Request)
 */
test('${mainTags}${tc.description} - Missing required field: ${field}', async ({ request }) => {
  const api = new ${api.pageName}(request);
  const response = await ${methodCall};
  await api.expectStatus(response, 400);
});
`);
      });
    }

    // Required parameter tests
    if (tc.requiredParams && tc.params) {
      tc.requiredParams.forEach((param) => {
        const paramsWithoutParam = { ...tc.params };
        paramsWithoutParam[param] = null;
        
        const paramsStr = formatData(paramsWithoutParam, `Models.${capitalize(tc.methodName)}Query`);
        
        const methodCall = `api.${tc.methodName}({ 
  data: ${dataStr},
  params: ${paramsStr}
})`;
        
        tests.push(`/**
 * Test: ${tc.description} - Missing required parameter validation
 * Parameter: ${param}
 * Expected Status: 400 (Bad Request)
 */
test('${mainTags}${tc.description} - Missing required param: ${param}', async ({ request }) => {
  const api = new ${api.pageName}(request);
  const response = await ${methodCall};
  await api.expectStatus(response, 400);
});
`);
      });
    }

    // Validation tests
    if (tc.validations) {
      tc.validations.forEach((val, idx) => {
        const valTags = val.tags ? val.tags.join(' ') + ' ' : '';

        const valDataType = validationMap[tc.methodName]?.[idx]?.data || 'any';
        const valParamsType = validationMap[tc.methodName]?.[idx]?.params || 'any';

        const valDataStr = val.data ? formatData(val.data, `Models.${valDataType}`) : 'undefined';
        const valParamsStr = val.params ? formatData(val.params, `Models.${valParamsType}`) : 'undefined';

        const valMethodCall = `api.${tc.methodName}({ 
  data: ${valDataStr},
  params: ${valParamsStr}
})`;

        const valResponseValidation = val.expectedResponse 
          ? `  const data = await response.json();
  expectResponseValidation(data, ${JSON.stringify(val.expectedResponse, null, 2)});`
          : val.messageKey 
          ? `  const json = await response.json(); 
  expect(json.message || json.error).toContain(I18n.t('${val.messageKey}'));`
          : '';

        const valDatabaseValidation = val.databaseValidation 
          ? `  await expectDatabaseValidation(${JSON.stringify(val.databaseValidation, null, 2)}, ${valDataStr}, data);`
          : '';

        tests.push(`/**
 * Test: ${tc.description} - ${val.description}
 * Expected Status: ${val.expectStatus}
 * Message Key: ${val.messageKey || 'none'}
 * Tags: ${val.tags?.join(', ') || 'none'}
 */
test('${valTags}${tc.description} - ${val.description}', async ({ request }) => {
  const api = new ${api.pageName}(request);
  const response = await ${valMethodCall};
  await api.expectStatus(response, ${val.expectStatus});
${valResponseValidation}
${valDatabaseValidation}
});
`);
      });
    }
  });

  return imports + tests.join('\n');
}

// ========================
// Write Files
// ========================

/**
 * Writes generated files to the filesystem
 * @function writeFiles
 * @param {ApiDefinition} api - Validated API definition
 */
function writeFiles(api: ApiDefinition) {
  const apiFolder = path.join('api', api.folder || '');
  const testFolder = path.join('tests/api', api.folder || '');
  if (!fs.existsSync(apiFolder)) fs.mkdirSync(apiFolder, { recursive: true });
  if (!fs.existsSync(testFolder)) fs.mkdirSync(testFolder, { recursive: true });

  const { modelFileName, content: modelContent, validationMap } = generateModels(api);

  fs.writeFileSync(path.join(apiFolder, modelFileName), modelContent);
  fs.writeFileSync(path.join(apiFolder, `${api.pageName}.ts`), generatePageClass(api));
  fs.writeFileSync(path.join(testFolder, `${api.pageName}.spec.ts`), generateTestFile(api, validationMap));

  console.log(`✅ Generated: ${api.pageName}`);
}

// ========================
// Utils
// ========================

/**
 * Capitalizes the first letter of a string
 * @function capitalize
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========================
// Main
// ========================

/**
 * Main execution function
 * Processes JSON test data file and generates API classes and tests
 */
const testsFile = process.argv[2] || path.join('data/test-data.json');
if (!fs.existsSync(testsFile)) {
  console.error(`File not found: ${testsFile}`);
  process.exit(1);
}

const rawData = fs.readFileSync(testsFile, 'utf-8');
const apis: any[] = JSON.parse(rawData);

apis.forEach(api => {
  try {
    const validApi = validateApi(api);
    writeFiles(validApi);
  } catch (err: any) {
    console.error('❌ Error generating API:', api.pageName, err.message);
  }
});
