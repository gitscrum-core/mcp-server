/**
 * Analytics/Dashboard MCP Tool
 * 
 * STATELESS: Returns API data directly. No business logic or formatting.
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

export function registerAnalyticsTools(): Tool[] {
  return [
    {
      name: "analytics",
      description: [
        "Analytics. Reports: pulse (health), risks, flow (WIP), age, activity, overview, health, blockers, command_center, time_entries.",
        "",
        "All reports require company_slug (get from 'workspace' tool action 'list').",
        "overview/health/blockers/command_center/time_entries are Manager Dashboard reports.",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          report: { 
            type: "string", 
            enum: ["pulse", "risks", "flow", "age", "activity", "overview", "health", "blockers", "command_center", "time_entries"], 
            description: "Which analytics report to get (REQUIRED)" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace slug (ALWAYS REQUIRED)" 
          },
          view: { 
            type: "string", 
            enum: ["all", "active", "overdue"], 
            description: "For 'pulse' report: filter view (default: all)" 
          },
          period: { 
            type: "string", 
            enum: ["today", "this-week", "this-month", "last-30-days"], 
            description: "For 'pulse' report: time period (default: this-week)" 
          },
          filter: { 
            type: "string", 
            enum: ["all", "blocked", "unassigned", "stale", "aging"], 
            description: "For 'risks' report: filter by risk type (default: all)" 
          },
          severity: { 
            type: "string", 
            enum: ["all", "critical", "warning", "info"], 
            description: "For 'risks' report: filter by severity (default: all)" 
          },
          days: { 
            type: "number", 
            description: "For 'flow' report: number of days (default: 30, max: 90)" 
          },
          time_filter: { 
            type: "string", 
            enum: ["today", "this_week", "billable", "non_billable"], 
            description: "For 'time_entries' report: filter type (default: today)" 
          },
        },
        required: ["report", "company_slug"],
      },
      annotations: { title: "Analytics & Reports", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface AnalyticsArgs {
  report: string;
  company_slug: string;
  view?: string;
  period?: string;
  filter?: string;
  severity?: string;
  days?: number;
  time_filter?: string;
}

// ============================================================================
// Action Handlers - STATELESS: Just pass data through
// ============================================================================

const analyticsHandlers: ActionHandlerMap<AnalyticsArgs> = {
  pulse: async (client, args) => {
    const data = await client.getManagerPulse(args.company_slug, args.view, args.period);
    return success(JSON.stringify(data, null, 2));
  },

  risks: async (client, args) => {
    const data = await client.getManagerRisks(args.company_slug, args.filter, args.severity);
    return success(JSON.stringify(data, null, 2));
  },

  flow: async (client, args) => {
    const data = await client.getReportsCumulativeFlow(args.company_slug, args.days);
    return success(JSON.stringify(data, null, 2));
  },

  age: async (client, args) => {
    const data = await client.getReportsProjectAge(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  activity: async (client, args) => {
    const data = await client.getReportsWeeklyActivity(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  overview: async (client, args) => {
    const data = await client.getManagerOverview(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  health: async (client, args) => {
    const data = await client.getManagerHealth(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  blockers: async (client, args) => {
    const data = await client.getManagerBlockers(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  command_center: async (client, args) => {
    const data = await client.getManagerCommandCenter(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  time_entries: async (client, args) => {
    const data = await client.getManagerTimeEntries(args.company_slug, args.time_filter);
    return success(JSON.stringify(data, null, 2));
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleAnalyticsTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown>
): Promise<ToolResponse> {
  if (!args.company_slug) return required("company_slug");
  
  const report = args.report as string;
  return executeAction(analyticsHandlers, report, client, args);
}
