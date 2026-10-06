/**
 * DiscussionModel — Domain Models for Discussion Channel and Message entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const ChannelModel = defineModel('DiscussionChannel', m => {

  m.casts({
    uuid:         m.uuid('Channel unique identifier'),
    title:        m.string('Channel title').alias('name'),
    description:  m.text('Channel description'),
    unread_count: m.number('Unread messages count'),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
    project_slug: m.string('Project identifier'),
    channel_uuid: m.uuid('Channel to update'),
  });

  m.hidden(['company_slug', 'project_slug', 'channel_uuid']);

  m.guarded(['uuid', 'unread_count']);

  m.fillable({
    create: ['company_slug', 'project_slug', 'title', 'description'],
    update: ['company_slug', 'project_slug', 'channel_uuid', 'title', 'description'],
    query:  ['company_slug', 'project_slug'],
  });

});

export const MessageModel = defineModel('DiscussionMessage', m => {

  m.casts({
    id:           m.string('Message identifier'),
    content:      m.text('Message content'),
    author:       m.object('Message author', {
      username: m.string(),
      name:     m.string(),
    }),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
    project_slug: m.string('Project identifier'),
    channel_uuid: m.uuid('Channel to post in'),
    cursor:       m.string('Pagination cursor from previous response'),
    limit:        m.number('Messages per page (default: 20)'),
    q:            m.string('Search query'),
  });

  m.timestamps();

  m.hidden(['company_slug', 'project_slug', 'channel_uuid', 'cursor', 'limit', 'q']);

  m.guarded(['id', 'author', 'created_at', 'updated_at']);

  m.fillable({
    create: ['company_slug', 'project_slug', 'channel_uuid', 'content'],
    query:  ['channel_uuid', 'cursor', 'limit'],
    search: ['channel_uuid', 'q', 'limit'],
  });

});

export type DiscussionChannel = typeof ChannelModel.infer;
export type DiscussionMessage = typeof MessageModel.infer;
