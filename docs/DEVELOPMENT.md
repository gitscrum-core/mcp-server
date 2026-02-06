# Development Guide

This guide covers local development setup, testing, architecture, and contribution guidelines for the GitScrum Studio MCP Server.

## Prerequisites

| Requirement | Version |
|:------------|:--------|
| Node.js | 18.0.0 or higher |
| npm | 8.0.0 or higher |
| Git | Latest |

## Getting Started

### Using from npm (recommended)

```bash
npx -y @gitscrum-studio/mcp-server
```

### From source

#### 1. Clone the Repository

```bash
git clone https://github.com/gitscrum-core/mcp-server.git
cd mcp-server
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Build the Project

```bash
npm run build
```

#### 4. Run Tests

```bash
npm test
```

## Project Structure

```
mcp/
├── src/
│   ├── index.ts                    # Server entry point & MCP lifecycle
│   ├── auth/
│   │   ├── TokenManager.ts         # Secure local token storage
│   │   └── DeviceAuthenticator.ts  # OAuth 2.0 Device Authorization (RFC 8628)
│   ├── client/
│   │   └── GitScrumClient.ts       # API client with error handling
│   └── tools/
│       ├── shared/
│       │   ├── toolRegistry.ts     # Centralized tool registry (O(1) dispatch)
│       │   ├── actionHandler.ts    # Consolidated action routing & helpers
│       │   └── initModules.ts      # Module initialization (single source of truth)
│       ├── auth.ts                 # Authentication (login, complete, status, logout)
│       ├── tasks.ts                # Tasks (12 actions)
│       ├── projects.ts             # Workspaces & Projects (11 actions)
│       ├── sprints.ts              # Sprints (10 actions)
│       ├── timeTracking.ts         # Time tracking (9 actions)
│       ├── userStories.ts          # User stories (5 actions)
│       ├── epics.ts                # Epics (3 actions)
│       ├── labels.ts               # Labels (6 actions)
│       ├── taskTypes.ts            # Task types (4 actions)
│       ├── workflows.ts            # Kanban columns (2 actions)
│       ├── comments.ts             # Task comments (3 actions)
│       ├── discussions.ts          # Team discussions (10 actions)
│       ├── wiki.ts                 # Wiki pages (5 actions)
│       ├── notes.ts                # NoteVault (10 actions across note + note_folder)
│       ├── search.ts               # Global search
│       ├── clientflow.ts           # ClientFlow CRM (clients, invoices, proposals, dashboards)
│       ├── activity.ts             # Activity feed (5 actions)
│       ├── standup.ts              # Team standup (7 actions) — PRO
│       ├── analytics.ts            # Analytics dashboard (10 reports) — PRO
│       └── budget.ts               # Budget tracking (6 actions) — PRO
├── tests/
│   ├── mocks/
│   │   └── MockGitScrumClient.ts   # Shared mock for all tool tests
│   └── tools/                      # 22 test files, 378 tests
│       ├── tasks.test.ts
│       ├── sprints.test.ts
│       ├── projects.test.ts
│       ├── clientflow.test.ts
│       ├── discussions.test.ts
│       ├── timeTracking.test.ts
│       ├── userStories.test.ts
│       ├── notes.test.ts
│       ├── wiki.test.ts
│       ├── labels.test.ts
│       ├── comments.test.ts
│       ├── epics.test.ts
│       ├── taskTypes.test.ts
│       ├── workflows.test.ts
│       ├── activity.test.ts
│       ├── budget.test.ts
│       ├── standup.test.ts
│       ├── analytics.test.ts
│       ├── search.test.ts
│       ├── auth.test.ts
│       ├── registration.test.ts    # Verifies all modules register correctly
│       └── toolRegistry.test.ts    # Registry unit tests
├── docs/
│   ├── TOOLS.md                    # Full tools reference
│   ├── USAGE.md                    # Usage examples
│   ├── SECURITY.md                 # Security model
│   ├── DEVELOPMENT.md              # This file
│   └── tools/                      # Per-tool deep-dive guides
├── dist/                           # Compiled output
├── coverage/                       # Test coverage reports
└── package.json
```

## Architecture

### Tool Registry Pattern

The server uses a **centralized registry** with O(1) tool dispatch — no `if/else` chains or `switch` statements in the entry point.

```
index.ts → initializeToolModules() → registerModule() per module
         → routeToolCall()         → handlerMap.get(name) → handler
