# Hosted MCP Server

GitScrum provides a hosted MCP server at `mcp.gitscrum.com` — no installation required.

```
https://mcp.gitscrum.com/sse
```

**Why hosted?**

- **Zero setup** — No Node.js, no npx, no local dependencies
- **Always current** — Automatic updates, no version management
- **Works everywhere** — Any SSE-compatible MCP client
- **Production-grade** — Rate limiting, session management, automatic scaling

---

## Get Your API Token

GitScrum uses **Device Flow** authentication — secure, no credentials shared with MCP.

### How it works

1. Configure your AI client with the hosted URL (see below)
2. Tell your AI assistant: *"Login to GitScrum"*
3. Open the provided URL in your browser
4. Authorize the connection
5. The token is stored automatically

The token is saved locally and reused across sessions. You only need to authenticate once per device.

### Manual token retrieval

If your client requires the token upfront:

1. Run the local MCP server: `npx -y @gitscrum-studio/mcp-server`
2. Complete the Device Flow authentication
3. The token is stored at:
   - **macOS/Linux:** `~/.gitscrum/credentials.json`
   - **Windows:** `%USERPROFILE%\.gitscrum\credentials.json`
4. Copy the `access_token` value for use in SSE clients

---

## Client Configuration

### Claude Desktop

Edit the configuration file:

| OS | Path |
|:---|:-----|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "gitscrum": {
      "url": "https://mcp.gitscrum.com/sse",
      "headers": {
        "Authorization": "Bearer YOUR_GITSCRUM_TOKEN"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

---

### Claude Code (CLI)

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "gitscrum": {
      "transport": "sse",
      "url": "https://mcp.gitscrum.com/sse",
      "headers": {
        "Authorization": "Bearer YOUR_GITSCRUM_TOKEN"
      }
    }
  }
}
```

Or set via environment:

```bash
export GITSCRUM_TOKEN="your_token_here"
```

Then configure:

```json
{
  "mcpServers": {
    "gitscrum": {
      "url": "https://mcp.gitscrum.com/sse",
      "headers": {
        "Authorization": "Bearer ${GITSCRUM_TOKEN}"
      }
    }
  }
}
```

---

### VS Code (GitHub Copilot)

> **Note:** GitHub Copilot currently uses **stdio** transport only. Use the local npm package instead.

Create `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "gitscrum": {
      "command": "npx",
      "args": ["-y", "@gitscrum-studio/mcp-server"]
    }
  }
}
```

Or add to VS Code settings (`settings.json`):

```json
{
  "github.copilot.chat.mcpServers": {
    "gitscrum": {
      "command": "npx",
      "args": ["-y", "@gitscrum-studio/mcp-server"]
    }
  }
}
```

---

### Cursor

Cursor supports both SSE and stdio transports.

**Option 1: Hosted (SSE)** — Recommended

Open Cursor Settings → MCP Servers → Add:

```json
{
  "gitscrum": {
    "url": "https://mcp.gitscrum.com/sse",
    "headers": {
      "Authorization": "Bearer YOUR_GITSCRUM_TOKEN"
    }
  }
}
```

**Option 2: Local (stdio)**

```json
{
  "gitscrum": {
    "command": "npx",
    "args": ["-y", "@gitscrum-studio/mcp-server"]
  }
}
```

---

### Windsurf

Windsurf uses SSE transport natively.

Open Settings → AI → MCP Configuration:

```json
{
  "mcpServers": {
    "gitscrum": {
      "serverUrl": "https://mcp.gitscrum.com/sse",
      "headers": {
        "Authorization": "Bearer YOUR_GITSCRUM_TOKEN"
      }
    }
  }
}
```

Or edit `~/.windsurf/mcp.json` directly.

---

### Antigravity

Add to your Antigravity MCP configuration:

```json
{
  "servers": {
    "gitscrum": {
      "transport": "sse",
      "url": "https://mcp.gitscrum.com/sse",
      "auth": {
        "type": "bearer",
        "token": "YOUR_GITSCRUM_TOKEN"
      }
    }
  }
}
```

---

### Generic SSE Client

Any MCP client supporting SSE transport can connect:

| Property | Value |
|:---------|:------|
| **URL** | `https://mcp.gitscrum.com/sse` |
| **Method** | `GET` (SSE handshake) |
| **Auth** | `Authorization: Bearer <token>` |
| **Messages** | `POST /messages?sessionId=<id>` |

Example with curl (handshake only):

```bash
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: text/event-stream" \
     https://mcp.gitscrum.com/sse
```

---

## Endpoints

| Endpoint | Method | Description |
|:---------|:-------|:------------|
| `/sse` | GET | SSE connection endpoint (requires auth) |
| `/messages` | POST | Send messages to active session |
| `/health` | GET | Health check (public) |

---

## Rate Limits

| Limit | Value |
|:------|:------|
| Requests per minute | 200 |
| Concurrent sessions per token | 5 |
| Session timeout | 30 minutes (inactivity) |

Exceeding limits returns `429 Too Many Requests`.

---

## Security

| Layer | Protection |
|:------|:-----------|
| **Transport** | TLS 1.3 only |
| **Authentication** | Bearer token validation against GitScrum API |
| **Session isolation** | Each connection gets isolated server instance |
| **Headers** | Security headers via Helmet |
| **Token hashing** | Tokens are hashed for session tracking (not stored) |

The hosted server has the same security model as the local version — **no DELETE operations**, credentials never logged.

---

## Troubleshooting

### "401 Unauthorized"

- Check token is valid and not expired
- Ensure `Bearer ` prefix is included
- Verify no extra spaces in header

### "429 Too Many Requests"

- Wait 60 seconds before retrying
- Close unused sessions
- Check for runaway clients

### Connection drops

- Sessions timeout after 30 minutes of inactivity
- Reconnect and resume work
- Check network/firewall for SSE blocking

### "Session not found"

- Session expired — reconnect to `/sse`
- Using wrong sessionId in messages

---

## Comparison

| Feature | Hosted (SSE) | Local (stdio) |
|:--------|:-------------|:--------------|
| Install required | ❌ No | ✅ Node.js 18+ |
| Works in browser-based clients | ✅ Yes | ❌ No |
| Offline support | ❌ No | ✅ Yes |
| Rate limits | ✅ 200/min | ❌ None |
| Session management | ✅ Auto | ❌ Manual |
| Updates | ✅ Automatic | ⚠️ Manual npm update |

---

## Status

Check server health:

```bash
curl https://mcp.gitscrum.com/health
```

Response:

```json
{
  "status": "ok",
  "server": "gitscrum",
  "version": "1.0.4"
}
```

---

<p align="center">
  <a href="../README.md">← Back to README</a>
</p>
