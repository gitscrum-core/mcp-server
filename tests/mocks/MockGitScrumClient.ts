/**
 * Mock GitScrum Client for testing
 * 
 * Provides mock responses for all API methods
 */

export class MockGitScrumClient {
  private authenticated = false;

  // Auth mocks
  async authenticate(email: string, password: string) {
    if (email === "test@example.com" && password === "password123") {
      this.authenticated = true;
      return { token: "mock-token-123", user: { name: "Test User", email } };
    }
    throw new Error("Invalid credentials");
  }

  isAuthenticated() {
    return this.authenticated;
  }

  async getMe() {
    return {
      id: 1,
      uuid: "user-uuid-123",
      name: "Test User",
      email: "test@example.com",
    };
  }

  // Clients mocks
  async getClients(companySlug: string) {
    return [
      {
        uuid: "client-uuid-1",
        name: "Acme Corporation",
        email: "contact@acme.com",
        phone: "+1234567890",
      },
      {
        uuid: "client-uuid-2",
        name: "TechStart Inc",
        email: "hello@techstart.io",
        phone: "+0987654321",
      },
    ];
  }

  async getClient(uuid: string, companySlug: string) {
    return {
      uuid,
      name: "Acme Corporation",
      email: "contact@acme.com",
      phone: "+1234567890",
      address: "123 Main St",
      city: "San Francisco",
      country: "USA",
      total_invoiced: 50000,
      total_paid: 35000,
      total_pending: 15000,
    };
  }

  async getClientStats(uuid: string, companySlug: string) {
    return {
      total_invoiced: 50000,
      total_paid: 35000,
      total_pending: 15000,
      total_overdue: 5000,
      projects_count: 3,
      invoices_count: 10,
    };
  }

  async createClient(data: Record<string, unknown>) {
    return {
      uuid: "new-client-uuid",
      ...data,
      created_at: new Date().toISOString(),
    };
  }

  async updateClient(uuid: string, data: Record<string, unknown>) {
    return {
      uuid,
      ...data,
      updated_at: new Date().toISOString(),
    };
  }

  async deleteClient(uuid: string) {
    return { success: true };
  }

  // Invoices mocks
  async getInvoices(companySlug: string, options?: Record<string, unknown>) {
    return [
      {
        uuid: "invoice-uuid-1",
        number: "INV-001",
        status: "paid",
        total: 5000,
        client_name: "Acme Corporation",
      },
      {
        uuid: "invoice-uuid-2",
        number: "INV-002",
        status: "pending",
        total: 3000,
        client_name: "TechStart Inc",
      },
    ];
  }

  async getInvoice(uuid: string, companySlug: string) {
    return {
      uuid,
      number: "INV-001",
      status: "paid",
      total: 5000,
      due_date: "2024-02-15",
      items: [
        { description: "Web Development", quantity: 1, unit_price: 5000 },
      ],
    };
  }

  async getInvoiceStats(companySlug: string) {
    return {
      total_revenue: 100000,
      total_pending: 20000,
      total_overdue: 5000,
      invoices_count: 25,
      average_payment_time: 12,
    };
  }

  async createInvoice(data: Record<string, unknown>) {
    return {
      uuid: "new-invoice-uuid",
      number: "INV-003",
      status: "draft",
      ...data,
    };
  }

  async updateInvoice(uuid: string, data: Record<string, unknown>) {
    return {
      uuid,
      ...data,
      updated_at: new Date().toISOString(),
    };
  }

  async deleteInvoice(uuid: string) {
    return { success: true };
  }

  async issueInvoice(uuid: string) {
    return {
      uuid,
      status: "issued",
      issued_at: new Date().toISOString(),
    };
  }

  async sendInvoice(uuid: string) {
    return {
      uuid,
      status: "sent",
      sent_at: new Date().toISOString(),
    };
  }

  async markInvoicePaid(uuid: string) {
    return {
      uuid,
      status: "paid",
      paid_at: new Date().toISOString(),
    };
  }

