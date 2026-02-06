/**
 * Task Type MCP Tool (Consolidated)
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
  normalizeColor,
  type ActionHandlerMap,
  type ToolResponse,
  type ResponseContext
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerTaskTypeTools(): Tool[] {
  return [
    {
      name: "task_type",
      description: [
        "Task types (Bug, Feature, etc). Actions: list, create, update, assign.",
        "",
        "Workflow:",
        "- 'list': requires company_slug + project_slug (returns types with their ID)",
        "- 'create': requires title + color + company_slug + project_slug",
        "- 'update': requires type_id (from 'list' response) + company_slug + project_slug",
        "- 'assign': requires type_id (from 'list') + task_uuid (from 'task' tool) + company_slug + project_slug",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["list", "create", "update", "assign"], 
            description: "Operation to perform (REQUIRED)" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace slug (ALWAYS REQUIRED)" 
          },
          project_slug: { 
            type: "string", 
            description: "Project slug (ALWAYS REQUIRED)" 
          },
          type_id: { 
            type: "number", 
            description: "Task type ID (REQUIRED for: update, assign)" 
          },
          task_uuid: { 
            type: "string", 
            description: "Task UUID (REQUIRED for: assign)" 
          },
          title: { 
            type: "string", 
            description: "Type name e.g. 'Bug', 'Feature' (REQUIRED for: create)" 
          },
          color: { 
            type: "string", 
            description: "6-character hex code without # (e.g. 'FF5733') (REQUIRED for: create)" 
          },
        },
        required: ["action", "company_slug", "project_slug"],
      },
      annotations: { title: "Task Types", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface TaskTypeArgs {
  action: string;
  company_slug: string;
  project_slug: string;
  type_id?: number;
  task_uuid?: string;
  title?: string;
  color?: string;
}

// ============================================================================
// Action Handlers
// ============================================================================

const taskTypeHandlers: ActionHandlerMap<TaskTypeArgs> = {
  list: async (client, args) => {
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or project name to search)");
    
    const types = await client.getProjectTypes(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(types, null, 2), ctx);
  },

  create: async (client, args) => {
    if (!args.title || !args.color) return required("title and color");
    
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or project name to search)");
    
    const taskType = await client.createTaskType(resolved.project_slug, resolved.company_slug, { 
      title: args.title, 
      color: normalizeColor(args.color) 
    });
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify({ created: true, task_type: taskType }, null, 2), ctx);
  },

  update: async (client, args) => {
    if (!args.type_id) return required("type_id");
    
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or project name to search)");
    
    const updateData: { title?: string; color?: string } = {};
    if (args.title) updateData.title = args.title;
    if (args.color) updateData.color = normalizeColor(args.color);
    const taskType = await client.updateTaskType(args.type_id, resolved.project_slug, resolved.company_slug, updateData);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify({ updated: true, task_type: taskType }, null, 2), ctx);
  },

  assign: async (client, args) => {
    if (!args.task_uuid || !args.type_id) return required("task_uuid and type_id");
    
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or project name to search)");
    
    const result = await client.assignTypeToTask(args.task_uuid, args.type_id, resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify({ assigned: true, result }, null, 2), ctx);
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleTaskTypeTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown>
): Promise<ToolResponse> {
  // Auto-resolution is now in handlers
  const action = args.action as string;
  return executeAction(taskTypeHandlers, action, client, args);
}


