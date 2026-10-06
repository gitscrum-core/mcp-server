/**
 * ActivityModel — Domain Model for Activity Feed queries
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const ActivityModel = defineModel('Activity', m => {

  m.casts({
    company_slug: m.string('Workspace identifier'),
    project_slug: m.string('Project identifier'),
    task_uuid:    m.uuid('Specific task to filter activities'),
    username:     m.string('Username to view activity for'),
  });

  m.hidden(['company_slug', 'project_slug', 'task_uuid', 'username']);

  m.fillable({
    context: ['company_slug', 'project_slug', 'task_uuid'],
    user:    ['username'],
  });

});

export type Activity = typeof ActivityModel.infer;
