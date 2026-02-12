#!/usr/bin/env node
/**
 * GitScrum Studio MCP Server
 *
 * A Model Context Protocol (MCP) server that connects AI assistants to GitScrum,
 * enabling natural language project management, task tracking, time management,
 * sprint planning, and client relationship management.
 *
 * @module @gitscrum-studio/mcp-server
 * @author GitScrum <hello@gitscrum.com>
 * @license MIT
 * @see https://github.com/gitscrum-core/mcp-server
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { createRequire } from "module";
import { GitScrumClient } from "./client/GitScrumClient.js";
import { initializeToolModules } from "./tools/shared/initModules.js";
import { getAllTools, routeToolCall } from "./tools/shared/toolRegistry.js";
import { DeviceAuthenticator } from "./auth/DeviceAuthenticator.js";
import { TokenManager } from "./auth/TokenManager.js";

// Load package.json for version info
const require = createRequire(import.meta.url);
const pkg = require("../package.json");

// =============================================================================
// CLI FLAGS
// =============================================================================

const args = process.argv.slice(2);

// Handle --auth flag: standalone Device Flow authentication
if (args.includes("--auth")) {
  runAuthFlow().catch((error) => {
    console.error("Authentication failed:", error.message);
    process.exit(1);
  });
} else if (args.includes("--version") || args.includes("-v")) {
  console.log(pkg.version);
  process.exit(0);
} else if (args.includes("--help") || args.includes("-h")) {
  console.log(`
GitScrum Studio MCP Server v${pkg.version}

Usage:
  npx -y @gitscrum-studio/mcp-server [options]

Options:
  --auth      Authenticate via Device Flow and print token
  --version   Show version number
  --help      Show this help message

MCP Server:
  Without options, starts the MCP server using stdio transport.
  Configure in your AI client (Claude, Cursor, VS Code, etc.)

Examples:
  # Get token for SSE clients
  npx -y @gitscrum-studio/mcp-server --auth

  # Run as MCP server (normal mode)
  npx -y @gitscrum-studio/mcp-server
`);
  process.exit(0);
} else {
  // Normal MCP server mode
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

// =============================================================================
// AUTH FLOW (--auth flag)
// =============================================================================

/**
 * Runs standalone Device Flow authentication.
 * Prints token to stdout for use in SSE clients.
 */
async function runAuthFlow(): Promise<void> {
  const tokenManager = new TokenManager();
  
  // Check if already authenticated
  const existingToken = tokenManager.getToken();
  if (existingToken) {
    console.log("\n✓ Already authenticated\n");
    console.log("Your token:");
    console.log("─".repeat(50));
    console.log(existingToken);
    console.log("─".repeat(50));
    console.log("\nUse this token in your SSE client configuration.");
    console.log("To re-authenticate, delete ~/.gitscrum/mcp-token.json\n");
    process.exit(0);
  }

  const auth = new DeviceAuthenticator();
  
  console.log("\nStarting GitScrum Device Flow authentication...\n");
  
  // Get device code
  const codeResponse = await auth.requestDeviceCode();
  
  console.log("Open this URL in your browser to authorize:\n");
  console.log(`  ${codeResponse.verification_uri_complete}\n`);
  console.log("Waiting for authorization...");
  
  // Poll for token
  const pollInterval = (codeResponse.interval || 5) * 1000;
  const expiresAt = Date.now() + (codeResponse.expires_in * 1000);
  
  while (Date.now() < expiresAt) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    
    const token = await auth.pollForToken(codeResponse.device_code);
    
    if (token) {
      // Save token
      tokenManager.saveToken(token.access_token);
      
      console.log("\n✓ Authentication successful!\n");
      console.log("Your token:");
      console.log("─".repeat(50));
      console.log(token.access_token);
      console.log("─".repeat(50));
      console.log("\nToken saved to ~/.gitscrum/mcp-token.json");
      console.log("Use this token in your SSE client configuration.\n");
      process.exit(0);
    }
    
    process.stdout.write(".");
  }
  
  throw new Error("Authorization timed out. Please try again.");
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/** GitScrum API client instance */
const client = new GitScrumClient();

