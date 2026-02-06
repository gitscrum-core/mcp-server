/**
 * Search Tools Tests
 */

import { describe, it, expect } from 'vitest';
import { handleSearchTool, registerSearchTools } from '../../src/tools/search.js';

const mockClient = {
  search: async () => ({
    tasks: { items: [{ title: 'Found Task', path: '/workspace/project' }], total: '1' },
    projects: { items: [{ title: 'Found Project', path: '/workspace' }], total: '1' },
    user_stories: { items: [], total: '0' },
    wiki_pages: { items: [], total: '0' },
  }),
};

describe('Search Tools', () => {
  describe('registerSearchTools', () => {
    it('should register search tool', () => {
      const tools = registerSearchTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('search');
    });
  });

  describe('handleSearchTool', () => {
    it('search should return results', async () => {
      const result = await handleSearchTool(mockClient as any, 'search', {
        query: 'test query',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Found Task');
    });

    it('search should require query with min 2 chars', async () => {
      const result = await handleSearchTool(mockClient as any, 'search', {
        query: 'a',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('query');
    });

    it('search should require query', async () => {
      const result = await handleSearchTool(mockClient as any, 'search', {});
      
      expect(result.isError).toBe(true);
    });

    it('search should accept optional params', async () => {
      const result = await handleSearchTool(mockClient as any, 'search', {
        query: 'test',
        company_slug: 'workspace',
        categories: 'tasks,projects',
        limit: 10,
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should return error for missing query on unknown tool name', async () => {
      const result = await handleSearchTool(mockClient as any, 'unknown_tool', {});
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('query');
    });
  });
});
