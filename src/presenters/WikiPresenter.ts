/**
 * WikiPresenter — View layer for Wiki Page entities
 */
import { definePresenter, suggest } from '@vurb/core';
import { WikiModel } from '../models/WikiModel.js';

export const WikiPresenter = definePresenter({
  name: 'WikiPage',
  schema: WikiModel.schema,
  suggestActions: () => [
    suggest('wiki.update', 'Edit page'),
    suggest('wiki.search', 'Search wiki'),
  ],
});