  // Proposals mocks
  async getProposals(companySlug: string, options?: Record<string, unknown>) {
    return [
      {
        uuid: "proposal-uuid-1",
        title: "Website Redesign",
        status: "approved",
        total_amount: 15000,
        client_name: "Acme Corporation",
      },
      {
        uuid: "proposal-uuid-2",
        title: "Mobile App Development",
        status: "pending",
        total_amount: 50000,
        client_name: "TechStart Inc",
      },
    ];
  }

  async getProposal(uuid: string, companySlug: string) {
    return {
      uuid,
      title: "Website Redesign",
      status: "approved",
      total_amount: 15000,
      content: "Full website redesign including...",
      valid_until: "2024-03-01",
    };
  }

  async getProposalStats(companySlug: string) {
    return {
      total_value: 200000,
      approved_value: 100000,
      pending_value: 80000,
      rejected_value: 20000,
      win_rate: 0.65,
    };
  }

  async createProposal(data: Record<string, unknown>) {
    return {
      uuid: "new-proposal-uuid",
      status: "draft",
      ...data,
    };
  }

  async updateProposal(uuid: string, data: Record<string, unknown>) {
    return {
      uuid,
      ...data,
      updated_at: new Date().toISOString(),
    };
  }

  async deleteProposal(uuid: string) {
    return { success: true };
  }

  async sendProposal(uuid: string) {
    return {
      uuid,
      status: "sent",
      sent_at: new Date().toISOString(),
    };
  }

  async approveProposal(uuid: string) {
    return {
      uuid,
      status: "approved",
      approved_at: new Date().toISOString(),
    };
  }

  async rejectProposal(uuid: string, reason?: string) {
    return {
      uuid,
      status: "rejected",
      rejection_reason: reason,
      rejected_at: new Date().toISOString(),
    };
  }

  async convertProposalToProject(uuid: string) {
    return {
      proposal_uuid: uuid,
      project_uuid: "new-project-uuid",
      project_name: "Website Redesign Project",
    };
  }

  // Dashboard mocks
  async getClientFlowOverview(companySlug: string) {
    return {
      total_clients: 25,
      total_revenue: 500000,
      pending_payments: 50000,
      overdue_payments: 10000,
      active_projects: 12,
    };
  }

  async getRevenuePipeline(companySlug: string) {
    return {
      current_month: 50000,
      last_month: 45000,
      forecast_next_month: 60000,
      pending_invoices: 30000,
      pending_proposals: 80000,
    };
  }

  async getClientsAtRisk(companySlug: string) {
    return [
      {
        uuid: "client-uuid-1",
        name: "Problem Client",
        risk_score: 85,
        overdue_amount: 10000,
        last_activity: "30 days ago",
      },
    ];
  }

  async getPendingApprovals(companySlug: string) {
    return {
      proposals: [
        { uuid: "proposal-uuid-2", title: "Mobile App", value: 50000 },
      ],
      change_requests: [],
    };
  }

  async getProjectsHealth(companySlug: string) {
    return {
      on_track: 8,
      at_risk: 3,
      over_budget: 1,
      completed: 15,
    };
  }

  async getActionableInsights(companySlug: string) {
    return [
      {
        type: "warning",
        message: "3 invoices are overdue - follow up recommended",
        action: "View overdue invoices",
      },
      {
        type: "opportunity",
        message: "Client Acme Corp hasn't been contacted in 30 days",
        action: "Schedule check-in",
      },
    ];
  }

  async getClientLeaderboard(companySlug: string) {
    return [
      { rank: 1, name: "Acme Corporation", total_revenue: 150000 },
      { rank: 2, name: "TechStart Inc", total_revenue: 100000 },
      { rank: 3, name: "StartUp Labs", total_revenue: 75000 },
    ];
  }

