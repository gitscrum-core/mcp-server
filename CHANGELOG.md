# Changelog

All notable changes to the GitScrum Studio MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-06

### Published
- **npm:** [`@gitscrum-studio/mcp-server`](https://www.npmjs.com/package/@gitscrum-studio/mcp-server) — `npx -y @gitscrum-studio/mcp-server`
- **GitHub:** [gitscrum-core/mcp-server](https://github.com/gitscrum-core/mcp-server)

### Architecture
- **Consolidated Tool Pattern:** All tools use a single tool with `action`/`report` parameter instead of separate tools per operation. Reduces LLM context tokens by ~80% while maintaining full API coverage.
  - Example: `standup_summary`, `standup_blockers`, `standup_team_status` → single `standup` tool with `action: summary | blockers | team`
  - 29 consolidated tools covering 160+ operations
- **OAuth 2.0 Device Authorization Grant (RFC 8628):** Credentials are never shared with the MCP server
- **Centralized Tool Registry:** Map-based routing via `toolRegistry.ts` for O(1) tool dispatch
- **378 tests** across 22 test files (100% pass rate)

### Added
- **Discussion Tools (10 operations):** Real-time team communication:
  - `discussion` tool — channels, messages, send, search, unread, mark_read, create/update channels
- **Activity Feed Tools (5 operations):** Workspace activity monitoring:
  - `activity` tool — feed, user_feed, notifications, activities, task_workflow
- **Budget Tracking Tools (6 operations):** Project budget management:
  - `budget` tool — projects_at_risk, overview, consumption, burn_down, alerts, events
- **Cross-Workspace ClientFlow:** Unified view of invoices, proposals, clients, and change requests across all workspaces
- **Task: `filter` action** — Search/filter tasks by workflow, labels, type, effort, sprint, user_story, status, assignee
- **Task: `by_code` action** — Look up tasks by human-readable code (e.g., `PROJ-123`)
- **Task: `duplicate` action** — Duplicate existing tasks
- **Task: `move` action** — Move tasks between projects
- **Sprint: 5 new actions** — stats, reports, progress, metrics, in addition to existing CRUD and KPIs
- **Time Tracking: 5 new actions** — analytics, team, reports, productivity, timeline
- **User Story: `update` action** — Update user stories with all fields including epic, priority
- **User Story: `all` action** — List user stories across all workspaces
- **Wiki: `search` action** — Search wiki pages within a project
- **Team Standup Tools (7 operations):** Daily meeting preparation:
  - `standup` tool — summary, completed, blockers, team, stuck, digest, contributors
- **Task Comments Tools (3 operations):** Comment management:
  - `comment` tool — list, add, update
- **Analytics/Dashboard Tools (10 operations):** Manager dashboard and reports:
  - `analytics` tool — pulse, risks, flow, age, activity, overview, health, blockers, command_center, time_entries
- **Epics Tools (3 operations):** User story epic management:
  - `epic` tool — list, create, update
- **Project Discovery Actions:** workflows, types, efforts, labels, members — get valid IDs for task creation
- **Smart Name Resolution:** `column`, `sprint_slug`, `user_story_slug` resolve names to IDs automatically in task create/update/filter
- **MCP Tool Annotations:** `readOnlyHint`, `idempotentHint`, `destructiveHint` on all tools per MCP spec
- **Comprehensive Documentation:** 21 per-tool doc files, TOOLS.md, USAGE.md fully rewritten

### Fixed
- **Critical:** `time_start` was sending `issue_uuid` instead of `task_uuid`, causing timer creation to fail
- **Critical:** `time_stop` was using `stopped_at` field instead of `end`, causing timers to never actually stop
- **Search tool:** Now supports optional `categories` filter, `limit` parameter, and optional `company_slug` for global cross-workspace search

### Removed
- **DELETE operations removed for security:** To reduce attack surface and prevent accidental data loss, all DELETE operations have been removed from the MCP Server. DELETE operations must be performed through the GitScrum web application.

### Security
- **Principle of Least Privilege:** MCP Server now only supports CREATE, READ, and UPDATE operations
- **Reduced Attack Surface:** Removed DELETE tools that could cause irreversible data loss
- **Safe AI Interactions:** Prevents AI assistants from accidentally deleting important data
- **Defense in Depth:** Multi-layer protection blocks DELETE operations from MCP clients


---

## Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

---

[1.0.0]: https://github.com/gitscrum-core/mcp-server/releases/tag/v1.0.0
