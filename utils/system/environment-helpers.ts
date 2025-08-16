/**
 * Environment Helper Utilities
 * 
 * Provides comprehensive environment detection and configuration utilities
 * for test automation across different platforms and environments.
 */

import * as os from 'os';
import { logger } from '@utils/core/logger';

/**
 * Operating system types
 */
export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'unknown';

/**
 * Browser types
 */
export type BrowserType = 'chromium' | 'firefox' | 'webkit' | 'chrome' | 'edge' | 'safari' | 'unknown';

/**
 * Environment types
 */
export type EnvironmentType = 'development' | 'testing' | 'staging' | 'production' | 'local';

/**
 * Device types
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

/**
 * System information interface
 */
export interface SystemInfo {
  os: OperatingSystem;
  platform: string;
  arch: string;
  cpus: number;
  memory: {
    total: number;
    free: number;
    used: number;
  };
  uptime: number;
  nodeVersion: string;
  hostname: string;
  username: string;
}

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  type: EnvironmentType;
  isCI: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
  isTesting: boolean;
  variables: Record<string, string>;
}

/**
 * Environment Helper Class
 * Provides comprehensive environment utilities
 */
export class EnvironmentHelpers {
  private static instance: EnvironmentHelpers;
  private systemInfo: SystemInfo | null = null;
  private environmentConfig: EnvironmentConfig | null = null;

  private constructor() {}

  public static getInstance(): EnvironmentHelpers {
    if (!EnvironmentHelpers.instance) {
      EnvironmentHelpers.instance = new EnvironmentHelpers();
    }
    return EnvironmentHelpers.instance;
  }

  // =============================================================================
  // OPERATING SYSTEM DETECTION METHODS
  // =============================================================================

  /**
   * Get operating system type
   * @returns Operating system type
   */
  public getOperatingSystem(): OperatingSystem {
    const platform = os.platform();
    
    switch (platform) {
      case 'win32':
        return 'windows';
      case 'darwin':
        return 'macos';
      case 'linux':
        return 'linux';
      default:
        return 'unknown';
    }
  }

  /**
   * Check if running on Windows
   * @returns True if Windows
   */
  public isWindows(): boolean {
    return this.getOperatingSystem() === 'windows';
  }

  /**
   * Check if running on macOS
   * @returns True if macOS
   */
  public isMacOS(): boolean {
    return this.getOperatingSystem() === 'macos';
  }

  /**
   * Check if running on Linux
   * @returns True if Linux
   */
  public isLinux(): boolean {
    return this.getOperatingSystem() === 'linux';
  }

  /**
   * Get platform-specific path separator
   * @returns Path separator
   */
  public getPathSeparator(): string {
    return this.isWindows() ? '\\' : '/';
  }

  /**
   * Get platform-specific line ending
   * @returns Line ending
   */
  public getLineEnding(): string {
    return this.isWindows() ? '\r\n' : '\n';
  }

  // =============================================================================
  // SYSTEM INFORMATION METHODS
  // =============================================================================

  /**
   * Get comprehensive system information
   * @returns System information
   */
  public getSystemInfo(): SystemInfo {
    if (!this.systemInfo) {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      
      this.systemInfo = {
        os: this.getOperatingSystem(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: totalMemory - freeMemory,
        },
        uptime: os.uptime(),
        nodeVersion: process.version,
        hostname: os.hostname(),
        username: os.userInfo().username,
      };
      
      logger.debug('System information collected', this.systemInfo);
    }
    
    return this.systemInfo;
  }

  /**
   * Get memory usage information
   * @returns Memory usage in MB
   */
  public getMemoryUsage(): {
    total: number;
    free: number;
    used: number;
    percentage: number;
  } {
    const systemInfo = this.getSystemInfo();
    const totalMB = Math.round(systemInfo.memory.total / 1024 / 1024);
    const freeMB = Math.round(systemInfo.memory.free / 1024 / 1024);
    const usedMB = totalMB - freeMB;
    const percentage = Math.round((usedMB / totalMB) * 100);
    
    return {
      total: totalMB,
      free: freeMB,
      used: usedMB,
      percentage,
    };
  }

  /**
   * Get CPU information
   * @returns CPU information
   */
  public getCPUInfo(): {
    count: number;
    model: string;
    speed: number;
    architecture: string;
  } {
    const cpus = os.cpus();
    const systemInfo = this.getSystemInfo();
    
    return {
      count: cpus.length,
      model: cpus[0]?.model || 'Unknown',
      speed: cpus[0]?.speed || 0,
      architecture: systemInfo.arch,
    };
  }