  async getClientFlowAnalytics(companySlug: string) {
    return {
      revenue_trend: [
        { month: "Jan", value: 40000 },
        { month: "Feb", value: 50000 },
        { month: "Mar", value: 55000 },
      ],
      client_acquisition: { new_clients: 5, churned: 1 },
      average_deal_size: 15000,
      payment_collection_rate: 0.92,
    };
  }

  async getClientFlowStats(companySlug: string) {
    return {
      total_clients: 25,
      total_invoices: 100,
      total_proposals: 50,
      paid_amount: 400000,
      pending_amount: 50000,
    };
  }

  // Cross-workspace ClientFlow mocks
  async getCrossWorkspaceInvoices(perPage?: number, page?: number) {
    return {
      stats: { total: 15, draft: 2, issued: 5, paid: 7, cancelled: 1, overdue: 2, total_amount: 500000, paid_amount: 350000, pending_amount: 120000, draft_amount: 30000, overdue_amount: 50000 },
      workspaces: [
        { company: { id: 1, slug: "workspace-1", name: "Workspace 1" }, total: 10, issued: 3, paid: 5, overdue: 1, total_amount: 300000, paid_amount: 250000, pending_amount: 50000 },
        { company: { id: 2, slug: "workspace-2", name: "Workspace 2" }, total: 5, issued: 2, paid: 2, overdue: 1, total_amount: 200000, paid_amount: 100000, pending_amount: 70000 },
      ],
      data: [
        { uuid: "inv-001", number: 1, status: "issued", status_code: 1, gross_total: 50000, net_total: 45000, taxes_total: 5000, issued_date_at: "2026-01-15", payment_due_at: "2026-02-15", paid_at: null, is_overdue: false, client: { uuid: "client-001", name: "Acme Corp" }, company: { slug: "workspace-1", name: "Workspace 1" } },
      ],
      meta: { total: 15, per_page: perPage ?? 50, current_page: page ?? 1, last_page: 1 },
    };
  }

  async getCrossWorkspaceProposals(perPage?: number, page?: number) {
    return {
      stats: { total: 8, draft: 1, sent: 2, viewed: 1, approved: 3, rejected: 1, expired: 0, pending: 3, total_value: 200000, approved_value: 120000, pending_value: 80000 },
      workspaces: [
        { company: { id: 1, slug: "workspace-1", name: "Workspace 1" }, total: 5, pending: 2, approved: 2, total_value: 150000, approved_value: 80000 },
      ],
      data: [
        { uuid: "prop-001", name: "Q1 Redesign", status: "sent", total_value: 50000, total_hours: 100, hourly_rate: 500, expires_at: "2026-03-01", created_at: "2026-01-10", client: { uuid: "client-001", name: "Acme Corp" }, project: null, company: { slug: "workspace-1", name: "Workspace 1" } },
      ],
      meta: { total: 8, per_page: perPage ?? 50, current_page: page ?? 1, last_page: 1 },
    };
  }

  async getCrossWorkspaceClients(perPage?: number, page?: number) {
    return {
      stats: { total: 12, with_invoices: 8, with_pending: 3, with_overdue: 1 },
      workspaces: [
        { company: { id: 1, slug: "workspace-1", name: "Workspace 1" }, total: 7 },
        { company: { id: 2, slug: "workspace-2", name: "Workspace 2" }, total: 5 },
      ],
      data: [
        { uuid: "client-001", name: "Acme Corp", email: "billing@acme.co", phone: null, website: "https://acme.co", invoices_count: 5, proposals_count: 3, projects_count: 2, change_requests_count: 1, total_paid: 200000, total_pending: 30000, company: { slug: "workspace-1", name: "Workspace 1" } },
      ],
      meta: { total: 12, per_page: perPage ?? 50, current_page: page ?? 1, last_page: 1 },
    };
  }

