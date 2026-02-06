/**
 * User Story MCP Tool (Consolidated)
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

export function registerUserStoryTools(): Tool[] {
  return [
    {
      name: "user_story",
      description: [
        "User stories. Actions: list, all, get, create, update.",
        "",
        "Workflow:",
        "- 'list': requires company_slug + project_slug (returns stories with their slug)",
        "- 'all': no params needed (returns all user stories across workspaces)",
        "- 'get': requires slug (from 'list' response) + company_slug + project_slug",
        "- 'create': requires title + company_slug + project_slug",
        "- 'update': requires slug (from 'list' response) + company_slug + project_slug",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["list", "all", "get", "create", "update"], 
            description: "Which operation to perform" 
          },
          project_slug: { 
            type: "string", 
            description: "Project identifier (always required)" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier (always required)" 
          },
          slug: { 
            type: "string", 
            description: "Existing story's unique identifier. Only for: get, update. NOT for create." 
          },
          title: { 
            type: "string", 
            description: "Story title text. Required when creating a new story." 
          },
          additional_information: { 
            type: "string", 
            description: "Story details/context in markdown (optional for create)" 
          },
          acceptance_criteria: { 
            type: "string", 
            description: "Definition of done - what must be true for story to be complete (optional)" 
          },
          epic_uuid: { 
            type: "string", 
            description: "Epic UUID to associate story with (from 'epic' tool 'list'). Optional for create/update" 
          },
          user_story_priority_id: { 
            type: "number", 
            description: "Priority ID (from 'project' action 'efforts'). Optional - auto-defaults on create" 
          },
        },
        required: ["action", "company_slug", "project_slug"],
      },
      annotations: { title: "User Stories", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface UserStoryArgs {
  action: string;
  company_slug: string;
  project_slug?: string;
  slug?: string;
  title?: string;
  additional_information?: string;
  acceptance_criteria?: string;
  epic_uuid?: string;
  user_story_priority_id?: number;
}

// ============================================================================
// Action Handlers
// ============================================================================

const userStoryHandlers: ActionHandlerMap<UserStoryArgs> = {
  list: async (client, args) => {
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const stories = await client.getUserStories(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(stories, null, 2), ctx);
  },

  all: async (client) => {
    const stories = await client.getAllWorkspacesUserStories();
    return success(JSON.stringify(stories, null, 2));
  },

  get: async (client, args) => {
    if (!args.slug) return required("slug");
    
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const story = await client.getUserStory(args.slug, resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { 
      company_slug: resolved.company_slug, 
      project_slug: resolved.project_slug,
      user_story_slug: args.slug 
    };
    return success(JSON.stringify(story, null, 2), ctx);
  },

  create: async (client, args) => {
    if (!args.title) return required("title");
    
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const story = await client.createUserStory({
      title: args.title,
      project_slug: resolved.project_slug,
      company_slug: resolved.company_slug,
      additional_information: args.additional_information,
      acceptance_criteria: args.acceptance_criteria,
      epic_uuid: args.epic_uuid,
      user_story_priority_id: args.user_story_priority_id,
    });
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify({ created: true, story }, null, 2), ctx);
  },

  update: async (client, args) => {
    if (!args.slug) return required("slug");
    
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const data: Record<string, unknown> = {
      project_slug: resolved.project_slug,
      company_slug: resolved.company_slug,
    };
    if (args.title !== undefined) data.title = args.title;
    if (args.additional_information !== undefined) data.additional_information = args.additional_information;
    if (args.acceptance_criteria !== undefined) data.acceptance_criteria = args.acceptance_criteria;
    if (args.epic_uuid !== undefined) data.epic_uuid = args.epic_uuid;
    if (args.user_story_priority_id !== undefined) data.user_story_priority_id = args.user_story_priority_id;
    
    const result = await client.updateUserStory(args.slug, data as any);
    const ctx: ResponseContext = { 
      company_slug: resolved.company_slug, 
      project_slug: resolved.project_slug,
      user_story_slug: args.slug 
    };
    return success(JSON.stringify({ updated: true, story: result }, null, 2), ctx);
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleUserStoryTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  // Auto-resolution is now in handlers
  const action = args.action as string;
  return executeAction(userStoryHandlers, action, client, args);
}


