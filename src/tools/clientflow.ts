/**
 * Client Flow — vurb.ts Showcase
 *
 * Four routers: client, invoice, proposal, dashboard
 *
 * ✅ .tags('finance') — capability grouping
 * ✅ .returns(Presenter) — MVA pipeline
 * ✅ .invalidates() — cache cascading across routers
 * ✅ .stale() — real-time stats
 * ✅ .concurrency() — runtime guard on invoice creation
 * ✅ .fromModel() — zero-boilerplate input from Models
 */

import { f } from '../context.js';
import { ClientPresenter, InvoicePresenter } from '../presenters/index.js';
import { ClientModel } from '../models/ClientModel.js';
import { InvoiceModel } from '../models/InvoiceModel.js';
import { ProposalModel } from '../models/ProposalModel.js';
import { AnalyticsModel } from '../models/AnalyticsModel.js';

// ── Client Router ────────────────────────────────────────

const client = f.router('client')
  .describe('Client relationship management')
  .tags('finance');

export const listClients = client.query('list')
  .describe('List all clients in a workspace')
  .fromModel(ClientModel, 'query')
  .returns(ClientPresenter)
  .proxy('contact-companies');

export const getClient = client.query('get')
  .describe('Get client details')
  .fromModel(ClientModel, 'query')
  .returns(ClientPresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getClient(input.client_uuid, input.company_slug);
  });

export const createClient = client.mutation('create')
  .describe('Create a new client')
  .invalidates('client.*')
  .fromModel(ClientModel, 'create')
  .handle(async (input, ctx) => {
    const result = await ctx.client.createClient({
      name: input.name,
      company_slug: input.company_slug,
      email: input.email,
      phone: input.phone,
      website: input.website,
      notes: input.notes,
    });
    return { created: true, client: result };
  });

export const updateClient = client.action('update')
  .describe('Update an existing client')
  .idempotent()
  .invalidates('client.*')
  .fromModel(ClientModel, 'update')
  .handle(async (input, ctx) => {
    const data = ClientModel.toApi({
      name: input.name,
      email: input.email,
      phone: input.phone,
      website: input.website,
      notes: input.notes,
    });
    await ctx.client.updateClient(input.client_uuid, data);
    return { updated: true, client_uuid: input.client_uuid };
  });

export const clientStats = client.query('stats')
  .describe('Get client statistics')
  .stale()
  .fromModel(ClientModel, 'query')
  .returns(ClientPresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getClientStats(input.client_uuid, input.company_slug);
  });

// ── Invoice Router ───────────────────────────────────────

const invoice = f.router('invoice')
  .describe('Invoice management — list, create, update')
  .tags('finance');

export const listInvoices = invoice.query('list')
  .describe('List invoices with optional filtering')
  .fromModel(InvoiceModel, 'query')
  .returns(InvoicePresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getInvoices(input.company_slug, {
      client_uuid: input.client_uuid,
      status: input.status,
    });
  });

export const getInvoice = invoice.query('get')
  .describe('Get invoice details')
  .fromModel(InvoiceModel, 'get')
  .returns(InvoicePresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getInvoice(input.invoice_uuid, input.company_slug);
  });

export const createInvoice = invoice.mutation('create')
  .describe('Create a new invoice')
  .invalidates('invoice.*', 'client.*')
  .concurrency({ maxActive: 3, maxQueue: 10 })
  .fromModel(InvoiceModel, 'create')
  .handle(async (input, ctx) => {
    const data = await ctx.client.createInvoice(InvoiceModel.toApi({
      client_uuid: input.client_uuid,
      company_slug: input.company_slug,
      due_date: input.due_date,
      notes: input.notes,
    }) as { contact_company_uuid: string; company_slug: string; payment_due_at?: string; extra_notes?: string });
    return { created: true, invoice: data };
  });

export const updateInvoice = invoice.action('update')
  .describe('Update an invoice')
  .idempotent()
  .invalidates('invoice.*')
  .fromModel(InvoiceModel, 'update')
  .handle(async (input, ctx) => {
    const data = InvoiceModel.toApi({
      due_date: input.due_date,
      notes: input.notes,
    });
    await ctx.client.updateInvoice(input.invoice_uuid, data);
    return { updated: true, invoice_uuid: input.invoice_uuid };
  });

// ── Proposal Router ──────────────────────────────────────

const proposal = f.router('proposal')
  .describe('Proposal management — list, create, update')
  .tags('finance');

export const listProposals = proposal.query('list')
  .describe('List proposals with optional filtering')
  .fromModel(ProposalModel, 'query')
  .handle(async (input, ctx) => {
    return await ctx.client.getProposals(input.company_slug, {
      client_uuid: input.client_uuid,
      status: input.status,
    });
  });

export const getProposal = proposal.query('get')
  .describe('Get proposal details')
  .fromModel(ProposalModel, 'get')
  .handle(async (input, ctx) => {
    return await ctx.client.getProposal(input.proposal_uuid, input.company_slug);
  });

export const createProposal = proposal.mutation('create')
  .describe('Create a new proposal')
  .invalidates('proposal.*')
  .fromModel(ProposalModel, 'create')
  .handle(async (input, ctx) => {
    const data = await ctx.client.createProposal(ProposalModel.toApi({
      title: input.title,
      client_uuid: input.client_uuid,
      company_slug: input.company_slug,
      content: input.content,
    }) as { title: string; client_uuid: string; company_slug: string; description?: string });
    return { created: true, proposal: data };
  });

export const updateProposal = proposal.action('update')
  .describe('Update a proposal')
  .idempotent()
  .invalidates('proposal.*')
  .fromModel(ProposalModel, 'update')
  .handle(async (input, ctx) => {
    const data = ProposalModel.toApi({
      title: input.title,
      content: input.content,
    });
    await ctx.client.updateProposal(input.proposal_uuid, data);
    return { updated: true, proposal_uuid: input.proposal_uuid };
  });

// ── Dashboard Router ─────────────────────────────────────

const dashboard = f.router('dashboard')
  .describe('Dashboard analytics and cross-workspace reporting')
  .tags('analytics');

export const dashboardOverview = dashboard.query('company_overview')
  .describe('Get workspace dashboard overview')
  .stale()
  .fromModel(AnalyticsModel, 'query')
  .proxy('client-flow/dashboard/overview');

export const crossWorkspace = dashboard.query('cross_workspace')
  .describe('Get cross-workspace aggregated report')
  .stale()
  .proxy('client-flow/all-workspaces/clients', { unwrap: false });
