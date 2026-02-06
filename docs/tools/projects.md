# Projects & Workspaces

Navigate workspaces and manage projects — the starting point for everything.

## Tool: `workspace`

| Action | Description |
|:-------|:------------|
| `list` | List all accessible workspaces |
| `find` | Search workspace by name |
| `get` | Workspace details |
| `stats` | Workspace statistics |

### Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `name` | string | find | Workspace name to search |
| `company_slug` | string | get, stats | Workspace identifier |

---

## Tool: `project`

| Action | Description |
|:-------|:------------|
| `list` | List projects in workspace |
| `find` | Search project by name |
| `get` | Project details |
| `create` | Create new project |
| `stats` | Project statistics |
| `tasks` | Project tasks (Kanban board) |
| `workflows` | Kanban columns/statuses |
| `types` | Task types (Bug, Feature, etc.) |
| `efforts` | Effort/priority levels |
| `labels` | Project labels |
| `members` | Team members |

### Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `company_slug` | string | list, get, create, stats, tasks, workflows, types, efforts, labels, members | Workspace |
| `project_slug` | string | get, stats, tasks, workflows, types, efforts, labels, members | Project identifier |
| `name` | string | create, find | Project name |
| `description` | string | create | Project description |
| `visibility` | string | create | public or private (default: public) |
| `status` | string | list | Filter: in_progress, completed, archived |
| `client_uuid` | string | create | Associate with client |

---

## Examples

### Navigate

```
"List my workspaces"
"Show projects in workspace acme"
"Get project api-v2 details"
```

### Setup

```
"Create project 'Mobile App' in workspace acme"
"Show workflows for project api-v2"
"List team members in project api-v2"
```

### Get IDs for Other Tools

```
"Show task types for project api-v2"     → type_id
"Show effort levels for project api-v2"  → effort_id
"Show labels for project api-v2"         → label IDs
"Show workflows for project api-v2"      → workflow_id / column names
```

---

## Workflow

```
1. workspace action=list          → get company_slug (starting point)
2. project action=list            → get project_slug
3. project action=workflows       → get column names for tasks
4. project action=types           → get type_id
5. project action=efforts         → get effort_id
6. project action=members         → get usernames for assignment
```

---

## Tips

- `workspace action=list` is always the starting point — returns company_slug needed everywhere
- Use `find` when you know the name but not the slug
- `workflows`, `types`, `efforts`, `labels` return IDs used by the task tool
