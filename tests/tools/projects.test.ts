/**
 * Projects Tools Tests (Consolidated)
 * 
 * Tests for the unified workspace and project tools with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleProjectTool, registerProjectTools } from '../../src/tools/projects.js';

const mockClient = {
  getWorkspaces: async () => [
    { slug: 'workspace-1', name: 'Workspace 1' }
  ],
  getWorkspace: async () => ({
    slug: 'workspace-1',
    name: 'Workspace Details',
  }),
  getProjects: async () => [
    { slug: 'project-1', name: 'Project 1' }
  ],
  getProject: async () => ({
    slug: 'project-1',
    name: 'Project Details',
    description: 'Description',
  }),
  getProjectStats: async () => ({
    open_tasks: 10,
    in_progress: 5,
    completed: 15,
  }),
  getProjectTasks: async () => [
    { uuid: 'task-1', title: 'Task 1', status: 'open' }
  ],
  getProjectWorkflows: async () => [
    { id: 1, title: 'To Do', position: 1 }
  ],
  getProjectTypes: async () => [
    { id: 1, title: 'Task', icon: 'task' }
  ],
  getProjectEfforts: async () => [
    { id: 1, title: 'Low', value: 1 }
  ],
  getProjectLabels: async () => [
    { slug: 'bug', title: 'Bug', color: '#ff0000' }
  ],
  getProjectMembers: async () => [
    { username: 'johndoe', name: 'John Doe', email: 'john@example.com' }
  ],
};

describe('Projects Tools (Consolidated)', () => {
  describe('registerProjectTools', () => {
    it('should register workspace and project tools', () => {
      const tools = registerProjectTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(2);
      
      const names = tools.map(t => t.name);
      expect(names).toContain('workspace');
      expect(names).toContain('project');
    });

    it('workspace tool should have action enum', () => {
      const tools = registerProjectTools();
      const workspaceTool = tools.find(t => t.name === 'workspace')!;
      const actionProp = workspaceTool.inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('get');
    });

    it('project tool should have action enum with all operations', () => {
      const tools = registerProjectTools();
      const projectTool = tools.find(t => t.name === 'project')!;
      const actionProp = projectTool.inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('get');
      expect(actionProp.enum).toContain('stats');
      expect(actionProp.enum).toContain('tasks');
      expect(actionProp.enum).toContain('workflows');
      expect(actionProp.enum).toContain('types');
      expect(actionProp.enum).toContain('efforts');
      expect(actionProp.enum).toContain('labels');
      expect(actionProp.enum).toContain('members');
    });
  });

  describe('workspace tool', () => {
    it('action:list should return workspaces', async () => {
      const result = await handleProjectTool(mockClient as any, 'workspace', { action: 'list' });
      
      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('action:get should return workspace details', async () => {
      const result = await handleProjectTool(mockClient as any, 'workspace', {
        action: 'get',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Workspace');
    });

    it('action:get should require company_slug', async () => {
      const result = await handleProjectTool(mockClient as any, 'workspace', { action: 'get' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('company_slug required');
    });
  });

  describe('project tool', () => {
    it('action:list should return projects', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', {
        action: 'list',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const text = result.content[0].text.split('\n---context')[0].trim();
      const parsed = JSON.parse(text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('action:list should require company_slug', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', { action: 'list' });
      
      expect(result.isError).toBe(true);
    });

    it('action:get should return project details', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', {
        action: 'get',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Project');
    });

    it('action:get should require project_slug', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', {
        action: 'get',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('project_slug');
    });

    it('action:stats should return stats', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', {
        action: 'stats',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const text = result.content[0].text.split('\n---context')[0].trim();
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty('open_tasks');
    });

    it('action:tasks should return tasks', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', {
        action: 'tasks',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('action:workflows should return workflows', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', {
        action: 'workflows',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const text = result.content[0].text.split('\n---context')[0].trim();
      const parsed = JSON.parse(text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('action:types should return types', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', {
        action: 'types',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const text = result.content[0].text.split('\n---context')[0].trim();
      const parsed = JSON.parse(text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('action:efforts should return efforts', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', {
        action: 'efforts',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const text = result.content[0].text.split('\n---context')[0].trim();
      const parsed = JSON.parse(text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('action:labels should return labels', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', {
        action: 'labels',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const text = result.content[0].text.split('\n---context')[0].trim();
      const parsed = JSON.parse(text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('action:members should return members', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', {
        action: 'members',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const text = result.content[0].text.split('\n---context')[0].trim();
      const parsed = JSON.parse(text);
      expect(Array.isArray(parsed)).toBe(true);
    });
  });

  describe('unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleProjectTool(mockClient as any, 'project', {
        action: 'unknown',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });
  });
});
