/**
 * Time Tracking — Fluent API + MVA
 *
 * Router prefix: 'time'
 *
 * ✅ .returns(TimeEntryPresenter) on queries
 * ✅ .instructions() for AI-first guidance
 * ✅ .fromModel() — zero-boilerplate input from Models
 * ✅ .proxy() — direct API endpoint mapping for analytics
 * ✅ f.error() for missing context
 * ✅ Implicit success() — handlers return raw data
 */

import { f } from '../context.js';
import { resolveProjectContext } from '../utils/resolveProject.js';
import { TimeEntryPresenter } from '../presenters/index.js';
import { TimeEntryModel } from '../models/TimeEntryModel.js';

const time = f.router('time')
  .describe('Time tracking — timers, logs, analytics, reports')
  .tags('time');

export const activeTimer = time.query('active')
  .describe('Check if there is a running timer')
  .instructions("Always check 'active' before starting a new timer")
  .fromModel(TimeEntryModel, 'active')
  .returns(TimeEntryPresenter)
  .handle(async (input, ctx) => {
    let companySlug = input.company_slug;
    if (!companySlug) {
      const workspaces = await ctx.client.getWorkspaces({ perPage: 1 });
      const list = workspaces.data as Array<{ slug: string }>;
      if (list?.length > 0) companySlug = list[0].slug;
    }
    if (!companySlug) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const timer = await ctx.client.getActiveTimer(companySlug);
    return timer || { active: false };
  });

export const startTimer = time.mutation('start')
  .describe('Start a time tracking timer on a task')
  .instructions("Get task_uuid from 'task' tool (action my/today/filter) first")
  .invalidates('time.*')
  .fromModel(TimeEntryModel, 'start')
  .handle(async (input, ctx) => {
    const result = await ctx.client.startTimer(input.task_uuid, input.description);
    return { started: true, timer: result };
  });

export const stopTimer = time.mutation('stop')
  .describe('Stop the active time tracking timer')
  .instructions("Get time_tracking_id from 'time.active' response")
  .invalidates('time.*', 'analytics.*')
  .fromModel(TimeEntryModel, 'stop')
  .handle(async (input, ctx) => {
    const timer = await ctx.client.stopTimer(input.time_tracking_id);
    return { stopped: true, timer };
  });

export const timeLogs = time.query('logs')
  .describe('Get time tracking entries for a project')
  .fromModel(TimeEntryModel, 'query')
  .returns(TimeEntryPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getTimeLogs(resolved.project_slug, resolved.company_slug);
  });

export const timeAnalytics = time.query('analytics')
  .describe('Time tracking analytics')
  .fromModel(TimeEntryModel, 'query')
  .returns(TimeEntryPresenter)
  .proxy('time-trackings/analytics');

export const timeTeam = time.query('team')
  .describe('Team time tracking breakdown')
  .fromModel(TimeEntryModel, 'query')
  .returns(TimeEntryPresenter)
  .proxy('time-trackings/team');

export const timeReports = time.query('reports')
  .describe('Detailed time tracking reports')
  .fromModel(TimeEntryModel, 'report')
  .returns(TimeEntryPresenter)
  .proxy('time-trackings/reports');

export const timeProductivity = time.query('productivity')
  .describe('Productivity metrics based on time data')
  .fromModel(TimeEntryModel, 'query')
  .returns(TimeEntryPresenter)
  .proxy('time-trackings/productivity');

export const timeTimeline = time.query('timeline')
  .describe('Time tracking timeline view')
  .fromModel(TimeEntryModel, 'query')
  .returns(TimeEntryPresenter)
  .proxy('time-trackings/timeline');
