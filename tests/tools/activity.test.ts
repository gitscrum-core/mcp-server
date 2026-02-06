/**
 * Activity Tools Tests
 * 
 * Tests for the unified activity tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleActivityTool, registerActivityTools } from '../../src/tools/activity.js';

const mockClient = {
  getActivityFeed: async () => ({
    data: [
      { type: 'task_completed', description: 'John completed a task' },
      { type: 'comment_added', description: 'Jane commented' },
    ],
  }),
  getActivityFeedByUser: async () => ({
    data: [
      { type: 'task_completed', description: 'john completed a task' },
    ],
  }),
  getNotificationFeed: async () => ({
    data: [
      { type: 'mention', message: 'You were mentioned', read: false },
    ],
  }),
  getActivities: async () => [
    { type: 'status_change', entity: 'task', description: 'Task moved' },
  ],
  getTaskWorkflowHistory: async () => [
    { from: 'To Do', to: 'In Progress', user: 'john', date: '2026-01-14T09:00:00Z' },
  ],
};

describe('Activity Tools', () => {
  describe('registerActivityTools', () => {
    it('should register 1 consolidated activity tool', () => {
      const tools = registerActivityTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('activity');
    });

    it('activity tool should have action enum with all operations', () => {
      const tools = registerActivityTools();
      const actionProp = tools[0].inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('feed');
      expect(actionProp.enum).toContain('user_feed');
      expect(actionProp.enum).toContain('notifications');
      expect(actionProp.enum).toContain('activities');
      expect(actionProp.enum).toContain('task_workflow');
    });
  });

  describe('handleActivityTool - action:feed', () => {
    it('should return activity feed', async () => {
      const result = await handleActivityTool(mockClient as any, 'activity', { action: 'feed' });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleActivityTool - action:user_feed', () => {
    it('should return user-specific feed', async () => {
      const result = await handleActivityTool(mockClient as any, 'activity', {
        action: 'user_feed',
        username: 'john',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require username', async () => {
      const result = await handleActivityTool(mockClient as any, 'activity', {
        action: 'user_feed',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('username');
    });
  });

  describe('handleActivityTool - action:notifications', () => {
    it('should return notification feed', async () => {
      const result = await handleActivityTool(mockClient as any, 'activity', {
        action: 'notifications',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleActivityTool - action:activities', () => {
    it('should return activities with filters', async () => {
      const result = await handleActivityTool(mockClient as any, 'activity', {
        action: 'activities',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleActivityTool - action:task_workflow', () => {
    it('should return task workflow history', async () => {
      const result = await handleActivityTool(mockClient as any, 'activity', {
        action: 'task_workflow',
        task_uuid: 'task-uuid-1',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require task_uuid', async () => {
      const result = await handleActivityTool(mockClient as any, 'activity', {
        action: 'task_workflow',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('task_uuid');
    });
  });

  describe('handleActivityTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleActivityTool(mockClient as any, 'activity', {
        action: 'unknown',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });
  });
});
