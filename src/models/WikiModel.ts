/**
 * WikiModel — Domain Model for Wiki Page entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const WikiModel = defineModel('WikiPage', m => {

  m.casts({
    uuid:         m.uuid('Wiki page unique identifier'),
    title:        m.string('Page title'),
    content:      m.text('Page content in markdown'),
    parent_uuid:  m.uuid('Parent page identifier'),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
    project_slug: m.string('Project identifier'),
    q:            m.string('Search query (min 2 characters)'),
    limit:        m.number('Max results (default 20, max 50)'),
  });

  m.timestamps();

  m.hidden(['company_slug', 'project_slug', 'q', 'limit']);

  m.guarded(['uuid', 'created_at', 'updated_at']);

  m.fillable({
    create: ['company_slug', 'project_slug', 'title', 'content', 'parent_uuid'],
    update: ['company_slug', 'project_slug', 'title', 'content'],
    query:  ['company_slug', 'project_slug'],
    get:    ['uuid', 'company_slug', 'project_slug'],
    search: ['company_slug', 'project_slug', 'q', 'limit'],
  });

});

export type WikiPage = typeof WikiModel.infer;
