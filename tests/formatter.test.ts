import { describe, it, expect } from 'vitest';
import {
  isValidTimezone,
  getSystemTimezone,
  formatCustom,
  createTimeContext,
  formatTime,
} from '../src/formatter.js';
import type { TimeRefreshConfig } from '../src/types.js';

describe('formatter', () => {
  // Use a fixed date for consistent testing
  const testDate = new Date('2024-06-15T14:30:45.123Z');

  describe('isValidTimezone', () => {
    it('should return true for valid IANA timezone strings', () => {
      expect(isValidTimezone('America/New_York')).toBe(true);
      expect(isValidTimezone('Europe/London')).toBe(true);
      expect(isValidTimezone('Asia/Tokyo')).toBe(true);
      expect(isValidTimezone('UTC')).toBe(true);
    });

    it('should return true for empty string (system default)', () => {
      expect(isValidTimezone('')).toBe(true);
    });

    it('should return false for invalid timezone strings', () => {
      expect(isValidTimezone('Invalid/Timezone')).toBe(false);
      expect(isValidTimezone('NotATimezone')).toBe(false);
      expect(isValidTimezone('America/FakeCity')).toBe(false);
    });
  });

  describe('getSystemTimezone', () => {
    it('should return a non-empty string', () => {
      const timezone = getSystemTimezone();
      expect(typeof timezone).toBe('string');
      expect(timezone.length).toBeGreaterThan(0);
    });

    it('should return a valid IANA timezone', () => {
      const timezone = getSystemTimezone();
      expect(isValidTimezone(timezone)).toBe(true);
    });
  });

  describe('formatCustom', () => {
    it('should replace YYYY with 4-digit year', () => {
      expect(formatCustom(testDate, 'YYYY', 'UTC')).toBe('2024');
    });

    it('should replace YY with 2-digit year', () => {
      expect(formatCustom(testDate, 'YY', 'UTC')).toBe('24');
    });

    it('should replace MM with zero-padded month', () => {
      expect(formatCustom(testDate, 'MM', 'UTC')).toBe('06');
    });

    it('should replace M with non-padded month', () => {
      expect(formatCustom(testDate, 'M', 'UTC')).toBe('6');
    });

    it('should replace DD with zero-padded day', () => {
      expect(formatCustom(testDate, 'DD', 'UTC')).toBe('15');
    });

    it('should replace D with non-padded day', () => {
      expect(formatCustom(testDate, 'D', 'UTC')).toBe('15');
    });

    it('should replace HH with zero-padded hour', () => {
      expect(formatCustom(testDate, 'HH', 'UTC')).toBe('14');
    });

    it('should replace H with non-padded hour', () => {
      expect(formatCustom(testDate, 'H', 'UTC')).toBe('14');
    });

    it('should replace mm with zero-padded minute', () => {
      expect(formatCustom(testDate, 'mm', 'UTC')).toBe('30');
    });

    it('should replace m with non-padded minute', () => {
      expect(formatCustom(testDate, 'm', 'UTC')).toBe('30');
    });

    it('should replace ss with zero-padded second', () => {
      expect(formatCustom(testDate, 'ss', 'UTC')).toBe('45');
    });

    it('should replace s with non-padded second', () => {
      expect(formatCustom(testDate, 's', 'UTC')).toBe('45');
    });

    it('should handle complex format strings', () => {
      expect(formatCustom(testDate, 'YYYY-MM-DD HH:mm:ss', 'UTC')).toBe('2024-06-15 14:30:45');
    });

    it('should handle format with separators and punctuation', () => {
      // Note: Tokens like D, M, H, m, s are replaced wherever they appear
      // Use separators and punctuation that don't contain token characters
      expect(formatCustom(testDate, 'YYYY/MM/DD', 'UTC')).toBe('2024/06/15');
      expect(formatCustom(testDate, 'YYYY.MM.DD', 'UTC')).toBe('2024.06.15');
      expect(formatCustom(testDate, 'YYYY-MM-DD @ HH:mm', 'UTC')).toBe('2024-06-15 @ 14:30');
    });

    it('should apply timezone conversion', () => {
      // Test with a timezone that has a known offset
      // America/New_York is UTC-4 in June (EDT)
      const result = formatCustom(testDate, 'HH:mm', 'America/New_York');
      expect(result).toBe('10:30'); // 14:30 UTC - 4 hours = 10:30 EDT
    });

    it('should handle single-digit values with padding', () => {
      const earlyDate = new Date('2024-01-05T03:05:07.000Z');
      expect(formatCustom(earlyDate, 'MM-DD HH:mm:ss', 'UTC')).toBe('01-05 03:05:07');
    });

    it('should handle single-digit values without padding', () => {
      const earlyDate = new Date('2024-01-05T03:05:07.000Z');
      expect(formatCustom(earlyDate, 'M-D H:m:s', 'UTC')).toBe('1-5 3:5:7');
    });
  });

  describe('createTimeContext', () => {
    it('should return all required TimeContext fields', () => {
      const context = createTimeContext(testDate, 'UTC');

      expect(context).toHaveProperty('iso');
      expect(context).toHaveProperty('local');
      expect(context).toHaveProperty('date');
      expect(context).toHaveProperty('time');
      expect(context).toHaveProperty('timezone');
      expect(context).toHaveProperty('dayOfWeek');
      expect(context).toHaveProperty('timestamp');
    });

    it('should return correct ISO format', () => {
      const context = createTimeContext(testDate, 'UTC');
      expect(context.iso).toBe('2024-06-15T14:30:45.123Z');
    });

    it('should return correct timestamp', () => {
      const context = createTimeContext(testDate, 'UTC');
      expect(context.timestamp).toBe(testDate.getTime());
    });

    it('should return the provided timezone', () => {
      const context = createTimeContext(testDate, 'America/New_York');
      expect(context.timezone).toBe('America/New_York');
    });

    it('should return system timezone when not provided', () => {
      const context = createTimeContext(testDate);
      expect(context.timezone).toBe(getSystemTimezone());
    });

    it('should return day of week as full name', () => {
      const context = createTimeContext(testDate, 'UTC');
      expect(context.dayOfWeek).toBe('Saturday');
    });

    it('should return non-empty local, date, and time strings', () => {
      const context = createTimeContext(testDate, 'UTC');
      expect(context.local.length).toBeGreaterThan(0);
      expect(context.date.length).toBeGreaterThan(0);
      expect(context.time.length).toBeGreaterThan(0);
    });

    it('should fall back to system timezone for invalid timezone', () => {
      const context = createTimeContext(testDate, 'Invalid/Timezone');
      expect(context.timezone).toBe(getSystemTimezone());
    });
  });

  describe('formatTime', () => {
    const baseConfig: TimeRefreshConfig = {
      enabled: true,
      format: 'iso',
      customFormat: 'YYYY-MM-DD',
      timezone: 'UTC',
      includeInEveryMessage: true,
      prefix: '',
      suffix: '',
    };

    it('should return ISO format when config.format is "iso"', () => {
      const config: TimeRefreshConfig = { ...baseConfig, format: 'iso' };
      const result = formatTime(testDate, config);
      expect(result).toBe('2024-06-15T14:30:45.123Z');
    });

    it('should return locale string when config.format is "locale"', () => {
      const config: TimeRefreshConfig = { ...baseConfig, format: 'locale' };
      const result = formatTime(testDate, config);
      // Locale format varies by system, just check it's not empty
      expect(result.length).toBeGreaterThan(0);
    });

    it('should apply custom format when config.format is "custom"', () => {
      const config: TimeRefreshConfig = {
        ...baseConfig,
        format: 'custom',
        customFormat: 'YYYY-MM-DD HH:mm:ss',
      };
      const result = formatTime(testDate, config);
      expect(result).toBe('2024-06-15 14:30:45');
    });

    it('should apply prefix correctly', () => {
      const config: TimeRefreshConfig = {
        ...baseConfig,
        format: 'iso',
        prefix: '[Time: ',
        suffix: '',
      };
      const result = formatTime(testDate, config);
      expect(result).toBe('[Time: 2024-06-15T14:30:45.123Z');
    });

    it('should apply suffix correctly', () => {
      const config: TimeRefreshConfig = {
        ...baseConfig,
        format: 'iso',
        prefix: '',
        suffix: ']',
      };
      const result = formatTime(testDate, config);
      expect(result).toBe('2024-06-15T14:30:45.123Z]');
    });

    it('should apply both prefix and suffix', () => {
      const config: TimeRefreshConfig = {
        ...baseConfig,
        format: 'iso',
        prefix: '[',
        suffix: ']',
      };
      const result = formatTime(testDate, config);
      expect(result).toBe('[2024-06-15T14:30:45.123Z]');
    });

    it('should apply timezone for locale format', () => {
      const config: TimeRefreshConfig = {
        ...baseConfig,
        format: 'locale',
        timezone: 'America/New_York',
      };
      const result = formatTime(testDate, config);
      // The result should contain the time adjusted for EDT (10:30)
      expect(result).toContain('10');
      expect(result).toContain('30');
    });

    it('should apply timezone for custom format', () => {
      const config: TimeRefreshConfig = {
        ...baseConfig,
        format: 'custom',
        customFormat: 'HH:mm',
        timezone: 'America/New_York',
      };
      const result = formatTime(testDate, config);
      expect(result).toBe('10:30'); // 14:30 UTC - 4 hours = 10:30 EDT
    });

    it('should fall back to system timezone for invalid timezone', () => {
      const config: TimeRefreshConfig = {
        ...baseConfig,
        format: 'custom',
        customFormat: 'HH:mm',
        timezone: 'Invalid/Timezone',
      };
      // Should not throw, should use system timezone
      const result = formatTime(testDate, config);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use system timezone when timezone is empty', () => {
      const config: TimeRefreshConfig = {
        ...baseConfig,
        format: 'custom',
        customFormat: 'HH:mm',
        timezone: '',
      };
      // Should not throw
      const result = formatTime(testDate, config);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