```

**Key files:**

| File | Role |
|:-----|:-----|
| `toolRegistry.ts` | Registry with `registerModule()`, `routeToolCall()`, `getAllTools()` |
| `actionHandler.ts` | `ActionHandlerMap`, `executeAction()`, response helpers |
| `initModules.ts` | Defines and registers all 20 `ToolModule` objects |

### Action Handler Pattern

Each tool uses **map-based action routing** instead of `switch/case`:

```typescript
const handlers: ActionHandlerMap<MyArgs> = {
  list: async (client, args) => { ... },
  create: async (client, args) => { ... },
};

// executeAction() looks up the action key in the map and calls it
return executeAction(handlers, action, client, args);
```

Helper functions from `actionHandler.ts`:

| Function | Purpose |
|:---------|:--------|
| `success(data, context?)` | Wrap successful response |
| `error(message)` | Wrap error response with `isError: true` |
| `required(fieldName)` | Shorthand for missing required field error |
| `normalizeColor(color)` | Named color → hex, strips `#` prefix |
| `resolveProjectContext(client, args)` | Auto-resolve `company_slug` + `project_slug` |
| `executeAction(map, action, client, args)` | Map-based action dispatch with error handling |

## Available Commands

| Command | Description |
|:--------|:------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Watch mode for development |
| `npm test` | Run full test suite (vitest) |
| `npm run test:watch` | Watch mode for tests |
| `npm run test:ui` | Visual test interface |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Run ESLint |

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run a specific test file
npx vitest run tests/tools/epics.test.ts

# Run tests matching a pattern
npx vitest run -t "should create epic"
```

### Writing Tests

Tests live in `tests/tools/`. Each test file imports the `register*` and `handle*` functions directly — no need to go through `index.ts`.

```typescript
import { describe, it, expect } from 'vitest';
import { handleEpicTool, registerEpicTools } from '../../src/tools/epics.js';

const mockClient = {
  getEpics: async () => [{ uuid: 'epic-1', title: 'Auth Epic' }],
  createEpic: async () => ({ uuid: 'new-epic', title: 'New Epic' }),
};

describe('Epics Tools (Consolidated)', () => {
  describe('registerEpicTools', () => {
    it('should register 1 consolidated epic tool', () => {
      const tools = registerEpicTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('epic');
    });

    it('epic tool should have action enum', () => {
      const tools = registerEpicTools();
      const actionProp = tools[0].inputSchema.properties?.action as { enum: string[] };
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('create');
    });
  });

  describe('handleEpicTool - action:list', () => {
    it('should return epics', async () => {
      const result = await handleEpicTool(mockClient as any, 'epic', {
        action: 'list',
        project_slug: 'my-project',
        company_slug: 'my-workspace',
      });
      expect(result.isError).toBeUndefined();
    });

    it('should require project context', async () => {
      const result = await handleEpicTool(mockClient as any, 'epic', { action: 'list' });
      expect(result.isError).toBe(true);
    });
  });
});
```

## Testing with MCP Inspector

The MCP Inspector is the official debugging tool for MCP servers:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a web interface where you can:
- List available tools
- Call tools with custom arguments
- View responses and errors
- Debug tool behavior

## Environment Variables

| Variable | Purpose | Default |
|:---------|:--------|:--------|
| `GITSCRUM_API_URL` | API endpoint override | `https://services.gitscrum.com` |
| `GITSCRUM_TOKEN` | Pre-configured auth token (skips login) | — |

Set them in your shell before running the server:

```bash
# macOS / Linux
export GITSCRUM_API_URL=http://localhost:8000
export GITSCRUM_TOKEN=your-dev-token

# Windows (PowerShell)
$env:GITSCRUM_API_URL = "http://localhost:8000"
$env:GITSCRUM_TOKEN = "your-dev-token"
```

**Token resolution order:** `GITSCRUM_TOKEN` env var → saved file at `~/.gitscrum/mcp-token.json`.

If neither is set, the user must authenticate via the `auth_login` / `auth_complete` device flow.

## Adding a New Tool

Every tool follows the same three-file pattern: **tool file** → **initModules.ts** → **test file**.

### 1. Create the Tool File

Create `src/tools/myFeature.ts` using the Action Handler pattern:

