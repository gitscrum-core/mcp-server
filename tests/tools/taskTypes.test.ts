/**
 * Task Types Tools Tests (Consolidated)
 * 
 * Tests for the unified task_type tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleTaskTypeTool, registerTaskTypeTools } from '../../src/tools/taskTypes.js';

const mockClient = {
  getProjectTypes: async () => [
    { id: 1, title: 'Bug', color: 'ff0000' },
    { id: 2, title: 'Feature', color: '00ff00' },
  ],
  createTaskType: async () => ({
    id: 3,
    title: 'New Type',
    color: '0000ff',
  }),
  updateTaskType: async () => undefined,
  assignTypeToTask: async () => ({
    uuid: 'task-1',
    type: { id: 1, title: 'Bug' },
  }),
};

describe('Task Types Tools (Consolidated)', () => {
  describe('registerTaskTypeTools', () => {
    it('should export 1 consolidated task_type tool', () => {
      const taskTypeTools = registerTaskTypeTools();
      expect(taskTypeTools).toBeInstanceOf(Array);
      expect(taskTypeTools.length).toBe(1);
      expect(taskTypeTools[0].name).toBe('task_type');
    });

    it('task_type tool should have action enum', () => {
      const taskTypeTools = registerTaskTypeTools();
      const actionProp = taskTypeTools[0].inputSchema.properties?.action as { enum: string[] };
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('create');
      expect(actionProp.enum).toContain('update');
      expect(actionProp.enum).toContain('assign');
    });
  });

  describe('handleTaskTypeTool - action:list', () => {
    it('should return types', async () => {
      const result = await handleTaskTypeTool(mockClient as any, 'task_type', {
        action: 'list',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require company_slug and project_slug', async () => {
      const result = await handleTaskTypeTool(mockClient as any, 'task_type', {
        action: 'list',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleTaskTypeTool - action:create', () => {
    it('should create type', async () => {
      const result = await handleTaskTypeTool(mockClient as any, 'task_type', {
        action: 'create',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
        title: 'New Type',
        color: 'FF5733',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created');
    });

    it('should require title and color', async () => {
      const result = await handleTaskTypeTool(mockClient as any, 'task_type', {
        action: 'create',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
        title: 'New Type',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleTaskTypeTool - action:update', () => {
    it('should update type', async () => {
      const result = await handleTaskTypeTool(mockClient as any, 'task_type', {
        action: 'update',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
        type_id: 1,
        title: 'Updated Type',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('updated');
    });

    it('should require type_id', async () => {
      const result = await handleTaskTypeTool(mockClient as any, 'task_type', {
        action: 'update',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleTaskTypeTool - action:assign', () => {
    it('should assign type to task', async () => {
      const result = await handleTaskTypeTool(mockClient as any, 'task_type', {
        action: 'assign',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
        task_uuid: 'task-1',
        type_id: 1,
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('assigned');
    });

    it('should require task_uuid and type_id', async () => {
      const result = await handleTaskTypeTool(mockClient as any, 'task_type', {
        action: 'assign',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
        task_uuid: 'task-1',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleTaskTypeTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleTaskTypeTool(mockClient as any, 'task_type', {
        action: 'unknown',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleTaskTypeTool - error handling', () => {
    it('should handle errors gracefully', async () => {
      const errorClient = {
        getProjectTypes: async () => { throw new Error('API Error'); },
      };
      
      const result = await handleTaskTypeTool(errorClient as any, 'task_type', {
        action: 'list',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error');
    });
  });
});
