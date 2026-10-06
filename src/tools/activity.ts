/**
 * Activity Feed — Fluent API + MVA
 *
 * ✅ .fromModel() — zero-boilerplate input from Models
 * ✅ Implicit success() — handlers return raw data
 */

import { f } from '../context.js';
import { ActivityModel } from '../models/ActivityModel.js';

const activity = f.router('activity')
  .describe('Activity feeds, notifications, and history')
  .tags('core');

export const activityFeed = activity.query('feed')
  .describe("Get the current user's activity feed")
  .stale()
  .handle(async (_input, ctx) => {
    return await ctx.client.getActivityFeed();
  });

export const activityUser = activity.query('user')
  .describe('Get a specific user\'s activity feed')
  .fromModel(ActivityModel, 'user')
  .handle(async (input, ctx) => {
    return await ctx.client.getActivityFeedByUser(input.username);
  });

export const activityNotifications = activity.query('notifications')
  .describe('Get notifications for the current user')
  .handle(async (_input, ctx) => {
    const [notifications, count] = await Promise.all([
      ctx.client.getNotifications(),
      ctx.client.getNotificationCount(),
    ]);
    return { notifications, unread_count: count };
  });

export const activityContext = activity.query('context')
  .describe('Get activity within a specific project or task context')
  .fromModel(ActivityModel, 'context')
  .handle(async (input, ctx) => {
    return await ctx.client.getActivities({
      company_slug: input.company_slug,
      project_slug: input.project_slug,
      uuid: input.task_uuid,
    });
  });

export const activityHistory = activity.query('workflow_history')
  .describe('Get task workflow transition history')
  .withString('task_uuid', 'Task UUID to view transition history')
  .handle(async (input, ctx) => {
    return await ctx.client.getTaskWorkflowHistory(input.task_uuid);
  });