  // =============================================================================
  // ENVIRONMENT DETECTION METHODS
  // =============================================================================

  /**
   * Get environment configuration
   * @returns Environment configuration
   */
  public getEnvironmentConfig(): EnvironmentConfig {
    if (!this.environmentConfig) {
      const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'development';
      const isCI = this.isCI();
      
      let type: EnvironmentType;
      if (nodeEnv === 'production') {
        type = 'production';
      } else if (nodeEnv === 'test' || nodeEnv === 'testing') {
        type = 'testing';
      } else if (nodeEnv === 'staging') {
        type = 'staging';
      } else if (nodeEnv === 'development') {
        type = 'development';
      } else {
        type = 'local';
      }
      
      this.environmentConfig = {
        type,
        isCI,
        isDevelopment: type === 'development',
        isProduction: type === 'production',
        isTesting: type === 'testing',
        variables: { ...process.env } as Record<string, string>,
      };
      
      logger.debug('Environment configuration detected', {
        type,
        isCI,
        nodeEnv
      });
    }
    
    return this.environmentConfig;
  }

  /**
   * Check if running in CI environment
   * @returns True if CI environment
   */
  public isCI(): boolean {
    const ciIndicators = [
      'CI',
      'CONTINUOUS_INTEGRATION',
      'BUILD_NUMBER',
      'JENKINS_URL',
      'GITHUB_ACTIONS',
      'GITLAB_CI',
      'TRAVIS',
      'CIRCLECI',
      'AZURE_PIPELINES',
      'TEAMCITY_VERSION',
    ];
    
    return ciIndicators.some(indicator => 
      process.env[indicator] === 'true' || 
      process.env[indicator] === '1' || 
      Boolean(process.env[indicator])
    );
  }

  /**
   * Get CI provider name
   * @returns CI provider name or null
   */
  public getCIProvider(): string | null {
    const providers = {
      'GITHUB_ACTIONS': 'GitHub Actions',
      'GITLAB_CI': 'GitLab CI',
      'TRAVIS': 'Travis CI',
      'CIRCLECI': 'CircleCI',
      'JENKINS_URL': 'Jenkins',
      'AZURE_PIPELINES': 'Azure Pipelines',
      'TEAMCITY_VERSION': 'TeamCity',
    };
    
    for (const [envVar, providerName] of Object.entries(providers)) {
      if (process.env[envVar]) {
        return providerName;
      }
    }
    
    return this.isCI() ? 'Unknown CI' : null;
  }

  /**
   * Check if running in development mode
   * @returns True if development
   */
  public isDevelopment(): boolean {
    return this.getEnvironmentConfig().isDevelopment;
  }

  /**
   * Check if running in production mode
   * @returns True if production
   */
  public isProduction(): boolean {
    return this.getEnvironmentConfig().isProduction;
  }

  /**
   * Check if running in testing mode
   * @returns True if testing
   */
  public isTesting(): boolean {
    return this.getEnvironmentConfig().isTesting;
  }

  // =============================================================================
  // BROWSER DETECTION METHODS
  // =============================================================================

  /**
   * Detect browser type from user agent
   * @param userAgent - User agent string
   * @returns Browser type
   */
  public detectBrowserFromUserAgent(userAgent: string): BrowserType {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('chrome') && !ua.includes('chromium') && !ua.includes('edge')) {
      return 'chrome';
    } else if (ua.includes('chromium')) {
      return 'chromium';
    } else if (ua.includes('firefox')) {
      return 'firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'safari';
    } else if (ua.includes('edge')) {
      return 'edge';
    } else if (ua.includes('webkit')) {
      return 'webkit';
    }
    
