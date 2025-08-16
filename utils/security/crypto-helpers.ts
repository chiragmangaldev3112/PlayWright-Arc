/**
 * Cryptography Helper Utilities
 * 
 * Provides comprehensive cryptography utilities for hashing, encryption,
 * and security-related test automation tasks.
 */

import * as crypto from 'crypto';
import { logger } from '@utils/core/logger';

/**
 * Hash algorithm types
 */
export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

/**
 * Encryption algorithm types
 */
export type EncryptionAlgorithm = 'aes-256-cbc' | 'aes-256-gcm' | 'aes-192-cbc' | 'aes-128-cbc';

/**
 * Encrypted data interface
 */
export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag?: string; // For GCM mode
  algorithm: string;
}

/**
 * Crypto Helper Class
 * Provides comprehensive cryptography utilities
 */
export class CryptoHelpers {
  private static instance: CryptoHelpers;

  private constructor() {}

  public static getInstance(): CryptoHelpers {
    if (!CryptoHelpers.instance) {
      CryptoHelpers.instance = new CryptoHelpers();
    }
    return CryptoHelpers.instance;
  }

  // =============================================================================
  // HASHING METHODS
  // =============================================================================

  /**
   * Generate hash from string
   * @param data - Data to hash
   * @param algorithm - Hash algorithm
   * @param encoding - Output encoding
   * @returns Hash string
   */
  public hash(
    data: string, 
    algorithm: HashAlgorithm = 'sha256', 
    encoding: 'hex' | 'base64' = 'hex'
  ): string {
    try {
      const hash = crypto.createHash(algorithm);
      hash.update(data, 'utf8');
      const result = hash.digest(encoding);
      
      logger.debug('Hash generated', { algorithm, encoding, dataLength: data.length });
      return result;
    } catch (error) {
      logger.error('Hash generation failed', { algorithm, error });
      throw error;
    }
  }

  /**
   * Generate MD5 hash
   * @param data - Data to hash
   * @returns MD5 hash
   */
  public md5(data: string): string {
    return this.hash(data, 'md5');
  }

  /**
   * Generate SHA-1 hash
   * @param data - Data to hash
   * @returns SHA-1 hash
   */
  public sha1(data: string): string {
    return this.hash(data, 'sha1');
  }

  /**
   * Generate SHA-256 hash
   * @param data - Data to hash
   * @returns SHA-256 hash
   */
  public sha256(data: string): string {
    return this.hash(data, 'sha256');
  }

  /**
   * Generate SHA-512 hash
   * @param data - Data to hash
   * @returns SHA-512 hash
   */
  public sha512(data: string): string {
    return this.hash(data, 'sha512');
  }

  /**
   * Generate HMAC
   * @param data - Data to sign
   * @param key - Secret key
   * @param algorithm - Hash algorithm
   * @returns HMAC string
   */
  public hmac(
    data: string, 
    key: string, 
    algorithm: HashAlgorithm = 'sha256'
  ): string {
    try {
      const hmac = crypto.createHmac(algorithm, key);
      hmac.update(data, 'utf8');
      const result = hmac.digest('hex');
      
      logger.debug('HMAC generated', { algorithm, dataLength: data.length });
      return result;
    } catch (error) {
      logger.error('HMAC generation failed', { algorithm, error });
      throw error;
    }
  }

  // =============================================================================
  // ENCRYPTION/DECRYPTION METHODS
  // =============================================================================

  /**
   * Encrypt data
   * @param data - Data to encrypt
   * @param key - Encryption key
   * @param algorithm - Encryption algorithm
   * @returns Encrypted data object
   */
  public encrypt(
    data: string, 
    key: string, 
    algorithm: EncryptionAlgorithm = 'aes-256-cbc'
  ): EncryptedData {
    try {
      const keyBuffer = this.deriveKey(key, algorithm);
      const iv = crypto.randomBytes(16);
      
      if (algorithm.includes('gcm')) {
        return this.encryptGCM(data, keyBuffer, iv, algorithm);
      } else {
        return this.encryptCBC(data, keyBuffer, iv, algorithm);
      }
    } catch (error) {
      logger.error('Encryption failed', { algorithm, error });
      throw error;
    }
  }

