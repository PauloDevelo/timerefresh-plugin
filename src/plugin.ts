/**
 * OpenCode Time Refresh Plugin - Main Plugin Entry
 * This file exports ONLY the plugin function for OpenCode compatibility.
 */

import type { PluginContext, PluginHooks } from './types.js';
import { loadConfig, validateConfig } from './config.js';
import { formatTime } from './formatter.js';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_FILE_NAME = 'time-refresh.json';

/**
 * Attempts to load plugin configuration from a JSON file.
 */
function loadConfigFromFile(directory: string): Record<string, unknown> | undefined {
  const possiblePaths = [
    path.join(directory, '.opencode', CONFIG_FILE_NAME),
    path.join(directory, CONFIG_FILE_NAME),
  ];

  for (const configPath of possiblePaths) {
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch {
      // Ignore errors
    }
  }
  return undefined;
}

/**
 * OpenCode Time Refresh Plugin
 * Automatically injects current time into prompts.
 */
export const plugin = async (ctx: PluginContext): Promise<PluginHooks> => {
  const fileConfig = loadConfigFromFile(ctx.directory);
  const config = loadConfig(fileConfig);

  const validation = validateConfig(config);
  if (!validation.valid) {
    console.warn('[time-refresh] Config warnings:', validation.errors.map(e => e.message).join('; '));
  }

  if (!config.enabled) {
    return {};
  }

  return {
    'tui.prompt.append': async (_input, output) => {
      if (!config.includeInEveryMessage) return;
      output.append = formatTime(new Date(), config);
    },
  };
};

export default plugin;
