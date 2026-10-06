/**
 * Kanban Workflows — Fluent API
 *
 * ✅ f.error() for missing context
 * ✅ .fromModel() — zero-boilerplate input from Models
 * ✅ Implicit success() — handlers return raw data
 */

import { f } from '../context.js';
import { resolveProjectContext, normalizeColor } from '../utils/resolveProject.js';
import { WorkflowModel } from '../models/WorkflowModel.js';

const STATUS_MAP: Record<string, number> = {
  todo: 0, open: 0, 'to do': 0, backlog: 0,
  done: 1, complete: 1, completed: 1, closed: 1,
  'in progress': 2, 'in-progress': 2, inprogress: 2, doing: 2, active: 2,
};

function normalizeStatus(status: string | number): number {
  if (typeof status === 'number') return status >= 0 && status <= 2 ? status : 0;
  return STATUS_MAP[String(status).toLowerCase().trim()] ?? 0;
}

const workflow = f.router('workflow')
  .describe("Kanban board column management — create and update columns. Use 'project.workflows' to see existing columns.")
  .tags('config');

export const createWorkflow = workflow.mutation('create')
  .describe('Create a new Kanban column')
  .invalidates('workflow.*', 'project.*')
  .fromModel(WorkflowModel, 'create')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const data = WorkflowModel.toApi({
      title: input.title,
      color: input.color ? normalizeColor(input.color) : undefined,
      status: input.status !== undefined ? normalizeStatus(input.status) : undefined,
    });
    const created = await ctx.client.createWorkflow(resolved.project_slug, resolved.company_slug, data as { title: string; color?: string; status?: number }) as { id: number };
    return { created: true, workflow_id: created.id, title: input.title };
  });

export const updateWorkflow = workflow.action('update')
  .describe('Update a Kanban column')
  .idempotent()
  .invalidates('workflow.*', 'project.*', 'task.*')
  .fromModel(WorkflowModel, 'update')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const data = WorkflowModel.toApi({
      title: input.title,
      color: input.color ? normalizeColor(input.color) : undefined,
      status: input.status !== undefined ? normalizeStatus(input.status) : undefined,
      position: input.position,
    });
    await ctx.client.updateWorkflow(input.workflow_id, resolved.company_slug, resolved.project_slug, data as Record<string, unknown>);
    return { updated: true, workflow_id: input.workflow_id };
  });
