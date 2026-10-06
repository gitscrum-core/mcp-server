/**
 * Discussion/Chat — vurb.ts Showcase
 *
 * ✅ .tags('collaboration') — real-time collaboration
 * ✅ .stale() — messages must always be fresh
 * ✅ .invalidates() — cascades on mutation
 * ✅ .returns(Presenter) — MVA pipeline
 * ✅ .fromModel() — zero-boilerplate input from Models
 */

import { f } from '../context.js';
import { resolveProjectContext } from '../utils/resolveProject.js';
import { ChannelPresenter, MessagePresenter } from '../presenters/index.js';
import { ChannelModel, MessageModel } from '../models/DiscussionModel.js';

const discussion = f.router('discussion')
  .describe('Team discussions and messaging channels')
  .tags('collaboration');

export const listChannels = discussion.query('channels')
  .describe('List discussion channels in a project')
  .fromModel(ChannelModel, 'query')
  .returns(ChannelPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getDiscussionChannels(resolved.project_slug, resolved.company_slug);
  });

export const channelMessages = discussion.query('messages')
  .describe('Get messages from a channel with cursor-based pagination')
  .stale()
  .fromModel(MessageModel, 'query')
  .returns(MessagePresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getDiscussionMessages(input.channel_uuid, {
      before_id: input.cursor,
      limit: input.limit,
    });
  });

export const sendMessage = discussion.mutation('send')
  .describe('Send a message to a channel')
  .invalidates('discussion.*')
  .fromModel(MessageModel, 'create')
  .handle(async (input, ctx) => {
    const message = await ctx.client.sendDiscussionMessage(
      input.channel_uuid, { content: input.content },
    );
    return { sent: true, message };
  });

export const searchMessages = discussion.query('search')
  .describe('Search discussion messages')
  .fromModel(MessageModel, 'search')
  .returns(MessagePresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.searchDiscussionMessages(input.channel_uuid, input.q, input.limit);
  });

export const unreadCount = discussion.query('unread')
  .describe('Get unread message counts')
  .stale()
  .fromModel(ChannelModel, 'query')
  .handle(async (input, ctx) => {
    return await ctx.client.getDiscussionUnreadCount(input.project_slug, input.company_slug);
  });

export const createChannel = discussion.mutation('create_channel')
  .describe('Create a new discussion channel')
  .invalidates('discussion.*')
  .fromModel(ChannelModel, 'create')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const channel = await ctx.client.createDiscussionChannel(ChannelModel.toApi({
      title: input.title,
      project_slug: resolved.project_slug,
      company_slug: resolved.company_slug,
      description: input.description,
    }) as { name: string; project_slug: string; company_slug: string; description?: string });
    return { created: true, channel };
  });

export const updateChannel = discussion.action('update_channel')
  .describe('Update a discussion channel')
  .idempotent()
  .invalidates('discussion.*')
  .fromModel(ChannelModel, 'update')
  .handle(async (input, ctx) => {
    const data = ChannelModel.toApi({
      title: input.title,
      description: input.description,
    });
    await ctx.client.updateDiscussionChannel(input.channel_uuid, data);
    return { updated: true, channel_uuid: input.channel_uuid };
  });
