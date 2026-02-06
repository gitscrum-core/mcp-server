/**
 * Tool Registration Tests
 * 
 * Tests to verify all tools are correctly registered after consolidation
 */

import { describe, it, expect } from 'vitest';
import { registerClientFlowTools } from '../../src/tools/clientflow.js';
import { registerTaskTools } from '../../src/tools/tasks.js';
import { registerSprintTools } from '../../src/tools/sprints.js';
import { registerUserStoryTools } from '../../src/tools/userStories.js';
import { registerProjectTools } from '../../src/tools/projects.js';
import { registerStandupTools } from '../../src/tools/standup.js';
import { registerTimeTrackingTools } from '../../src/tools/timeTracking.js';
import { registerDiscussionTools } from '../../src/tools/discussions.js';
import { registerActivityTools } from '../../src/tools/activity.js';
import { registerBudgetTools } from '../../src/tools/budget.js';

describe('Tool Registration (Consolidated)', () => {
  describe('Task Tools', () => {
    it('should register 1 consolidated task tool', () => {
      const tools = registerTaskTools();
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('task');
    });

    it('task tool should have action enum', () => {
      const tools = registerTaskTools();
      const actionProp = tools[0].inputSchema.properties?.action as { enum: string[] };
      expect(actionProp.enum).toContain('my');
      expect(actionProp.enum).toContain('create');
    });
  });

  describe('Sprint Tools', () => {
    it('should register 1 consolidated sprint tool', () => {
      const tools = registerSprintTools();
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('sprint');
    });
  });

  describe('User Story Tools', () => {
    it('should register 1 consolidated user_story tool', () => {
      const tools = registerUserStoryTools();
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('user_story');
    });
  });

  describe('Project Tools', () => {
    it('should register 2 tools: workspace and project', () => {
      const tools = registerProjectTools();
      expect(tools.length).toBe(2);
      const names = tools.map(t => t.name);
      expect(names).toContain('workspace');
      expect(names).toContain('project');
    });
  });

  describe('Standup Tools', () => {
    it('should register 1 consolidated standup tool', () => {
      const tools = registerStandupTools();
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('standup');
    });
  });

  describe('Time Tracking Tools', () => {
    it('should register 1 consolidated time tool', () => {
      const tools = registerTimeTrackingTools();
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('time');
    });
  });

  describe('ClientFlow Tools', () => {
    it('should register 5 consolidated ClientFlow tools', () => {
      const tools = registerClientFlowTools();
      
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(5);
      
      const names = tools.map(t => t.name);
      expect(names).toContain('clientflow_cross_workspace');
      expect(names).toContain('client');
      expect(names).toContain('invoice');
      expect(names).toContain('proposal');
      expect(names).toContain('clientflow_dashboard');
    });

    it('client tool should have correct action enum', () => {
      const tools = registerClientFlowTools();
      const clientTool = tools.find(t => t.name === 'client')!;
      const actionProp = clientTool.inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('get');
      expect(actionProp.enum).toContain('stats');
      expect(actionProp.enum).toContain('create');
      expect(actionProp.enum).toContain('update');
    });

    it('invoice tool should have correct action enum', () => {
      const tools = registerClientFlowTools();
      const invoiceTool = tools.find(t => t.name === 'invoice')!;
      const actionProp = invoiceTool.inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('get');
      expect(actionProp.enum).toContain('stats');
      expect(actionProp.enum).toContain('create');
      expect(actionProp.enum).toContain('update');
      expect(actionProp.enum).toContain('issue');
      expect(actionProp.enum).toContain('send');
      expect(actionProp.enum).toContain('mark_paid');
    });

    it('proposal tool should have correct action enum', () => {
      const tools = registerClientFlowTools();
      const proposalTool = tools.find(t => t.name === 'proposal')!;
      const actionProp = proposalTool.inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('get');
      expect(actionProp.enum).toContain('stats');
      expect(actionProp.enum).toContain('create');
      expect(actionProp.enum).toContain('send');
      expect(actionProp.enum).toContain('approve');
      expect(actionProp.enum).toContain('reject');
      expect(actionProp.enum).toContain('convert');
    });

    it('clientflow_dashboard tool should have correct report enum', () => {
      const tools = registerClientFlowTools();
      const dashboardTool = tools.find(t => t.name === 'clientflow_dashboard')!;
      const reportProp = dashboardTool.inputSchema.properties?.report as { enum: string[] };
      
      expect(reportProp.enum).toContain('overview');
      expect(reportProp.enum).toContain('revenue');
      expect(reportProp.enum).toContain('at_risk');
      expect(reportProp.enum).toContain('pending');
      expect(reportProp.enum).toContain('health');
      expect(reportProp.enum).toContain('insights');
      expect(reportProp.enum).toContain('leaderboard');
      expect(reportProp.enum).toContain('analytics');
    });

    it('all tools should have valid input schemas', () => {
      const tools = registerClientFlowTools();
      
      for (const tool of tools) {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
      }
    });

    it('all tools should have descriptions', () => {
      const tools = registerClientFlowTools();
      
      for (const tool of tools) {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(10);
      }
    });

    it('workspace-scoped tools should require company_slug', () => {
      const tools = registerClientFlowTools();
      const workspaceTools = tools.filter(t => t.name !== 'clientflow_cross_workspace');
      
      for (const tool of workspaceTools) {
        expect(tool.inputSchema.required).toContain('company_slug');
      }
    });

    it('cross-workspace tool should require report (not company_slug)', () => {
      const tools = registerClientFlowTools();
      const crossTool = tools.find(t => t.name === 'clientflow_cross_workspace')!;
      
      expect(crossTool.inputSchema.required).toContain('report');
      expect(crossTool.inputSchema.required).not.toContain('company_slug');
    });
  });

  describe('Discussion Tools', () => {
    it('should register 1 consolidated discussion tool', () => {
      const tools = registerDiscussionTools();
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('discussion');
    });

    it('discussion tool should have action enum with all operations', () => {
      const tools = registerDiscussionTools();
      const actionProp = tools[0].inputSchema.properties?.action as { enum: string[] };
      expect(actionProp.enum).toContain('all');
      expect(actionProp.enum).toContain('channels');
      expect(actionProp.enum).toContain('channel');
      expect(actionProp.enum).toContain('messages');
      expect(actionProp.enum).toContain('send');
      expect(actionProp.enum).toContain('search');
      expect(actionProp.enum).toContain('unread');
      expect(actionProp.enum).toContain('mark_read');
      expect(actionProp.enum).toContain('create_channel');
      expect(actionProp.enum).toContain('update_channel');
    });
  });

  describe('Activity Tools', () => {
    it('should register 1 consolidated activity tool', () => {
      const tools = registerActivityTools();
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

  describe('Budget Tools', () => {
    it('should register 1 consolidated budget tool', () => {
      const tools = registerBudgetTools();
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
});
