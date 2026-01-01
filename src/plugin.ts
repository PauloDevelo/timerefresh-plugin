/**
 * OpenCode Time Refresh Plugin - Minimal Entry Point
 * 
 * This file exports ONLY the plugin function for OpenCode compatibility.
 * OpenCode iterates over all exports and calls them as plugin functions,
 * so we must not export anything else here.
 * 
 * For utility functions, import from 'opencode-time-refresh/utils'
 */

import type { Plugin, PluginInput, Hooks } from '@opencode-ai/plugin';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Inline Types (to avoid re-exporting)
// ============================================================================

type TimeFormat = 'iso' | 'locale' | 'custom';

interface TimeRefreshConfig {
  enabled: boolean;
  format: TimeFormat;
  customFormat: string;
  timezone: string;
  includeInEveryMessage: boolean;
  prefix: string;
  suffix: string;
}

// ============================================================================
// Inline Config (to avoid re-exporting)
// ============================================================================

const DEFAULT_CONFIG: TimeRefreshConfig = {
  enabled: true,
  format: 'iso',
  customFormat: 'YYYY-MM-DD HH:mm:ss',
  timezone: '',
  includeInEveryMessage: true,
  prefix: '[Current time: ',
  suffix: ']',
};

function loadConfig(userConfig?: Partial<TimeRefreshConfig> | null): TimeRefreshConfig {
  if (userConfig == null) {
    return { ...DEFAULT_CONFIG };
  }
  return { ...DEFAULT_CONFIG, ...userConfig };
}

// ============================================================================
// Inline Formatter (to avoid re-exporting)
// ============================================================================

function isValidTimezone(timezone: string): boolean {
  if (timezone === '') return true;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
}

function getSystemTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function formatTime(date: Date, config: TimeRefreshConfig): string {
  const timezone = config.timezone && isValidTimezone(config.timezone) 
    ? config.timezone 
    : getSystemTimezone();

  let formatted: string;
  switch (config.format) {
    case 'iso':
      formatted = date.toISOString();
      break;
    case 'locale':
      formatted = date.toLocaleString(undefined, { timeZone: timezone });
      break;
    case 'custom':
      formatted = formatCustom(date, config.customFormat, timezone);
      break;
    default:
      formatted = date.toISOString();
  }

  return `${config.prefix}${formatted}${config.suffix}`;
}

function formatCustom(date: Date, format: string, timezone?: string): string {
  const parts = getDateParts(date, timezone);
  let result = format;
  
  const replacements: Record<string, string> = {
    'YYYY': parts.year.toString().padStart(4, '0'),
    'YY': (parts.year % 100).toString().padStart(2, '0'),
    'MM': parts.month.toString().padStart(2, '0'),
    'M': parts.month.toString(),
    'DD': parts.day.toString().padStart(2, '0'),
    'D': parts.day.toString(),
    'HH': parts.hour.toString().padStart(2, '0'),
    'H': parts.hour.toString(),
    'mm': parts.minute.toString().padStart(2, '0'),
    'm': parts.minute.toString(),
    'ss': parts.second.toString().padStart(2, '0'),
    's': parts.second.toString(),
  };

  for (const [token, value] of Object.entries(replacements)) {
    result = result.split(token).join(value);
  }

  return result;
}

function getDateParts(date: Date, timezone?: string) {
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

  const getValue = (type: string): number => {
    const part = parts.find((p) => p.type === type);
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

// ============================================================================
// Configuration Loading
// ============================================================================

const CONFIG_FILE_NAME = 'time-refresh.json';

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
      // Ignore errors
    }
  }

  return undefined;
}

// ============================================================================
// Plugin Implementation
// ============================================================================

/**
 * OpenCode Time Refresh Plugin
 * Automatically injects current time into user messages.
 */
export const plugin: Plugin = async (ctx: PluginInput): Promise<Hooks> => {
  const fileConfig = loadConfigFromFile(ctx.directory);
  const config = loadConfig(fileConfig);

  if (!config.enabled) {
    return {};
  }

  // Track which messages we've already processed to avoid duplicates
  const processedMessages = new Set<string>();

  return {
    'chat.message': async (_input, output) => {
      if (!config.includeInEveryMessage) {
        return;
      }

      // Avoid processing the same message twice
      const messageKey = _input.messageID || _input.sessionID;
      if (processedMessages.has(messageKey)) {
        return;
      }
      processedMessages.add(messageKey);

      const now = new Date();
      const timeString = formatTime(now, config);

      // Find the first text part and prepend time to it
      const textParts = output.parts.filter(
        (p): p is { type: 'text'; text: string; id: string; sessionID: string; messageID: string } =>
          p.type === 'text'
      );

      if (textParts.length > 0) {
        // Prepend to the first text part
        const firstTextPart = textParts[0];
        firstTextPart.text = `${timeString}\n\n${firstTextPart.text}`;
      } else {
        // Add a new text part at the beginning with just the time
        output.parts.unshift({
          id: `time-${Date.now()}`,
          sessionID: _input.sessionID,
          messageID: _input.messageID || '',
          type: 'text',
          text: timeString,
        } as typeof output.parts[number]);
      }
    },
  };
};

// Only export the plugin function - nothing else!
export default plugin;
