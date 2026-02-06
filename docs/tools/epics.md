# Epics

Group user stories and tasks into large initiatives.

## Tool: `epic`

| Action | Description |
|:-------|:------------|
| `list` | List epics in a project |
| `create` | Create new epic |
| `update` | Update epic properties |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `project_slug` | string | **All** | Project identifier (required) |
| `company_slug` | string | **All** | Workspace identifier (required) |
| `title` | string | create | Epic name (required for create) |
| `description` | string | create, update | Markdown description |
| `color` | string | create, update | Hex color without # e.g. FF5733 |
| `epic_uuid` | string | update | Epic UUID (required for update) |

---

## Examples

### View Epics

```
"List epics in project api-v2"
```

### Create Epic

```
"Create epic 'Authentication Overhaul' in project api-v2 color 4A90D9"
```

### Update Epic

```
"Update epic [uuid] title to 'Auth & Security'"
```

---

## Workflow

```
1. epic action=list               → see existing epics
2. epic action=create             → create initiative
3. user_story action=create       → add stories with epic_uuid
4. task action=create             → break stories into tasks
```

---

## Tips

- Link user stories to epics via `epic_uuid` in the user_story tool
- Color helps visually distinguish epics on boards
