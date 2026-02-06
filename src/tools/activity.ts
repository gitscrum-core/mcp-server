/**
 * Activity Feed MCP Tool
 * 
 * STATELESS: Returns API data directly. No business logic or formatting.
 * Provides access to activity feeds, notifications, and activity history.
 */
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../client/GitScrumClient.js";
import { 
  executeAction, 
  success, 
  required,
  type ActionHandlerMap,
  type ToolResponse,
  type ResponseContext
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerActivityTools(): Tool[] {
  return [
    {
      name: "activity",
      description: [
        "Activity feed & history. Actions: feed, user_feed, notifications, activities, task_workflow.",
        "",
        "Workflow:",
        "- 'feed': no params needed (current user's activity feed)",
        "- 'user_feed': requires username (activity feed for specific user)",
        "- 'notifications': no params needed (notification feed)",
        "- 'activities': requires from_context (company, project, sprint). Uses company_slug/project_slug/sprint_slug",
        "- 'task_workflow': requires task_uuid (workflow/status change history for a task)",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["feed", "user_feed", "notifications", "activities", "task_workflow"], 
            description: "Which operation to perform" 
          },
          username: { 
            type: "string", 
            description: "Username for user_feed action" 
          },
          from_context: { 
            type: "string", 
            enum: ["company", "project", "sprint", "sprints", "user_stories"], 
            description: "Context filter for activities action" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier (for activities)" 
          },
          project_slug: { 
            type: "string", 
            description: "Project identifier (for activities)" 
          },
          sprint_slug: { 
            type: "string", 
            description: "Sprint slug (for activities with sprint context)" 
          },
          task_uuid: { 
            type: "string", 
            description: "Task UUID for task_workflow action" 
          },
          uuid: { 
            type: "string", 
            description: "Entity UUID for activities by specific entity" 
          },
        },
        required: ["action"],
      },
      annotations: { title: "Activity Feed", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface ActivityArgs {
  action: string;
  username?: string;
  from_context?: string;
  company_slug?: string;
  project_slug?: string;
  sprint_slug?: string;
  task_uuid?: string;
  uuid?: string;
}

// ============================================================================
// Action Handlers
// ============================================================================

const activityHandlers: ActionHandlerMap<ActivityArgs> = {
  feed: async (client) => {
    const data = await client.getActivityFeed();
    return success(JSON.stringify(data, null, 2));
  },

  user_feed: async (client, args) => {
    if (!args.username) return required("username");
    const data = await client.getActivityFeedByUser(args.username);
    return success(JSON.stringify(data, null, 2));
  },

  notifications: async (client) => {
    const data = await client.getNotificationFeed();
    return success(JSON.stringify(data, null, 2));
  },

  activities: async (client, args) => {
    const data = await client.getActivities({
      from_context: args.from_context,
      company_slug: args.company_slug,
      project_slug: args.project_slug,
      sprint_slug: args.sprint_slug,
      uuid: args.uuid,
    });
    const ctx: ResponseContext = { company_slug: args.company_slug, project_slug: args.project_slug };
    return success(JSON.stringify(data, null, 2), ctx);
  },

  task_workflow: async (client, args) => {
    if (!args.task_uuid) return required("task_uuid");
    const data = await client.getTaskWorkflowHistory(args.task_uuid);
    return success(JSON.stringify(data, null, 2));
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleActivityTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const action = args.action as string;
  return executeAction(activityHandlers, action, client, args);
}
