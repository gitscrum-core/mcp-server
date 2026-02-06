/**
 * Tasks Tools Tests (Consolidated)
 * 
 * Tests for the unified task tool with action parameter
 */

import { describe, it, expect } from 'vitest';
import { handleTaskTool, registerTaskTools } from '../../src/tools/tasks.js';

// Mock client with correct method names
const mockClient = {
  getMyTasks: async () => [
    { uuid: 'task-1', title: 'Test Task', status: 'open', workflow: { title: 'In Progress' } }
  ],
  getTodayTasks: async () => [
    { uuid: 'task-2', title: 'Today Task', due_date: '2024-01-01' }
  ],
  getTask: async () => ({
    uuid: 'task-uuid',
    title: 'Task Details',
    description: 'Description',
  }),
  getSubTasks: async () => [
    { uuid: 'subtask-1', title: 'Subtask 1' }
  ],
  createTask: async () => ({
    uuid: 'new-task-uuid',
    title: 'New Task',
  }),
  updateTask: async () => ({
    uuid: 'task-uuid',
    title: 'Updated Task',
  }),
  completeTask: async () => ({
    uuid: 'task-uuid',
    status: 'done',
  }),
  searchTasks: async () => ({
    data: [{ uuid: 'task-1', title: 'Filtered Task' }],
    meta: { total: 1 },
  }),
  getProjectWorkflows: async () => [
    { id: 10, title: 'Todo' },
    { id: 20, title: 'In Progress' },
    { id: 30, title: 'Done' },
  ],
  getProjectLabels: async () => [
    { id: 100, title: 'Bug' },
    { id: 101, title: 'Feature' },
  ],
  getProjectTypes: async () => [
    { id: 200, title: 'Bug' },
    { id: 201, title: 'Feature' },
  ],
  getProjectEfforts: async () => [
    { id: 300, title: 'High' },
    { id: 301, title: 'Low' },
  ],
  getSprints: async () => ({
    data: [
      { id: 400, slug: 'sprint-1', title: 'Sprint 1' },
      { id: 401, slug: 'sprint-2', title: 'Sprint 2' },
    ],
  }),
  getUserStories: async () => ({
    data: [
      { id: 500, slug: 'story-1', title: 'User Story 1' },
    ],
  }),
  getTaskByCode: async () => ({
    uuid: 'task-uuid-by-code',
    title: 'Implement login',
    code: 'PROJ-123',
  }),
  duplicateTask: async () => ({
    uuid: 'duplicated-task-uuid',
    title: 'Implement login (copy)',
  }),
  moveTask: async () => ({
    message: 'Task move initiated',
    status: 'processing',
  }),
};

