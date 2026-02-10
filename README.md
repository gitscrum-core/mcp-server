<p align="center">
  <img src="https://site-assets.gitscrum.com/vscode/gitscrum-white.png" alt="GitScrum" width="160"/>
</p>

<h1 align="center">GitScrum Studio MCP Server</h1>

<p align="center">
  Model Context Protocol server for GitScrum.<br/>
  Ship faster with AI-powered project management.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@gitscrum-studio/mcp-server"><img src="https://img.shields.io/npm/v/@gitscrum-studio/mcp-server?style=flat-square&color=000" alt="npm version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-000?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/gitscrum-core/mcp-server/actions"><img src="https://img.shields.io/badge/tests-378_passing-000?style=flat-square" alt="Tests"></a>
</p>

<br/>

<table>
<tr>
<td width="50%">

### ⚡ Hosted (Recommended)

**Zero install. Works everywhere.**

```
https://mcp.gitscrum.com/sse
```

SSE-based server hosted on AWS. Just add URL + token to your AI client.

**Best for:** Claude Desktop, Cursor, Windsurf, any SSE-compatible client.

[→ Setup Guide](docs/HOSTED.md)

</td>
<td width="50%">

### 📦 Local (npm)

**Self-hosted via npx.**

```bash
npx -y @gitscrum-studio/mcp-server
```

Runs locally via stdio transport. Requires Node.js 18+.

**Best for:** VS Code, GitHub Copilot, offline environments.

