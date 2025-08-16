/**
 * Format Helper Utilities
 * 
 * Provides comprehensive formatting utilities for numbers, strings, currency,
 * and other data types used in test automation.
 */

import { logger } from '@utils/core/logger';

/**
 * Number formatting options
 */
export interface NumberFormatOptions {
  decimals?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
  prefix?: string;
  suffix?: string;
  locale?: string;
}

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  symbol?: boolean;
}

/**
 * Format Helper Class
 * Provides comprehensive formatting utilities
 */
export class FormatHelpers {
  private static instance: FormatHelpers;

  private constructor() {}

  public static getInstance(): FormatHelpers {
    if (!FormatHelpers.instance) {
      FormatHelpers.instance = new FormatHelpers();
    }
    return FormatHelpers.instance;
  }

  // =============================================================================
  // NUMBER FORMATTING METHODS
  // =============================================================================

  /**
   * Format number with various options
   * @param value - Number to format
   * @param options - Formatting options
   * @returns Formatted number string
   */
  public formatNumber(value: number, options: NumberFormatOptions = {}): string {
    const {
      decimals = 2,
      thousandsSeparator = ',',
      decimalSeparator = '.',
      prefix = '',
      suffix = '',
      locale = 'en-US'
    } = options;

    try {
      if (isNaN(value)) {
        return 'NaN';
      }

      const formatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      let formatted = formatter.format(value);
      
      // Apply custom separators if different from locale defaults
      if (thousandsSeparator !== ',' || decimalSeparator !== '.') {
        formatted = formatted.replace(/,/g, '|||'); // Temporary replacement
        formatted = formatted.replace(/\./g, decimalSeparator);
        formatted = formatted.replace(/\|\|\|/g, thousandsSeparator);
      }

      return `${prefix}${formatted}${suffix}`;
    } catch (error) {
      logger.error('Number formatting failed', { value, options, error });
      return value.toString();
    }
  }

