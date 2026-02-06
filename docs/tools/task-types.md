# Task Types

Manage task categorization types (Bug, Feature, Improvement, etc.).

## Tool: `task_type`

| Action | Description |
|:-------|:------------|
| `list` | List types in a project |
| `create` | Create new type |
| `update` | Update type properties |
| `assign` | Assign type to a task |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `company_slug` | string | **All** | Workspace identifier (required) |
| `project_slug` | string | **All** | Project identifier (required) |
| `type_id` | number | update, assign | Type ID from list (required for update/assign) |
| `task_uuid` | string | assign | Task UUID (required for assign) |
| `title` | string | create | Type name e.g. Bug, Feature (required for create) |
| `color` | string | create | Hex color without # (required for create) |

---

## Examples

### View Types

```
"List task types in project api-v2"
```

### Create Type

```
"Create task type 'Improvement' color 4CAF50 in project api-v2"
```

### Assign Type

```
"Assign type 3 to task [uuid] in project api-v2"
```

---

## Workflow

```
1. task_type action=list          → see types + IDs
2. task_type action=create        → add custom type
3. task_type action=assign        → set type on task
```

---

## Tips

- `type_id` is also usable in `task action=create` and `task action=update`
- `project action=types` returns the same data as `task_type action=list`
