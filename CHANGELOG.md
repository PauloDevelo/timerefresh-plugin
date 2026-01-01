# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
