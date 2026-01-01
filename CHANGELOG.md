# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.3] - 2026-01-01

### Fixed
- **Root cause fix**: Plugin now only exports `default` (no named `plugin` export)
- OpenCode iterates all exports and calls each as a plugin, so having both `plugin` and `default` caused the plugin to run twice

## [0.6.2] - 2026-01-01

### Fixed
- Fixed duplicate time stamps by checking if text already starts with time prefix
- Deduplication now works correctly even when plugin is initialized multiple times

## [0.6.1] - 2026-01-01

### Changed
- Time is now prepended at the beginning of the message instead of appended at the end
- Added deduplication to prevent time appearing twice if hook is called multiple times

### Fixed
- Fixed duplicate time stamps appearing in messages

## [0.6.0] - 2026-01-01

### Changed
- **BREAKING**: Main entry now only exports `plugin` function (no utility exports)
- Utility functions moved to `opencode-time-refresh/utils` subpath
- This fixes OpenCode plugin loading which iterates all exports and calls them as functions

### Fixed
- Fixed "fn3 is not a function" error by ensuring only plugin functions are exported from main entry

## [0.5.0] - 2026-01-01

### Changed
- **BREAKING**: Now uses `chat.message` hook to append time to each user message
- Uses official `@opencode-ai/plugin` types as peer dependency
- Time is appended to user messages, creating a timeline in conversation history

### Fixed
- Fixed plugin loading by using correct OpenCode hook API
- Plugin now properly typed with `Plugin`, `PluginInput`, and `Hooks` from `@opencode-ai/plugin`

## [0.4.0] - 2026-01-01

### Changed
- **BREAKING**: Switched to esbuild bundling for OpenCode compatibility
- Main entry point is now a single bundled file (`dist/index.js`)
- Removed separate `./utils` export path (all exports now from main entry)

### Fixed
- Fixed plugin loading in OpenCode (was getting "fn3 is not a function" error)
- Plugin now properly exports as both named `plugin` and default export

## [0.3.0] - 2026-01-01

### Changed
- Renamed main export from `TimeRefreshPlugin` to `plugin` (matching opencode-wakatime pattern)
- Created separate `src/plugin.ts` entry point
- Updated package.json exports

## [0.2.0] - 2026-01-01

### Changed
- Updated to use OpenCode's actual plugin API (`tui.prompt.append` hook)
- Plugin now reads config from `.opencode/time-refresh.json` instead of opencode.json

## [0.1.0] - 2026-01-01

### Added
- Initial release
- ISO, locale, and custom time format support
- Timezone support with IANA timezone names
- Configurable prefix and suffix
- Configuration validation with helpful error messages
- `getTimeContext()` helper for programmatic access
- `getFormattedTime()` helper for quick time string generation
- Comprehensive test suite with 99%+ coverage
