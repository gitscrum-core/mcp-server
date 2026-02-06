# Wiki

Project documentation pages with hierarchy and search.

## Tool: `wiki`

| Action | Description |
|:-------|:------------|
| `list` | List wiki pages in project |
| `get` | Page content |
| `create` | Create new page |
| `update` | Update page content |
| `search` | Search wiki pages |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `company_slug` | string | **All** | Workspace identifier (required) |
| `project_slug` | string | **All** | Project identifier (required) |
| `uuid` | string | get, update | Page UUID (NOT for create) |
| `title` | string | create | Page title (required for create) |
| `content` | string | create | Page body in Markdown (required for create) |
| `parent_uuid` | string | create | Parent page ID for nesting |
| `q` | string | search | Search query (min 2 chars, required for search) |
| `limit` | number | search | Max results (default 20, max 50) |

---

## Examples

### Browse Wiki

```
"List wiki pages in project api-v2"
"Get wiki page [uuid]"
```

### Create Page

```
"Create wiki page 'Deployment Guide' with content '## Steps...' in project api-v2"
"Create wiki page 'FAQ' under parent [parent_uuid]"
```

### Search

```
"Search wiki for 'database migration' in project api-v2"
```

---

## Workflow

```
1. wiki action=list               → browse existing pages
2. wiki action=create             → write documentation
3. wiki action=search             → find specific content
4. wiki action=update             → keep docs current
```

---

## Tips

- Use `parent_uuid` to create nested page hierarchies
- Wiki pages support full Markdown formatting
- `search` requires minimum 2 characters
