# Matrix MCP Docs Page Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create the implementation plan after this spec is approved.

**Goal:** Add a polished public documentation page at `/docs` that explains how to connect Matrix MCP from Claude Code, Codex, and generic MCP clients, then use that URL as the configured docs link in new-api.

**Architecture:** Implement `/docs` as a public frontend route inside `new-api/web` rather than a separate docs service. The page should use new-api’s existing frontend stack, theme behavior, and component language, while its information architecture follows the step-by-step quick-start structure inspired by the referenced z.ai page.

**Tech Stack:** React 18, Vite, Semi UI, existing new-api frontend theme/context, frontend routing in `new-api/web`

---

## Context

The existing system already has a configurable docs link setting:
- `setting/operation_setting/general_setting.go:13` defines `general_setting.docs_link`
- `controller/misc.go:73` exposes `docs_link` in the status payload
- frontend code such as `web/src/hooks/common/useHeaderBar.js:52` and `web/src/pages/Home/index.jsx:77` already reads that field

The new work is **not** to build a full external docs platform. It is to provide a single high-quality public docs page at `/docs` that can be linked from the existing docs link setting.

The user explicitly wants:
- structure inspired by `https://docs.z.ai/guides/overview/quick-start`
- **not** the same colors or visual branding
- visuals and component feel as close as practical to existing new-api frontend style
- content focused on practical connection steps
- sections for Claude Code, Codex, and generic MCP setup
- clear explanation of automatic tool invocation behavior
- clear explanation of which Matrix MCP capabilities currently work and which do not

## User Experience Goals

1. A first-time user should be able to open `/docs` and understand what Matrix MCP is in under 10 seconds.
2. A user should be able to copy a minimal config for Claude Code in under 1 minute.
3. A Codex user should be able to find a parallel setup section without searching through unrelated content.
4. Users should not be misled about feature readiness; the page must explicitly distinguish:
   - available now
   - unavailable due to upstream limitations
   - unstable / partial support
5. The page should feel like an official new-api product page, not a pasted external template.

## Information Architecture

The page will be a **single public document page** with anchored sections.

### Top-level structure
1. Hero
2. Info / quick context box
3. Step 1 — Prepare connection info
4. Step 2 — Choose your client
5. Step 3 — Add configuration
6. Step 4 — Verify and use
7. Capability status
8. FAQ
9. More resources / next actions

### Why single-page with anchors
This preserves the referenced quick-start flow while keeping the implementation light. It also gives the user a shareable canonical entry URL:
- `https://matrix.000328.xyz:2053/docs`

Anchors such as the following should be supported for direct jumps:
- `/docs#claude-code`
- `/docs#codex`
- `/docs#mcp`
- `/docs#faq`

## Content Specification

### 1. Hero section
Purpose: immediately tell visitors what this page is for.

Required content:
- page title stating this is the Matrix MCP quick-start / connection guide
- short subtitle explaining support for Claude Code, Codex, and generic MCP clients
- primary actions:
  - copy MCP server address
  - jump to Claude Code section
  - jump to Codex section

Tone:
- concise
- operational
- low marketing fluff

### 2. Info / quick context box
Purpose: give users the important setup context before they scroll.

Required content:
- Matrix MCP is an HTTP MCP service
- users need a server URL and Bearer token
- no local Node service is required for the current recommended setup
- brief current capability summary

This box should visually resemble a documentation notice/announcement block rather than a marketing banner.

### 3. Step 1 — Prepare connection info
Purpose: provide the three critical values before installation steps.

Required content:
- MCP name: `matrix-mcp`
- server URL: `https://matrix.000328.xyz:2053/mcp`
- auth format: `Authorization: Bearer <your_token>`

Also include a small preview block showing the minimal shape of the config without expanding into all client-specific details yet.

### 4. Step 2 — Choose your client
Purpose: mirror the quick-start card-based branching pattern from the inspiration page.

Required cards:
- Claude Code
- Codex
- Generic MCP client

Each card must include:
- icon
- title
- one-sentence description
- action hint such as “View setup”

Clicking a card should navigate or scroll to the matching section below.

### 5. Step 3 — Add configuration
Purpose: be the main action section of the page.

This section contains three anchored subsections.

#### Claude Code subsection
Required content:
- project-level setup approach as the primary path
- create/edit `.mcp.json`
- complete copyable JSON example
- verification step using `/mcp`
- note that tools become available and may be invoked automatically based on context
- note that local files may use built-in local capabilities instead of MCP

#### Codex subsection
Required content:
- clear config instructions matching Codex MCP usage model
- complete copyable example with the same HTTP MCP fields
- short verification instructions
- short note that exact config-file location may vary by Codex environment, but the connection payload stays the same

#### Generic MCP subsection
Required content:
- minimal generic HTTP MCP server shape
- required fields: server name, type, url, Authorization header
- wording that this section is for any MCP-capable client with HTTP server support

### 6. Step 4 — Verify and use
Purpose: explain what “working” looks like after setup.