  /**
   * Decrypt data
   * @param encryptedData - Encrypted data object
   * @param key - Decryption key
   * @returns Decrypted string
   */
  public decrypt(encryptedData: EncryptedData, key: string): string {
    try {
      const keyBuffer = this.deriveKey(key, encryptedData.algorithm as EncryptionAlgorithm);
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const encrypted = Buffer.from(encryptedData.encrypted, 'hex');
      
      if (encryptedData.algorithm.includes('gcm')) {
        return this.decryptGCM(encrypted, keyBuffer, iv, encryptedData);
      } else {
        return this.decryptCBC(encrypted, keyBuffer, iv, encryptedData.algorithm);
      }
    } catch (error) {
      logger.error('Decryption failed', { algorithm: encryptedData.algorithm, error });
      throw error;
    }
  }

  /**
   * Encrypt using CBC mode
   */
  private encryptCBC(
    data: string, 
    key: Buffer, 
    iv: Buffer, 
    algorithm: string
  ): EncryptedData {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      algorithm
    };
  }

  /**
   * Decrypt using CBC mode
   */
  private decryptCBC(
    encrypted: Buffer, 
    key: Buffer, 
    iv: Buffer, 
    algorithm: string
  ): string {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Encrypt using GCM mode
   */
  private encryptGCM(
    data: string, 
    key: Buffer, 
    iv: Buffer, 
    algorithm: string
  ): EncryptedData {
    const cipher = crypto.createCipheriv(algorithm, key, iv) as crypto.CipherGCM;
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      algorithm
    };
  }

  /**
   * Decrypt using GCM mode
   */
  private decryptGCM(
    encrypted: Buffer, 
    key: Buffer, 
    iv: Buffer, 
    encryptedData: EncryptedData
  ): string {
    const decipher = crypto.createDecipheriv(encryptedData.algorithm, key, iv) as crypto.DecipherGCM;
    decipher.setAAD(Buffer.from('additional-data'));
    
    if (encryptedData.tag) {
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    }
    
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // =============================================================================
  // KEY GENERATION METHODS
  // =============================================================================

  /**
   * Generate random key
   * @param length - Key length in bytes
   * @param encoding - Output encoding
   * @returns Random key
   */
  public generateKey(length: number = 32, encoding: 'hex' | 'base64' = 'hex'): string {
    try {
      const key = crypto.randomBytes(length);
      return key.toString(encoding);
    } catch (error) {
      logger.error('Key generation failed', { length, encoding, error });
      throw error;
    }
  }

  /**
   * Generate random salt
   * @param length - Salt length in bytes
   * @returns Salt string
   */
  public generateSalt(length: number = 16): string {
    return this.generateKey(length);
  }

  /**
   * Derive key from password using PBKDF2
   * @param password - Password
   * @param salt - Salt (optional, will generate if not provided)
   * @param iterations - Number of iterations
   * @param keyLength - Key length in bytes
   * @returns Derived key
   */
  public deriveKeyFromPassword(
    password: string,
    salt?: string,
    iterations: number = 100000,
    keyLength: number = 32
  ): { key: string; salt: string } {
    try {
      const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(16);
      const key = crypto.pbkdf2Sync(password, saltBuffer, iterations, keyLength, 'sha256');
      
      logger.debug('Key derived from password', { iterations, keyLength });
      
      return {
        key: key.toString('hex'),
        salt: saltBuffer.toString('hex')
      };
    } catch (error) {
      logger.error('Key derivation failed', { iterations, keyLength, error });
      throw error;
    }
  }

  /**
   * Derive key for encryption algorithm
   */
  private deriveKey(key: string, algorithm: EncryptionAlgorithm): Buffer {
    const keyLengths: Record<string, number> = {
      'aes-128-cbc': 16,
      'aes-192-cbc': 24,
      'aes-256-cbc': 32,
      'aes-256-gcm': 32,
    };

    const requiredLength = keyLengths[algorithm] || 32;
    const keyBuffer = Buffer.from(key, 'utf8');
    
    if (keyBuffer.length === requiredLength) {
      return keyBuffer;
    }
    
    // Use PBKDF2 to derive key of correct length
    return crypto.pbkdf2Sync(key, 'salt', 10000, requiredLength, 'sha256');
  }

  // =============================================================================
  // RANDOM GENERATION METHODS
  // =============================================================================

  /**
   * Generate random bytes
   * @param length - Number of bytes
   * @param encoding - Output encoding
   * @returns Random bytes
   */
  public randomBytes(length: number, encoding: 'hex' | 'base64' = 'hex'): string {
    try {
      const bytes = crypto.randomBytes(length);
      return bytes.toString(encoding);
    } catch (error) {
      logger.error('Random bytes generation failed', { length, encoding, error });
      throw error;
    }
  }

  /**
   * Generate random integer
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random integer
   */
  public randomInt(min: number = 0, max: number = 100): number {
    try {
      return crypto.randomInt(min, max);
    } catch (error) {
      logger.error('Random integer generation failed', { min, max, error });
      throw error;
    }
  }

  /**
   * Generate UUID v4
   * @returns UUID string
   */
  public generateUUID(): string {
    try {
      return crypto.randomUUID();
    } catch (error) {
      logger.error('UUID generation failed', { error });
      // Fallback UUID generation
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }

  /**
   * Generate random token
   * @param length - Token length
   * @param charset - Character set to use
   * @returns Random token
   */
  public generateToken(
    length: number = 32,
    charset: 'alphanumeric' | 'hex' | 'base64' = 'alphanumeric'
  ): string {
    try {
      const bytes = crypto.randomBytes(Math.ceil(length * 3 / 4));
      
      switch (charset) {
        case 'hex':
          return bytes.toString('hex').substring(0, length);
        
        case 'base64':
          return bytes.toString('base64')
            .replace(/[+/=]/g, '')
            .substring(0, length);
        
        case 'alphanumeric':
        default:
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let result = '';
          for (let i = 0; i < length; i++) {
            const byteIndex = i % bytes.length;
            const byteValue = bytes[byteIndex];
            if (byteValue === undefined) {
              throw new Error('Invalid byte value encountered');
            }
            const charIndex = byteValue % chars.length;
            result += chars.charAt(charIndex);
          }
          return result;
      }
    } catch (error) {
      logger.error('Token generation failed', { length, charset, error });
      throw error;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Compare two strings in constant time (prevents timing attacks)
   * @param a - First string
   * @param b - Second string
   * @returns True if strings are equal
   */
  public constantTimeCompare(a: string, b: string): boolean {
    try {
      const bufferA = Buffer.from(a, 'utf8');
      const bufferB = Buffer.from(b, 'utf8');
      
      if (bufferA.length !== bufferB.length) {
        return false;
      }
      
      return crypto.timingSafeEqual(bufferA, bufferB);
    } catch (error) {
      logger.error('Constant time comparison failed', { error });
      return false;
    }
  }

  /**
   * Generate checksum for data integrity
   * @param data - Data to checksum
   * @param algorithm - Hash algorithm
   * @returns Checksum string
   */
  public generateChecksum(data: string, algorithm: HashAlgorithm = 'sha256'): string {
    return this.hash(data, algorithm);
  }

  /**
   * Verify checksum
   * @param data - Original data
   * @param checksum - Expected checksum
   * @param algorithm - Hash algorithm
   * @returns True if checksum is valid
   */
  public verifyChecksum(
    data: string, 
    checksum: string, 
    algorithm: HashAlgorithm = 'sha256'
  ): boolean {
    const calculatedChecksum = this.generateChecksum(data, algorithm);
    return this.constantTimeCompare(calculatedChecksum, checksum);
  }

  /**
   * Generate password hash for storage
   * @param password - Plain text password
   * @param saltRounds - Number of salt rounds (higher = more secure but slower)
   * @returns Password hash object
   */
  public hashPassword(password: string, saltRounds: number = 12): {
    hash: string;
    salt: string;
    algorithm: string;
    iterations: number;
  } {
    try {
      const salt = this.generateSalt();
      const iterations = Math.pow(2, saltRounds);
      const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha256');
      
      return {
        hash: hash.toString('hex'),
        salt,
        algorithm: 'pbkdf2-sha256',
        iterations
      };
    } catch (error) {
      logger.error('Password hashing failed', { saltRounds, error });
      throw error;
    }
  }

  /**
   * Verify password against hash
   * @param password - Plain text password
   * @param storedHash - Stored password hash object
   * @returns True if password is valid
   */
  public verifyPassword(
    password: string,
    storedHash: {
      hash: string;
      salt: string;
      algorithm: string;
      iterations: number;
    }
  ): boolean {
    try {
      if (!storedHash || !storedHash.hash || !storedHash.salt) {
        return false;
      }
      
      const hash = crypto.pbkdf2Sync(
        password,
        storedHash.salt,
        storedHash.iterations,
        64,
        'sha256'
      );
      
      return this.constantTimeCompare(hash.toString('hex'), storedHash.hash);
    } catch (error) {
      logger.error('Password verification failed', { error });
      return false;
    }
  }
}

// Export singleton instance
export const cryptoHelpers = CryptoHelpers.getInstance();
