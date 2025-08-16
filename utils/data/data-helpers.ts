/**
 * Data Helpers Utility
 * 
 * Provides comprehensive test data management capabilities including
 * JSON/CSV loading, fake data generation, and dynamic test data creation.
 */

import fs from 'fs/promises';
import path from 'path';
import type { TestData, UserCredentials } from '@types';
import { UserRole } from '@types';
import { logger } from '@utils/core/logger';
import { config } from '@config/config-loader';

/**
 * Faker-like data generation interface
 */
interface FakeDataGenerator {
  name: {
    firstName(): string;
    lastName(): string;
    fullName(): string;
  };
  internet: {
    email(): string;
    userName(): string;
    password(): string;
    url(): string;
  };
  phone: {
    phoneNumber(): string;
  };
  address: {
    streetAddress(): string;
    city(): string;
    state(): string;
    zipCode(): string;
    country(): string;
  };
  company: {
    companyName(): string;
    jobTitle(): string;
  };
  lorem: {
    sentence(): string;
    paragraph(): string;
    words(count?: number): string;
  };
  datatype: {
    number(options?: { min?: number; max?: number }): number;
    boolean(): boolean;
    uuid(): string;
  };
  date: {
    recent(): Date;
    future(): Date;
    past(): Date;
  };
}

/**
 * Simple faker implementation for data generation
 */
class SimpleFaker implements FakeDataGenerator {
  name = {
    firstName: (): string => {
      const names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
      return names[Math.floor(Math.random() * names.length)] || 'John';
    },
    lastName: (): string => {
      const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
      return names[Math.floor(Math.random() * names.length)] || 'Doe';
    },
    fullName: (): string => `${this.name.firstName()} ${this.name.lastName()}`,
  };

  internet = {
    email: (): string => {
      const domains = ['example.com', 'test.com', 'demo.org'];
      const username = this.name.firstName().toLowerCase();
      const domain = domains[Math.floor(Math.random() * domains.length)];
      return `${username}${Math.floor(Math.random() * 1000)}@${domain}`;
    },
    userName: (): string => this.name.firstName().toLowerCase() + Math.floor(Math.random() * 1000),
    password: (): string => 'TestPassword' + Math.floor(Math.random() * 1000) + '!',
    url: (): string => {
      const domains = ['https://example.com', 'https://test.org', 'https://demo.net'];
      return domains[Math.floor(Math.random() * domains.length)] || 'https://example.com';
    },
  };

  phone = {
    phoneNumber: (): string => {
      const areaCode = Math.floor(Math.random() * 900) + 100;
      const exchange = Math.floor(Math.random() * 900) + 100;
      const number = Math.floor(Math.random() * 9000) + 1000;
      return `(${areaCode}) ${exchange}-${number}`;
    },
  };

  address = {
    streetAddress: (): string => {
      const streets = ['Main St', 'Oak Ave', 'First St', 'Second Ave', 'Park Rd', 'Elm St'];
      const number = Math.floor(Math.random() * 9999) + 1;
      const street = streets[Math.floor(Math.random() * streets.length)];
      return `${number} ${street}`;
    },
    city: (): string => {
      const cities = ['Springfield', 'Franklin', 'Riverside', 'Madison', 'Georgetown', 'Salem'];
      return cities[Math.floor(Math.random() * cities.length)] || 'Springfield';
    },
    state: (): string => {
      const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA'];
      return states[Math.floor(Math.random() * states.length)] || 'CA';
    },
    zipCode: (): string => String(Math.floor(Math.random() * 90000) + 10000),
    country: (): string => 'United States',
  };

  company = {
    companyName: (): string => {
      const prefixes = ['Tech', 'Global', 'Digital', 'Smart', 'Advanced'];
      const suffixes = ['Solutions', 'Systems', 'Corp', 'Inc', 'LLC'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      return `${prefix} ${suffix}`;
    },
    jobTitle: (): string => {
      const titles = ['Developer', 'Manager', 'Analyst', 'Coordinator', 'Specialist', 'Engineer'];
      return titles[Math.floor(Math.random() * titles.length)] || 'Developer';
    },
  };

  lorem = {
    sentence: (): string => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    paragraph: (): string =>
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    words: (count: number = 3): string => {
      const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
      return Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)])
        .join(' ');
    },
  };

  datatype = {
    number: (options?: { min?: number; max?: number }): number => {
      const min = options?.min || 0;
      const max = options?.max || 100;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    boolean: (): boolean => Math.random() < 0.5,
    uuid: (): string => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
  };

  date = {
    recent: (): Date => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    future: (): Date => new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
    past: (): Date => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
  };
}

/**
 * Data Helpers Class
 * Provides comprehensive test data management capabilities
 */
