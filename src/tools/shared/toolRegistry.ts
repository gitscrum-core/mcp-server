/**
 * Tool Registry - Centralized Tool Registration & Routing
 * 
 * Eliminates if/else chains with a declarative map-based approach.
 * Each tool module registers itself here.
 */
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../../client/GitScrumClient.js";
import type { ToolResponse } from "./actionHandler.js";

// ============================================================================
// Types
// ============================================================================

/** Standardized handler signature for all tools */
export type ToolHandler = (
  client: GitScrumClient,
  name: string,
  args: Record<string, unknown>
) => Promise<ToolResponse>;

/** Tool module definition */
export interface ToolModule {
  /** Tool definitions for MCP */
  tools: Tool[];
  /** Handler function */
  handler: ToolHandler;
  /** Tool names this module handles */
  handles: string[];
}

// ============================================================================
// Registry
// ============================================================================

/** Map of tool name → handler */
const handlerMap = new Map<string, ToolHandler>();

/** All registered tools */
const allTools: Tool[] = [];

/**
 * Register a tool module
 */
export function registerModule(module: ToolModule): void {
  // Add tools to collection
  allTools.push(...module.tools);
  
  // Map each handled name to the handler
  for (const name of module.handles) {
    handlerMap.set(name, module.handler);
  }
}

/**
 * Get all registered tools
 */
export function getAllTools(): Tool[] {
  return allTools;
}

/**
 * Route a tool call to the appropriate handler
 */
export async function routeToolCall(
  client: GitScrumClient,
  name: string,
  args: Record<string, unknown>
): Promise<ToolResponse> {
  // Direct lookup
  const handler = handlerMap.get(name);
  if (handler) {
    return handler(client, name, args);
  }

  // Unknown tool
  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
}

/**
 * Check if a tool is registered
 */
export function isToolRegistered(name: string): boolean {
  return handlerMap.has(name);
}

/**
 * Get handler for a specific tool
 */
export function getHandler(name: string): ToolHandler | undefined {
  return handlerMap.get(name);
}

/**
 * Clear all registered tools (for testing)
 */
export function clearRegistry(): void {
  handlerMap.clear();
  allTools.length = 0;
}
