/**
 * Network Helper Utilities
 * 
 * Provides comprehensive network utilities for connectivity checks,
 * HTTP requests, and network-related test automation tasks.
 */

import { logger } from '@utils/core/logger';

/**
 * Network connectivity check result
 */
export interface ConnectivityResult {
  isConnected: boolean;
  responseTime?: number;
  error?: string;
}

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string | object;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Network performance metrics
 */
export interface NetworkMetrics {
  responseTime: number;
  downloadSpeed?: number;
  uploadSpeed?: number;
  latency: number;
  jitter?: number;
}

/**
 * Network Helper Class
 * Provides comprehensive network utilities
 */
export class NetworkHelpers {
  private static instance: NetworkHelpers;

  private constructor() {}

  public static getInstance(): NetworkHelpers {
    if (!NetworkHelpers.instance) {
      NetworkHelpers.instance = new NetworkHelpers();
    }
    return NetworkHelpers.instance;
  }

  // =============================================================================
  // CONNECTIVITY CHECK METHODS
  // =============================================================================

  /**
   * Check internet connectivity
   * @param url - URL to check (default: Google DNS)
   * @param timeout - Timeout in milliseconds
   * @returns Connectivity result
   */
  public async checkConnectivity(
    url: string = 'https://8.8.8.8',
    timeout: number = 5000
  ): Promise<ConnectivityResult> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        isConnected: response.ok,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.warn('Connectivity check failed', { url, error });
      
      return {
        isConnected: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check multiple endpoints for connectivity
   * @param urls - Array of URLs to check
   * @param timeout - Timeout per request
   * @returns Array of connectivity results
   */
  public async checkMultipleEndpoints(
    urls: string[],
    timeout: number = 5000
  ): Promise<ConnectivityResult[]> {
    const checks = urls.map(url => this.checkConnectivity(url, timeout));
    return Promise.all(checks);
  }

  /**
   * Wait for network connectivity
   * @param maxWaitTime - Maximum wait time in milliseconds
   * @param checkInterval - Check interval in milliseconds
   * @returns True if connectivity is established
   */
  public async waitForConnectivity(
    maxWaitTime: number = 30000,
    checkInterval: number = 1000
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.checkConnectivity();
      
      if (result.isConnected) {
        logger.info('Network connectivity established', { 
          waitTime: Date.now() - startTime 
        });
        return true;
      }
      
      await this.delay(checkInterval);
    }
    
    logger.error('Network connectivity timeout', { maxWaitTime });
    return false;
  }

  // =============================================================================
  // HTTP REQUEST METHODS
  // =============================================================================

  /**
   * Make HTTP request with retry logic
   * @param url - Request URL
   * @param options - Request options
   * @returns Response data
   */
  public async makeRequest<T = any>(
    url: string,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
      retries = 3,
      retryDelay = 1000
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const requestOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal: controller.signal,
        };

