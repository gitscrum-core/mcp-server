/**
 * User Stories Tools Tests (Consolidated)
 * 
 * Tests for the unified user_story tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleUserStoryTool, registerUserStoryTools } from '../../src/tools/userStories.js';

const mockClient = {
  findProjectByName: async () => null, // Returns null to force error path in tests
  getUserStories: async () => [
    { uuid: 'story-1', slug: 'story-1', title: 'As a user, I want...' },
    { uuid: 'story-2', slug: 'story-2', title: 'As an admin, I want...' },
  ],
  getUserStory: async () => ({
    uuid: 'story-1',
    slug: 'story-1',
    title: 'As a user, I want to login',
    additional_information: 'Details...',
    acceptance_criteria: 'Criteria...',
    tasks: [],
  }),
  createUserStory: async () => ({
    uuid: 'new-story',
    slug: 'new-story',
    title: 'New Story',
  }),
  updateUserStory: async () => ({
    updated: true,
  }),
  getAllWorkspacesUserStories: async () => ({
    data: [
      { slug: 'us-001', title: 'User login flow', project: { slug: 'api-v2', name: 'API v2' } },
      { slug: 'us-002', title: 'Dashboard redesign', project: { slug: 'web-app', name: 'Web App' } },
    ],
    meta: { total: 2 },
  }),
};

describe('User Stories Tools (Consolidated)', () => {
  describe('registerUserStoryTools', () => {
    it('should register the consolidated user_story tool', () => {
      const tools = registerUserStoryTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('user_story');
    });

    it('user_story tool should have action enum with all operations', () => {
      const tools = registerUserStoryTools();
      const storyTool = tools[0];
      const actionProp = storyTool.inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('list');
      expect(actionProp.enum).toContain('get');
      expect(actionProp.enum).toContain('create');
      expect(actionProp.enum).toContain('update');
      expect(actionProp.enum).toContain('all');
    });
  });

  describe('handleUserStoryTool - action:all', () => {
    it('should return all user stories across workspaces', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'all',
        company_slug: 'test-workspace',
        project_slug: 'test-project',
      });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleUserStoryTool - action:list', () => {
    it('should return stories when project_slug and company_slug provided', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'list',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('As a user');
    });

    it('should require project context', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'list',
        project_slug: 'test-project',
        // No company_slug, but findProjectByName returns null
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('project');
    });

    it('should require project_slug for list', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'list',
        // No project_slug at all
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('project_slug');
    });
  });

  describe('handleUserStoryTool - action:get', () => {
    it('should return story details when slug and company_slug provided', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'get',
        slug: 'story-1',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('As a user, I want to login');
    });

    it('should require slug', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'get',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('slug required');
    });
  });

  describe('handleUserStoryTool - action:create', () => {
    it('should create story when all required params provided', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'create',
        title: 'As a user, I want to...',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created');
    });

    it('should accept optional params', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'create',
        title: 'As a user, I want to...',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
        additional_information: 'More details',
        acceptance_criteria: 'Must pass these tests',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require title', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'create',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('title');
    });
  });

  describe('handleUserStoryTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'unknown',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });
  });

  describe('handleUserStoryTool - action:update', () => {
    it('should update story when slug and required params provided', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'update',
        slug: 'story-1',
        title: 'Updated title',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('updated');
    });

    it('should require slug for update', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'update',
        title: 'Updated title',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('slug required');
    });

    it('should require project context for update', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'update',
        slug: 'story-1',
        title: 'Updated title',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('project');
    });

    it('should accept optional fields on update', async () => {
      const result = await handleUserStoryTool(mockClient as any, 'user_story', {
        action: 'update',
        slug: 'story-1',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
        additional_information: 'Updated info',
        acceptance_criteria: 'Updated criteria',
        epic_uuid: 'epic-uuid-1',
        user_story_priority_id: 2,
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('updated');
    });
  });
});
