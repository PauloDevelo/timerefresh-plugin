/**
 * OpenCode Time Refresh Plugin - Type Definitions
 * @module types
 */

// ============================================================================
// Time Format Types
// ============================================================================

/**
 * Supported time format options for the plugin.
 * - 'iso': ISO 8601 format (e.g., "2024-01-15T10:30:00.000Z")
 * - 'locale': Locale-specific format based on user's system settings
 * - 'custom': User-defined format string
 */
export type TimeFormat = 'iso' | 'locale' | 'custom';

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Plugin configuration interface.
 * Defines all configurable options for the Time Refresh plugin.
 */
export interface TimeRefreshConfig {
  /** Whether the plugin is enabled */
  enabled: boolean;

  /** The format to use for time display */
  format: TimeFormat;

  /** Custom format string (used when format is 'custom') */
  customFormat: string;

  /** IANA timezone identifier (e.g., "America/New_York", "UTC") */
  timezone: string;

  /** Whether to include time context in every message */
  includeInEveryMessage: boolean;

  /** Prefix string to prepend before the time context */
  prefix: string;

  /** Suffix string to append after the time context */
  suffix: string;
}

// ============================================================================
// Time Context Types
// ============================================================================

/**
 * Formatted time data structure.
 * Contains various representations of the current time for flexible usage.
 */
export interface TimeContext {
  /** ISO 8601 format (e.g., "2024-01-15T10:30:00.000Z") */
  iso: string;

  /** Locale-formatted string based on system settings */
  local: string;

  /** Date only portion (e.g., "2024-01-15") */
  date: string;

  /** Time only portion (e.g., "10:30:00") */
  time: string;

  /** IANA timezone name (e.g., "America/New_York") */
  timezone: string;

  /** Full day name (e.g., "Monday") */
  dayOfWeek: string;

  /** Unix timestamp in milliseconds */
  timestamp: number;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Represents a single validation error.
 */
export interface ValidationError {
  /** The field name that failed validation */
  field: string;

  /** Human-readable error message */
  message: string;

  /** The invalid value (optional, for debugging) */
  value?: unknown;
}

/**
 * Result of a configuration validation operation.
 */
export interface ValidationResult {
  /** Whether the configuration is valid */
  valid: boolean;

  /** Array of validation errors (empty if valid) */
  errors: ValidationError[];
}

// ============================================================================
// OpenCode Plugin API Types
// ============================================================================

/**
 * Shell API provided by Bun for executing commands.
 */
export type ShellAPI = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<{ stdout: string; stderr: string; exitCode: number }>;

/**
 * Context provided to the plugin by OpenCode.
 */
export interface PluginContext {
  /** The current project information */
  project: {
    name?: string;
    path?: string;
  };

  /** The current working directory */
  directory: string;

  /** The git worktree path */
  worktree?: string;

  /** OpenCode SDK client for interacting with the AI */
  client: unknown;

  /** Bun's shell API for executing commands */
  $: ShellAPI;
}

/**
 * TUI prompt append event input.
 */
export interface TuiPromptAppendInput {
  /** The current prompt text */
  prompt: string;
}

/**
 * TUI prompt append event output.
 */
export interface TuiPromptAppendOutput {
  /** Text to append to the prompt */
  append: string;
}

/**
 * Available plugin hooks for OpenCode events.
 */
export interface PluginHooks {
  /** Hook called to append text to the TUI prompt */
  'tui.prompt.append'?: (
    input: TuiPromptAppendInput,
    output: TuiPromptAppendOutput
  ) => Promise<void> | void;

  /** Hook called when a session is created */
  'session.created'?: () => Promise<void> | void;

  /** Hook called when a session becomes idle */
  'session.idle'?: () => Promise<void> | void;

  /** Generic event handler */
  event?: (data: { event: { type: string; [key: string]: unknown } }) => Promise<void> | void;
}

/**
 * Plugin factory function type.
 * Receives context and returns available hooks.
 */
export type Plugin = (ctx: PluginContext) => Promise<PluginHooks>;
