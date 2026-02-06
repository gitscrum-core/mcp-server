/**
 * Epics Tools Tests (Consolidated)
 * 
 * Tests for the unified epic tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleEpicTool, registerEpicTools } from '../../src/tools/epics.js';

const mockClient = {
  getEpics: async () => [
    { uuid: 'epic-1', title: 'User Authentication', color: 'FF5733' },
    { uuid: 'epic-2', title: 'Payment System', color: '00FF00' },
  ],
  createEpic: async () => ({
    uuid: 'new-epic',
    title: 'New Epic',
    color: '0000FF',
  }),
  updateEpic: async () => undefined,
};

describe('Epics Tools (Consolidated)', () => {
  describe('registerEpicTools', () => {
    it('should register 1 consolidated epic tool', () => {
      const tools = registerEpicTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('epic');
    });

    it('epic tool should have action enum', () => {
      const tools = registerEpicTools();
      const actionProp = tools[0].inputSchema.properties?.action as { enum: string[] };
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('create');
      expect(actionProp.enum).toContain('update');
    });
  });

  describe('handleEpicTool - action:list', () => {
    it('should return epics', async () => {
      const result = await handleEpicTool(mockClient as any, 'epic', {
        action: 'list',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require project_slug and company_slug', async () => {
      const result = await handleEpicTool(mockClient as any, 'epic', { action: 'list' });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleEpicTool - action:create', () => {
    it('should create epic', async () => {
      const result = await handleEpicTool(mockClient as any, 'epic', {
        action: 'create',
        title: 'New Epic',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created');
    });

    it('should accept optional params', async () => {
      const result = await handleEpicTool(mockClient as any, 'epic', {
        action: 'create',
        title: 'New Epic',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
        description: 'Epic description',
        color: '#FF5733',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require title', async () => {
      const result = await handleEpicTool(mockClient as any, 'epic', {
        action: 'create',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleEpicTool - action:update', () => {
    it('should update epic', async () => {
      const result = await handleEpicTool(mockClient as any, 'epic', {
        action: 'update',
        epic_uuid: 'epic-1',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
        title: 'Updated Title',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('updated');
    });

    it('should require epic_uuid', async () => {
      const result = await handleEpicTool(mockClient as any, 'epic', {
        action: 'update',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleEpicTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleEpicTool(mockClient as any, 'epic', {
        action: 'unknown',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
    });
  });
});
