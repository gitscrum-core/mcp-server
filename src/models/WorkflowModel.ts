/**
 * WorkflowModel — Domain Model for Kanban Column/Workflow entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const WorkflowModel = defineModel('Workflow', m => {

  m.casts({
    id:           m.id('Workflow/column identifier'),
    title:        m.string('Column name (e.g. Backlog, In Review, Done)'),
    color:        m.string('Hex color code without # (e.g. 58A6FF)'),
    status:       m.string("Column type: 'todo'/'backlog', 'in progress'/'doing', 'done'/'closed'"),
    position:     m.number('Board position (1 = leftmost)'),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
    project_slug: m.string('Project identifier'),
    workflow_id:  m.number("Column ID from 'project.workflows' response"),
  });

  m.hidden(['company_slug', 'project_slug', 'workflow_id']);

  m.guarded(['id']);

  m.fillable({
    create: ['company_slug', 'project_slug', 'title', 'color', 'status'],
    update: ['company_slug', 'project_slug', 'workflow_id', 'title', 'color', 'status', 'position'],
  });

});

export type Workflow = typeof WorkflowModel.infer;
