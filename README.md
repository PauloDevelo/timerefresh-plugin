# opencode-time-refresh

[![npm version](https://img.shields.io/npm/v/opencode-time-refresh.svg)](https://www.npmjs.com/package/opencode-time-refresh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An OpenCode plugin that automatically injects current time context into messages, enabling time-aware AI interactions.

## Features

- **Multiple Format Options** - ISO 8601, locale-specific, or custom format strings
- **Timezone Support** - Full IANA timezone support (e.g., `America/New_York`, `Europe/London`)
- **Configurable Output** - Customizable prefix and suffix for time strings
- **Validation** - Configuration validation with helpful error messages
- **Helper Functions** - Programmatic access via `getTimeContext()` and `getFormattedTime()`
- **TypeScript** - Full TypeScript support with exported types
- **Zero Dependencies** - No external runtime dependencies

## Installation

```bash
npm install opencode-time-refresh
```

## Quick Start

Add the plugin to your OpenCode configuration:

```json
{
  "plugins": ["opencode-time-refresh"],
  "timeRefresh": {
    "enabled": true,
    "format": "iso"
  }
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable or disable the plugin |
| `format` | `'iso' \| 'locale' \| 'custom'` | `'iso'` | Time format to use |
| `customFormat` | `string` | `'YYYY-MM-DD HH:mm:ss'` | Custom format string (when format is `'custom'`) |
| `timezone` | `string` | `''` (system) | IANA timezone identifier |
| `includeInEveryMessage` | `boolean` | `true` | Include time in every user message |
| `prefix` | `string` | `'[Current time: '` | String to prepend before time |
| `suffix` | `string` | `']'` | String to append after time |

## Format Options

### ISO Format (default)

```json
{
  "timeRefresh": {
    "format": "iso"
  }
}
```

Output: `[Current time: 2026-01-15T10:30:00.000Z]`

### Locale Format

Uses the system's locale settings for formatting:

```json
{
  "timeRefresh": {
    "format": "locale",
    "timezone": "America/New_York"
  }
}
```

Output: `[Current time: 1/15/2026, 5:30:00 AM]`

### Custom Format

Define your own format using tokens:

```json
{
  "timeRefresh": {
    "format": "custom",
    "customFormat": "YYYY-MM-DD HH:mm:ss",
    "timezone": "UTC"
  }
}
```

Output: `[Current time: 2026-01-15 10:30:00]`

## Custom Format Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `YYYY` | 4-digit year | `2026` |
| `YY` | 2-digit year | `26` |
| `MM` | 2-digit month (zero-padded) | `01`-`12` |
| `M` | Month (no padding) | `1`-`12` |
| `DD` | 2-digit day (zero-padded) | `01`-`31` |
| `D` | Day (no padding) | `1`-`31` |
| `HH` | 2-digit hour, 24-hour (zero-padded) | `00`-`23` |
| `H` | Hour, 24-hour (no padding) | `0`-`23` |
| `mm` | 2-digit minute (zero-padded) | `00`-`59` |
| `m` | Minute (no padding) | `0`-`59` |
| `ss` | 2-digit second (zero-padded) | `00`-`59` |
| `s` | Second (no padding) | `0`-`59` |

### Custom Format Examples

```json
// Date only
{ "customFormat": "YYYY-MM-DD" }           // 2026-01-15

// Time only
{ "customFormat": "HH:mm:ss" }             // 10:30:00

// US-style date
{ "customFormat": "MM/DD/YYYY" }           // 01/15/2026

// European-style date
{ "customFormat": "DD.MM.YYYY" }           // 15.01.2026

// Compact datetime
{ "customFormat": "YYYYMMDD_HHmmss" }      // 20260115_103000

// Human-readable
{ "customFormat": "YYYY-MM-DD at HH:mm" }  // 2026-01-15 at 10:30
```

## Timezone Configuration

Use any valid IANA timezone identifier:

```json
{
  "timeRefresh": {
    "timezone": "America/New_York"
  }
}
```

Common timezone examples:
- `UTC` - Coordinated Universal Time
- `America/New_York` - Eastern Time
- `America/Los_Angeles` - Pacific Time
- `Europe/London` - British Time
- `Europe/Paris` - Central European Time
- `Asia/Tokyo` - Japan Standard Time
- `Australia/Sydney` - Australian Eastern Time

Leave empty (`""`) to use the system's local timezone.

## API Reference

### TimeRefreshPlugin

The main plugin export. Use this in your OpenCode configuration:

```typescript
import { TimeRefreshPlugin } from 'opencode-time-refresh';

// Or as default import
import TimeRefreshPlugin from 'opencode-time-refresh';
```

### getTimeContext(config?)

Returns a `TimeContext` object with various time representations:

```typescript
import { getTimeContext } from 'opencode-time-refresh';

const context = getTimeContext({ timezone: 'America/New_York' });

console.log(context);
// {
//   iso: '2026-01-15T10:30:00.000Z',
//   local: '1/15/2026, 5:30:00 AM',
//   date: '1/15/2026',
//   time: '5:30:00 AM',
//   timezone: 'America/New_York',
//   dayOfWeek: 'Wednesday',
//   timestamp: 1736937000000
// }
```

### getFormattedTime(config?)

Returns the formatted time string with prefix and suffix:

```typescript
import { getFormattedTime } from 'opencode-time-refresh';

const timeString = getFormattedTime({
  format: 'custom',
  customFormat: 'YYYY-MM-DD HH:mm',
  prefix: 'Time: ',
  suffix: ''
});

console.log(timeString); // "Time: 2026-01-15 10:30"
```

### formatTime(date, config)

Low-level formatting function:

```typescript
import { formatTime, DEFAULT_CONFIG } from 'opencode-time-refresh';

const formatted = formatTime(new Date(), {
  ...DEFAULT_CONFIG,
  format: 'locale'
});
```

### createTimeContext(date, timezone?)

Creates a TimeContext from a specific date:

```typescript
import { createTimeContext } from 'opencode-time-refresh';

const context = createTimeContext(new Date(), 'Europe/London');
```

### validateConfig(config)

Validates a configuration object:

```typescript
import { validateConfig, DEFAULT_CONFIG } from 'opencode-time-refresh';

const result = validateConfig({
  ...DEFAULT_CONFIG,
  timezone: 'Invalid/Zone'
});

if (!result.valid) {
  console.log(result.errors);
  // [{ field: 'timezone', message: "timezone 'Invalid/Zone' is not a valid IANA timezone identifier" }]
}
```

### loadConfig(userConfig?)

Merges user configuration with defaults:

```typescript
import { loadConfig } from 'opencode-time-refresh';

const config = loadConfig({ format: 'locale' });
// Returns full config with defaults applied
```

### DEFAULT_CONFIG

The default configuration values:

```typescript
import { DEFAULT_CONFIG } from 'opencode-time-refresh';

console.log(DEFAULT_CONFIG);
// {
//   enabled: true,
//   format: 'iso',
//   customFormat: 'YYYY-MM-DD HH:mm:ss',
//   timezone: '',
//   includeInEveryMessage: true,
//   prefix: '[Current time: ',
//   suffix: ']'
// }
```

## Types

All types are exported for TypeScript users:

```typescript
import type {
  TimeRefreshConfig,
  TimeContext,
  TimeFormat,
  ValidationResult,
  ValidationError,
  Plugin,
  PluginContext,
  PluginHooks
} from 'opencode-time-refresh';
```

## Full Configuration Example

```json
{
  "plugins": ["opencode-time-refresh"],
  "timeRefresh": {
    "enabled": true,
    "format": "custom",
    "customFormat": "YYYY-MM-DD HH:mm:ss",
    "timezone": "America/New_York",
    "includeInEveryMessage": true,
    "prefix": "[Current time: ",
    "suffix": "]"
  }
}
```

## License

[MIT](LICENSE)
