#!/usr/bin/env node
/**
 * GitScrum Studio MCP Server — Powered by Vurb.ts
 *
 * Bootstrap with startServer() + autoDiscover() — zero boilerplate.
 *
 * @module @gitscrum-studio/mcp-server
 * @license MIT
 */

import { fileURLToPath } from 'node:url';
import { createRequire } from 'module';
import { startServer, autoDiscover } from '@vurb/core';
import { GitScrumClient } from './client/GitScrumClient.js';
import { DeviceAuthenticator } from './auth/DeviceAuthenticator.js';
import { TokenManager } from './auth/TokenManager.js';
import { f } from './context.js';
import type { AppContext } from './context.js';

// Load package.json for version info
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// =============================================================================
// CLI FLAGS
// =============================================================================

const args = process.argv.slice(2);

if (args.includes('--auth')) {
  runAuthFlow().catch((error) => {
    console.error('Authentication failed:', error.message);
    process.exit(1);
  });
} else if (args.includes('--version') || args.includes('-v')) {
  console.log(pkg.version);
  process.exit(0);
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
GitScrum Studio MCP Server v${pkg.version}

Usage:
  npx -y @gitscrum-studio/mcp-server [options]

Options:
  --auth      Authenticate via Device Flow and print token
  --version   Show version number
  --help      Show this help message

MCP Server:
  Without options, starts the MCP server  using stdio transport.
  Configure in your AI client (Claude, Cursor, VS Code, etc.)

Examples:
  # Get token for SSE clients
  npx -y @gitscrum-studio/mcp-server --auth

  # Run as MCP server (normal mode)
  npx -y @gitscrum-studio/mcp-server
`);
  process.exit(0);
} else {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// =============================================================================
// AUTH FLOW (--auth flag)
// =============================================================================

async function runAuthFlow(): Promise<void> {
  const tokenManager = new TokenManager();

  const existingToken = tokenManager.getToken();
  if (existingToken) {
    console.log('\n✓ Already authenticated\n');
    console.log('Your token:');
    console.log('─'.repeat(50));
    console.log(existingToken);
    console.log('─'.repeat(50));
    console.log('\nUse this token in your SSE client configuration.');
    console.log('To re-authenticate, delete ~/.gitscrum/mcp-token.json\n');
    process.exit(0);
  }

  const auth = new DeviceAuthenticator();

  console.log('\nStarting GitScrum Device Flow authentication...\n');

  const codeResponse = await auth.requestDeviceCode();

  console.log('Open this URL in your browser to authorize:\n');
  console.log(`  ${codeResponse.verification_uri_complete}\n`);
  console.log('Waiting for authorization...');

  const pollInterval = (codeResponse.interval || 5) * 1000;
  const expiresAt = Date.now() + (codeResponse.expires_in * 1000);

  while (Date.now() < expiresAt) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    const token = await auth.pollForToken(codeResponse.device_code);

    if (token) {
      tokenManager.saveToken(token.access_token);

      console.log('\n✓ Authentication successful!\n');
      console.log('Your token:');
      console.log('─'.repeat(50));
      console.log(token.access_token);
      console.log('─'.repeat(50));
      console.log('\nToken saved to ~/.gitscrum/mcp-token.json');
      console.log('Use this token in your SSE client configuration.\n');
      process.exit(0);
    }

    process.stdout.write('.');
  }

  throw new Error('Authorization timed out. Please try again.');
}

// =============================================================================
// SERVER (vurb.ts startServer + autoDiscover)
// =============================================================================

async function main(): Promise<void> {
  // 1. Create API client
  const client = new GitScrumClient();

  // 2. Create registry and auto-discover all tools
  const registry = f.registry();
  const toolsDir = fileURLToPath(new URL('./tools', import.meta.url));
  await autoDiscover(registry, toolsDir);

  // 3. Start server (vurb.ts handles MCP SDK attachment, transport, telemetry)
  const { server } = await startServer<AppContext>({
    name: 'gitscrum',
    version: pkg.version,
    registry,
    contextFactory: () => ({ client }),
  });

  // 4. Log startup
  if (server) {
    const version = `v${pkg.version}`;
    const title = `GitScrum Studio MCP Server ${version}`;
    const padding = Math.max(0, 45 - title.length);
    const paddedTitle = ' '.repeat(Math.floor(padding / 2)) + title + ' '.repeat(Math.ceil(padding / 2));
    console.error('╔═══════════════════════════════════════════════╗');
    console.error(`║${paddedTitle}║`);
    console.error('╚═══════════════════════════════════════════════╝');
    console.error('');
    console.error(`  API:   ${process.env.GITSCRUM_API_URL || 'https://services.gitscrum.com'}`);
    console.error(`  Auth:  ${client.isAuthenticated() ? '✓ Authenticated' : '✗ Not authenticated (use auth.login)'}`);
    console.error(`  Tools: ${registry.size} registered`);
    console.error('');
  }
}
