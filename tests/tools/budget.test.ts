/**
 * Budget Tools Tests
 * 
 * Tests for the unified budget tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleBudgetTool, registerBudgetTools } from '../../src/tools/budget.js';

const mockClient = {
  getBudgetProjectsAtRisk: async () => [
    { project: 'API v2', budget: 50000, consumed: 48000, percent: 96, status: 'at_risk' },
  ],
  getBudgetOverview: async () => ({
    total_budget: 50000,
    consumed: 35000,
    remaining: 15000,
    percent_consumed: 70,
  }),
  getBudgetConsumption: async () => ({
    total_hours: 350,
    total_cost: 35000,
    by_member: [{ user: 'john', hours: 200, cost: 20000 }],
  }),
  getBudgetBurnDown: async () => ({
    data: [
      { date: '2026-01-01', remaining: 50000 },
      { date: '2026-01-15', remaining: 35000 },
    ],
  }),
  getBudgetAlerts: async () => [
    { type: 'warning', message: 'Budget 70% consumed', threshold: 70 },
  ],
  getBudgetEvents: async () => [
    { type: 'budget_set', amount: 50000, date: '2026-01-01' },
  ],
};

describe('Budget Tools', () => {
  describe('registerBudgetTools', () => {
    it('should register 1 consolidated budget tool', () => {
      const tools = registerBudgetTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('budget');
    });

    it('budget tool should have action enum with all operations', () => {
      const tools = registerBudgetTools();
      const actionProp = tools[0].inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('projects_at_risk');
      expect(actionProp.enum).toContain('overview');
      expect(actionProp.enum).toContain('consumption');
      expect(actionProp.enum).toContain('burn_down');
      expect(actionProp.enum).toContain('alerts');
      expect(actionProp.enum).toContain('events');
    });
  });

  describe('handleBudgetTool - action:projects_at_risk', () => {
    it('should return projects at risk', async () => {
      const result = await handleBudgetTool(mockClient as any, 'budget', {
        action: 'projects_at_risk',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require company_slug', async () => {
      const result = await handleBudgetTool(mockClient as any, 'budget', {
        action: 'projects_at_risk',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('company_slug');
    });
  });

  describe('handleBudgetTool - action:overview', () => {
    it('should return budget overview', async () => {
      const result = await handleBudgetTool(mockClient as any, 'budget', {
        action: 'overview',
        project_uuid: 'proj-uuid-1',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text.split('---context')[0]);
      expect(data).toHaveProperty('total_budget');
    });

    it('should require project_uuid', async () => {
      const result = await handleBudgetTool(mockClient as any, 'budget', {
        action: 'overview',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('project_uuid');
    });
  });

  describe('handleBudgetTool - action:consumption', () => {
    it('should return consumption data', async () => {
      const result = await handleBudgetTool(mockClient as any, 'budget', {
        action: 'consumption',
        project_uuid: 'proj-uuid-1',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require project_uuid', async () => {
      const result = await handleBudgetTool(mockClient as any, 'budget', {
        action: 'consumption',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleBudgetTool - action:burn_down', () => {
    it('should return burn down data', async () => {
      const result = await handleBudgetTool(mockClient as any, 'budget', {
        action: 'burn_down',
        project_uuid: 'proj-uuid-1',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require project_uuid', async () => {
      const result = await handleBudgetTool(mockClient as any, 'budget', {
        action: 'burn_down',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleBudgetTool - action:alerts', () => {
    it('should return budget alerts', async () => {
      const result = await handleBudgetTool(mockClient as any, 'budget', {
        action: 'alerts',
        project_uuid: 'proj-uuid-1',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleBudgetTool - action:events', () => {
    it('should return budget events', async () => {
      const result = await handleBudgetTool(mockClient as any, 'budget', {
        action: 'events',
        project_uuid: 'proj-uuid-1',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleBudgetTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleBudgetTool(mockClient as any, 'budget', {
        action: 'unknown',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });
  });
});