  /**
   * Format currency value
   * @param value - Currency value
   * @param options - Currency formatting options
   * @returns Formatted currency string
   */
  public formatCurrency(value: number, options: CurrencyFormatOptions = {}): string {
    const {
      currency = 'USD',
      locale = 'en-US',
      symbol = true
    } = options;

    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        currencyDisplay: symbol ? 'symbol' : 'code',
      });

      return formatter.format(value);
    } catch (error) {
      logger.error('Currency formatting failed', { value, options, error });
      return `${currency} ${value.toFixed(2)}`;
    }
  }

  /**
   * Format percentage value
   * @param value - Decimal value (0.1 = 10%)
   * @param decimals - Number of decimal places
   * @returns Formatted percentage string
   */
  public formatPercentage(value: number, decimals: number = 1): string {
    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      return formatter.format(value);
    } catch (error) {
      logger.error('Percentage formatting failed', { value, decimals, error });
      return `${(value * 100).toFixed(decimals)}%`;
    }
  }

  /**
   * Format file size in human readable format
   * @param bytes - Size in bytes
   * @param decimals - Number of decimal places
   * @returns Formatted file size string
   */
  public formatFileSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  }

  // =============================================================================
  // STRING FORMATTING METHODS
  // =============================================================================

  /**
   * Convert string to title case
   * @param str - String to convert
   * @returns Title case string
   */
  public toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Convert string to camelCase
   * @param str - String to convert
   * @returns camelCase string
   */
  public toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  }

  /**
   * Convert string to kebab-case
   * @param str - String to convert
   * @returns kebab-case string
   */
  public toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert string to snake_case
   * @param str - String to convert
   * @returns snake_case string
   */
  public toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  /**
   * Truncate string with ellipsis
   * @param str - String to truncate
   * @param length - Maximum length
   * @param suffix - Suffix to add (default: '...')
   * @returns Truncated string
   */
  public truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) {
      return str;
    }
    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Pad string to specified length
   * @param str - String to pad
   * @param length - Target length
   * @param padChar - Character to pad with
   * @param direction - Padding direction
   * @returns Padded string
   */
  public padString(
    str: string, 
    length: number, 
    padChar: string = ' ', 
    direction: 'left' | 'right' | 'both' = 'left'
  ): string {
    if (str.length >= length) {
      return str;
    }

    const padLength = length - str.length;
    const pad = padChar.repeat(padLength);

    switch (direction) {
      case 'left':
        return pad + str;
      case 'right':
        return str + pad;
      case 'both':
        const leftPad = Math.floor(padLength / 2);
        const rightPad = padLength - leftPad;
        return padChar.repeat(leftPad) + str + padChar.repeat(rightPad);
      default:
        return str;
    }
  }

  /**
   * Remove extra whitespace and normalize string
   * @param str - String to normalize
   * @returns Normalized string
   */
  public normalizeString(str: string): string {
    return str
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n');
  }

  // =============================================================================
  // VALIDATION FORMATTING METHODS
  // =============================================================================

  /**
   * Format phone number
   * @param phoneNumber - Raw phone number
   * @param format - Phone format ('US', 'INTERNATIONAL', 'DIGITS_ONLY')
   * @returns Formatted phone number
   */
  public formatPhoneNumber(phoneNumber: string, format: 'US' | 'INTERNATIONAL' | 'DIGITS_ONLY' = 'US'): string {
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    switch (format) {
      case 'DIGITS_ONLY':
        return digitsOnly;
      
      case 'US':
        if (digitsOnly.length === 10) {
          return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
        } else if (digitsOnly.length === 11 && digitsOnly[0] === '1') {
          return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
        }
        return phoneNumber;
      
      case 'INTERNATIONAL':
        if (digitsOnly.length >= 10) {
          return `+${digitsOnly.slice(0, -10)} ${digitsOnly.slice(-10, -7)} ${digitsOnly.slice(-7, -4)} ${digitsOnly.slice(-4)}`;
        }
        return phoneNumber;
      
      default:
        return phoneNumber;
    }
  }

  /**
   * Format email for display
   * @param email - Email address
   * @param maskDomain - Whether to mask domain
   * @returns Formatted email
   */
  public formatEmail(email: string, maskDomain: boolean = false): string {
    if (!email.includes('@')) {
      return email;
    }

    const [localPart, domain] = email.split('@');
    
    if (!domain) {
      return email;
    }
    
    if (maskDomain) {
      const domainParts = domain.split('.');
      const maskedDomain = domainParts.map((part, index) => 
        index === domainParts.length - 1 ? part : '*'.repeat(part.length)
      ).join('.');
      return `${localPart}@${maskedDomain}`;
    }

    return email.toLowerCase();
  }

  /**
   * Format credit card number for display
   * @param cardNumber - Credit card number
   * @param maskDigits - Whether to mask digits
   * @returns Formatted card number
   */
  public formatCreditCard(cardNumber: string, maskDigits: boolean = true): string {
    const digitsOnly = cardNumber.replace(/\D/g, '');
    
    if (maskDigits && digitsOnly.length >= 4) {
      const lastFour = digitsOnly.slice(-4);
      const masked = '*'.repeat(digitsOnly.length - 4);
      return `${masked}${lastFour}`.replace(/(.{4})/g, '$1 ').trim();
    }

    return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Generate random string for testing
   * @param length - String length
   * @param charset - Character set to use
   * @returns Random string
   */
  public generateRandomString(
    length: number, 
    charset: 'alphanumeric' | 'alpha' | 'numeric' | 'special' = 'alphanumeric'
  ): string {
    const charsets = {
      alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      numeric: '0123456789',
      special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    const chars = charsets[charset];
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Mask sensitive data for logging
   * @param data - Data to mask
   * @param visibleChars - Number of characters to show
   * @returns Masked data
   */
  public maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars) {
      return '*'.repeat(data.length);
    }
    
    const visible = data.slice(-visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + visible;
  }
}

// Export singleton instance
export const formatHelpers = FormatHelpers.getInstance();
