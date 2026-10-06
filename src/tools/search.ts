/**
 * Search — Fluent API + MVA
 *
 * ✅ .fromModel() — zero-boilerplate input from Models
 * ✅ Implicit success() — handler returns raw data
 */

import { f } from '../context.js';
import { SearchModel } from '../models/SearchModel.js';

export const globalSearch = f.query('search.global')
  .describe('Search across workspaces, projects, and tasks')
  .fromModel(SearchModel, 'query')
  .handle(async (input, ctx) => {
    return await ctx.client.search(input.q, { categories: input.category, company_slug: input.company_slug });
  });