  async getCrossWorkspaceChangeRequests(perPage?: number, page?: number) {
    return {
      stats: { total: 6, draft: 1, sent: 2, approved: 2, rejected: 1, adjustment_requested: 0, pending: 3, approved_value: 40000, pending_value: 25000 },
      workspaces: [
        { company: { id: 1, slug: "workspace-1", name: "Workspace 1" }, total: 4, pending: 2, approved: 1 },
      ],
      data: [
        { uuid: "cr-001", name: "Add auth module", status: "sent", additional_hours: 20, hourly_rate: 500, additional_value: 10000, fixed_value: 0, total_value: 10000, expires_at: "2026-03-01", created_at: "2026-01-20", client: { uuid: "client-001", name: "Acme Corp" }, project: { slug: "api-v2", name: "API v2" }, proposal: { uuid: "prop-001", name: "Q1 Redesign" }, company: { slug: "workspace-1", name: "Workspace 1" } },
      ],
      meta: { total: 6, per_page: perPage ?? 50, current_page: page ?? 1, last_page: 1 },
    };
  }

  // ================================================================
  // User Stories - Cross Workspace
  // ================================================================

  async getAllWorkspacesUserStories(perPage?: number, page?: number) {
    return {
      data: [
        { slug: "us-001", title: "User login flow", project: { slug: "api-v2", name: "API v2" } },
        { slug: "us-002", title: "Dashboard redesign", project: { slug: "web-app", name: "Web App" } },
      ],
      meta: { total: 2 },
    };
  }

  // ================================================================
  // Sprint - Stats/Reports/Progress/Metrics
  // ================================================================

  async getSprintStats(slug: string, projectSlug: string, companySlug: string) {
    return {
      slug,
      total_tasks: 20,
      completed_tasks: 15,
      completion_rate: 75,
      total_story_points: 40,
      completed_story_points: 30,
    };
  }

  async getSprintReports(slug: string, projectSlug: string, companySlug: string, options?: Record<string, unknown>) {
    return {
      burndown: [{ day: "Mon", remaining: 20 }, { day: "Fri", remaining: 5 }],
      burnup: [{ day: "Mon", completed: 0 }, { day: "Fri", completed: 15 }],
      performance: { velocity: 15, capacity: 20 },
    };
  }

  async getSprintProgress(slug: string, projectSlug: string, companySlug: string) {
    return {
      slug,
      total: 20,
      completed: 15,
      in_progress: 3,
      todo: 2,
      percent: 75,
    };
  }

  async getSprintMetrics(slug: string, projectSlug: string, companySlug: string) {
    return {
      velocity: 15,
      scope_change: 2,
      burndown_health: "on_track",
      days_remaining: 3,
    };
  }

  // ================================================================
  // Task - By Code / Duplicate / Move
  // ================================================================

  async getTaskByCode(taskCode: string, projectSlug: string, companySlug: string) {
    return {
      uuid: "task-uuid-by-code",
      title: "Implement login",
      code: taskCode,
      status: "in_progress",
    };
  }

  async duplicateTask(taskUuid: string, projectSlug: string, companySlug: string, workflowId?: number) {
    return {
      uuid: "duplicated-task-uuid",
      title: "Implement login (copy)",
      original_uuid: taskUuid,
    };
  }

  async moveTask(taskUuid: string, projectSlug: string, companySlug: string, newProjectSlug: string, newWorkflowId: number) {
    return {
      message: "Task move initiated",
      status: "processing",
    };
  }

  // ================================================================
  // Wiki - Search
  // ================================================================

  async searchWikiPages(projectSlug: string, companySlug: string, query: string, limit?: number) {
    return [
      { uuid: "wiki-001", title: "API Documentation", slug: "api-docs" },
      { uuid: "wiki-002", title: "Setup Guide", slug: "setup-guide" },
    ];
  }

  // ================================================================
  // Time Tracking - Analytics
  // ================================================================

  async getTimeTrackingAnalytics(companySlug: string, options?: Record<string, unknown>) {
    return {
      total_hours: 120,
      billable_hours: 80,
      non_billable_hours: 40,
      avg_daily: 6,
    };
  }

