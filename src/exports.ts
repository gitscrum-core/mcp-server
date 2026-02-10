/**
 * GitScrum MCP Server - Public API
 *
 * Exports for hosted/SSE deployments.
 *
 * @module @gitscrum-studio/mcp-server
 */

// Core client
export { GitScrumClient } from "./client/GitScrumClient.js";
export type { ApiResponse } from "./client/GitScrumClient.js";

// Tool registry
export {
  getAllTools,
  routeToolCall,
  registerModule,
  isToolRegistered,
  getHandler,
  clearRegistry,
} from "./tools/shared/toolRegistry.js";
export type { ToolHandler, ToolModule } from "./tools/shared/toolRegistry.js";

// Tool initialization
export { initializeToolModules } from "./tools/shared/initModules.js";

// Action handler utilities
export {
  success,
  error,
  executeAction,
  normalizeColor,
  resolveProjectContext,
} from "./tools/shared/actionHandler.js";
export type { ToolResponse, ActionHandler, ActionHandlerMap, ResponseContext } from "./tools/shared/actionHandler.js";

// Auth
export { TokenManager } from "./auth/TokenManager.js";
export { DeviceAuthenticator } from "./auth/DeviceAuthenticator.js";
export type { DeviceCodeResponse, TokenResponse } from "./auth/DeviceAuthenticator.js";

// Server info
export const SERVER_NAME = "gitscrum";
export const SERVER_VERSION = "1.0.4";
export const SERVER_INSTRUCTIONS = "GitScrum project management. Stateless MCP - always provide required parameters.";
