/**
 * Comments Tools Tests (Consolidated)
 * 
 * Tests for the unified comment tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleCommentTool, registerCommentTools } from '../../src/tools/comments.js';

const mockClient = {
  getTaskComments: async () => [
    { id: 1, text: 'First comment', author: 'John' },
    { id: 2, text: 'Second comment', author: 'Jane' },
  ],
  addTaskComment: async () => ({
    id: 3,
    text: 'New comment',
    author: 'Test User',
  }),
  updateComment: async () => undefined,
};

describe('Comments Tools (Consolidated)', () => {
  describe('registerCommentTools', () => {
    it('should register 1 consolidated comment tool', () => {
      const tools = registerCommentTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('comment');
    });

    it('comment tool should have action enum', () => {
      const tools = registerCommentTools();
      const actionProp = tools[0].inputSchema.properties?.action as { enum: string[] };
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('add');
      expect(actionProp.enum).toContain('update');
    });
  });

  describe('handleCommentTool - action:list', () => {
    it('should return comments', async () => {
      const result = await handleCommentTool(mockClient as any, 'comment', {
        action: 'list',
        task_uuid: 'task-1',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require all params', async () => {
      const result = await handleCommentTool(mockClient as any, 'comment', {
        action: 'list',
        task_uuid: 'task-1',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleCommentTool - action:add', () => {
    it('should add comment', async () => {
      const result = await handleCommentTool(mockClient as any, 'comment', {
        action: 'add',
        task_uuid: 'task-1',
        text: 'New comment',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('added');
    });

    it('should require all params', async () => {
      const result = await handleCommentTool(mockClient as any, 'comment', {
        action: 'add',
        task_uuid: 'task-1',
        text: 'New comment',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleCommentTool - action:update', () => {
    it('should update comment', async () => {
      const result = await handleCommentTool(mockClient as any, 'comment', {
        action: 'update',
        comment_id: 1,
        text: 'Updated comment',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('updated');
    });

    it('should require comment_id and text', async () => {
      const result = await handleCommentTool(mockClient as any, 'comment', {
        action: 'update',
        comment_id: 1,
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleCommentTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleCommentTool(mockClient as any, 'comment', {
        action: 'unknown',
      });
      
      expect(result.isError).toBe(true);
    });
  });
});
