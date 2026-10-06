/**
 * BudgetModel — Domain Model for Budget tracking
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const BudgetModel = defineModel('Budget', m => {

  m.casts({
    company_slug: m.string('Workspace identifier'),
    project_slug: m.string('Filter to specific project'),
  });

  m.hidden(['company_slug', 'project_slug']);

  m.fillable({
    query: ['company_slug', 'project_slug'],
  });

});

export type Budget = typeof BudgetModel.infer;
