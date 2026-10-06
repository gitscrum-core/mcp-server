/**
 * LabelModel — Domain Model for Label entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const LabelModel = defineModel('Label', m => {

  m.casts({
    id:           m.id('Label identifier'),
    slug:         m.string('Label slug'),
    title:        m.string('Label name'),
    color:        m.string('Hex color code without # (e.g. FF5733)'),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
    project_slug: m.string('Project identifier'),
    label_slug:   m.string('Label identifier from label.list'),
    task_uuid:    m.uuid('Task UUID for toggle operation'),
  });

  m.hidden(['company_slug', 'project_slug', 'label_slug', 'task_uuid']);

  m.guarded(['id', 'slug']);

  m.fillable({
    create:  ['company_slug', 'title', 'color'],
    update:  ['company_slug', 'label_slug', 'title', 'color'],
    query:   ['company_slug', 'project_slug'],
    attach:  ['company_slug', 'project_slug', 'label_slug'],
    detach:  ['company_slug', 'project_slug', 'label_slug'],
    toggle:  ['company_slug', 'project_slug', 'task_uuid', 'label_slug'],
  });

});

export type Label = typeof LabelModel.infer;