        if (body) {
          requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let data: T;

        if (contentType?.includes('application/json')) {
          data = await response.json() as T;
        } else {
          data = await response.text() as unknown as T;
        }

        logger.info('HTTP request successful', {
          url,
          method,
          status: response.status,
          attempt
        });

        return data;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        logger.warn(`HTTP request failed (attempt ${attempt}/${retries})`, {
          url,
          method,
          error: lastError.message,
          attempt
        });

        if (attempt < retries) {
          await this.delay(retryDelay * attempt); // Exponential backoff
        }
      }
    }

    logger.error('HTTP request failed after all retries', {
      url,
      method,
      retries,
      error: lastError?.message
    });

    throw lastError || new Error('Request failed');
  }

  /**
   * Download file from URL
   * @param url - File URL
   * @param timeout - Timeout in milliseconds
   * @returns File content as buffer
   */
  public async downloadFile(url: string, timeout: number = 30000): Promise<Buffer> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Download failed: HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);

    } catch (error) {
      logger.error('File download failed', { url, error });
      throw error;
    }
  }

  // =============================================================================
  // NETWORK PERFORMANCE METHODS
  // =============================================================================

  /**
   * Measure network latency
   * @param url - URL to ping
   * @param samples - Number of samples to take
   * @returns Network metrics
   */
  public async measureLatency(
    url: string = 'https://www.google.com',
    samples: number = 5
  ): Promise<NetworkMetrics> {
    const measurements: number[] = [];

    for (let i = 0; i < samples; i++) {
      const startTime = performance.now();
      
      try {
        await fetch(url, { method: 'HEAD' });
        const endTime = performance.now();
        measurements.push(endTime - startTime);
      } catch (error) {
        logger.warn('Latency measurement failed', { url, sample: i + 1, error });
      }

      // Small delay between measurements
      if (i < samples - 1) {
        await this.delay(100);
      }
    }

    if (measurements.length === 0) {
      throw new Error('All latency measurements failed');
    }

    const avgLatency = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const jitter = this.calculateJitter(measurements);

    return {
      responseTime: avgLatency,
      latency: avgLatency,
      jitter,
    };
  }

  /**
   * Test download speed
   * @param testFileUrl - URL of test file
   * @param fileSizeBytes - Expected file size in bytes
   * @returns Download speed in Mbps
   */
  public async testDownloadSpeed(
    testFileUrl: string,
    fileSizeBytes: number
  ): Promise<number> {
    const startTime = performance.now();
    
    try {
      await this.downloadFile(testFileUrl);
      const endTime = performance.now();
      
      const durationSeconds = (endTime - startTime) / 1000;
      const speedBps = fileSizeBytes / durationSeconds;
      const speedMbps = (speedBps * 8) / (1024 * 1024); // Convert to Mbps
      
      logger.info('Download speed test completed', {
        fileSizeBytes,
        durationSeconds,
        speedMbps
      });
      
      return speedMbps;
    } catch (error) {
      logger.error('Download speed test failed', { testFileUrl, error });
      throw error;
    }
  }

  // =============================================================================
  // NETWORK MONITORING METHODS
  // =============================================================================

  /**
   * Monitor network connectivity continuously
   * @param interval - Check interval in milliseconds
   * @param callback - Callback function for connectivity changes
   * @returns Stop monitoring function
   */
  public startConnectivityMonitoring(
    interval: number = 5000,
    callback: (isConnected: boolean) => void
  ): () => void {
    let isMonitoring = true;
    let lastState: boolean | null = null;

    const monitor = async () => {
      while (isMonitoring) {
        try {
          const result = await this.checkConnectivity();
          
          if (lastState !== result.isConnected) {
            lastState = result.isConnected;
            callback(result.isConnected);
            
            logger.info('Network connectivity changed', {
              isConnected: result.isConnected,
              responseTime: result.responseTime
            });
          }
        } catch (error) {
          logger.error('Connectivity monitoring error', { error });
        }
        
        await this.delay(interval);
      }
    };

    monitor();

    // Return stop function
    return () => {
      isMonitoring = false;
      logger.info('Network connectivity monitoring stopped');
    };
  }

  /**
   * Check if specific port is open
   * @param host - Host to check
   * @param port - Port to check
   * @param timeout - Timeout in milliseconds
   * @returns True if port is open
   */
  public async isPortOpen(
    host: string,
    port: number,
    timeout: number = 5000
  ): Promise<boolean> {
    try {
      const url = `http://${host}:${port}`;
      const result = await this.checkConnectivity(url, timeout);
      return result.isConnected;
    } catch (error) {
      logger.warn('Port check failed', { host, port, error });
      return false;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Delay execution for specified milliseconds
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate jitter from latency measurements
   * @param measurements - Array of latency measurements
   * @returns Jitter value
   */
  private calculateJitter(measurements: number[]): number {
    if (measurements.length < 2) return 0;

    const differences: number[] = [];
    for (let i = 1; i < measurements.length; i++) {
      const current = measurements[i];
      const previous = measurements[i - 1];
      if (current !== undefined && previous !== undefined) {
        differences.push(Math.abs(current - previous));
      }
    }

    return differences.reduce((a, b) => a + b, 0) / differences.length;
  }

  /**
   * Parse URL and extract components
   * @param url - URL to parse
   * @returns URL components
   */
  public parseUrl(url: string): {
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
  } {
    try {
      const urlObj = new URL(url);
      return {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
      };
    } catch (error) {
      logger.error('URL parsing failed', { url, error });
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  /**
   * Build query string from parameters
   * @param params - Query parameters
   * @returns Query string
   */
  public buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    
    return searchParams.toString();
  }
}

// Export singleton instance
export const networkHelpers = NetworkHelpers.getInstance();
