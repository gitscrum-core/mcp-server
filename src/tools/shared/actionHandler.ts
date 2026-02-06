/**
 * Shared Action Handler Pattern
 * 
 * Eliminates switch statements with a clean, extensible map-based approach.
 * Each tool defines its actions as a record of handlers.
 */
import type { GitScrumClient } from "../../client/GitScrumClient.js";

/** Standard MCP response */
export type ToolResponse = { 
  content: Array<{ type: "text"; text: string }>; 
  isError?: boolean 
};

/** Handler function signature */
export type ActionHandler<TArgs = Record<string, unknown>> = (
  client: GitScrumClient,
  args: TArgs
) => Promise<ToolResponse>;

/** Map of action name to handler */
export type ActionHandlerMap<TArgs = Record<string, unknown>> = Record<
  string, 
  ActionHandler<TArgs>
>;

/** Execute action from handler map with error handling */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeAction(
  handlers: ActionHandlerMap<any>,
  action: string,
  client: GitScrumClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any
): Promise<ToolResponse> {
  const handler = handlers[action];
  
  if (!handler) {
    return error(`Unknown action: ${action}`);
  }

  try {
    return await handler(client, args);
  } catch (err) {
    return error(err instanceof Error ? err.message : String(err));
  }
}

// ============================================================================
// Response Helpers
// ============================================================================

/** Context object for LLM memory */
export interface ResponseContext {
  company_slug?: string;
  project_slug?: string;
  sprint_slug?: string;
  user_story_slug?: string;
  task_uuid?: string;
}

/** Format context block for LLM (user doesn't need to see, LLM uses for next calls) */
function formatContext(ctx: ResponseContext): string {
  const parts = Object.entries(ctx)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${v}`);
  
  if (parts.length === 0) return "";
  return `\n\n---context\n${parts.join("\n")}\n---`;
}

/** Success response */
export function success(text: string, context?: ResponseContext): ToolResponse {
  const contextBlock = context ? formatContext(context) : "";
  return { content: [{ type: "text", text: text + contextBlock }] };
}

/** Error response */
export function error(message: string): ToolResponse {
  return { content: [{ type: "text", text: message }], isError: true };
}

/** Validation error */
export function required(field: string): ToolResponse {
  return { content: [{ type: "text", text: `Error: ${field} required` }], isError: true };
}

// ============================================================================
// Color Helper
// ============================================================================

const COLOR_MAP: Record<string, string> = {
  gray: "8B949E", blue: "58A6FF", red: "F85149", green: "3FB950",
  yellow: "D29922", purple: "A371F7", coral: "FF7B72", amber: "F2CC60",
  sky: "79C0FF", lime: "56D364",
};

/** Normalize color input: supports named colors and hex codes (strips #) */
export function normalizeColor(color: string): string {
  const lower = color.toLowerCase().replace("#", "");
  return COLOR_MAP[lower] || lower.toUpperCase();
}

// ============================================================================
// Auto-Resolution Helper
// ============================================================================

interface ResolvedContext {
  company_slug: string;
  project_slug: string;
}

/**
 * Intelligently resolves project context from partial information.
 * STATELESS: Performs API calls to find missing data.
 * 
 * Resolution strategies (in order):
 * 1. Both company_slug and project_slug provided → use as-is
 * 2. Only project identifier provided (name OR slug) → search and get both slugs
 * 3. Only company_slug provided → return null (need project)
 * 4. Nothing provided → return null
 * 
 * The key insight: project_slug might be:
 * - An actual slug (e.g., "my-project")
 * - A project name (e.g., "My Project")
 * - A UUID
 * 
 * We try to find it by searching.
 * 
 * @returns ResolvedContext or null if resolution failed
 */
export async function resolveProjectContext(
  client: GitScrumClient,
  args: { 
    company_slug?: string; 
    project_slug?: string;
    project_name?: string; // Alternative: explicit project name
  }
): Promise<ResolvedContext | null> {
  // Case 1: Both provided - use as-is (trust the caller)
  if (args.company_slug && args.project_slug) {
    return {
      company_slug: args.company_slug,
      project_slug: args.project_slug,
    };
  }
  
  // Determine what project identifier we have
  const projectIdentifier = args.project_slug || args.project_name;
  
  // Case 2: We have a project identifier (name, slug, or uuid) - search for it
  if (projectIdentifier) {
    const found = await client.findProjectByName(projectIdentifier, args.company_slug);
    if (found) {
      return {
        company_slug: found.company_slug,
        project_slug: found.project_slug,
      };
    }
    // If we have company_slug but couldn't find project, return null
    // The project identifier might be wrong
    return null;
  }
  
  // Case 3: Only company_slug, no project - can't resolve full context
  // Case 4: Nothing provided
  return null;
}

