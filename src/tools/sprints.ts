/**
 * Sprint Management — vurb.ts Showcase
 *
 * ✅ .tags('core', 'planning')
 * ✅ .returns(SprintPresenter) on all queries
 * ✅ .invalidates() on mutations — cascades to task.*
 * ✅ .instructions() — AI-first guidance
 * ✅ .fromModel() — zero-boilerplate input from Models
 * ✅ f.error() — self-healing recovery
 */

import { f } from '../context.js';
import { resolveProjectContext } from '../utils/resolveProject.js';
import { SprintPresenter } from '../presenters/index.js';
import { SprintModel } from '../models/SprintModel.js';

const sprint = f.router('sprint')
  .describe('Sprint/iteration management — list, create, update, KPIs, reports')
  .tags('core', 'planning');

// ── Queries ──────────────────────────────────────────────

export const listSprints = sprint.query('list')
  .describe('List all sprints in a project')
  .instructions('Use to get sprint overview. Returns all sprints with progress percentage.')
  .fromModel(SprintModel, 'query')
  .returns(SprintPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list')
      .retryAfter(0);
    return await ctx.client.getSprints(resolved.project_slug, resolved.company_slug);
  });

export const getSprint = sprint.query('get')
  .describe('Get sprint details')
  .fromModel(SprintModel, 'query')
  .returns(SprintPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list')
      .retryAfter(0);
    return await ctx.client.getSprint(input.sprint_slug, resolved.project_slug, resolved.company_slug);
  });

export const sprintKpi = sprint.query('kpi')
  .describe('Get sprint KPI metrics')
  .instructions('Use for sprint health checks. Returns velocity, burndown, and completion rate.')
  .fromModel(SprintModel, 'query')
  .stale()
  .returns(SprintPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list')
      .retryAfter(0);
    return await ctx.client.getSprintKPIs(input.sprint_slug, resolved.project_slug, resolved.company_slug);
  });

export const sprintReport = sprint.query('report')
  .describe('Get sprint completion report')
  .fromModel(SprintModel, 'query')
  .returns(SprintPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list')
      .retryAfter(0);
    return await ctx.client.getSprintReports(input.sprint_slug, resolved.project_slug, resolved.company_slug);
  });

export const sprintProgress = sprint.query('progress')
  .describe('Get sprint progress and burndown data')
  .stale()
  .fromModel(SprintModel, 'query')
  .returns(SprintPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list')
      .retryAfter(0);
    return await ctx.client.getSprintProgress(input.sprint_slug, resolved.project_slug, resolved.company_slug);
  });

export const sprintStats = sprint.query('stats')
  .describe('Get sprint statistics and metrics')
  .fromModel(SprintModel, 'query')
  .returns(SprintPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list')
      .retryAfter(0);
    return await ctx.client.getSprintStats(input.sprint_slug, resolved.project_slug, resolved.company_slug);
  });

// ── Mutations ────────────────────────────────────────────

export const createSprint = sprint.mutation('create')
  .describe('Create a new sprint')
  .invalidates('sprint.*', 'analytics.*')
  .fromModel(SprintModel, 'create')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list')
      .retryAfter(0);
    return await ctx.client.createSprint(resolved.project_slug, resolved.company_slug, SprintModel.toApi({
      title: input.title,
      start_date: input.start_date,
      end_date: input.end_date,
      description: input.description,
    }) as { title: string; date_start: string; date_finish: string; description?: string });
  });

export const updateSprint = sprint.action('update')
  .describe('Update sprint details')
  .idempotent()
  .invalidates('sprint.*', 'task.*')
  .fromModel(SprintModel, 'update')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list')
      .retryAfter(0);
    const data = SprintModel.toApi({
      title: input.title,
      start_date: input.start_date,
      end_date: input.end_date,
      description: input.description,
    });
    await ctx.client.updateSprint(input.sprint_slug, resolved.project_slug, resolved.company_slug, data);
    return { updated: true, sprint_slug: input.sprint_slug };
  });
