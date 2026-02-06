# Authentication

Manage your GitScrum authentication session.

## Available Tools

| Tool | Description |
|:-----|:------------|
| `auth_login` | Start login — returns URL and code for browser authorization |
| `auth_complete` | Complete login after browser authorization (needs `device_code`) |
| `auth_status` | Check current authentication status |
| `auth_logout` | Clear session and tokens |

---

## Logging In

### Basic Login

```
"Login to GitScrum with email user@example.com and password mypassword"
"Authenticate with my GitScrum account"
```

### Check Status

```
"Am I logged in to GitScrum?"
"Check my authentication status"
"Is my session active?"
```

---

## Logging Out

### Clear Session

```
"Logout from GitScrum"
"Sign out"
"Clear my GitScrum credentials"
```

---

## Session Management

### When to Re-authenticate

- Token has expired
- Account password was changed
- Session was revoked remotely

### Automatic Token Refresh

The MCP Server automatically manages token refresh. You typically only need to login once.

---

## Best Practices

1. **Secure your credentials**: Never share login commands
2. **Logout when done**: Clear session on shared machines
3. **Use strong passwords**: Protect your account
