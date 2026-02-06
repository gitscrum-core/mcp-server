# Tool Documentation

Per-tool reference for the GitScrum Studio MCP Server.

## Tools Index

| Tool | Page | Description |
|:-----|:-----|:------------|
| `workspace` / `project` | [projects.md](projects.md) | Navigate workspaces, manage projects, get IDs |
| `task` | [tasks.md](tasks.md) | Full task lifecycle — create, assign, filter, complete |
| `sprint` | [sprints.md](sprints.md) | Sprint planning, tracking, and analytics |
| `user_story` | [user-stories.md](user-stories.md) | User stories with acceptance criteria |
| `epic` | [epics.md](epics.md) | Group stories into large initiatives |
| `comment` | [comments.md](comments.md) | Task comments |
| `label` | [labels.md](labels.md) | Task labels and categorization |
| `task_type` | [task-types.md](task-types.md) | Task types (Bug, Feature, etc.) |
| `workflow` | [workflows.md](workflows.md) | Kanban column management |
| `time` | [time-tracking.md](time-tracking.md) | Timers, logs, and productivity analytics |
| `analytics` | [analytics.md](analytics.md) | Workspace health and manager dashboard |
| `standup` | [standup.md](standup.md) | Automated daily standup reports |
| `discussion` | [discussions.md](discussions.md) | Team communication channels and threads |
| `activity` | [activity.md](activity.md) | Activity feed, notifications, workflow history |
| `budget` | [budget.md](budget.md) | Budget tracking and risk alerts |
| `note` / `note_folder` | [notevault.md](notevault.md) | Personal notes with folders and revisions |
| `wiki` | [wiki.md](wiki.md) | Project documentation pages |
| `search` | [search.md](search.md) | Global search across all entities |
| `client` / `invoice` / `proposal` / `clientflow_*` | [clientflow.md](clientflow.md) | Client management, invoices, proposals, CRM |
| `auth_login` / `auth_complete` / `auth_status` / `auth_logout` | [auth.md](auth.md) | Authentication and session management |

---

## Architecture

```
Workspace (company_slug)
├── Projects (project_slug)
│   ├── Tasks → Subtasks, Comments, Labels, Types
│   ├── Sprints → KPIs, Reports, Metrics
│   ├── User Stories → Acceptance Criteria
│   ├── Epics → Group Stories
│   ├── Workflows → Kanban Columns
│   ├── Wiki → Documentation Pages
│   ├── Discussions → Channels, Messages, Threads
│   └── Budget → Consumption, Burn-down, Alerts
├── Clients → Invoices, Proposals
├── Analytics → Pulse, Risks, Flow, Health
├── Standup → Summary, Blockers, Contributors
├── Activity → Feed, Notifications, History
├── Time Tracking → Timers, Logs, Productivity
└── NoteVault → Notes, Folders, Revisions
```

---

## Quick Start

```
1. auth_login                     → authenticate
2. workspace action=list          → get company_slug
3. project action=list            → get project_slug
4. task action=my                 → see your tasks
```
