/**
 * TimeEntryPresenter — View layer for Time Tracking entries
 */
import { definePresenter, suggest } from '@vurb/core';
import { TimeEntryModel } from '../models/TimeEntryModel.js';

export const TimeEntryPresenter = definePresenter({
  name: 'TimeEntry',
  schema: TimeEntryModel.schema,
  rules: [
    'Duration is in minutes. Convert to hours:minutes for display (e.g. 90 → 1h 30m).',
  ],
  suggestActions: () => [
    suggest('time.stop', 'Stop the active timer'),
    suggest('time.analytics', 'View time analytics'),
  ],
});
