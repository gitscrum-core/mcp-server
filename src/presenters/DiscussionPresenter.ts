/**
 * DiscussionPresenters — View layer for Discussion channels and messages
 */
import { definePresenter, ui, suggest } from '@vurb/core';
import { ChannelModel, MessageModel } from '../models/DiscussionModel.js';

export const ChannelPresenter = definePresenter({
  name: 'DiscussionChannel',
  schema: ChannelModel.schema,
  suggestActions: () => [
    suggest('discussion.messages', 'View channel messages'),
    suggest('discussion.send', 'Send a message'),
  ],
});

export const MessagePresenter = definePresenter({
  name: 'DiscussionMessage',
  schema: MessageModel.schema,
  agentLimit: {
    max: 30,
    onTruncate: (n) => ui.summary(`⚠️ ${n} older messages hidden. Use cursor pagination for history.`),
  },
});
