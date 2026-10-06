/**
 * Labels — Fluent API
 *
 * ✅ .tags('config') — configuration-layer tools
 * ✅ .cached() — reference data rarely changes
 * ✅ .invalidates() — cascades on mutation
 * ✅ .fromModel() — zero-boilerplate input from Models
 */

import { f } from '../context.js';
import { resolveProjectContext, normalizeColor } from '../utils/resolveProject.js';
import { LabelModel } from '../models/LabelModel.js';

const label = f.router('label')
  .describe('Label management — create, attach, toggle on tasks')
  .tags('config');

export const listLabels = label.query('list')
  .describe('List labels in a workspace or project')
  .cached()
  .fromModel(LabelModel, 'query')
  .handle(async (input, ctx) => {
    return input.project_slug
      ? await ctx.client.getProjectLabels(input.project_slug, input.company_slug)
      : await ctx.client.getWorkspaceLabels(input.company_slug);
  });

export const createLabel = label.mutation('create')
  .describe('Create a new workspace label')
  .invalidates('label.*')
  .fromModel(LabelModel, 'create')
  .handle(async (input, ctx) => {
    const created = await ctx.client.createLabel(input.company_slug, {
      title: input.title,
      color: normalizeColor(input.color),
    });
    return { created: true, label: created };
  });

export const updateLabel = label.action('update')
  .describe('Update a label')
  .idempotent()
  .invalidates('label.*')
  .fromModel(LabelModel, 'update')
  .handle(async (input, ctx) => {
    const data = LabelModel.toApi({
      title: input.title,
      color: input.color ? normalizeColor(input.color) : undefined,
    });
    await ctx.client.updateLabel(input.label_slug, input.company_slug, data);
    return { updated: true, label_slug: input.label_slug };
  });

export const attachLabel = label.action('attach')
  .describe('Attach a label to a project')
  .fromModel(LabelModel, 'attach')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    await ctx.client.attachLabelToProject(input.label_slug, resolved.project_slug, resolved.company_slug);
    return { attached: true, label_slug: input.label_slug };
  });

export const detachLabel = label.action('detach')
  .describe('Detach a label from a project')
  .fromModel(LabelModel, 'detach')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    await ctx.client.detachLabelFromProject(input.label_slug, resolved.project_slug, resolved.company_slug);
    return { detached: true, label_slug: input.label_slug };
  });

export const toggleLabel = label.action('toggle')
  .describe('Toggle a label on a task')
  .fromModel(LabelModel, 'toggle')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    await ctx.client.toggleLabelOnTask(input.task_uuid, input.label_slug, resolved.project_slug, resolved.company_slug);
    return { toggled: true, label_slug: input.label_slug, task_uuid: input.task_uuid };
  });
