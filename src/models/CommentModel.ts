/**
 * CommentModel — Domain Model for Comment entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const CommentModel = defineModel('Comment', m => {

  m.casts({
    id:           m.string('Comment identifier'),
    content:      m.text('Comment content'),
    author:       m.object('Comment author', {
      username: m.string(),
      name:     m.string(),
    }),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
    project_slug: m.string('Project identifier'),
    task_uuid:    m.uuid('Task to comment on'),
    comment_id:   m.string('Comment ID to update'),
  });

  m.timestamps();

  m.hidden(['company_slug', 'project_slug', 'task_uuid', 'comment_id']);

  m.guarded(['id', 'author', 'created_at', 'updated_at']);

  m.fillable({
    create: ['company_slug', 'project_slug', 'task_uuid', 'content'],
    update: ['company_slug', 'project_slug', 'comment_id', 'content'],
    query:  ['company_slug', 'project_slug', 'task_uuid'],
  });

});

export type Comment = typeof CommentModel.infer;
