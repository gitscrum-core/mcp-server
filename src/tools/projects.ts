/**
 * Workspace & Project — vurb.ts Showcase
 *
 * ✅ .tags('core') — foundational tools
 * ✅ .returns(Presenter) — MVA pipeline
 * ✅ .invalidates() — cascades on mutation
 * ✅ .cached() — workspace data rarely changes
 * ✅ .fromModel() — zero-boilerplate input from Models
 */

import { f } from '../context.js';
import { resolveProjectContext } from '../utils/resolveProject.js';
import { ProjectPresenter, WorkspacePresenter } from '../presenters/index.js';
import { ProjectModel } from '../models/ProjectModel.js';
import { WorkspaceModel } from '../models/WorkspaceModel.js';

// ── Workspace Router ─────────────────────────────────────

const workspace = f.router('workspace')
  .describe('Workspace management — list, get details, view members')
  .tags('core');

export const listWorkspaces = workspace.query('list')
  .describe('List all workspaces the user has access to')
  .cached()
  .returns(WorkspacePresenter)
  .handle(async (_input, ctx) => {
    return await ctx.client.getWorkspaces();
  });

export const getWorkspace = workspace.query('get')
  .describe('Get workspace details')
  .fromModel(WorkspaceModel, 'query')
  .returns(WorkspacePresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getWorkspace(input.company_slug);
  });

export const workspaceStats = workspace.query('stats')
  .describe('Get workspace statistics')
  .stale()
  .fromModel(WorkspaceModel, 'query')
  .handle(async (input, ctx) => {
    return await ctx.client.getWorkspaceStats(input.company_slug);
  });

// ── Project Router ───────────────────────────────────────

const project = f.router('project')
  .describe('Project management — CRUD, stats, workflows, labels, efforts, members')
  .tags('core');

export const listProjects = project.query('list')
  .describe('List all projects in a workspace')
  .fromModel(WorkspaceModel, 'query')
  .returns(ProjectPresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getProjects(input.company_slug);
  });

export const getProject = project.query('get')
  .describe('Get project details')
  .fromModel(ProjectModel, 'query')
  .returns(ProjectPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getProject(resolved.project_slug, resolved.company_slug);
  });

export const createProject = project.mutation('create')
  .describe('Create a new project in a workspace')
  .invalidates('project.*')
  .fromModel(ProjectModel, 'create')
  .handle(async (input, ctx) => {
    const data = await ctx.client.createProject(input.company_slug, { name: input.title });
    return { created: true, project: data };
  });

export const projectInfo = project.query('info')
  .describe('Get project details and stats')
  .fromModel(ProjectModel, 'query')
  .returns(ProjectPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getProjectStats(resolved.project_slug, resolved.company_slug);
  });

export const projectStats = project.query('stats')
  .describe('Get project statistics')
  .stale()
  .fromModel(ProjectModel, 'query')
  .returns(ProjectPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getProjectStats(resolved.project_slug, resolved.company_slug);
  });

export const projectWorkflows = project.query('workflows')
  .describe('Get project Kanban columns/workflows')
  .cached()
  .fromModel(ProjectModel, 'query')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getProjectWorkflows(resolved.project_slug, resolved.company_slug);
  });

export const projectLabels = project.query('labels')
  .describe('Get project labels')
  .cached()
  .fromModel(ProjectModel, 'query')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getProjectLabels(resolved.project_slug, resolved.company_slug);
  });

export const projectEfforts = project.query('efforts')
  .describe('Get project effort levels')
  .cached()
  .fromModel(ProjectModel, 'query')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getProjectEfforts(resolved.project_slug, resolved.company_slug);
  });

export const projectMembers = project.query('members')
  .describe('Get project members')
  .fromModel(ProjectModel, 'query')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getProjectMembers(resolved.project_slug, resolved.company_slug);
  });
