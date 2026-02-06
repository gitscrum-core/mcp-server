/**
 * Time Tracking MCP Tool (Consolidated)
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

export function registerTimeTrackingTools(): Tool[] {
  return [
    {
      name: "time",
      description: [
        "Time tracking. Actions: active, start, stop, logs, analytics, team, reports, productivity, timeline.",
        "",
        "Workflow:",
        "1. Use 'active' first to check if there is already a running timer",
        "2. To start: get the task_uuid from 'task' tool (action: my, today, or filter), then call 'start' with task_uuid",
        "3. To stop: get time_tracking_id from 'active' response, then call 'stop'",
        "4. 'logs' shows time entries for a project",
        "5. 'analytics'/'team'/'reports'/'productivity'/'timeline': requires company_slug. Optional: project_slug, period",
        "",
        "'active' and 'logs' require company_slug (auto-resolved if omitted).",
        "'start' requires task_uuid (ask user which task if not specified).",
        "'stop' requires time_tracking_id (get from 'active' response).",
        "Period options: today, yesterday, last-7-days, last-14-days, last-15-days, this-month, last-month, last-30-days",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["active", "start", "stop", "logs", "analytics", "team", "reports", "productivity", "timeline"], 
            description: "Which operation to perform" 
          },
          task_uuid: { 
            type: "string", 
            description: "Task's unique ID to track time on. Required for: start" 
          },
          time_tracking_id: { 
            type: "string", 
            description: "Active timer's ID (get from 'active' action). Required for: stop" 
          },
          project_slug: { 
            type: "string", 
            description: "Project identifier. Required for: logs" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier. Required for: active, logs (auto-resolved if omitted)" 
          },
          description: { 
            type: "string", 
            description: "What you're working on (optional note for start)" 
          },
          period: { 
            type: "string", 
            description: "Time period for analytics: today, yesterday, last-7-days, last-14-days, this-month, last-month, last-30-days" 
          },
          report_type: { 
            type: "string", 
            description: "For 'reports' action: report type (default: summary)" 
          },
          hourly_rate: { 
            type: "number", 
            description: "For 'reports' action: hourly rate for cost calculations" 
          },
        },
        required: ["action"],
      },
      annotations: { title: "Time Tracking", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface TimeArgs {
  action: string;
  task_uuid?: string;
  time_tracking_id?: string;
  project_slug?: string;
  company_slug?: string;
  description?: string;
  period?: string;
  report_type?: string;
  hourly_rate?: number;
}

// ============================================================================
// Action Handlers
// ============================================================================

const timeHandlers: ActionHandlerMap<TimeArgs> = {
  active: async (client, args) => {
    // Resolve company_slug: use provided, or fetch user's first workspace
    let companySlug = args.company_slug;
    if (!companySlug) {
      const workspaces = await client.getWorkspaces({ perPage: 1 });
      const list = workspaces.data as Array<{ slug: string }>;
      if (list && list.length > 0) {
        companySlug = list[0].slug;
      }
    }
    if (!companySlug) return required("company_slug");

    const timer = await client.getActiveTimer(companySlug);
    const ctx: ResponseContext = { company_slug: companySlug };
    return success(JSON.stringify(timer || { active: false }, null, 2), ctx);
  },

  start: async (client, args) => {
    if (!args.task_uuid) return required("task_uuid (use 'task' tool with action 'my' or 'today' to find the task UUID)");
    const result = await client.startTimer(args.task_uuid, args.description);
    return success(JSON.stringify({ started: true, timer: result }, null, 2));
  },

  stop: async (client, args) => {
    if (!args.time_tracking_id) return required("time_tracking_id (use 'time' tool with action 'active' to get the ID)");
    const timer = await client.stopTimer(args.time_tracking_id);
    return success(JSON.stringify({ stopped: true, timer }, null, 2));
  },

  logs: async (client, args) => {
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or project name to search)");
    
    const logs = await client.getTimeLogs(resolved.project_slug, resolved.company_slug);
    return success(JSON.stringify(logs, null, 2));
  },

  analytics: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    const data = await client.getTimeTrackingAnalytics(args.company_slug, {
      project_slug: args.project_slug,
      period: args.period,
    });
    const ctx: ResponseContext = { company_slug: args.company_slug };
    return success(JSON.stringify(data, null, 2), ctx);
  },

  team: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    const data = await client.getTimeTrackingTeam(args.company_slug, {
      project_slug: args.project_slug,
      period: args.period,
    });
    const ctx: ResponseContext = { company_slug: args.company_slug };
    return success(JSON.stringify(data, null, 2), ctx);
  },

  reports: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    const data = await client.getTimeTrackingReports(args.company_slug, {
      project_slug: args.project_slug,
      period: args.period,
      report_type: args.report_type,
      hourly_rate: args.hourly_rate,
    });
    const ctx: ResponseContext = { company_slug: args.company_slug };
    return success(JSON.stringify(data, null, 2), ctx);
  },

  productivity: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    const data = await client.getTimeTrackingProductivity(args.company_slug, {
      project_slug: args.project_slug,
      period: args.period,
    });
    const ctx: ResponseContext = { company_slug: args.company_slug };
    return success(JSON.stringify(data, null, 2), ctx);
  },

  timeline: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    const data = await client.getTimeTrackingTimeline(args.company_slug, {
      project_slug: args.project_slug,
      period: args.period,
    });
    const ctx: ResponseContext = { company_slug: args.company_slug };
    return success(JSON.stringify(data, null, 2), ctx);
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleTimeTrackingTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const action = args.action as string;
  return executeAction(timeHandlers, action, client, args);
}
