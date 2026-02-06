# Time Tracking

Timers, time logs, and productivity analytics.

## Tool: `time`

| Action | Description |
|:-------|:------------|
| `active` | Check if a timer is running |
| `start` | Start timer on a task |
| `stop` | Stop the active timer |
| `logs` | View time entries |
| `analytics` | Time tracking analytics overview |
| `team` | Team time tracking summary |
| `reports` | Detailed time reports |
| `productivity` | Productivity metrics and focus time |
| `timeline` | Daily time tracking timeline |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `task_uuid` | string | start | Task to track time on (required for start) |
| `time_tracking_id` | string | stop | Timer ID from active (required for stop) |
| `project_slug` | string | logs | Project identifier |
| `company_slug` | string | active, logs, analytics, team, reports, productivity, timeline | Workspace |
| `description` | string | start | What you're working on |
| `period` | string | analytics, team, reports, productivity, timeline | today, yesterday, last-7-days, last-14-days, this-month, last-month, last-30-days |
| `report_type` | string | reports | Report type (default: summary) |
| `hourly_rate` | number | reports | Hourly rate for cost calculations |

---

## Examples

### Timer Operations

```
"Is there a timer running?"
"Start timer on task [uuid]"
"Stop timer [time_tracking_id]"
```

### View Logs

```
"Show time logs for project api-v2"
```

### Analytics

```
"Show time tracking analytics for workspace acme"
"Team time tracking summary"
"Productivity metrics for last 30 days"
"Time tracking timeline for today"
```

---

## Workflow

```
1. time action=active             → check for running timer
2. time action=start              → start working (needs task_uuid)
3. time action=stop               → done working (needs time_tracking_id)
4. time action=logs               → review entries
5. time action=analytics          → overview metrics
6. time action=reports            → detailed reports with cost
```

---

## Tips

- Always check `active` before starting — avoid duplicate timers
- `stop` needs the `time_tracking_id` from the `active` response
- Use `hourly_rate` in reports to calculate cost breakdowns
- All analytics actions support `period` for time range filtering