Required content:
- how to tell the MCP is connected
- what automatic tool invocation actually means
- when the client may prefer local/native capabilities instead of remote MCP
- what to check first if tools do not appear

This section should avoid overpromising. It must explicitly say that automatic invocation is contextual, not guaranteed for every prompt.

### 7. Capability status
Purpose: prevent support confusion.

Required categorized lists based on currently verified behavior:

#### Available now
- image generation
- image understanding
- audio understanding

#### Unavailable now
- web search
- web search + synthesis / reader

#### Unstable / partial
- video understanding

Required explanation:
- web-search-related tools are blocked by upstream capability configuration
- video understanding may fail for some public URLs due to upstream remote fetch behavior

This section should use clear status badges or notice styles so users can scan it quickly.

### 8. FAQ
Required questions:
- Do tools get called automatically?
- Why does a local image sometimes not use MCP?
- Why is web search unavailable?
- Why can video understanding fail?
- How do I use the same setup on another computer?
- Where should I store my token?

Answers should be short and practical.

### 9. More resources / next actions
Purpose: end the page with useful exits.

Suggested items:
- return to main site
- API base URL note
- contact admin / obtain token

This section should be compact; do not turn it into a second landing page.

## Visual & Interaction Design

### Design direction
- Follow the **information architecture** of the z.ai quick-start page
- Do **not** imitate its colors or brand styling
- Use new-api frontend conventions for spacing, cards, typography rhythm, and theme compatibility

### Must feel consistent with new-api
Reuse the existing product feel by aligning with:
- Semi UI card and button semantics
- existing theme handling (light/dark)
- familiar border, radius, and spacing language
- restrained decorative effects

### Should not feel like
- a blog article
- admin settings form
- third-party branded microsite

### Recommended UI primitives
- hero container
- numbered step sections
- card group for client selection
- code-block cards with copy actions
- info/warning/success notice blocks
- status badges
- anchored section navigation

### Interaction expectations
- smooth scroll to anchors
- copy-to-clipboard buttons for URL/config snippets
- mobile-friendly single-column fallback
- code blocks must horizontally scroll cleanly on small screens

## Technical Design

### Route shape
Implement a new public frontend route for:
- `/docs`

This should be handled inside the existing `new-api/web` app, not by deploying a second standalone docs application.

### Content source
Version 1 should use **static frontend-authored content**.

Rationale:
- faster delivery
- no new backend APIs required
- no admin CMS complexity
- easier to control formatting and maintain correctness for code examples

### Backend changes
Version 1 should require **no new backend API endpoint**.

Existing backend behavior is already sufficient because:
- the docs URL is configured separately via `DocsLink`
- the docs page content itself can be served as part of the frontend bundle

### Relationship to `DocsLink`
After deployment, the operator will set:
- `DocsLink = https://matrix.000328.xyz:2053/docs`

That allows existing docs entry points in new-api to open this page.

### Access control
The page should be publicly accessible with no login requirement.

## File/Code Organization Guidance

The implementation should prefer a focused structure rather than one very large JSX file.

Recommended shape:
- one top-level docs page route component
- one data module for code samples, status items, FAQ content, and static strings/objects
- small presentational components for repeated UI patterns such as step sections, client cards, code blocks, and status panels

The design should follow current frontend project conventions rather than introducing a new styling system.

## Content Guardrails

The docs must explicitly avoid these pitfalls:
- implying web search works today
- implying video understanding is fully reliable
- promising that tools always auto-run
- requiring npm installation for the recommended HTTP MCP setup
- assuming local-file analysis always goes through MCP

## Acceptance Criteria

The design is successful when all of the following are true:

1. `/docs` is a public, shareable page inside the existing new-api frontend.
2. The page visually feels like part of new-api.
3. The page structure clearly reflects a quick-start flow.
4. Users can copy a Claude Code config snippet directly from the page.
5. Users can find a separate Codex section without confusion.
6. The generic MCP section is present for non-Claude/Codex clients.
7. Automatic invocation behavior is explained accurately and conservatively.
8. Capability status is clearly separated into available, unavailable, and unstable.
9. No backend API additions are required for V1.
10. The final page is suitable to be used as the configured docs URL in general settings.

## Open Constraints Already Resolved

These design questions were resolved during brainstorming:
- use an independent static-style docs page, not an external docs site
- target both end users and technical users, but prioritize user actions first
- use manual JSON configuration as the main installation path
- leave room in structure for future one-click/script install instructions
- mimic the **structure** of the z.ai quick-start page, but keep visual design aligned with new-api

## Implementation Notes for the Next Phase

The implementation plan should include:
- locating the current frontend router and adding `/docs`
- identifying the best existing components/patterns to reuse from the home page and dashboard-style cards
- creating the static data module for docs content
- building copyable code blocks and anchored section navigation
- validating dark/light theme presentation
- verifying responsive layout in desktop and mobile widths
- running the appropriate frontend build/test steps using Bun
