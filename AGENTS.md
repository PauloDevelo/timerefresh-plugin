# AGENTS.md - Coding Agent Guidelines

This document provides guidelines for AI coding agents working in the `opencode-time-refresh` repository.

## Project Overview

OpenCode Time Refresh is a plugin for OpenCode that automatically injects current time context into user messages. It's built with TypeScript, uses ESM modules, and targets Node.js 18+.

## Build/Lint/Test Commands

### Build
```bash
npm run build              # Full build (bundle + types)
npm run build:bundle       # Bundle with esbuild only
npm run build:types        # Generate TypeScript declarations only
npm run clean              # Remove dist/ and coverage/ directories
```

### Lint
```bash
npm run lint               # Run ESLint on src/ and tests/
npm run lint:fix           # Run ESLint with auto-fix
npm run format             # Format with Prettier
npm run format:check       # Check formatting without modifying
```

### Test
```bash
npm run test               # Run all tests once
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report

# Run a single test file
npx vitest run tests/config.test.ts
npx vitest run tests/formatter.test.ts
npx vitest run tests/plugin.test.ts

# Run tests matching a pattern
npx vitest run -t "formatTime"
npx vitest run -t "validateConfig"

# Run a single test in watch mode
npx vitest tests/config.test.ts
```

### Pre-publish Checks
```bash
npm run prepublishOnly     # clean + lint + build + test
```

## Code Style Guidelines

### TypeScript Configuration
- Target: ES2022
- Module: NodeNext with NodeNext resolution
- Strict mode enabled
- All source files in `src/`, tests in `tests/`

### Formatting (Prettier)
- Semicolons: required
- Quotes: single quotes
- Tab width: 2 spaces
- Trailing commas: ES5 style
- Print width: 100 characters
- Bracket spacing: enabled

### Import Style
```typescript
// External dependencies first
import { describe, it, expect } from 'vitest';
import type { Plugin, PluginInput, Hooks } from '@opencode-ai/plugin';

// Internal imports with .js extension (required for ESM)
import type { TimeRefreshConfig, TimeContext } from './types.js';
import { loadConfig, validateConfig, DEFAULT_CONFIG } from './config.js';
import { formatTime, createTimeContext } from './formatter.js';

// Node.js built-ins
import * as fs from 'fs';
import * as path from 'path';
```

### Type Annotations
- Use `type` imports for type-only imports: `import type { ... }`
- Prefer interfaces for object shapes, type aliases for unions/primitives
- Explicit return types are optional (`@typescript-eslint/explicit-function-return-type: off`)
- Avoid `any` when possible (warns on use)

### Naming Conventions
- Files: kebab-case (`config.ts`, `formatter.ts`)
- Types/Interfaces: PascalCase (`TimeRefreshConfig`, `TimeContext`)
- Functions: camelCase (`loadConfig`, `formatTime`, `isValidTimezone`)
- Constants: SCREAMING_SNAKE_CASE (`DEFAULT_CONFIG`, `VERSION`)
- Unused variables: prefix with underscore (`_input`, `_unused`)

### Function Documentation
Use JSDoc comments for public functions:
```typescript
/**
 * Validates if a timezone string is a valid IANA timezone identifier.
 * @param timezone - The timezone string to validate
 * @returns true if valid IANA timezone or empty string (system default)
 */
export function isValidTimezone(timezone: string): boolean {
  // implementation
}
```

### Code Organization
Each module follows this structure:
```typescript
/**
 * Module description
 * @module module-name
 */

// ============================================================================
// Section Header
// ============================================================================

// Implementation
```

### Error Handling
- Use try-catch for operations that may throw (file I/O, JSON parsing)
- Silently ignore expected errors (e.g., missing config files)
- Re-throw unexpected errors
- Validation functions collect ALL errors instead of failing on first

```typescript
try {
  const content = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(content);
} catch {
  // Ignore errors, continue to next path
}
```

### Plugin Architecture
- Main entry (`src/plugin.ts`): ONLY exports `default` - OpenCode calls every export as a plugin
- Utils entry (`src/index.ts`): Exports all utilities for programmatic use
- Types are inlined in plugin.ts to avoid re-exporting

## Testing Conventions

### Test Structure
```typescript
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should do specific behavior', () => {
      // Arrange
      const input = createTestInput();
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Test File Naming
- Tests mirror source files: `src/config.ts` -> `tests/config.test.ts`
- Use `.test.ts` suffix

### Mocking
```typescript
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

### Coverage Requirements
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## File Structure

```
src/
  plugin.ts      # Main plugin entry (default export only)
  index.ts       # Utils entry (full exports)
  types.ts       # TypeScript type definitions
  config.ts      # Configuration loading and validation
  formatter.ts   # Time formatting utilities
tests/
  plugin.test.ts
  config.test.ts
  formatter.test.ts
```

## Key Patterns

### Configuration Merging
```typescript
export function loadConfig(userConfig?: Partial<TimeRefreshConfig> | null): TimeRefreshConfig {
  if (userConfig == null) {
    return { ...DEFAULT_CONFIG };
  }
  return { ...DEFAULT_CONFIG, ...userConfig };
}
```

### Validation with Error Collection
```typescript
export function validateConfig(config: TimeRefreshConfig): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (typeof config.enabled !== 'boolean') {
    errors.push({ field: 'enabled', message: '...', value: config.enabled });
  }
  // Check all fields...
  
  return { valid: errors.length === 0, errors };
}
```

### Plugin Hook Pattern
```typescript
const plugin: Plugin = async (ctx: PluginInput): Promise<Hooks> => {
  const config = loadConfig(loadConfigFromFile(ctx.directory));
  
  if (!config.enabled) {
    return {};
  }
  
  return {
    'chat.message': async (_input, output) => {
      // Modify output.parts
    },
  };
};

export default plugin;
```

## CI/CD Workflows

### GitHub Actions

The project uses GitHub Actions for continuous integration and automated releases.

#### CI Workflow (`.github/workflows/ci.yml`)
Runs on every push to `main` and on pull requests:
- Tests against Node.js 18, 20, and 22
- Runs linting, build, and tests
- All checks must pass before merging

#### Release Workflow (`.github/workflows/release.yml`)
Uses [release-please](https://github.com/google-github-actions/release-please-action) for automated releases:
- Automatically creates release PRs based on conventional commits
- Updates CHANGELOG.md and bumps version in package.json
- When release PR is merged, publishes to npm with provenance

### Conventional Commits

Use conventional commit format for automatic changelog generation:

```bash
feat: add new feature          # Minor version bump (0.6.0 → 0.7.0)
fix: fix a bug                 # Patch version bump (0.6.0 → 0.6.1)
feat!: breaking change         # Major version bump (0.6.0 → 1.0.0)
docs: update documentation     # No version bump
chore: update dependencies     # No version bump
```

### Release Process

1. Make changes using conventional commits
2. Push to `main` (directly or via PR)
3. Release-please automatically creates/updates a Release PR
4. When ready to release, merge the Release PR
5. GitHub Actions automatically:
   - Creates a GitHub Release with tag
   - Publishes to npm with provenance
   - Updates CHANGELOG.md

### Manual Publishing

If needed, you can still publish manually:
```bash
npm run prepublishOnly   # clean + lint + build + test
npm publish              # publish to npm
```
