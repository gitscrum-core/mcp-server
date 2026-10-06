/**
 * TimeEntryModel — Domain Model for Time Tracking entries
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const TimeEntryModel = defineModel('TimeEntry', m => {

  m.casts({
    id:                 m.string('Time entry identifier'),
    task_uuid:          m.uuid('Associated task'),
    description:        m.text('Entry description'),
    duration_minutes:   m.number('Duration in minutes'),
    started_at:         m.timestamp('Start timestamp'),
    stopped_at:         m.timestamp('Stop timestamp'),
    is_active:          m.boolean('Currently tracking').default(false),

    // ── Input-only fields ────────────────────────
    time_tracking_id:   m.string("Active timer's ID from 'time.active'"),
    company_slug:       m.string('Workspace identifier'),
    project_slug:       m.string('Project identifier'),
    period:             m.string('Period: today, yesterday, last-7-days, last-14-days, this-month, last-month'),
    report_type:        m.string('Report type (default: summary)'),
    hourly_rate:        m.number('Hourly rate for cost calculations'),
  });

  m.hidden(['time_tracking_id', 'company_slug', 'project_slug', 'period', 'report_type', 'hourly_rate']);

  m.guarded(['id', 'duration_minutes', 'started_at', 'stopped_at', 'is_active']);

  m.fillable({
    start:  ['task_uuid', 'description'],
    stop:   ['time_tracking_id'],
    active: ['company_slug'],
    query:  ['company_slug', 'project_slug', 'period'],
    report: ['company_slug', 'project_slug', 'period', 'report_type', 'hourly_rate'],
  });

});

export type TimeEntry = typeof TimeEntryModel.infer;
