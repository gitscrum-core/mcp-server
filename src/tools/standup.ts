/**
 * Standup/Daily MCP Tool
 * 
 * Uses Action Handler pattern for clean, extensible code.
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

export function registerStandupTools(): Tool[] {
  return [
    {
      name: "standup",
      description: [
        "Standup reports. Actions: summary, completed, blockers, team, stuck, digest, contributors.",
        "",
        "All actions require company_slug (get from 'workspace' tool action 'list').",
        "Optional: project_slug to filter by project, date in YYYY-MM-DD format.",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["summary", "completed", "blockers", "team", "stuck", "digest", "contributors"], 
            description: "What standup info to get" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier (always required)" 
          },
          project_slug: { 
            type: "string", 
            description: "Filter to specific project (optional)" 
          },
          date: { 
            type: "string", 
            description: "Date in YYYY-MM-DD format (default: yesterday)" 
          },
          period: { 
            type: "string", 
            enum: ["week", "month", "quarter", "year"], 
            description: "Time period for 'contributors' action (default: month)" 
          },
        },
        required: ["action", "company_slug"],
      },
      annotations: { title: "Daily Standup", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface StandupArgs {
  action: string;
  company_slug: string;
  project_slug?: string;
  date?: string;
  period?: string;
}

// ============================================================================
// Action Handlers
// ============================================================================

const standupHandlers: ActionHandlerMap<StandupArgs> = {
  summary: async (client, args) => {
    const data = await client.getStandupSummary(args.company_slug, args.project_slug);
    return success(JSON.stringify(data, null, 2));
  },

  completed: async (client, args) => {
    const data = await client.getStandupCompletedYesterday(args.company_slug, args.project_slug, args.date);
    return success(JSON.stringify(data, null, 2));
  },

  blockers: async (client, args) => {
    const data = await client.getStandupBlockers(args.company_slug, args.project_slug);
    return success(JSON.stringify(data, null, 2));
  },

  team: async (client, args) => {
    const data = await client.getStandupTeamStatus(args.company_slug, args.project_slug);
    return success(JSON.stringify(data, null, 2));
  },

  stuck: async (client, args) => {
    const data = await client.getStandupStuckTasks(args.company_slug, args.project_slug);
    return success(JSON.stringify(data, null, 2));
  },

  digest: async (client, args) => {
    const data = await client.getStandupWeeklyDigest(args.company_slug, args.project_slug);
    return success(JSON.stringify(data, null, 2));
  },

  contributors: async (client, args) => {
    const data = await client.getStandupContributors(args.company_slug, args.project_slug, args.period);
    return success(JSON.stringify(data, null, 2));
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleStandupTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown>
): Promise<ToolResponse> {
  if (!args.company_slug) return required("company_slug");
  
  const action = args.action as string;
  return executeAction(standupHandlers, action, client, args);
}