  async getTimeTrackingTeam(companySlug: string, options?: Record<string, unknown>) {
    return [
      { user: "john", total_hours: 40, billable: 30 },
      { user: "jane", total_hours: 35, billable: 28 },
    ];
  }

  async getTimeTrackingReports(companySlug: string, options?: Record<string, unknown>) {
    return {
      summary: { total_hours: 120, total_cost: 12000 },
      by_project: [{ project: "API v2", hours: 60 }],
    };
  }

  async getTimeTrackingProductivity(companySlug: string, options?: Record<string, unknown>) {
    return {
      score: 82,
      avg_focus_time: 4.5,
      context_switches: 3,
    };
  }

  async getTimeTrackingTimeline(companySlug: string, options?: Record<string, unknown>) {
    return [
      { date: "2026-01-15", hours: 8, entries: 3 },
      { date: "2026-01-16", hours: 7, entries: 4 },
    ];
  }

  // ================================================================
  // Manager Dashboard - Additional Reports
  // ================================================================

  async getManagerOverview(companySlug: string) {
    return {
      kpis: { total_projects: 5, active_projects: 3, total_tasks: 100, completed_tasks: 60, completion_rate: 60, overdue_tasks: 5 },
      project_status_distribution: [{ name: "In Progress", value: 3 }],
      velocity_chart: [{ week: "Jan 6", completed: 12, created: 15 }],
    };
  }

  async getManagerHealth(companySlug: string) {
    return {
      summary: { total_overdue: 5, total_stale: 3, total_inactive_projects: 1, avg_health_score: 72 },
      overdue_tasks: [{ uuid: "t-1", title: "Fix bug", days_overdue: 3 }],
      project_health: [{ slug: "api-v2", name: "API v2", health_score: 85, status: "healthy" }],
    };
  }

  async getManagerBlockers(companySlug: string) {
    return {
      summary: { blocked_count: 2, high_effort_count: 3, unassigned_count: 5 },
      blockers: [{ uuid: "t-2", title: "Blocked task", days_blocked: 4 }],
      unassigned_tasks: [{ uuid: "t-3", title: "Unassigned task" }],
    };
  }

  async getManagerCommandCenter(companySlug: string) {
    return {
      stats: { total_open: 40, total_overdue: 5, total_in_progress: 15, completed_this_week: 12 },
      workload: [{ user: "john", open: 8, in_progress: 3 }],
      risk_score: { score: 35, level: "moderate" },
    };
  }

  async getManagerTimeEntries(companySlug: string, filter?: string) {
    return {
      entries: [{ uuid: "tt-1", user: { name: "John" }, duration_formatted: "2h 30m", is_billable: true }],
      summary: { total_entries: 5, total_hours: "12.5", billable_hours: "8.5" },
    };
  }

  // ================================================================
  // Discussions
  // ================================================================

  async getAllDiscussions() {
    return [
      { workspace: "workspace-1", project: "api-v2", channels: [{ uuid: "ch-1", name: "general", unread: 3 }] },
    ];
  }

  async getDiscussionGlobalUnreadCount() {
    return { total_unread: 7 };
  }

  async getDiscussionChannels(projectSlug: string, companySlug: string, includeArchived?: boolean) {
    return [
      { uuid: "ch-1", name: "general", members_count: 5, unread_count: 3 },
      { uuid: "ch-2", name: "dev", members_count: 3, unread_count: 0 },
    ];
  }

  async getDiscussionChannel(uuid: string) {
    return { uuid, name: "general", description: "General discussion", members_count: 5 };
  }

  async createDiscussionChannel(data: Record<string, unknown>) {
    return { uuid: "new-ch-uuid", ...data, created_at: new Date().toISOString() };
  }

  async updateDiscussionChannel(uuid: string, data: Record<string, unknown>) {
    return { uuid, ...data, updated_at: new Date().toISOString() };
  }

