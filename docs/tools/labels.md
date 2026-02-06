# Labels

Create and manage labels for task categorization.

## Tool: `label`

| Action | Description |
|:-------|:------------|
| `list` | List all workspace labels |
| `create` | Create new label |
| `update` | Update label properties |
| `attach` | Attach label to task |
| `detach` | Detach label from task |
| `toggle` | Toggle label on/off for task |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `company_slug` | string | **All** | Workspace identifier (required) |
| `project_slug` | string | attach, detach, toggle | Project identifier |
| `label_slug` | string | update, attach, detach, toggle | Label identifier (from list) |
| `task_uuid` | string | toggle | Task UUID |
| `title` | string | create | Label name (required for create) |
| `color` | string | create | Hex color without # (required for create) |

---

## Examples

### View Labels

```
"List labels in workspace acme"
```

### Create Label

```
"Create label 'Critical' color FF0000 in workspace acme"
```

### Assign Labels

```
"Toggle label bug on task [uuid] in project api-v2"
"Attach label feature to task [uuid]"
```

---

## Workflow

```
1. label action=list              → see existing labels + slugs
2. label action=create            → create new label if needed
3. label action=toggle            → toggle on/off for task
```

---

## Tips

- Use `toggle` for convenience — it adds or removes as needed
- `label_slug` comes from the `list` response
- Labels can also be set during `task action=create` via `label_ids`
