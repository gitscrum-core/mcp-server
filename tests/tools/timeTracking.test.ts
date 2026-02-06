/**
 * Time Tracking Tools Tests (Consolidated)
 * 
 * Tests for the unified time tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleTimeTrackingTool, registerTimeTrackingTools } from '../../src/tools/timeTracking.js';

const mockClient = {
  getActiveTimer: async () => ({
    id: 'timer-1',
    task_uuid: 'task-1',
    task_title: 'Working on feature',
    started_at: '2024-01-01T10:00:00Z',
  }),
  startTimer: async () => ({
    id: 'timer-2',
    task_uuid: 'task-1',
    started_at: '2024-01-01T10:00:00Z',
  }),
  stopTimer: async () => ({
    id: 'timer-1',
    duration: 60,
    total_minutes: 60,
  }),
  getTimeLogs: async () => [
    { id: 'log-1', task_title: 'Task 1', duration_minutes: 60, user_name: 'John' },
    { id: 'log-2', task_title: 'Task 2', duration_minutes: 30, user_name: 'Jane' },
  ],
  getWorkspaces: async () => ({ data: [{ slug: 'test-workspace', name: 'Test Workspace' }] }),
  getTimeTrackingAnalytics: async () => ({ total_hours: 120, billable_hours: 80 }),
  getTimeTrackingTeam: async () => [{ user: 'john', total_hours: 40 }],
  getTimeTrackingReports: async () => ({ summary: { total_hours: 120 }, by_project: [] }),
  getTimeTrackingProductivity: async () => ({ score: 82, avg_focus_time: 4.5 }),
  getTimeTrackingTimeline: async () => [{ date: '2026-01-15', hours: 8 }],
};

const mockClientNoTimer = {
  ...mockClient,
  getActiveTimer: async () => null,
};

describe('Time Tracking Tools (Consolidated)', () => {
  describe('registerTimeTrackingTools', () => {
    it('should register the consolidated time tool', () => {
      const tools = registerTimeTrackingTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('time');
    });

    it('time tool should have action enum with all operations', () => {
      const tools = registerTimeTrackingTools();
      const timeTool = tools[0];
      const actionProp = timeTool.inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('active');
      expect(actionProp.enum).toContain('start');
      expect(actionProp.enum).toContain('stop');
      expect(actionProp.enum).toContain('logs');
      expect(actionProp.enum).toContain('analytics');
      expect(actionProp.enum).toContain('team');
      expect(actionProp.enum).toContain('reports');
      expect(actionProp.enum).toContain('productivity');
      expect(actionProp.enum).toContain('timeline');
    });
  });

  describe('handleTimeTrackingTool - action:active', () => {
    it('should return active timer when one exists', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', { action: 'active' });
      
      expect(result.isError).toBeUndefined();
      const jsonText = result.content[0].text.split('\n\n---context')[0];
      const data = JSON.parse(jsonText);
      expect(data).toHaveProperty('id');
    });

    it('should indicate when no timer is running', async () => {
      const result = await handleTimeTrackingTool(mockClientNoTimer as any, 'time', { action: 'active' });
      
      expect(result.isError).toBeUndefined();
      const jsonText = result.content[0].text.split('\n\n---context')[0];
      const data = JSON.parse(jsonText);
      expect(data.active).toBe(false);
    });
  });

  describe('handleTimeTrackingTool - action:start', () => {
    it('should start timer when task_uuid provided', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', {
        action: 'start',
        task_uuid: 'task-1',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.started).toBe(true);
    });

    it('should accept optional description', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', {
        action: 'start',
        task_uuid: 'task-1',
        description: 'Working on feature X',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require task_uuid', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', { action: 'start' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('task_uuid');
    });
  });

  describe('handleTimeTrackingTool - action:stop', () => {
    it('should stop timer when time_tracking_id provided', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', {
        action: 'stop',
        time_tracking_id: 'timer-1',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.stopped).toBe(true);
      expect(data.timer).toHaveProperty('duration');
    });

    it('should require time_tracking_id', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', { action: 'stop' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('time_tracking_id');
    });
  });

  describe('handleTimeTrackingTool - action:logs', () => {
    it('should return time logs when project_slug and company_slug provided', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', {
        action: 'logs',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should require project_slug and company_slug', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', { action: 'logs' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('project_slug');
    });
  });

  describe('handleTimeTrackingTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', { action: 'unknown' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });
  });

  describe('handleTimeTrackingTool - action:analytics', () => {
    it('should return analytics data', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', {
        action: 'analytics',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text.split('---context')[0]);
      expect(data).toHaveProperty('total_hours');
    });

    it('should require company_slug', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', { action: 'analytics' });
      expect(result.isError).toBe(true);
    });
  });

  describe('handleTimeTrackingTool - action:team', () => {
    it('should return team time data', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', {
        action: 'team',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleTimeTrackingTool - action:reports', () => {
    it('should return time reports', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', {
        action: 'reports',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleTimeTrackingTool - action:productivity', () => {
    it('should return productivity data', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', {
        action: 'productivity',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleTimeTrackingTool - action:timeline', () => {
    it('should return timeline data', async () => {
      const result = await handleTimeTrackingTool(mockClient as any, 'time', {
        action: 'timeline',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });
});
