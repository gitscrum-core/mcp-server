# Contributing to GitScrum Studio MCP Server

Thank you for your interest in contributing to the GitScrum Studio MCP Server! This document provides guidelines and information to make the contribution process smooth and effective.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors are expected to:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Accept criticism gracefully
- Put the community first

---

## Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** for version control

### Development Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/mcp-server.git
cd mcp-server

# 3. Add upstream remote
git remote add upstream https://github.com/gitscrum-core/mcp-server.git

# 4. Install dependencies
npm install

# 5. Build the project
npm run build

# 6. Run tests to verify setup
npm test
```

### Testing Your Changes

```bash
# Run the test suite
npm test

# Run tests in watch mode
npm run test:watch

# Visual test interface
npm run test:ui

# Test with MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. **Search existing issues** to avoid duplicates
2. **Use the latest version** to verify the bug still exists

When creating a bug report, include:

- A clear, descriptive title
- Steps to reproduce the behavior
- Expected vs actual behavior
- Your environment (Node.js version, OS, AI client)
- Relevant error messages or logs

### Suggesting Features

We welcome feature suggestions! Please:

1. Open an issue with the `enhancement` label
2. Describe the feature and its use case
3. Explain how it benefits users
4. Consider potential implementation approaches

### Submitting Code

1. **Check for existing work** - Look for related issues or PRs
2. **Open an issue first** for major changes
3. **Keep changes focused** - One feature/fix per PR
4. **Write tests** for new functionality
5. **Update documentation** as needed

---

## Development Guidelines

### Project Structure

```
src/
├── index.ts                    # Server entry point & MCP lifecycle
├── auth/
│   ├── TokenManager.ts         # Secure local token storage
│   └── DeviceAuthenticator.ts  # OAuth 2.0 Device Authorization (RFC 8628)
├── client/
│   └── GitScrumClient.ts       # API client with error handling
└── tools/
    ├── shared/
    │   ├── toolRegistry.ts     # Centralized tool registry (O(1) dispatch)
    │   ├── actionHandler.ts    # Action routing & response helpers
    │   └── initModules.ts      # Module initialization
    ├── auth.ts
    ├── tasks.ts
    ├── projects.ts
    └── ...                     # 20 tool modules total
```

### Adding a New Tool

See the full walkthrough in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#adding-a-new-tool). In short:

1. **Create tool file** in `src/tools/` using the `ActionHandlerMap` + `executeAction()` pattern
2. **Register module** in `src/tools/shared/initModules.ts` as a `ToolModule`
3. **Add tests** in `tests/tools/`
4. **Update documentation** as needed

> `index.ts` does not need changes — it uses the centralized registry.

### Error Handling

Use the response helpers from `actionHandler.ts`:

```typescript
import { success, error, required } from "./shared/actionHandler.js";

// Missing required field
if (!args.title) return required("title");

// Structured success
return success(JSON.stringify(data, null, 2));

// Structured error
return error("Something went wrong");
```

---

## Pull Request Process

### Before Submitting

- [ ] Code builds without errors (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive

### PR Guidelines

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make atomic commits**
   - Each commit should be a logical unit
   - Use conventional commit messages:
     - `feat: add new tool for X`
     - `fix: handle edge case in Y`
     - `docs: update README with Z`
     - `test: add tests for W`

3. **Keep PRs focused**
   - One feature or fix per PR
   - Smaller PRs are reviewed faster

4. **Write a good PR description**
   - Explain what changes you made
   - Link related issues
   - Include screenshots for UI changes

### Review Process

1. All PRs require at least one approval
2. Tests and build must pass locally
3. Reviewers may request changes
4. Once approved, maintainers will merge

---

## Style Guide

### TypeScript

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use explicit types for function parameters and returns
- Use `interface` for object shapes

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | camelCase | `tokenManager.ts` |
| Classes | PascalCase | `GitScrumClient` |
| Functions | camelCase | `handleAuthTool` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Tool names | snake_case | `task`, `sprint`, `epic` |

### Documentation

- Add JSDoc comments for public functions
- Keep comments concise but helpful
- Update README for user-facing changes

```typescript
/**
 * Creates a new task in the specified project.
 * 
 * @param projectSlug - The project's unique identifier
 * @param data - Task creation data
 * @returns The created task object
 */
async createTask(projectSlug: string, data: TaskData): Promise<Task> {
  // ...
}
```

---

## Questions?

- Open an issue for technical questions
- Visit [gitscrum.com](https://gitscrum.com) for product questions
- Check existing issues and discussions

---

## Thank You

Your contributions make GitScrum Studio MCP Server better for everyone. We appreciate your time and effort!

---

<p align="center">
  <strong>Happy Contributing! 🎉</strong>
</p>
