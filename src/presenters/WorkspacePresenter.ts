/**
 * WorkspacePresenter — View layer for Workspace entities
 */
import { definePresenter, suggest } from '@vurb/core';
import { WorkspaceModel } from '../models/WorkspaceModel.js';

export const WorkspacePresenter = definePresenter({
  name: 'Workspace',
  schema: WorkspaceModel.schema,
  suggestActions: () => [
    suggest('project.list', 'View workspace projects'),
    suggest('workspace.members', 'View team members'),
  ],
});
