# Feature Request: Time Refresh Plugin for OpenCode

## Summary

Create an OpenCode plugin that automatically injects the current date and time into every message, ensuring the AI assistant always has accurate temporal context throughout a conversation.

## Problem Statement

Currently, OpenCode provides the date/time only once at the start of a session via the environment information. During long conversations, the AI has no way to know the current time has changed, which can lead to:

- Incorrect scheduling assumptions
- Stale time references when planning workouts or meals
- Confusion about "today" vs "tomorrow" in multi-hour sessions
- Inability to provide time-sensitive recommendations (e.g., weather, workout timing)

## Proposed Solution

A plugin that hooks into OpenCode's message events to inject the current timestamp before each user message is processed by the AI.

### Desired Behavior

1. **Automatic injection**: Every user message should include the current date/time without manual intervention
2. **Configurable format**: Support different time formats (ISO, locale-specific, custom)
3. **Timezone awareness**: Use the system's local timezone by default, with optional override
4. **Minimal overhead**: Lightweight implementation that doesn't slow down message processing

### Suggested Implementation

```typescript
// .opencode/plugin/time-refresh.ts
import type { Plugin } from "@opencode-ai/plugin"

export const TimeRefreshPlugin: Plugin = async (ctx) => {
  return {
    // Hook into message processing to inject current time
    "message.updated": async (input, output) => {
      // Inject current time context
      const now = new Date()
      const timeContext = {
        iso: now.toISOString(),
        local: now.toLocaleString(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' })
      }
      
      // Somehow inject this into the message context
      // (exact mechanism TBD based on OpenCode's plugin API capabilities)
    },
  }
}
```

## Open Questions

Based on the current OpenCode plugin documentation, it's unclear if plugins can:

1. **Modify the system prompt dynamically** - Can we append time info to the system prompt before each message?
2. **Inject context into user messages** - Can we prepend time info to user messages transparently?
3. **Access message content before LLM processing** - Is there a hook that fires before the message is sent to the AI?

### Potential Hook Points

| Hook | Possibility | Notes |
|------|-------------|-------|
| `message.updated` | Uncertain | Fires when message changes, but can we modify content? |
| `tool.execute.before` | Partial | Only fires for tool calls, not regular messages |
| `session.created` | No | Only fires once per session |
| `tui.prompt.append` | Possible | Might allow appending to the prompt |

## Alternative Approaches

If direct message injection isn't possible:

### Alternative 1: TUI Prompt Modification
Use `tui.prompt.append` to automatically append time to user prompts. This might be the most viable option.

## Configuration Options

```json
// opencode.json
{
  "plugin": ["opencode-time-refresh"],
  "timeRefresh": {
    "enabled": true,
    "format": "iso",           // "iso" | "locale" | "custom"
    "customFormat": "YYYY-MM-DD HH:mm:ss",
    "timezone": "America/Vancouver",
    "includeInEveryMessage": true,
    "prefix": "[Current time: ",
    "suffix": "]"
  }
}
```

## Use Cases

1. **Triathlon coaching**: Accurate scheduling of workouts, meal timing, race countdown
2. **Project management**: Deadline tracking, sprint planning
3. **Calendar integration**: Scheduling meetings, reminders
4. **Weather-dependent activities**: Knowing current time for weather API calls
5. **Time-sensitive tasks**: "What should I do this afternoon?" requires knowing current time

## Success Criteria

- [ ] Plugin successfully injects current time into AI context
- [ ] Time is accurate to within 1 second of actual system time
- [ ] No noticeable latency added to message processing
- [ ] Configurable format options work as expected
- [ ] Plugin works with both TUI and CLI modes

## References

- [OpenCode Plugin Documentation](https://opencode.ai/docs/plugins/)
- [OpenCode Events Reference](https://opencode.ai/docs/plugins/#events)

## Priority

**Medium-High** - This is a quality-of-life improvement that would benefit any long-running conversation or time-sensitive use case.

---

*Created: 2026-01-01*
*Author: Triathlon coaching project user*
