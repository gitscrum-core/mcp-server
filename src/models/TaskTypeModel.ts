/**
 * TaskTypeModel — Domain Model for Task Type entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const TaskTypeModel = defineModel('TaskType', m => {

  m.casts({
    id:           m.id('Task type identifier'),
    title:        m.string('Type name (e.g. Bug, Feature)'),
    color:        m.string('Hex color code without # (e.g. FF5733)'),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
    project_slug: m.string('Project identifier'),
    type_id:      m.number('Task type ID from task_type.list'),
    task_uuid:    m.uuid('Task UUID for assign operation'),
  });

  m.hidden(['company_slug', 'project_slug', 'type_id', 'task_uuid']);

  m.guarded(['id']);

  m.fillable({
    create: ['company_slug', 'project_slug', 'title', 'color'],
    update: ['company_slug', 'project_slug', 'type_id', 'title', 'color'],
    query:  ['company_slug', 'project_slug'],
    assign: ['company_slug', 'project_slug', 'task_uuid', 'type_id'],
  });

});

export type TaskType = typeof TaskTypeModel.infer;