// Initialize tool registry
initializeToolModules();

/**
 * Server instructions - minimal, let tools speak for themselves
 */
const serverInstructions = `GitScrum project management. Stateless MCP - always provide required parameters.`.trim();

/** MCP Server instance with capabilities declaration */
const server = new Server(
  {
    name: "gitscrum",
    version: "1.0.7",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
    instructions: serverInstructions,
  }
);

// =============================================================================
// TOOL REGISTRATION
// Exposes all available tools to MCP clients via centralized registry
// =============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: getAllTools() };
});

// =============================================================================
// TOOL EXECUTION
// Routes tool calls to appropriate handlers based on tool name
// =============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Route through centralized registry - stateless, no context tracking
    return await routeToolCall(client, name, args as Record<string, unknown>);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: errorMessage }],
      isError: true,
    };
  }
});

// =============================================================================
// RESOURCE REGISTRATION
// Exposes contextual resources for AI assistants
// =============================================================================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "gitscrum://user/me",
        mimeType: "application/json",
        name: "Current User",
        description: "Information about the authenticated GitScrum user",
      },
      {
        uri: "gitscrum://workspaces",
        mimeType: "application/json",
        name: "Workspaces",
        description: "List of workspaces the user has access to",
      },
      {
        uri: "gitscrum://mcp/manifest",
        mimeType: "application/json",
        name: "Server Manifest",
        description:
          "Read-only manifest of all tools and their action-level operations. Useful for inspection, diffing across versions, and understanding the full capability surface without executing anything.",
      },
    ],
  };
});

// =============================================================================
// RESOURCE READING
// Fetches resource content on demand
// =============================================================================

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    if (uri === "gitscrum://user/me") {
      const user = await client.getMe();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(user, null, 2),
          },
        ],
      };
    }

    if (uri === "gitscrum://workspaces") {
      const workspaces = await client.getWorkspaces();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(workspaces, null, 2),
          },
        ],
      };
    }

    if (uri === "gitscrum://mcp/manifest") {
      const tools = getAllTools();
      const manifest: Record<string, unknown> = {
        version: pkg.version,
        generated_at: new Date().toISOString(),
        tools: {} as Record<string, unknown>,
      };

      const toolMap = manifest.tools as Record<string, unknown>;

      for (const tool of tools) {
        const schema = tool.inputSchema as {
          properties?: Record<string, { type?: string; enum?: string[] }>;
        };
        const props = schema?.properties || {};

        // Extract action-level operations from the action or report enum
        const actionEnum = props.action?.enum || props.report?.enum || null;
        const dispatchKey = props.action?.enum
          ? "action"
          : props.report?.enum
            ? "report"
            : null;

        toolMap[tool.name] = {
          description: (tool.description || "").split("\n")[0],
          ...(dispatchKey && { dispatch_key: dispatchKey }),
          ...(actionEnum && { operations: actionEnum }),
          annotations: tool.annotations || {},
        };
      }

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(manifest, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read resource: ${errorMessage}`);
  }
});

// =============================================================================
// SERVER STARTUP
// Initializes the server with stdio transport
// =============================================================================

/**
 * Starts the MCP server and connects to the transport layer.
 * Uses stdio for communication with MCP clients.
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Log startup info to stderr (stdout is reserved for MCP protocol)
  const version = `v${pkg.version}`;
  const title = `GitScrum Studio MCP Server ${version}`;
  const padding = Math.max(0, 45 - title.length);
  const paddedTitle = " ".repeat(Math.floor(padding / 2)) + title + " ".repeat(Math.ceil(padding / 2));
  console.error("╔═══════════════════════════════════════════════╗");
  console.error(`║${paddedTitle}║`);
  console.error("╚═══════════════════════════════════════════════╝");
  console.error("");
  console.error(`  API:   ${process.env.GITSCRUM_API_URL || "https://services.gitscrum.com"}`);
  console.error(`  Auth:  ${client.isAuthenticated() ? "✓ Authenticated" : "✗ Not authenticated (use auth_login)"}`);
  console.error("");
}
