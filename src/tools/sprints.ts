/**
 * Sprint MCP Tool (Consolidated)
 * 
 * Uses Action Handler pattern for clean, extensible code.
 */
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../client/GitScrumClient.js";
import { 
  executeAction, 
  success, 
  required,
  error,
  resolveProjectContext,
  normalizeColor,
  type ActionHandlerMap,
  type ToolResponse,
  type ResponseContext
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerSprintTools(): Tool[] {
  return [
    {
      name: "sprint",
      description: [
        "Sprint management. Actions: list, all, get, kpis, stats, reports, progress, metrics, create, update.",
        "",
        "Workflow:",
        "- 'list': requires company_slug + project_slug (returns sprints with their slug)",
        "- 'all': no params needed (returns all sprints across workspaces)",
        "- 'get'/'kpis'/'stats'/'progress'/'metrics': requires slug (sprint slug from 'list' response) + company_slug + project_slug",
        "- 'reports': requires slug + company_slug + project_slug. Optional: resource (burndown, burnup, performance, types, efforts)",
        "- 'create': requires title + company_slug + project_slug. Dates default to today → +7 days",
        "- 'update': requires slug + company_slug + project_slug",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["list", "all", "get", "kpis", "stats", "reports", "progress", "metrics", "create", "update"], 
            description: "Which operation to perform" 
          },
          project_slug: { 
            type: "string", 
            description: "Project identifier. Required for: list, get, kpis, create, update, delete" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier. Required for: list, get, kpis, create, update, delete" 
          },
          slug: { 
            type: "string", 
            description: "Existing sprint's slug. Required for: get, kpis, update, delete. NOT for create" 
          },
          title: { 
            type: "string", 
            description: "Sprint name. Required for: create" 
          },
          description: { 
            type: "string", 
            description: "Sprint description in markdown (optional)" 
          },
          date_start: { 
            type: "string", 
            description: "Start date YYYY-MM-DD (default: today)" 
          },
          date_finish: { 
            type: "string", 
            description: "End date YYYY-MM-DD (default: today + 7 days)" 
          },
          color: { 
            type: "string", 
            description: "Hex color without # e.g. 'FF5733' (optional)" 
          },
          is_private: { 
            type: "boolean", 
            description: "Sprint visibility (optional)" 
          },
          close_on_finish: { 
            type: "boolean", 
            description: "Auto-close when end date reached (optional)" 
          },
          resource: { 
            type: "string", 
            description: "For 'reports': filter to single chart (burndown, burnup, performance, types, efforts, member_distribution, task_type_distribution)" 
          },
        },
        required: ["action"],
      },
      annotations: { title: "Sprints", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface SprintArgs {
  action: string;
  project_slug?: string;
  company_slug?: string;
  slug?: string;
  title?: string;
  description?: string;
  date_start?: string;
  date_finish?: string;
  color?: string;
  is_private?: boolean;
  close_on_finish?: boolean;
  resource?: string;
}

// ============================================================================
// Action Handlers
// ============================================================================

const sprintHandlers: ActionHandlerMap<SprintArgs> = {
  list: async (client, args) => {
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const sprints = await client.getSprints(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(sprints, null, 2), ctx);
  },

  all: async (client) => {
    const sprints = await client.getAllSprints();
    return success(JSON.stringify(sprints, null, 2));
  },

  get: async (client, args) => {
    if (!args.slug) return required("slug");
    
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const sprint = await client.getSprint(args.slug, resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { 
      company_slug: resolved.company_slug, 
      project_slug: resolved.project_slug,
      sprint_slug: args.slug 
    };
    return success(JSON.stringify(sprint, null, 2), ctx);
  },

  kpis: async (client, args) => {
    if (!args.slug) return required("slug");
    
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const kpis = await client.getSprintKPIs(args.slug, resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { 
      company_slug: resolved.company_slug, 
      project_slug: resolved.project_slug,
      sprint_slug: args.slug 
    };
    return success(JSON.stringify(kpis, null, 2), ctx);
  },

  stats: async (client, args) => {
    if (!args.slug) return required("slug");
    
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const stats = await client.getSprintStats(args.slug, resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { 
      company_slug: resolved.company_slug, 
      project_slug: resolved.project_slug,
      sprint_slug: args.slug 
    };
    return success(JSON.stringify(stats, null, 2), ctx);
  },

  reports: async (client, args) => {
    if (!args.slug) return required("slug");
    
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const reports = await client.getSprintReports(args.slug, resolved.project_slug, resolved.company_slug, {
      resource: args.resource,
    });
    const ctx: ResponseContext = { 
      company_slug: resolved.company_slug, 
      project_slug: resolved.project_slug,
      sprint_slug: args.slug 
    };
    return success(JSON.stringify(reports, null, 2), ctx);
  },

  progress: async (client, args) => {
    if (!args.slug) return required("slug");
    
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const progress = await client.getSprintProgress(args.slug, resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { 
      company_slug: resolved.company_slug, 
      project_slug: resolved.project_slug,
      sprint_slug: args.slug 
    };
    return success(JSON.stringify(progress, null, 2), ctx);
  },

  metrics: async (client, args) => {
    if (!args.slug) return required("slug");
    
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const metrics = await client.getSprintMetrics(args.slug, resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { 
      company_slug: resolved.company_slug, 
      project_slug: resolved.project_slug,
      sprint_slug: args.slug 
    };
    return success(JSON.stringify(metrics, null, 2), ctx);
  },

  create: async (client, args) => {
    if (!args.title) return required("title");
    
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("company_slug and project_slug");
    
    const data: Record<string, unknown> = { title: args.title };
    if (args.description) data.description = args.description;
    if (args.date_start) data.date_start = args.date_start;
    if (args.date_finish) data.date_finish = args.date_finish;
    if (args.color) data.color = normalizeColor(args.color);
    if (args.is_private !== undefined) data.is_private = args.is_private;
    if (args.close_on_finish !== undefined) data.close_on_finish = args.close_on_finish;
    
    const sprint = await client.createSprint(
      resolved.project_slug,
      resolved.company_slug,
      data as Parameters<typeof client.createSprint>[2]
    );
    const ctx: ResponseContext = { 
      company_slug: resolved.company_slug, 
      project_slug: resolved.project_slug 
    };
    return success(JSON.stringify({ created: true, sprint }, null, 2), ctx);
  },

  update: async (client, args) => {
    if (!args.slug) return required("slug");
    
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("company_slug and project_slug");
    
    const data: Record<string, unknown> = {};
    if (args.title) data.title = args.title;
    if (args.description) data.description = args.description;
    if (args.date_start) data.date_start = args.date_start;
    if (args.date_finish) data.date_finish = args.date_finish;
    if (args.color) data.color = normalizeColor(args.color);
    if (args.is_private !== undefined) data.is_private = args.is_private;
    if (args.close_on_finish !== undefined) data.close_on_finish = args.close_on_finish;
    
    await client.updateSprint(
      args.slug,
      resolved.project_slug,
      resolved.company_slug,
      data as Parameters<typeof client.updateSprint>[3]
    );
    const ctx: ResponseContext = { 
      company_slug: resolved.company_slug, 
      project_slug: resolved.project_slug,
      sprint_slug: args.slug 
    };
    return success(JSON.stringify({ updated: true, slug: args.slug }, null, 2), ctx);
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleSprintTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const action = args.action as string;
  return executeAction(sprintHandlers, action, client, args);
}
