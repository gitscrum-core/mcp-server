/**
 * Task Management — vurb.ts Showcase
 *
 * ═══════════════════════════════════════════════════════════
 * Demonstrates:
 *   • FluentRouter with .tags() for capability grouping
 *   • Semantic verbs: .query(), .mutation(), .action()
 *   • .returns(Presenter) — MVA pipeline on all queries
 *   • .instructions() — AI-first guidance per tool
 *   • .invalidates() — State Sync cache cascading
 *   • .stale() — volatile queries that must never be cached
 *   • f.error() — self-healing errors with recovery hints
 *   • .fromModel() — zero-boilerplate input from Models
 *   • Implicit success() — handlers return raw data
 * ═══════════════════════════════════════════════════════════
 */

import { f } from '../context.js';
import { TaskPresenter } from '../presenters/index.js';
import { TaskModel } from '../models/TaskModel.js';

// ── Router ───────────────────────────────────────────────

const task = f.router('task')
  .describe('Task management across projects and sprints')
  .tags('core', 'planning');

// ── Queries ──────────────────────────────────────────────

export const myTasks = task.query('my')
  .describe("Get current user's assigned tasks")
  .instructions('Use this as the default when the user asks about "my tasks" or "what should I work on"')
  .withOptionalNumber('per_page', 'Results per page (default: 50)')
  .returns(TaskPresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getMyTasks(input.per_page ?? 50);
  });

export const todayTasks = task.query('today')
  .describe("Get today's tasks for the current user")
  .instructions('Use when the user asks about "today" or "daily plan". Prefer over task.my for day-focused queries.')
  .withOptionalNumber('per_page', 'Results per page (default: 50)')
  .returns(TaskPresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getTodayTasks(input.per_page ?? 50);
  });

export const taskNotifications = task.query('notifications')
  .describe('Get task notifications with unread count')
  .stale()
  .handle(async (_input, ctx) => {
    const [notifications, count] = await Promise.all([
      ctx.client.getNotifications(),
      ctx.client.getNotificationCount(),
    ]);
    return { notifications, unread_count: count };
  });

export const getTask = task.query('get')
  .describe('Get detailed task information by UUID')
  .instructions('Use when the user references a specific task by ID or UUID. Returns full detail including subtasks, comments, and attachments.')
  .withString('uuid', 'Task unique identifier')
  .returns(TaskPresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getTask(input.uuid);
  });

export const taskSubtasks = task.query('subtasks')
  .describe('Get subtasks of a task')
  .withString('uuid', 'Parent task UUID')
  .returns(TaskPresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getSubTasks(input.uuid);
  });

export const taskByCode = task.query('by_code')
  .describe("Get task by human-readable code (e.g. 'PROJ-123')")
  .instructions('Use when the user references a task by code like "PROJ-123". Requires company_slug and project_slug.')
  .fromModel(TaskModel, 'lookup')
  .returns(TaskPresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getTaskByCode(input.task_code, input.project_slug, input.company_slug);
  });

