/**
 * SearchModel — Domain Model for Global Search
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const SearchModel = defineModel('Search', m => {

  m.casts({
    q:            m.string('Search query (minimum 2 characters)'),
    category:     m.string('Filter by category: workspace, project, task'),
    company_slug: m.string('Limit search to specific workspace'),
  });

  m.hidden(['company_slug']);

  m.fillable({
    query: ['q', 'category', 'company_slug'],
  });

});

export type Search = typeof SearchModel.infer;
