/**
 * Standup Tools Tests (Consolidated)
 * 
 * Tests for the unified standup tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleStandupTool, registerStandupTools } from '../../src/tools/standup.js';

const mockClient = {
  getStandupSummary: async () => ({
    completed_yesterday: 5,
    in_progress: 10,
    blocked: 2,
  }),
  getStandupCompletedYesterday: async () => [
    { uuid: 'task-1', title: 'Task 1', completed_at: '2024-01-01' }
  ],
  getStandupBlockers: async () => [
    { uuid: 'task-2', title: 'Blocked Task', blocker_reason: 'Waiting API' }
  ],
  getStandupTeamStatus: async () => [
    { name: 'John', active_tasks: 3, status: 'active' }
  ],
  getStandupStuckTasks: async () => [
    { uuid: 'task-3', title: 'Stuck Task', days_stuck: 5 }
  ],
  getStandupWeeklyDigest: async () => ({
    tasks_completed: 25,
    tasks_created: 30,
    comments: 15,
    time_logged: '40h',
  }),
  getStandupContributors: async () => [
    { name: 'John', contribution_score: 100, tasks_completed: 10 }
  ],
};

describe('Standup Tools (Consolidated)', () => {
  describe('registerStandupTools', () => {
    it('should register the consolidated standup tool', () => {
      const tools = registerStandupTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('standup');
    });

    it('standup tool should have action enum with all operations', () => {
      const tools = registerStandupTools();
      const standupTool = tools[0];
      const actionProp = standupTool.inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('summary');
      expect(actionProp.enum).toContain('completed');
      expect(actionProp.enum).toContain('blockers');
      expect(actionProp.enum).toContain('team');
      expect(actionProp.enum).toContain('stuck');
      expect(actionProp.enum).toContain('digest');
      expect(actionProp.enum).toContain('contributors');
    });
  });

  describe('handleStandupTool - action:summary', () => {
    it('should return standup summary', async () => {
      const result = await handleStandupTool(mockClient as any, 'standup', {
        action: 'summary',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('completed_yesterday');
    });
  });

  describe('handleStandupTool - action:completed', () => {
    it('should return completed tasks', async () => {
      const result = await handleStandupTool(mockClient as any, 'standup', {
        action: 'completed',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should accept optional date param', async () => {
      const result = await handleStandupTool(mockClient as any, 'standup', {
        action: 'completed',
        company_slug: 'test-workspace',
        date: '2024-01-15',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('handleStandupTool - action:blockers', () => {
    it('should return blockers', async () => {
      const result = await handleStandupTool(mockClient as any, 'standup', {
        action: 'blockers',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('handleStandupTool - action:team', () => {
    it('should return team status', async () => {
      const result = await handleStandupTool(mockClient as any, 'standup', {
        action: 'team',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('handleStandupTool - action:stuck', () => {
    it('should return stuck tasks', async () => {
      const result = await handleStandupTool(mockClient as any, 'standup', {
        action: 'stuck',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('handleStandupTool - action:digest', () => {
    it('should return weekly digest', async () => {
      const result = await handleStandupTool(mockClient as any, 'standup', {
        action: 'digest',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('tasks_completed');
    });
  });

  describe('handleStandupTool - action:contributors', () => {
    it('should return contributors', async () => {
      const result = await handleStandupTool(mockClient as any, 'standup', {
        action: 'contributors',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should accept optional period param', async () => {
      const result = await handleStandupTool(mockClient as any, 'standup', {
        action: 'contributors',
        company_slug: 'test-workspace',
        period: 'quarter',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('handleStandupTool - required params', () => {
    it('should require company_slug', async () => {
      const result = await handleStandupTool(mockClient as any, 'standup', { action: 'summary' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('company_slug required');
    });
  });

  describe('handleStandupTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleStandupTool(mockClient as any, 'standup', {
        action: 'unknown',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown');
    });
  });
});