export const filterTasks = task.query('filter')
  .describe('Filter tasks with rich criteria — workflow, labels, type, effort, sprint, dates')
  .instructions('Use for complex queries like "show me bugs in sprint 3" or "overdue tasks assigned to john". Resolves names to IDs automatically.')
  .fromModel(TaskModel, 'filter')
  .withOptionalStrings({
    workflow:    'Column name to filter by (e.g. "In Progress")',
    labels:      'Comma-separated label names',
    type:        'Task type name (e.g. "Bug", "Feature")',
    effort:      'Effort level name',
    sprint:      'Sprint slug or title',
    user_story:  'User story slug or title',
    users:       'Filter by usernames',
  })
  .returns(TaskPresenter)
  .handle(async (input, ctx) => {
    const filters: Record<string, unknown> = {};

    if (input.title) filters.title = input.title;
    if (input.description) filters.description = input.description;

    if (input.workflow) {
      const workflows = await ctx.client.getProjectWorkflows(input.project_slug, input.company_slug);
      const matched = (workflows as Array<{ id: number; title: string }>).find(
        w => w.title.toLowerCase() === input.workflow!.toLowerCase(),
      );
      if (matched) filters.workflow = String(matched.id);
      else return f.error('NOT_FOUND', `Column "${input.workflow}" not found`)
        .suggest('Check available columns with project.workflows')
        .actions('project.workflows')
        .details({ searched: input.workflow })
        .retryAfter(0);
    }

    if (input.labels) {
      const projectLabels = await ctx.client.getProjectLabels(input.project_slug, input.company_slug);
      const labelNames = input.labels.split(',').map((l: string) => l.trim().toLowerCase());
      const ids = (projectLabels as Array<{ id: number; title: string }>)
        .filter(l => labelNames.includes(l.title.toLowerCase()))
        .map(l => l.id);
      if (ids.length > 0) filters.labels = ids.join(',');
    }

    if (input.type) {
      const types = await ctx.client.getProjectTypes(input.project_slug, input.company_slug);
      const matched = (types as Array<{ id: number; title: string }>).find(
        t => t.title.toLowerCase() === input.type!.toLowerCase(),
      );
      if (matched) filters.type = String(matched.id);
    }

    if (input.effort) {
      const efforts = await ctx.client.getProjectEfforts(input.project_slug, input.company_slug);
      const matched = (efforts as Array<{ id: number; title: string }>).find(
        e => e.title.toLowerCase() === input.effort!.toLowerCase(),
      );
      if (matched) filters.effort = String(matched.id);
    }

    if (input.sprint) {
      const sprints = await ctx.client.getSprints(input.project_slug, input.company_slug);
      const matched = (sprints.data as Array<{ id: number; slug: string; title: string }>).find(
        s => s.slug === input.sprint || s.title.toLowerCase() === input.sprint!.toLowerCase(),
      );
      if (matched) filters.sprint = String(matched.id);
    }

    if (input.user_story) {
      const stories = await ctx.client.getUserStories(input.project_slug, input.company_slug);
      const matched = (stories.data as Array<{ id: number; slug: string; title: string }>).find(
        s => s.slug === input.user_story || s.title.toLowerCase() === input.user_story!.toLowerCase(),
      );
      if (matched) filters.user_story = String(matched.id);
    }

    if (input.status) filters.status = input.status;
    if (input.users) filters.users = input.users;
    if (input.start_date) filters.start_date = input.start_date;
    if (input.due_date) filters.due_date = input.due_date;
    if (input.created_at) filters.created_at = input.created_at;
    if (input.closed_at) filters.closed_at = input.closed_at;
    if (input.is_blocker) filters.is_blocker = true;
    if (input.is_bug) filters.is_bug = true;
    if (input.unassigned) filters.unassigned = true;
    if (input.is_archived) filters.is_archived = true;
    filters.per_page = input.per_page ?? 50;

    return await ctx.client.searchTasks(
      input.project_slug, input.company_slug,
      filters as Parameters<typeof ctx.client.searchTasks>[2],
    );
  });

// ── Mutations ────────────────────────────────────────────

export const createTask = task.mutation('create')
  .describe('Create a new task. All optional fields can be set in a single call.')
  .instructions('Prefer setting workflow/column, labels, and assignees in the same call to avoid multiple round-trips.')
  .invalidates('task.*', 'sprint.*', 'analytics.*')
  .fromModel(TaskModel, 'create')
  .handle(async (input, ctx) => {
    let workflowId = input.workflow_id;
    if (!workflowId && input.column) {
      const workflows = await ctx.client.getProjectWorkflows(input.project_slug, input.company_slug);
      const wf = (workflows as Array<{ id: number; title: string }>).find(
        w => w.title.toLowerCase() === input.column!.toLowerCase(),
      );
      if (wf) workflowId = wf.id;
      else return f.error('NOT_FOUND', `Column "${input.column}" not found`)
        .suggest('Use project.workflows to see available columns')
        .actions('project.workflows')
        .details({ searched: input.column })
        .retryAfter(0);
    }

    return await ctx.client.createTask({
      title: input.title,
      project_slug: input.project_slug,
      company_slug: input.company_slug,
      description: input.description,
      workflow_id: workflowId,
      effort_id: input.effort_id,
      type_id: input.type_id,
      usernames: input.usernames,
      label_ids: input.label_ids,
      due_date: input.due_date,
      start_date: input.start_date,
      sprint_slug: input.sprint_slug,
      user_story_slug: input.user_story_slug,
      estimated_minutes: input.estimated_minutes,
      parent_id: input.parent_id,
      is_bug: input.is_bug,
      is_blocker: input.is_blocker,
    });
  });

