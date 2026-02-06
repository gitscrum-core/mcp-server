# Workflows (Kanban Columns)

Create and customize Kanban board columns.

## Tool: `workflow`

| Action | Description |
|:-------|:------------|
| `create` | Create new Kanban column |
| `update` | Update column properties |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `workflow_id` | number | update | Column ID from `project action=workflows` (required for update) |
| `project_slug` | string | create, update | Project identifier |
| `company_slug` | string | create, update | Workspace identifier |
| `title` | string | create, update | Column name e.g. Backlog, In Review, Done |
| `color` | string | create, update | Hex color without # e.g. 58A6FF |
| `status` | string | create, update | Column type: todo, in progress, done (see status map) |
| `position` | number | update | Board position (1 = leftmost) |

---

## Status Map

Natural language status names are resolved automatically:

| Status Type | Aliases |
|:------------|:--------|
| **Todo** (0) | todo, open, to do, backlog |
| **Done** (1) | done, complete, completed, closed |
| **In Progress** (2) | in progress, in-progress, doing, active |

---

## Examples

### Create Columns

```
"Create column 'Code Review' status 'in progress' color 58A6FF in project api-v2"
"Create column 'Backlog' status 'todo' in project api-v2"
```

### Update Columns

```
"Update column 5 title to 'QA Testing' in project api-v2"
"Move column 3 to position 1"
```

---

## Workflow

```
1. project action=workflows       → see existing columns + IDs
2. workflow action=create         → add new column
3. workflow action=update         → rename, recolor, reorder
4. task action=update column=X    → move tasks between columns
```

---

## Tips

- Use `project action=workflows` to read existing columns (workflow tool only creates/updates)
- Status type determines how tasks appear in reports (todo/doing/done)
- Status aliases are case-insensitive
