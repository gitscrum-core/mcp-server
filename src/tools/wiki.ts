/**
 * Wiki MCP Tool (Consolidated)
 * 
 * Uses Action Handler pattern for clean, extensible code.
 */
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../client/GitScrumClient.js";
import { 
  executeAction, 
  success, 
  required,
  resolveProjectContext,
  type ActionHandlerMap,
  type ToolResponse,
  type ResponseContext
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerWikiTools(): Tool[] {
  return [
    {
      name: "wiki",
      description: [
        "Wiki pages. Actions: list, get, create, update, search.",
        "",
        "All actions require company_slug + project_slug.",
        "'get'/'update' require uuid (from 'list' response).",
        "'search' requires q (search query, min 2 chars).",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: {
            type: "string",
            enum: ["list", "get", "create", "update", "search"],
            description: "Which operation to perform",
          },
          project_slug: { 
            type: "string", 
            description: "Project identifier (always required)" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier (always required)" 
          },
          uuid: { 
            type: "string", 
            description: "Existing page's unique ID. Only for: get, update. NOT for create." 
          },
          title: { 
            type: "string", 
            description: "Page title/heading text. Required when creating a new page." 
          },
          content: { 
            type: "string", 
            description: "Page body text in Markdown. This is the actual content to save. Required for create." 
          },
          parent_uuid: { 
            type: "string", 
            description: "Parent page ID for nested pages (optional)" 
          },
          q: { 
            type: "string", 
            description: "Search query (min 2 chars). Required for search action." 
          },
          limit: { 
            type: "number", 
            description: "Max results for search (default 20, max 50)" 
          },
        },
        required: ["action", "company_slug", "project_slug"],
      },
      annotations: {
        title: "Wiki Documentation",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface WikiArgs {
  action: string;
  company_slug: string;
  project_slug: string;
  uuid?: string;
  title?: string;
  content?: string;
  parent_uuid?: string;
  q?: string;
  limit?: number;
}

// ============================================================================
// Action Handlers
// ============================================================================

const wikiHandlers: ActionHandlerMap<WikiArgs> = {
  list: async (client, args) => {
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const pages = await client.getWikiPages(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(pages, null, 2), ctx);
  },

  get: async (client, args) => {
    if (!args.uuid) return required("uuid");

    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const page = await client.getWikiPage(args.uuid, resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(page, null, 2), ctx);
  },

  create: async (client, args) => {
    if (!args.title || !args.content) return required("title and content");

    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const page = await client.createWikiPage({
      title: args.title,
      content: args.content,
      project_slug: resolved.project_slug,
      company_slug: resolved.company_slug,
      parent_uuid: args.parent_uuid,
    });
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify({ created: true, page }, null, 2), ctx);
  },

  update: async (client, args) => {
    if (!args.uuid) return required("uuid");

    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const updateData: { title?: string; content?: string } = {};
    if (args.title) updateData.title = args.title;
    if (args.content) updateData.content = args.content;

    await client.updateWikiPage(args.uuid, resolved.project_slug, resolved.company_slug, updateData);
    return success(JSON.stringify({ updated: true, uuid: args.uuid }, null, 2));
  },

  search: async (client, args) => {
    if (!args.q) return required("q (search query, min 2 characters)");

    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const results = await client.searchWikiPages(resolved.project_slug, resolved.company_slug, args.q, args.limit);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(results, null, 2), ctx);
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleWikiTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const action = args.action as string;
  return executeAction(wikiHandlers, action, client, args);
}
