/**
 * Validation Helper Utilities
 * 
 * Provides comprehensive validation utilities for emails, phone numbers,
 * URLs, credit cards, and other common data types used in test automation.
 */

import { logger } from '@utils/core/logger';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Password strength requirements
 */
export interface PasswordRequirements {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  forbiddenPatterns?: string[];
}

/**
 * Validation Helper Class
 * Provides comprehensive validation utilities
 */
export class ValidationHelpers {
  private static instance: ValidationHelpers;

  private constructor() {}

  public static getInstance(): ValidationHelpers {
    if (!ValidationHelpers.instance) {
      ValidationHelpers.instance = new ValidationHelpers();
    }
    return ValidationHelpers.instance;
  }

  // =============================================================================
  // EMAIL VALIDATION METHODS
  // =============================================================================

  /**
   * Validate email address
   * @param email - Email to validate
   * @returns Validation result
   */
  public validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
      return { isValid: false, errors };
    }

    // Basic email regex pattern
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    // Additional checks
    if (email.length > 254) {
      errors.push('Email too long (max 254 characters)');
    }

    const [localPart, domain] = email.split('@');
    
    if (localPart && localPart.length > 64) {
      errors.push('Email local part too long (max 64 characters)');
    }

    if (domain && domain.length > 253) {
      errors.push('Email domain too long (max 253 characters)');
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      errors.push('Email cannot contain consecutive dots');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if email domain exists (basic validation)
   * @param email - Email to check
   * @returns True if domain appears valid
   */
  public isValidEmailDomain(email: string): boolean {
    const domain = email.split('@')[1];
    if (!domain) return false;

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  }

  // =============================================================================
  // PHONE NUMBER VALIDATION METHODS
  // =============================================================================

  /**
   * Validate phone number
   * @param phoneNumber - Phone number to validate
   * @param countryCode - Country code for validation
   * @returns Validation result
   */
  public validatePhoneNumber(phoneNumber: string, countryCode: string = 'US'): ValidationResult {
    const errors: string[] = [];
    
    if (!phoneNumber) {
      errors.push('Phone number is required');
      return { isValid: false, errors };
    }

    const digitsOnly = phoneNumber.replace(/\D/g, '');

    switch (countryCode.toUpperCase()) {
      case 'US':
        if (digitsOnly.length !== 10 && !(digitsOnly.length === 11 && digitsOnly[0] === '1')) {
          errors.push('US phone number must be 10 digits or 11 digits starting with 1');
        }
        break;
      
      case 'UK':
        if (digitsOnly.length < 10 || digitsOnly.length > 11) {
          errors.push('UK phone number must be 10-11 digits');
        }
        break;
      
      default:
        if (digitsOnly.length < 7 || digitsOnly.length > 15) {
          errors.push('Phone number must be 7-15 digits');
        }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // =============================================================================
  // URL VALIDATION METHODS
  // =============================================================================

  /**
   * Validate URL
   * @param url - URL to validate
   * @param requireHttps - Whether HTTPS is required
   * @returns Validation result
   */
  public validateUrl(url: string, requireHttps: boolean = false): ValidationResult {
    const errors: string[] = [];
    
    if (!url) {
      errors.push('URL is required');
      return { isValid: false, errors };
    }

    try {
      const urlObj = new URL(url);
      
      if (requireHttps && urlObj.protocol !== 'https:') {
        errors.push('HTTPS protocol is required');
      }
      
      if (!['http:', 'https:', 'ftp:', 'ftps:'].includes(urlObj.protocol)) {
        errors.push('Invalid protocol (must be http, https, ftp, or ftps)');
      }
      
      if (!urlObj.hostname) {
        errors.push('Invalid hostname');
      }
      
    } catch (error) {
      errors.push('Invalid URL format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // =============================================================================
  // PASSWORD VALIDATION METHODS
  // =============================================================================

  /**
   * Validate password strength
   * @param password - Password to validate
   * @param requirements - Password requirements
   * @returns Validation result with strength score
   */
  public validatePassword(password: string, requirements: PasswordRequirements = {}): ValidationResult & { strength: number } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let strength = 0;

    const {
      minLength = 8,
      maxLength = 128,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
      forbiddenPatterns = []
    } = requirements;

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors, warnings, strength: 0 };
    }

    // Length validation
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    } else {
      strength += 1;
    }

    if (password.length > maxLength) {
      errors.push(`Password must be no more than ${maxLength} characters long`);
    }

    // Character type validation
    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (requireUppercase) {
      strength += 1;
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (requireLowercase) {
      strength += 1;
    }

    if (requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (requireNumbers) {
      strength += 1;
    }

    if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else if (requireSpecialChars) {
      strength += 1;
    }

    // Forbidden patterns
    for (const pattern of forbiddenPatterns) {
      if (password.toLowerCase().includes(pattern.toLowerCase())) {
        errors.push(`Password cannot contain "${pattern}"`);
      }
    }

    // Common weak patterns
    const weakPatterns = [
      /(.)\1{2,}/, // Repeated characters
      /123456|654321|abcdef|qwerty/i, // Common sequences
    ];

    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        warnings.push('Password contains common weak patterns');
        break;
      }
    }

    // Bonus strength points
    if (password.length >= 12) strength += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/.test(password)) strength += 1;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      strength: Math.min(strength, 5) // Max strength of 5
    };
  }

  // =============================================================================
  // CREDIT CARD VALIDATION METHODS
  // =============================================================================

  /**
   * Validate credit card number using Luhn algorithm
   * @param cardNumber - Credit card number
   * @returns Validation result with card type
   */
  public validateCreditCard(cardNumber: string): ValidationResult & { cardType?: string } {
    const errors: string[] = [];
    
    if (!cardNumber) {
      errors.push('Credit card number is required');
      return { isValid: false, errors };
    }

    const digitsOnly = cardNumber.replace(/\D/g, '');
    
    if (digitsOnly.length < 13 || digitsOnly.length > 19) {
      errors.push('Credit card number must be 13-19 digits');
      return { isValid: false, errors };
    }

    // Luhn algorithm validation
    if (!this.luhnCheck(digitsOnly)) {
      errors.push('Invalid credit card number (failed Luhn check)');
    }

    // Determine card type
    const cardType = this.getCardType(digitsOnly);

    return {
      isValid: errors.length === 0,
      errors,
      cardType
    };
  }

  /**
   * Luhn algorithm implementation
   * @param cardNumber - Card number digits only
   * @returns True if valid
   */
  private luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Determine credit card type from number
   * @param cardNumber - Card number digits only
   * @returns Card type
   */
  private getCardType(cardNumber: string): string {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]|^2[2-7]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3[0689]/,
      jcb: /^35/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return type;
      }
    }

    return 'unknown';
  }

  // =============================================================================
  // GENERAL VALIDATION METHODS
  // =============================================================================

  /**
   * Validate required field
   * @param value - Value to validate
   * @param fieldName - Field name for error message
   * @returns Validation result
   */
  public validateRequired(value: any, fieldName: string): ValidationResult {
    const errors: string[] = [];
    
    if (value === null || value === undefined || value === '') {
      errors.push(`${fieldName} is required`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate string length
   * @param value - String to validate
   * @param minLength - Minimum length
   * @param maxLength - Maximum length
   * @param fieldName - Field name for error message
   * @returns Validation result
   */
  public validateStringLength(
    value: string, 
    minLength: number = 0, 
    maxLength: number = Number.MAX_SAFE_INTEGER,
    fieldName: string = 'Field'
  ): ValidationResult {
    const errors: string[] = [];
    
    if (typeof value !== 'string') {
      errors.push(`${fieldName} must be a string`);
      return { isValid: false, errors };
    }

    if (value.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters long`);
    }

    if (value.length > maxLength) {
      errors.push(`${fieldName} must be no more than ${maxLength} characters long`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate numeric range
   * @param value - Number to validate
   * @param min - Minimum value
   * @param max - Maximum value
   * @param fieldName - Field name for error message
   * @returns Validation result
   */
  public validateNumericRange(
    value: number, 
    min: number = Number.MIN_SAFE_INTEGER, 
    max: number = Number.MAX_SAFE_INTEGER,
    fieldName: string = 'Field'
  ): ValidationResult {
    const errors: string[] = [];
    
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${fieldName} must be a valid number`);
      return { isValid: false, errors };
    }

    if (value < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }

    if (value > max) {
      errors.push(`${fieldName} must be no more than ${max}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate against regex pattern
   * @param value - Value to validate
   * @param pattern - Regex pattern
   * @param errorMessage - Custom error message
   * @returns Validation result
   */
  public validatePattern(value: string, pattern: RegExp, errorMessage: string): ValidationResult {
    const errors: string[] = [];
    
    if (!pattern.test(value)) {
      errors.push(errorMessage);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Combine multiple validation results
   * @param results - Array of validation results
   * @returns Combined validation result
   */
  public combineValidationResults(results: ValidationResult[]): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    
    for (const result of results) {
      allErrors.push(...result.errors);
      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    }

    const result: ValidationResult = {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
    
    if (allWarnings.length > 0) {
      result.warnings = allWarnings;
    }
    
    return result;
  }
}

// Export singleton instance
export const validationHelpers = ValidationHelpers.getInstance();
