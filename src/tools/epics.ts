/**
 * Epics — Fluent API + MVA
 *
 * ✅ .returns(EpicPresenter) on queries
 * ✅ .fromModel() — zero-boilerplate input from Models
 * ✅ f.error() for missing context
 * ✅ Implicit success() — handlers return raw data
 */

import { f } from '../context.js';
import { resolveProjectContext, normalizeColor } from '../utils/resolveProject.js';
import { EpicPresenter } from '../presenters/index.js';
import { EpicModel } from '../models/EpicModel.js';

const epic = f.router('epic')
  .describe('Epic management — high-level feature groups that span multiple sprints')
  .tags('planning');

export const listEpics = epic.query('list')
  .describe('List epics in a project')
  .fromModel(EpicModel, 'query')
  .returns(EpicPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getEpics(resolved.project_slug, resolved.company_slug);
  });

export const createEpic = epic.mutation('create')
  .describe('Create a new epic')
  .invalidates('epic.*')
  .fromModel(EpicModel, 'create')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const data = EpicModel.toApi({
      title: input.title,
      description: input.description,
      color: input.color ? normalizeColor(input.color) : undefined,
    });
    const created = await ctx.client.createEpic(resolved.project_slug, resolved.company_slug, data as { title: string; description?: string; color?: string });
    return { created: true, epic: created };
  });

export const updateEpic = epic.action('update')
  .describe('Update an epic')
  .idempotent()
  .invalidates('epic.*')
  .fromModel(EpicModel, 'update')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const data = EpicModel.toApi({
      title: input.title,
      description: input.description,
      color: input.color ? normalizeColor(input.color) : undefined,
    });
    await ctx.client.updateEpic(input.epic_uuid, resolved.project_slug, resolved.company_slug, data);
    return { updated: true, epic_uuid: input.epic_uuid };
  });
