# Usage Guide

Practical examples of how to use the GitScrum Studio MCP Server with your AI assistant.

## Table of Contents

- [Getting Started](#getting-started)
- [Task Management](#task-management)
- [Sprint Management](#sprint-management)
- [User Stories & Epics](#user-stories--epics)
- [Time Tracking](#time-tracking)
- [Comments, Labels & Types](#comments-labels--types)
- [Kanban Workflows](#kanban-workflows)
- [Discussions](#discussions)
- [NoteVault](#notevault)
- [Wiki](#wiki)
- [Search](#search)
- [Daily Standup](#daily-standup)
- [Analytics & Manager Dashboard](#analytics--manager-dashboard)
- [Activity Feed](#activity-feed)
- [Budget Tracking](#budget-tracking)
- [ClientFlow CRM](#clientflow-crm)
- [Tips and Best Practices](#tips-and-best-practices)

---

## Getting Started

### Installation

```bash
npx -y @gitscrum-studio/mcp-server
```

Or install globally:

```bash
npm install -g @gitscrum-studio/mcp-server
gitscrum-mcp
```

### Authentication

Authentication uses a device flow — the server gives you a URL to open in your browser:

```
"Login to GitScrum"
→ Opens browser for authorization
→ After approving, login completes automatically
```

Check status or logout:

```
"Am I logged in?"
"Logout from GitScrum"
```

### Discovering Your Workspace

After authentication, explore your workspaces and projects:

```
"List my workspaces"
"Show projects in workspace acme"
"Get details for project api-v2"
"Show team members in project api-v2"
```

---

## Task Management

### Viewing Tasks

```
"Show my tasks"
"What's on my plate today?"
"Get task notifications"
"Get details for task [uuid]"
"Show subtasks of task [uuid]"
"Get task by code PROJ-123"
```

### Creating Tasks

All fields can be set in a single call:

```
"Create task 'Fix login bug' in project api-v2 workspace acme"
"Create task 'Deploy dashboard' assigned to alice in column 'In Progress' sprint sprint-3"
"Create task 'Review PR' as subtask of [parent-uuid]"
```

### Updating & Completing

```
"Move task [uuid] to column Done"
"Assign task [uuid] to bob"
"Set due date on task [uuid] to 2026-03-15"
"Mark task [uuid] as bug"
"Complete task [uuid]"
```

### Filtering Tasks

```
"Filter tasks in project api-v2 status in-progress"
"Show bug tasks assigned to alice"
"Tasks in sprint sprint-3 labeled 'critical'"
"Unassigned tasks in project api-v2"
"Tasks created between 2026-01-01 and 2026-01-31"
```

### Duplicate & Move

```
"Duplicate task [uuid]"
"Move task [uuid] to project web-app column Todo"
```

---

## Sprint Management

### Viewing Sprints

```
"List sprints in project api-v2"
"Show all active sprints across workspaces"
"Get sprint sprint-3 details"
```

### Sprint Analytics

```
"Show KPIs for sprint sprint-3"
"What's the progress of sprint sprint-3?"
"Get burndown report for sprint sprint-3"
"Show sprint sprint-3 velocity metrics"
"Sprint stats for sprint-3"
```

### Creating & Updating

```
"Create sprint 'Q1 Release' in project api-v2 from 2026-02-10 to 2026-02-24"
"Update sprint sprint-3 end date to 2026-03-01"
```

---

## User Stories & Epics

### User Stories

```
"List user stories in project api-v2"
"Show all user stories across workspaces"
"Create user story 'As a user, I want to reset my password' in project api-v2"
"Update user story us-login acceptance criteria"
```

### Epics

```
"List epics in project api-v2"
"Create epic 'Authentication Overhaul' in project api-v2"
"Update epic [uuid] description"
```

Link stories to epics, then break stories into tasks:

```
1. Create epic → get epic_uuid
2. Create user story with epic_uuid → get user_story slug
3. Create tasks with user_story_slug → linked hierarchy
```

---

## Time Tracking

### Timer Operations

```
"Is there a timer running?"
"Start timer on task [uuid]"
"Stop timer [time_tracking_id]"
```

### Logs & Analytics

```
"Show time logs for project api-v2"
"Time tracking analytics for workspace acme"
"Team time tracking summary"
"Productivity metrics for last 30 days"
"Time tracking timeline for today"
```

### Reports

```
"Time reports for workspace acme"
"Time reports with hourly rate 150"
```

---

## Comments, Labels & Types

### Comments

```
"List comments on task [uuid]"
"Add comment 'Fixed in latest commit' to task [uuid]"
"Update comment 42 text"
```

### Labels

```
"List labels in workspace acme"
"Create label 'Critical' color FF0000"
"Toggle label bug on task [uuid] in project api-v2"
```

### Task Types

```
"List task types in project api-v2"
"Create task type 'Improvement' color 4CAF50"
"Assign type 3 to task [uuid]"
```

---

## Kanban Workflows

View existing columns and create new ones:

```
"Show workflows for project api-v2"
"Create column 'Code Review' status 'in progress' color 58A6FF in project api-v2"
"Update column 5 position to 1"
```

Status types: `todo`/`backlog`, `in progress`/`doing`, `done`/`closed`

---

## Discussions

### Channels

```
"List channels in project api-v2"
"Create channel 'backend-team' in project api-v2"
"Create private channel 'leadership'"
```

### Messages

```
"Show messages in channel [uuid]"
"Send 'Deploy completed' to channel [uuid]"
"Reply to message [parent_id] with 'Thanks!'"
"Search channel [uuid] for 'deployment'"
```

### Notifications

```
"Show unread messages"
"Mark channel [uuid] as read"
"Show all discussions across workspaces"
```

---

## NoteVault

### Notes

```
"List my notes"
"Search notes for 'meeting'"
"Create note 'Sprint Retro' with content '## What went well...'"
"Update note [uuid] content"
"Share note [uuid]"
"Show revisions for note [uuid]"
```

### Folders

```
"List note folders"
"Create folder 'Meeting Notes'"
"Move note [uuid] to folder [folder_uuid]"
```

---

## Wiki

```
"List wiki pages in project api-v2"
"Create wiki page 'Deployment Guide' with content '## Steps...'"
"Search wiki for 'database migration'"
"Update wiki page [uuid]"
```

Supports nested pages with `parent_uuid`.

---

## Search

Global search across all entities:

```
"Search for 'authentication'"
"Search for 'login bug'"
```

Searches across tasks, projects, user stories, sprints, wiki, notes.

---

## Daily Standup

Automated standup reports for team meetings:

```
"Standup summary for workspace acme"
"What was completed yesterday?"
"Show active blockers"
"Team activity"
"Stuck tasks"
"Executive digest"
"Top contributors this quarter"
```

Filter by project or date:

```
"Standup for project api-v2 on 2026-02-05"
```

---

## Analytics & Manager Dashboard

### Workspace Health

```
"Show workspace pulse for acme"
"Risks in workspace acme"
"Critical risks only"
```

### Reports

```
"Cumulative flow for last 60 days"
"Project health indicators"
"Blocker analysis"
"Team workload in command center"
"Time entries dashboard"
```

### Additional Reports

```
"Manager overview for workspace acme"
"Project age vs completion"
"Activity by project"
```

---

## Activity Feed

Track actions and workflow history:

```
"Show activity feed"
"Activity for user alice"
"My notifications"
"Activities in project api-v2"
"Workflow history for task [uuid]"
```

---

## Budget Tracking

Monitor project budgets and financial risk:

```
"Projects at risk in workspace acme"
"Budget overview for project [uuid]"
"Consumption breakdown for project [uuid]"
"Budget burn-down from 2026-01-01 to 2026-03-31"
"Budget alerts for project [uuid]"
"Budget events for project [uuid]"
```

---

## ClientFlow CRM

### Client Management

```
"List clients in workspace acme"
"Create client 'Acme Corp' with email contact@acme.com"
"Get client [uuid] details"
"Client stats for [uuid]"
```

### Invoices

```
"List invoices in workspace acme"
"Show overdue invoices"
"Create invoice for client [client_uuid]"
"Issue invoice [uuid]"
"Send invoice [uuid]"
"Mark invoice [uuid] as paid"
```

### Proposals

```
"List proposals in workspace acme"
"Create proposal 'Website Redesign' for client [client_uuid]"
"Send proposal [uuid]"
"Approve proposal [uuid]"
"Convert approved proposal [uuid]"
```

### Cross-Workspace Overview

```
"All invoices across workspaces"
"All clients across workspaces"
"All proposals across workspaces"
```

### CRM Dashboard

```
"CRM overview for workspace acme"
"Revenue analytics"
"At-risk clients"
"Client health scores"
"Team leaderboard"
"Business insights"
```

---

## Tips and Best Practices

### 1. Be Specific

Use specific slugs, UUIDs, or task codes:

```
✅ "Get task abc123-def456"
✅ "Get task by code PROJ-123"
❌ "Get that task I was working on"
```

### 2. Use Context

The AI assistant maintains conversation context:

```
"Create task 'Fix bug' in project api-v2"
→ "Assign it to alice"
→ "Start a timer on it"
```

### 3. Discover IDs First

Many tools need IDs from other tools:

```
1. workspace action=list     → company_slug
2. project action=list       → project_slug
3. project action=workflows  → column names/IDs
4. project action=types      → type_id
5. project action=efforts    → effort_id
```

### 4. Error Handling

- **Authentication errors**: Run login again
- **Permission errors**: Contact workspace owner
- **Not found**: Verify UUID or slug
- **PRO required**: Upgrade plan for premium features

### 5. Safety

- Delete operations are not available via MCP — data is protected
- Credentials stored locally with restricted permissions
- Tokens refresh automatically

---

## Resources

- [Tools Reference](TOOLS.md) — complete tool documentation
- [Per-Tool Docs](tools/) — detailed page per tool
- [GitScrum Docs](https://gitscrum.com/docs) — platform help
- [GitHub Issues](https://github.com/gitscrum-core/mcp-server/issues) — report bugs
