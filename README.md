# opencode-time-refresh

[![npm version](https://img.shields.io/npm/v/opencode-time-refresh.svg)](https://www.npmjs.com/package/opencode-time-refresh)
[![CI](https://github.com/PauloDevelo/timerefresh-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/PauloDevelo/timerefresh-plugin/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An OpenCode plugin that automatically injects current time context into user messages, enabling time-aware AI interactions.

## Features

- **Automatic Time Injection** - Prepends current time to every user message
- **Multiple Format Options** - ISO 8601, locale-specific, or custom format strings
- **Timezone Support** - Full IANA timezone support (e.g., `America/New_York`, `Europe/London`)
- **Configurable Output** - Customizable prefix and suffix for time strings
- **Validation** - Configuration validation with helpful error messages
- **TypeScript** - Full TypeScript support with exported types
- **Zero Dependencies** - No external runtime dependencies

## Installation

```bash
npm install opencode-time-refresh
```

## Quick Start

Add the plugin to your OpenCode configuration:

**opencode.json:**
```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-time-refresh"]
}
```

That's it! The plugin will automatically prepend the current time to every message you send.

**Example output:**
```
[Current time: 2026-01-15T10:30:00.000Z]

Your message here
```

## Configuration

Create a `time-refresh.json` file in your `.opencode` directory for custom settings:

```
your-project/
├── .opencode/
│   └── time-refresh.json    <-- Plugin configuration
└── opencode.json
```

**.opencode/time-refresh.json:**
```json
{
  "enabled": true,
  "format": "locale",
  "timezone": "America/New_York",
  "prefix": "[Time: ",
  "suffix": "]"
}
```

### Configuration Options

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
  "format": "iso"
}
```

Output: `[Current time: 2026-01-15T10:30:00.000Z]`

### Locale Format

Uses the system's locale settings for formatting:

```json
{
  "format": "locale",
  "timezone": "America/New_York"
}
```

Output: `[Current time: 1/15/2026, 5:30:00 AM]`

### Custom Format

Define your own format using tokens:

```json
{
  "format": "custom",
  "customFormat": "YYYY-MM-DD HH:mm:ss",
  "timezone": "UTC"
}
```

Output: `[Current time: 2026-01-15 10:30:00]`

### Custom Format Tokens

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

## Timezone Configuration

Use any valid IANA timezone identifier:

```json
{
  "timezone": "America/New_York"
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

## Programmatic API

For programmatic use, import utilities from the `/utils` subpath:

```typescript
import {
  getTimeContext,
  getFormattedTime,
  formatTime,
  createTimeContext,
  validateConfig,
  loadConfig,
  DEFAULT_CONFIG,
} from 'opencode-time-refresh/utils';
```

### getTimeContext(config?)

Returns a `TimeContext` object with various time representations:

```typescript
import { getTimeContext } from 'opencode-time-refresh/utils';

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
import { getFormattedTime } from 'opencode-time-refresh/utils';

const timeString = getFormattedTime({
  format: 'custom',
  customFormat: 'YYYY-MM-DD HH:mm',
  prefix: 'Time: ',
  suffix: ''
});

console.log(timeString); // "Time: 2026-01-15 10:30"
```

### validateConfig(config)

Validates a configuration object:

```typescript
import { validateConfig, DEFAULT_CONFIG } from 'opencode-time-refresh/utils';

const result = validateConfig({
  ...DEFAULT_CONFIG,
  timezone: 'Invalid/Zone'
});

if (!result.valid) {
  console.log(result.errors);
  // [{ field: 'timezone', message: "timezone 'Invalid/Zone' is not a valid IANA timezone identifier" }]
}
```

## Types

All types are exported from the `/utils` subpath:

```typescript
import type {
  TimeRefreshConfig,
  TimeContext,
  TimeFormat,
  ValidationResult,
  ValidationError,
} from 'opencode-time-refresh/utils';
```

## Troubleshooting

### Plugin not loading

Make sure you're using `"plugin"` (not `"plugins"`) in your opencode.json:

```json
{
  "plugin": ["opencode-time-refresh"]
}
```

### Configuration not being applied

The plugin looks for configuration in these locations (in order):
1. `.opencode/time-refresh.json`
2. `time-refresh.json` (project root)

If no config file is found, default settings are used.

### Time not appearing in messages

Check that:
1. `enabled` is `true` (default)
2. `includeInEveryMessage` is `true` (default)
3. The plugin is listed in your `opencode.json`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
