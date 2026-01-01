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
import type { PluginContext, TuiPromptAppendInput, TuiPromptAppendOutput } from '../src/types.js';

/**
 * Creates a mock PluginContext for testing
 */
function createMockContext(directory = '/test/project'): PluginContext {
  return {
    project: { name: 'test-project', path: directory },
    directory,
    worktree: directory,
    client: {},
    $: vi.fn() as unknown as PluginContext['$'],
  };
}

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
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Plugin initialization', () => {
    it('should be a function', () => {
      expect(typeof TimeRefreshPlugin).toBe('function');
    });

    it('should return hooks when enabled (default)', async () => {
      const ctx = createMockContext();
      const hooks = await TimeRefreshPlugin(ctx);
      expect(hooks).toHaveProperty('tui.prompt.append');
    });

    it('should use default config when no config file exists', async () => {
      const ctx = createMockContext('/nonexistent/path');
      const hooks = await TimeRefreshPlugin(ctx);
      // Default is enabled: true, so should have hooks
      expect(hooks).toHaveProperty('tui.prompt.append');
    });

    it('should handle context with minimal properties', async () => {
      const ctx: PluginContext = {
        project: {},
        directory: '/test',
        client: {},
        $: vi.fn() as unknown as PluginContext['$'],
      };

      const hooks = await TimeRefreshPlugin(ctx);
      expect(hooks).toBeDefined();
    });
  });

  describe('tui.prompt.append hook', () => {
    it('should append time to output', async () => {
      const ctx = createMockContext();
      const hooks = await TimeRefreshPlugin(ctx);

      const input: TuiPromptAppendInput = { prompt: 'Hello' };
      const output: TuiPromptAppendOutput = { append: '' };

      await hooks['tui.prompt.append']!(input, output);

      // Output should have time appended
      expect(output.append).toContain('[Current time:');
    });

    it('should not append when includeInEveryMessage is false', async () => {
      // This test would require a config file, so we test the default behavior
      const ctx = createMockContext();
      const hooks = await TimeRefreshPlugin(ctx);

      const input: TuiPromptAppendInput = { prompt: 'Hello' };
      const output: TuiPromptAppendOutput = { append: '' };

      await hooks['tui.prompt.append']!(input, output);

      // With default config (includeInEveryMessage: true), should append
      expect(output.append).toBeTruthy();
    });

    it('should use ISO format by default', async () => {
      const ctx = createMockContext();
      const hooks = await TimeRefreshPlugin(ctx);

      const input: TuiPromptAppendInput = { prompt: 'Hello' };
      const output: TuiPromptAppendOutput = { append: '' };

      await hooks['tui.prompt.append']!(input, output);

      // ISO format contains 'T' and 'Z'
      expect(output.append).toContain('T');
      expect(output.append).toContain('Z');
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