export class DataHelpers {
  private static instance: DataHelpers;
  private faker: FakeDataGenerator;
  private testDataCache: Map<string, TestData[]> = new Map();

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.faker = new SimpleFaker();
  }

  /**
   * Get singleton instance of DataHelpers
   */
  public static getInstance(): DataHelpers {
    if (!DataHelpers.instance) {
      DataHelpers.instance = new DataHelpers();
    }
    return DataHelpers.instance;
  }

  // =============================================================================
  // TEST DATA LOADING METHODS
  // =============================================================================

  /**
   * Load test data from JSON file
   * @param filePath - Path to JSON file
   * @returns Promise<TestData[]> - Array of test data
   */
  public async loadFromJson(filePath: string): Promise<TestData[]> {
    try {
      const absolutePath = path.resolve(process.cwd(), filePath);
      const fileContent = await fs.readFile(absolutePath, 'utf-8');
      const data = JSON.parse(fileContent);

      logger.debug(`Loaded test data from JSON: ${filePath}`, { recordCount: data.length });
      return this.validateTestData(data);
    } catch (error) {
      logger.error(`Failed to load test data from JSON: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Load test data from CSV file
   * @param filePath - Path to CSV file
   * @returns Promise<TestData[]> - Array of test data
   */
  public async loadFromCsv(filePath: string): Promise<TestData[]> {
    try {
      const absolutePath = path.resolve(process.cwd(), filePath);
      const fileContent = await fs.readFile(absolutePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
      }

      const headers = lines[0]!.split(',').map(h => h.trim());
      const testData: TestData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]!.split(',').map(v => v.trim());
        const dataObject: Record<string, unknown> = {};

        headers.forEach((header, index) => {
          dataObject[header] = values[index] || '';
        });

        testData.push({
          id: `csv_${i}`,
          scenario: `CSV Row ${i}`,
          data: dataObject,
        });
      }

      logger.debug(`Loaded test data from CSV: ${filePath}`, { recordCount: testData.length });
      return testData;
    } catch (error) {
      logger.error(`Failed to load test data from CSV: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Get test data based on configuration
   * @param scenario - Scenario name (optional)
   * @returns Promise<TestData[]> - Array of test data
   */
  public async getTestData(scenario?: string): Promise<TestData[]> {
    const testDataConfig = config.getTestDataConfig();
    const cacheKey = `${testDataConfig.source}_${testDataConfig.path}_${scenario || 'all'}`;

    // Check cache first
    if (this.testDataCache.has(cacheKey)) {
      const cachedData = this.testDataCache.get(cacheKey);
      if (cachedData) {
        logger.debug('Using cached test data', { scenario, recordCount: cachedData.length });
        return cachedData;
      }
    }

    let testData: TestData[] = [];

    switch (testDataConfig.source) {
      case 'json':
        testData = await this.loadFromJson(testDataConfig.path);
        break;
      case 'csv':
        testData = await this.loadFromCsv(testDataConfig.path);
        break;
      case 'faker':
        testData = this.generateFakeData(scenario);
        break;
      default:
        logger.warn(`Unknown test data source: ${testDataConfig.source}, using fake data`);
        testData = this.generateFakeData(scenario);
    }

    // Filter by scenario if specified
    if (scenario) {
      testData = testData.filter(data => data.scenario === scenario);
    }

    // Cache the data
    this.testDataCache.set(cacheKey, testData);

    return testData;
  }

  // =============================================================================
  // FAKE DATA GENERATION METHODS
  // =============================================================================

  /**
   * Generate fake test data
   * @param scenario - Scenario name (optional)
   * @param count - Number of records to generate (default: 5)
   * @returns TestData[] - Array of generated test data
   */
  public generateFakeData(scenario?: string, count: number = 5): TestData[] {
    const testData: TestData[] = [];

    for (let i = 0; i < count; i++) {
      testData.push({
        id: this.faker.datatype.uuid(),
        scenario: scenario || 'Generated Data',
        data: this.generateFakeUserData(),
      });
    }

    logger.debug('Generated fake test data', { scenario, count });
    return testData;
  }

  /**
   * Generate fake user data
   * @returns Record<string, unknown> - User data object
   */
  public generateFakeUserData(): Record<string, unknown> {
    return {
      firstName: this.faker.name.firstName(),
      lastName: this.faker.name.lastName(),
      fullName: this.faker.name.fullName(),
      email: this.faker.internet.email(),
      username: this.faker.internet.userName(),
      password: this.faker.internet.password(),
      phone: this.faker.phone.phoneNumber(),
      address: {
        street: this.faker.address.streetAddress(),
        city: this.faker.address.city(),
        state: this.faker.address.state(),
        zipCode: this.faker.address.zipCode(),
        country: this.faker.address.country(),
      },
      company: {
        name: this.faker.company.companyName(),
        jobTitle: this.faker.company.jobTitle(),
      },
      dateOfBirth: this.faker.date.past(),
      isActive: this.faker.datatype.boolean(),
      userId: this.faker.datatype.number({ min: 1000, max: 9999 }),
    };
  }

  /**
   * Generate fake API data
   * @param type - Type of API data to generate
   * @returns Record<string, unknown> - API data object
   */
  public generateFakeApiData(type: string): Record<string, unknown> {
    const baseData = {
      id: this.faker.datatype.number({ min: 1, max: 1000 }),
      createdAt: this.faker.date.recent().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    switch (type.toLowerCase()) {
      case 'user':
        return {
          ...baseData,
          ...this.generateFakeUserData(),
        };
      case 'post':
        return {
          ...baseData,
          title: this.faker.lorem.sentence(),
          body: this.faker.lorem.paragraph(),
          userId: this.faker.datatype.number({ min: 1, max: 100 }),
        };
      case 'comment':
        return {
          ...baseData,
          name: this.faker.name.fullName(),
          email: this.faker.internet.email(),
          body: this.faker.lorem.paragraph(),
          postId: this.faker.datatype.number({ min: 1, max: 100 }),
        };
      default:
        return baseData;
    }
  }

  // =============================================================================
  // USER CREDENTIALS METHODS
  // =============================================================================

  /**
   * Get user credentials for specific role
   * @param role - User role
   * @returns UserCredentials - User credentials
   */
  public getUserCredentials(role: UserRole): UserCredentials {
    try {
      return config.getUserCredentials(role);
    } catch (error) {
      logger.warn(`Could not load credentials for role ${role}, generating fake credentials`);
      return this.generateFakeCredentials(role);
    }
  }

  /**
   * Generate fake user credentials
   * @param role - User role
   * @returns UserCredentials - Generated credentials
   */
  public generateFakeCredentials(role: UserRole): UserCredentials {
    const firstName = this.faker.name.firstName();
    const lastName = this.faker.name.lastName();
    
    return {
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      password: `${role}Password123!`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      role,
    };
  }

  /**
   * Get all user credentials for different roles
   * @returns Record<UserRole, UserCredentials> - All user credentials
   */
  public getAllUserCredentials(): Record<UserRole, UserCredentials> {
    const credentials: Partial<Record<UserRole, UserCredentials>> = {};

    for (const role of Object.values(UserRole)) {
      credentials[role] = this.getUserCredentials(role);
    }

    return credentials as Record<UserRole, UserCredentials>;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Save test data to JSON file
   * @param data - Test data to save
   * @param filePath - Path to save the file
   * @returns Promise<void>
   */
  public async saveToJson(data: TestData[], filePath: string): Promise<void> {
    try {
      const absolutePath = path.resolve(process.cwd(), filePath);
      const jsonContent = JSON.stringify(data, null, 2);
      await fs.writeFile(absolutePath, jsonContent, 'utf-8');
      
      logger.info(`Saved test data to JSON: ${filePath}`, { recordCount: data.length });
    } catch (error) {
      logger.error(`Failed to save test data to JSON: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Clear test data cache
   */
  public clearCache(): void {
    this.testDataCache.clear();
    logger.debug('Test data cache cleared');
  }

  /**
   * Get random item from array
   * @param array - Array to select from
   * @returns T - Random item
   */
  public getRandomItem<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot get random item from empty array');
    }
    return array[Math.floor(Math.random() * array.length)]!;
  }

  /**
   * Get faker instance for custom data generation
   * @returns FakeDataGenerator - Faker instance
   */
  public getFaker(): FakeDataGenerator {
    return this.faker;
  }

  // =============================================================================
  // PRIVATE UTILITY METHODS
  // =============================================================================

  /**
   * Validate test data structure
   * @param data - Data to validate
   * @returns TestData[] - Validated test data
   */
  private validateTestData(data: unknown[]): TestData[] {
    return data.map((item, index) => {
      if (typeof item !== 'object' || item === null) {
        throw new Error(`Invalid test data at index ${index}: must be an object`);
      }

      const testDataItem = item as Record<string, unknown>;
      
      const result: TestData = {
        id: testDataItem.id?.toString() || `item_${index}`,
        scenario: testDataItem.scenario?.toString() || 'Default Scenario',
        data: testDataItem.data as Record<string, unknown> || testDataItem,
      };
      
      if (Array.isArray(testDataItem.tags)) {
        result.tags = testDataItem.tags as string[];
      }
      
      if (testDataItem.priority !== undefined) {
        result.priority = testDataItem.priority as any;
      }
      
      return result;
    });
  }
}

// Export singleton instance
export const dataHelpers = DataHelpers.getInstance();
