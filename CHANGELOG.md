# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1](https://github.com/PauloDevelo/timerefresh-plugin/compare/v1.0.0...v1.0.1) (2026-01-03)


### Bug Fixes

* update repository URLs to match actual GitHub repo ([c2a5ae6](https://github.com/PauloDevelo/timerefresh-plugin/commit/c2a5ae665ebc41b5bd44b99a118241063189fc23))

## 1.0.0 (2026-01-03)


### Features

* add AGENTS.md with coding guidelines for AI agents in the plugin ([b64c589](https://github.com/PauloDevelo/timerefresh-plugin/commit/b64c58909d896a399e2fc98cd5f4984bb8b98e56))
* add GitHub Actions CI/CD with automated releases ([d020ffb](https://github.com/PauloDevelo/timerefresh-plugin/commit/d020ffb86bd613a954bf741b7046a0e977dc42e0))
* add linting and formatting scripts to package.json ([37c9ff7](https://github.com/PauloDevelo/timerefresh-plugin/commit/37c9ff7c7b24880b22be597462111998eccd46d6))
* update to version 0.5.0 with breaking changes and improved plugin functionality ([01346be](https://github.com/PauloDevelo/timerefresh-plugin/commit/01346be4e6d687d99424bbcae335030996aa89e6))
* update to version 0.5.0 with breaking changes to message handling and improved time injection ([f41be9d](https://github.com/PauloDevelo/timerefresh-plugin/commit/f41be9dd17d199c6f2b20684656440a9e877604f))
* update to version 0.6.0 with breaking changes to exports and improved plugin functionality ([b228fbb](https://github.com/PauloDevelo/timerefresh-plugin/commit/b228fbbbe4389306409b14e9f32cdaba23e086db))
* update to version 0.6.1 with changes to message handling and deduplication of timestamps ([b44a124](https://github.com/PauloDevelo/timerefresh-plugin/commit/b44a12454410af3009bc551cad53a79c37b5e0d1))
* update to version 0.6.2 with fixes for duplicate timestamps and improved deduplication logic ([d4ddd05](https://github.com/PauloDevelo/timerefresh-plugin/commit/d4ddd051e9e9b31040257d52930f42344c4a9a99))
* update to version 0.6.3 with root cause fix for plugin export to prevent duplicate execution ([6f97935](https://github.com/PauloDevelo/timerefresh-plugin/commit/6f97935bda97c3eb2ced884ef8de94f15b3a4851))

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
