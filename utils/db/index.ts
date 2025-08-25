import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'sqlite';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  filename?: string; // for SQLite
}

class DatabaseManager {
  private config: DatabaseConfig;
  private connection: any;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect() {
    switch (this.config.type) {
      case 'postgresql':
        this.connection = new Pool({
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.username,
          password: this.config.password,
        });
        break;

      case 'mysql':
        this.connection = await mysql.createConnection({
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.username,
          password: this.config.password,
        });
        break;

      case 'sqlite':
        this.connection = await open({
          filename: this.config.filename || this.config.database,
          driver: sqlite3.Database
        });
        break;
    }
  }

  async query(sql: string, params: any = {}) {
    if (!this.connection) {
      await this.connect();
    }

    try {
      let result;
      
      switch (this.config.type) {
        case 'postgresql':
          result = await this.connection.query(sql, Object.values(params));
          return result.rows;

        case 'mysql':
          const [rows] = await this.connection.execute(sql, Object.values(params));
          return rows;

        case 'sqlite':
          if (sql.toLowerCase().includes('select')) {
            return await this.connection.all(sql, params);
          } else {
            return await this.connection.run(sql, params);
          }
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async findOne(table: string, where: Record<string, any> = {}, fields: string[] = ['*']) {
    const whereClause = Object.keys(where).length > 0 
      ? `WHERE ${Object.keys(where).map(key => `${key} = ?`).join(' AND ')}`
      : '';
    
    const sql = `SELECT ${fields.join(', ')} FROM ${table} ${whereClause} LIMIT 1`;
    const result = await this.query(sql, Object.values(where));
    return result[0] || null;
  }

  async findMany(table: string, where: Record<string, any> = {}, fields: string[] = ['*']) {
    const whereClause = Object.keys(where).length > 0 
      ? `WHERE ${Object.keys(where).map(key => `${key} = ?`).join(' AND ')}`
      : '';
    
    const sql = `SELECT ${fields.join(', ')} FROM ${table} ${whereClause}`;
    return await this.query(sql, Object.values(where));
  }

  async count(table: string, where: Record<string, any> = {}) {
    const whereClause = Object.keys(where).length > 0 
      ? `WHERE ${Object.keys(where).map(key => `${key} = ?`).join(' AND ')}`
      : '';
    
    const sql = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
    const result = await this.query(sql, Object.values(where));
    return result[0].count;
  }

  async close() {
    if (this.connection) {
      switch (this.config.type) {
        case 'postgresql':
          await this.connection.end();
          break;
        case 'mysql':
          await this.connection.end();
          break;
        case 'sqlite':
          await this.connection.close();
          break;
      }
    }
  }
}

// Load database configuration from environment or config file
const dbConfig: DatabaseConfig = {
  type: (process.env.DB_TYPE as any) || 'sqlite',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'test.db',
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  filename: process.env.DB_FILE || './test.db'
};

export const db = new DatabaseManager(dbConfig);
export { DatabaseManager, DatabaseConfig };

// Database validation helper function for tests
export async function expectDatabaseValidation(validation: any, requestData?: any, responseData?: any) {
  if (!validation) return;
  
  const replaceTemplates = (str: string, requestData: any, responseData: any, params: any) => {
    return str
      .replace(/\{\{requestData\.(\w+)\}\}/g, (_, key) => requestData?.[key] || '')
      .replace(/\{\{responseData\.(\w+)\}\}/g, (_, key) => responseData?.[key] || '')
      .replace(/\{\{params\.(\w+)\}\}/g, (_, key) => params?.[key] || '');
  };

  let dbResult;
  if (validation.query) {
    // Custom query
    const processedQuery = replaceTemplates(validation.query, requestData, responseData, requestData);
    dbResult = await db.query(processedQuery);
  } else {
    // Table-based query
    const where: Record<string, any> = {};
    if (validation.where) {
      Object.entries(validation.where).forEach(([key, value]) => {
        if (typeof value === 'string' && value.includes('{{')) {
          where[key] = replaceTemplates(value as string, requestData, responseData, requestData);
        } else {
          where[key] = value;
        }
      });
    }
    
    const fields = validation.fields || ['*'];
    dbResult = await db.findMany(validation.table, where, fields);
  }

  // Import expect from @playwright/test
  const { expect } = await import('@playwright/test');

  // Validate count
  if (validation.expectedCount !== undefined) {
    expect(dbResult.length).toBe(validation.expectedCount);
  }

  // Validate data
  if (validation.expectedData && dbResult.length > 0) {
    const record = dbResult[0];
    
    if (validation.compareWith === 'requestData') {
      Object.entries(validation.expectedData).forEach(([dbField, requestField]) => {
        expect(record[dbField]).toBe(requestData[requestField as string]);
      });
    } else if (validation.compareWith === 'responseData') {
      Object.entries(validation.expectedData).forEach(([dbField, responseField]) => {
        expect(record[dbField]).toBe(responseData[responseField as string]);
      });
    } else if (validation.compareWith === 'customData') {
      Object.entries(validation.expectedData).forEach(([dbField, customValue]) => {
        expect(record[dbField]).toBe(validation.customData[customValue as string]);
      });
    } else {
      // Direct value comparison
      Object.entries(validation.expectedData).forEach(([dbField, expectedValue]) => {
        expect(record[dbField]).toBe(expectedValue);
      });
    }
  }
}
