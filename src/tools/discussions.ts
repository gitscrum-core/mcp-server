/**
 * Discussion MCP Tool
 * 
 * Uses Action Handler pattern for clean, extensible code.
 * Provides access to discussion channels, messages, and unread counts.
 */
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../client/GitScrumClient.js";
import { 
  executeAction, 
  success, 
  required,
  resolveProjectContext,
  type ActionHandlerMap,
  type ToolResponse,
  type ResponseContext
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerDiscussionTools(): Tool[] {
  return [
    {
      name: "discussion",
      description: [
        "Discussions & channels. Actions: all, channels, channel, messages, send, search, unread, mark_read, create_channel, update_channel.",
        "",
        "Workflow:",
        "- 'all': no params needed (returns all discussions across workspaces)",
        "- 'channels': requires company_slug + project_slug (list channels in a project)",
        "- 'channel': requires channel_uuid (get single channel details)",
        "- 'messages': requires channel_uuid (get messages, supports cursor pagination)",
        "- 'send': requires channel_uuid + content (send a message)",
        "- 'search': requires channel_uuid + q (search messages in channel)",
        "- 'unread': requires company_slug + project_slug (unread count)",
        "- 'mark_read': requires channel_uuid (mark channel as read)",
        "- 'create_channel': requires name + company_slug + project_slug",
        "- 'update_channel': requires channel_uuid + name or description",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["all", "channels", "channel", "messages", "send", "search", "unread", "mark_read", "create_channel", "update_channel"], 
            description: "Which operation to perform" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier" 
          },
          project_slug: { 
            type: "string", 
            description: "Project identifier" 
          },
          channel_uuid: { 
            type: "string", 
            description: "Channel UUID for: channel, messages, send, search, mark_read, update_channel" 
          },
          content: { 
            type: "string", 
            description: "Message text for send action" 
          },
          parent_id: { 
            type: "string", 
            description: "Parent message ID for thread replies (optional for send)" 
          },
          q: { 
            type: "string", 
            description: "Search query for search action" 
          },
          name: { 
            type: "string", 
            description: "Channel name for create_channel/update_channel" 
          },
          description: { 
            type: "string", 
            description: "Channel description (optional)" 
          },
          is_private: { 
            type: "boolean", 
            description: "Channel visibility (optional for create_channel)" 
          },
          include_archived: { 
            type: "boolean", 
            description: "Include archived channels (optional for channels)" 
          },
          before_id: { 
            type: "string", 
            description: "Cursor for older messages (optional for messages)" 
          },
          after_id: { 
            type: "string", 
            description: "Cursor for newer messages (optional for messages)" 
          },
          limit: { 
            type: "number", 
            description: "Max results (optional)" 
          },
        },
        required: ["action"],
      },
      annotations: { title: "Discussions", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface DiscussionArgs {
  action: string;
  company_slug?: string;
  project_slug?: string;
  channel_uuid?: string;
  content?: string;
  parent_id?: string;
  q?: string;
  name?: string;
  description?: string;
  is_private?: boolean;
  include_archived?: boolean;
  before_id?: string;
  after_id?: string;
  limit?: number;
}

// ============================================================================
// Action Handlers
// ============================================================================

const discussionHandlers: ActionHandlerMap<DiscussionArgs> = {
  all: async (client) => {
    const data = await client.getAllDiscussions();
    return success(JSON.stringify(data, null, 2));
  },

  channels: async (client, args) => {
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("company_slug + project_slug");
    
    const channels = await client.getDiscussionChannels(resolved.project_slug, resolved.company_slug, args.include_archived);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(channels, null, 2), ctx);
  },

  channel: async (client, args) => {
    if (!args.channel_uuid) return required("channel_uuid");
    const channel = await client.getDiscussionChannel(args.channel_uuid);
    return success(JSON.stringify(channel, null, 2));
  },

  messages: async (client, args) => {
    if (!args.channel_uuid) return required("channel_uuid");
    const messages = await client.getDiscussionMessages(args.channel_uuid, {
      before_id: args.before_id,
      after_id: args.after_id,
      limit: args.limit,
    });
    return success(JSON.stringify(messages, null, 2));
  },

  send: async (client, args) => {
    if (!args.channel_uuid) return required("channel_uuid");
    if (!args.content) return required("content");
    const message = await client.sendDiscussionMessage(args.channel_uuid, {
      content: args.content,
      parent_id: args.parent_id,
    });
    return success(JSON.stringify({ sent: true, message }, null, 2));
  },

  search: async (client, args) => {
    if (!args.channel_uuid) return required("channel_uuid");
    if (!args.q) return required("q (search query)");
    const results = await client.searchDiscussionMessages(args.channel_uuid, args.q, args.limit);
    return success(JSON.stringify(results, null, 2));
  },

  unread: async (client, args) => {
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("company_slug + project_slug");
    
    const count = await client.getDiscussionUnreadCount(resolved.project_slug, resolved.company_slug);
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify(count, null, 2), ctx);
  },

  mark_read: async (client, args) => {
    if (!args.channel_uuid) return required("channel_uuid");
    await client.markDiscussionChannelRead(args.channel_uuid);
    return success(JSON.stringify({ marked_read: true, channel_uuid: args.channel_uuid }, null, 2));
  },

  create_channel: async (client, args) => {
    if (!args.name) return required("name");
    const resolved = await resolveProjectContext(client, { 
      company_slug: args.company_slug, 
      project_slug: args.project_slug 
    });
    if (!resolved) return required("company_slug + project_slug");
    
    const channel = await client.createDiscussionChannel({
      name: args.name,
      project_slug: resolved.project_slug,
      company_slug: resolved.company_slug,
      description: args.description,
      is_private: args.is_private,
    });
    const ctx: ResponseContext = { company_slug: resolved.company_slug, project_slug: resolved.project_slug };
    return success(JSON.stringify({ created: true, channel }, null, 2), ctx);
  },

  update_channel: async (client, args) => {
    if (!args.channel_uuid) return required("channel_uuid");
    const data: { name?: string; description?: string } = {};
    if (args.name) data.name = args.name;
    if (args.description) data.description = args.description;
    const channel = await client.updateDiscussionChannel(args.channel_uuid, data);
    return success(JSON.stringify({ updated: true, channel }, null, 2));
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleDiscussionTool(
  client: GitScrumClient,
  _name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const action = args.action as string;
  return executeAction(discussionHandlers, action, client, args);
}
