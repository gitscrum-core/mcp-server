/**
 * SubtaskModel — Domain Model for Subtask entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const SubtaskModel = defineModel('Subtask', m => {

  m.casts({
    uuid:         m.uuid('Subtask unique identifier'),
    title:        m.string('Subtask title'),
    status:       m.string('Subtask status'),
    is_completed: m.boolean('Completion flag').default(false),
  });

});

export type Subtask = typeof SubtaskModel.infer;
