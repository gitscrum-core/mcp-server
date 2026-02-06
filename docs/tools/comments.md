# Comments

Add and manage comments on tasks.

## Tool: `comment`

| Action | Description |
|:-------|:------------|
| `list` | List comments on a task |
| `add` | Add a comment to a task |
| `update` | Update an existing comment |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `task_uuid` | string | list, add | Task UUID (required for list, add) |
| `company_slug` | string | list, add | Workspace identifier (required for list, add) |
| `project_slug` | string | list, add | Project identifier (required for list, add) |
| `text` | string | add, update | Comment text (required for add, update) |
| `comment_id` | number | update | Comment ID from list (required for update) |

---

## Examples

### View Comments

```
"List comments on task [uuid]"
"Show comments for task [uuid] in project api-v2"
```

### Add Comment

```
"Add comment 'Fixed in latest commit' to task [uuid]"
"Comment on task [uuid]: 'Needs review before merge'"
```

### Update Comment

```
"Update comment 42 to 'Updated: deployed to staging'"
```

---

## Workflow

```
1. task action=get                → get task_uuid
2. comment action=list            → see existing comments
3. comment action=add             → add new comment
4. comment action=update          → edit existing (needs comment_id)
```

---

## Tips

- `comment_id` is returned in the `list` response
- Comments support Markdown formatting
