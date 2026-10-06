/**
 * UserStoryPresenter — View layer for User Story entities
 */
import { definePresenter, suggest } from '@vurb/core';
import { UserStoryModel } from '../models/UserStoryModel.js';

export const UserStoryPresenter = definePresenter({
  name: 'UserStory',
  schema: UserStoryModel.schema,
  suggestActions: () => [
    suggest('user_story.get', 'View story details'),
    suggest('task.filter', 'List tasks in this story'),
  ],
});
