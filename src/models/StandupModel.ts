/**
 * StandupModel — Domain Model for Standup Reports
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const StandupModel = defineModel('Standup', m => {

  m.casts({
    company_slug: m.string('Workspace identifier'),
    project_slug: m.string('Filter to specific project'),
    date:         m.date('Date filter YYYY-MM-DD'),
  });

  m.hidden(['company_slug', 'project_slug', 'date']);

  m.fillable({
    query:     ['company_slug', 'project_slug'],
    completed: ['company_slug', 'project_slug', 'date'],
  });

});

export type Standup = typeof StandupModel.infer;
