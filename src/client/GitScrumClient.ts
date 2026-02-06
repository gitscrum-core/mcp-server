/**
 * GitScrum API Client
 *
 * HTTP client for communicating with the GitScrum REST API.
 * Provides type-safe methods for all GitScrum resources including
 * tasks, projects, sprints, time tracking, and ClientFlow CRM.
 *
 * Features:
 * - JWT authentication with secure token storage
 * - Comprehensive error handling with user-friendly messages
 * - Rate limiting and retry logic
 * - Full TypeScript support
 *
 * @module @gitscrum-studio/mcp-server/client
 * @author GitScrum <hello@gitscrum.com>
 * @license MIT
 */

import { TokenManager } from "../auth/TokenManager.js";


export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export class GitScrumClient {
  private baseUrl: string;
  private token: string;
  private tokenManager: TokenManager;

  constructor() {
    this.baseUrl = process.env.GITSCRUM_API_URL || "https://services.gitscrum.com";
    this.tokenManager = new TokenManager();
    
    // Try to get token from environment or saved file
    this.token = this.tokenManager.getToken() || "";

    if (!this.token) {
      console.error("Warning: No authentication token found. Use auth_login tool to authenticate.");
    }
  }

  /**
   * Set the authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Logout and invalidate token
   */
  async logout(): Promise<void> {
    if (this.token) {
      try {
        await this.post("auth/logout", {});
      } catch {
        // Ignore errors during logout
      }
    }
    this.token = "";
  }

  /**
   * Make an authenticated request to the GitScrum API
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/${endpoint.replace(/^\//, "")}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Client-Type": "mcp",
        "X-Client-Source": "mcp-server",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiError;
      const errorMessage = errorData.message || `API Error: ${response.status}`;
      
      // Handle 400 Bad Request - validation or invalid input
      if (response.status === 400) {
        throw new Error(`Invalid request: ${errorMessage}`);
      }
      
      // Handle 401 Unauthorized - authentication issue
      if (response.status === 401) {
        throw new Error("Session expired. Authentication required. Use login to reconnect.");
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error(`Access denied: ${errorMessage}`);
      }
      
      // Handle 404 Not Found
      if (response.status === 404) {
        throw new Error("Resource not found or was deleted.");
      }
      
      // Handle 409 Conflict - resource conflict (e.g., duplicate, pending operation)
      if (response.status === 409) {
        throw new Error(`Conflict: ${errorMessage}`);
      }
      
      // Handle 422 Unprocessable Entity - validation errors
      if (response.status === 422) {
        throw new Error(JSON.stringify({ 
          error: "validation_failed", 
          message: errorMessage, 
          validation_errors: errorData.errors 
        }));
      }
      
      // Handle 429 Too Many Requests - MCP rate limit exceeded
      if (response.status === 429) {
        throw new Error(JSON.stringify({
          error: "rate_limit_exceeded",
          limit: response.headers.get("X-MCP-RateLimit-Limit"),
          remaining: response.headers.get("X-MCP-RateLimit-Remaining"),
          reset: response.headers.get("X-MCP-RateLimit-Reset"),
          upgrade_url: "https://gitscrum.com/pricing"
        }));
      }
      
      // Handle 500+ Server Errors
      if (response.status >= 500) {
        throw new Error(`Server error: ${errorMessage}`);
      }

      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  }

  /**
   * GET request helper
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, { method: "GET" });
  }

  /**
   * POST request helper
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request helper
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // ============================================================================
  // AUTH / USER
  // ============================================================================

  /**
   * Get current authenticated user
   */
  async getMe(): Promise<unknown> {
    const response = await this.post<{ data: unknown }>("auth/me");
    return response.data;
  }

  // ============================================================================
  // WORKSPACES (Companies)
  // ============================================================================

  /**
   * Get all workspaces the user has access to (with pagination metadata)
   * Uses the new /workspaces endpoint with proper pagination
   */
  async getWorkspaces(options?: { perPage?: number; page?: number; search?: string }): Promise<ApiResponse<unknown[]>> {
    const params: Record<string, string | number> = {};
    if (options?.perPage) params.per_page = options.perPage;
    if (options?.page) params.page = options.page;
    if (options?.search) params.search = options.search;
    
    const response = await this.get<ApiResponse<unknown[]>>("workspaces", params);
    return response;
  }

  /**
   * Find workspace by name and return slug
   * Searches workspaces by name and returns the first match with its slug
   */
  async findWorkspaceByName(name: string): Promise<{ slug: string; name: string } | null> {
    const response = await this.getWorkspaces({ search: name, perPage: 5 });
    const workspaces = response.data as Array<{ slug: string; name: string }>;
    
    if (!workspaces || workspaces.length === 0) {
      return null;
    }
    
    // Return exact match if found, otherwise first result
    const exactMatch = workspaces.find(
      w => w.name.toLowerCase() === name.toLowerCase()
    );
    
    return exactMatch || workspaces[0];
  }

  /**
   * Get workspace details
   */
  async getWorkspace(slug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`workspaces/${slug}`);
    return response.data;
  }

  /**
   * Get workspace statistics
   */
  async getWorkspaceStats(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`workspaces/${companySlug}/stats`);
    return response.data;
  }

  // ============================================================================
  // PROJECTS
  // ============================================================================

  /**
   * Create a new project in a workspace
   */
  async createProject(
    companySlug: string,
    data: {
      name: string;
      description?: string;
      visibility?: 'public' | 'private';
      client_uuid?: string;
      budget?: number;
      start_date?: string;
      due_date?: string;
    }
  ): Promise<{ project_slug: string; name: string }> {
    const response = await this.post<{ data: { slug: string; name: string } }>(
      `projects?company_slug=${companySlug}`,
      data
    );
    return {
      project_slug: response.data.slug,
      name: response.data.name,
    };
  }

  /**
   * Get all projects in a workspace (with pagination metadata)
   */
  async getProjects(companySlug: string, options?: { status?: string; perPage?: number }): Promise<ApiResponse<unknown[]>> {
    const params: Record<string, string | number> = {
      company_slug: companySlug,
      per_page: options?.perPage ?? 100,
    };
    if (options?.status) {
      params.status = options.status;
    }
    const response = await this.get<ApiResponse<unknown[]>>("projects", params);
    return response;
  }

  /**
   * Find project by name within a workspace and return slug info
   * Uses search endpoint to find project by name
   */
  async findProjectByName(name: string, companySlug?: string): Promise<{ 
    project_slug: string; 
    company_slug: string; 
    name: string;
    workspace_slug: string;
  } | null> {
    const results = await this.search(name, {
      company_slug: companySlug,
      categories: 'projects',
      limit: 5,
    }) as { projects?: { items: Array<{ title: string; route: string }> } };
    
    const projects = results?.projects?.items;
    if (!projects || projects.length === 0) {
      return null;
    }
    
    // Parse route to extract slugs: "/{company_slug}/projects/{project_slug}"
    const parseRoute = (route: string): { company_slug: string; project_slug: string } | null => {
      const match = route.match(/^\/([^/]+)\/projects\/([^/]+)$/);
      if (match) {
        return { company_slug: match[1], project_slug: match[2] };
      }
      return null;
    };
    
    // Find exact match first
    const exactMatch = projects.find(
      p => p.title.toLowerCase() === name.toLowerCase()
    );
    
    const project = exactMatch || projects[0];
    const slugs = parseRoute(project.route);
    
    if (!slugs) {
      return null;
    }
    
    return {
      project_slug: slugs.project_slug,
      company_slug: slugs.company_slug,
      name: project.title,
      workspace_slug: companySlug || slugs.company_slug,
    };
  }

  /**
   * Get project details
   */
  async getProject(projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`projects/${projectSlug}`, {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get project workflows/statuses (Kanban columns)
   */
  async getProjectWorkflows(projectSlug: string, companySlug: string): Promise<unknown[]> {
    const response = await this.get<{ data: unknown[] }>("project-templates/workflow", {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Create a new workflow/column in a project Kanban board
   */
  async createWorkflow(
    projectSlug: string,
    companySlug: string,
    data: {
      title: string;
      color?: string;
      status?: number;
    }
  ): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(
      `projects-workflows/?company_slug=${companySlug}&project_slug=${projectSlug}`,
      data
    );
    return response.data;
  }

  /**
   * Update an existing workflow/column
   */
  async updateWorkflow(
    workflowId: number,
    companySlug: string,
    projectSlug: string,
    data: {
      title?: string;
      color?: string;
      status?: number;
      position?: number;
    }
  ): Promise<void> {
    await this.put(
      `projects-workflows/${workflowId}/?company_slug=${companySlug}&project_slug=${projectSlug}`,
      data
    );
  }

  /**
   * Get project task types
   */
  async getProjectTypes(projectSlug: string, companySlug: string): Promise<unknown[]> {
    const response = await this.get<{ data: unknown[] }>("project-templates/type", {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get project efforts/priorities
   */
  async getProjectEfforts(projectSlug: string, companySlug: string): Promise<unknown[]> {
    const response = await this.get<{ data: unknown[] }>("project-templates/effort", {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get project labels
   */
  async getProjectLabels(projectSlug: string, companySlug: string): Promise<unknown[]> {
    const response = await this.get<{ data: unknown[] }>("task-labels", {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get project members/assignees
   * Returns usernames that can be assigned to tasks
   */
  async getProjectMembers(projectSlug: string, companySlug: string): Promise<unknown[]> {
    // Returns direct array of assignees with uuid, name, username, avatar
    const response = await this.get<unknown[]>(`project-members/${projectSlug}/assignees`, {
      company_slug: companySlug,
    });
    return response;
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`projects/${projectSlug}/stats`, {
      company_slug: companySlug,
    });
    return response.data;
  }

  // ============================================================================
  // TASKS
  // ============================================================================

  /**
   * Get all tasks assigned to current user across all workspaces (with pagination metadata)
   */
  async getMyTasks(perPage: number = 100): Promise<ApiResponse<unknown[]>> {
    const response = await this.get<ApiResponse<unknown[]>>("tasks/all-workspaces", {
      per_page: perPage,
    });
    return response;
  }

  /**
   * Get user notifications (mentions, assignments, updates)
   */
  async getNotifications(): Promise<unknown[]> {
    const response = await this.get<{ data: unknown[] }>("feeds/notifications");
    return response.data || [];
  }

  /**
   * Get unread notification count
   */
  async getNotificationCount(): Promise<number> {
    const response = await this.get<{ data: number }>("feeds/notifications/count");
    return response.data || 0;
  }

  /**
   * Get today's tasks for current user (with pagination metadata)
   */
  async getTodayTasks(limit: number = 50): Promise<ApiResponse<unknown[]>> {
    const response = await this.get<ApiResponse<unknown[]>>("tasks/my-today", {
      limit,
    });
    return response;
  }

  /**
   * Get task details by UUID
   */
  async getTask(uuid: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`tasks/${uuid}`);
    return response.data;
  }

  /**
   * Get tasks in a project (with pagination metadata)
   */
  async getProjectTasks(projectSlug: string, companySlug: string, perPage: number = 100): Promise<ApiResponse<unknown[]>> {
    const response = await this.get<ApiResponse<unknown[]>>("tasks", {
      project_slug: projectSlug,
      company_slug: companySlug,
      per_page: perPage,
    });
    return response;
  }

  /**
   * Advanced task search with comprehensive filters
   * Supports filtering by workflow (status/column), labels, types, efforts, sprints, user stories,
   * date ranges, assignees, flags (blocker, bug, unassigned), and text search.
   */
  async searchTasks(
    projectSlug: string,
    companySlug: string,
    filters: {
      // Text search
      title?: string;
      description?: string;
      number?: string;
      // Workflow/column filter (use title from project_get_workflows)
      workflow?: string;
      // Labels (comma-separated titles from project_get_labels)
      labels?: string;
      // Type filter (title from project_get_types)
      type?: string;
      // Effort/priority filter (title from project_get_efforts) 
      effort?: string;
      sprint?: string;
      user_story?: string;
      status?: string;
      start_date?: string;
      due_date?: string;
      created_at?: string;
      closed_at?: string;
      // Assignees (comma-separated usernames)
      users?: string;
      // Flags
      is_blocker?: boolean;
      is_bug?: boolean;
      unassigned?: boolean;
      // Archived tasks
      is_archived?: boolean;
      // Pagination
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<ApiResponse<unknown[]>> {
    const params: Record<string, string | number | boolean> = {
      project_slug: projectSlug,
      company_slug: companySlug,
      per_page: filters.per_page || 50,
    };

    if (filters.page) params.page = filters.page;
    if (filters.title) params.title = filters.title;
    if (filters.description) params.description = filters.description;
    if (filters.number) params.number = filters.number;
    if (filters.status) params.status = filters.status;
    if (filters.users) params.users = filters.users;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.due_date) params.due_date = filters.due_date;
    if (filters.created_at) params.created_at = filters.created_at;
    if (filters.closed_at) params.closed_at = filters.closed_at;
    if (filters.is_blocker) params.is_blocker = 1;
    if (filters.is_bug) params.is_bug = 1;
    if (filters.unassigned) params.unassigned = 1;
    if (filters.is_archived) params.is_archived = 1;

    if (filters.workflow) params.workflows = filters.workflow;
    if (filters.labels) params.labels = filters.labels;
    if (filters.type) params.types = filters.type;
    if (filters.effort) params.efforts = filters.effort;
    if (filters.sprint) params.sprints = filters.sprint;
    if (filters.user_story) params.user_stories = filters.user_story;

    return this.get<ApiResponse<unknown[]>>("tasks", params);
  }

  /**
   * Create a new task
   *
   * @param data - Task creation data
   * @param data.title - Task title (required)
   * @param data.project_slug - Project slug (required)
   * @param data.company_slug - Workspace slug (required)
   * @param data.description - Task description
   * @param data.workflow_id - Workflow/status ID (use project_get_workflows to discover)
   * @param data.effort_id - Effort/priority ID (use project_get_efforts to discover)
   * @param data.type_id - Task type ID (use project_get_types to discover)
   * @param data.usernames - Array of usernames to assign (use project_get_members to discover)
   * @param data.label_ids - Array of label IDs (use project_get_labels to discover)
   * @param data.board_id - Board UUID (from project boards)
   * @param data.due_date - Due date (YYYY-MM-DD)
   * @param data.start_date - Start date (YYYY-MM-DD)
   * @param data.estimated_minutes - Time estimate in minutes
   * @param data.sprint_slug - Sprint slug to add task to
   * @param data.user_story_slug - User story slug
   * @param data.parent_id - Parent task UUID for subtasks
   */
  async createTask(data: {
    title: string;
    project_slug: string;
    company_slug: string;
    description?: string;
    workflow_id?: number;
    effort_id?: number;
    type_id?: number;
    usernames?: string[];
    label_ids?: number[];
    board_id?: string;
    due_date?: string;
    start_date?: string;
    estimated_minutes?: number;
    sprint_slug?: string;
    user_story_slug?: string;
    parent_id?: string;
    is_bug?: boolean;
    is_blocker?: boolean;
  }): Promise<unknown> {
    const response = await this.post<{ data: unknown }>("tasks", data);
    return response.data;
  }

  /**
   * Update a task
   */
  async updateTask(uuid: string, data: Record<string, unknown>): Promise<unknown> {
    const response = await this.put<{ data: unknown }>(`tasks/${uuid}`, data);
    return response.data;
  }

  /**
   * Complete a task
   */
  async completeTask(uuid: string): Promise<unknown> {
    const response = await this.put<{ data: unknown; message: string; done: boolean; workflow: { slug: string; title: string } }>(`tasks/${uuid}/complete`, {});
    return response;
  }

  /**
   * Get sub-tasks
   */
  async getSubTasks(taskUuid: string): Promise<unknown[]> {
    const response = await this.get<{ data: unknown[] }>(`tasks/${taskUuid}/sub-tasks`);
    return response.data;
  }

  // ============================================================================
  // SPRINTS
  // ============================================================================

  /**
   * Get sprints in a project (with pagination metadata)
   */
  async getSprints(projectSlug: string, companySlug: string): Promise<ApiResponse<unknown[]>> {
    const response = await this.get<ApiResponse<unknown[]>>("sprints", {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response;
  }

  /**
   * Get all sprints across workspaces (with pagination metadata)
   */
  async getAllSprints(): Promise<ApiResponse<unknown[]>> {
    const response = await this.get<ApiResponse<unknown[]>>("sprints/all-workspaces");
    return response;
  }

  /**
   * Get sprint details
   */
  async getSprint(slug: string, projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`sprints/${slug}`, {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get sprint KPIs
   */
  async getSprintKPIs(slug: string, projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`sprints/${slug}/kpis`, {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Create a new sprint
   */
  async createSprint(
    projectSlug: string,
    companySlug: string,
    data: {
      title: string;
      description?: string;
      date_start?: string;
      date_finish?: string;
      sprint_status_id?: string;
      color?: string;
      is_private?: boolean;
      close_on_finish?: boolean;
    }
  ): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(
      `sprints?company_slug=${companySlug}&project_slug=${projectSlug}`,
      data
    );
    return response.data;
  }

  /**
   * Update an existing sprint
   */
  async updateSprint(
    slug: string,
    projectSlug: string,
    companySlug: string,
    data: {
      title?: string;
      description?: string;
      date_start?: string;
      date_finish?: string;
      sprint_status_slug?: string;
      color?: string;
      is_private?: boolean;
      close_on_finish?: boolean;
    }
  ): Promise<void> {
    await this.put<Record<string, never>>(
      `sprints/${slug}?company_slug=${companySlug}&project_slug=${projectSlug}`,
      data
    );
  }

  // ============================================================================
  // TIME TRACKING
  // ============================================================================

  /**
   * Get active timer
   */
  async getActiveTimer(companySlug?: string): Promise<unknown | null> {
    const params: Record<string, string> = {};
    if (companySlug) params.company_slug = companySlug;
    const response = await this.get<{ data: unknown | null }>("time-trackings/active", params);
    return response.data;
  }

  /**
   * Start timer for a task
   */
  async startTimer(taskUuid: string, description?: string): Promise<unknown> {
    const response = await this.post<{ data: unknown }>("time-trackings", {
      task_uuid: taskUuid,
      work_description: description,
    });
    return response.data;
  }

  /**
   * Stop timer
   *
   * @param timeTrackingId - ID of the time tracker to stop
   */
  async stopTimer(timeTrackingId: string): Promise<unknown> {
    const response = await this.put<{ data: unknown }>(`time-trackings/${timeTrackingId}`, {
      end: new Date().toISOString(),
    });
    return response.data;
  }

  /**
   * Get time logs for a project
   */
  async getTimeLogs(projectSlug: string, companySlug: string): Promise<unknown[]> {
    const response = await this.get<{ data: unknown[] }>("time-trackings", {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  // ============================================================================
  // USER STORIES
  // ============================================================================

  /**
   * Get user stories in a project (with pagination metadata)
   */
  async getUserStories(projectSlug: string, companySlug: string): Promise<ApiResponse<unknown[]>> {
    const response = await this.get<ApiResponse<unknown[]>>("user-stories", {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response;
  }

  /**
   * Get user story details
   */
  async getUserStory(slug: string, projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`user-stories/${slug}`, {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Create user story
   */
  async createUserStory(data: {
    title: string;
    project_slug: string;
    company_slug: string;
    additional_information?: string;
    acceptance_criteria?: string;
    epic_uuid?: string;
    user_story_priority_id?: number;
  }): Promise<unknown> {
    const response = await this.post<{ data: unknown }>("user-stories", data);
    return response.data;
  }

  /**
   * Update user story
   */
  async updateUserStory(slug: string, data: {
    project_slug: string;
    company_slug: string;
    title?: string;
    additional_information?: string;
    acceptance_criteria?: string;
    epic_uuid?: string;
    user_story_priority_id?: number;
  }): Promise<unknown> {
    const response = await this.put<unknown>(`user-stories/${slug}`, data);
    return response;
  }

  // ============================================================================
  // WIKI
  // ============================================================================

  /**
   * Get wiki pages in a project
   */
  async getWikiPages(projectSlug: string, companySlug: string): Promise<unknown[]> {
    const response = await this.get<{ data: unknown[] }>("wiki/pages", {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get wiki page content
   */
  async getWikiPage(uuid: string, projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`wiki/pages/${uuid}`, {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Create wiki page
   */
  async createWikiPage(data: {
    title: string;
    content: string;
    project_slug: string;
    company_slug: string;
    parent_uuid?: string;
  }): Promise<unknown> {
    const response = await this.post<{ data: unknown }>("wiki/pages", data);
    return response.data;
  }

  /**
   * Update wiki page
   */
  async updateWikiPage(uuid: string, projectSlug: string, companySlug: string, data: { title?: string; content?: string }): Promise<unknown> {
    const response = await this.put<{ data: unknown }>(`wiki/pages/${uuid}`, {
      ...data,
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  // ============================================================================
  // SEARCH
  // ============================================================================

  /**
   * Global search across all entities
   *
   * @param query - Search query string (min 2 chars)
   * @param options - Search options
   * @param options.company_slug - Optional workspace to search in (searches all if omitted)
   * @param options.categories - Comma-separated categories: tasks,projects,user_stories,sprints,wiki,notes
   * @param options.limit - Max results per category (default 5)
   */
  async search(query: string, options?: {
    company_slug?: string;
    categories?: string;
    limit?: number;
  }): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {
      q: query,
    };

    if (options?.company_slug) {
      params.company_slug = options.company_slug;
    }
    if (options?.categories) {
      params.categories = options.categories;
    }
    if (options?.limit) {
      params.limit = options.limit;
    }

    const response = await this.get<{ data: unknown }>("search", params);
    return response.data;
  }

  // ============================================================================
  // NOTEVAULT - NOTES
  // ============================================================================

  /**
   * Get all notes for the current user
   */
  async getNotes(companySlug?: string, options?: {
    folder_uuid?: string;
    color?: string;
    search?: string;
  }): Promise<unknown> {
    const params: Record<string, string> = {};
    if (companySlug) params.company_slug = companySlug;
    if (options?.folder_uuid) params.folder_uuid = options.folder_uuid;
    if (options?.color) params.color = options.color;
    if (options?.search) params.search = options.search;
    const response = await this.get<{ data: unknown }>("notes", params);
    return response.data;
  }

  /**
   * Get a specific note by UUID
   */
  async getNote(uuid: string, companySlug?: string): Promise<unknown> {
    const params: Record<string, string> = {};
    if (companySlug) params.company_slug = companySlug;
    const response = await this.get<{ data: unknown }>(`notes/${uuid}`, params);
    return response.data;
  }

  /**
   * Create a new note
   */
  async createNote(data: {
    title?: string;
    content?: string;
    company_slug?: string;
    folder_uuid?: string;
    color?: string;
  }): Promise<unknown> {
    const response = await this.post<{ data: unknown }>("notes", data);
    return response.data;
  }

  /**
   * Update an existing note
   */
  async updateNote(uuid: string, data: {
    title?: string;
    content?: string;
    folder_uuid?: string;
    color?: string;
  }): Promise<unknown> {
    const response = await this.put<{ data: unknown }>(`notes/${uuid}`, data);
    return response.data;
  }

  /**
   * Toggle note sharing (enable/disable public link)
   */
  async toggleNoteShare(uuid: string): Promise<unknown> {
    const response = await this.put<{ data: unknown }>(`notes/${uuid}/share/toggle`, {});
    return response.data;
  }

  /**
   * Get note revision history
   */
  async getNoteRevisions(uuid: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`notes/${uuid}/revisions`, {
      company_slug: companySlug,
    });
    return response.data;
  }

  // ============================================================================
  // NOTEVAULT - FOLDERS
  // ============================================================================

  /**
   * Get all note folders
   */
  async getNoteFolders(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("note-folders", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Create a new note folder
   */
  async createNoteFolder(data: {
    name: string;
    company_slug: string;
  }): Promise<unknown> {
    const response = await this.post<{ data: unknown }>("note-folders", data);
    return response.data;
  }

  /**
   * Update a note folder
   */
  async updateNoteFolder(uuid: string, data: {
    name?: string;
  }): Promise<unknown> {
    const response = await this.put<{ data: unknown }>(`note-folders/${uuid}`, data);
    return response.data;
  }

  /**
   * Move a note to a folder
   */
  async moveNoteToFolder(noteUuid: string, folderUuid: string | null): Promise<unknown> {
    const response = await this.post<{ success: boolean }>("note-folders/move-note", {
      note_uuid: noteUuid,
      folder_uuid: folderUuid,
    });
    return response;
  }

  // ============================================================================
  // CLIENTFLOW - CLIENTS
  // ============================================================================

  /**
   * Get all clients
   */
  async getClients(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("contact-companies/clients", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get client details
   */
  async getClient(uuid: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`contact-companies/${uuid}`, {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get client statistics
   */
  async getClientStats(uuid: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`contact-companies/${uuid}/stats`, {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Create a new client
   */
  async createClient(data: {
    name: string;
    email?: string;
    phone?: string;
    company_slug: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    country?: string;
    postcode?: string;
    vat_number?: string;
    website?: string;
    notes?: string;
  }): Promise<unknown> {
    const response = await this.post<{ data: unknown }>("contact-companies", data);
    return response.data;
  }

  /**
   * Update a client
   */
  async updateClient(uuid: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    country?: string;
    postcode?: string;
    vat_number?: string;
    website?: string;
    notes?: string;
  }): Promise<unknown> {
    const response = await this.put<{ data: unknown }>(`contact-companies/${uuid}`, data);
    return response.data;
  }

  // ============================================================================
  // CLIENTFLOW - INVOICES
  // ============================================================================

  /**
   * Get all invoices
   */
  async getInvoices(companySlug: string, options?: {
    status?: string;
    client_uuid?: string;
  }): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("company-invoices", {
      company_slug: companySlug,
      ...options,
    });
    return response.data;
  }

  /**
   * Get invoice details
   */
  async getInvoice(uuid: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`company-invoices/${uuid}`, {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("company-invoices/stats", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Create an invoice
   */
  async createInvoice(data: {
    contact_company_uuid: string;
    company_slug: string;
    payment_due_at?: string;
    extra_notes?: string;
    currency?: string;
  }): Promise<unknown> {
    const response = await this.post<{ data: unknown }>("company-invoices", data);
    return response.data;
  }

  /**
   * Update an invoice
   */
  async updateInvoice(uuid: string, data: {
    payment_due_at?: string;
    extra_notes?: string;
  }): Promise<unknown> {
    const response = await this.put<{ data: unknown }>(`company-invoices/${uuid}`, data);
    return response.data;
  }

  /**
   * Issue/publish an invoice
   */
  async issueInvoice(uuid: string): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(`company-invoices/${uuid}/issue`, {});
    return response.data;
  }

  /**
   * Send invoice to client
   */
  async sendInvoice(uuid: string): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(`company-invoices/${uuid}/send`, {});
    return response.data;
  }

  /**
   * Mark invoice as paid
   */
  async markInvoicePaid(uuid: string): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(`company-invoices/${uuid}/paid`, {});
    return response.data;
  }

  // ============================================================================
  // CLIENTFLOW - PROPOSALS
  // ============================================================================

  /**
   * Get all proposals
   */
  async getProposals(companySlug: string, options?: {
    status?: string;
    client_uuid?: string;
  }): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("proposals", {
      company_slug: companySlug,
      ...options,
    });
    return response.data;
  }

  /**
   * Get proposal details
   */
  async getProposal(uuid: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`proposals/${uuid}`, {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get proposal statistics
   */
  async getProposalStats(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("proposals/stats", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Create a proposal
   */
  async createProposal(data: {
    title: string;
    client_uuid?: string;
    company_slug: string;
    description?: string;
    total_value?: number;
    expires_at?: string;
    currency?: string;
  }): Promise<unknown> {
    const response = await this.post<{ data: unknown }>("proposals", data);
    return response.data;
  }

  /**
   * Update a proposal
   */
  async updateProposal(uuid: string, data: {
    title?: string;
    description?: string;
    total_value?: number;
    expires_at?: string;
  }): Promise<unknown> {
    const response = await this.put<{ data: unknown }>(`proposals/${uuid}`, data);
    return response.data;
  }

  /**
   * Send proposal to client
   */
  async sendProposal(uuid: string): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(`proposals/${uuid}/send`, {});
    return response.data;
  }

  /**
   * Approve a proposal
   */
  async approveProposal(uuid: string): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(`proposals/${uuid}/approve`, {});
    return response.data;
  }

  /**
   * Reject a proposal
   */
  async rejectProposal(uuid: string, reason?: string): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(`proposals/${uuid}/reject`, { reason });
    return response.data;
  }

  /**
   * Convert proposal to project
   */
  async convertProposalToProject(uuid: string): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(`proposals/${uuid}/convert-to-project`, {});
    return response.data;
  }

  // ============================================================================
  // CLIENTFLOW - DASHBOARD
  // ============================================================================

  /**
   * Get ClientFlow dashboard overview
   */
  async getClientFlowOverview(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("client-flow/dashboard/overview", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get revenue pipeline
   */
  async getRevenuePipeline(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("client-flow/dashboard/revenue-pipeline", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get clients at risk
   */
  async getClientsAtRisk(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("client-flow/dashboard/clients-at-risk", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("client-flow/dashboard/pending-approvals", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get projects health
   */
  async getProjectsHealth(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("client-flow/dashboard/projects-health", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get actionable insights
   */
  async getActionableInsights(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("client-flow/dashboard/insights", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get client leaderboard
   */
  async getClientLeaderboard(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("client-flow/dashboard/leaderboard", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get analytics
   */
  async getClientFlowAnalytics(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("client-flow/dashboard/analytics", {
      company_slug: companySlug,
    });
    return response.data;
  }

  // ============================================================================
  // CLIENTFLOW - CROSS-WORKSPACE (all workspaces owned by the user)
  // ============================================================================

  /**
   * Get invoices overview across all workspaces
   */
  async getCrossWorkspaceInvoices(perPage?: number, page?: number): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {};
    if (perPage) params.per_page = perPage;
    if (page) params.page = page;
    const response = await this.get<unknown>("client-flow/all-workspaces/invoices", params);
    return response;
  }

  /**
   * Get proposals overview across all workspaces
   */
  async getCrossWorkspaceProposals(perPage?: number, page?: number): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {};
    if (perPage) params.per_page = perPage;
    if (page) params.page = page;
    const response = await this.get<unknown>("client-flow/all-workspaces/proposals", params);
    return response;
  }

  /**
   * Get clients overview across all workspaces
   */
  async getCrossWorkspaceClients(perPage?: number, page?: number): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {};
    if (perPage) params.per_page = perPage;
    if (page) params.page = page;
    const response = await this.get<unknown>("client-flow/all-workspaces/clients", params);
    return response;
  }

  /**
   * Get change requests overview across all workspaces
   */
  async getCrossWorkspaceChangeRequests(perPage?: number, page?: number): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {};
    if (perPage) params.per_page = perPage;
    if (page) params.page = page;
    const response = await this.get<unknown>("client-flow/all-workspaces/change-requests", params);
    return response;
  }

  // ============================================
  // LABEL MANAGEMENT
  // ============================================

  /**
   * Get all labels in a workspace
   */
  async getWorkspaceLabels(companySlug: string): Promise<unknown[]> {
    const response = await this.get<{ data: unknown[] }>("projects-labels", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Create a new label in the workspace
   */
  async createLabel(companySlug: string, data: { title: string; color: string }): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(`projects-labels?company_slug=${companySlug}`, data);
    return response.data;
  }

  /**
   * Update a label
   */
  async updateLabel(labelSlug: string, companySlug: string, data: { title?: string; color?: string }): Promise<void> {
    await this.put(`projects-labels/${labelSlug}?company_slug=${companySlug}`, data);
  }

  /**
   * Attach a label to a project
   */
  async attachLabelToProject(labelSlug: string, projectSlug: string, companySlug: string): Promise<void> {
    await this.post(`projects-labels/${labelSlug}/attach?company_slug=${companySlug}&project_slug=${projectSlug}`, {
      slug: labelSlug,
    });
  }

  /**
   * Detach a label from a project
   */
  async detachLabelFromProject(labelSlug: string, projectSlug: string, companySlug: string): Promise<void> {
    await this.delete(`projects-labels/${labelSlug}/detach?company_slug=${companySlug}&project_slug=${projectSlug}`);
  }

  /**
   * Toggle a label on a task
   */
  async toggleLabelOnTask(taskUuid: string, labelSlug: string, projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.post<unknown>(`task-labels/${labelSlug}/toggle?company_slug=${companySlug}&project_slug=${projectSlug}&task_uuid=${taskUuid}`, {});
    return response;
  }

  // ============================================
  // TASK TYPE MANAGEMENT
  // ============================================

  /**
   * Create a new task type
   */
  async createTaskType(projectSlug: string, companySlug: string, data: { title: string; color: string }): Promise<unknown> {
    const response = await this.post<unknown>(`project-templates/type?company_slug=${companySlug}&project_slug=${projectSlug}`, {
      ...data,
      type: "issues",
    });
    return response;
  }

  /**
   * Update a task type
   */
  async updateTaskType(typeId: number, projectSlug: string, companySlug: string, data: { title?: string; color?: string }): Promise<void> {
    await this.put(`project-templates/type/${typeId}?company_slug=${companySlug}&project_slug=${projectSlug}`, data);
  }

  /**
   * Assign a type to a task
   */
  async assignTypeToTask(taskUuid: string, typeId: number, projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.put<{ data: unknown }>(`tasks/${taskUuid}?company_slug=${companySlug}&project_slug=${projectSlug}`, {
      config_issue_type_id: typeId,
    });
    return response.data;
  }

  // ============================================================================
  // STANDUP / DAILY
  // ============================================================================

  /**
   * Get team standup summary - completed yesterday, in progress, blocked, time tracked
   */
  async getStandupSummary(companySlug: string, projectSlug?: string): Promise<unknown> {
    const params: Record<string, string> = { company_slug: companySlug };
    if (projectSlug) params.project_slug = projectSlug;
    const response = await this.get<{ data: unknown }>("companies/standup/summary", params);
    return response.data;
  }

  /**
   * Get tasks completed on a specific date (yesterday by default)
   */
  async getStandupCompletedYesterday(companySlug: string, projectSlug?: string, date?: string): Promise<unknown> {
    const params: Record<string, string> = { company_slug: companySlug };
    if (projectSlug) params.project_slug = projectSlug;
    if (date) params.date = date;
    const response = await this.get<{ data: unknown }>("companies/standup/completed-yesterday", params);
    return response.data;
  }

  /**
   * Get active blockers - tasks that are currently blocked
   */
  async getStandupBlockers(companySlug: string, projectSlug?: string): Promise<unknown> {
    const params: Record<string, string> = { company_slug: companySlug };
    if (projectSlug) params.project_slug = projectSlug;
    const response = await this.get<{ data: unknown }>("companies/standup/blockers", params);
    return response.data;
  }

  /**
   * Get team status - current status of each team member with their active tasks
   */
  async getStandupTeamStatus(companySlug: string, projectSlug?: string): Promise<unknown> {
    const params: Record<string, string> = { company_slug: companySlug };
    if (projectSlug) params.project_slug = projectSlug;
    const response = await this.get<{ data: unknown }>("companies/standup/team-status", params);
    return response.data;
  }

  /**
   * Get stuck tasks - tasks in progress for longer than expected
   */
  async getStandupStuckTasks(companySlug: string, projectSlug?: string): Promise<unknown> {
    const params: Record<string, string> = { company_slug: companySlug };
    if (projectSlug) params.project_slug = projectSlug;
    const response = await this.get<{ data: unknown }>("companies/standup/stuck-tasks", params);
    return response.data;
  }

  /**
   * Get weekly digest - summary of the week's activity
   */
  async getStandupWeeklyDigest(companySlug: string, projectSlug?: string): Promise<unknown> {
    const params: Record<string, string> = { company_slug: companySlug };
    if (projectSlug) params.project_slug = projectSlug;
    const response = await this.get<{ data: unknown }>("companies/standup/weekly-digest", params);
    return response.data;
  }

  /**
   * Get contributors stats - team member contributions over time
   */
  async getStandupContributors(companySlug: string, projectSlug?: string, period?: string): Promise<unknown> {
    const params: Record<string, string> = { company_slug: companySlug };
    if (projectSlug) params.project_slug = projectSlug;
    if (period) params.period = period;
    const response = await this.get<{ data: unknown }>("companies/standup/contributors", params);
    return response.data;
  }

  // ============================================================================
  // COMMENTS
  // ============================================================================

  /**
   * Get comments for a task
   */
  async getTaskComments(taskUuid: string, companySlug: string, projectSlug: string): Promise<unknown[]> {
    const response = await this.get<{ data: unknown[] }>("comments", {
      commentable_id: taskUuid,
      commentable_type: "issues",
      company_slug: companySlug,
      project_slug: projectSlug,
    });
    return response.data;
  }

  /**
   * Add a comment to a task
   */
  async addTaskComment(taskUuid: string, text: string, companySlug: string, projectSlug: string): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(
      `comments?company_slug=${companySlug}&project_slug=${projectSlug}`,
      {
        commentable_id: taskUuid,
        commentable_type: "issues",
        comment_text: text,
      }
    );
    return response.data;
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: number, text: string): Promise<void> {
    await this.put(`comments/${commentId}`, { comment_text: text });
  }

  // ============================================================================
  // ANALYTICS / MANAGER DASHBOARD
  // ============================================================================

  /**
   * Get manager pulse - real-time workspace health metrics
   */
  async getManagerPulse(companySlug: string, view?: string, period?: string): Promise<unknown> {
    const params: Record<string, string> = { company_slug: companySlug };
    if (view) params.view = view;
    if (period) params.period = period;
    const response = await this.get<{ data: unknown }>("companies/manager-dashboard/pulse", params);
    return response.data;
  }

  /**
   * Get manager risks - risk detection and analysis
   */
  async getManagerRisks(companySlug: string, filter?: string, severity?: string): Promise<unknown> {
    const params: Record<string, string> = { company_slug: companySlug };
    if (filter) params.filter = filter;
    if (severity) params.severity = severity;
    const response = await this.get<{ data: unknown }>("companies/manager-dashboard/risks", params);
    return response.data;
  }

  /**
   * Get cumulative flow report - daily snapshot of tasks by status
   */
  async getReportsCumulativeFlow(companySlug: string, days?: number): Promise<unknown> {
    const params: Record<string, string | number> = { company_slug: companySlug };
    if (days) params.days = days;
    const response = await this.get<{ data: unknown }>("companies/reports/cumulative-flow", params);
    return response.data;
  }

  /**
   * Get project age report - project age vs completion percentage
   */
  async getReportsProjectAge(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("companies/reports/project-age", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get weekly activity report - activity by project over last 5 weeks
   */
  async getReportsWeeklyActivity(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("companies/reports/weekly-activity", {
      company_slug: companySlug,
    });
    return response.data;
  }

  // ============================================================================
  // USER STORIES - CROSS-WORKSPACE
  // ============================================================================

  /**
   * Get all user stories across all workspaces
   */
  async getAllWorkspacesUserStories(perPage?: number, page?: number): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {};
    if (perPage) params.per_page = perPage;
    if (page) params.page = page;
    const response = await this.get<unknown>("user-stories/all-workspaces", params);
    return response;
  }

  // ============================================================================
  // SPRINT - STATS / REPORTS / PROGRESS / METRICS
  // ============================================================================

  /**
   * Get sprint statistics
   */
  async getSprintStats(slug: string, projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`sprints/${slug}/stats`, {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get sprint reports (burndown, burnup, performance, etc.)
   */
  async getSprintReports(slug: string, projectSlug: string, companySlug: string, options?: {
    resource?: string;
    report_task?: boolean;
  }): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {
      project_slug: projectSlug,
      company_slug: companySlug,
    };
    if (options?.resource) params.resource = options.resource;
    if (options?.report_task) params.report_task = options.report_task;
    const response = await this.get<{ data: unknown }>(`sprints/${slug}/reports`, params);
    return response.data;
  }

  /**
   * Get sprint progress
   */
  async getSprintProgress(slug: string, projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`sprints/${slug}/progress`, {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get sprint metrics
   */
  async getSprintMetrics(slug: string, projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`sprints/${slug}/metrics`, {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  // ============================================================================
  // TASK - BY CODE / DUPLICATE / MOVE
  // ============================================================================

  /**
   * Get task by code (e.g., PROJ-123)
   */
  async getTaskByCode(taskCode: string, projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`tasks/by-code/${taskCode}`, {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Duplicate a task
   */
  async duplicateTask(taskUuid: string, projectSlug: string, companySlug: string, workflowId?: number): Promise<unknown> {
    const body: Record<string, unknown> = {};
    if (workflowId) body.config_workflow_id = workflowId;
    const response = await this.post<{ data: unknown }>(
      `tasks/${taskUuid}/duplicate?company_slug=${companySlug}&project_slug=${projectSlug}`,
      body
    );
    return response.data;
  }

  /**
   * Move a task to another project
   */
  async moveTask(taskUuid: string, projectSlug: string, companySlug: string, newProjectSlug: string, newWorkflowId: number): Promise<unknown> {
    const response = await this.post<unknown>(
      `tasks/${taskUuid}/move?company_slug=${companySlug}&project_slug=${projectSlug}`,
      { new_project_slug: newProjectSlug, new_workflow_id: newWorkflowId }
    );
    return response;
  }

  // ============================================================================
  // WIKI - SEARCH
  // ============================================================================

  /**
   * Search wiki pages
   */
  async searchWikiPages(projectSlug: string, companySlug: string, query: string, limit?: number): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {
      project_slug: projectSlug,
      company_slug: companySlug,
      q: query,
    };
    if (limit) params.limit = limit;
    const response = await this.get<{ data: unknown }>("wiki/pages/search", params);
    return response.data;
  }

  // ============================================================================
  // TIME TRACKING - ANALYTICS
  // ============================================================================

  /**
   * Get time tracking analytics
   */
  async getTimeTrackingAnalytics(companySlug: string, options?: {
    project_slug?: string;
    period?: string;
    start?: string;
    end?: string;
    users?: string;
  }): Promise<unknown> {
    const params: Record<string, string | number | boolean> = { company_slug: companySlug };
    if (options?.project_slug) params.project_slug = options.project_slug;
    if (options?.period) params.period = options.period;
    if (options?.start) params.start = options.start;
    if (options?.end) params.end = options.end;
    if (options?.users) params.users = options.users;
    const response = await this.get<{ data: unknown }>("time-trackings/analytics", params);
    return response.data;
  }

  /**
   * Get time tracking team stats
   */
  async getTimeTrackingTeam(companySlug: string, options?: {
    project_slug?: string;
    period?: string;
  }): Promise<unknown> {
    const params: Record<string, string | number | boolean> = { company_slug: companySlug };
    if (options?.project_slug) params.project_slug = options.project_slug;
    if (options?.period) params.period = options.period;
    const response = await this.get<{ data: unknown }>("time-trackings/team", params);
    return response.data;
  }

  /**
   * Get time tracking reports
   */
  async getTimeTrackingReports(companySlug: string, options?: {
    project_slug?: string;
    period?: string;
    report_type?: string;
    hourly_rate?: number;
  }): Promise<unknown> {
    const params: Record<string, string | number | boolean> = { company_slug: companySlug };
    if (options?.project_slug) params.project_slug = options.project_slug;
    if (options?.period) params.period = options.period;
    if (options?.report_type) params.report_type = options.report_type;
    if (options?.hourly_rate) params.hourly_rate = options.hourly_rate;
    const response = await this.get<{ data: unknown }>("time-trackings/reports", params);
    return response.data;
  }

  /**
   * Get time tracking productivity
   */
  async getTimeTrackingProductivity(companySlug: string, options?: {
    project_slug?: string;
    period?: string;
  }): Promise<unknown> {
    const params: Record<string, string | number | boolean> = { company_slug: companySlug };
    if (options?.project_slug) params.project_slug = options.project_slug;
    if (options?.period) params.period = options.period;
    const response = await this.get<{ data: unknown }>("time-trackings/productivity", params);
    return response.data;
  }

  /**
   * Get time tracking timeline
   */
  async getTimeTrackingTimeline(companySlug: string, options?: {
    project_slug?: string;
    period?: string;
  }): Promise<unknown> {
    const params: Record<string, string | number | boolean> = { company_slug: companySlug };
    if (options?.project_slug) params.project_slug = options.project_slug;
    if (options?.period) params.period = options.period;
    const response = await this.get<{ data: unknown }>("time-trackings/timeline", params);
    return response.data;
  }

  // ============================================================================
  // MANAGER DASHBOARD - ADDITIONAL REPORTS
  // ============================================================================

  /**
   * Get manager dashboard overview
   */
  async getManagerOverview(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("companies/manager-dashboard/overview", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get manager dashboard health
   */
  async getManagerHealth(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("companies/manager-dashboard/health", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get manager dashboard blockers
   */
  async getManagerBlockers(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("companies/manager-dashboard/blockers", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get manager command center
   */
  async getManagerCommandCenter(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("companies/manager-dashboard/command-center", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get manager dashboard time entries
   */
  async getManagerTimeEntries(companySlug: string, filter?: string): Promise<unknown> {
    const params: Record<string, string | number | boolean> = { company_slug: companySlug };
    if (filter) params.filter = filter;
    const response = await this.get<{ data: unknown }>("companies/manager-dashboard/time-entries", params);
    return response.data;
  }

  // ============================================================================
  // DISCUSSIONS
  // ============================================================================

  /**
   * Get all discussions across all workspaces
   */
  async getAllDiscussions(): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("discussions/all");
    return response.data;
  }

  /**
   * Get global unread count across all workspaces
   */
  async getDiscussionGlobalUnreadCount(): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("discussions/global-unread-count");
    return response.data;
  }

  /**
   * Get channels in a project
   */
  async getDiscussionChannels(projectSlug: string, companySlug: string, includeArchived?: boolean): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {
      project_slug: projectSlug,
      company_slug: companySlug,
    };
    if (includeArchived) params.include_archived = includeArchived;
    const response = await this.get<{ data: unknown }>("discussions/channels", params);
    return response.data;
  }

  /**
   * Get a single channel
   */
  async getDiscussionChannel(uuid: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`discussions/channels/${uuid}`);
    return response.data;
  }

  /**
   * Create a discussion channel
   */
  async createDiscussionChannel(data: {
    name: string;
    project_slug: string;
    company_slug: string;
    description?: string;
    is_private?: boolean;
  }): Promise<unknown> {
    const response = await this.post<{ data: unknown }>("discussions/channels", data);
    return response.data;
  }

  /**
   * Update a discussion channel
   */
  async updateDiscussionChannel(uuid: string, data: {
    name?: string;
    description?: string;
  }): Promise<unknown> {
    const response = await this.put<{ data: unknown }>(`discussions/channels/${uuid}`, data);
    return response.data;
  }

  /**
   * Get messages in a channel (cursor-based pagination)
   */
  async getDiscussionMessages(channelUuid: string, options?: {
    before_id?: string;
    after_id?: string;
    limit?: number;
  }): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {};
    if (options?.before_id) params.before_id = options.before_id;
    if (options?.after_id) params.after_id = options.after_id;
    if (options?.limit) params.limit = options.limit;
    const response = await this.get<unknown>(`discussions/channels/${channelUuid}/messages`, params);
    return response;
  }

  /**
   * Send a message in a channel
   */
  async sendDiscussionMessage(channelUuid: string, data: {
    content: string;
    parent_id?: string;
  }): Promise<unknown> {
    const response = await this.post<{ data: unknown }>(`discussions/channels/${channelUuid}/messages`, data);
    return response.data;
  }

  /**
   * Search messages in a channel
   */
  async searchDiscussionMessages(channelUuid: string, query: string, limit?: number): Promise<unknown> {
    const params: Record<string, string | number | boolean> = { q: query };
    if (limit) params.limit = limit;
    const response = await this.get<{ data: unknown }>(`discussions/channels/${channelUuid}/search`, params);
    return response.data;
  }

  /**
   * Get unread count for a project
   */
  async getDiscussionUnreadCount(projectSlug: string, companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("discussions/unread-count", {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Mark a channel as read
   */
  async markDiscussionChannelRead(channelUuid: string): Promise<unknown> {
    const response = await this.post<unknown>(`discussions/channels/${channelUuid}/read`, {});
    return response;
  }

  // ============================================================================
  // ACTIVITY FEED
  // ============================================================================

  /**
   * Get user's activity feed
   */
  async getActivityFeed(): Promise<unknown> {
    const response = await this.get<unknown>("feeds");
    return response;
  }

  /**
   * Get activity feed for a specific user
   */
  async getActivityFeedByUser(username: string): Promise<unknown> {
    const response = await this.get<unknown>(`feeds/user/${username}`);
    return response;
  }

  /**
   * Get notification feed
   */
  async getNotificationFeed(): Promise<unknown> {
    const response = await this.get<unknown>("feeds/notifications");
    return response;
  }

  /**
   * Get activities by context (company, project, sprint, etc.)
   */
  async getActivities(options: {
    from_context?: string;
    company_slug?: string;
    project_slug?: string;
    sprint_slug?: string;
    uuid?: string;
  }): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {};
    if (options.from_context) params.from_context = options.from_context;
    if (options.company_slug) params.company_slug = options.company_slug;
    if (options.project_slug) params.project_slug = options.project_slug;
    if (options.sprint_slug) params.sprint_slug = options.sprint_slug;
    if (options.uuid) params.uuid = options.uuid;
    const response = await this.get<{ data: unknown }>("activities", params);
    return response.data;
  }

  /**
   * Get workflow history for a task
   */
  async getTaskWorkflowHistory(taskUuid: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`activities/task/${taskUuid}/workflow`);
    return response.data;
  }

  // ============================================================================
  // BUDGET
  // ============================================================================

  /**
   * Get projects at budget risk
   */
  async getBudgetProjectsAtRisk(companySlug: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>("budget/projects-at-risk", {
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Get project budget overview
   */
  async getBudgetOverview(projectUuid: string, options?: {
    start_date?: string;
    end_date?: string;
    user_ids?: string;
    status?: string;
  }): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {};
    if (options?.start_date) params.start_date = options.start_date;
    if (options?.end_date) params.end_date = options.end_date;
    if (options?.user_ids) params.user_ids = options.user_ids;
    if (options?.status) params.status = options.status;
    const response = await this.get<{ data: unknown }>(`projects/${projectUuid}/budget/overview`, params);
    return response.data;
  }

  /**
   * Get project budget consumption
   */
  async getBudgetConsumption(projectUuid: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`projects/${projectUuid}/budget/consumption`);
    return response.data;
  }

  /**
   * Get project budget burn-down
   */
  async getBudgetBurnDown(projectUuid: string, options?: {
    start_date?: string;
    end_date?: string;
  }): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {};
    if (options?.start_date) params.start_date = options.start_date;
    if (options?.end_date) params.end_date = options.end_date;
    const response = await this.get<{ data: unknown }>(`projects/${projectUuid}/budget/burn-down`, params);
    return response.data;
  }

  /**
   * Get budget alerts for a project
   */
  async getBudgetAlerts(projectUuid: string): Promise<unknown> {
    const response = await this.get<{ data: unknown }>(`projects/${projectUuid}/budget/alerts`);
    return response.data;
  }

  /**
   * Get budget events for a project
   */
  async getBudgetEvents(projectUuid: string, limit?: number): Promise<unknown> {
    const params: Record<string, string | number | boolean> = {};
    if (limit) params.limit = limit;
    const response = await this.get<{ data: unknown }>(`projects/${projectUuid}/budget/events`, params);
    return response.data;
  }

  // ============================================================================
  // EPICS
  // ============================================================================

  /**
   * Get all epics in a project
   */
  async getEpics(projectSlug: string, companySlug: string): Promise<unknown[]> {
    const response = await this.get<{ data: unknown[] }>("user-story-epics", {
      project_slug: projectSlug,
      company_slug: companySlug,
    });
    return response.data;
  }

  /**
   * Create a new epic
   */
  async createEpic(projectSlug: string, companySlug: string, data: { title: string; description?: string; color?: string }): Promise<unknown> {
    const response = await this.post<unknown>(
      `user-story-epics?company_slug=${companySlug}&project_slug=${projectSlug}`,
      data
    );
    return response;
  }

  /**
   * Update an epic
   */
  async updateEpic(
    epicUuid: string,
    projectSlug: string,
    companySlug: string,
    data: { title?: string; description?: string; color?: string }
  ): Promise<void> {
    await this.put(`user-story-epics/${epicUuid}?company_slug=${companySlug}&project_slug=${projectSlug}`, data);
  }
}
