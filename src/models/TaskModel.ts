/**
 * TaskModel — Eloquent-inspired Model Definition
 *
 * Single source of truth for the Task entity:
 *   • Field types + labels (casts)
 *   • Input profiles per operation (fillable)
 *   • Hidden and guarded fields
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const TaskModel = defineModel('Task', m => {

  // ── $casts — field type declarations ──────────
  m.casts({
    uuid:               m.uuid('Task unique identifier'),
    code:               m.string('Human-readable code (e.g. PROJ-123)'),
    title:              m.string('Task title'),
    description:        m.text('Task description in markdown'),
    status:             m.string('Task status'),
    priority:           m.string('Priority level'),
    due_date:           m.date('Due date'),
    start_date:         m.date('Start date'),
    estimated_minutes:  m.number('Time estimate in minutes'),
    time_spent_minutes: m.number('Time tracked in minutes'),
    is_blocker:         m.boolean('Blocker flag').default(false),
    is_bug:             m.boolean('Bug flag').default(false),
    is_archived:        m.boolean('Archive status').default(false),
    workflow:           m.object('Current Kanban column', {
      id:    m.id(),
      title: m.string(),
      color: m.string(),
    }),
    type:               m.object('Task type (e.g. Bug, Feature)', {
      id:    m.id(),
      title: m.string(),
      color: m.string(),
    }),
    effort:             m.object('Effort level', {
      id:    m.id(),
      title: m.string(),
    }),
    labels:             m.list('Attached labels', {
      id:    m.id(),
      title: m.string(),
      color: m.string(),
    }),
    users:              m.list('Assigned team members', {
      username: m.string(),
      name:     m.string(),
      avatar:   m.string(),
    }),
    project:            m.object('Parent project', {
      slug:  m.string(),
      title: m.string(),
    }),
    company:            m.object('Workspace', {
      slug: m.string(),
      name: m.string(),
    }),

    // ── Input-only fields (hidden from output) ───
    task_code:          m.string('Task code (e.g. PROJ-123)'),
    company_slug:       m.string('Workspace identifier'),
    project_slug:       m.string('Project identifier'),
    column:             m.string('Kanban column name (e.g. "To Do", "In Progress")'),
    workflow_id:        m.number('Workflow/column ID (alternative to column name)'),
    effort_id:          m.number('Effort level ID').alias('config_issue_effort_id'),
    type_id:            m.number('Task type ID').alias('config_issue_type_id'),
    sprint_slug:        m.string('Sprint to add task to'),
    user_story_slug:    m.string('User story to link'),
    parent_id:          m.string('Parent task UUID for subtasks'),
    usernames:          m.string('Assigned member usernames').alias('members'),
    label_ids:          m.string('Label IDs to attach'),

    // ── Move/duplicate fields ────────────────────
    new_project_slug:   m.string('Target project identifier'),
    new_workflow_id:    m.number('Target column ID in the new project'),

    // ── Filter-only fields ───────────────────────
    per_page:           m.number('Results per page (default: 50)'),
    unassigned:         m.boolean('Only unassigned tasks'),
    created_at:         m.string('Created at filter'),
    closed_at:          m.string('Closed at filter'),
  });

  // ── $timestamps ───────────────────────────────
  m.timestamps();

  // ── $hidden — never shown to AI ──────────────
  m.hidden([
    'company', 'project',
    'task_code', 'company_slug', 'project_slug', 'column', 'workflow_id', 'effort_id', 'type_id',
    'sprint_slug', 'user_story_slug', 'parent_id', 'usernames', 'label_ids',
    'new_project_slug', 'new_workflow_id',
    'per_page', 'unassigned', 'created_at', 'closed_at',
  ]);

  // ── $guarded — never fillable ─────────────────
  m.guarded(['uuid', 'code', 'time_spent_minutes', 'created_at', 'updated_at']);

  // ── $fillable — input profiles per operation ──
  m.fillable({
    create: [
      'company_slug', 'project_slug',
      'title', 'description', 'due_date', 'start_date', 'estimated_minutes',
      'is_bug', 'is_blocker',
      'column', 'workflow_id', 'effort_id', 'type_id',
      'sprint_slug', 'user_story_slug', 'parent_id',
      'usernames', 'label_ids',
    ],
    update: [
      'company_slug', 'project_slug',
      'title', 'description', 'due_date', 'start_date', 'estimated_minutes',
      'is_bug', 'is_blocker', 'is_archived',
      'column', 'workflow_id', 'effort_id', 'type_id',
      'sprint_slug', 'user_story_slug',
      'usernames', 'label_ids',
    ],
    duplicate: [
      'uuid', 'company_slug', 'project_slug', 'workflow_id',
    ],
    move: [
      'uuid', 'company_slug', 'project_slug',
      'new_project_slug', 'new_workflow_id',
    ],
    filter: [
      'company_slug', 'project_slug',
      'title', 'description', 'status', 'due_date', 'start_date',
      'is_bug', 'is_blocker', 'is_archived',
      'per_page', 'unassigned', 'created_at', 'closed_at',
    ],
    lookup: [
      'task_code', 'company_slug', 'project_slug',
    ],
  });

});

export type Task = typeof TaskModel.infer;
