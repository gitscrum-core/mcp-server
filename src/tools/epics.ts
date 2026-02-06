/**
 * Epics MCP Tool (Consolidated)
 * 
 * Uses Action Handler pattern for clean, extensible code.
 */
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../client/GitScrumClient.js";
import { 
  executeAction, 
  success, 
  required,
  normalizeColor,
  resolveProjectContext,
  type ActionHandlerMap,
  type ToolResponse,
  type ResponseContext
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerEpicTools(): Tool[] {
  return [
    {
      name: "epic",
      description: [
        "Epics. Actions: list, create, update.",
        "",
        "Workflow:",
        "- 'list': requires company_slug + project_slug (returns epics with their uuid)",
        "- 'create': requires title + company_slug + project_slug",
        "- 'update': requires epic_uuid (from 'list' response) + company_slug + project_slug",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: {
            type: "string",
            enum: ["list", "create", "update"],
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
          title: { 
            type: "string", 
            description: "Epic title/name text. Required when creating a new epic." 
          },
          description: { 
            type: "string", 
            description: "Epic description in markdown (optional)" 
          },
          color: { 
            type: "string", 
            description: "Color hex code without # e.g. 'FF5733' (optional)" 
          },
          epic_uuid: { 
            type: "string", 
            description: "Existing epic's unique ID. Only for: update. NOT for create." 
          },
        },
        required: ["action", "project_slug", "company_slug"],
      },
      annotations: {
        title: "Epics",
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

interface EpicArgs {
  action: string;
  company_slug: string;
  project_slug: string;
  title?: string;
  description?: string;
  color?: string;
  epic_uuid?: string;
}

// ============================================================================
// Action Handlers
// ============================================================================

const epicHandlers: ActionHandlerMap<EpicArgs> = {
  list: async (client, args) => {
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const epics = await client.getEpics(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(epics, null, 2), ctx);
  },

  create: async (client, args) => {
    if (!args.title) return required("title");
    
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const data: { title: string; description?: string; color?: string } = { title: args.title };
    if (args.description) data.description = args.description;
    if (args.color) data.color = normalizeColor(args.color);

    const epic = await client.createEpic(resolved.project_slug, resolved.company_slug, data);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify({ created: true, epic }, null, 2), ctx);
  },

  update: async (client, args) => {
    if (!args.epic_uuid) return required("epic_uuid");
    
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const data: { title?: string; description?: string; color?: string } = {};
    if (args.title) data.title = args.title;
    if (args.description) data.description = args.description;
    if (args.color) data.color = normalizeColor(args.color);

    await client.updateEpic(args.epic_uuid, resolved.project_slug, resolved.company_slug, data);
    return success(JSON.stringify({ updated: true, epic_uuid: args.epic_uuid }, null, 2));
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleEpicTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown>
): Promise<ToolResponse> {
  const action = args.action as string;
  return executeAction(epicHandlers, action, client, args);
}
