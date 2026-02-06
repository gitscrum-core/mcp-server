/**
 * Task Management MCP Tool (Consolidated)
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
  error,
  resolveProjectContext,
  type ActionHandlerMap,
  type ToolResponse,
  type ResponseContext
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerTaskTools(): Tool[] {
  return [
    {
      name: "task",
      description: [
        "Task management. Actions: my, today, notifications, get, create, update, complete, subtasks, filter, by_code, duplicate, move.",
        "",
        "Workflow:",
        "- 'my' and 'today': no extra params needed, returns user's tasks",
        "- 'create': requires company_slug + project_slug + title. ALL optional fields (sprint_slug, user_story_slug, column, type_id, effort_id, usernames, etc.) can be set in ONE call",
        "- 'update': requires uuid + company_slug + project_slug. Accepts same optional fields as create",
        "- 'get'/'complete'/'subtasks': requires uuid (task UUID from any task listing)",
        "- 'filter': requires company_slug + project_slug, supports many filter params",
        "- 'by_code': requires task_code (e.g. 'PROJ-123') + company_slug + project_slug",
        "- 'duplicate': requires uuid + company_slug + project_slug",
        "- 'move': requires uuid + company_slug + project_slug + new_project_slug + new_workflow_id",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["my", "today", "notifications", "get", "create", "update", "complete", "subtasks", "filter", "by_code", "duplicate", "move"], 
            description: "Which operation to perform" 
          },
          uuid: { 
            type: "string", 
            description: "Task UUID. For: get, update, complete, subtasks" 
          },
          task_uuid: { 
            type: "string", 
            description: "Alias for uuid (from context)" 
          },
          per_page: { 
            type: "number", 
            description: "Number of results (1-100, default 50)" 
          },
          title: { 
            type: "string", 
            description: "Task name/title text. Required when creating a new task." 
          },
          project_slug: { 
            type: "string", 
            description: "Project identifier. Required for: create, update, filter" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier. Required for: create, update, filter" 
          },
          description: { type: "string", description: "Task description in markdown (optional)" },
          due_date: { type: "string", description: "Deadline in YYYY-MM-DD format, e.g. '2025-12-31'" },
          start_date: { type: "string", description: "Start date in YYYY-MM-DD format" },
          workflow_id: { type: "number", description: "Kanban column ID. Use this OR column name" },
          column: { type: "string", description: "Kanban column name e.g. 'Done', 'In Progress'. Easier than workflow_id - MCP resolves the ID" },
          effort_id: { type: "number", description: "Priority level ID (get from project action=efforts)" },
          type_id: { type: "number", description: "Task type ID (get from project action=types)" },
          usernames: { type: "array", items: { type: "string" }, description: "Array of usernames to assign" },
          label_ids: { type: "array", items: { type: "number" }, description: "Array of label IDs to attach" },
          sprint_slug: { type: "string", description: "Sprint identifier to add task to" },
          user_story_slug: { type: "string", description: "User story identifier to link task to" },
          estimated_minutes: { type: "number", description: "Time estimate in minutes (e.g. 60 for 1 hour)" },
          parent_id: { type: "string", description: "Parent task UUID to create as subtask" },
          is_bug: { type: "boolean", description: "Mark task as bug (for create/update)" },
          is_blocker: { type: "boolean", description: "Mark task as blocker (for create/update/filter)" },
          is_archived: { type: "boolean", description: "Archive task (for update/filter)" },
          // Filter action parameters
          workflow: { type: "string", description: "Filter: Kanban column title" },
          labels: { type: "string", description: "Filter: Comma-separated label titles" },
          type: { type: "string", description: "Filter: Task type title" },
          effort: { type: "string", description: "Filter: Priority/effort title" },
          sprint: { type: "string", description: "Filter: Sprint slug" },
          user_story: { type: "string", description: "Filter: User story slug" },
          status: { type: "string", enum: ["todo", "in-progress", "done"], description: "Filter: Status" },
          users: { type: "string", description: "Filter: Comma-separated usernames" },
          unassigned: { type: "boolean", description: "Filter: Only unassigned tasks" },
          created_at: { type: "string", description: "Filter: Created date range YYYY-MM-DD=YYYY-MM-DD" },
          closed_at: { type: "string", description: "Filter: Closed date range YYYY-MM-DD=YYYY-MM-DD" },
          task_code: { type: "string", description: "Task code for by_code action (e.g. 'PROJ-123')" },
          new_project_slug: { type: "string", description: "Target project for move action" },
          new_workflow_id: { type: "number", description: "Target workflow/column ID for move action" },
        },
        required: ["action"],
      },
      annotations: { title: "Tasks", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface TaskArgs {
  action: string;
  uuid?: string;
  task_uuid?: string; // Alias for uuid (from context)
  per_page?: number;
  title?: string;
  project_slug?: string;
  company_slug?: string;
  description?: string;
  due_date?: string;
  start_date?: string;
  workflow_id?: number;
  column?: string; // Column name - resolved to workflow_id
  effort_id?: number;
  type_id?: number;
  usernames?: string[];
  label_ids?: number[];
  sprint_slug?: string;
  user_story_slug?: string;
  estimated_minutes?: number;
  parent_id?: string;
  is_bug?: boolean;
  is_blocker?: boolean;
  is_archived?: boolean;
}

// Extended args for filter action
interface TaskFilterArgs extends TaskArgs {
  workflow?: string;
  labels?: string;
  type?: string;
  effort?: string;
  sprint?: string;
  user_story?: string;
  status?: string;
  users?: string;
  is_blocker?: boolean;
  is_bug?: boolean;
  unassigned?: boolean;
  is_archived?: boolean;
  created_at?: string;
  closed_at?: string;
  task_code?: string;
  new_project_slug?: string;
  new_workflow_id?: number;
}

// ============================================================================
// Action Handlers
// ============================================================================

const taskHandlers: ActionHandlerMap<TaskArgs> = {
  my: async (client, args) => {
    const tasks = await client.getMyTasks(args.per_page || 50);
    return success(JSON.stringify(tasks, null, 2));
  },

  today: async (client, args) => {
    const tasks = await client.getTodayTasks(args.per_page || 50);
    return success(JSON.stringify(tasks, null, 2));
  },

  notifications: async (client) => {
    const [notifications, count] = await Promise.all([
      client.getNotifications(),
      client.getNotificationCount()
    ]);
    return success(JSON.stringify({ notifications, unread_count: count }, null, 2));
  },

  get: async (client, args) => {
    // Accept both uuid and task_uuid (from context)
    const uuid = args.uuid || args.task_uuid;
    if (!uuid) return required("uuid");
    const task = await client.getTask(uuid);
    const taskData = task as Record<string, unknown>;
    const projectSlug = (taskData?.project as Record<string, unknown>)?.slug as string;
    const companySlug = (taskData?.company as Record<string, unknown>)?.slug as string;
    const ctx: ResponseContext = { 
      company_slug: companySlug, 
      project_slug: projectSlug,
      task_uuid: uuid 
    };
    return success(JSON.stringify(task, null, 2), ctx);
  },

  create: async (client, args) => {
    if (!args.title) return required("title");
    
    // Auto-resolve project context if company_slug is missing
    let projectSlug = args.project_slug;
    let companySlug = args.company_slug;
    
    if (!companySlug && projectSlug) {
      // Try to resolve company_slug from project_slug
      const resolved = await resolveProjectContext(client, { project_slug: projectSlug });
      if (resolved) {
        companySlug = resolved.company_slug;
        projectSlug = resolved.project_slug;
      }
    }
    
    // If still missing required context, return error
    if (!projectSlug || !companySlug) {
      return error(`company_slug and project_slug required to create task`);
    }
    
    // Resolve column name to workflow_id if provided
    let workflowId = args.workflow_id;
    if (!workflowId && args.column) {
      const workflows = await client.getProjectWorkflows(projectSlug, companySlug);
      const workflow = (workflows as Array<{ id: number; title: string }>).find(
        w => w.title.toLowerCase() === args.column!.toLowerCase()
      );
      if (workflow) {
        workflowId = workflow.id;
      } else {
        return error(JSON.stringify({ error: "column_not_found", column: args.column, available_columns: workflows }, null, 2));
      }
    }
    
    const task = await client.createTask({
      title: args.title,
      project_slug: projectSlug,
      company_slug: companySlug,
      description: args.description,
      workflow_id: workflowId,
      effort_id: args.effort_id,
      type_id: args.type_id,
      usernames: args.usernames,
      label_ids: args.label_ids,
      due_date: args.due_date,
      start_date: args.start_date,
      sprint_slug: args.sprint_slug,
      user_story_slug: args.user_story_slug,
      estimated_minutes: args.estimated_minutes,
      parent_id: args.parent_id,
      is_bug: args.is_bug,
      is_blocker: args.is_blocker,
    });
    
    // Context-rich response: LLM will remember this workspace/project for follow-up
    const taskData = task as Record<string, unknown>;
    const ctx: ResponseContext = { 
      company_slug: companySlug, 
      project_slug: projectSlug,
      sprint_slug: args.sprint_slug,
      task_uuid: taskData?.uuid as string
    };
    
    return success(JSON.stringify({ created: true, task: taskData }, null, 2), ctx);
  },

  update: async (client, args) => {
    // Accept both uuid and task_uuid (from context)
    const uuid = args.uuid || args.task_uuid;
    if (!uuid) return required("uuid");
    
    // Auto-resolve project context if company_slug is missing
    let projectSlug = args.project_slug;
    let companySlug = args.company_slug;
    
    if (!companySlug && projectSlug) {
      const resolved = await resolveProjectContext(client, { project_slug: projectSlug });
      if (resolved) {
        companySlug = resolved.company_slug;
        projectSlug = resolved.project_slug;
      }
    }
    
    // If still missing required context, ask user
    if (!projectSlug || !companySlug) {
      return error("To update task: need company_slug and project_slug");
    }
    
    const updateData: Record<string, unknown> = {
      company_slug: companySlug,
      project_slug: projectSlug,
    };
    
    // Direct fields
    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.due_date !== undefined) updateData.due_date = args.due_date;
    if (args.start_date !== undefined) updateData.start_date = args.start_date;
    if (args.estimated_minutes !== undefined) updateData.estimated_minutes = args.estimated_minutes;
    if (args.is_blocker !== undefined) updateData.is_blocker = args.is_blocker;
    if (args.is_bug !== undefined) updateData.is_bug = args.is_bug;
    if (args.is_archived !== undefined) updateData.is_archived = args.is_archived;
    if (args.label_ids !== undefined) updateData.label_ids = args.label_ids;

    // Resolve column name → workflow_id
    if (args.column) {
      const workflows = await client.getProjectWorkflows(projectSlug, companySlug);
      const workflow = (workflows as Array<{ id: number; title: string }>).find(
        w => w.title.toLowerCase() === args.column!.toLowerCase()
      );
      if (workflow) {
        updateData.workflow_id = workflow.id;
      } else {
        return error(JSON.stringify({ error: "column_not_found", column: args.column, available_columns: workflows }, null, 2));
      }
    } else if (args.workflow_id !== undefined) {
      updateData.workflow_id = args.workflow_id;
    }

    // Map effort_id → config_issue_effort_id (API update expects DB column name)
    if (args.effort_id !== undefined) updateData.config_issue_effort_id = args.effort_id;
    
    // Map type_id → config_issue_type_id (API update expects DB column name)
    if (args.type_id !== undefined) updateData.config_issue_type_id = args.type_id;
    
    // Resolve sprint_slug → sprint_id
    if (args.sprint_slug) {
      const sprints = await client.getSprints(projectSlug, companySlug);
      const matched = (sprints.data as Array<{ id: number; slug: string }>).find(
        s => s.slug === args.sprint_slug
      );
      if (matched) {
        updateData.sprint_id = matched.id;
      } else {
        return error(JSON.stringify({ error: "sprint_not_found", sprint_slug: args.sprint_slug }, null, 2));
      }
    }
    
    // Resolve user_story_slug → user_story_id
    if (args.user_story_slug) {
      const stories = await client.getUserStories(projectSlug, companySlug);
      const matched = (stories.data as Array<{ id: number; slug: string }>).find(
        s => s.slug === args.user_story_slug
      );
      if (matched) {
        updateData.user_story_id = matched.id;
      } else {
        return error(JSON.stringify({ error: "user_story_not_found", user_story_slug: args.user_story_slug }, null, 2));
      }
    }
    
    // Map usernames → members (API controller resolves usernames→IDs)
    if (args.usernames) updateData.members = args.usernames;

    await client.updateTask(uuid, updateData);
    const ctx: ResponseContext = { 
      company_slug: companySlug, 
      project_slug: projectSlug,
      task_uuid: uuid 
    };
    return success(JSON.stringify({ updated: true, uuid }, null, 2), ctx);
  },

  complete: async (client, args) => {
    // Accept both uuid and task_uuid (from context)
    const uuid = args.uuid || args.task_uuid;
    if (!uuid) return required("uuid");
    await client.completeTask(uuid);
    return success(JSON.stringify({ completed: true, uuid }, null, 2));
  },

  subtasks: async (client, args) => {
    // Accept both uuid and task_uuid (from context)
    const uuid = args.uuid || args.task_uuid;
    if (!uuid) return required("uuid");
    const subtasks = await client.getSubTasks(uuid);
    const ctx: ResponseContext = { task_uuid: uuid };
    return success(JSON.stringify(subtasks, null, 2), ctx);
  },

  filter: async (client, args) => {
    // Auto-resolve project context if company_slug is missing
    let projectSlug = args.project_slug;
    let companySlug = args.company_slug;
    
    if (!companySlug && projectSlug) {
      const resolved = await resolveProjectContext(client, { project_slug: projectSlug });
      if (resolved) {
        companySlug = resolved.company_slug;
        projectSlug = resolved.project_slug;
      }
    }
    
    // If still missing required context, ask user
    if (!projectSlug || !companySlug) {
      return error("To filter tasks: which workspace and project? Ask user to specify.");
    }
    
    // Build filters object with extended args type
    const ext = args as TaskFilterArgs;
    const filters: Record<string, unknown> = {};
    
    // Text search
    if (ext.title) filters.title = ext.title;
    if (ext.description) filters.description = ext.description;
    
    // ================================================================
    // Resolve titles/slugs → numeric IDs (API requires IDs)
    // ================================================================
    
    if (ext.workflow) {
      const workflows = await client.getProjectWorkflows(projectSlug, companySlug);
      const matched = (workflows as Array<{ id: number; title: string }>).find(
        w => w.title.toLowerCase() === ext.workflow!.toLowerCase()
      );
      if (matched) {
        filters.workflow = String(matched.id);
      } else {
        return error(JSON.stringify({ error: "column_not_found", column: ext.workflow, available: workflows }, null, 2));
      }
    }
    
    if (ext.labels) {
      const projectLabels = await client.getProjectLabels(projectSlug, companySlug);
      const labelNames = ext.labels.split(",").map(l => l.trim().toLowerCase());
      const ids = (projectLabels as Array<{ id: number; title: string }>)
        .filter(l => labelNames.includes(l.title.toLowerCase()))
        .map(l => l.id);
      if (ids.length > 0) filters.labels = ids.join(",");
    }
    
    if (ext.type) {
      const types = await client.getProjectTypes(projectSlug, companySlug);
      const matched = (types as Array<{ id: number; title: string }>).find(
        t => t.title.toLowerCase() === ext.type!.toLowerCase()
      );
      if (matched) filters.type = String(matched.id);
    }
    
    if (ext.effort) {
      const efforts = await client.getProjectEfforts(projectSlug, companySlug);
      const matched = (efforts as Array<{ id: number; title: string }>).find(
        e => e.title.toLowerCase() === ext.effort!.toLowerCase()
      );
      if (matched) filters.effort = String(matched.id);
    }
    
    if (ext.sprint) {
      const sprints = await client.getSprints(projectSlug, companySlug);
      const matched = (sprints.data as Array<{ id: number; slug: string; title: string }>).find(
        s => s.slug === ext.sprint || s.title.toLowerCase() === ext.sprint!.toLowerCase()
      );
      if (matched) filters.sprint = String(matched.id);
    }
    
    if (ext.user_story) {
      const stories = await client.getUserStories(projectSlug, companySlug);
      const matched = (stories.data as Array<{ id: number; slug: string; title: string }>).find(
        s => s.slug === ext.user_story || s.title.toLowerCase() === ext.user_story!.toLowerCase()
      );
      if (matched) filters.user_story = String(matched.id);
    }
    
    // Status filter
    if (ext.status) filters.status = ext.status;
    
    // Assignees
    if (ext.users) filters.users = ext.users;
    
    // Date ranges
    if (ext.start_date) filters.start_date = ext.start_date;
    if (ext.due_date) filters.due_date = ext.due_date;
    if (ext.created_at) filters.created_at = ext.created_at;
    if (ext.closed_at) filters.closed_at = ext.closed_at;
    
    // Flags
    if (ext.is_blocker) filters.is_blocker = true;
    if (ext.is_bug) filters.is_bug = true;
    if (ext.unassigned) filters.unassigned = true;
    if (ext.is_archived) filters.is_archived = true;
    
    // Pagination
    filters.per_page = args.per_page || 50;
    
    const response = await client.searchTasks(
      projectSlug,
      companySlug,
      filters as Parameters<typeof client.searchTasks>[2]
    );
    
    const ctx: ResponseContext = { company_slug: companySlug, project_slug: projectSlug };
    return success(JSON.stringify(response, null, 2), ctx);
  },

  by_code: async (client, args) => {
    const ext = args as TaskFilterArgs;
    if (!ext.task_code) return required("task_code (e.g. 'PROJ-123')");
    
    let projectSlug = args.project_slug;
    let companySlug = args.company_slug;
    
    if (!companySlug && projectSlug) {
      const resolved = await resolveProjectContext(client, { project_slug: projectSlug });
      if (resolved) {
        companySlug = resolved.company_slug;
        projectSlug = resolved.project_slug;
      }
    }
    
    if (!projectSlug || !companySlug) {
      return error("company_slug and project_slug required for by_code");
    }
    
    const task = await client.getTaskByCode(ext.task_code, projectSlug, companySlug);
    const ctx: ResponseContext = { company_slug: companySlug, project_slug: projectSlug };
    return success(JSON.stringify(task, null, 2), ctx);
  },

  duplicate: async (client, args) => {
    const uuid = args.uuid || args.task_uuid;
    if (!uuid) return required("uuid");
    
    let projectSlug = args.project_slug;
    let companySlug = args.company_slug;
    
    if (!companySlug && projectSlug) {
      const resolved = await resolveProjectContext(client, { project_slug: projectSlug });
      if (resolved) {
        companySlug = resolved.company_slug;
        projectSlug = resolved.project_slug;
      }
    }
    
    if (!projectSlug || !companySlug) {
      return error("company_slug and project_slug required to duplicate task");
    }
    
    const task = await client.duplicateTask(uuid, projectSlug, companySlug, args.workflow_id);
    const ctx: ResponseContext = { company_slug: companySlug, project_slug: projectSlug };
    return success(JSON.stringify({ duplicated: true, task }, null, 2), ctx);
  },

  move: async (client, args) => {
    const uuid = args.uuid || args.task_uuid;
    if (!uuid) return required("uuid");
    const ext = args as TaskFilterArgs;
    if (!ext.new_project_slug) return required("new_project_slug");
    if (!ext.new_workflow_id) return required("new_workflow_id");
    
    let projectSlug = args.project_slug;
    let companySlug = args.company_slug;
    
    if (!companySlug && projectSlug) {
      const resolved = await resolveProjectContext(client, { project_slug: projectSlug });
      if (resolved) {
        companySlug = resolved.company_slug;
        projectSlug = resolved.project_slug;
      }
    }
    
    if (!projectSlug || !companySlug) {
      return error("company_slug and project_slug required to move task");
    }
    
    const result = await client.moveTask(uuid, projectSlug, companySlug, ext.new_project_slug, ext.new_workflow_id);
    const ctx: ResponseContext = { company_slug: companySlug, project_slug: projectSlug };
    return success(JSON.stringify({ moved: true, result }, null, 2), ctx);
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleTaskTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const action = args.action as string;
  return executeAction(taskHandlers, action, client, args);
}
