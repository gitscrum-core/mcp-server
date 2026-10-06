/**
 * ProjectPresenter — View layer for Project entities
 */
import { definePresenter, suggest } from '@vurb/core';
import { ProjectModel } from '../models/ProjectModel.js';

type Project = typeof ProjectModel.infer;

export const ProjectPresenter = definePresenter({
  name: 'Project',
  schema: ProjectModel.schema,
  rules: ['Always display the project slug alongside the title.'],
  suggestActions: (project: Project) => [
    suggest('project.stats', 'View project statistics'),
    suggest('project.workflows', 'View Kanban columns'),
    suggest('task.filter', `List tasks in "${project.title}"`),
    suggest('sprint.list', 'View project sprints'),
  ],
  collectionSuggestions: (projects: Project[]) => [
    projects.length > 5
      ? suggest('search.global', 'Search across all projects')
      : null,
  ],
});
