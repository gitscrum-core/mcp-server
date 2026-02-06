/**
 * Workflows Tools Tests (Consolidated)
 * 
 * Tests for the unified workflow tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleWorkflowTool, registerWorkflowTools } from '../../src/tools/workflows.js';

const mockClient = {
  createWorkflow: async () => ({
    id: 1,
    title: 'New Column',
    color: '58A6FF',
    status: 0,
  }),
  updateWorkflow: async () => undefined,
};

describe('Workflows Tools (Consolidated)', () => {
  describe('registerWorkflowTools', () => {
    it('should register the consolidated workflow tool', () => {
      const tools = registerWorkflowTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('workflow');
    });

    it('workflow tool should have action enum with all operations', () => {
      const tools = registerWorkflowTools();
      const workflowTool = tools[0];
      const actionProp = workflowTool.inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('create');
      expect(actionProp.enum).toContain('update');
    });
  });

  describe('handleWorkflowTool - action:create', () => {
    it('should create column', async () => {
      const result = await handleWorkflowTool(mockClient as any, 'workflow', {
        action: 'create',
        title: 'In Review',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created');
    });

    it('should accept optional params', async () => {
      const result = await handleWorkflowTool(mockClient as any, 'workflow', {
        action: 'create',
        title: 'Done',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
        color: '#238636',
        status: 'done',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should accept status as in progress', async () => {
      const result = await handleWorkflowTool(mockClient as any, 'workflow', {
        action: 'create',
        title: 'Doing',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
        status: 'in progress',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require title', async () => {
      const result = await handleWorkflowTool(mockClient as any, 'workflow', {
        action: 'create',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('title');
    });
  });

  describe('handleWorkflowTool - action:update', () => {
    it('should update column', async () => {
      const result = await handleWorkflowTool(mockClient as any, 'workflow', {
        action: 'update',
        workflow_id: 1,
        project_slug: 'test-project',
        company_slug: 'test-workspace',
        title: 'Updated Column',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('updated');
    });

    it('should accept all optional params', async () => {
      const result = await handleWorkflowTool(mockClient as any, 'workflow', {
        action: 'update',
        workflow_id: 1,
        project_slug: 'test-project',
        company_slug: 'test-workspace',
        title: 'Updated',
        color: '#FF5733',
        status: 'done',
        position: 3,
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require workflow_id', async () => {
      const result = await handleWorkflowTool(mockClient as any, 'workflow', {
        action: 'update',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('workflow_id');
    });
  });

  describe('handleWorkflowTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleWorkflowTool(mockClient as any, 'workflow', { action: 'unknown' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });

    it('should require action parameter', async () => {
      const result = await handleWorkflowTool(mockClient as any, 'workflow', {});
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });
  });
});
