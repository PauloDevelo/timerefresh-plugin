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

// ============================================================================
// Constants
// ============================================================================

/**
 * Plugin version - kept in sync with package.json
 */
export const VERSION = '0.1.0';

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
 * Creates a plugin instance that hooks into OpenCode message events
 * to inject current time context.
 *
 * @param ctx - Plugin context provided by OpenCode
 * @returns Plugin hooks for message processing
 *
 * @example
 * ```typescript
 * // In OpenCode configuration
 * import { TimeRefreshPlugin } from 'opencode-time-refresh';
 *
 * export default {
 *   plugins: [TimeRefreshPlugin],
 *   timeRefresh: {
 *     enabled: true,
 *     format: 'locale',
 *     timezone: 'America/New_York'
 *   }
 * };
 * ```
 */
export const TimeRefreshPlugin: Plugin = async (ctx: PluginContext): Promise<PluginHooks> => {
  // Extract user configuration from context
  const userConfig = ctx.config?.timeRefresh as Partial<TimeRefreshConfig> | undefined;

  // Load configuration with defaults
  const config = loadConfig(userConfig);

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

  // Return hooks for message processing
  return {
    /**
     * Hook called when a message is updated.
     * Injects time context into user messages when configured.
     *
     * Note: The exact injection mechanism depends on OpenCode's API.
     * This hook makes time data available for OpenCode to use.
     */
    'message.updated': async (input, output) => {
      // Only process if includeInEveryMessage is enabled
      if (!config.includeInEveryMessage) {
        return;
      }

      // Only inject time into user messages
      if (input.role !== 'user') {
        return;
      }

      // Generate time data
      const now = new Date();
      const timeString = formatTime(now, config);
      const timeContext = createTimeContext(now, config.timezone || undefined);

      // Prepend time string to the output content
      // This modifies the message that will be sent to the LLM
      output.content = `${timeString}\n\n${output.content}`;

      // Attach time context as metadata for potential use by OpenCode
      // This allows OpenCode to access structured time data if needed
      (output as unknown as Record<string, unknown>)._timeContext = timeContext;
      (output as unknown as Record<string, unknown>)._timeString = timeString;
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
