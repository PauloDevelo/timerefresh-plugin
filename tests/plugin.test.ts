/**
 * Tests for the TimeRefreshPlugin core implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import plugin from '../src/plugin.js';
import {
  pluginMeta,
  VERSION,
  getTimeContext,
  getFormattedTime,
  DEFAULT_CONFIG,
} from '../src/index.js';
import type { PluginInput, Hooks } from '@opencode-ai/plugin';

// Alias for tests
const TimeRefreshPlugin = plugin;

/**
 * Creates a mock PluginInput for testing
 */
function createMockContext(directory = '/test/project'): PluginInput {
  return {
    project: { worktree: directory } as PluginInput['project'],
    directory,
    worktree: directory,
    serverUrl: new URL('http://localhost:3000'),
    client: {} as PluginInput['client'],
    $: vi.fn() as unknown as PluginInput['$'],
  };
}

/**
 * Creates a mock text part for testing
 */
function createMockTextPart(text: string, sessionID = 'session-1', messageID = 'msg-1') {
  return {
    id: `part-${Date.now()}`,
    sessionID,
    messageID,
    type: 'text' as const,
    text,
  };
}

describe('Plugin Metadata', () => {
  it('should export VERSION constant', () => {
    expect(VERSION).toBe('0.5.0');
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
      expect(hooks).toHaveProperty('chat.message');
    });

    it('should use default config when no config file exists', async () => {
      const ctx = createMockContext('/nonexistent/path');
      const hooks = await TimeRefreshPlugin(ctx);
      // Default is enabled: true, so should have hooks
      expect(hooks).toHaveProperty('chat.message');
    });

    it('should handle context with minimal properties', async () => {
      const ctx: PluginInput = {
        project: {} as PluginInput['project'],
        directory: '/test',
        worktree: '/test',
        serverUrl: new URL('http://localhost:3000'),
        client: {} as PluginInput['client'],
        $: vi.fn() as unknown as PluginInput['$'],
      };

      const hooks = await TimeRefreshPlugin(ctx);
      expect(hooks).toBeDefined();
    });
  });

  describe('chat.message hook', () => {
    it('should prepend time to existing text part', async () => {
      const ctx = createMockContext();
      const hooks = await TimeRefreshPlugin(ctx);

      const input = { sessionID: 'session-1', messageID: 'msg-1' };
      const textPart = createMockTextPart('Hello, world!');
      const output = { 
        message: {} as any, 
        parts: [textPart] as any[]
      };

      await hooks['chat.message']!(input, output);

      // Text should have time prepended
      expect(output.parts[0].text).toContain('Hello, world!');
      expect(output.parts[0].text).toContain('[Current time:');
      // Time should be at the beginning
      expect(output.parts[0].text.startsWith('[Current time:')).toBe(true);
    });

    it('should add new text part at beginning when no text parts exist', async () => {
      const ctx = createMockContext();
      const hooks = await TimeRefreshPlugin(ctx);

      const input = { sessionID: 'session-1', messageID: 'msg-1' };
      const output = { 
        message: {} as any, 
        parts: [] as any[]
      };

      await hooks['chat.message']!(input, output);

      // Should have added a new part
      expect(output.parts.length).toBe(1);
      expect(output.parts[0].type).toBe('text');
      expect(output.parts[0].text).toContain('[Current time:');
    });

    it('should use ISO format by default', async () => {
      const ctx = createMockContext();
      const hooks = await TimeRefreshPlugin(ctx);

      const input = { sessionID: 'session-1', messageID: 'msg-1' };
      const textPart = createMockTextPart('Test message');
      const output = { 
        message: {} as any, 
        parts: [textPart] as any[]
      };

      await hooks['chat.message']!(input, output);

      // ISO format contains 'T' and 'Z'
      expect(output.parts[0].text).toContain('T');
      expect(output.parts[0].text).toContain('Z');
    });

    it('should prepend to the first text part when multiple exist', async () => {
      const ctx = createMockContext();
      const hooks = await TimeRefreshPlugin(ctx);

      const input = { sessionID: 'session-1', messageID: 'msg-1' };
      const textPart1 = createMockTextPart('First part');
      const textPart2 = createMockTextPart('Second part');
      const output = { 
        message: {} as any, 
        parts: [textPart1, textPart2] as any[]
      };

      await hooks['chat.message']!(input, output);

      // First part should have time prepended
      expect(output.parts[0].text).toContain('First part');
      expect(output.parts[0].text).toContain('[Current time:');
      expect(output.parts[0].text.startsWith('[Current time:')).toBe(true);
      // Second part should be unchanged
      expect(output.parts[1].text).toBe('Second part');
    });

    it('should not process the same message twice', async () => {
      const ctx = createMockContext();
      const hooks = await TimeRefreshPlugin(ctx);

      const input = { sessionID: 'session-1', messageID: 'msg-1' };
      const textPart = createMockTextPart('Hello');
      const output = { 
        message: {} as any, 
        parts: [textPart] as any[]
      };

      // Call twice with same messageID
      await hooks['chat.message']!(input, output);
      const textAfterFirst = output.parts[0].text;
      
      await hooks['chat.message']!(input, output);
      const textAfterSecond = output.parts[0].text;

      // Text should be the same after both calls (no duplicate time)
      expect(textAfterFirst).toBe(textAfterSecond);
    });
  });
});

describe('Default export', () => {
  it('should export only default from plugin.ts (no named exports)', async () => {
    const mod = await import('../src/plugin.js');
    // Should only have 'default' export - no named 'plugin' export
    // This is critical: OpenCode calls every export as a plugin function
    expect(Object.keys(mod)).toEqual(['default']);
    expect(typeof mod.default).toBe('function');
  });

  it('should export plugin from index.js (utils entry)', async () => {
    const { plugin: indexPlugin, TimeRefreshPlugin } = await import('../src/index.js');
    expect(typeof indexPlugin).toBe('function');
    expect(TimeRefreshPlugin).toBe(indexPlugin);
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
