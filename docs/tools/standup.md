# Daily Standup

Automated standup reports — what happened, blockers, and team status.

## Tool: `standup`

| Action | Description |
|:-------|:------------|
| `summary` | Full standup summary |
| `completed` | Tasks completed in period |
| `blockers` | Active blockers |
| `team` | Team member activity |
| `stuck` | Stalled tasks |
| `digest` | Executive summary digest |
| `contributors` | Top contributors ranking |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Which standup info to get (required) |
| `company_slug` | string | **All** | Workspace identifier (required) |
| `project_slug` | string | All | Filter to specific project (optional) |
| `date` | string | summary, completed, blockers, team, stuck, digest | Date YYYY-MM-DD (default: yesterday) |
| `period` | string | contributors | week, month, quarter, year (default: month) |

---

## Examples

### Daily Standup

```
"Show standup summary for workspace acme"
"What was completed yesterday?"
"Any blockers in workspace acme?"
"Team activity for today"
```

### Focused Reports

```
"Standup for project api-v2 on 2026-02-15"
"Show stuck tasks in workspace acme"
"Executive digest for workspace acme"
```

### Contributors

```
"Top contributors this quarter"
"Show contributor ranking for last month"
```

---

## Workflow

```
1. standup action=summary         → daily overview
2. standup action=blockers        → identify blockers
3. standup action=stuck           → find stalled work
4. standup action=team            → check team activity
5. standup action=digest          → executive summary
```

---

## Tips

- Default date is yesterday — perfect for morning standups
- Use `project_slug` to scope reports to a single project
- `contributors` uses `period` instead of `date` for longer ranges
