/**
 * Wiki Tools Tests (Consolidated)
 * 
 * Tests for the unified wiki tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleWikiTool, registerWikiTools } from '../../src/tools/wiki.js';

const mockClient = {
  getWikiPages: async () => [
    { uuid: 'page-1', title: 'Getting Started' },
    { uuid: 'page-2', title: 'API Reference' },
  ],
  getWikiPage: async () => ({
    uuid: 'page-1',
    title: 'Getting Started',
    content: '# Getting Started\n\nWelcome...',
  }),
  createWikiPage: async () => ({
    uuid: 'new-page',
    title: 'New Page',
  }),
  updateWikiPage: async () => ({
    uuid: 'page-1',
    title: 'Updated Page',
  }),
  searchWikiPages: async () => [
    { uuid: 'page-1', title: 'API Documentation', slug: 'api-docs' },
    { uuid: 'page-2', title: 'Setup Guide', slug: 'setup-guide' },
  ],
};

describe('Wiki Tools (Consolidated)', () => {
  describe('registerWikiTools', () => {
    it('should register 1 consolidated wiki tool', () => {
      const tools = registerWikiTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('wiki');
    });

    it('wiki tool should have action enum', () => {
      const tools = registerWikiTools();
      const actionProp = tools[0].inputSchema.properties?.action as { enum: string[] };
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('get');
      expect(actionProp.enum).toContain('create');
      expect(actionProp.enum).toContain('update');
      expect(actionProp.enum).toContain('search');
    });
  });

  describe('handleWikiTool - action:list', () => {
    it('should return pages', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'list',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require project_slug', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'list',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleWikiTool - action:get', () => {
    it('should return page content', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'get',
        uuid: 'page-1',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require uuid', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'get',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleWikiTool - action:create', () => {
    it('should create page', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'create',
        title: 'New Page',
        content: '# New Page\n\nContent here...',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created');
    });

    it('should accept parent_uuid', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'create',
        title: 'Sub Page',
        content: 'Content...',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
        parent_uuid: 'page-1',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require all params', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'create',
        title: 'New Page',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleWikiTool - action:update', () => {
    it('should update page', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'update',
        uuid: 'page-1',
        title: 'Updated Title',
        content: 'Updated content',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('updated');
    });

    it('should require uuid', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'update',
        title: 'Updated',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleWikiTool - required params', () => {
    it('should require company_slug', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', { action: 'list' });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleWikiTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'unknown',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleWikiTool - action:search', () => {
    it('should search wiki pages', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'search',
        q: 'API',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require q param for search', async () => {
      const result = await handleWikiTool(mockClient as any, 'wiki', {
        action: 'search',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('q');
    });
  });
});
