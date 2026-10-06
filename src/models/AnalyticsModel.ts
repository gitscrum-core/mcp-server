/**
 * AnalyticsModel — Domain Model for Analytics queries
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const AnalyticsModel = defineModel('Analytics', m => {

  m.casts({
    company_slug: m.string('Workspace identifier'),
  });

  m.hidden(['company_slug']);

  m.fillable({
    query: ['company_slug'],
  });

});

export type Analytics = typeof AnalyticsModel.infer;
