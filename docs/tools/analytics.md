# Analytics & Manager Dashboard

Workspace health, risk detection, and executive reports.

## Tool: `analytics`

| Report | Description |
|:-------|:------------|
| `pulse` | Real-time workspace health metrics |
| `risks` | Risk detection and analysis |
| `flow` | Cumulative flow — daily snapshot by status |
| `age` | Project age vs completion |
| `activity` | Activity by project over weeks |
| `overview` | Manager dashboard executive overview |
| `health` | Project health indicators |
| `blockers` | Blocker analysis and resolution |
| `command_center` | Team workload and capacity |
| `time_entries` | Time entries dashboard |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `report` | string | **All** | Which report (required) |
| `company_slug` | string | **All** | Workspace (required) |
| `view` | string | pulse | Filter: all, active, overdue |
| `period` | string | pulse | Time: today, this-week, this-month, last-30-days |
| `filter` | string | risks | Type: all, blocked, unassigned, stale, aging |
| `severity` | string | risks | Level: all, critical, warning, info |
| `days` | number | flow | Number of days (default: 30, max: 90) |
| `time_filter` | string | time_entries | Filter: today, this_week, billable, non_billable |

---

## Examples

### Workspace Health

```
"Show workspace pulse for acme"
"What are the risks in workspace acme?"
"Show cumulative flow for last 60 days"
```

### Manager Dashboard

```
"Show manager overview for workspace acme"
"Project health indicators"
"Blocker analysis"
"Team workload in command center"
"Time entries dashboard"
```

### Focused Analysis

```
"Show critical risks only"
"Pulse for active projects this month"
"Flow chart for last 90 days"
```

---

## Reports Detail

| Report | What It Shows |
|:-------|:-------------|
| `pulse` | Velocity, completion rate, overdue tasks. Filterable by view/period |
| `risks` | Blocked, unassigned, stale, aging tasks. Filterable by type/severity |
| `flow` | Daily task count by status (todo, in-progress, done) for WIP trends |
| `age` | Project age vs completion percentage |
| `activity` | Activity by project over weekly intervals |
| `overview` | Executive summary: project health, team performance, key metrics |
| `health` | Per-project schedule, scope, and quality indicators |
| `blockers` | Active blockers with impact analysis |
| `command_center` | Per-member workload, capacity, task distribution |
| `time_entries` | Time tracking overview with billable/non-billable breakdown |

---

## Tips

- All reports require `company_slug` — get it from `workspace action=list`
- Use `pulse` for a quick daily health check
- Use `risks` with `severity=critical` to focus on urgent issues
- `flow` with `days=90` gives a quarterly trend view
