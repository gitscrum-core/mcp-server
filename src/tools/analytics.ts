/**
 * Analytics — Fluent API + MVA
 *
 * ✅ .fromModel() — zero-boilerplate input from Models
 * ✅ .proxy() — direct API endpoint mapping
 */

import { f } from '../context.js';
import { AnalyticsModel } from '../models/AnalyticsModel.js';

const analytics = f.router('analytics')
  .describe('Project analytics and intelligence reports — pulse, risks, flow, health, blockers')
  .tags('analytics');

export const analyticsPulse = analytics.query('pulse')
  .describe('Real-time project pulse — recent activity summary')
  .stale()
  .fromModel(AnalyticsModel, 'query')
  .proxy('companies/manager-dashboard/pulse');

export const analyticsRisks = analytics.query('risks')
  .describe('Risk analysis — overdue tasks, stale items, bottlenecks')
  .fromModel(AnalyticsModel, 'query')
  .proxy('companies/manager-dashboard/risks');

export const analyticsFlow = analytics.query('flow')
  .describe('Workflow flow metrics — cycle time, throughput')
  .fromModel(AnalyticsModel, 'query')
  .proxy('companies/reports/cumulative-flow');

export const analyticsAge = analytics.query('age')
  .describe('Task age distribution — how long tasks stay in each status')
  .fromModel(AnalyticsModel, 'query')
  .proxy('companies/reports/project-age');

export const analyticsActivity = analytics.query('activity')
  .describe('Activity timeline analytics')
  .fromModel(AnalyticsModel, 'query')
  .proxy('companies/reports/weekly-activity');

export const analyticsOverview = analytics.query('overview')
  .describe('Project overview dashboard data')
  .fromModel(AnalyticsModel, 'query')
  .proxy('companies/manager-dashboard/overview');

export const analyticsHealth = analytics.query('health')
  .describe('Sprint/project health score with recommendations')
  .fromModel(AnalyticsModel, 'query')
  .proxy('companies/manager-dashboard/health');

export const analyticsBlockers = analytics.query('blockers')
  .describe('Blocker analysis — items blocking progress')
  .fromModel(AnalyticsModel, 'query')
  .proxy('companies/manager-dashboard/blockers');

export const analyticsCommandCenter = analytics.query('command_center')
  .describe('Command center — aggregated project intelligence')
  .fromModel(AnalyticsModel, 'query')
  .proxy('companies/manager-dashboard/command-center');

export const analyticsTimeEntries = analytics.query('time_entries')
  .describe('Time entry analytics for a project')
  .fromModel(AnalyticsModel, 'query')
  .proxy('companies/manager-dashboard/time-entries');