export const updateTask = task.action('update')
  .describe('Update an existing task — supports partial updates')
  .idempotent()
  .invalidates('task.*', 'sprint.*')
  .withString('uuid', 'Task UUID to update')
  .fromModel(TaskModel, 'update')
  .handle(async (input, ctx) => {
    // Start with simple fields — toApi() strips undefined and applies aliases
    // (effort_id → config_issue_effort_id, type_id → config_issue_type_id, usernames → members)
    const updateData: Record<string, unknown> = TaskModel.toApi({
      company_slug: input.company_slug,
      project_slug: input.project_slug,
      title: input.title,
      description: input.description,
      due_date: input.due_date,
      start_date: input.start_date,
      estimated_minutes: input.estimated_minutes,
      is_blocker: input.is_blocker,
      is_bug: input.is_bug,
      is_archived: input.is_archived,
      label_ids: input.label_ids,
      effort_id: input.effort_id,
      type_id: input.type_id,
      usernames: input.usernames,
    });

    // Name resolution — column name → workflow ID
    if (input.column) {
      const workflows = await ctx.client.getProjectWorkflows(input.project_slug, input.company_slug);
      const wf = (workflows as Array<{ id: number; title: string }>).find(
        w => w.title.toLowerCase() === input.column!.toLowerCase(),
      );
      if (wf) updateData.workflow_id = wf.id;
      else return f.error('NOT_FOUND', `Column "${input.column}" not found`)
        .suggest('Use project.workflows to see available columns')
        .actions('project.workflows')
        .details({ searched: input.column })
        .retryAfter(0);
    } else if (input.workflow_id !== undefined) {
      updateData.workflow_id = input.workflow_id;
    }

    // Name resolution — sprint slug → sprint ID
    if (input.sprint_slug) {
      const sprints = await ctx.client.getSprints(input.project_slug, input.company_slug);
      const matched = (sprints.data as Array<{ id: number; slug: string }>).find(s => s.slug === input.sprint_slug);
      if (matched) updateData.sprint_id = matched.id;
      else return f.error('NOT_FOUND', `Sprint "${input.sprint_slug}" not found`)
        .suggest('Use sprint.list to see available sprints')
        .actions('sprint.list')
        .details({ searched: input.sprint_slug })
        .retryAfter(0);
    }

    // Name resolution — user story slug → user story ID
    if (input.user_story_slug) {
      const stories = await ctx.client.getUserStories(input.project_slug, input.company_slug);
      const matched = (stories.data as Array<{ id: number; slug: string }>).find(s => s.slug === input.user_story_slug);
      if (matched) updateData.user_story_id = matched.id;
      else return f.error('NOT_FOUND', `User story "${input.user_story_slug}" not found`)
        .suggest('Use user_story.list to see available stories')
        .actions('user_story.list')
        .details({ searched: input.user_story_slug })
        .retryAfter(0);
    }

    await ctx.client.updateTask(input.uuid, updateData);
    return { updated: true, uuid: input.uuid };
  });

export const completeTask = task.mutation('complete')
  .describe('Mark a task as complete')
  .invalidates('task.*', 'sprint.*', 'standup.*', 'analytics.*')
  .withString('uuid', 'Task UUID to complete')
  .handle(async (input, ctx) => {
    await ctx.client.completeTask(input.uuid);
    return { completed: true, uuid: input.uuid };
  });

export const duplicateTask = task.mutation('duplicate')
  .describe('Duplicate an existing task')
  .invalidates('task.*')
  .fromModel(TaskModel, 'duplicate')
  .handle(async (input, ctx) => {
    return await ctx.client.duplicateTask(input.uuid, input.project_slug, input.company_slug, input.workflow_id);
  });

export const moveTask = task.mutation('move')
  .describe('Move task to another project')
  .invalidates('task.*', 'project.*')
  .fromModel(TaskModel, 'move')
  .handle(async (input, ctx) => {
    return await ctx.client.moveTask(
      input.uuid, input.project_slug, input.company_slug,
      input.new_project_slug, input.new_workflow_id,
    );
  });

