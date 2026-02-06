/**
 * Tool Modules Initialization
 * 
 * Centralizes all tool module registration.
 * This provides a single source of truth for tool routing.
 */
import { registerModule, type ToolModule } from './toolRegistry.js';

// Tool handlers
import { registerAuthTools, handleAuthTool } from '../auth.js';
import { registerTaskTools, handleTaskTool } from '../tasks.js';
import { registerProjectTools, handleProjectTool } from '../projects.js';
import { registerSprintTools, handleSprintTool } from '../sprints.js';
import { registerTimeTrackingTools, handleTimeTrackingTool } from '../timeTracking.js';
import { registerUserStoryTools, handleUserStoryTool } from '../userStories.js';
import { registerWikiTools, handleWikiTool } from '../wiki.js';
import { registerSearchTools, handleSearchTool } from '../search.js';
import { registerNoteTools, handleNoteTool } from '../notes.js';
import { registerWorkflowTools, handleWorkflowTool } from '../workflows.js';
import { registerLabelTools, handleLabelTool } from '../labels.js';
import { registerTaskTypeTools, handleTaskTypeTool } from '../taskTypes.js';
import { registerClientFlowTools, handleClientFlowTool } from '../clientflow.js';
import { registerStandupTools, handleStandupTool } from '../standup.js';
import { registerCommentTools, handleCommentTool } from '../comments.js';
import { registerAnalyticsTools, handleAnalyticsTool } from '../analytics.js';
import { registerEpicTools, handleEpicTool } from '../epics.js';
import { registerDiscussionTools, handleDiscussionTool } from '../discussions.js';
import { registerActivityTools, handleActivityTool } from '../activity.js';
import { registerBudgetTools, handleBudgetTool } from '../budget.js';

// ============================================================================
// Tool Module Definitions
// ============================================================================

const authModule: ToolModule = {
  tools: registerAuthTools(),
  handler: handleAuthTool,
  handles: ['auth_login', 'auth_complete', 'auth_status', 'auth_logout'],
};

const taskModule: ToolModule = {
  tools: registerTaskTools(),
  handler: handleTaskTool,
  handles: ['task'],
};

const projectModule: ToolModule = {
  tools: registerProjectTools(),
  handler: handleProjectTool,
  handles: ['project', 'workspace'],
};

const sprintModule: ToolModule = {
  tools: registerSprintTools(),
  handler: handleSprintTool,
  handles: ['sprint'],
};

const timeTrackingModule: ToolModule = {
  tools: registerTimeTrackingTools(),
  handler: handleTimeTrackingTool,
  handles: ['time'],
};

const userStoryModule: ToolModule = {
  tools: registerUserStoryTools(),
  handler: handleUserStoryTool,
  handles: ['user_story'],
};

const wikiModule: ToolModule = {
  tools: registerWikiTools(),
  handler: handleWikiTool,
  handles: ['wiki'],
};

const searchModule: ToolModule = {
  tools: registerSearchTools(),
  handler: handleSearchTool,
  handles: ['search'],
};

const noteModule: ToolModule = {
  tools: registerNoteTools(),
  handler: handleNoteTool,
  handles: ['note', 'note_folder'],
};

const workflowModule: ToolModule = {
  tools: registerWorkflowTools(),
  handler: handleWorkflowTool,
  handles: ['workflow'],
};

const labelModule: ToolModule = {
  tools: registerLabelTools(),
  handler: handleLabelTool,
  handles: ['label'],
};

const taskTypeModule: ToolModule = {
  tools: registerTaskTypeTools(),
  handler: handleTaskTypeTool,
  handles: ['task_type'],
};

const clientFlowModule: ToolModule = {
  tools: registerClientFlowTools(),
  handler: handleClientFlowTool,
  handles: ['client', 'invoice', 'proposal', 'clientflow_dashboard', 'clientflow_cross_workspace'],
};

const standupModule: ToolModule = {
  tools: registerStandupTools(),
  handler: handleStandupTool,
  handles: ['standup'],
};

const commentModule: ToolModule = {
  tools: registerCommentTools(),
  handler: handleCommentTool,
  handles: ['comment'],
};

const analyticsModule: ToolModule = {
  tools: registerAnalyticsTools(),
  handler: handleAnalyticsTool,
  handles: ['analytics'],
};

const epicModule: ToolModule = {
  tools: registerEpicTools(),
  handler: handleEpicTool,
  handles: ['epic'],
};

const discussionModule: ToolModule = {
  tools: registerDiscussionTools(),
  handler: handleDiscussionTool,
  handles: ['discussion'],
};

const activityModule: ToolModule = {
  tools: registerActivityTools(),
  handler: handleActivityTool,
  handles: ['activity'],
};

const budgetModule: ToolModule = {
  tools: registerBudgetTools(),
  handler: handleBudgetTool,
  handles: ['budget'],
};

// ============================================================================
// Initialize All Modules
// ============================================================================

/**
 * Registers all tool modules with the central registry.
 * Call this once during server initialization.
 */
export function initializeToolModules(): void {
  const modules = [
    authModule,
    taskModule,
    projectModule,
    sprintModule,
    timeTrackingModule,
    userStoryModule,
    wikiModule,
    searchModule,
    noteModule,
    workflowModule,
    labelModule,
    taskTypeModule,
    clientFlowModule,
    standupModule,
    commentModule,
    analyticsModule,
    epicModule,
    discussionModule,
    activityModule,
    budgetModule,
  ];

  for (const module of modules) {
    registerModule(module);
  }
}
