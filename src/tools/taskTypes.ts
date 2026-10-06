/**
 * Task Types — Fluent API
 *
 * ✅ f.error() for missing context
 * ✅ .fromModel() — zero-boilerplate input from Models
 * ✅ Implicit success() — handlers return raw data
 */

import { f } from '../context.js';
import { resolveProjectContext, normalizeColor } from '../utils/resolveProject.js';
import { TaskTypeModel } from '../models/TaskTypeModel.js';

const taskType = f.router('task_type')
  .describe('Task type management — Bug, Feature, etc.')
  .tags('config');

export const listTaskTypes = taskType.query('list')
  .describe('List task types in a project')
  .fromModel(TaskTypeModel, 'query')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getProjectTypes(resolved.project_slug, resolved.company_slug);
  });

export const createTaskType = taskType.mutation('create')
  .describe('Create a new task type')
  .invalidates('task_type.*')
  .fromModel(TaskTypeModel, 'create')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const created = await ctx.client.createTaskType(resolved.project_slug, resolved.company_slug, {
      title: input.title,
      color: normalizeColor(input.color),
    });
    return { created: true, task_type: created };
  });

export const updateTaskType = taskType.action('update')
  .describe('Update a task type')
  .idempotent()
  .invalidates('task_type.*')
  .fromModel(TaskTypeModel, 'update')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const data = TaskTypeModel.toApi({
      title: input.title,
      color: input.color ? normalizeColor(input.color) : undefined,
    });
    const updated = await ctx.client.updateTaskType(input.type_id, resolved.project_slug, resolved.company_slug, data);
    return { updated: true, task_type: updated };
  });

export const assignTaskType = taskType.action('assign')
  .describe('Assign a type to a task')
  .fromModel(TaskTypeModel, 'assign')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const result = await ctx.client.assignTypeToTask(input.task_uuid, input.type_id, resolved.project_slug, resolved.company_slug);
    return { assigned: true, result };
  });