  async getDiscussionMessages(channelUuid: string, options?: Record<string, unknown>) {
    return {
      data: [
        { uuid: "msg-1", content: "Hello team!", user: { name: "John" }, created_at: "2026-01-15T10:00:00Z" },
        { uuid: "msg-2", content: "Hi John!", user: { name: "Jane" }, created_at: "2026-01-15T10:01:00Z" },
      ],
      meta: { has_more: false },
    };
  }

  async sendDiscussionMessage(channelUuid: string, data: Record<string, unknown>) {
    return { uuid: "new-msg-uuid", ...data, created_at: new Date().toISOString() };
  }

  async searchDiscussionMessages(channelUuid: string, query: string, limit?: number) {
    return [
      { uuid: "msg-1", content: "Found matching message", user: { name: "John" } },
    ];
  }

  async getDiscussionUnreadCount(projectSlug: string, companySlug: string) {
    return { total_unread: 3, channels: [{ uuid: "ch-1", unread: 3 }] };
  }

  async markDiscussionChannelRead(channelUuid: string) {
    return { success: true };
  }

  // ================================================================
  // Activity Feed
  // ================================================================

  async getActivityFeed() {
    return {
      data: [
        { type: "task_completed", description: "John completed 'Fix login bug'", created_at: "2026-01-15T14:00:00Z" },
        { type: "comment_added", description: "Jane commented on 'API redesign'", created_at: "2026-01-15T13:30:00Z" },
      ],
    };
  }

  async getActivityFeedByUser(username: string) {
    return {
      data: [
        { type: "task_completed", description: `${username} completed a task`, created_at: "2026-01-15T14:00:00Z" },
      ],
    };
  }

  async getNotificationFeed() {
    return {
      data: [
        { type: "mention", message: "You were mentioned in a comment", read: false },
        { type: "assignment", message: "New task assigned to you", read: false },
      ],
    };
  }

  async getActivities(options: Record<string, unknown>) {
    return [
      { type: "status_change", entity: "task", description: "Task moved to In Progress" },
      { type: "comment", entity: "task", description: "Comment added" },
    ];
  }

  async getTaskWorkflowHistory(taskUuid: string) {
    return [
      { from: "To Do", to: "In Progress", user: "john", date: "2026-01-14T09:00:00Z" },
      { from: "In Progress", to: "Done", user: "john", date: "2026-01-15T16:00:00Z" },
    ];
  }

  // ================================================================
  // Budget
  // ================================================================

  async getBudgetProjectsAtRisk(companySlug: string) {
    return [
      { project: "API v2", budget: 50000, consumed: 48000, percent: 96, status: "at_risk" },
      { project: "Web App", budget: 30000, consumed: 28000, percent: 93, status: "warning" },
    ];
  }

  async getBudgetOverview(projectUuid: string, options?: Record<string, unknown>) {
    return {
      total_budget: 50000,
      consumed: 35000,
      remaining: 15000,
      percent_consumed: 70,
      estimated_completion_cost: 48000,
    };
  }

  async getBudgetConsumption(projectUuid: string) {
    return {
      total_hours: 350,
      total_cost: 35000,
      by_member: [{ user: "john", hours: 200, cost: 20000 }],
    };
  }

  async getBudgetBurnDown(projectUuid: string, options?: Record<string, unknown>) {
    return {
      data: [
        { date: "2026-01-01", remaining: 50000 },
        { date: "2026-01-15", remaining: 35000 },
      ],
    };
  }

  async getBudgetAlerts(projectUuid: string) {
    return [
      { type: "warning", message: "Budget 70% consumed", threshold: 70 },
    ];
  }

  async getBudgetEvents(projectUuid: string, limit?: number) {
    return [
      { type: "budget_set", amount: 50000, date: "2026-01-01" },
      { type: "threshold_reached", threshold: 50, date: "2026-01-10" },
    ];
  }
}
