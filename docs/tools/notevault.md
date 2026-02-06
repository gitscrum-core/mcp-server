# NoteVault

Personal and team notes with folders and revision history.

## Tool: `note`

| Action | Description |
|:-------|:------------|
| `list` | List all notes (with optional search) |
| `get` | Note details |
| `create` | Create new note |
| `update` | Update note content |
| `share` | Get sharing link |
| `revisions` | View revision history |

### Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `company_slug` | string | All | Workspace (optional — auto-detected) |
| `uuid` | string | get, update, share, revisions | Note UUID (NOT for create) |
| `title` | string | create | Note title (required for create) |
| `content` | string | create | Note body in Markdown (required for create) |
| `folder_uuid` | string | create, update | Folder ID to organize into |
| `color` | string | create, update | gray, blue, red, green, yellow, purple, coral, amber, sky, lime (or hex) |
| `search` | string | list | Filter notes by text |

---

## Tool: `note_folder`

| Action | Description |
|:-------|:------------|
| `list` | List folders |
| `create` | Create folder |
| `update` | Rename folder |
| `move` | Move note to folder |

### Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `company_slug` | string | **All** | Workspace (required) |
| `uuid` | string | update | Folder UUID |
| `name` | string | create, update | Folder name (required for create/update) |
| `note_uuid` | string | move | Note ID to move |
| `folder_uuid` | string | move | Target folder (omit to unfile) |

---

## Examples

### Notes

```
"List my notes"
"Search notes for 'meeting'"
"Create note 'Sprint Retro' with content '## What went well...'"
"Update note [uuid] content to '## Updated notes...'"
"Share note [uuid]"
"Show revisions for note [uuid]"
```

### Folders

```
"List note folders in workspace acme"
"Create folder 'Meeting Notes' in workspace acme"
"Move note [uuid] to folder [folder_uuid]"
```

---

## Workflow

```
1. note action=list               → browse existing notes
2. note_folder action=create      → organize with folders
3. note action=create             → write new note
4. note_folder action=move        → organize into folder
5. note action=share              → share with team
6. note action=revisions          → review edit history
```

---

## Tips

- Notes auto-detect workspace — `company_slug` is optional
- Use `search` in list to filter notes by keyword
- `revisions` shows full edit history for audit trail
- Color codes make notes visually scannable
