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

import { GitScrumClient } from "./client/GitScrumClient.js";
import { initializeToolModules } from "./tools/shared/initModules.js";
import { getAllTools, routeToolCall } from "./tools/shared/toolRegistry.js";

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
    version: "1.0.0",
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
  console.error("╔═══════════════════════════════════════════════╗");
  console.error("║       GitScrum Studio MCP Server v1.0.0       ║");
  console.error("╚═══════════════════════════════════════════════╝");
  console.error("");
  console.error(`  API:   ${process.env.GITSCRUM_API_URL || "https://services.gitscrum.com"}`);
  console.error(`  Auth:  ${client.isAuthenticated() ? "✓ Authenticated" : "✗ Not authenticated (use auth_login)"}`);
  console.error("");
}

// Run the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
