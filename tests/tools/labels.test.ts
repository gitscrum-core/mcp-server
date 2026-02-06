/**
 * Labels Tools Tests (Consolidated)
 * 
 * Tests for the unified label tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleLabelTool, registerLabelTools } from '../../src/tools/labels.js';

const mockClient = {
  getWorkspaceLabels: async () => [
    { slug: 'bug', title: 'Bug', color: 'ff0000' },
    { slug: 'feature', title: 'Feature', color: '00ff00' },
  ],
  getProjectLabels: async () => [
    { slug: 'bug', title: 'Bug', color: 'ff0000' },
  ],
  createLabel: async () => ({
    slug: 'new-label',
    title: 'New Label',
    color: '0000ff',
  }),
  updateLabel: async () => undefined,
  attachLabelToProject: async () => undefined,
  detachLabelFromProject: async () => undefined,
  toggleLabelOnTask: async () => ({
    added: true,
    label: { slug: 'bug' },
  }),
};

describe('Labels Tools (Consolidated)', () => {
  describe('registerLabelTools', () => {
    it('should export 1 consolidated label tool', () => {
      const labelTools = registerLabelTools();
      expect(labelTools).toBeInstanceOf(Array);
      expect(labelTools.length).toBe(1);
      expect(labelTools[0].name).toBe('label');
    });

    it('label tool should have action enum', () => {
      const labelTools = registerLabelTools();
      const actionProp = labelTools[0].inputSchema.properties?.action as { enum: string[] };
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('create');
      expect(actionProp.enum).toContain('update');
      expect(actionProp.enum).toContain('attach');
      expect(actionProp.enum).toContain('detach');
      expect(actionProp.enum).toContain('toggle');
    });
  });

  describe('handleLabelTool - action:list', () => {
    it('should return workspace labels', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'list',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should return project labels when project_slug provided', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'list',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require company_slug', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'list',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleLabelTool - action:create', () => {
    it('should create label', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'create',
        company_slug: 'test-workspace',
        title: 'New Label',
        color: 'FF5733',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created');
    });

    it('should require title and color', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'create',
        company_slug: 'test-workspace',
        title: 'New Label',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleLabelTool - action:update', () => {
    it('should update label', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'update',
        company_slug: 'test-workspace',
        label_slug: 'bug',
        title: 'Updated Bug',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('updated');
    });

    it('should require label_slug', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'update',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleLabelTool - action:attach', () => {
    it('should attach label', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'attach',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
        label_slug: 'bug',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('attached');
    });

    it('should require project_slug and label_slug', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'attach',
        company_slug: 'test-workspace',
        label_slug: 'bug',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleLabelTool - action:detach', () => {
    it('should detach label', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'detach',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
        label_slug: 'bug',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('detached');
    });

    it('should require project_slug and label_slug', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'detach',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleLabelTool - action:toggle', () => {
    it('should toggle label on task', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'toggle',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
        task_uuid: 'task-1',
        label_slug: 'bug',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('toggled');
    });

    it('should require all params', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'toggle',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
        task_uuid: 'task-1',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleLabelTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleLabelTool(mockClient as any, 'label', {
        action: 'unknown',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleLabelTool - error handling', () => {
    it('should handle errors gracefully', async () => {
      const errorClient = {
        getWorkspaceLabels: async () => { throw new Error('API Error'); },
      };
      
      const result = await handleLabelTool(errorClient as any, 'label', {
        action: 'list',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error');
    });
  });
});