[→ Local Setup](#quick-start)

</td>
</tr>
</table>

---

## Overview

GitScrum Studio MCP Server connects AI assistants to your [GitScrum](https://gitscrum.com) workspace via the [Model Context Protocol](https://modelcontextprotocol.io). It gives Claude, GitHub Copilot, Cursor, and any MCP-compatible client full operational access to your project management stack — tasks, sprints, time tracking, user stories, epics, kanban workflows, team discussions, wiki, notes, client CRM, invoicing, proposals, budget tracking, analytics dashboards, standup reports, and activity feeds.

Everything your team does in the GitScrum web app, your AI assistant can now do through conversation.

```
You:    "What's on my plate today?"
Assistant: Fetches your tasks due today across all projects.

You:    "Create a sprint for next week with the top 5 backlog items"
Assistant: Creates the sprint, assigns tasks, and sets the timeline.

You:    "Show me which projects are over budget"
Assistant: Returns burn-down data and flags at-risk projects.

You:    "Send the Q1 proposal to Acme Corp"
Assistant: Creates the proposal, attaches the client, and sends it.

You:    "What did the team ship this week?"
Assistant: Generates a standup digest with completed work and blockers.
```

**29 tools. 160+ operations. Zero context switching.**

---

## Quick start

### Install

```bash
npx -y @gitscrum-studio/mcp-server
```

### Configure your client

<details>
<summary><strong>Claude Desktop</strong></summary>

Edit the configuration file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gitscrum": {
      "command": "npx",
      "args": ["-y", "@gitscrum-studio/mcp-server"]
    }
  }
}
```
</details>

<details>
<summary><strong>VS Code / Cursor</strong></summary>

Add to `.vscode/mcp.json` or your MCP settings:

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
</details>

### Authenticate

Tell your AI assistant: **"Login to GitScrum"**

The server initiates an [OAuth 2.0 Device Authorization Grant](https://datatracker.ietf.org/doc/html/rfc8628) flow. You authorize in the browser — credentials are never shared with the MCP server.

---

## Tools

Each tool uses a consolidated `action` parameter, reducing LLM context tokens by ~80% compared to individual tool definitions.

### Core

| Tool | Actions | Docs |
|:-----|:--------|:-----|
| `task` | `my` `today` `get` `create` `update` `complete` `subtasks` `filter` `by_code` `duplicate` `move` `notifications` | [tasks](docs/tools/tasks.md) |
| `sprint` | `list` `all` `get` `kpis` `create` `update` `stats` `reports` `progress` `metrics` | [sprints](docs/tools/sprints.md) |
| `workspace` | `list` `get` | [projects](docs/tools/projects.md) |
| `project` | `list` `get` `stats` `tasks` `workflows` `types` `efforts` `labels` `members` | [projects](docs/tools/projects.md) |
| `time` | `active` `start` `stop` `logs` `analytics` `team` `reports` `productivity` `timeline` | [time-tracking](docs/tools/time-tracking.md) |

### Planning

| Tool | Actions | Docs |
|:-----|:--------|:-----|
| `user_story` | `list` `get` `create` `update` `all` | [user-stories](docs/tools/user-stories.md) |
| `epic` | `list` `create` `update` | [epics](docs/tools/epics.md) |
| `label` | `list` `create` `update` `attach` `detach` `toggle` | [labels](docs/tools/labels.md) |
| `task_type` | `list` `create` `update` `assign` | [task-types](docs/tools/task-types.md) |
| `workflow` | `create` `update` | [workflows](docs/tools/workflows.md) |

### Collaboration

| Tool | Actions | Docs |
|:-----|:--------|:-----|
| `discussion` | `all` `channels` `channel` `messages` `send` `search` `unread` `mark_read` `create_channel` `update_channel` | [discussions](docs/tools/discussions.md) |
| `comment` | `list` `add` `update` | [comments](docs/tools/comments.md) |
| `wiki` | `list` `get` `create` `update` `search` | [wiki](docs/tools/wiki.md) |
| `note` | `list` `get` `create` `update` `share` `revisions` | [notevault](docs/tools/notevault.md) |
| `note_folder` | `list` `create` `update` `move` | [notevault](docs/tools/notevault.md) |
| `search` | — | [search](docs/tools/search.md) |

### ClientFlow CRM

| Tool | Actions | Docs |
|:-----|:--------|:-----|
| `client` | `list` `get` `create` `update` `contacts` `interactions` `add_interaction` | [clientflow](docs/tools/clientflow.md) |
| `invoice` | `list` `get` `stats` `create` `update` `issue` `send` `mark_paid` | [clientflow](docs/tools/clientflow.md) |
| `proposal` | `list` `get` `stats` `create` `update` `send` `approve` `reject` `convert` | [clientflow](docs/tools/clientflow.md) |
| `clientflow_dashboard` | 8 reports | [clientflow](docs/tools/clientflow.md) |
| `clientflow_cross_workspace` | 4 reports | [clientflow](docs/tools/clientflow.md) |

### Insights <sup>PRO</sup>

| Tool | Actions | Docs |
|:-----|:--------|:-----|
| `standup` | `summary` `completed` `blockers` `team` `stuck` `digest` `contributors` | [standup](docs/tools/standup.md) |
| `analytics` | 10 reports | [analytics](docs/tools/analytics.md) |
| `activity` | `feed` `user_feed` `notifications` `activities` `task_workflow` | [activity](docs/tools/activity.md) |
| `budget` | `projects_at_risk` `overview` `consumption` `burn_down` `alerts` `events` | [budget](docs/tools/budget.md) |

### Authentication

| Tool | Description | Docs |
|:-----|:------------|:-----|
| `auth_login` | Initiate device code flow | [auth](docs/tools/auth.md) |
| `auth_complete` | Complete authorization | [auth](docs/tools/auth.md) |
| `auth_status` | Check session status | [auth](docs/tools/auth.md) |
| `auth_logout` | Clear stored credentials | [auth](docs/tools/auth.md) |

Full reference: [docs/TOOLS.md](docs/TOOLS.md)

---

## Security

The server is designed around the **principle of least privilege**.

| Layer | Protection |
|:------|:-----------|
| **Operations** | Only CREATE, READ, UPDATE. DELETE is blocked at MCP and API layers. |
| **Authentication** | OAuth 2.0 Device Grant — credentials never touch the server. |
| **Token storage** | Local filesystem with restricted permissions. |
| **Rate limiting** | Automatic lockout after failed auth attempts. |

Destructive operations must be performed in the [GitScrum Studio](https://studio.gitscrum.com).

Full details: [docs/SECURITY.md](docs/SECURITY.md)

Found a vulnerability? Report privately to **security@gitscrum.com**.

---

## Documentation

| | |
|:--|:--|
| **[Hosted Server](docs/HOSTED.md)** | SSE setup for Claude, Cursor, Windsurf, and more |
| **[Usage Guide](docs/USAGE.md)** | Practical examples and common workflows |
| **[Tools Reference](docs/TOOLS.md)** | All 29 tools with parameters and response shapes |
| **[Per-Tool Guides](docs/tools/)** | Deep-dive into each tool module |
| **[Security](docs/SECURITY.md)** | Security model, token handling, threat mitigations |
| **[Development](docs/DEVELOPMENT.md)** | Local setup, architecture, testing, contribution |
| **[Changelog](CHANGELOG.md)** | Version history and migration notes |

---

## Development

```bash
git clone https://github.com/gitscrum-core/mcp-server.git
cd mcp-server
npm install
npm run build
npm test          # 378 tests across 22 suites
```

Inspect locally with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

| Requirement | Version |
|:------------|:--------|
| Node.js | >= 18.0.0 |
| npm | >= 8.0.0 |

Full guide: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
git checkout -b feature/my-feature
# make changes, add tests
npm test
git commit -m "feat: describe your change"
```

---

## License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  <a href="https://gitscrum.com">Website</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="https://docs.gitscrum.com/en/mcp">Docs</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="https://github.com/gitscrum-core/mcp-server/issues">Issues</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="CHANGELOG.md">Changelog</a>
</p>

<p align="center">
  Built by <a href="https://gitscrum.com/en">GitScrum</a>
</p>
