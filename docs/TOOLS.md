# Tools Reference

Complete reference for all 29 tools (160+ operations) available in the GitScrum Studio MCP Server.

Each tool uses an `action` (or `report`) parameter to select the operation. This consolidated pattern reduces context overhead for LLMs while maintaining full API coverage.

## Table of Contents

- [Authentication](#authentication)
- [Tasks](#tasks)
- [Projects & Workspaces](#projects--workspaces)
- [Sprints](#sprints)
- [User Stories](#user-stories)
- [Epics](#epics)
- [Labels](#labels)
- [Task Types](#task-types)
- [Workflows](#workflows)
- [Time Tracking](#time-tracking)
- [Wiki](#wiki)
- [Search](#search)
- [Comments](#comments)
- [NoteVault](#notevault)
- [ClientFlow CRM](#clientflow-crm)
- [Team Standup (PRO)](#team-standup-pro)
- [Analytics & Manager Dashboard (PRO)](#analytics--manager-dashboard-pro)
- [Discussions](#discussions)
- [Activity Feed](#activity-feed)
- [Budget Tracking (PRO)](#budget-tracking-pro)

For detailed usage with examples, see the [tools/](tools/) folder.

---

## Authentication

[Detailed Guide →](tools/auth.md)

| Tool | Description |
|:-----|:------------|
| `auth_login` | Initiate login via device code flow |
| `auth_complete` | Complete login with device code |
| `auth_status` | Check current authentication status |
| `auth_logout` | Clear saved credentials |

---

## Tasks

[Detailed Guide →](tools/tasks.md)

**Tool:** `task`

| Action | Description |
|:-------|:------------|
| `my` | List tasks assigned to current user |
| `today` | Get tasks due or scheduled for today |
| `notifications` | Get task notifications |
| `get` | Get detailed task information (requires `uuid`) |
| `create` | Create a new task with all fields in one call |
| `update` | Update task properties (requires `uuid`) |
| `complete` | Mark task as complete (requires `uuid`) |
| `subtasks` | Get subtasks of a task (requires `uuid`) |
| `filter` | Search/filter tasks with criteria |
| `by_code` | Get task by code e.g. `PROJ-123` (requires `task_code`) |
| `duplicate` | Duplicate a task (requires `uuid`) |
| `move` | Move task to another project (requires `uuid`, `new_project_slug`, `new_workflow_id`) |

---

## Projects & Workspaces

[Detailed Guide →](tools/projects.md)

**Tool:** `workspace`

| Action | Description |
|:-------|:------------|
| `list` | List all accessible workspaces |
| `get` | Get workspace details (requires `company_slug`) |

**Tool:** `project`

| Action | Description |
|:-------|:------------|
| `list` | List projects in a workspace |
| `get` | Get project details |
| `stats` | Get project statistics |
| `tasks` | Get project tasks (Kanban board) |
| `workflows` | Get Kanban columns/statuses |
| `types` | Get task types |
| `efforts` | Get effort/priority levels |
| `labels` | Get project labels |
| `members` | Get team members |

---

## Sprints

[Detailed Guide →](tools/sprints.md)

**Tool:** `sprint`

| Action | Description |
|:-------|:------------|
| `list` | List sprints in a project |
| `all` | List all active sprints across workspaces |
| `get` | Get sprint details (requires `slug`) |
| `kpis` | Get sprint KPIs and velocity (requires `slug`) |
| `create` | Create a new sprint |
| `update` | Update sprint properties (requires `slug`) |
| `stats` | Get sprint statistics (requires `slug`) |
| `reports` | Get sprint reports with burndown (requires `slug`) |
| `progress` | Get sprint completion progress (requires `slug`) |
| `metrics` | Get sprint velocity and scope metrics (requires `slug`) |

---

## User Stories

[Detailed Guide →](tools/user-stories.md)

**Tool:** `user_story`

| Action | Description |
|:-------|:------------|
| `list` | List user stories in a project |
| `get` | Get story with acceptance criteria (requires `slug`) |
| `create` | Create new user story |
| `update` | Update user story (requires `slug`) |
| `all` | List all user stories across workspaces |

---

## Epics

[Detailed Guide →](tools/epics.md)

**Tool:** `epic`

| Action | Description |
|:-------|:------------|
| `list` | List all epics in a project |
| `create` | Create a new epic |
| `update` | Update epic properties (requires `epic_uuid`) |

---

## Labels

[Detailed Guide →](tools/labels.md)

**Tool:** `label`

| Action | Description |
|:-------|:------------|
| `list` | List labels (workspace or project scope) |
| `create` | Create a new label |
| `update` | Update label properties (requires `label_slug`) |
| `attach` | Attach label to project |
| `detach` | Detach label from project |
| `toggle` | Toggle label on task |

---

## Task Types

[Detailed Guide →](tools/task-types.md)

**Tool:** `task_type`

| Action | Description |
|:-------|:------------|
| `list` | List all task types in a project |
| `create` | Create a new task type |
| `update` | Update task type properties (requires `type_id`) |
| `assign` | Assign type to task (requires `task_uuid`, `type_id`) |

---

## Workflows

[Detailed Guide →](tools/workflows.md)

**Tool:** `workflow`

| Action | Description |
|:-------|:------------|
| `create` | Create a new Kanban column |
| `update` | Update column properties (requires `workflow_id`) |

---

## Time Tracking

[Detailed Guide →](tools/time-tracking.md)

**Tool:** `time`

| Action | Description |
|:-------|:------------|
| `active` | Check if a timer is running |
| `start` | Start timer on a task (requires `task_uuid`) |
| `stop` | Stop the active timer (requires `time_tracking_id`) |
| `logs` | Get time entries with filters |
| `analytics` | Time tracking analytics overview |
| `team` | Team time tracking summary |
| `reports` | Detailed time tracking reports |
| `productivity` | Productivity metrics and focus time |
| `timeline` | Daily time tracking timeline |

---

## Wiki

[Detailed Guide →](tools/wiki.md)

**Tool:** `wiki`

| Action | Description |
|:-------|:------------|
| `list` | List wiki pages |
| `get` | Get page content (requires `uuid`) |
| `create` | Create wiki page (Markdown) |
| `update` | Update existing page (requires `uuid`) |
| `search` | Search wiki pages (requires `q`) |

---

## Search

[Detailed Guide →](tools/search.md)

**Tool:** `search`

Global search across tasks, projects, user stories, and wiki pages. Requires `query` parameter.

---

## Comments

[Detailed Guide →](tools/comments.md)

**Tool:** `comment`

| Action | Description |
|:-------|:------------|
| `list` | Get comments on a task |
| `add` | Add comment to a task |
| `update` | Update existing comment (requires `comment_id`) |

---

## NoteVault

[Detailed Guide →](tools/notevault.md)

**Tool:** `note`

| Action | Description |
|:-------|:------------|
| `list` | List notes |
| `get` | Get note content (requires `uuid`) |
| `create` | Create note |
| `update` | Update note (requires `uuid`) |
| `share` | Toggle shareable link (requires `uuid`) |
| `revisions` | Get revision history (requires `uuid`) |

**Tool:** `note_folder`

| Action | Description |
|:-------|:------------|
| `list` | List folders |
| `create` | Create folder |
| `update` | Rename folder (requires `uuid`) |
| `move` | Move note to folder (requires `note_uuid`) |

---

## ClientFlow CRM

[Detailed Guide →](tools/clientflow.md)

**Tool:** `client`

| Action | Description |
|:-------|:------------|
| `list` | List all clients |
| `get` | Get client details (requires `uuid`) |
| `stats` | Get client statistics (requires `uuid`) |
| `create` | Create client |
| `update` | Update client (requires `uuid`) |

**Tool:** `invoice`

| Action | Description |
|:-------|:------------|
| `list` | List invoices |
| `get` | Get invoice details (requires `uuid`) |
| `stats` | Get invoice statistics |
| `create` | Create invoice |
| `update` | Update invoice (requires `uuid`) |
| `issue` | Issue/publish invoice (requires `uuid`) |
| `send` | Send to client (requires `uuid`) |
| `mark_paid` | Mark as paid (requires `uuid`) |

**Tool:** `proposal`

| Action | Description |
|:-------|:------------|
| `list` | List proposals |
| `get` | Get proposal details (requires `uuid`) |
| `stats` | Get proposal statistics |
| `create` | Create proposal |
| `send` | Send to client (requires `uuid`) |
| `approve` | Approve proposal (requires `uuid`) |
| `reject` | Reject with reason (requires `uuid`) |
| `convert` | Convert to project (requires `uuid`) |

**Tool:** `clientflow_dashboard`

| Report | Description |
|:-------|:------------|
| `overview` | Executive overview |
| `revenue` | Revenue pipeline |
| `at_risk` | At-risk clients |
| `pending` | Pending approvals |
| `health` | Project health |
| `insights` | Business insights |
| `leaderboard` | Top clients ranking |
| `analytics` | Detailed analytics |

**Tool:** `clientflow_cross_workspace`

| Report | Description |
|:-------|:------------|
| `invoices` | All invoices across workspaces |
| `proposals` | All proposals across workspaces |
| `clients` | All clients across workspaces |
| `change_requests` | All change requests across workspaces |

---

## Team Standup (PRO)

[Detailed Guide →](tools/standup.md)

**Tool:** `standup`

| Action | Description |
|:-------|:------------|
| `summary` | Get workspace standup summary |
| `completed` | Tasks completed yesterday |
| `blockers` | Active blockers and impediments |
| `team` | Team member status and workload |
| `stuck` | Tasks stuck without progress |
| `digest` | Weekly activity digest |
| `contributors` | Contributor stats over time |

---

## Analytics & Manager Dashboard (PRO)

[Detailed Guide →](tools/analytics.md)

**Tool:** `analytics`

| Report | Description |
|:-------|:------------|
| `pulse` | Real-time workspace health metrics |
| `risks` | Risk detection and analysis |
| `flow` | Cumulative flow — daily snapshot by status |
| `age` | Project age vs completion |
| `activity` | Activity by project over weeks |
| `overview` | Manager dashboard executive overview |
| `health` | Project health indicators |
| `blockers` | Blocker analysis and resolution |
| `command_center` | Team workload and capacity |
| `time_entries` | Time entries dashboard |

---

## Discussions

**Tool:** `discussion`

| Action | Description |
|:-------|:------------|
| `all` | List all discussions across workspaces |
| `channels` | List channels in a project |
| `channel` | Get channel details (requires `channel_uuid`) |
| `messages` | Get messages in a channel (requires `channel_uuid`) |
| `send` | Send message to a channel (requires `channel_uuid`, `content`) |
| `search` | Search messages in a channel (requires `channel_uuid`, `q`) |
| `unread` | Get unread message count |
| `mark_read` | Mark channel as read (requires `channel_uuid`) |
| `create_channel` | Create a new channel |
| `update_channel` | Update channel (requires `channel_uuid`) |

---

## Activity Feed

**Tool:** `activity`

| Action | Description |
|:-------|:------------|
| `feed` | Get project activity feed |
| `user_feed` | Get current user's activity feed |
| `notifications` | Get notification feed |
| `activities` | Get all activities for a project |
| `task_workflow` | Get task workflow history (requires `task_uuid`) |

---

## Budget Tracking (PRO)

**Tool:** `budget`

| Action | Description |
|:-------|:------------|
| `projects_at_risk` | Projects exceeding budget thresholds |
| `overview` | Budget overview for a project (requires `project_uuid`) |
| `consumption` | Budget consumption breakdown (requires `project_uuid`) |
| `burn_down` | Budget burn down chart (requires `project_uuid`) |
| `alerts` | Budget alerts and warnings (requires `project_uuid`) |
| `events` | Budget change history (requires `project_uuid`) |
