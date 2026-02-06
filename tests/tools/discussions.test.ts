/**
 * Discussion Tools Tests
 * 
 * Tests for the unified discussion tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleDiscussionTool, registerDiscussionTools } from '../../src/tools/discussions.js';

const mockClient = {
  getAllDiscussions: async () => [
    { workspace: 'ws-1', project: 'api-v2', channels: [{ uuid: 'ch-1', name: 'general', unread: 3 }] },
  ],
  getDiscussionGlobalUnreadCount: async () => ({ total_unread: 7 }),
  getDiscussionChannels: async () => [
    { uuid: 'ch-1', name: 'general', members_count: 5, unread_count: 3 },
    { uuid: 'ch-2', name: 'dev', members_count: 3, unread_count: 0 },
  ],
  getDiscussionChannel: async () => ({
    uuid: 'ch-1',
    name: 'general',
    description: 'General discussion',
    members_count: 5,
  }),
  createDiscussionChannel: async () => ({
    uuid: 'new-ch-uuid',
    name: 'new-channel',
  }),
  updateDiscussionChannel: async () => ({
    uuid: 'ch-1',
    name: 'updated-channel',
  }),
  getDiscussionMessages: async () => ({
    data: [
      { uuid: 'msg-1', content: 'Hello team!', user: { name: 'John' } },
      { uuid: 'msg-2', content: 'Hi John!', user: { name: 'Jane' } },
    ],
    meta: { has_more: false },
  }),
  sendDiscussionMessage: async () => ({
    uuid: 'new-msg-uuid',
    content: 'Test message',
  }),
  searchDiscussionMessages: async () => [
    { uuid: 'msg-1', content: 'Found matching message', user: { name: 'John' } },
  ],
  getDiscussionUnreadCount: async () => ({
    total_unread: 3,
    channels: [{ uuid: 'ch-1', unread: 3 }],
  }),
  markDiscussionChannelRead: async () => ({ success: true }),
};

describe('Discussion Tools', () => {
  describe('registerDiscussionTools', () => {
    it('should register 1 consolidated discussion tool', () => {
      const tools = registerDiscussionTools();
      expect(tools).toBeInstanceOf(Array);
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

    it('discussion tool should have mutation annotations', () => {
      const tools = registerDiscussionTools();
      const annotations = tools[0].annotations as Record<string, unknown>;
      expect(annotations.readOnlyHint).toBe(false);
    });
  });

  describe('handleDiscussionTool - action:all', () => {
    it('should return all discussions across workspaces', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', { action: 'all' });
      
      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleDiscussionTool - action:channels', () => {
    it('should return channels when project context provided', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'channels',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require project_slug and company_slug', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'channels',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('project_slug');
    });
  });

  describe('handleDiscussionTool - action:channel', () => {
    it('should return channel details when uuid provided', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'channel',
        channel_uuid: 'ch-1',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require channel_uuid', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'channel',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('channel_uuid');
    });
  });

  describe('handleDiscussionTool - action:messages', () => {
    it('should return messages when channel_uuid provided', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'messages',
        channel_uuid: 'ch-1',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require channel_uuid', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'messages',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('channel_uuid');
    });
  });

  describe('handleDiscussionTool - action:send', () => {
    it('should send message to channel', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'send',
        channel_uuid: 'ch-1',
        content: 'Hello world!',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require channel_uuid and content', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'send',
        channel_uuid: 'ch-1',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('content');
    });
  });

  describe('handleDiscussionTool - action:search', () => {
    it('should search messages in channel', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'search',
        channel_uuid: 'ch-1',
        q: 'matching',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require channel_uuid and q', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'search',
        channel_uuid: 'ch-1',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('q');
    });
  });

  describe('handleDiscussionTool - action:unread', () => {
    it('should return unread count', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'unread',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require project_slug and company_slug', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'unread',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleDiscussionTool - action:mark_read', () => {
    it('should mark channel as read', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'mark_read',
        channel_uuid: 'ch-1',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require channel_uuid', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'mark_read',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('channel_uuid');
    });
  });

  describe('handleDiscussionTool - action:create_channel', () => {
    it('should create a new channel', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'create_channel',
        name: 'new-channel',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require name', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'create_channel',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('name');
    });
  });

  describe('handleDiscussionTool - action:update_channel', () => {
    it('should update a channel', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'update_channel',
        channel_uuid: 'ch-1',
        name: 'updated-channel',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require channel_uuid', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'update_channel',
        name: 'updated-channel',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('channel_uuid');
    });
  });

  describe('handleDiscussionTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleDiscussionTool(mockClient as any, 'discussion', {
        action: 'unknown',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });
  });
});