    return 'unknown';
  }

  /**
   * Detect device type from user agent
   * @param userAgent - User agent string
   * @returns Device type
   */
  public detectDeviceFromUserAgent(userAgent: string): DeviceType {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else if (ua.includes('desktop') || ua.includes('windows') || ua.includes('macintosh')) {
      return 'desktop';
    }
    
    return 'unknown';
  }

  // =============================================================================
  // ENVIRONMENT VARIABLE METHODS
  // =============================================================================

  /**
   * Get environment variable with default value
   * @param key - Environment variable key
   * @param defaultValue - Default value if not found
   * @returns Environment variable value
   */
  public getEnvVar(key: string, defaultValue?: string): string | undefined {
    const value = process.env[key];
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get required environment variable (throws if not found)
   * @param key - Environment variable key
   * @returns Environment variable value
   */
  public getRequiredEnvVar(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Get environment variable as boolean
   * @param key - Environment variable key
   * @param defaultValue - Default boolean value
   * @returns Boolean value
   */
  public getEnvVarAsBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }
    
    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  }

  /**
   * Get environment variable as number
   * @param key - Environment variable key
   * @param defaultValue - Default number value
   * @returns Number value
   */
  public getEnvVarAsNumber(key: string, defaultValue: number = 0): number {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }
    
    const numValue = parseInt(value, 10);
    return isNaN(numValue) ? defaultValue : numValue;
  }

  /**
   * Set environment variable
   * @param key - Environment variable key
   * @param value - Value to set
   */
  public setEnvVar(key: string, value: string): void {
    process.env[key] = value;
    logger.debug('Environment variable set', { key });
  }

  /**
   * Check if environment variable exists
   * @param key - Environment variable key
   * @returns True if exists
   */
  public hasEnvVar(key: string): boolean {
    return process.env[key] !== undefined;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get current working directory
   * @returns Current working directory
   */
  public getCurrentWorkingDirectory(): string {
    return process.cwd();
  }

  /**
   * Get home directory
   * @returns Home directory path
   */
  public getHomeDirectory(): string {
    return os.homedir();
  }

  /**
   * Get temporary directory
   * @returns Temporary directory path
   */
  public getTempDirectory(): string {
    return os.tmpdir();
  }

  /**
   * Get process information
   * @returns Process information
   */
  public getProcessInfo(): {
    pid: number;
    ppid: number;
    platform: string;
    arch: string;
    version: string;
    argv: string[];
    execPath: string;
    uptime: number;
  } {
    return {
      pid: process.pid,
      ppid: process.ppid || 0,
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      argv: process.argv,
      execPath: process.execPath,
      uptime: process.uptime(),
    };
  }

  /**
   * Generate environment report
   * @returns Comprehensive environment report
   */
  public generateEnvironmentReport(): {
    system: SystemInfo;
    environment: EnvironmentConfig;
    process: {
      pid: number;
      ppid: number;
      platform: string;
      arch: string;
      version: string;
      argv: string[];
      execPath: string;
      uptime: number;
    };
    memory: {
      total: number;
      free: number;
      used: number;
      percentage: number;
    };
    cpu: {
      count: number;
      model: string;
      speed: number;
      architecture: string;
    };
    ci: {
      isCI: boolean;
      provider: string | null;
    };
  } {
    return {
      system: this.getSystemInfo(),
      environment: this.getEnvironmentConfig(),
      process: this.getProcessInfo(),
      memory: this.getMemoryUsage(),
      cpu: this.getCPUInfo(),
      ci: {
        isCI: this.isCI(),
        provider: this.getCIProvider(),
      },
    };
  }

  /**
   * Check system requirements
   * @param requirements - System requirements to check
   * @returns Requirements check result
   */
  public checkSystemRequirements(requirements: {
    minMemoryMB?: number;
    minCPUs?: number;
    supportedOS?: OperatingSystem[];
    requiredEnvVars?: string[];
  }): {
    passed: boolean;
    failures: string[];
  } {
    const failures: string[] = [];
    const systemInfo = this.getSystemInfo();
    const memoryInfo = this.getMemoryUsage();

    // Check memory requirement
    if (requirements.minMemoryMB && memoryInfo.total < requirements.minMemoryMB) {
      failures.push(`Insufficient memory: ${memoryInfo.total}MB < ${requirements.minMemoryMB}MB required`);
    }

    // Check CPU requirement
    if (requirements.minCPUs && systemInfo.cpus < requirements.minCPUs) {
      failures.push(`Insufficient CPUs: ${systemInfo.cpus} < ${requirements.minCPUs} required`);
    }

    // Check OS requirement
    if (requirements.supportedOS && !requirements.supportedOS.includes(systemInfo.os)) {
      failures.push(`Unsupported OS: ${systemInfo.os} not in [${requirements.supportedOS.join(', ')}]`);
    }

    // Check required environment variables
    if (requirements.requiredEnvVars) {
      for (const envVar of requirements.requiredEnvVars) {
        if (!this.hasEnvVar(envVar)) {
          failures.push(`Missing required environment variable: ${envVar}`);
        }
      }
    }

    return {
      passed: failures.length === 0,
      failures,
    };
  }
}

// Export singleton instance
export const environmentHelpers = EnvironmentHelpers.getInstance();
