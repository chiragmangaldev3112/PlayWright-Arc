import fs from 'fs';
import path from 'path';

// ========================
// Types
// ========================
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ValidationCase {
  description: string;
  data?: Record<string, any>;
  params?: Record<string, any>;
  expectStatus: number;
  messageKey?: string;
  tags?: string[];
}

interface ApiCase {
  methodName: string;
  description: string;
  method?: HttpMethod;
  data?: Record<string, any>;
  params?: Record<string, any>;
  expectStatus: number;
  validations?: ValidationCase[];
  tags?: string[];
}

interface ApiDefinition {
  pageName: string;
  folder?: string;
  baseRoute: string;
  cases: ApiCase[];
}

// ========================
// i18n Helper (Integrated)
// ========================
const LOCALE_DIR = path.join(process.cwd(), 'locales');
const LOCALE_FILE = path.join(LOCALE_DIR, 'en.json');

function ensureLocaleDir() {
  if (!fs.existsSync(LOCALE_DIR)) fs.mkdirSync(LOCALE_DIR, { recursive: true });
}

function loadI18n(): Record<string, any> {
  ensureLocaleDir();
  if (!fs.existsSync(LOCALE_FILE)) {
    fs.writeFileSync(LOCALE_FILE, '{}', 'utf-8');
  }
  return JSON.parse(fs.readFileSync(LOCALE_FILE, 'utf-8'));
}

function saveI18n(data: Record<string, any>) {
  fs.writeFileSync(LOCALE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Add a key (supports dot notation) if missing
 */
function addI18nKey(key: string) {
    const i18n: Record<string, any> = loadI18n();
    const parts = key.split('.');
    let current: Record<string, any> = i18n;
  
    parts.forEach((part, index) => {
      if (!part) return; // skip empty parts just in case
  
      if (index === parts.length - 1) {
        // Last part: assign default value if missing
        if (!(part in current)) {
          current[part] = key;
        }
      } else {
        // Intermediate part: ensure it's an object
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
// Generate Unique Models
// ========================
function generateModels(api: ApiDefinition) {
  const interfaces: Record<string, Record<string, any>> = {};

  const addInterface = (name: string, data: Record<string, any>) => {
    if (!interfaces[name]) interfaces[name] = data;
  };

  const processCase = (tc: ApiCase) => {
    if (tc.data) addInterface(`${capitalize(tc.methodName)}Request`, tc.data);
    if (tc.params) addInterface(`${capitalize(tc.methodName)}Query`, tc.params);
    if (tc.validations) {
      tc.validations.forEach((val, idx) => {
        if (val.data) addInterface(`${capitalize(tc.methodName)}Validation${idx + 1}Request`, val.data);
        if (val.params) addInterface(`${capitalize(tc.methodName)}Validation${idx + 1}Query`, val.params);
      });
    }
  };

  api.cases.forEach(processCase);

  const modelLines: string[] = [];
  Object.entries(interfaces).forEach(([name, fields]) => {
    let body = '{\n';
    for (const key in fields) {
      const type = typeof fields[key];
      body += `  ${key}: ${type === 'number' ? 'number' : type === 'boolean' ? 'boolean' : 'string'};\n`;
    }
    body += '}';
    modelLines.push(`export interface ${name} ${body}`);
  });

  return { modelFileName: `${api.pageName}Models.ts`, content: modelLines.join('\n\n') };
}

// ========================
// Generate Page Class
// ========================
function generatePageClass(api: ApiDefinition) {
  const imports: string[] = [
    `import { BaseApi } from '../base-api';`,
    `import type { APIRequestContext } from '@playwright/test';`,
    `import type * as Models from './${api.pageName}Models';`
  ];

  const methods = api.cases.map(tc => {
    const dataType = tc.data ? `Models.${capitalize(tc.methodName)}Request` : 'any';
    const paramsType = tc.params ? `Models.${capitalize(tc.methodName)}Query` : 'any';
    const httpMethod = tc.method || 'POST';

    return `
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

export class ${api.pageName} extends BaseApi {
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
function generateTestFile(api: ApiDefinition) {
  const folderPath = api.folder ? `${api.folder}/` : '';
  const imports = `import { test, expect } from '@playwright/test';
import { ${api.pageName} } from '@api/${folderPath}${api.pageName}';
import type * as Models from '@api/${folderPath}${api.pageName}Models';
import { I18n } from '@utils/i18n/i18n';

`;

  let tests = '';

  api.cases.forEach((tc) => {
    // Main test case
    const mainTags = tc.tags ? tc.tags.join(' ') + ' ' : '';
  
    const methodCall = (tc.data || tc.params)
    ? `api.${tc.methodName}({ data: ${tc.data ? JSON.stringify(tc.data, null, 2) + ' as Models.' + capitalize(tc.methodName) + 'Request' : 'undefined'}, params: ${tc.params ? JSON.stringify(tc.params, null, 2) + ' as Models.' + capitalize(tc.methodName) + 'Query' : 'undefined'} })`
    : `api.${tc.methodName}()`;

    tests += `test('${mainTags}${tc.description}', async ({ request }) => {
  const api = new ${api.pageName}(request);
  const response = await ${methodCall};
  const data = await response.json();
  console.log(data);
});

`;

    // Validation test cases
    if (tc.validations) {
      tc.validations.forEach((val, idx) => {
        const valTags = val.tags ? val.tags.join(' ') + ' ' : '';
        const valDataType = val.data ? `Models.${capitalize(tc.methodName)}Validation${idx + 1}Request` : 'any';
        const valParamsType = val.params ? `Models.${capitalize(tc.methodName)}Validation${idx + 1}Query` : 'any';
        const valMethodCall = `api.${tc.methodName}({ data: ${val.data ? JSON.stringify(val.data, null, 2) + ' as ' + valDataType : 'undefined'}, params: ${val.params ? JSON.stringify(val.params, null, 2) + ' as ' + valParamsType : 'undefined'} })`;

        tests += `test('${valTags}${tc.description} - ${val.description}', async ({ request }) => {
  const api = new ${api.pageName}(request);
  const response = await ${valMethodCall};
  await api.expectStatus(response, ${val.expectStatus});
  ${val.messageKey ? `const json = await response.json(); expect(json.message || json.error).toContain(I18n.t('${val.messageKey}'));` : ''}
});

`;
      });
    }
  });

  return imports + tests;
}


// ========================
// Write Files
// ========================
function writeFiles(api: ApiDefinition) {
  const apiFolder = path.join('api', api.folder || '');
  const testFolder = path.join('test/api', api.folder || '');
  if (!fs.existsSync(apiFolder)) fs.mkdirSync(apiFolder, { recursive: true });
  if (!fs.existsSync(testFolder)) fs.mkdirSync(testFolder, { recursive: true });

  // Models
  const { modelFileName, content: modelContent } = generateModels(api);
  fs.writeFileSync(path.join(apiFolder, modelFileName), modelContent);

  // API Page
  fs.writeFileSync(path.join(apiFolder, `${api.pageName}.ts`), generatePageClass(api));

  // Test File
  fs.writeFileSync(path.join(testFolder, `${api.pageName}.spec.ts`), generateTestFile(api));

  console.log(`✅ Generated: ${api.pageName}`);
}

// ========================
// Utility
// ========================
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========================
// Main
// ========================
const testsFile = process.argv[2] || path.join('tests.json');
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
