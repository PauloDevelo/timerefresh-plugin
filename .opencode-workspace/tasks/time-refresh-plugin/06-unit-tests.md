# 06. Unit Tests

meta:
  id: time-refresh-plugin-06
  feature: time-refresh-plugin
  priority: P2
  depends_on: [time-refresh-plugin-05]
  tags: [testing, quality]

## Objective

Write comprehensive unit tests for all modules achieving >80% code coverage on core functionality.

## Context

- Using Vitest as test framework (configured in task 01)
- Tests should cover formatter, config, and plugin modules
- Mock Date and timezone for deterministic tests
- Test edge cases and error conditions
- Coverage threshold is 80% for core modules

## Deliverables

- `tests/formatter.test.ts` - tests for time formatting utilities
- `tests/config.test.ts` - tests for configuration loader
- `tests/plugin.test.ts` - tests for plugin initialization and hooks
- All tests passing with >80% coverage

## Steps

1. Create `tests/formatter.test.ts`:
   
   Test cases for `formatTime()`:
   - ISO format returns correct ISO string
   - Locale format returns locale string
   - Custom format applies tokens correctly
   - Prefix and suffix are applied
   - Timezone is respected
   
   Test cases for `formatCustom()`:
   - YYYY token replaced with 4-digit year
   - MM token replaced with zero-padded month
   - DD token replaced with zero-padded day
   - HH, mm, ss tokens work correctly
   - Non-padded variants (M, D, H, m, s) work
   - Unknown tokens are preserved
   
   Test cases for `createTimeContext()`:
   - All fields are populated
   - Timezone is detected or applied
   - Timestamp is accurate
   - Day of week is correct
   
   Test cases for `getTimezoneDate()`:
   - Valid timezone converts correctly
   - Invalid timezone falls back gracefully

2. Create `tests/config.test.ts`:
   
   Test cases for `loadConfig()`:
   - Returns defaults when no config provided
   - Merges partial config with defaults
   - Handles null/undefined input
   - User values override defaults
   
   Test cases for `validateConfig()`:
   - Valid config returns valid: true
   - Invalid format returns error
   - Invalid timezone returns error
   - Missing customFormat when format='custom' returns error
   - Multiple errors are collected
   
   Test cases for `isValidTimezone()`:
   - Valid IANA timezones return true
   - Invalid timezones return false
   - Empty string returns true
   
   Test cases for `DEFAULT_CONFIG`:
   - All required fields are present
   - Default values are sensible

3. Create `tests/plugin.test.ts`:
   
   Test cases for plugin initialization:
   - Plugin returns hooks object
   - Plugin loads config from context
   - Plugin validates config and warns on errors
   - Disabled plugin returns empty hooks
   
   Test cases for message hook:
   - Hook injects time into message
   - Hook respects includeInEveryMessage setting
   - Hook uses correct format from config
   
   Test cases for exports:
   - Default export is the plugin function
   - Named exports are available
   - Types are exported

4. Add test utilities:
   ```typescript
   // tests/utils.ts
   export function mockDate(isoString: string) {
     vi.useFakeTimers()
     vi.setSystemTime(new Date(isoString))
   }
   
   export function restoreDate() {
     vi.useRealTimers()
   }
   ```

5. Update `vitest.config.ts` if needed for coverage thresholds

6. Run tests and verify coverage:
   ```bash
   npm test -- --coverage
   ```

## Files to Create/Modify

- `tests/formatter.test.ts` (create)
- `tests/config.test.ts` (create)
- `tests/plugin.test.ts` (create)
- `tests/utils.ts` (create - test utilities)
- `vitest.config.ts` (modify if needed)

## Dependencies

- Task 05: Plugin core implementation (all modules complete)

## Acceptance Criteria

- [ ] All tests pass (`npm test` exits with code 0)
- [ ] Coverage >80% on `src/formatter.ts`
- [ ] Coverage >80% on `src/config.ts`
- [ ] Coverage >80% on `src/index.ts`
- [ ] Tests cover all format types (iso, locale, custom)
- [ ] Tests cover timezone handling
- [ ] Tests cover configuration validation errors
- [ ] Tests cover plugin initialization scenarios
- [ ] Tests use mocked dates for determinism
- [ ] No flaky tests (consistent results)

## Validation

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/formatter.test.ts

# Check coverage meets threshold
npm test -- --coverage --coverage.thresholds.lines=80
```

## Dependencies Output

- Test suite validates all functionality for documentation (task 07)
- Coverage report available for README badges
- Confidence that implementation is correct

## Notes

- Use `vi.useFakeTimers()` for deterministic date testing
- Mock console.warn to test warning output
- Consider snapshot tests for complex output
- Test error messages are helpful and accurate
- Timezone tests may behave differently in CI - use explicit timezones
- Consider adding integration test with actual OpenCode if possible
