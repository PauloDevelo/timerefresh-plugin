# 02. Type Definitions

meta:
  id: time-refresh-plugin-02
  feature: time-refresh-plugin
  priority: P1
  depends_on: [time-refresh-plugin-01]
  tags: [types, typescript]

## Objective

Define comprehensive TypeScript types and interfaces for the plugin configuration, time context, and OpenCode plugin API integration.

## Context

- Types will be used across all modules (formatter, config, plugin)
- Configuration interface must match the JSON schema from feature request
- OpenCode plugin types may need to be stubbed if `@opencode-ai/plugin` is not available
- Types should be exported for consumers who want type-safe configuration

## Deliverables

- `src/types.ts` with all type definitions
- TimeFormat union type for format options
- TimeRefreshConfig interface for plugin configuration
- TimeContext interface for formatted time data
- Plugin-related types (OpenCode API or stubs)
- ValidationResult type for config validation

## Steps

1. Create `src/types.ts` file

2. Define TimeFormat union type:
   ```typescript
   type TimeFormat = 'iso' | 'locale' | 'custom'
   ```

3. Define TimeRefreshConfig interface:
   ```typescript
   interface TimeRefreshConfig {
     enabled: boolean
     format: TimeFormat
     customFormat: string
     timezone: string
     includeInEveryMessage: boolean
     prefix: string
     suffix: string
   }
   ```

4. Define TimeContext interface:
   ```typescript
   interface TimeContext {
     iso: string           // ISO 8601 format
     local: string         // Locale string
     date: string          // Date only
     time: string          // Time only
     timezone: string      // IANA timezone name
     dayOfWeek: string     // Full day name
     timestamp: number     // Unix timestamp
   }
   ```

5. Define ValidationResult type:
   ```typescript
   interface ValidationResult {
     valid: boolean
     errors: ValidationError[]
   }
   
   interface ValidationError {
     field: string
     message: string
     value?: unknown
   }
   ```

6. Define OpenCode plugin types (stub if needed):
   ```typescript
   interface PluginContext {
     config: Record<string, unknown>
     // Add other context properties as discovered
   }
   
   interface PluginHooks {
     'message.updated'?: (input: MessageInput, output: MessageOutput) => Promise<void>
     // Add other hooks as discovered
   }
   
   type Plugin = (ctx: PluginContext) => Promise<PluginHooks>
   ```

7. Export all types from `src/types.ts`

8. Re-export types from `src/index.ts`

## Files to Create/Modify

- `src/types.ts` (create)
- `src/index.ts` (modify - add type exports)

## Dependencies

- Task 01: Project initialization (need TypeScript configured)

## Acceptance Criteria

- [ ] All types compile without TypeScript errors
- [ ] Types can be imported from `src/types.ts`
- [ ] TimeRefreshConfig matches the JSON schema from feature request
- [ ] TimeFormat includes all three format options
- [ ] TimeContext includes all time-related fields
- [ ] ValidationResult provides structured error information
- [ ] Types are exported from main index.ts

## Validation

```bash
# TypeScript should compile without errors
npx tsc --noEmit

# Types should be importable
node -e "require('./dist/types')"
```

## Dependencies Output

- TimeRefreshConfig available for config loader (task 04)
- TimeFormat available for formatter (task 03)
- TimeContext available for formatter (task 03)
- ValidationResult available for config loader (task 04)
- Plugin types available for core implementation (task 05)

## Notes

- Using interface over type for extensibility
- TimeContext includes timestamp for programmatic use
- ValidationError includes optional value for debugging
- Plugin types are provisional - may need adjustment based on actual OpenCode API
- Consider adding JSDoc comments for better IDE support
