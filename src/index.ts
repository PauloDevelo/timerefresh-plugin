/**
 * OpenCode Time Refresh Plugin
 * Automatically injects current time context into messages.
 * @module opencode-time-refresh
 */

import type {
  TimeRefreshConfig,
  TimeContext,
  Plugin,
  PluginContext,
  PluginHooks,
} from './types.js';
import { loadConfig, validateConfig, DEFAULT_CONFIG } from './config.js';
import { formatTime, createTimeContext } from './formatter.js';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Constants
// ============================================================================

/**
 * Plugin version - kept in sync with package.json
 */
export const VERSION = '0.1.0';

/**
 * Config file name for plugin-specific configuration
 */
const CONFIG_FILE_NAME = 'time-refresh.json';

// ============================================================================
// Plugin Metadata
// ============================================================================

/**
 * Plugin metadata for OpenCode registration.
 */
export const pluginMeta = {
  name: 'opencode-time-refresh',
  version: VERSION,
  description: 'Automatically inject current time into messages',
} as const;

// ============================================================================
// Configuration Loading
// ============================================================================

/**
 * Attempts to load plugin configuration from a JSON file.
 * Looks for time-refresh.json in .opencode directory or project root.
 *
 * @param directory - The project directory to search in
 * @returns Partial configuration or undefined if not found
 */
function loadConfigFromFile(directory: string): Partial<TimeRefreshConfig> | undefined {
  const possiblePaths = [
    path.join(directory, '.opencode', CONFIG_FILE_NAME),
    path.join(directory, CONFIG_FILE_NAME),
  ];

  for (const configPath of possiblePaths) {
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(content) as Partial<TimeRefreshConfig>;
      }
    } catch {
      // Ignore errors, continue to next path
    }
  }

  return undefined;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets the current time context with optional configuration overrides.
 * Useful for programmatic access to time data without going through the plugin.
 *
 * @param config - Optional partial configuration to override defaults
 * @returns TimeContext with all time representations
 *
 * @example
 * ```typescript
 * const timeContext = getTimeContext({ timezone: 'America/New_York' });
 * console.log(timeContext.iso); // "2024-01-15T15:30:00.000Z"
 * console.log(timeContext.local); // "1/15/2024, 10:30:00 AM"
 * ```
 */
export function getTimeContext(config?: Partial<TimeRefreshConfig>): TimeContext {
  const mergedConfig = loadConfig(config);
  const timezone = mergedConfig.timezone || undefined;
  return createTimeContext(new Date(), timezone);
}

/**
 * Gets the formatted time string according to configuration.
 * Useful for getting just the formatted string without full context.
 *
 * @param config - Optional partial configuration to override defaults
 * @returns Formatted time string with prefix and suffix
 *
 * @example
 * ```typescript
 * const timeString = getFormattedTime({ format: 'locale' });
 * console.log(timeString); // "[Current time: 1/15/2024, 10:30:00 AM]"
 * ```
 */
export function getFormattedTime(config?: Partial<TimeRefreshConfig>): string {
  const mergedConfig = loadConfig(config);
  return formatTime(new Date(), mergedConfig);
}

// ============================================================================
// Plugin Implementation
// ============================================================================

/**
 * TimeRefreshPlugin factory function.
 * Creates a plugin instance that hooks into OpenCode TUI events
 * to inject current time context into prompts.
 *
 * @param ctx - Plugin context provided by OpenCode
 * @returns Plugin hooks for prompt processing
 *
 * @example
 * ```typescript
 * // .opencode/plugin/time-refresh.ts
 * export { TimeRefreshPlugin } from 'opencode-time-refresh';
 * ```
 *
 * @example
 * ```json
 * // opencode.json
 * {
 *   "plugin": ["opencode-time-refresh"]
 * }
 * ```
 */
export const TimeRefreshPlugin: Plugin = async (ctx: PluginContext): Promise<PluginHooks> => {
  // Load configuration from file in project directory
  const fileConfig = loadConfigFromFile(ctx.directory);

  // Merge with defaults
  const config = loadConfig(fileConfig);

  // Validate configuration and warn on errors
  const validation = validateConfig(config);
  if (!validation.valid) {
    console.warn(
      '[time-refresh] Configuration warnings:',
      validation.errors.map((e) => `${e.field}: ${e.message}`).join('; ')
    );
  }

  // Return empty hooks if plugin is disabled
  if (!config.enabled) {
    return {};
  }

  // Return hooks for TUI prompt processing
  return {
    /**
     * Hook called when the TUI prompt is being prepared.
     * Appends the current time to the user's prompt.
     */
    'tui.prompt.append': async (_input, output) => {
      // Only append if includeInEveryMessage is enabled
      if (!config.includeInEveryMessage) {
        return;
      }

      // Generate time string
      const now = new Date();
      const timeString = formatTime(now, config);

      // Append time to the prompt
      output.append = timeString;
    },
  };
};

// ============================================================================
// Re-exports
// ============================================================================

// Re-export all types
export * from './types.js';

// Re-export configuration functions
export * from './config.js';

// Re-export formatter utilities
export * from './formatter.js';

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export for convenient importing.
 *
 * @example
 * ```typescript
 * import TimeRefreshPlugin from 'opencode-time-refresh';
 * ```
 */
export default TimeRefreshPlugin;
