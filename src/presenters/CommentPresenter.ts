/**
 * CommentPresenter — View layer for Comment entities
 */
import { definePresenter, ui, suggest } from '@vurb/core';
import { CommentModel } from '../models/CommentModel.js';

export const CommentPresenter = definePresenter({
  name: 'Comment',
  schema: CommentModel.schema,
  agentLimit: {
    max: 30,
    onTruncate: (n) => ui.summary(`⚠️ ${n} older comments hidden.`),
  },
  suggestActions: () => [
    suggest('comment.add', 'Reply to this thread'),
  ],
});
