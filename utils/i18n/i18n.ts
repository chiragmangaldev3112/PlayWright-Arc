import * as fs from 'fs';
import * as path from 'path';

/**
 * Simple i18n helper class for loading translations and providing translation lookup
 */
export class I18n {
  private static translations: Record<string, any> = {};
  private static currentLocale: string = 'en';
  private static initialized: boolean = false;

  /**
   * Initialize i18n with locale
   */
  static init(locale: string = 'en'): void {
    this.currentLocale = locale;
    this.loadTranslations();
    this.initialized = true;
  }

  /**
   * Load translations for current locale
   */
  private static loadTranslations(): void {
    try {
      const localeFile = path.join(process.cwd(), 'locales', `${this.currentLocale}.json`);
      if (fs.existsSync(localeFile)) {
        const content = fs.readFileSync(localeFile, 'utf8');
        this.translations = JSON.parse(content);
      } else {
        // Fallback to en.json if locale file doesn't exist
        const fallbackFile = path.join(process.cwd(), 'locales', 'en.json');
        if (fs.existsSync(fallbackFile)) {
          const content = fs.readFileSync(fallbackFile, 'utf8');
          this.translations = JSON.parse(content);
        }
      }
    } catch (error) {
      console.warn(`Failed to load translations for locale ${this.currentLocale}:`, error);
      this.translations = {};
    }
  }

  /**
   * Get translation for key with optional parameters
   */
  static t(key: string, params?: Record<string, any>): string {
    if (!this.initialized) {
      this.init();
    }

    const keys = key.split('.');
    let value: any = this.translations;

    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters if provided
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }

    return value;
  }

  /**
   * Set current locale
   */
  static setLocale(locale: string): void {
    this.currentLocale = locale;
    this.loadTranslations();
  }

  /**
   * Get current locale
   */
  static getLocale(): string {
    return this.currentLocale;
  }

  /**
   * Check if key exists in translations
   */
  static has(key: string): boolean {
    if (!this.initialized) {
      this.init();
    }

    const keys = key.split('.');
    let value: any = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return typeof value === 'string';
  }
}
