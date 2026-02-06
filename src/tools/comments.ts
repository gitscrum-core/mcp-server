/**
 * Comments MCP Tool (Consolidated)
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
  type ToolResponse
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerCommentTools(): Tool[] {
  return [
    {
      name: "comment",
      description: [
        "Task comments. Actions: list, add, update.",
        "",
        "Workflow:",
        "- 'list'/'add': requires task_uuid (get from 'task' tool) + company_slug + project_slug",
        "- 'update': requires comment_id (get from 'list' response) + text",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: {
            type: "string",
            enum: ["list", "add", "update"],
            description: "Which operation to perform",
          },
          task_uuid: {
            type: "string",
            description: "Task's unique ID. Required for: list, add",
          },
          company_slug: {
            type: "string",
            description: "Workspace identifier. Required for: list, add",
          },
          project_slug: {
            type: "string",
            description: "Project identifier. Required for: list, add",
          },
          text: {
            type: "string",
            description: "Comment text content. This is what you want to write. Required for: add, update",
          },
          comment_id: {
            type: "number",
            description: "Existing comment's ID number. Only for: update",
          },
        },
        required: ["action"],
      },
      annotations: {
        title: "Task Comments",
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

interface CommentArgs {
  action: string;
  task_uuid?: string;
  company_slug?: string;
  project_slug?: string;
  text?: string;
  comment_id?: number;
}

// ============================================================================
// Action Handlers
// ============================================================================

const commentHandlers: ActionHandlerMap<CommentArgs> = {
  list: async (client, args) => {
    if (!args.task_uuid) return required("task_uuid");

    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or project name to search)");

    const comments = await client.getTaskComments(args.task_uuid, resolved.company_slug, resolved.project_slug);
    return success(JSON.stringify(comments, null, 2));
  },

  add: async (client, args) => {
    if (!args.task_uuid || !args.text) return required("task_uuid and text");

    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or project name to search)");

    const comment = await client.addTaskComment(args.task_uuid, args.text, resolved.company_slug, resolved.project_slug);
    return success(JSON.stringify({ added: true, comment }, null, 2));
  },

  update: async (client, args) => {
    if (!args.comment_id || !args.text) return required("comment_id and text");

    await client.updateComment(args.comment_id, args.text);
    return success(JSON.stringify({ updated: true, comment_id: args.comment_id }, null, 2));
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleCommentTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown>
): Promise<ToolResponse> {
  const action = args.action as string;
  return executeAction(commentHandlers, action, client, args);
}
