/**
 * Project/Workspace MCP Tools (Consolidated)
 * 
 * Uses Action Handler pattern for clean, extensible code.
 * STATELESS - each call must provide all required parameters.
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

export function registerProjectTools(): Tool[] {
  return [
    {
      name: "workspace",
      description: [
        "Workspace management. Actions: list, find (by name), get, stats.",
        "",
        "This is the starting point. Use 'list' to get all workspaces and their company_slug.",
        "company_slug is needed by most other tools.",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["list", "find", "get", "stats"], 
            description: "Which operation to perform" 
          },
          name: {
            type: "string",
            description: "Workspace name to search for. Required for: find"
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier. Required for: get, stats" 
          },
        },
        required: ["action"],
      },
      annotations: { title: "Workspaces", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    {
      name: "project",
      description: [
        "Project management. Actions: create, find (by name), list, get, stats, tasks, workflows, types, efforts, labels, members.",
        "",
        "Workflow:",
        "- 'list': requires company_slug (from 'workspace' tool). Returns projects with their project_slug.",
        "- 'find': search by name, returns project_slug + company_slug",
        "- 'workflows'/'types'/'efforts'/'labels': returns IDs used by 'task' tool for create/update",
        "- 'members': returns project assignees (name, username, avatar). Use to know who can be assigned tasks",
        "- 'create': requires company_slug + name",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["create", "find", "list", "get", "stats", "tasks", "workflows", "types", "efforts", "labels", "members"], 
            description: "Which operation to perform" 
          },
          name: {
            type: "string",
            description: "Project name. Required for: create, find"
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier. Required for: create, list, get, stats, tasks, etc. Optional for: find" 
          },
          project_slug: { 
            type: "string", 
            description: "Project identifier. Required for: get, stats, tasks, workflows, types, efforts, labels, members" 
          },
          status: {
            type: "string",
            enum: ["in_progress", "completed", "archived"],
            description: "Filter projects by status. Optional for: list"
          },
          description: {
            type: "string",
            description: "Project description. Optional for: create"
          },
          visibility: {
            type: "string",
            enum: ["public", "private"],
            description: "Project visibility (default: public). Optional for: create"
          },
          client_uuid: {
            type: "string",
            description: "Client UUID to associate project with. Optional for: create"
          },
        },
        required: ["action"],
      },
      annotations: { title: "Projects", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface WorkspaceArgs {
  action: string;
  name?: string;
  company_slug?: string;
}

interface ProjectArgs {
  action: string;
  name?: string;
  company_slug?: string;
  project_slug?: string;
  status?: string;
  description?: string;
  visibility?: 'public' | 'private';
  client_uuid?: string;
}

// ============================================================================
// Workspace Action Handlers
// ============================================================================

const workspaceHandlers: ActionHandlerMap<WorkspaceArgs> = {
  list: async (client) => {
    const response = await client.getWorkspaces();
    return success(JSON.stringify(response, null, 2));
  },

  find: async (client, args) => {
    if (!args.name) return required("name");
    const workspace = await client.findWorkspaceByName(args.name);
    if (!workspace) {
      return success(JSON.stringify({ found: false, query: args.name }, null, 2));
    }
    const ctx: ResponseContext = { company_slug: workspace.slug };
    return success(JSON.stringify({ found: true, workspace }, null, 2), ctx);
  },

  get: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    const ws = await client.getWorkspace(args.company_slug);
    const ctx: ResponseContext = { company_slug: args.company_slug };
    return success(JSON.stringify(ws, null, 2), ctx);
  },

  stats: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    const stats = await client.getWorkspaceStats(args.company_slug);
    const ctx: ResponseContext = { company_slug: args.company_slug };
    return success(JSON.stringify(stats, null, 2), ctx);
  },
};

// ============================================================================
// Project Action Handlers
// ============================================================================

const projectHandlers: ActionHandlerMap<ProjectArgs> = {
  create: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    if (!args.name) return required("name");
    
    // Permission check is handled by the API
    const result = await client.createProject(args.company_slug, {
      name: args.name,
      description: args.description,
      visibility: args.visibility,
      client_uuid: args.client_uuid,
    });
    
    const ctx: ResponseContext = { 
      company_slug: args.company_slug, 
      project_slug: result.project_slug 
    };
    return success(JSON.stringify({ created: true, project: result }, null, 2), ctx);
  },

  find: async (client, args) => {
    if (!args.name) return required("name");
    const project = await client.findProjectByName(args.name, args.company_slug);
    if (!project) {
      return success(JSON.stringify({ found: false, query: args.name }, null, 2));
    }
    const ctx: ResponseContext = { company_slug: project.company_slug, project_slug: project.project_slug };
    return success(JSON.stringify({ found: true, project }, null, 2), ctx);
  },

  list: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    const response = await client.getProjects(args.company_slug, { status: args.status });
    const ctx: ResponseContext = { company_slug: args.company_slug };
    return success(JSON.stringify(response, null, 2), ctx);
  },

  get: async (client, args) => {
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const project = await client.getProject(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(project, null, 2), ctx);
  },

  stats: async (client, args) => {
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const stats = await client.getProjectStats(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(stats, null, 2), ctx);
  },

  tasks: async (client, args) => {
    // Auto-resolve project context
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const tasks = await client.getProjectTasks(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(tasks, null, 2), ctx);
  },

  workflows: async (client, args) => {
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const workflows = await client.getProjectWorkflows(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(workflows, null, 2), ctx);
  },

  types: async (client, args) => {
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const types = await client.getProjectTypes(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(types, null, 2), ctx);
  },

  efforts: async (client, args) => {
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const efforts = await client.getProjectEfforts(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(efforts, null, 2), ctx);
  },

  labels: async (client, args) => {
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const labels = await client.getProjectLabels(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(labels, null, 2), ctx);
  },

  members: async (client, args) => {
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("project_slug (or company_slug + project_slug)");
    
    const members = await client.getProjectMembers(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(members, null, 2), ctx);
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleProjectTool(
  client: GitScrumClient,
  name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const action = args.action as string;

  switch (name) {
    case "workspace":
      return executeAction(workspaceHandlers, action, client, args);

    case "project":
      // Handlers now use auto-resolution for missing company_slug
      return executeAction(projectHandlers, action, client, args);

    default:
      return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
  }
}
