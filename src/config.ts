/**
 * OpenCode Time Refresh Plugin - Configuration Loader
 * @module config
 */

import type { TimeRefreshConfig, TimeFormat, ValidationResult, ValidationError } from './types.js';
import { isValidTimezone } from './formatter.js';

// ============================================================================
// Constants
// ============================================================================

/**
 * Valid time format options.
 */
const VALID_FORMATS: readonly TimeFormat[] = ['iso', 'locale', 'custom'] as const;

/**
 * Default configuration values.
 * These provide sensible defaults for all plugin options.
 */
export const DEFAULT_CONFIG: TimeRefreshConfig = {
  enabled: true,
  format: 'iso',
  customFormat: 'YYYY-MM-DD HH:mm:ss',
  timezone: '', // Empty means use system timezone
  includeInEveryMessage: true,
  prefix: '[Current time: ',
  suffix: ']',
};

/**
 * Validates a complete TimeRefreshConfig object.
 * Collects ALL validation errors rather than failing on the first one.
 *
 * @param config - The configuration object to validate
 * @returns ValidationResult containing validity status and any errors
 */
export function validateConfig(config: TimeRefreshConfig): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate 'enabled' is a boolean
  if (typeof config.enabled !== 'boolean') {
    errors.push({
      field: 'enabled',
      message: 'enabled must be a boolean',
      value: config.enabled,
    });
  }

  // Validate 'format' is one of the valid options
  if (!VALID_FORMATS.includes(config.format)) {
    errors.push({
      field: 'format',
      message: `format must be one of: ${VALID_FORMATS.map((f) => `'${f}'`).join(', ')}`,
      value: config.format,
    });
  }

  // Validate 'customFormat' is non-empty when format is 'custom'
  if (config.format === 'custom') {
    if (typeof config.customFormat !== 'string' || config.customFormat.trim() === '') {
      errors.push({
        field: 'customFormat',
        message: "customFormat must be a non-empty string when format is 'custom'",
        value: config.customFormat,
      });
    }
  }

  // Validate 'timezone' is valid (if provided and non-empty)
  if (typeof config.timezone !== 'string') {
    errors.push({
      field: 'timezone',
      message: 'timezone must be a string',
      value: config.timezone,
    });
  } else if (config.timezone !== '' && !isValidTimezone(config.timezone)) {
    errors.push({
      field: 'timezone',
      message: `timezone '${config.timezone}' is not a valid IANA timezone identifier`,
      value: config.timezone,
    });
  }

  // Validate 'includeInEveryMessage' is a boolean
  if (typeof config.includeInEveryMessage !== 'boolean') {
    errors.push({
      field: 'includeInEveryMessage',
      message: 'includeInEveryMessage must be a boolean',
      value: config.includeInEveryMessage,
    });
  }

  // Validate 'prefix' is a string
  if (typeof config.prefix !== 'string') {
    errors.push({
      field: 'prefix',
      message: 'prefix must be a string',
      value: config.prefix,
    });
  }

  // Validate 'suffix' is a string
  if (typeof config.suffix !== 'string') {
    errors.push({
      field: 'suffix',
      message: 'suffix must be a string',
      value: config.suffix,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Configuration Loading Functions
// ============================================================================

/**
 * Loads and merges user configuration with default values.
 * User values override defaults where provided.
 *
 * @param userConfig - Partial user configuration (optional)
 * @returns Complete TimeRefreshConfig with defaults applied
 */
export function loadConfig(userConfig?: Partial<TimeRefreshConfig> | null): TimeRefreshConfig {
  // Handle undefined/null gracefully
  if (userConfig == null) {
    return { ...DEFAULT_CONFIG };
  }

  // Merge user config with defaults (user values override)
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
  };
}

/**
 * Convenience function that loads configuration and validates it in one call.
 *
 * @param userConfig - Partial user configuration (optional)
 * @returns Object containing the merged config and validation result
 */
export function loadAndValidateConfig(
  userConfig?: Partial<TimeRefreshConfig> | null
): { config: TimeRefreshConfig; validation: ValidationResult } {
  const config = loadConfig(userConfig);
  const validation = validateConfig(config);

  return { config, validation };
}
