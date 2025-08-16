/**
 * Date and Time Helper Utilities
 * 
 * Provides comprehensive date/time formatting, manipulation, and validation
 * utilities for test automation framework.
 */

import { logger } from '@utils/core/logger';

/**
 * Date format options
 */
export interface DateFormatOptions {
  format?: 'ISO' | 'US' | 'EU' | 'CUSTOM';
  includeTime?: boolean;
  timezone?: string;
  customFormat?: string;
}

/**
 * Date Helper Class
 * Provides comprehensive date and time utilities
 */
export class DateHelpers {
  private static instance: DateHelpers;

  private constructor() {}

  public static getInstance(): DateHelpers {
    if (!DateHelpers.instance) {
      DateHelpers.instance = new DateHelpers();
    }
    return DateHelpers.instance;
  }

  // =============================================================================
  // DATE FORMATTING METHODS
  // =============================================================================

  /**
   * Format date to string with various options
   * @param date - Date to format
   * @param format - Format string
   * @param timezone - Timezone
   * @returns Formatted date string
   */
  public formatDate(date: Date, format: string = 'YYYY-MM-DD', timezone?: string): string {
    try {
      // Handle timezone if specified
      let targetDate = date;
      if (timezone) {
        // Create date in specified timezone
        const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
        const timeZoneOffset = this.getTimezoneOffset(timezone);
        targetDate = new Date(utcTime + (timeZoneOffset * 60000));
      }

      const dateObj = new Date(targetDate);
      
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date provided');
      }

      // Check if it's a custom format pattern
      if (format.includes('YYYY') || format.includes('MM') || format.includes('DD')) {
        return this.applyCustomFormat(dateObj, format, timezone || 'UTC');
      }

      const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      };

      switch (format) {
        case 'ISO':
          return dateObj.toISOString();
        
        case 'US':
          formatOptions.month = '2-digit';
          formatOptions.day = '2-digit';
          return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
        
        case 'EU':
          return new Intl.DateTimeFormat('en-GB', formatOptions).format(dateObj);
        
        default:
          return dateObj.toLocaleDateString('en-US', formatOptions);
      }
    } catch (error) {
      logger.error('Date formatting failed', { date, format, timezone, error });
      return date.toString();
    }
  }

  /**
   * Get current timestamp in various formats
   * @param format - Timestamp format
   * @returns Formatted timestamp
   */
  public getCurrentTimestamp(format: 'unix' | 'iso' | 'readable' = 'iso'): string | number {
    const now = new Date();
    
    switch (format) {
      case 'unix':
        return Math.floor(now.getTime() / 1000);
      case 'iso':
        return now.toISOString();
      case 'readable':
        return this.formatDate(now, 'MM/DD/YYYY HH:mm:ss');
      default:
        return now.toISOString();
    }
  }

  /**
   * Generate test-friendly timestamp for file names
   * @returns Timestamp string safe for file names
   */
  public getFileTimestamp(): string {
    const now = new Date();
    return now.toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .replace('T', '_')
      .slice(0, -5); // Remove milliseconds and Z
  }

  // =============================================================================
  // DATE MANIPULATION METHODS
  // =============================================================================

  /**
   * Add time to a date
   * @param date - Base date
   * @param amount - Amount to add
   * @param unit - Time unit
   * @returns New date with added time
   */
  public addTime(date: Date, amount: number, unit: 'days' | 'hours' | 'minutes' | 'seconds'): Date {
    const newDate = new Date(date);
    
    switch (unit) {
      case 'days':
        newDate.setDate(newDate.getDate() + amount);
        break;
      case 'hours':
        newDate.setHours(newDate.getHours() + amount);
        break;
      case 'minutes':
        newDate.setMinutes(newDate.getMinutes() + amount);
        break;
      case 'seconds':
        newDate.setSeconds(newDate.getSeconds() + amount);
        break;
    }
    
    return newDate;
  }

  /**
   * Get date range for testing
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Array of dates in range
   */
  public getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  /**
   * Get relative date (e.g., "yesterday", "next week")
   * @param relativeTo - Base date
   * @param relation - Relative time description
   * @returns Calculated date
   */
  public getRelativeDate(relativeTo: Date = new Date(), relation: string): Date {
    const baseDate = new Date(relativeTo);
    
    switch (relation.toLowerCase()) {
      case 'yesterday':
        return this.addTime(baseDate, -1, 'days');
      case 'tomorrow':
        return this.addTime(baseDate, 1, 'days');
      case 'last week':
        return this.addTime(baseDate, -7, 'days');
      case 'next week':
        return this.addTime(baseDate, 7, 'days');
      case 'last month':
        baseDate.setMonth(baseDate.getMonth() - 1);
        return baseDate;
      case 'next month':
        baseDate.setMonth(baseDate.getMonth() + 1);
        return baseDate;
      default:
        return baseDate;
    }
  }

  // =============================================================================
  // DATE VALIDATION METHODS
  // =============================================================================

  /**
   * Validate if string is a valid date
   * @param dateString - Date string to validate
   * @returns True if valid date
   */
  public isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString.slice(0, 10);
  }

  /**
   * Check if date is in the past
   * @param date - Date to check
   * @returns True if date is in the past
   */
  public isPastDate(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Check if date is in the future
   * @param date - Date to check
   * @returns True if date is in the future
   */
  public isFutureDate(date: Date): boolean {
    return date > new Date();
  }

  /**
   * Check if date is within a range
   * @param date - Date to check
   * @param startDate - Range start
   * @param endDate - Range end
   * @returns True if date is within range
   */
  public isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get timezone offset in minutes
   * @param timezone - Timezone string
   * @returns Offset in minutes
   */
  private getTimezoneOffset(timezone: string): number {
    // This is a simplified implementation
    // In production, you might want to use a library like date-fns-tz
    const timezoneOffsets: Record<string, number> = {
      'UTC': 0,
      'EST': -5 * 60,
      'PST': -8 * 60,
      'GMT': 0,
    };
    
    return timezoneOffsets[timezone] || 0;
  }

  /**
   * Apply custom date format
   * @param date - Date to format
   * @param format - Custom format string
   * @param timezone - Timezone
   * @returns Formatted date string
   */
  private applyCustomFormat(date: Date, format: string, _timezone: string): string {
    // Parse custom format and apply
    let formatted = format;
    formatted = formatted.replace(/YYYY/g, date.getFullYear().toString());
    formatted = formatted.replace(/MM/g, (date.getMonth() + 1).toString().padStart(2, '0'));
    formatted = formatted.replace(/DD/g, date.getDate().toString().padStart(2, '0'));
    formatted = formatted.replace(/HH/g, date.getHours().toString().padStart(2, '0'));
    formatted = formatted.replace(/mm/g, date.getMinutes().toString().padStart(2, '0'));
    formatted = formatted.replace(/ss/g, date.getSeconds().toString().padStart(2, '0'));
    
    return formatted;
  }

  /**
   * Parse date from various string formats
   * @param dateString - Date string to parse
   * @returns Parsed date or null if invalid
   */
  public parseDate(dateString: string): Date | null {
    try {
      // Try parsing the date string directly first
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }

      return null;
    } catch (error) {
      logger.error('Date parsing failed', { dateString, error });
      return null;
    }
  }
}

// Export singleton instance
export const dateHelpers = DateHelpers.getInstance();
