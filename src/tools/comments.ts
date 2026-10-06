/**
 * Comments — Fluent API + MVA
 *
 * ✅ .tags('collaboration') — capability grouping
 * ✅ .returns(CommentPresenter) — MVA pipeline
 * ✅ .stale() — always fetch fresh comments
 * ✅ .invalidates() — cascades on mutation
 * ✅ .fromModel() — zero-boilerplate input from Models
 */

import { f } from '../context.js';
import { CommentPresenter } from '../presenters/index.js';
import { CommentModel } from '../models/CommentModel.js';

const comment = f.router('comment')
  .describe('Task comments — conversation threads on tasks')
  .tags('collaboration');

export const listComments = comment.query('list')
  .describe('List comments on a task')
  .fromModel(CommentModel, 'query')
  .stale()
  .returns(CommentPresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getTaskComments(input.task_uuid, input.company_slug, input.project_slug);
  });

export const addComment = comment.mutation('add')
  .describe('Add a comment to a task')
  .instructions('Use when the user wants to reply or discuss a task. Supports full markdown formatting.')
  .invalidates('comment.*', 'activity.*')
  .fromModel(CommentModel, 'create')
  .handle(async (input, ctx) => {
    const created = await ctx.client.addTaskComment(input.task_uuid, input.content, input.company_slug, input.project_slug);
    return { created: true, comment: created };
  });

export const updateComment = comment.action('update')
  .describe('Edit an existing comment')
  .idempotent()
  .invalidates('comment.*')
  .fromModel(CommentModel, 'update')
  .handle(async (input, ctx) => {
    await ctx.client.updateComment(input.comment_id, input.content);
    return { updated: true, comment_id: input.comment_id };
  });