describe('Tasks Tools (Consolidated)', () => {
  describe('registerTaskTools', () => {
    it('should register the consolidated task tool', () => {
      const tools = registerTaskTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('task');
    });

    it('task tool should have action enum with all operations', () => {
      const tools = registerTaskTools();
      const taskTool = tools[0];
      const actionProp = taskTool.inputSchema.properties?.action as { enum: string[] };
      
      expect(actionProp.enum).toContain('my');
      expect(actionProp.enum).toContain('today');
      expect(actionProp.enum).toContain('get');
      expect(actionProp.enum).toContain('create');
      expect(actionProp.enum).toContain('update');
      expect(actionProp.enum).toContain('complete');
      expect(actionProp.enum).toContain('subtasks');
    });
  });

  describe('handleTaskTool - action:my', () => {
    it('should return user tasks', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', { action: 'my' });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('handleTaskTool - action:today', () => {
    it('should return today tasks', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', { action: 'today' });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('handleTaskTool - action:get', () => {
    it('should return task details when uuid provided', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'get',
        uuid: 'task-uuid',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Task');
    });

    it('should require uuid', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', { action: 'get' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('uuid required');
    });
  });

  describe('handleTaskTool - action:subtasks', () => {
    it('should return subtasks when uuid provided', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'subtasks',
        uuid: 'task-uuid',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text.split('---context')[0]);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should require uuid', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', { action: 'subtasks' });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleTaskTool - action:create', () => {
    it('should create a task with all required params', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'create',
        title: 'New Task',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created');
    });

    it('should create task with ALL optional fields in one call', async () => {
      let capturedData: any;
      const client = {
        ...mockClient,
        createTask: async (data: any) => { capturedData = data; return { uuid: 'new-uuid' }; },
      };
      const result = await handleTaskTool(client as any, 'task', {
        action: 'create',
        title: 'Full Task',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
        description: 'Description',
        column: 'In Progress',
        effort_id: 300,
        type_id: 200,
        sprint_slug: 'sprint-1',
        user_story_slug: 'story-1',
        usernames: ['alice'],
        due_date: '2026-12-31',
        start_date: '2026-01-01',
        estimated_minutes: 120,
        is_bug: true,
        is_blocker: false,
      });
      
      expect(result.isError).toBeUndefined();
      expect(capturedData.title).toBe('Full Task');
      expect(capturedData.workflow_id).toBe(20);
      expect(capturedData.effort_id).toBe(300);
      expect(capturedData.type_id).toBe(200);
      expect(capturedData.sprint_slug).toBe('sprint-1');
      expect(capturedData.user_story_slug).toBe('story-1');
      expect(capturedData.usernames).toEqual(['alice']);
      expect(capturedData.is_bug).toBe(true);
      expect(capturedData.is_blocker).toBe(false);
    });

    it('should require title, project_slug and company_slug', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'create',
        title: 'New Task',
      });
      
      expect(result.isError).toBe(true);
    });
  });

  describe('handleTaskTool - action:update', () => {
    it('should update a task', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'update',
        uuid: 'task-uuid',
        title: 'Updated Title',
        project_slug: 'test-project',
        company_slug: 'test-company',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('updated');
    });

    it('should require uuid', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', { action: 'update' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('uuid required');
    });
    
    it('should require project_slug and company_slug', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'update',
        uuid: 'task-uuid',
        title: 'Updated Title',
      });
      
      expect(result.isError).toBe(true);
    });

    it('should map effort_id to config_issue_effort_id', async () => {
      let capturedData: any;
      const client = {
        ...mockClient,
        updateTask: async (_uuid: string, data: any) => { capturedData = data; return {}; },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'update',
        uuid: 'task-uuid',
        effort_id: 300,
        project_slug: 'test-proj',
        company_slug: 'test-ws',
      });
      expect(capturedData.config_issue_effort_id).toBe(300);
      expect(capturedData.effort_id).toBeUndefined();
    });

    it('should map type_id to config_issue_type_id', async () => {
      let capturedData: any;
      const client = {
        ...mockClient,
        updateTask: async (_uuid: string, data: any) => { capturedData = data; return {}; },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'update',
        uuid: 'task-uuid',
        type_id: 200,
        project_slug: 'test-proj',
        company_slug: 'test-ws',
      });
      expect(capturedData.config_issue_type_id).toBe(200);
      expect(capturedData.type_id).toBeUndefined();
    });

    it('should resolve sprint_slug to sprint_id', async () => {
      let capturedData: any;
      const client = {
        ...mockClient,
        updateTask: async (_uuid: string, data: any) => { capturedData = data; return {}; },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'update',
        uuid: 'task-uuid',
        sprint_slug: 'sprint-1',
        project_slug: 'test-proj',
        company_slug: 'test-ws',
      });
      expect(capturedData.sprint_id).toBe(400);
    });

    it('should return error for unknown sprint_slug', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'update',
        uuid: 'task-uuid',
        sprint_slug: 'nonexistent-sprint',
        project_slug: 'test-proj',
        company_slug: 'test-ws',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('sprint_not_found');
    });

    it('should resolve user_story_slug to user_story_id', async () => {
      let capturedData: any;
      const client = {
        ...mockClient,
        updateTask: async (_uuid: string, data: any) => { capturedData = data; return {}; },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'update',
        uuid: 'task-uuid',
        user_story_slug: 'story-1',
        project_slug: 'test-proj',
        company_slug: 'test-ws',
      });
      expect(capturedData.user_story_id).toBe(500);
    });

    it('should return error for unknown user_story_slug', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'update',
        uuid: 'task-uuid',
        user_story_slug: 'nonexistent-story',
        project_slug: 'test-proj',
        company_slug: 'test-ws',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('user_story_not_found');
    });

    it('should map usernames to members', async () => {
      let capturedData: any;
      const client = {
        ...mockClient,
        updateTask: async (_uuid: string, data: any) => { capturedData = data; return {}; },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'update',
        uuid: 'task-uuid',
        usernames: ['alice', 'bob'],
        project_slug: 'test-proj',
        company_slug: 'test-ws',
      });
      expect(capturedData.members).toEqual(['alice', 'bob']);
    });

    it('should forward is_bug and is_blocker', async () => {
      let capturedData: any;
      const client = {
        ...mockClient,
        updateTask: async (_uuid: string, data: any) => { capturedData = data; return {}; },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'update',
        uuid: 'task-uuid',
        is_bug: true,
        is_blocker: true,
        project_slug: 'test-proj',
        company_slug: 'test-ws',
      });
      expect(capturedData.is_bug).toBe(true);
      expect(capturedData.is_blocker).toBe(true);
    });

    it('should resolve column name to workflow_id', async () => {
      let capturedData: any;
      const client = {
        ...mockClient,
        updateTask: async (_uuid: string, data: any) => { capturedData = data; return {}; },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'update',
        uuid: 'task-uuid',
        column: 'Done',
        project_slug: 'test-proj',
        company_slug: 'test-ws',
      });
      expect(capturedData.workflow_id).toBe(30);
    });
  });

  describe('handleTaskTool - action:complete', () => {
    it('should complete a task', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'complete',
        uuid: 'task-uuid',
      });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('completed');
    });

    it('should require uuid', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', { action: 'complete' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('uuid required');
    });
  });

  describe('handleTaskTool - unknown action', () => {
    it('should return error for unknown action', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', { action: 'unknown' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown action');
    });
  });

  describe('handleTaskTool - action:filter', () => {
    it('should require company_slug and project_slug', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', { action: 'filter' });
      expect(result.isError).toBe(true);
    });

    it('should filter tasks with no extra filters', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'filter',
        company_slug: 'test-ws',
        project_slug: 'test-proj',
      });
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Filtered Task');
    });

    it('should resolve workflow title to ID', async () => {
      let capturedFilters: any;
      const client = {
        ...mockClient,
        searchTasks: async (_p: any, _c: any, filters: any) => {
          capturedFilters = filters;
          return { data: [], meta: { total: 0 } };
        },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'filter',
        company_slug: 'test-ws',
        project_slug: 'test-proj',
        workflow: 'In Progress',
      });
      expect(capturedFilters.workflow).toBe('20');
    });

    it('should return error for unknown workflow title', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'filter',
        company_slug: 'test-ws',
        project_slug: 'test-proj',
        workflow: 'Nonexistent Column',
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('column_not_found');
    });

    it('should resolve label titles to IDs', async () => {
      let capturedFilters: any;
      const client = {
        ...mockClient,
        searchTasks: async (_p: any, _c: any, filters: any) => {
          capturedFilters = filters;
          return { data: [], meta: { total: 0 } };
        },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'filter',
        company_slug: 'test-ws',
        project_slug: 'test-proj',
        labels: 'Bug, Feature',
      });
      expect(capturedFilters.labels).toBe('100,101');
    });

    it('should resolve type title to ID', async () => {
      let capturedFilters: any;
      const client = {
        ...mockClient,
        searchTasks: async (_p: any, _c: any, filters: any) => {
          capturedFilters = filters;
          return { data: [], meta: { total: 0 } };
        },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'filter',
        company_slug: 'test-ws',
        project_slug: 'test-proj',
        type: 'Bug',
      });
      expect(capturedFilters.type).toBe('200');
    });

    it('should resolve effort title to ID', async () => {
      let capturedFilters: any;
      const client = {
        ...mockClient,
        searchTasks: async (_p: any, _c: any, filters: any) => {
          capturedFilters = filters;
          return { data: [], meta: { total: 0 } };
        },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'filter',
        company_slug: 'test-ws',
        project_slug: 'test-proj',
        effort: 'High',
      });
      expect(capturedFilters.effort).toBe('300');
    });

    it('should resolve sprint slug to ID', async () => {
      let capturedFilters: any;
      const client = {
        ...mockClient,
        searchTasks: async (_p: any, _c: any, filters: any) => {
          capturedFilters = filters;
          return { data: [], meta: { total: 0 } };
        },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'filter',
        company_slug: 'test-ws',
        project_slug: 'test-proj',
        sprint: 'sprint-1',
      });
      expect(capturedFilters.sprint).toBe('400');
    });

    it('should resolve user_story slug to ID', async () => {
      let capturedFilters: any;
      const client = {
        ...mockClient,
        searchTasks: async (_p: any, _c: any, filters: any) => {
          capturedFilters = filters;
          return { data: [], meta: { total: 0 } };
        },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'filter',
        company_slug: 'test-ws',
        project_slug: 'test-proj',
        user_story: 'story-1',
      });
      expect(capturedFilters.user_story).toBe('500');
    });

    it('should be case-insensitive for workflow resolution', async () => {
      let capturedFilters: any;
      const client = {
        ...mockClient,
        searchTasks: async (_p: any, _c: any, filters: any) => {
          capturedFilters = filters;
          return { data: [], meta: { total: 0 } };
        },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'filter',
        company_slug: 'test-ws',
        project_slug: 'test-proj',
        workflow: 'in progress',
      });
      expect(capturedFilters.workflow).toBe('20');
    });

    it('should pass status filter as-is (not resolved)', async () => {
      let capturedFilters: any;
      const client = {
        ...mockClient,
        searchTasks: async (_p: any, _c: any, filters: any) => {
          capturedFilters = filters;
          return { data: [], meta: { total: 0 } };
        },
      };
      await handleTaskTool(client as any, 'task', {
        action: 'filter',
        company_slug: 'test-ws',
        project_slug: 'test-proj',
        status: 'in-progress',
      });
      expect(capturedFilters.status).toBe('in-progress');
    });
  });

  describe('handleTaskTool - action:by_code', () => {
    it('should return task by code', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'by_code',
        task_code: 'PROJ-123',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text.split('---context')[0]);
      expect(data.code).toBe('PROJ-123');
    });

    it('should require task_code', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'by_code',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('task_code');
    });
  });

  describe('handleTaskTool - action:duplicate', () => {
    it('should duplicate task', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'duplicate',
        uuid: 'task-uuid',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require uuid', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'duplicate',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('uuid');
    });
  });

  describe('handleTaskTool - action:move', () => {
    it('should move task to another project', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'move',
        uuid: 'task-uuid',
        new_project_slug: 'target-project',
        new_workflow_id: 10,
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBeUndefined();
    });

    it('should require uuid, new_project_slug and new_workflow_id', async () => {
      const result = await handleTaskTool(mockClient as any, 'task', {
        action: 'move',
        project_slug: 'test-project',
        company_slug: 'test-workspace',
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('uuid');
    });
  });
});
