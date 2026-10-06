/**
 * SprintModel — Domain Model for Sprint entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const SprintModel = defineModel('Sprint', m => {

  m.casts({
    id:              m.id('Sprint identifier'),
    slug:            m.string('Sprint slug'),
    title:           m.string('Sprint name'),
    description:     m.text('Sprint description'),
    start_date:      m.date('Start date YYYY-MM-DD').alias('date_start'),
    end_date:        m.date('End date YYYY-MM-DD').alias('date_finish'),
    status:          m.string('Sprint status'),
    total_tasks:     m.number('Total tasks in sprint'),
    completed_tasks: m.number('Completed tasks'),
    progress:        m.number('Completion percentage 0-100'),

    // ── Input-only fields ────────────────────────
    company_slug:    m.string('Workspace identifier'),
    project_slug:    m.string('Project identifier'),
    sprint_slug:     m.string('Sprint identifier'),
  });

  m.hidden(['company_slug', 'project_slug', 'sprint_slug']);

  m.guarded(['id', 'slug', 'total_tasks', 'completed_tasks', 'progress', 'status']);

  m.fillable({
    create: ['company_slug', 'project_slug', 'title', 'start_date', 'end_date', 'description'],
    update: ['company_slug', 'project_slug', 'sprint_slug', 'title', 'start_date', 'end_date', 'description'],
    query:  ['company_slug', 'project_slug', 'sprint_slug'],
  });

});

export type Sprint = typeof SprintModel.infer;
