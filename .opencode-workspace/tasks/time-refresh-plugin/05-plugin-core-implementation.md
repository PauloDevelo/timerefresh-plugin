# 05. Plugin Core Implementation

meta:
  id: time-refresh-plugin-05
  feature: time-refresh-plugin
  priority: P1
  depends_on: [time-refresh-plugin-03, time-refresh-plugin-04]
  tags: [implementation, core]

## Objective

Implement the main OpenCode plugin that hooks into message events and injects current time context into every user message.

## Context

- Plugin must follow OpenCode plugin API conventions
- Hook into appropriate event (likely `message.updated` or similar)
- Load and validate configuration at plugin initialization
- Use formatter utilities to generate time string
- Inject time context without disrupting normal message flow
- Must work in both TUI and CLI modes

## Deliverables

- `src/index.ts` as main plugin entry point
- Plugin factory function following OpenCode API
- Message hook implementation for time injection
- Error handling for configuration issues
- Both default and named exports for flexibility

## Steps

1. Update `src/index.ts` to be the main plugin file

2. Import dependencies:
   ```typescript
   import { loadConfig, validateConfig, DEFAULT_CONFIG } from './config'
   import { formatTime, createTimeContext } from './formatter'
   import type { TimeRefreshConfig, Plugin, PluginContext } from './types'
   ```

3. Implement plugin factory function:
   ```typescript
   export const TimeRefreshPlugin: Plugin = async (ctx: PluginContext) => {
     // Load config from context
     const userConfig = ctx.config?.timeRefresh as Partial<TimeRefreshConfig>
     const config = loadConfig(userConfig)
     
     // Validate config
     const validation = validateConfig(config)
     if (!validation.valid) {
       console.warn('[time-refresh] Configuration errors:', validation.errors)
     }
     
     // Return hooks if enabled
     if (!config.enabled) {
       return {}
     }
     
     return {
       // Hook implementation
     }
   }
   ```

4. Implement message hook:
   ```typescript
   'message.updated': async (input, output) => {
     if (!config.includeInEveryMessage) return
     
     const now = new Date()
     const timeString = formatTime(now, config)
     
     // Inject time context into message
     // Exact mechanism depends on OpenCode API
   }
   ```

5. Add alternative hook strategies:
   - Try `tui.prompt.append` if available
   - Fall back to message modification
   - Log which hook is being used

6. Export plugin and utilities:
   ```typescript
   export default TimeRefreshPlugin
   export { TimeRefreshPlugin }
   export * from './types'
   export * from './config'
   export * from './formatter'
   ```

7. Add plugin metadata:
   ```typescript
   export const pluginMeta = {
     name: 'opencode-time-refresh',
     version: '0.1.0',
     description: 'Automatically inject current time into messages'
   }
   ```

## Files to Create/Modify

- `src/index.ts` (modify - main plugin implementation)

## Dependencies

- Task 03: Time formatting utilities (formatTime, createTimeContext)
- Task 04: Configuration loader (loadConfig, validateConfig, DEFAULT_CONFIG)

## Acceptance Criteria

- [ ] Plugin exports a valid Plugin function as default export
- [ ] Plugin loads configuration from context correctly
- [ ] Plugin validates configuration and warns on errors
- [ ] Plugin respects `enabled: false` configuration
- [ ] Plugin respects `includeInEveryMessage` configuration
- [ ] Time string is formatted according to configuration
- [ ] Plugin handles missing/undefined config gracefully
- [ ] Plugin does not throw errors that break OpenCode
- [ ] Both default and named exports are available
- [ ] All types and utilities are re-exported

## Validation

```typescript
// Test plugin initialization
const plugin = await TimeRefreshPlugin({
  config: {
    timeRefresh: {
      enabled: true,
      format: 'iso'
    }
  }
})
// Expected: Plugin hooks object

// Test disabled plugin
const disabledPlugin = await TimeRefreshPlugin({
  config: {
    timeRefresh: {
      enabled: false
    }
  }
})
// Expected: Empty hooks object {}

// Test with no config
const defaultPlugin = await TimeRefreshPlugin({ config: {} })
// Expected: Plugin with default configuration
```

## Dependencies Output

- Complete plugin ready for testing (task 06)
- Plugin ready for documentation (task 07)
- All exports available for consumers

## Notes

- OpenCode plugin API may vary - implementation may need adjustment
- Consider adding debug logging (controlled by config or env var)
- Plugin should fail gracefully, never crash OpenCode
- Time injection point depends on available hooks
- May need to explore multiple hook strategies
- Consider adding a `getTimeContext()` function for programmatic access
