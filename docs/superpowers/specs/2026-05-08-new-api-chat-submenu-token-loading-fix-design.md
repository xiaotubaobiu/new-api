# new-api chat submenu and token loading fix design

## Summary

Fix the local `new-api` chat experience so that the sidebar chat parent only expands/collapses its submenu, and clicking a chat template submenu item reliably opens the chat page without falsely reporting that no enabled tokens exist when the real problem is API rate limiting during token-key loading.

## Goals

- Make the `聊天` parent item in the sidebar behave as an expand/collapse control only.
- Preserve the existing template-driven chat architecture and `/console/chat/:id` route structure.
- Ensure chat token loading distinguishes between:
  - truly having no enabled tokens, and
  - failing to fetch token keys due to rate limiting or request errors.
- Keep automatic selection of one usable token key for template URL generation.

## Non-goals

- Do not redesign the chat system.
- Do not add a new default `/console/chat` landing page.
- Do not build a token picker UI.
- Do not replace the iframe-based chat rendering model.
- Do not change how chat templates are stored in `localStorage.chats`.

## Current behavior and root cause

### Sidebar behavior

In `web/src/components/layout/SiderBar.jsx`, the `聊天` entry is modeled as a parent menu item with child template items. The parent does not have its own route, while child template routes are injected dynamically as `chat0`, `chat1`, and so on.

This structure is acceptable for the desired behavior, but the intended UX must be explicit: the parent item should only expand/collapse, while child items should own navigation.

### Chat loading failure

In `web/src/helpers/token.js`, the current `fetchTokenKeys()` flow:

1. requests the first page of tokens,
2. filters enabled tokens,
3. issues one `/api/token/:id/key` request per enabled token,
4. runs those requests concurrently with `Promise.allSettled()`.

When multiple enabled tokens exist, this bursts key-fetch requests and can trigger the backend rate limit. In `web/src/hooks/chat/useTokenKeys.js`, any empty result is treated as if no enabled token exists, producing a misleading error message and redirecting the user away from chat.

The bug is therefore not primarily “no token exists”; it is that request failure and empty availability are conflated into the same outcome.

## Desired behavior

### Sidebar

- Clicking `聊天` toggles submenu visibility only.
- Clicking a specific child template item navigates to `/console/chat/:id`.
- Existing dynamic template generation remains unchanged.

### Chat page token loading

- If there are no enabled tokens in the fetched token list, show the existing no-token error and redirect behavior.
- If enabled tokens exist but key retrieval fails because of request throttling or other request errors, show a distinct load-failure error and do not misreport it as “no enabled token”.
- If at least one key is retrieved successfully, continue using the first successful key to build the final iframe URL.

## Proposed changes

## 1. Sidebar interaction update

### File

- `web/src/components/layout/SiderBar.jsx`

### Design

Keep `聊天` as a `Nav.Sub` parent with child entries. Ensure that only actual routed items are wrapped in `Link`, and that the parent item is treated as an expandable container rather than a navigable destination.

### Expected result

- Parent chat item expands/collapses reliably.
- Child items keep their existing routing behavior.
- No new route is introduced for the parent item.

## 2. Token loading result model

### Files

- `web/src/helpers/token.js`
- `web/src/hooks/chat/useTokenKeys.js`

### Design

Refactor token loading so the frontend returns structured outcomes instead of a bare string array with silent fallback to `[]` on any exception.

The fetch layer should distinguish these cases:

- `no_enabled_tokens`: token list fetched successfully, but no enabled token is available.
- `success`: at least one token key fetched successfully.
- `request_limited_or_failed`: enabled tokens exist, but key fetching failed due to rate limiting or request errors.

This can be represented with a small result object from the helper layer. The hook should use that result object to decide the correct user-facing message and redirect behavior.

### Expected result

- A real no-token situation is handled as before.
- A rate-limit failure is surfaced as a request/load error, not a false no-token error.
- Automatic first-key selection remains intact when a usable key is available.

## 3. Key fetch strategy adjustment

### File

- `web/src/helpers/token.js`

### Design

Replace the current burst-style key fetch pattern with a safer approach that reduces the chance of triggering rate limits.

Acceptable implementations under this design include either:

- sequentially requesting token keys until one succeeds, or
- using a bounded low-concurrency approach.

The recommended implementation is sequential retrieval of enabled token keys in priority order from the already-fetched token list, stopping as soon as one usable key is found. This matches the current consumer need because the chat page only uses the first working key.

### Why this approach is recommended

- It is the smallest change consistent with the current UX.
- It minimizes request bursts.
- It avoids fetching unnecessary keys once one working key is available.
- It reduces both latency spikes and backend throttle exposure for the chat page.

## 4. Error handling in the chat hook

### File

- `web/src/hooks/chat/useTokenKeys.js`

### Design

Update the hook so it handles the structured fetch result explicitly:

- On `success`, set `keys`, finish loading, and continue building the chat iframe URL.
- On `no_enabled_tokens`, show the existing no-token message and redirect to `/console/token` after the current delay.
- On `request_limited_or_failed`, show a distinct message such as request-too-frequent or token-load-failed, and do not incorrectly claim there are no enabled tokens.

The hook should also retain current server-address loading behavior.

## 5. Template URL generation behavior

### File

- `web/src/pages/Chat/index.jsx`

### Design

No functional redesign is required here. The page should continue:

- reading the template by `id` from `localStorage.chats`,
- substituting `{address}` and `{key}`,
- rendering the final URL in an iframe.

Only small defensive adjustments are in scope if needed to support the corrected hook contract, such as ensuring the iframe is not attempted when key loading definitively failed.

## Data flow after the fix

1. User clicks the `聊天` parent item.
2. Sidebar expands or collapses the chat submenu.
3. User clicks a specific chat template child item.
4. Route navigates to `/console/chat/:id`.
5. `useTokenKeys()` requests token availability through the helper layer.
6. Helper determines whether there is:
   - no enabled token,
   - a usable key,
   - or a request/limit failure.
7. On success, the chat page builds the template URL and opens it in the iframe.
8. On failure, the user sees the correct error category instead of a misleading no-token message.

## Acceptance criteria

- Clicking the `聊天` parent item expands and collapses the submenu without attempting parent navigation.
- Clicking a submenu item navigates to the corresponding `/console/chat/:id` route.
- When an enabled token exists and one token key can be fetched, the chat page opens normally.
- When no enabled token exists, the existing no-token message is shown.
- When key fetch requests are rate-limited or otherwise fail, the UI shows a distinct failure message and does not falsely say no enabled token exists.
- Existing template storage and iframe chat behavior remain unchanged.

## Testing approach

### Manual verification

- Verify parent sidebar item expand/collapse behavior.
- Verify child chat template routing.
- Verify successful chat open with at least one enabled token.
- Verify true no-token behavior by disabling all tokens.
- Verify request-failure messaging by simulating token-key request failure or rate limiting.

### Regression focus

- Ensure other sidebar sections still navigate normally.
- Ensure the chat page still works with existing saved templates.
- Ensure automatic first-usable-key selection still occurs when successful.

## Risks and mitigations

### Risk: changing sidebar selection behavior unintentionally affects other menu items

Mitigation: limit the interaction change to the `聊天` submenu parent and preserve existing `Link` wrapping only for routed leaf items.

### Risk: token helper refactor changes callers beyond chat

Mitigation: scope structured-result usage to the chat flow, and adjust only the helper/hook contract used by chat-related code.

### Risk: sequential requests may be slightly slower in some cases

Mitigation: the chat page currently only needs one working key, so early exit after first success makes sequential loading a good fit for reliability and total request reduction.
