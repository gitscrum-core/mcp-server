/**
 * Search Tools
 *
 * MCP tools for searching across GitScrum entities
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../client/GitScrumClient.js";
import { 
  success, 
  required,
  type ToolResponse
} from "./shared/actionHandler.js";

/**
 * Register search tools
 */
export function registerSearchTools(): Tool[] {
  return [
    {
      name: "search",
      description: [
        "Search across workspaces, projects, tasks, sprints, wiki, notes by name.",
        "",
        "Use to discover slugs and UUIDs needed by other tools.",
        "Results include entity type, name, and identifiers.",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          query: {
            type: "string",
            description: "Search text (min 2 chars)",
          },
          categories: {
            type: "string",
            description: "Filter: workspaces, tasks, projects, user_stories, sprints, wiki, notes",
          },
          limit: {
            type: "number",
            description: "Results per category (default: 5)",
          },
        },
        required: ["query"],
      },
      annotations: { title: "Search", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
  ];
}

/**
 * Handle search tool calls
 */
export async function handleSearchTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const query = args.query as string;

  if (!query || query.length < 2) {
    return required("query (min 2 chars)");
  }

  const results = await client.search(query, {
    categories: args.categories as string | undefined,
    limit: args.limit as number | undefined,
  });

  return success(JSON.stringify(results, null, 2));
}
