/**
 * WorkspaceModel — Domain Model for Workspace entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const WorkspaceModel = defineModel('Workspace', m => {

  m.casts({
    slug:           m.string('Workspace slug'),
    name:           m.string('Workspace name'),
    description:    m.text('Workspace description'),
    members_count:  m.number('Total members'),
    projects_count: m.number('Total projects'),

    // ── Input-only fields ────────────────────────
    company_slug:   m.string('Workspace identifier'),
  });

  m.hidden(['company_slug']);

  m.fillable({
    query: ['company_slug'],
  });

});

export type Workspace = typeof WorkspaceModel.infer;
