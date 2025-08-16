/**
 * Enterprise Logger Utility
 * 
 * Provides structured logging capabilities for the automation framework
 * with different log levels, file output, and console formatting.
 */

import winston from 'winston';
import path from 'path';
import type { LogLevel, Logger as LoggerInterface } from '@types';
import { config } from '@config/config-loader';

/**
 * Custom log format for better readability
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      logMessage += `\nStack: ${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

/**
 * Console format for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss.SSS',
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;
    
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

/**
 * Logger Class Implementation
 */
export class Logger implements LoggerInterface {
  private winston: winston.Logger;
  private static instance: Logger;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    const logLevel = config.isVerboseLogging() ? 'verbose' : config.isDebugMode() ? 'debug' : 'info';
    const environment = config.getEnvironment();
    
    // Create logs directory if it doesn't exist
    const logsDir = path.resolve(process.cwd(), 'reports', 'logs');
    
    this.winston = winston.createLogger({
      level: logLevel,
      format: customFormat,
      defaultMeta: {
        service: 'playwright-automation-framework',
        environment: environment,
        pid: process.pid,
      },
      transports: [
        // File transport for all logs
        new winston.transports.File({
          filename: path.join(logsDir, 'automation.log'),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          tailable: true,
        }),
        
        // Separate file for errors
        new winston.transports.File({
          filename: path.join(logsDir, 'errors.log'),
          level: 'error',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 3,
          tailable: true,
        }),
        
        // Console transport for development
        new winston.transports.Console({
          format: consoleFormat,
          level: config.isCI() ? 'warn' : logLevel,
        }),
      ],
      
      // Handle uncaught exceptions and rejections
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'exceptions.log'),
        }),
      ],
      
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'rejections.log'),
        }),
      ],
      
      // Exit on handled exceptions
      exitOnError: false,
    });

    // Add request ID to logs if available
    this.winston.on('error', (error) => {
      console.error('Logger error:', error);
    });
  }

  /**
   * Get singleton instance of Logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log error message
   */
  public error(message: string, meta?: unknown): void {
    this.winston.error(message, this.formatMeta(meta));
  }

  /**
   * Log warning message
   */
  public warn(message: string, meta?: unknown): void {
    this.winston.warn(message, this.formatMeta(meta));
  }

  /**
   * Log info message
   */
  public info(message: string, meta?: unknown): void {
    this.winston.info(message, this.formatMeta(meta));
  }

  /**
   * Log debug message
   */
  public debug(message: string, meta?: unknown): void {
    this.winston.debug(message, this.formatMeta(meta));
  }

  /**
   * Log verbose message
   */
  public verbose(message: string, meta?: unknown): void {
    this.winston.verbose(message, this.formatMeta(meta));
  }

  /**
   * Log test step information
   */
  public step(stepName: string, details?: unknown): void {
    this.info(`STEP: ${stepName}`, details);
  }

  /**
   * Log test start
   */
  public testStart(testName: string, tags?: string[]): void {
    this.info(`TEST START: ${testName}`, { tags });
  }

  /**
   * Log test end
   */
  public testEnd(testName: string, status: string, duration: number): void {
    this.info(`TEST END: ${testName}`, { status, duration });
  }

  /**
   * Log API request
   */
  public apiRequest(method: string, url: string, data?: unknown): void {
    this.debug(`API REQUEST: ${method} ${url}`, { requestData: data });
  }

  /**
   * Log API response
   */
  public apiResponse(method: string, url: string, status: number, data?: unknown): void {
    this.debug(`API RESPONSE: ${method} ${url} - ${status}`, { responseData: data });
  }

  /**
   * Log page navigation
   */
  public pageNavigation(url: string, title?: string): void {
    this.debug(`PAGE NAVIGATION: ${url}`, { title });
  }

  /**
   * Log element interaction
   */
  public elementInteraction(action: string, selector: string, value?: unknown): void {
    this.debug(`ELEMENT ${action.toUpperCase()}: ${selector}`, { value });
  }

  /**
   * Log screenshot capture
   */
  public screenshot(path: string, reason?: string): void {
    this.info(`SCREENSHOT: ${path}`, { reason });
  }

  /**
   * Log performance metrics
   */
  public performance(metrics: Record<string, number>): void {
    this.info('PERFORMANCE METRICS', metrics);
  }

  /**
   * Log assertion
   */
  public assertion(description: string, expected: unknown, actual: unknown, passed: boolean): void {
    const level = passed ? 'debug' : 'warn';
    this.winston[level](`ASSERTION ${passed ? 'PASSED' : 'FAILED'}: ${description}`, {
      expected,
      actual,
    });
  }

  /**
   * Create a child logger with additional context
   */
  public child(context: Record<string, unknown>): Logger {
    const childLogger = new Logger();
    childLogger.winston = this.winston.child(context);
    return childLogger;
  }

  /**
   * Set log level dynamically
   */
  public setLevel(level: LogLevel): void {
    this.winston.level = level;
  }

  /**
   * Get current log level
   */
  public getLevel(): string {
    return this.winston.level;
  }

  /**
   * Flush all log transports
   */
  public async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.winston.on('finish', resolve);
      this.winston.end();
    });
  }

  // =============================================================================
  // PRIVATE UTILITY METHODS
  // =============================================================================

  /**
   * Format metadata for logging
   */
  private formatMeta(meta: unknown): Record<string, unknown> {
    if (!meta) return {};
    
    if (typeof meta === 'object' && meta !== null) {
      return meta as Record<string, unknown>;
    }
    
    return { data: meta };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export logger factory for test-specific loggers
export function createTestLogger(testName: string, testId?: string): Logger {
  return logger.child({
    testName,
    testId: testId || `test_${Date.now()}`,
    timestamp: new Date().toISOString(),
  });
}
