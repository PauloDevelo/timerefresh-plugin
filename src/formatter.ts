/**
 * OpenCode Time Refresh Plugin - Time Formatting Utilities
 * @module formatter
 */

import type { TimeRefreshConfig, TimeContext } from './types.js';

// ============================================================================
// Timezone Utilities
// ============================================================================

/**
 * Validates if a timezone string is a valid IANA timezone identifier.
 * @param timezone - The timezone string to validate
 * @returns true if valid IANA timezone or empty string (system default)
 */
export function isValidTimezone(timezone: string): boolean {
  // Empty string means use system default
  if (timezone === '') {
    return true;
  }

  try {
    // Attempt to create a DateTimeFormat with the timezone
    // This will throw RangeError for invalid timezones
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    if (error instanceof RangeError) {
      return false;
    }
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Gets the system's IANA timezone name.
 * @returns The system timezone (e.g., "America/New_York")
 */
export function getSystemTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// ============================================================================
// Custom Format Implementation
// ============================================================================

/**
 * Token definitions for custom format strings.
 * Order matters: longer tokens must come before shorter ones (YYYY before YY).
 */
const FORMAT_TOKENS = [
  'YYYY', // 4-digit year
  'YY',   // 2-digit year
  'MM',   // 2-digit month (zero-padded)
  'M',    // Month (no padding)
  'DD',   // 2-digit day (zero-padded)
  'D',    // Day (no padding)
  'HH',   // 2-digit hour (zero-padded, 24-hour)
  'H',    // Hour (no padding, 24-hour)
  'mm',   // 2-digit minute (zero-padded)
  'm',    // Minute (no padding)
  'ss',   // 2-digit second (zero-padded)
  's',    // Second (no padding)
] as const;

/**
 * Gets date parts for a given date in a specific timezone.
 * Uses Intl.DateTimeFormat to extract timezone-aware values.
 */
function getDateParts(date: Date, timezone?: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timezone || undefined,
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(date);

  const getValue = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find(p => p.type === type);
    return part ? parseInt(part.value, 10) : 0;
  };

  return {
    year: getValue('year'),
    month: getValue('month'),
    day: getValue('day'),
    hour: getValue('hour'),
    minute: getValue('minute'),
    second: getValue('second'),
  };
}

/**
 * Pads a number with leading zeros to the specified length.
 */
function padZero(num: number, length: number): string {
  return num.toString().padStart(length, '0');
}

/**
 * Formats a date using a custom format string with optional timezone.
 * 
 * Supported tokens:
 * - YYYY: 4-digit year
 * - YY: 2-digit year
 * - MM: 2-digit month (01-12)
 * - M: Month (1-12)
 * - DD: 2-digit day (01-31)
 * - D: Day (1-31)
 * - HH: 2-digit hour (00-23)
 * - H: Hour (0-23)
 * - mm: 2-digit minute (00-59)
 * - m: Minute (0-59)
 * - ss: 2-digit second (00-59)
 * - s: Second (0-59)
 * 
 * Note: Tokens are replaced in order from longest to shortest to prevent
 * partial matches (e.g., YYYY is replaced before YY). Single-letter tokens
 * will be replaced wherever they appear in the format string.
 * 
 * @param date - The date to format
 * @param format - The format string with tokens
 * @param timezone - Optional IANA timezone (uses system timezone if not provided)
 * @returns The formatted date string
 */
export function formatCustom(date: Date, format: string, timezone?: string): string {
  const parts = getDateParts(date, timezone);
  
  let result = format;

  // Replace tokens in order (longer tokens first to avoid partial matches)
  // YYYY before YY, MM before M, etc.
  const replacements: Record<string, string> = {
    'YYYY': padZero(parts.year, 4),
    'YY': padZero(parts.year % 100, 2),
    'MM': padZero(parts.month, 2),
    'M': parts.month.toString(),
    'DD': padZero(parts.day, 2),
    'D': parts.day.toString(),
    'HH': padZero(parts.hour, 2),
    'H': parts.hour.toString(),
    'mm': padZero(parts.minute, 2),
    'm': parts.minute.toString(),
    'ss': padZero(parts.second, 2),
    's': parts.second.toString(),
  };

  // Replace in order (longer tokens first)
  for (const token of FORMAT_TOKENS) {
    result = result.split(token).join(replacements[token]);
  }

  return result;
}

// ============================================================================
// Time Context Creation
// ============================================================================

/**
 * Creates a TimeContext object with various time representations.
 * 
 * @param date - The date to create context for
 * @param timezone - Optional IANA timezone (uses system timezone if not provided)
 * @returns TimeContext with all time representations
 */
export function createTimeContext(date: Date, timezone?: string): TimeContext {
  // Resolve timezone: use provided, or fall back to system
  const resolvedTimezone = timezone && isValidTimezone(timezone) 
    ? timezone 
    : getSystemTimezone();

  // ISO format (always UTC)
  const iso = date.toISOString();

  // Locale string with timezone
  const local = date.toLocaleString(undefined, { timeZone: resolvedTimezone });

  // Date only (locale format)
  const dateOnly = date.toLocaleDateString(undefined, { timeZone: resolvedTimezone });

  // Time only (locale format)
  const timeOnly = date.toLocaleTimeString(undefined, { timeZone: resolvedTimezone });

  // Day of week (full name)
  const dayOfWeek = date.toLocaleDateString(undefined, {
    weekday: 'long',
    timeZone: resolvedTimezone,
  });

  // Unix timestamp in milliseconds
  const timestamp = date.getTime();

  return {
    iso,
    local,
    date: dateOnly,
    time: timeOnly,
    timezone: resolvedTimezone,
    dayOfWeek,
    timestamp,
  };
}

// ============================================================================
// Main Formatting Function
// ============================================================================

/**
 * Formats a date according to the plugin configuration.
 * 
 * @param date - The date to format
 * @param config - The plugin configuration
 * @returns Formatted time string with prefix and suffix applied
 */
export function formatTime(date: Date, config: TimeRefreshConfig): string {
  // Resolve timezone: use config timezone if valid, otherwise system
  const timezone = config.timezone && isValidTimezone(config.timezone)
    ? config.timezone
    : getSystemTimezone();

  let formatted: string;

  switch (config.format) {
    case 'iso':
      // ISO 8601 format (always UTC)
      formatted = date.toISOString();
      break;

    case 'locale':
      // Locale-specific format with timezone
      formatted = date.toLocaleString(undefined, { timeZone: timezone });
      break;

    case 'custom':
      // Custom format string
      formatted = formatCustom(date, config.customFormat, timezone);
      break;

    default:
      // Fallback to ISO for unknown formats
      formatted = date.toISOString();
  }

  // Apply prefix and suffix
  return `${config.prefix}${formatted}${config.suffix}`;
}
