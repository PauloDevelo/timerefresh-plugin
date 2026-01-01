import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CONFIG,
  validateConfig,
  loadConfig,
  loadAndValidateConfig,
} from '../src/config.js';
import type { TimeRefreshConfig } from '../src/types.js';

describe('config', () => {
  describe('DEFAULT_CONFIG', () => {
    it('should have all required fields', () => {
      expect(DEFAULT_CONFIG).toHaveProperty('enabled');
      expect(DEFAULT_CONFIG).toHaveProperty('format');
      expect(DEFAULT_CONFIG).toHaveProperty('customFormat');
      expect(DEFAULT_CONFIG).toHaveProperty('timezone');
      expect(DEFAULT_CONFIG).toHaveProperty('includeInEveryMessage');
      expect(DEFAULT_CONFIG).toHaveProperty('prefix');
      expect(DEFAULT_CONFIG).toHaveProperty('suffix');
    });

    it('should have sensible default values', () => {
      expect(DEFAULT_CONFIG.enabled).toBe(true);
      expect(DEFAULT_CONFIG.format).toBe('iso');
      expect(DEFAULT_CONFIG.customFormat).toBe('YYYY-MM-DD HH:mm:ss');
      expect(DEFAULT_CONFIG.timezone).toBe('');
      expect(DEFAULT_CONFIG.includeInEveryMessage).toBe(true);
      expect(DEFAULT_CONFIG.prefix).toBe('[Current time: ');
      expect(DEFAULT_CONFIG.suffix).toBe(']');
    });
  });

  describe('loadConfig', () => {
    it('should return default config when no user config provided', () => {
      const config = loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should return default config when undefined is passed', () => {
      const config = loadConfig(undefined);
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should return default config when null is passed', () => {
      const config = loadConfig(null);
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should merge partial user config with defaults', () => {
      const userConfig = { enabled: false };
      const config = loadConfig(userConfig);

      expect(config.enabled).toBe(false);
      expect(config.format).toBe(DEFAULT_CONFIG.format);
      expect(config.customFormat).toBe(DEFAULT_CONFIG.customFormat);
      expect(config.timezone).toBe(DEFAULT_CONFIG.timezone);
      expect(config.includeInEveryMessage).toBe(DEFAULT_CONFIG.includeInEveryMessage);
      expect(config.prefix).toBe(DEFAULT_CONFIG.prefix);
      expect(config.suffix).toBe(DEFAULT_CONFIG.suffix);
    });

    it('should override multiple default values', () => {
      const userConfig = {
        enabled: false,
        format: 'custom' as const,
        customFormat: 'DD/MM/YYYY',
        timezone: 'America/New_York',
      };
      const config = loadConfig(userConfig);

      expect(config.enabled).toBe(false);
      expect(config.format).toBe('custom');
      expect(config.customFormat).toBe('DD/MM/YYYY');
      expect(config.timezone).toBe('America/New_York');
      expect(config.includeInEveryMessage).toBe(DEFAULT_CONFIG.includeInEveryMessage);
    });

    it('should override all default values when full config provided', () => {
      const userConfig: TimeRefreshConfig = {
        enabled: false,
        format: 'locale',
        customFormat: 'custom-format',
        timezone: 'Europe/London',
        includeInEveryMessage: false,
        prefix: '<<',
        suffix: '>>',
      };
      const config = loadConfig(userConfig);

      expect(config).toEqual(userConfig);
    });

    it('should return a new object (not mutate defaults)', () => {
      const config = loadConfig();
      config.enabled = false;

      expect(DEFAULT_CONFIG.enabled).toBe(true);
    });
  });

  describe('validateConfig', () => {
    it('should return valid for default config', () => {
      const result = validateConfig(DEFAULT_CONFIG);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid for a complete valid config', () => {
      const config: TimeRefreshConfig = {
        enabled: true,
        format: 'locale',
        customFormat: 'YYYY-MM-DD',
        timezone: 'America/New_York',
        includeInEveryMessage: false,
        prefix: '[',
        suffix: ']',
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    describe('format validation', () => {
      it('should accept "iso" format', () => {
        const config = { ...DEFAULT_CONFIG, format: 'iso' as const };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });

      it('should accept "locale" format', () => {
        const config = { ...DEFAULT_CONFIG, format: 'locale' as const };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });

      it('should accept "custom" format with non-empty customFormat', () => {
        const config = { ...DEFAULT_CONFIG, format: 'custom' as const, customFormat: 'YYYY' };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });

      it('should reject invalid format values', () => {
        const config = { ...DEFAULT_CONFIG, format: 'invalid' as any };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('format');
        expect(result.errors[0].message).toContain("'iso'");
        expect(result.errors[0].message).toContain("'locale'");
        expect(result.errors[0].message).toContain("'custom'");
        expect(result.errors[0].value).toBe('invalid');
      });
    });

    describe('customFormat validation', () => {
      it('should require non-empty customFormat when format is "custom"', () => {
        const config = { ...DEFAULT_CONFIG, format: 'custom' as const, customFormat: '' };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === 'customFormat')).toBe(true);
      });

      it('should reject whitespace-only customFormat when format is "custom"', () => {
        const config = { ...DEFAULT_CONFIG, format: 'custom' as const, customFormat: '   ' };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === 'customFormat')).toBe(true);
      });

      it('should not require customFormat when format is not "custom"', () => {
        const config = { ...DEFAULT_CONFIG, format: 'iso' as const, customFormat: '' };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });
    });

    describe('timezone validation', () => {
      it('should accept valid IANA timezone strings', () => {
        const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'UTC'];
        for (const tz of timezones) {
          const config = { ...DEFAULT_CONFIG, timezone: tz };
          const result = validateConfig(config);
          expect(result.valid).toBe(true);
        }
      });

      it('should accept empty string (system default)', () => {
        const config = { ...DEFAULT_CONFIG, timezone: '' };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });

      it('should reject invalid timezone strings', () => {
        const config = { ...DEFAULT_CONFIG, timezone: 'Invalid/Timezone' };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === 'timezone')).toBe(true);
        expect(result.errors[0].message).toContain('Invalid/Timezone');
        expect(result.errors[0].message).toContain('not a valid IANA timezone');
      });

      it('should reject non-string timezone', () => {
        const config = { ...DEFAULT_CONFIG, timezone: 123 as any };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === 'timezone')).toBe(true);
        expect(result.errors[0].message).toBe('timezone must be a string');
      });
    });

    describe('boolean field validation', () => {
      it('should reject non-boolean enabled', () => {
        const config = { ...DEFAULT_CONFIG, enabled: 'true' as any };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === 'enabled')).toBe(true);
        expect(result.errors[0].message).toBe('enabled must be a boolean');
      });

      it('should reject non-boolean includeInEveryMessage', () => {
        const config = { ...DEFAULT_CONFIG, includeInEveryMessage: 1 as any };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === 'includeInEveryMessage')).toBe(true);
      });
    });

    describe('string field validation', () => {
      it('should reject non-string prefix', () => {
        const config = { ...DEFAULT_CONFIG, prefix: 123 as any };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === 'prefix')).toBe(true);
        expect(result.errors[0].message).toBe('prefix must be a string');
      });

      it('should reject non-string suffix', () => {
        const config = { ...DEFAULT_CONFIG, suffix: null as any };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === 'suffix')).toBe(true);
        expect(result.errors[0].message).toBe('suffix must be a string');
      });

      it('should accept empty prefix and suffix', () => {
        const config = { ...DEFAULT_CONFIG, prefix: '', suffix: '' };
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });
    });

    describe('error collection', () => {
      it('should collect ALL errors, not fail on first', () => {
        const config = {
          enabled: 'yes' as any,
          format: 'invalid' as any,
          customFormat: '',
          timezone: 123 as any,
          includeInEveryMessage: 'true' as any,
          prefix: 456 as any,
          suffix: null as any,
        };
        const result = validateConfig(config);
        expect(result.valid).toBe(false);
        // Should have errors for: enabled, format, timezone, includeInEveryMessage, prefix, suffix
        expect(result.errors.length).toBeGreaterThanOrEqual(6);
      });

      it('should include field name in each error', () => {
        const config = {
          ...DEFAULT_CONFIG,
          enabled: 'yes' as any,
          format: 'invalid' as any,
        };
        const result = validateConfig(config);
        for (const error of result.errors) {
          expect(error.field).toBeDefined();
          expect(typeof error.field).toBe('string');
        }
      });

      it('should include descriptive message in each error', () => {
        const config = {
          ...DEFAULT_CONFIG,
          enabled: 'yes' as any,
        };
        const result = validateConfig(config);
        for (const error of result.errors) {
          expect(error.message).toBeDefined();
          expect(typeof error.message).toBe('string');
          expect(error.message.length).toBeGreaterThan(0);
        }
      });

      it('should include invalid value in errors', () => {
        const config = { ...DEFAULT_CONFIG, enabled: 'yes' as any };
        const result = validateConfig(config);
        expect(result.errors[0].value).toBe('yes');
      });
    });
  });

  describe('loadAndValidateConfig', () => {
    it('should return both config and validation result', () => {
      const result = loadAndValidateConfig();
      expect(result).toHaveProperty('config');
      expect(result).toHaveProperty('validation');
    });

    it('should return valid result for default config', () => {
      const { config, validation } = loadAndValidateConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should merge user config and validate', () => {
      const { config, validation } = loadAndValidateConfig({ enabled: false });
      expect(config.enabled).toBe(false);
      expect(config.format).toBe(DEFAULT_CONFIG.format);
      expect(validation.valid).toBe(true);
    });

    it('should return validation errors for invalid merged config', () => {
      const { config, validation } = loadAndValidateConfig({
        format: 'custom' as const,
        customFormat: '', // Invalid: empty when format is custom
      });
      expect(config.format).toBe('custom');
      expect(config.customFormat).toBe('');
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.field === 'customFormat')).toBe(true);
    });

    it('should handle null input', () => {
      const { config, validation } = loadAndValidateConfig(null);
      expect(config).toEqual(DEFAULT_CONFIG);
      expect(validation.valid).toBe(true);
    });

    it('should handle undefined input', () => {
      const { config, validation } = loadAndValidateConfig(undefined);
      expect(config).toEqual(DEFAULT_CONFIG);
      expect(validation.valid).toBe(true);
    });
  });
});
