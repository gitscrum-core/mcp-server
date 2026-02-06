# Tasks

Full task lifecycle — create, assign, track, filter, and complete.

## Tool: `task`

| Action | Description |
|:-------|:------------|
| `my` | Tasks assigned to current user |
| `today` | Tasks due or scheduled for today |
| `notifications` | Task notifications |
| `get` | Task details by UUID |
| `create` | Create task with all fields in one call |
| `update` | Update task properties |
| `complete` | Mark task as complete |
| `subtasks` | Get subtasks of a task |
| `filter` | Search/filter with criteria |
| `by_code` | Get task by code e.g. `PROJ-123` |
| `duplicate` | Duplicate a task |
| `move` | Move task to another project |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `uuid` | string | get, update, complete, subtasks, duplicate, move | Task UUID |
| `task_uuid` | string | — | Alias for uuid |
| `title` | string | create | Task name (required for create) |
| `project_slug` | string | create, update, filter, by_code, duplicate, move | Project identifier |
| `company_slug` | string | create, update, filter, by_code, duplicate, move | Workspace identifier |
| `description` | string | create, update | Markdown description |
| `due_date` | string | create, update | Deadline YYYY-MM-DD |
| `start_date` | string | create, update | Start date YYYY-MM-DD |
| `column` | string | create, update | Kanban column name — MCP resolves to workflow_id |
| `workflow_id` | number | create, update | Kanban column ID (alternative to column) |
| `effort_id` | number | create, update | Priority level (from project action=efforts) |
| `type_id` | number | create, update | Task type (from project action=types) |
| `usernames` | string[] | create, update | Assign team members |
| `label_ids` | number[] | create, update | Attach labels |
| `sprint_slug` | string | create, update | Add to sprint |
| `user_story_slug` | string | create, update | Link to user story |
| `estimated_minutes` | number | create, update | Time estimate in minutes |
| `parent_id` | string | create | Parent task UUID (creates subtask) |
| `is_bug` | boolean | create, update | Mark as bug |
| `is_blocker` | boolean | create, update, filter | Mark as blocker |
| `is_archived` | boolean | update, filter | Archive task |
| `per_page` | number | my, today, filter | Results per page (1-100, default 50) |
| `task_code` | string | by_code | Task code e.g. PROJ-123 |
| `new_project_slug` | string | move | Target project |
| `new_workflow_id` | number | move | Target column ID |
| `workflow` | string | filter | Column title filter |
| `labels` | string | filter | Comma-separated label titles |
| `type` | string | filter | Task type title |
| `effort` | string | filter | Priority/effort title |
| `sprint` | string | filter | Sprint slug |
| `user_story` | string | filter | User story slug |
| `status` | string | filter | Status: todo, in-progress, done |
| `users` | string | filter | Comma-separated usernames |
| `unassigned` | boolean | filter | Only unassigned tasks |
| `created_at` | string | filter | Date range YYYY-MM-DD=YYYY-MM-DD |
| `closed_at` | string | filter | Date range YYYY-MM-DD=YYYY-MM-DD |

---

## Examples

### View My Work

```
"Show my tasks"
"What's on my plate today?"
"Get task notifications"
```

### Create Task

```
"Create task 'Fix login bug' in project api-v2 workspace acme"
"Create task 'Deploy dashboard' assigned to alice in column 'In Progress' sprint sprint-3"
```

### Update & Complete

```
"Move task [uuid] to column Done"
"Assign task [uuid] to bob"
"Complete task [uuid]"
```

### Search & Filter

```
"Filter tasks in project api-v2 status in-progress"
"Show bug tasks assigned to alice"
"Get task by code PROJ-123"
```

### Duplicate & Move

```
"Duplicate task [uuid]"
"Move task [uuid] to project web-app column Todo"
```

---

## Workflow

```
1. workspace action=list          → get company_slug
2. project action=list            → get project_slug
3. project action=workflows       → get column names/IDs
4. project action=types           → get type_id
5. project action=efforts         → get effort_id
6. task action=create             → set all fields in one call
7. task action=filter             → find tasks with criteria
8. task action=update             → change status, assign, etc.
9. task action=complete           → mark done
```

---

## Tips

- Use `column` (name) instead of `workflow_id` — MCP resolves it automatically
- Filter actions resolve label/type/effort titles to IDs behind the scenes
- Use `by_code` when you know the task code (e.g. from Git commits)
- `sprint_slug` and `user_story_slug` link tasks to sprints and stories
