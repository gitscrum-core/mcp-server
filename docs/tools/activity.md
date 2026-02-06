# Activity Feed

Track actions, notifications, and task workflow history.

## Tool: `activity`

| Action | Description |
|:-------|:------------|
| `feed` | Global activity feed |
| `user_feed` | Activity for specific user |
| `notifications` | User notifications |
| `activities` | Activities by context (workspace, project, sprint) |
| `task_workflow` | Task workflow transition history |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `username` | string | user_feed | Username to get feed for |
| `from_context` | string | activities | Context: company, project, sprint, sprints, user_stories |
| `company_slug` | string | activities | Workspace identifier |
| `project_slug` | string | activities | Project identifier |
| `sprint_slug` | string | activities | Sprint slug (for sprint context) |
| `task_uuid` | string | task_workflow | Task UUID |
| `uuid` | string | activities | Entity UUID for specific entity |

---

## Examples

### Feed

```
"Show activity feed"
"Show activity for user alice"
"Get my notifications"
```

### By Context

```
"Show activities for workspace acme"
"Activities in project api-v2"
"Sprint sprint-3 activities"
```

### Task History

```
"Show workflow history for task [uuid]"
```

---

## Workflow

```
1. activity action=feed           → global overview
2. activity action=notifications  → pending notifications
3. activity action=activities     → scoped by context
4. activity action=task_workflow  → audit task transitions
```

---

## Tips

- `task_workflow` shows every column transition — useful for cycle time analysis
- Use `from_context` to filter activities: company, project, sprint, sprints, user_stories
- `user_feed` shows all actions by a specific team member
