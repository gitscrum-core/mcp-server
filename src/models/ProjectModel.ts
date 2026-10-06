/**
 * ProjectModel — Domain Model for Project entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const ProjectModel = defineModel('Project', m => {

  m.casts({
    slug:          m.string('Project slug'),
    title:         m.string('Project title'),
    description:   m.text('Project description'),
    status:        m.string('Project status'),
    visibility:    m.string('Visibility level'),
    tasks_count:   m.number('Total tasks'),
    members_count: m.number('Total members'),

    // ── Input-only fields ────────────────────────
    company_slug:  m.string('Workspace identifier'),
    project_slug:  m.string('Project identifier'),
  });

  m.timestamps();

  m.hidden(['company_slug', 'project_slug']);

  m.guarded(['slug', 'tasks_count', 'members_count', 'created_at', 'updated_at']);

  m.fillable({
    create: ['company_slug', 'title'],
    update: ['company_slug', 'project_slug', 'title', 'description'],
    query:  ['company_slug', 'project_slug'],
  });

});

export type Project = typeof ProjectModel.infer;
