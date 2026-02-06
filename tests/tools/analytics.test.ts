/**
 * Analytics Tools Tests (Consolidated)
 * 
 * Tests for the unified analytics tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleAnalyticsTool, registerAnalyticsTools } from '../../src/tools/analytics.js';

const mockClient = {
  getManagerPulse: async () => ({
    active_projects: 10,
    tasks_in_progress: 45,
    team_utilization: 0.85,
  }),
  getManagerRisks: async () => [
    { type: 'overdue', count: 5, severity: 'high' }
  ],
  getReportsCumulativeFlow: async () => ({
    dates: ['2024-01-01', '2024-01-02'],
    todo: [10, 8],
    in_progress: [5, 7],
    done: [15, 18],
  }),
  getReportsProjectAge: async () => [
    { project: 'Project A', age_days: 30, completion: 0.6 }
  ],
  getReportsWeeklyActivity: async () => ({
    weeks: ['W1', 'W2', 'W3'],
    created: [10, 15, 12],
    completed: [8, 12, 14],
  }),
  getManagerOverview: async () => ({
    kpis: { total_projects: 5, active_projects: 3 },
    velocity_chart: [],
  }),
  getManagerHealth: async () => ({
    summary: { total_overdue: 5, avg_health_score: 72 },
    project_health: [],
  }),
  getManagerBlockers: async () => ({
    summary: { blocked_count: 2, unassigned_count: 5 },
    blockers: [],
  }),
  getManagerCommandCenter: async () => ({
    stats: { total_open: 40, total_overdue: 5 },
    workload: [],
  }),
  getManagerTimeEntries: async () => ({
    entries: [],
    summary: { total_hours: '12.5' },
  }),
};

describe('Analytics Tools (Consolidated)', () => {
  describe('registerAnalyticsTools', () => {
    it('should register 1 consolidated analytics tool', () => {
      const tools = registerAnalyticsTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('analytics');
    });

    it('analytics tool should have report enum', () => {
      const tools = registerAnalyticsTools();
      const reportProp = tools[0].inputSchema.properties?.report as { enum: string[] };
      expect(reportProp.enum).toContain('pulse');
      expect(reportProp.enum).toContain('risks');
      expect(reportProp.enum).toContain('flow');
      expect(reportProp.enum).toContain('overview');
      expect(reportProp.enum).toContain('health');
      expect(reportProp.enum).toContain('blockers');
      expect(reportProp.enum).toContain('command_center');
      expect(reportProp.enum).toContain('time_entries');
    });
  });

  describe('handleAnalyticsTool - report:pulse', () => {
    it('should return pulse data', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', {
        report: 'pulse',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('active_projects');
    });
  });

  describe('handleAnalyticsTool - report:risks', () => {
    it('should return risks', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', {
        report: 'risks',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
    });
  });

  describe('handleAnalyticsTool - report:flow', () => {
    it('should return flow data', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', {
        report: 'flow',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('dates');
    });
  });

  describe('handleAnalyticsTool - report:age', () => {
    it('should return age data', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', {
        report: 'age',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleAnalyticsTool - report:activity', () => {
    it('should return activity data', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', {
        report: 'activity',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleAnalyticsTool - required params', () => {
    it('should require company_slug', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', { report: 'pulse' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('company_slug');
    });
  });

  describe('handleAnalyticsTool - unknown report', () => {
    it('should return error for unknown report', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', {
        report: 'unknown',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown');
    });
  });

  describe('handleAnalyticsTool - report:overview', () => {
    it('should return manager overview', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', {
        report: 'overview',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text.split('---context')[0]);
      expect(parsed).toHaveProperty('kpis');
    });
  });

  describe('handleAnalyticsTool - report:health', () => {
    it('should return health data', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', {
        report: 'health',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleAnalyticsTool - report:blockers', () => {
    it('should return blockers data', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', {
        report: 'blockers',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleAnalyticsTool - report:command_center', () => {
    it('should return command center data', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', {
        report: 'command_center',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleAnalyticsTool - report:time_entries', () => {
    it('should return time entries', async () => {
      const result = await handleAnalyticsTool(mockClient as any, 'analytics', {
        report: 'time_entries',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });
});
