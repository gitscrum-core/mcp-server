/**
 * User Stories — Fluent API + MVA
 *
 * ✅ .returns(UserStoryPresenter) on queries
 * ✅ .fromModel() — zero-boilerplate input from Models
 * ✅ f.error() for missing context
 * ✅ Implicit success() — handlers return raw data
 */

import { f } from '../context.js';
import { resolveProjectContext } from '../utils/resolveProject.js';
import { UserStoryPresenter } from '../presenters/index.js';
import { UserStoryModel } from '../models/UserStoryModel.js';

const userStory = f.router('user_story')
  .describe('User story management — organize features from the user perspective')
  .tags('planning');

export const listUserStories = userStory.query('list')
  .describe('List user stories in a project')
  .fromModel(UserStoryModel, 'query')
  .returns(UserStoryPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getUserStories(resolved.project_slug, resolved.company_slug);
  });

export const getUserStory = userStory.query('get')
  .describe('Get user story details')
  .fromModel(UserStoryModel, 'query')
  .returns(UserStoryPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getUserStory(input.user_story_slug, resolved.project_slug, resolved.company_slug);
  });

export const createUserStory = userStory.mutation('create')
  .describe('Create a new user story')
  .invalidates('user_story.*')
  .fromModel(UserStoryModel, 'create')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const story = await ctx.client.createUserStory(UserStoryModel.toApi({
      title: input.title,
      description: input.description,
      project_slug: resolved.project_slug,
      company_slug: resolved.company_slug,
      epic_uuid: input.epic_uuid,
    }) as { title: string; company_slug: string; project_slug: string; additional_information?: string; epic_uuid?: string });
    return { created: true, user_story: story };
  });

export const updateUserStory = userStory.action('update')
  .describe('Update a user story')
  .idempotent()
  .invalidates('user_story.*')
  .fromModel(UserStoryModel, 'update')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const data = UserStoryModel.toApi({
      project_slug: resolved.project_slug,
      company_slug: resolved.company_slug,
      title: input.title,
      description: input.description,
      epic_uuid: input.epic_uuid,
    });
    await ctx.client.updateUserStory(input.user_story_slug, data as {
      project_slug: string;
      company_slug: string;
      title?: string;
      additional_information?: string;
      epic_uuid?: string;
    });
    return { updated: true, user_story_slug: input.user_story_slug };
  });
