# User Stories

Agile user story management with acceptance criteria.

## Tool: `user_story`

| Action | Description |
|:-------|:------------|
| `list` | List stories in a project |
| `all` | All stories across workspaces |
| `get` | Story details with acceptance criteria |
| `create` | Create new user story |
| `update` | Update story properties |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `project_slug` | string | **All** | Project identifier (required) |
| `company_slug` | string | **All** | Workspace identifier (required) |
| `slug` | string | get, update | Story slug (from list) |
| `title` | string | create | Story title (required for create) |
| `additional_information` | string | create, update | Details in Markdown |
| `acceptance_criteria` | string | create, update | Definition of done |
| `epic_uuid` | string | create, update | Link to epic |
| `user_story_priority_id` | number | create, update | Priority ID |

---

## Examples

### View Stories

```
"List user stories in project api-v2"
"Show all user stories across workspaces"
"Get user story us-login details"
```

### Create Story

```
"Create user story 'As a user, I want to reset my password' in project api-v2"
```

### Update

```
"Update user story us-login acceptance criteria to 'Must support email and SMS'"
"Link user story us-login to epic auth-epic"
```

---

## Workflow

```
1. user_story action=list         → see existing stories
2. user_story action=create       → write new story
3. task action=create             → break story into tasks (user_story_slug)
4. user_story action=get          → review acceptance criteria
```

---

## Tips

- Use `all` to see stories across all workspaces at once
- Link stories to epics with `epic_uuid` for hierarchy
- Tasks link to stories via `user_story_slug` in the task tool
