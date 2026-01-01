/**
 * Tests for the TimeRefreshPlugin core implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  TimeRefreshPlugin,
  pluginMeta,
  VERSION,
  getTimeContext,
  getFormattedTime,
  DEFAULT_CONFIG,
} from '../src/index.js';
import type { PluginContext, MessageInput, MessageOutput } from '../src/types.js';

describe('Plugin Metadata', () => {
  it('should export VERSION constant', () => {
    expect(VERSION).toBe('0.1.0');
  });

  it('should export pluginMeta with correct properties', () => {
    expect(pluginMeta).toEqual({
      name: 'opencode-time-refresh',
      version: VERSION,
      description: 'Automatically inject current time into messages',
    });
  });
});

describe('getTimeContext', () => {
  it('should return TimeContext with all required fields', () => {
    const context = getTimeContext();

    expect(context).toHaveProperty('iso');
    expect(context).toHaveProperty('local');
    expect(context).toHaveProperty('date');
    expect(context).toHaveProperty('time');
    expect(context).toHaveProperty('timezone');
    expect(context).toHaveProperty('dayOfWeek');
    expect(context).toHaveProperty('timestamp');
  });

  it('should use provided timezone', () => {
    const context = getTimeContext({ timezone: 'UTC' });
    expect(context.timezone).toBe('UTC');
  });

  it('should handle undefined config', () => {
    const context = getTimeContext(undefined);
    expect(context).toHaveProperty('iso');
  });

  it('should return valid ISO string', () => {
    const context = getTimeContext();
    expect(() => new Date(context.iso)).not.toThrow();
  });
});

describe('getFormattedTime', () => {
  it('should return formatted time string with default config', () => {
    const timeString = getFormattedTime();

    // Should have default prefix and suffix
    expect(timeString).toMatch(/^\[Current time: .+\]$/);
  });

  it('should respect custom prefix and suffix', () => {
    const timeString = getFormattedTime({
      prefix: '<<',
      suffix: '>>',
    });

    expect(timeString).toMatch(/^<<.+>>$/);
  });

  it('should use locale format when specified', () => {
    const timeString = getFormattedTime({ format: 'locale' });
    expect(timeString).toBeTruthy();
  });

  it('should use ISO format when specified', () => {
    const timeString = getFormattedTime({ format: 'iso' });
    // ISO format contains 'T' and 'Z'
    expect(timeString).toContain('T');
    expect(timeString).toContain('Z');
  });
});

describe('TimeRefreshPlugin', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('Plugin initialization', () => {
    it('should be a function', () => {
      expect(typeof TimeRefreshPlugin).toBe('function');
    });

    it('should return hooks when enabled', async () => {
      const ctx: PluginContext = {
        config: {
          timeRefresh: { enabled: true },
        },
      };

      const hooks = await TimeRefreshPlugin(ctx);
      expect(hooks).toHaveProperty('message.updated');
    });

    it('should return empty hooks when disabled', async () => {
      const ctx: PluginContext = {
        config: {
          timeRefresh: { enabled: false },
        },
      };

      const hooks = await TimeRefreshPlugin(ctx);
      expect(hooks).toEqual({});
    });

    it('should use default config when no config provided', async () => {
      const ctx: PluginContext = {
        config: {},
      };

      const hooks = await TimeRefreshPlugin(ctx);
      // Default is enabled: true, so should have hooks
      expect(hooks).toHaveProperty('message.updated');
    });

    it('should handle undefined config gracefully', async () => {
      const ctx: PluginContext = {
        config: {},
      };

      const hooks = await TimeRefreshPlugin(ctx);
      expect(hooks).toBeDefined();
    });
  });

  describe('Configuration validation', () => {
    it('should warn on invalid configuration', async () => {
      const ctx: PluginContext = {
        config: {
          timeRefresh: {
            format: 'invalid-format' as any,
          },
        },
      };

      await TimeRefreshPlugin(ctx);
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('[time-refresh]');
    });

    it('should not warn on valid configuration', async () => {
      const ctx: PluginContext = {
        config: {
          timeRefresh: {
            enabled: true,
            format: 'iso',
          },
        },
      };

      await TimeRefreshPlugin(ctx);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('message.updated hook', () => {
    it('should inject time into user messages', async () => {
      const ctx: PluginContext = {
        config: {
          timeRefresh: {
            enabled: true,
            includeInEveryMessage: true,
          },
        },
      };

      const hooks = await TimeRefreshPlugin(ctx);
      const input: MessageInput = { content: 'Hello', role: 'user' };
      const output: MessageOutput = { content: 'Hello' };

      await hooks['message.updated']!(input, output);

      // Output should be modified with time prefix
      expect(output.content).toContain('[Current time:');
      expect(output.content).toContain('Hello');
    });

    it('should not modify assistant messages', async () => {
      const ctx: PluginContext = {
        config: {
          timeRefresh: {
            enabled: true,
            includeInEveryMessage: true,
          },
        },
      };

      const hooks = await TimeRefreshPlugin(ctx);
      const input: MessageInput = { content: 'Response', role: 'assistant' };
      const output: MessageOutput = { content: 'Response' };

      await hooks['message.updated']!(input, output);

      // Output should not be modified
      expect(output.content).toBe('Response');
    });

    it('should not modify system messages', async () => {
      const ctx: PluginContext = {
        config: {
          timeRefresh: {
            enabled: true,
            includeInEveryMessage: true,
          },
        },
      };

      const hooks = await TimeRefreshPlugin(ctx);
      const input: MessageInput = { content: 'System prompt', role: 'system' };
      const output: MessageOutput = { content: 'System prompt' };

      await hooks['message.updated']!(input, output);

      expect(output.content).toBe('System prompt');
    });

    it('should respect includeInEveryMessage: false', async () => {
      const ctx: PluginContext = {
        config: {
          timeRefresh: {
            enabled: true,
            includeInEveryMessage: false,
          },
        },
      };

      const hooks = await TimeRefreshPlugin(ctx);
      const input: MessageInput = { content: 'Hello', role: 'user' };
      const output: MessageOutput = { content: 'Hello' };

      await hooks['message.updated']!(input, output);

      // Output should not be modified
      expect(output.content).toBe('Hello');
    });

    it('should attach time context metadata', async () => {
      const ctx: PluginContext = {
        config: {
          timeRefresh: {
            enabled: true,
            includeInEveryMessage: true,
          },
        },
      };

      const hooks = await TimeRefreshPlugin(ctx);
      const input: MessageInput = { content: 'Hello', role: 'user' };
      const output: MessageOutput & Record<string, unknown> = { content: 'Hello' };

      await hooks['message.updated']!(input, output);

      expect(output._timeContext).toBeDefined();
      expect(output._timeString).toBeDefined();
    });

    it('should use custom prefix and suffix', async () => {
      const ctx: PluginContext = {
        config: {
          timeRefresh: {
            enabled: true,
            includeInEveryMessage: true,
            prefix: '[[TIME: ',
            suffix: ']]',
          },
        },
      };

      const hooks = await TimeRefreshPlugin(ctx);
      const input: MessageInput = { content: 'Hello', role: 'user' };
      const output: MessageOutput = { content: 'Hello' };

      await hooks['message.updated']!(input, output);

      expect(output.content).toContain('[[TIME:');
      expect(output.content).toContain(']]');
    });
  });
});

describe('Default export', () => {
  it('should export TimeRefreshPlugin as default', async () => {
    const defaultExport = (await import('../src/index.js')).default;
    expect(defaultExport).toBe(TimeRefreshPlugin);
  });
});

describe('Re-exports', () => {
  it('should re-export types', async () => {
    const exports = await import('../src/index.js');
    // Types are compile-time only, but we can check that the module loads
    expect(exports).toBeDefined();
  });

  it('should re-export config functions', async () => {
    const { loadConfig, validateConfig, DEFAULT_CONFIG } = await import('../src/index.js');
    expect(typeof loadConfig).toBe('function');
    expect(typeof validateConfig).toBe('function');
    expect(DEFAULT_CONFIG).toBeDefined();
  });

  it('should re-export formatter functions', async () => {
    const { formatTime, createTimeContext, isValidTimezone } = await import('../src/index.js');
    expect(typeof formatTime).toBe('function');
    expect(typeof createTimeContext).toBe('function');
    expect(typeof isValidTimezone).toBe('function');
  });
});
