/**
 * Sprints Tools Tests (Consolidated)
 * 
 * Tests for the unified sprint tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleSprintTool, registerSprintTools } from '../../src/tools/sprints.js';

const mockClient = {
  getSprints: async () => [
    { slug: 'sprint-1', name: 'Sprint 1', status: 'active' }
  ],
  getAllSprints: async () => [
    { slug: 'sprint-1', name: 'Sprint 1' },
    { slug: 'sprint-2', name: 'Sprint 2' },
  ],
  getSprint: async () => ({
    slug: 'sprint-1',
    name: 'Sprint Details',
    start_date: '2024-01-01',
    end_date: '2024-01-14',
    progress: 50,
  }),
  getSprintKPIs: async () => ({
    velocity: 42,
    completion_rate: 85,
    avg_cycle_time: 3,
    burndown_status: 'On track',
  }),
  createSprint: async () => ({
    slug: 'new-sprint',
    title: 'New Sprint',
    date_start: '2026-02-06',
    date_finish: '2026-02-13',
  }),
  updateSprint: async () => undefined,
  getSprintStats: async () => ({
    slug: 'sprint-1',
    total_tasks: 20,
    completed_tasks: 15,
    completion_rate: 75,
  }),
  getSprintReports: async () => ({
    burndown: [{ day: 'Mon', remaining: 20 }],
    performance: { velocity: 15 },
  }),
  getSprintProgress: async () => ({
    slug: 'sprint-1',
    total: 20,
    completed: 15,
    percent: 75,
  }),
  getSprintMetrics: async () => ({
    velocity: 15,
    scope_change: 2,
    burndown_health: 'on_track',
  }),
};

describe('Sprints Tools (Consolidated)', () => {
  describe('registerSprintTools', () => {
    it('should register the consolidated sprint tool', () => {
      const tools = registerSprintTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('sprint');
    });

    it('sprint tool should have action enum with all operations', () => {
      const tools = registerSprintTools();
      const sprintTool = tools[0];
      const actionProp = sprintTool.inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('all');
      expect(actionProp.enum).toContain('get');
      expect(actionProp.enum).toContain('kpis');
      expect(actionProp.enum).toContain('create');
      expect(actionProp.enum).toContain('update');
      expect(actionProp.enum).toContain('stats');
      expect(actionProp.enum).toContain('reports');
      expect(actionProp.enum).toContain('progress');
      expect(actionProp.enum).toContain('metrics');
    });

    it('sprint tool should have mutation annotations', () => {
      const tools = registerSprintTools();
      const annotations = tools[0].annotations as Record<string, unknown>;
      expect(annotations.readOnlyHint).toBe(false);
      expect(annotations.idempotentHint).toBe(false);
    });
  });

  describe('handleSprintTool - action:list', () => {
    it('should return sprints when project_slug and company_slug provided', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'list',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text.split('---context')[0]);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should require project_slug and company_slug', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', { action: 'list' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('project_slug');
    });
  });

  describe('handleSprintTool - action:all', () => {
    it('should return all active sprints', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', { action: 'all' });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('handleSprintTool - action:get', () => {
    it('should return sprint details when slug and company_slug provided', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'get',
        slug: 'sprint-1',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require slug and company_slug', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', { action: 'get' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('slug');
    });
  });

  describe('handleSprintTool - action:kpis', () => {
    it('should return sprint KPIs when slug and company_slug provided', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'kpis',
        slug: 'sprint-1',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text.split('---context')[0]);
      expect(data).toHaveProperty('velocity');
    });

    it('should require slug and company_slug', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', { action: 'kpis' });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleSprintTool - action:create', () => {
    it('should create a sprint with title', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'create',
        title: 'New Sprint',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created');
      expect(result.content[0].text).toContain('new-sprint');
    });

    it('should create a sprint with all optional fields', async () => {
      let capturedData: any;
      const client = {
        ...mockClient,
        createSprint: async (_p: any, _c: any, data: any) => {
          capturedData = data;
          return { slug: 'my-sprint', title: data.title };
        },
      };
      await handleSprintTool(client as any, 'sprint', {
        action: 'create',
        title: 'My Sprint',
        description: 'Sprint desc',
        date_start: '2026-02-10',
        date_finish: '2026-02-24',
        color: 'blue',
        is_private: true,
        close_on_finish: true,
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(capturedData.title).toBe('My Sprint');
      expect(capturedData.description).toBe('Sprint desc');
      expect(capturedData.date_start).toBe('2026-02-10');
      expect(capturedData.date_finish).toBe('2026-02-24');
      expect(capturedData.color).toBe('58A6FF'); // normalizeColor('blue')
      expect(capturedData.is_private).toBe(true);
      expect(capturedData.close_on_finish).toBe(true);
    });

    it('should require title', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'create',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('title');
    });

    it('should require project context', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'create',
        title: 'Sprint',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('handleSprintTool - action:update', () => {
    it('should update a sprint', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'update',
        slug: 'sprint-1',
        title: 'Updated Sprint',
        date_finish: '2026-03-01',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('updated');
    });

    it('should pass update data to client', async () => {
      let capturedData: any;
      const client = {
        ...mockClient,
        updateSprint: async (_slug: any, _p: any, _c: any, data: any) => {
          capturedData = data;
        },
      };
      await handleSprintTool(client as any, 'sprint', {
        action: 'update',
        slug: 'sprint-1',
        date_finish: '2026-03-15',
        color: 'red',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(capturedData.date_finish).toBe('2026-03-15');
      expect(capturedData.color).toBe('F85149'); // normalizeColor('red')
    });

    it('should require slug', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'update',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('slug');
    });

    it('should require project context', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'update',
        slug: 'sprint-1',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('handleSprintTool - action:stats', () => {
    it('should return sprint stats when slug and project context provided', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'stats',
        slug: 'sprint-1',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text.split('---context')[0]);
      expect(data).toHaveProperty('total_tasks');
    });

    it('should require slug for stats', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'stats',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('handleSprintTool - action:reports', () => {
    it('should return sprint reports', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'reports',
        slug: 'sprint-1',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require slug for reports', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'reports',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('handleSprintTool - action:progress', () => {
    it('should return sprint progress', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'progress',
        slug: 'sprint-1',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text.split('---context')[0]);
      expect(data).toHaveProperty('percent');
    });

    it('should require slug for progress', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'progress',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('handleSprintTool - action:metrics', () => {
    it('should return sprint metrics', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'metrics',
        slug: 'sprint-1',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text.split('---context')[0]);
      expect(data).toHaveProperty('velocity');
    });

    it('should require slug for metrics', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', {
        action: 'metrics',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('handleSprintTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleSprintTool(mockClient as any, 'sprint', { action: 'unknown' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });
  });
});
