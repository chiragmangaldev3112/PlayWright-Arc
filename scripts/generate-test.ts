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
// i18n Helper
// ========================
const LOCALE_DIR = path.join(process.cwd(), 'locales');
const LOCALE_FILE = path.join(LOCALE_DIR, 'en.json');

function ensureLocaleDir() {
  if (!fs.existsSync(LOCALE_DIR)) fs.mkdirSync(LOCALE_DIR, { recursive: true });
}

function loadI18n(): Record<string, any> {
  ensureLocaleDir();
  if (!fs.existsSync(LOCALE_FILE)) fs.writeFileSync(LOCALE_FILE, '{}', 'utf-8');
  return JSON.parse(fs.readFileSync(LOCALE_FILE, 'utf-8'));
}

function saveI18n(data: Record<string, any>) {
  fs.writeFileSync(LOCALE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

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
function generateModels(api: ApiDefinition) {
  const interfaces: Record<string, Record<string, any>> = {};
  const validationMap: Record<string, Array<{ data: string; params: string }>> = {};

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
function generateTestFile(
  api: ApiDefinition,
  validationMap: Record<string, Array<{ data: string; params: string }>>
) {
  const folderPath = api.folder ? `${api.folder}/` : '';
  const imports = `import { test, expect } from '@playwright/test';
import { ${api.pageName} } from '@api/${folderPath}${api.pageName}';
import type * as Models from '@api/${folderPath}${api.pageName}Models';
import { I18n } from '@utils/i18n/i18n';

`;

  const tests: string[] = [];

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

    tests.push(`test('${mainTags}${tc.description}', async ({ request }) => {
  const api = new ${api.pageName}(request);
  const response = await ${methodCall};
  const data = await response.json();
  console.log(data);
});
`);

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

        tests.push(`test('${valTags}${tc.description} - ${val.description}', async ({ request }) => {
  const api = new ${api.pageName}(request);
  const response = await ${valMethodCall};
  await api.expectStatus(response, ${val.expectStatus});
  ${val.messageKey ? `const json = await response.json(); expect(json.message || json.error).toContain(I18n.t('${val.messageKey}'));` : ''}
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
function writeFiles(api: ApiDefinition) {
  const apiFolder = path.join('api', api.folder || '');
  const testFolder = path.join('test/api', api.folder || '');
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
