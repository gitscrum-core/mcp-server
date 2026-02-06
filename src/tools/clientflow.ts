/**
 * ClientFlow MCP Tools (Consolidated)
 * 
 * Uses Action Handler pattern for clean, extensible code.
 * 4 unified tools: client, invoice, proposal, clientflow_dashboard
 */
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../client/GitScrumClient.js";
import { 
  executeAction, 
  success, 
  required,
  type ActionHandlerMap,
  type ToolResponse
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerClientFlowTools(): Tool[] {
  return [
    {
      name: "clientflow_cross_workspace",
      description: [
        "Cross-workspace ClientFlow overview. Reports: invoices, proposals, clients, change_requests.",
        "",
        "Aggregates data across ALL workspaces owned by the user. No company_slug needed.",
        "Returns stats, per-workspace breakdown, and paginated list.",
        "Requires Pro subscription.",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          report: {
            type: "string",
            enum: ["invoices", "proposals", "clients", "change_requests"],
            description: "Which cross-workspace report to get",
          },
          per_page: {
            type: "number",
            description: "Results per page (1-100, default 50)",
          },
          page: {
            type: "number",
            description: "Page number (default 1)",
          },
        },
        required: ["report"],
      },
      annotations: { title: "ClientFlow Cross-Workspace", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    {
      name: "client",
      description: [
        "Client management. Actions: list, get, stats, create, update.",
        "",
        "All actions require company_slug. 'get'/'stats'/'update' require uuid (from 'list' response).",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["list", "get", "stats", "create", "update"], 
            description: "Which operation to perform" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier (always required)" 
          },
          uuid: { 
            type: "string", 
            description: "Existing client's unique ID. Only for: get, stats, update. NOT for create." 
          },
          name: { 
            type: "string", 
            description: "Client name text. Required when creating a new client." 
          },
          email: { type: "string", description: "Email address (optional)" },
          phone: { type: "string", description: "Phone number (optional)" },
          address: { type: "string", description: "Street address (optional)" },
          address_line_2: { type: "string", description: "Address line 2 (optional)" },
          city: { type: "string", description: "City name (optional)" },
          country: { type: "string", description: "Country name (optional)" },
          postcode: { type: "string", description: "Postal/ZIP code (optional)" },
          vat_number: { type: "string", description: "VAT/Tax ID (optional)" },
          website: { type: "string", description: "Website URL (optional)" },
          notes: { type: "string", description: "Internal notes about client (optional)" },
        },
        required: ["action", "company_slug"],
      },
      annotations: { title: "Clients", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    {
      name: "invoice",
      description: [
        "Invoice management. Actions: list, get, stats, create, update, issue, send, mark_paid.",
        "",
        "Workflow:",
        "- 'create': requires company_slug + contact_company_uuid (client UUID from 'client' tool 'list')",
        "- 'get'/'update'/'issue'/'send'/'mark_paid': requires uuid (invoice UUID from 'list' response)",
        "- Flow: create → issue → send → mark_paid",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["list", "get", "stats", "create", "update", "issue", "send", "mark_paid"], 
            description: "Which operation to perform" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier (always required)" 
          },
          uuid: { 
            type: "string", 
            description: "Existing invoice's unique ID. Only for: get, update, issue, send, mark_paid. NOT for create." 
          },
          contact_company_uuid: { 
            type: "string", 
            description: "Client ID to invoice. Required for creating new invoice." 
          },
          status: { type: "string", description: "Filter: draft, sent, paid, overdue (optional)" },
          client_uuid: { type: "string", description: "Filter by client (optional)" },
          due_date: { type: "string", description: "Due date in YYYY-MM-DD format, e.g. '2025-12-31' (optional)" },
          notes: { type: "string", description: "Invoice notes (optional)" },
          currency: { type: "string", description: "3-letter ISO currency code: USD, EUR, BRL (optional)" },
        },
        required: ["action", "company_slug"],
      },
      annotations: { title: "Invoices", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    {
      name: "proposal",
      description: [
        "Proposal management. Actions: list, get, stats, create, update, send, approve, reject, convert.",
        "",
        "Workflow:",
        "- 'create': requires company_slug + title. Optional: contact_company_uuid (client from 'client' tool)",
        "- 'get'/'update'/'send'/'approve'/'reject'/'convert': requires uuid (from 'list' response)",
        "- Flow: create \u2192 send \u2192 approve/reject. 'convert' turns approved proposal into a project.",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["list", "get", "stats", "create", "update", "send", "approve", "reject", "convert"], 
            description: "Which operation to perform" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier (always required)" 
          },
          uuid: { 
            type: "string", 
            description: "Existing proposal's unique ID. Only for: get, update, send, approve, reject, convert. NOT for create." 
          },
          title: { 
            type: "string", 
            description: "Proposal title text. Required when creating a new proposal." 
          },
          contact_company_uuid: { type: "string", description: "Client ID (optional)" },
          status: { type: "string", description: "Filter: draft, sent, approved, rejected (optional)" },
          client_uuid: { type: "string", description: "Filter by client (optional)" },
          content: { type: "string", description: "Proposal body in Markdown (optional)" },
          total_amount: { type: "number", description: "Total value amount (optional)" },
          valid_until: { type: "string", description: "Expiration date YYYY-MM-DD (optional)" },
          currency: { type: "string", description: "Currency: USD, EUR, BRL (optional)" },
          reason: { type: "string", description: "Rejection reason (for reject action)" },
        },
        required: ["action", "company_slug"],
      },
      annotations: { title: "Proposals", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    {
      name: "clientflow_dashboard",
      description: [
        "CRM dashboard. Reports: overview, revenue, at_risk, pending, health, insights, leaderboard, analytics.",
        "",
        "All reports require company_slug (get from 'workspace' tool action 'list').",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          report: { 
            type: "string", 
            enum: ["overview", "revenue", "at_risk", "pending", "health", "insights", "leaderboard", "analytics"], 
            description: "Which report to generate" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier (always required)" 
          },
        },
        required: ["report", "company_slug"],
      },
      annotations: { title: "ClientFlow Dashboard", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface ClientArgs {
  action: string;
  company_slug: string;
  uuid?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  address_line_2?: string;
  city?: string;
  country?: string;
  postcode?: string;
  vat_number?: string;
  website?: string;
  notes?: string;
}

interface InvoiceArgs {
  action: string;
  company_slug: string;
  uuid?: string;
  contact_company_uuid?: string;
  status?: string;
  client_uuid?: string;
  due_date?: string;
  notes?: string;
  currency?: string;
}

interface ProposalArgs {
  action: string;
  company_slug: string;
  uuid?: string;
  title?: string;
  contact_company_uuid?: string;
  status?: string;
  client_uuid?: string;
  content?: string;
  total_amount?: number;
  valid_until?: string;
  currency?: string;
  reason?: string;
}

interface DashboardArgs {
  report: string;
  company_slug: string;
}

interface CrossWorkspaceArgs {
  report: string;
  per_page?: number;
  page?: number;
}

// ============================================================================
// Client Action Handlers
// ============================================================================

const clientHandlers: ActionHandlerMap<ClientArgs> = {
  list: async (client, args) => {
    const clients = await client.getClients(args.company_slug);
    return success(JSON.stringify(clients, null, 2));
  },

  get: async (client, args) => {
    if (!args.uuid) return required("uuid");
    const data = await client.getClient(args.uuid, args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  stats: async (client, args) => {
    if (!args.uuid) return required("uuid");
    const stats = await client.getClientStats(args.uuid, args.company_slug);
    return success(JSON.stringify(stats, null, 2));
  },

  create: async (client, args) => {
    if (!args.name) return required("name");
    const result = await client.createClient({
      name: args.name,
      company_slug: args.company_slug,
      email: args.email,
      phone: args.phone,
      address_line_1: args.address,
      address_line_2: args.address_line_2,
      city: args.city,
      country: args.country,
      postcode: args.postcode,
      vat_number: args.vat_number,
      website: args.website,
      notes: args.notes,
    });
    return success(JSON.stringify({ created: true, client: result }, null, 2));
  },

  update: async (client, args) => {
    if (!args.uuid) return required("uuid");
    const updateData: Record<string, string> = {};
    if (args.name) updateData.name = args.name;
    if (args.email) updateData.email = args.email;
    if (args.phone) updateData.phone = args.phone;
    if (args.address) updateData.address_line_1 = args.address;
    if (args.address_line_2) updateData.address_line_2 = args.address_line_2;
    if (args.city) updateData.city = args.city;
    if (args.country) updateData.country = args.country;
    if (args.postcode) updateData.postcode = args.postcode;
    if (args.vat_number) updateData.vat_number = args.vat_number;
    if (args.website) updateData.website = args.website;
    if (args.notes) updateData.notes = args.notes;
    await client.updateClient(args.uuid, updateData);
    return success(JSON.stringify({ updated: true, uuid: args.uuid }, null, 2));
  },
};

// ============================================================================
// Invoice Action Handlers
// ============================================================================

const invoiceHandlers: ActionHandlerMap<InvoiceArgs> = {
  list: async (client, args) => {
    const invoices = await client.getInvoices(args.company_slug, {
      status: args.status,
      client_uuid: args.client_uuid,
    });
    return success(JSON.stringify(invoices, null, 2));
  },

  get: async (client, args) => {
    if (!args.uuid) return required("uuid");
    const invoice = await client.getInvoice(args.uuid, args.company_slug);
    return success(JSON.stringify(invoice, null, 2));
  },

  stats: async (client, args) => {
    const stats = await client.getInvoiceStats(args.company_slug);
    return success(JSON.stringify(stats, null, 2));
  },

  create: async (client, args) => {
    if (!args.contact_company_uuid) return required("contact_company_uuid");
    const result = await client.createInvoice({
      contact_company_uuid: args.contact_company_uuid,
      company_slug: args.company_slug,
      payment_due_at: args.due_date,
      extra_notes: args.notes,
      currency: args.currency,
    });
    return success(JSON.stringify({ created: true, invoice: result }, null, 2));
  },

  update: async (client, args) => {
    if (!args.uuid) return required("uuid");
    const updateData: Record<string, string> = {};
    if (args.due_date) updateData.payment_due_at = args.due_date;
    if (args.notes) updateData.extra_notes = args.notes;
    await client.updateInvoice(args.uuid, updateData);
    return success(JSON.stringify({ updated: true, uuid: args.uuid }, null, 2));
  },

  issue: async (client, args) => {
    if (!args.uuid) return required("uuid");
    await client.issueInvoice(args.uuid);
    return success(JSON.stringify({ issued: true, uuid: args.uuid }, null, 2));
  },

  send: async (client, args) => {
    if (!args.uuid) return required("uuid");
    await client.sendInvoice(args.uuid);
    return success(JSON.stringify({ sent: true, uuid: args.uuid }, null, 2));
  },

  mark_paid: async (client, args) => {
    if (!args.uuid) return required("uuid");
    await client.markInvoicePaid(args.uuid);
    return success(JSON.stringify({ paid: true, uuid: args.uuid }, null, 2));
  },
};

// ============================================================================
// Proposal Action Handlers
// ============================================================================

const proposalHandlers: ActionHandlerMap<ProposalArgs> = {
  list: async (client, args) => {
    const proposals = await client.getProposals(args.company_slug, {
      status: args.status,
      client_uuid: args.client_uuid,
    });
    return success(JSON.stringify(proposals, null, 2));
  },

  get: async (client, args) => {
    if (!args.uuid) return required("uuid");
    const proposal = await client.getProposal(args.uuid, args.company_slug);
    return success(JSON.stringify(proposal, null, 2));
  },

  stats: async (client, args) => {
    const stats = await client.getProposalStats(args.company_slug);
    return success(JSON.stringify(stats, null, 2));
  },

  create: async (client, args) => {
    if (!args.title) return required("title");
    const result = await client.createProposal({
      title: args.title,
      company_slug: args.company_slug,
      client_uuid: args.contact_company_uuid,
      description: args.content,
      total_value: args.total_amount,
      expires_at: args.valid_until,
      currency: args.currency,
    });
    return success(JSON.stringify({ created: true, proposal: result }, null, 2));
  },

  update: async (client, args) => {
    if (!args.uuid) return required("uuid");
    const updateData: Record<string, unknown> = {};
    if (args.title !== undefined) updateData.title = args.title;
    if (args.content !== undefined) updateData.description = args.content;
    if (args.total_amount !== undefined) updateData.total_value = args.total_amount;
    if (args.valid_until !== undefined) updateData.expires_at = args.valid_until;
    await client.updateProposal(args.uuid, updateData as any);
    return success(JSON.stringify({ updated: true, uuid: args.uuid }, null, 2));
  },

  send: async (client, args) => {
    if (!args.uuid) return required("uuid");
    await client.sendProposal(args.uuid);
    return success(JSON.stringify({ sent: true, uuid: args.uuid }, null, 2));
  },

  approve: async (client, args) => {
    if (!args.uuid) return required("uuid");
    await client.approveProposal(args.uuid);
    return success(JSON.stringify({ approved: true, uuid: args.uuid }, null, 2));
  },

  reject: async (client, args) => {
    if (!args.uuid) return required("uuid");
    await client.rejectProposal(args.uuid, args.reason);
    return success(JSON.stringify({ rejected: true, uuid: args.uuid }, null, 2));
  },

  convert: async (client, args) => {
    if (!args.uuid) return required("uuid");
    const result = await client.convertProposalToProject(args.uuid);
    return success(JSON.stringify({ converted: true, uuid: args.uuid, result }, null, 2));
  },
};

// ============================================================================
// Dashboard Action Handlers
// ============================================================================

const dashboardHandlers: ActionHandlerMap<DashboardArgs> = {
  overview: async (client, args) => {
    const data = await client.getClientFlowOverview(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  revenue: async (client, args) => {
    const data = await client.getRevenuePipeline(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  at_risk: async (client, args) => {
    const data = await client.getClientsAtRisk(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  pending: async (client, args) => {
    const data = await client.getPendingApprovals(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  health: async (client, args) => {
    const data = await client.getProjectsHealth(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  insights: async (client, args) => {
    const data = await client.getActionableInsights(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  leaderboard: async (client, args) => {
    const data = await client.getClientLeaderboard(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },

  analytics: async (client, args) => {
    const data = await client.getClientFlowAnalytics(args.company_slug);
    return success(JSON.stringify(data, null, 2));
  },
};

// ============================================================================
// Cross-Workspace Action Handlers
// ============================================================================

const crossWorkspaceHandlers: ActionHandlerMap<CrossWorkspaceArgs> = {
  invoices: async (client, args) => {
    const data = await client.getCrossWorkspaceInvoices(args.per_page, args.page);
    return success(JSON.stringify(data, null, 2));
  },

  proposals: async (client, args) => {
    const data = await client.getCrossWorkspaceProposals(args.per_page, args.page);
    return success(JSON.stringify(data, null, 2));
  },

  clients: async (client, args) => {
    const data = await client.getCrossWorkspaceClients(args.per_page, args.page);
    return success(JSON.stringify(data, null, 2));
  },

  change_requests: async (client, args) => {
    const data = await client.getCrossWorkspaceChangeRequests(args.per_page, args.page);
    return success(JSON.stringify(data, null, 2));
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleClientFlowTool(
  client: GitScrumClient,
  name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  // Cross-workspace tool does NOT require company_slug
  if (name === "clientflow_cross_workspace") {
    return executeAction(crossWorkspaceHandlers, args.report as string, client, args);
  }

  if (!args.company_slug) return required("company_slug");

  switch (name) {
    case "client":
      return executeAction(clientHandlers, args.action as string, client, args);

    case "invoice":
      return executeAction(invoiceHandlers, args.action as string, client, args);

    case "proposal":
      return executeAction(proposalHandlers, args.action as string, client, args);

    case "clientflow_dashboard":
      return executeAction(dashboardHandlers, args.report as string, client, args);

    default:
      return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
  }
}
