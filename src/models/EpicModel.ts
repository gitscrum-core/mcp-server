/**
 * EpicModel — Domain Model for Epic entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const EpicModel = defineModel('Epic', m => {

  m.casts({
    uuid:         m.uuid('Epic unique identifier'),
    title:        m.string('Epic title'),
    description:  m.text('Epic description'),
    color:        m.string('Display color (hex without #)'),
    tasks_count:  m.number('Associated tasks count'),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
    project_slug: m.string('Project identifier'),
    epic_uuid:    m.uuid('Epic UUID from epic.list'),
  });

  m.hidden(['company_slug', 'project_slug', 'epic_uuid']);

  m.guarded(['uuid', 'tasks_count']);

  m.fillable({
    create: ['company_slug', 'project_slug', 'title', 'description', 'color'],
    update: ['company_slug', 'project_slug', 'epic_uuid', 'title', 'description', 'color'],
    query:  ['company_slug', 'project_slug'],
  });

});

export type Epic = typeof EpicModel.infer;
