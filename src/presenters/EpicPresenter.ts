/**
 * EpicPresenter — View layer for Epic entities
 */
import { definePresenter, suggest } from '@vurb/core';
import { EpicModel } from '../models/EpicModel.js';

export const EpicPresenter = definePresenter({
  name: 'Epic',
  schema: EpicModel.schema,
  suggestActions: () => [
    suggest('user_story.list', 'View stories in this epic'),
    suggest('epic.update', 'Update epic'),
  ],
});
