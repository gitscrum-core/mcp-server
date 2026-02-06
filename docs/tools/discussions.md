# Discussions

Real-time team communication with channels and threads.

## Tool: `discussion`

| Action | Description |
|:-------|:------------|
| `all` | All discussions across workspaces |
| `channels` | List channels in a project |
| `channel` | Channel details |
| `messages` | Messages in a channel |
| `send` | Send a message |
| `search` | Search messages in channel |
| `unread` | Unread message count |
| `mark_read` | Mark channel as read |
| `create_channel` | Create new channel |
| `update_channel` | Update channel settings |

---

## Parameters

| Parameter | Type | Used By | Description |
|:----------|:-----|:--------|:------------|
| `action` | string | **All** | Operation (required) |
| `company_slug` | string | channels, create_channel | Workspace identifier |
| `project_slug` | string | channels, create_channel | Project identifier |
| `channel_uuid` | string | channel, messages, send, search, mark_read, update_channel | Channel UUID |
| `content` | string | send | Message text (required for send) |
| `parent_id` | string | send | Parent message ID for thread replies |
| `q` | string | search | Search query |
| `name` | string | create_channel, update_channel | Channel name |
| `description` | string | create_channel, update_channel | Channel description |
| `is_private` | boolean | create_channel | Channel visibility |
| `include_archived` | boolean | channels | Include archived channels |
| `before_id` | string | messages | Cursor for older messages |
| `after_id` | string | messages | Cursor for newer messages |
| `limit` | number | messages, search | Max results |

---

## Examples

### Browse

```
"Show all discussions"
"List channels in project api-v2"
"Get channel [uuid] details"
```

### Messages

```
"Show messages in channel [uuid]"
"Send 'Deploy completed successfully' to channel [uuid]"
"Reply to message [parent_id] with 'Thanks!'"
"Search channel [uuid] for 'deployment'"
```

### Manage Channels

```
"Create channel 'backend-team' in project api-v2"
"Create private channel 'leadership' in project api-v2"
"Update channel [uuid] name to 'engineering'"
```

### Notifications

```
"Show unread messages"
"Mark channel [uuid] as read"
```

---

## Workflow

```
1. discussion action=channels     → list available channels
2. discussion action=create_channel → create if needed
3. discussion action=messages     → read conversation
4. discussion action=send         → post message
5. discussion action=unread       → check unread count
6. discussion action=mark_read    → clear notifications
```

---

## Tips

- Use `parent_id` for threaded replies to keep conversations organized
- `before_id`/`after_id` enable message pagination for long channels
- `all` shows discussions across all workspaces at once
