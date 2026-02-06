# Budget Tracking

Project budget monitoring, consumption, and risk alerts.

## Tool: `budget`

| Action | Description |
|:-------|:------------|
| `projects_at_risk` | Projects exceeding or nearing budget |
| `overview` | Budget summary for a project |
| `consumption` | Detailed consumption breakdown |
| `burn_down` | Budget burn-down over time |
| `alerts` | Budget alerts and thresholds |
| `events` | Budget-related events log |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `company_slug` | string | projects_at_risk | Workspace identifier |
| `project_uuid` | string | overview, consumption, burn_down, alerts, events | Project UUID |
| `start_date` | string | overview, burn_down | Start date YYYY-MM-DD |
| `end_date` | string | overview, burn_down | End date YYYY-MM-DD |
| `limit` | number | events | Max results (default 20, max 100) |

---

## Examples

### Risk Overview

```
"Show projects at risk in workspace acme"
```

### Project Budget

```
"Budget overview for project [uuid]"
"Show consumption breakdown for project [uuid]"
"Budget burn-down for project [uuid] from 2026-01-01 to 2026-03-31"
```

### Alerts & Events

```
"Show budget alerts for project [uuid]"
"Budget events for project [uuid]"
```

---

## Workflow

```
1. budget action=projects_at_risk → identify risky projects
2. budget action=overview         → drill into specific project
3. budget action=consumption      → see where money goes
4. budget action=burn_down        → trend over time
5. budget action=alerts           → check threshold warnings
6. budget action=events           → audit trail
```

---

## Tips

- Start with `projects_at_risk` for a portfolio-level view
- Use `start_date`/`end_date` to scope burn-down to a specific period
- `events` shows a chronological log of all budget-related changes
