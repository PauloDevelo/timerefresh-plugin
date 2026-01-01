# 03. Time Formatting Utilities

meta:
  id: time-refresh-plugin-03
  feature: time-refresh-plugin
  priority: P2
  depends_on: [time-refresh-plugin-02]
  tags: [implementation, utilities]

## Objective

Implement time formatting utilities that support ISO, locale, and custom format strings with timezone awareness.

## Context

- Must handle three format types: iso, locale, custom
- Custom format uses tokens: YYYY, MM, DD, HH, mm, ss, etc.
- Timezone support via Intl.DateTimeFormat (no external dependencies)
- Performance is important - formatting happens on every message
- Should work in Node.js 18+ environment

## Deliverables

- `src/formatter.ts` with all formatting functions
- `formatTime()` - main formatting function based on config
- `createTimeContext()` - creates full TimeContext object
- `formatCustom()` - parses and applies custom format strings
- `getTimezoneDate()` - converts date to specific timezone

## Steps

1. Create `src/formatter.ts` file

2. Implement `getTimezoneDate()`:
   ```typescript
   function getTimezoneDate(date: Date, timezone: string): Date
   ```
   - Use Intl.DateTimeFormat to get timezone-adjusted components
   - Return a new Date object representing the time in that timezone
   - Handle invalid timezone gracefully (fall back to local)

3. Implement `formatCustom()`:
   ```typescript
   function formatCustom(date: Date, format: string, timezone?: string): string
   ```
   - Support tokens: YYYY, YY, MM, M, DD, D, HH, H, mm, m, ss, s
   - Replace tokens with zero-padded or non-padded values
   - Apply timezone before formatting

4. Implement `createTimeContext()`:
   ```typescript
   function createTimeContext(date: Date, timezone?: string): TimeContext
   ```
   - Generate all TimeContext fields
   - Use provided timezone or detect system timezone
   - Include ISO string, locale strings, day of week, timestamp

5. Implement `formatTime()`:
   ```typescript
   function formatTime(date: Date, config: TimeRefreshConfig): string
   ```
   - Switch on config.format (iso, locale, custom)
   - Apply prefix and suffix from config
   - Use config.timezone if provided
   - Return formatted string ready for injection

6. Export all functions from `src/formatter.ts`

7. Add exports to `src/index.ts`

## Files to Create/Modify

- `src/formatter.ts` (create)
- `src/index.ts` (modify - add formatter exports)

## Dependencies

- Task 02: Type definitions (TimeRefreshConfig, TimeContext, TimeFormat)

## Acceptance Criteria

- [ ] `formatTime()` returns correct ISO format when config.format is 'iso'
- [ ] `formatTime()` returns locale string when config.format is 'locale'
- [ ] `formatTime()` applies custom format when config.format is 'custom'
- [ ] Custom format correctly replaces all supported tokens (YYYY, MM, DD, HH, mm, ss)
- [ ] Timezone conversion works for valid IANA timezone strings
- [ ] Invalid timezone falls back gracefully without throwing
- [ ] Prefix and suffix are correctly applied
- [ ] `createTimeContext()` returns all required fields
- [ ] Time accuracy is within 1 second of actual time

## Validation

```typescript
// Test ISO format
formatTime(new Date('2026-01-15T10:30:00Z'), { format: 'iso', prefix: '[', suffix: ']', ... })
// Expected: "[2026-01-15T10:30:00.000Z]"

// Test custom format
formatCustom(new Date('2026-01-15T10:30:45'), 'YYYY-MM-DD HH:mm:ss')
// Expected: "2026-01-15 10:30:45"

// Test timezone
createTimeContext(new Date(), 'America/Vancouver')
// Expected: TimeContext with Vancouver timezone
```

## Dependencies Output

- `formatTime()` function available for plugin core (task 05)
- `createTimeContext()` available for plugin core (task 05)
- Formatting logic ready for unit tests (task 06)

## Notes

- No external date libraries (date-fns, moment) - use native APIs
- Intl.DateTimeFormat is well-supported in Node.js 18+
- Custom format parser should be efficient (single pass replacement)
- Consider caching Intl.DateTimeFormat instances for performance
- Token replacement order matters (YYYY before YY to avoid partial matches)
