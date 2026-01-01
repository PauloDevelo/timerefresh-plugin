# 04. Configuration Loader

meta:
  id: time-refresh-plugin-04
  feature: time-refresh-plugin
  priority: P2
  depends_on: [time-refresh-plugin-02]
  tags: [implementation, configuration]

## Objective

Create a configuration loader that merges user config with sensible defaults and validates all configuration options.

## Context

- Users provide partial config in opencode.json under "timeRefresh" key
- Must provide sensible defaults for all options
- Validation should catch invalid timezones, format options, etc.
- Error messages should be clear and actionable
- Config is loaded once at plugin initialization

## Deliverables

- `src/config.ts` with configuration loading and validation
- `DEFAULT_CONFIG` constant with all default values
- `loadConfig()` - merges user config with defaults
- `validateConfig()` - validates config and returns errors
- `isValidTimezone()` - helper to validate timezone strings

## Steps

1. Create `src/config.ts` file

2. Define `DEFAULT_CONFIG` constant:
   ```typescript
   const DEFAULT_CONFIG: TimeRefreshConfig = {
     enabled: true,
     format: 'iso',
     customFormat: 'YYYY-MM-DD HH:mm:ss',
     timezone: '',  // Empty means use system timezone
     includeInEveryMessage: true,
     prefix: '[Current time: ',
     suffix: ']'
   }
   ```

3. Implement `isValidTimezone()`:
   ```typescript
   function isValidTimezone(timezone: string): boolean
   ```
   - Use Intl.DateTimeFormat to test timezone validity
   - Return true for valid IANA timezone strings
   - Return true for empty string (system default)

4. Implement `validateConfig()`:
   ```typescript
   function validateConfig(config: TimeRefreshConfig): ValidationResult
   ```
   - Validate format is one of: 'iso', 'locale', 'custom'
   - Validate timezone is valid (if provided)
   - Validate customFormat is non-empty when format is 'custom'
   - Validate prefix and suffix are strings
   - Return ValidationResult with all errors

5. Implement `loadConfig()`:
   ```typescript
   function loadConfig(userConfig?: Partial<TimeRefreshConfig>): TimeRefreshConfig
   ```
   - Merge userConfig with DEFAULT_CONFIG
   - User values override defaults
   - Handle undefined/null userConfig gracefully

6. Implement `loadAndValidateConfig()`:
   ```typescript
   function loadAndValidateConfig(userConfig?: Partial<TimeRefreshConfig>): {
     config: TimeRefreshConfig
     validation: ValidationResult
   }
   ```
   - Convenience function that loads and validates in one call
   - Returns both the merged config and validation result

7. Export all functions and DEFAULT_CONFIG from `src/config.ts`

8. Add exports to `src/index.ts`

## Files to Create/Modify

- `src/config.ts` (create)
- `src/index.ts` (modify - add config exports)

## Dependencies

- Task 02: Type definitions (TimeRefreshConfig, ValidationResult, ValidationError)

## Acceptance Criteria

- [ ] `DEFAULT_CONFIG` provides sensible defaults for all fields
- [ ] `loadConfig()` correctly merges partial user config with defaults
- [ ] `loadConfig()` handles undefined/null input gracefully
- [ ] `validateConfig()` rejects invalid format values with clear error
- [ ] `validateConfig()` rejects invalid timezone strings with clear error
- [ ] `validateConfig()` requires customFormat when format is 'custom'
- [ ] `isValidTimezone()` returns true for valid IANA timezones
- [ ] `isValidTimezone()` returns false for invalid timezone strings
- [ ] Validation errors include field name and descriptive message

## Validation

```typescript
// Test default loading
loadConfig()
// Expected: DEFAULT_CONFIG

// Test partial merge
loadConfig({ format: 'locale', timezone: 'America/Vancouver' })
// Expected: { ...DEFAULT_CONFIG, format: 'locale', timezone: 'America/Vancouver' }

// Test validation - invalid format
validateConfig({ ...DEFAULT_CONFIG, format: 'invalid' as any })
// Expected: { valid: false, errors: [{ field: 'format', message: '...' }] }

// Test validation - invalid timezone
validateConfig({ ...DEFAULT_CONFIG, timezone: 'Invalid/Zone' })
// Expected: { valid: false, errors: [{ field: 'timezone', message: '...' }] }

// Test timezone validation
isValidTimezone('America/New_York')  // true
isValidTimezone('Invalid/Zone')      // false
isValidTimezone('')                  // true (system default)
```

## Dependencies Output

- `loadConfig()` function available for plugin core (task 05)
- `validateConfig()` function available for plugin core (task 05)
- `DEFAULT_CONFIG` available for documentation (task 07)
- Configuration logic ready for unit tests (task 06)

## Notes

- Empty timezone string means "use system timezone" - this is valid
- Validation should collect ALL errors, not fail on first error
- Consider adding warnings for unusual but valid configs
- Error messages should suggest valid values where possible
- Intl.DateTimeFormat throws RangeError for invalid timezones
