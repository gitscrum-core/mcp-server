# Sprints

Sprint planning, tracking, and analytics.

## Tool: `sprint`

| Action | Description |
|:-------|:------------|
| `list` | List sprints in a project |
| `all` | All active sprints across workspaces |
| `get` | Sprint details |
| `kpis` | Velocity, completion rate, cycle time |
| `stats` | Task statistics for sprint |
| `reports` | Burndown, burnup, performance charts |
| `progress` | Completion progress percentage |
| `metrics` | Velocity, scope change, burndown health |
| `create` | Create a new sprint |
| `update` | Update sprint properties |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `project_slug` | string | list, get, kpis, stats, reports, progress, metrics, create, update | Project identifier |
| `company_slug` | string | list, get, kpis, stats, reports, progress, metrics, create, update | Workspace identifier |
| `slug` | string | get, kpis, stats, reports, progress, metrics, update | Sprint slug (from list) |
| `title` | string | create | Sprint name (required for create) |
| `description` | string | create, update | Markdown description |
| `date_start` | string | create, update | Start date YYYY-MM-DD (default: today) |
| `date_finish` | string | create, update | End date YYYY-MM-DD (default: today + 7) |
| `color` | string | create, update | Hex color without # |
| `is_private` | boolean | create, update | Sprint visibility |
| `close_on_finish` | boolean | create, update | Auto-close on end date |
| `resource` | string | reports | Chart: burndown, burnup, performance, types, efforts, member_distribution, task_type_distribution |

---

## Examples

### View Sprints

```
"List sprints in project api-v2"
"Show all active sprints"
"Get sprint sprint-3 details"
```

### Analytics

```
"Show KPIs for sprint sprint-3"
"Get burndown report for sprint sprint-3"
"What's the progress of sprint sprint-3?"
"Show sprint sprint-3 velocity metrics"
```

### Create & Update

```
"Create sprint 'Q1 Release' in project api-v2 from 2026-02-10 to 2026-02-24"
"Update sprint sprint-3 end date to 2026-03-01"
```

---

## Workflow

```
1. sprint action=list             → see existing sprints
2. sprint action=create           → plan new sprint
3. task action=create sprint_slug → add tasks to sprint
4. sprint action=progress         → track completion
5. sprint action=kpis             → review velocity
6. sprint action=reports          → burndown/burnup charts
7. sprint action=metrics          → scope change analysis
```

---

## Tips

- Use `resource` to get a specific chart from reports instead of all at once
- `all` shows active sprints across ALL workspaces — no slug needed
- KPIs include velocity, completion rate, and cycle time metrics
