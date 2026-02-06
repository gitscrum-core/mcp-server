/**
 * Workflow Tools (Kanban Columns) - Consolidated
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
// Constants
// ============================================================================

/**
 * Status mapping for workflows
 * @see BoardColumnCreate.vue for UI values
 */
const STATUS_MAP: Record<string, number> = {
  todo: 0,
  open: 0,
  "to do": 0,
  backlog: 0,
  done: 1,
  complete: 1,
  completed: 1,
  closed: 1,
  "in progress": 2,
  "in-progress": 2,
  inprogress: 2,
  doing: 2,
  active: 2,
};

function normalizeStatus(status: string | number): number {
  if (typeof status === "number") {
    return status >= 0 && status <= 2 ? status : 0;
  }
  return STATUS_MAP[status.toLowerCase().trim()] ?? 0;
}

// ============================================================================
// Tool Registration
// ============================================================================

export function registerWorkflowTools(): Tool[] {
  return [
    {
      name: "workflow",
      description: [
        "Manage Kanban board columns. Actions: create, update.",
        "",
        "Workflow:",
        "- To see existing columns: use 'project' tool with action 'workflows'",
        "- 'create': requires project_slug + title. Optional: color, status (todo/in progress/done)",
        "- 'update': requires workflow_id (from 'project' action 'workflows' response). Optional: title, color, position, status",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: {
            type: "string",
            enum: ["create", "update"],
            description: "Action: create (new column), update (modify existing)",
          },
          workflow_id: {
            type: "number",
            description: "[update] Column ID (from project action 'workflows')",
          },
          project_slug: {
            type: "string",
            description: "Project identifier",
          },
          company_slug: {
            type: "string",
            description: "Workspace identifier (optional if project_slug unique)",
          },
          title: {
            type: "string",
            description: "Column name e.g. 'Backlog', 'In Review', 'Done'",
          },
          color: {
            type: "string",
            description: "Hex code without # e.g. '58A6FF'",
          },
          status: {
            type: "string",
            description: "Column type: 'todo'/'backlog', 'in progress'/'doing', 'done'/'closed'",
          },
          position: {
            type: "number",
            description: "[update] Board position (1 = leftmost)",
          },
        },
        required: ["action"],
      },
      annotations: { title: "Kanban Columns", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface WorkflowArgs {
  action: string;
  workflow_id?: number;
  project_slug?: string;
  company_slug?: string;
  title?: string;
  color?: string;
  status?: string | number;
  position?: number;
}

// ============================================================================
// Action Handlers
// ============================================================================

const workflowHandlers: ActionHandlerMap<WorkflowArgs> = {
  create: async (client, args) => {
    if (!args.title) return required("title");

    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const data: { title: string; color?: string; status?: number } = { title: args.title };
    if (args.color) data.color = normalizeColor(args.color);
    if (args.status !== undefined) data.status = normalizeStatus(args.status);

    const workflow = await client.createWorkflow(resolved.project_slug, resolved.company_slug, data) as { id: number };
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify({ created: true, workflow_id: workflow.id, title: args.title }, null, 2), ctx);
  },

  update: async (client, args) => {
    if (!args.workflow_id) return required("workflow_id");

    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");

    const data: { title?: string; color?: string; status?: number; position?: number } = {};
    if (args.title) data.title = args.title;
    if (args.color) data.color = normalizeColor(args.color);
    if (args.status !== undefined) data.status = normalizeStatus(args.status);
    if (args.position !== undefined) data.position = args.position;

    await client.updateWorkflow(args.workflow_id, resolved.company_slug, resolved.project_slug, data);
    return success(JSON.stringify({ updated: true, workflow_id: args.workflow_id }, null, 2));
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleWorkflowTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const action = args.action as string;
  return executeAction(workflowHandlers, action, client, args);
}