```typescript
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../client/GitScrumClient.js";
import {
  executeAction,
  success,
  required,
  resolveProjectContext,
  type ActionHandlerMap,
  type ToolResponse,
} from "./shared/actionHandler.js";

// ─── Tool Registration ───────────────────────────────────────────────

export function registerMyFeatureTools(): Tool[] {
  return [
    {
      name: "my_feature",
      description: [
        "My feature. Actions: list, create.",
        "",
        "Workflow:",
        "- 'list': requires company_slug + project_slug",
        "- 'create': requires title + company_slug + project_slug",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: {
            type: "string",
            enum: ["list", "create"],
            description: "Which operation to perform",
          },
          company_slug: { type: "string", description: "Workspace identifier" },
          project_slug: { type: "string", description: "Project identifier" },
          title: { type: "string", description: "Title text. Required for: create" },
        },
        required: ["action", "company_slug", "project_slug"],
      },
    },
  ];
}

// ─── Types ───────────────────────────────────────────────────────────

interface MyFeatureArgs {
  action: string;
  company_slug: string;
  project_slug: string;
  title?: string;
}

// ─── Action Handlers ─────────────────────────────────────────────────

const myFeatureHandlers: ActionHandlerMap<MyFeatureArgs> = {
  list: async (client, args) => {
    const resolved = await resolveProjectContext(client, {
      company_slug: args.company_slug,
      project_slug: args.project_slug,
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const data = await client.getMyFeature(resolved.project_slug, resolved.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  create: async (client, args) => {
    if (!args.title) return required("title");

    const resolved = await resolveProjectContext(client, {
      company_slug: args.company_slug,
      project_slug: args.project_slug,
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const result = await client.createMyFeature(resolved.project_slug, resolved.company_slug, {
      title: args.title,
    });
    return success(JSON.stringify({ created: true, result }, null, 2));
  },
};

// ─── Main Handler ────────────────────────────────────────────────────

export async function handleMyFeatureTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown>
): Promise<ToolResponse> {
  return executeAction(myFeatureHandlers, args.action as string, client, args);
}
```

### 2. Register in initModules.ts

Open `src/tools/shared/initModules.ts` and add your module:

```typescript
import { registerMyFeatureTools, handleMyFeatureTool } from '../myFeature.js';

// Add with the other module definitions:
const myFeatureModule: ToolModule = {
  tools: registerMyFeatureTools(),
  handler: handleMyFeatureTool,
  handles: ['my_feature'],  // must match the tool name(s) from step 1
};

// Add to initializeToolModules():
registerModule(myFeatureModule);
```

> **Note:** `index.ts` does NOT need changes. It calls `initializeToolModules()` once at startup and uses `routeToolCall()` for dispatch — both come from the registry.

### 3. Add Tests

Create `tests/tools/myFeature.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { registerMyFeatureTools, handleMyFeatureTool } from '../../src/tools/myFeature.js';

const mockClient = {
  getMyFeature: async () => [{ uuid: 'feat-1', title: 'Feature A' }],
  createMyFeature: async () => ({ uuid: 'new-feat', title: 'New Feature' }),
};

describe('MyFeature Tools', () => {
  it('should register 1 consolidated tool', () => {
    const tools = registerMyFeatureTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('my_feature');
  });

  it('should list features', async () => {
    const result = await handleMyFeatureTool(mockClient as any, 'my_feature', {
      action: 'list',
      company_slug: 'acme',
      project_slug: 'dashboard',
    });
    expect(result.isError).toBeUndefined();
  });

  it('should require title for create', async () => {
    const result = await handleMyFeatureTool(mockClient as any, 'my_feature', {
      action: 'create',
      company_slug: 'acme',
      project_slug: 'dashboard',
    });
    expect(result.isError).toBe(true);
  });
});
```

### 4. Verify Registration

Run the full suite to confirm your module integrates correctly:

```bash
npm test
```

The `registration.test.ts` file automatically verifies that all modules register without conflicts.

## Code Style

### TypeScript

- Use strict mode
- Define explicit types for function parameters and returns
- Use `readonly` for immutable properties
- Prefer `const` over `let`

### Error Handling

- Always validate required parameters using `required()` from `actionHandler.ts`
- Return structured responses using `success()` and `error()` helpers
- Never use raw `switch/case` — use `ActionHandlerMap` + `executeAction()`

### Security

- Never add DELETE operations to MCP tools
- Never log sensitive data (tokens, passwords)
- Validate all user input

## Contributing

### Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run `npm test` and `npm run lint`
6. Commit with a descriptive message
7. Push and open a Pull Request

### Commit Messages

Follow conventional commits:

```
feat: add new sprint velocity tool
fix: correct time zone handling in time_log
docs: update TOOLS.md with new parameters
test: add coverage for edge cases
refactor: simplify error handling in client
```

### Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Documentation updated
- [ ] No DELETE operations added
- [ ] No sensitive data exposed

## Release Process

Releases are done manually. There is no CI/CD pipeline yet.

1. Ensure all tests pass: `npm test`
2. Ensure build succeeds: `npm run build`
3. Update version in `package.json`
4. Update `CHANGELOG.md` (move `[Unreleased]` items to new version section)
5. Commit: `git commit -am "release: v1.x.x"`
6. Tag: `git tag v1.x.x`
7. Push: `git push origin main --tags`
8. Publish: `npm publish --access public`

## Getting Help

- Check existing issues on GitHub
- Email: dev@gitscrum.com
