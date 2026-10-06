/**
 * UserStoryModel — Domain Model for User Story entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const UserStoryModel = defineModel('UserStory', m => {

  m.casts({
    id:               m.id('User story identifier'),
    slug:             m.string('User story slug'),
    title:            m.string('User story title'),
    description:      m.text('User story description').alias('additional_information'),
    priority:         m.string('Priority level'),
    tasks_count:      m.number('Associated tasks count'),

    // ── Input-only fields ────────────────────────
    company_slug:     m.string('Workspace identifier'),
    project_slug:     m.string('Project identifier'),
    user_story_slug:  m.string('User story identifier'),
    epic_uuid:        m.string('Link to an epic'),
  });

  m.hidden(['company_slug', 'project_slug', 'user_story_slug', 'epic_uuid']);

  m.guarded(['id', 'slug', 'tasks_count']);

  m.fillable({
    create: ['company_slug', 'project_slug', 'title', 'description', 'priority', 'epic_uuid'],
    update: ['company_slug', 'project_slug', 'user_story_slug', 'title', 'description', 'priority', 'epic_uuid'],
    query:  ['company_slug', 'project_slug', 'user_story_slug'],
  });

});

export type UserStory = typeof UserStoryModel.infer;
