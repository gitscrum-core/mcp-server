/**
 * Budget MCP Tool
 * 
 * STATELESS: Returns API data directly. No business logic or formatting.
 * Provides access to project budget tracking, consumption, and risk analysis.
 */
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../client/GitScrumClient.js";
import { 
  executeAction, 
  success, 
  required,
  type ActionHandlerMap,
  type ToolResponse
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerBudgetTools(): Tool[] {
  return [
    {
      name: "budget",
      description: [
        "Project budget tracking. Actions: projects_at_risk, overview, consumption, burn_down, alerts, events.",
        "",
        "Workflow:",
        "- 'projects_at_risk': requires company_slug (shows projects exceeding budget across workspace)",
        "- 'overview': requires project_uuid (budget overview with optional date filters)",
        "- 'consumption': requires project_uuid (current budget consumption)",
        "- 'burn_down': requires project_uuid (budget burn-down chart data)",
        "- 'alerts': requires project_uuid (budget threshold alerts)",
        "- 'events': requires project_uuid (budget event log)",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["projects_at_risk", "overview", "consumption", "burn_down", "alerts", "events"], 
            description: "Which operation to perform" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier. Required for: projects_at_risk" 
          },
          project_uuid: { 
            type: "string", 
            description: "Project UUID. Required for: overview, consumption, burn_down, alerts, events" 
          },
          start_date: { 
            type: "string", 
            description: "Start date filter YYYY-MM-DD (optional for overview/burn_down)" 
          },
          end_date: { 
            type: "string", 
            description: "End date filter YYYY-MM-DD (optional for overview/burn_down)" 
          },
          limit: { 
            type: "number", 
            description: "Max results for events (default 20, max 100)" 
          },
        },
        required: ["action"],
      },
      annotations: { title: "Budget Tracking", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface BudgetArgs {
  action: string;
  company_slug?: string;
  project_uuid?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

// ============================================================================
// Action Handlers
// ============================================================================

const budgetHandlers: ActionHandlerMap<BudgetArgs> = {
  projects_at_risk: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    const data = await client.getBudgetProjectsAtRisk(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  overview: async (client, args) => {
    if (!args.project_uuid) return required("project_uuid");
    const data = await client.getBudgetOverview(args.project_uuid, {
      start_date: args.start_date,
      end_date: args.end_date,
    });
    return success(JSON.stringify(data, null, 2));
  },

  consumption: async (client, args) => {
    if (!args.project_uuid) return required("project_uuid");
    const data = await client.getBudgetConsumption(args.project_uuid);
    return success(JSON.stringify(data, null, 2));
  },

  burn_down: async (client, args) => {
    if (!args.project_uuid) return required("project_uuid");
    const data = await client.getBudgetBurnDown(args.project_uuid, {
      start_date: args.start_date,
      end_date: args.end_date,
    });
    return success(JSON.stringify(data, null, 2));
  },

  alerts: async (client, args) => {
    if (!args.project_uuid) return required("project_uuid");
    const data = await client.getBudgetAlerts(args.project_uuid);
    return success(JSON.stringify(data, null, 2));
  },

  events: async (client, args) => {
    if (!args.project_uuid) return required("project_uuid");
    const data = await client.getBudgetEvents(args.project_uuid, args.limit);
    return success(JSON.stringify(data, null, 2));
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleBudgetTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const action = args.action as string;
  return executeAction(budgetHandlers, action, client, args);
}
