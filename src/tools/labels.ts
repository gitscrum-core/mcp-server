/**
 * Label MCP Tool (Consolidated)
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
  type ToolResponse
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerLabelTools(): Tool[] {
  return [
    {
      name: "label",
      description: [
        "Labels. Actions: list, create, update, attach, detach, toggle.",
        "",
        "Workflow:",
        "- 'list': requires company_slug (returns all workspace labels with their slug/ID)",
        "- 'create': requires company_slug + title + color",
        "- 'toggle'/'attach'/'detach': requires label_slug (from 'list') + task_uuid (from 'task' tool) + project_slug",
        "- 'update': requires label_slug (from 'list') + company_slug",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["list", "create", "update", "attach", "detach", "toggle"], 
            description: "Which operation to perform" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier (always required)" 
          },
          project_slug: { 
            type: "string", 
            description: "Project identifier. Required for: attach, detach, toggle" 
          },
          label_slug: { 
            type: "string", 
            description: "Existing label's identifier. Required for: update, attach, detach, toggle" 
          },
          task_uuid: { 
            type: "string", 
            description: "Task's unique ID. Required for: toggle" 
          },
          title: { 
            type: "string", 
            description: "Label name text. Required when creating a new label." 
          },
          color: { 
            type: "string", 
            description: "Hex color code without # e.g. 'FF5733'. Required for: create" 
          },
        },
        required: ["action", "company_slug"],
      },
      annotations: { title: "Labels", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface LabelArgs {
  action: string;
  company_slug: string;
  project_slug?: string;
  label_slug?: string;
  task_uuid?: string;
  title?: string;
  color?: string;
}

// ============================================================================
// Action Handlers
// ============================================================================

const labelHandlers: ActionHandlerMap<LabelArgs> = {
  list: async (client, args) => {
    let labels;
    if (args.project_slug) {
      labels = await client.getProjectLabels(args.project_slug, args.company_slug);
    } else {
      labels = await client.getWorkspaceLabels(args.company_slug);
    }
    return success(JSON.stringify(labels, null, 2));
  },

  create: async (client, args) => {
    if (!args.title || !args.color) return required("title and color");
    const label = await client.createLabel(args.company_slug, { title: args.title, color: normalizeColor(args.color) });
    return success(JSON.stringify({ created: true, label }, null, 2));
  },

  update: async (client, args) => {
    if (!args.label_slug) return required("label_slug");
    const updateData: { title?: string; color?: string } = {};
    if (args.title) updateData.title = args.title;
    if (args.color) updateData.color = normalizeColor(args.color);
    await client.updateLabel(args.label_slug, args.company_slug, updateData);
    return success(JSON.stringify({ updated: true, label_slug: args.label_slug }, null, 2));
  },

  attach: async (client, args) => {
    if (!args.label_slug) return required("label_slug");
    
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or project name to search)");
    
    await client.attachLabelToProject(args.label_slug, resolved.project_slug, resolved.company_slug);
    return success(JSON.stringify({ attached: true, label_slug: args.label_slug }, null, 2));
  },

  detach: async (client, args) => {
    if (!args.label_slug) return required("label_slug");
    
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or project name to search)");
    
    await client.detachLabelFromProject(args.label_slug, resolved.project_slug, resolved.company_slug);
    return success(JSON.stringify({ detached: true, label_slug: args.label_slug }, null, 2));
  },

  toggle: async (client, args) => {
    if (!args.task_uuid || !args.label_slug) {
      return required("task_uuid and label_slug");
    }
    
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or project name to search)");
    
    await client.toggleLabelOnTask(args.task_uuid, args.label_slug, resolved.project_slug, resolved.company_slug);
    return success(JSON.stringify({ toggled: true, label_slug: args.label_slug, task_uuid: args.task_uuid }, null, 2));
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleLabelTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown>
): Promise<ToolResponse> {
  if (!args.company_slug) return required("company_slug");
  
  const action = args.action as string;
  return executeAction(labelHandlers, action, client, args);
}


