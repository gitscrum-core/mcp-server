/**
 * Wiki — vurb.ts Showcase
 *
 * ✅ .tags('content') — content management
 * ✅ .returns(WikiPresenter) — MVA pipeline
 * ✅ .invalidates() — cascades on mutation
 * ✅ .instructions() — AI-first search guidance
 * ✅ .fromModel() — zero-boilerplate input from Models
 */

import { f } from '../context.js';
import { resolveProjectContext } from '../utils/resolveProject.js';
import { WikiPresenter } from '../presenters/index.js';
import { WikiModel } from '../models/WikiModel.js';

const wiki = f.router('wiki')
  .describe('Wiki documentation — create, edit, and search project pages')
  .tags('content');

export const listWikiPages = wiki.query('list')
  .describe('List wiki pages in a project')
  .fromModel(WikiModel, 'query')
  .returns(WikiPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getWikiPages(resolved.project_slug, resolved.company_slug);
  });

export const getWikiPage = wiki.query('get')
  .describe('Get a wiki page content by UUID')
  .fromModel(WikiModel, 'get')
  .returns(WikiPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.getWikiPage(input.uuid, resolved.project_slug, resolved.company_slug);
  });

export const createWikiPage = wiki.mutation('create')
  .describe('Create a new wiki page')
  .invalidates('wiki.*')
  .fromModel(WikiModel, 'create')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const page = await ctx.client.createWikiPage({
      title: input.title,
      content: input.content,
      project_slug: resolved.project_slug,
      company_slug: resolved.company_slug,
      parent_uuid: input.parent_uuid,
    });
    return { created: true, page };
  });

export const updateWikiPage = wiki.action('update')
  .describe('Update a wiki page')
  .idempotent()
  .invalidates('wiki.*')
  .withString('uuid', 'Page to update')
  .fromModel(WikiModel, 'update')
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    const data = WikiModel.toApi({
      title: input.title,
      content: input.content,
    });
    await ctx.client.updateWikiPage(input.uuid, resolved.project_slug, resolved.company_slug, data);
    return { updated: true, uuid: input.uuid };
  });

export const searchWiki = wiki.query('search')
  .describe('Search wiki pages')
  .instructions('Use for knowledge base lookups. Minimum 2 character query. Returns pages ranked by relevance.')
  .fromModel(WikiModel, 'search')
  .returns(WikiPresenter)
  .handle(async (input, ctx) => {
    const resolved = await resolveProjectContext(ctx.client, input);
    if (!resolved) return f.error('MISSING_REQUIRED_FIELD', 'company_slug is required')
      .suggest('Provide company_slug or use workspace.list to find it')
      .actions('workspace.list');
    return await ctx.client.searchWikiPages(resolved.project_slug, resolved.company_slug, input.q, input.limit);
  });
