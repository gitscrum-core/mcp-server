/**
 * ClientFlow Tools Tests (Consolidated)
 * 
 * Tests for the consolidated ClientFlow tools (client, invoice, proposal, clientflow_dashboard)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockGitScrumClient } from '../mocks/MockGitScrumClient.js';
import { handleClientFlowTool } from '../../src/tools/clientflow.js';

describe('ClientFlow Tools (Consolidated)', () => {
  let client: MockGitScrumClient;

  beforeEach(() => {
    client = new MockGitScrumClient();
  });

  // =========================================================================
  // CLIENT TOOL
  // =========================================================================
  describe('client tool', () => {
    it('action:list should return list of clients', async () => {
      const result = await handleClientFlowTool(client as any, 'client', {
        action: 'list',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('action:get should return client details', async () => {
      const result = await handleClientFlowTool(client as any, 'client', {
        action: 'get',
        uuid: 'client-uuid-1',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('uuid');
    });

    it('action:stats should return client statistics', async () => {
      const result = await handleClientFlowTool(client as any, 'client', {
        action: 'stats',
        uuid: 'client-uuid-1',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('total_invoiced');
    });

    it('action:create should create a new client', async () => {
      const result = await handleClientFlowTool(client as any, 'client', {
        action: 'create',
        name: 'New Client Inc',
        email: 'new@client.com',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created');
    });

    it('action:update should update a client', async () => {
      const result = await handleClientFlowTool(client as any, 'client', {
        action: 'update',
        uuid: 'client-uuid-1',
        name: 'Updated Client Name',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('updated');
    });

    it('should require company_slug', async () => {
      const result = await handleClientFlowTool(client as any, 'client', { action: 'list' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('company_slug required');
    });

    it('action:get should require uuid', async () => {
      const result = await handleClientFlowTool(client as any, 'client', {
        action: 'get',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('uuid required');
    });
  });

  // =========================================================================
  // INVOICE TOOL
  // =========================================================================
  describe('invoice tool', () => {
    it('action:list should return list of invoices', async () => {
      const result = await handleClientFlowTool(client as any, 'invoice', {
        action: 'list',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('action:get should return invoice details', async () => {
      const result = await handleClientFlowTool(client as any, 'invoice', {
        action: 'get',
        uuid: 'invoice-uuid-1',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('uuid');
    });

    it('action:stats should return invoice statistics', async () => {
      const result = await handleClientFlowTool(client as any, 'invoice', {
        action: 'stats',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('total_revenue');
    });

    it('action:create should create a new invoice', async () => {
      const result = await handleClientFlowTool(client as any, 'invoice', {
        action: 'create',
        contact_company_uuid: 'client-uuid-1',
        company_slug: 'test-workspace',
        due_date: '2024-03-15',
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created');
    });

    it('action:issue should issue an invoice', async () => {
      const result = await handleClientFlowTool(client as any, 'invoice', {
        action: 'issue',
        uuid: 'invoice-uuid-1',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('issued');
    });

    it('action:send should send invoice to client', async () => {
      const result = await handleClientFlowTool(client as any, 'invoice', {
        action: 'send',
        uuid: 'invoice-uuid-1',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('sent');
    });

    it('action:mark_paid should mark invoice as paid', async () => {
      const result = await handleClientFlowTool(client as any, 'invoice', {
        action: 'mark_paid',
        uuid: 'invoice-uuid-1',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('paid');
    });
  });

  // =========================================================================
  // PROPOSAL TOOL
  // =========================================================================
  describe('proposal tool', () => {
    it('action:list should return list of proposals', async () => {
      const result = await handleClientFlowTool(client as any, 'proposal', {
        action: 'list',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('action:get should return proposal details', async () => {
      const result = await handleClientFlowTool(client as any, 'proposal', {
        action: 'get',
        uuid: 'proposal-uuid-1',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('uuid');
    });

    it('action:stats should return proposal statistics', async () => {
      const result = await handleClientFlowTool(client as any, 'proposal', {
        action: 'stats',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('total_value');
    });

    it('action:create should create a new proposal', async () => {
      const result = await handleClientFlowTool(client as any, 'proposal', {
        action: 'create',
        title: 'New Website Project',
        company_slug: 'test-workspace',
        total_amount: 25000,
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created');
    });

    it('action:send should send proposal to client', async () => {
      const result = await handleClientFlowTool(client as any, 'proposal', {
        action: 'send',
        uuid: 'proposal-uuid-1',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('sent');
    });

    it('action:approve should approve a proposal', async () => {
      const result = await handleClientFlowTool(client as any, 'proposal', {
        action: 'approve',
        uuid: 'proposal-uuid-1',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('approved');
    });

    it('action:reject should reject a proposal', async () => {
      const result = await handleClientFlowTool(client as any, 'proposal', {
        action: 'reject',
        uuid: 'proposal-uuid-1',
        reason: 'Budget constraints',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('rejected');
    });

    it('action:convert should convert proposal to project', async () => {
      const result = await handleClientFlowTool(client as any, 'proposal', {
        action: 'convert',
        uuid: 'proposal-uuid-1',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('converted');
    });
  });

  // =========================================================================
  // CLIENTFLOW_DASHBOARD TOOL
  // =========================================================================
  describe('clientflow_dashboard tool', () => {
    it('report:overview should return executive overview', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_dashboard', {
        report: 'overview',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('total_clients');
    });

    it('report:revenue should return revenue pipeline', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_dashboard', {
        report: 'revenue',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('current_month');
    });

    it('report:at_risk should return at-risk clients', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_dashboard', {
        report: 'at_risk',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('report:pending should return pending items', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_dashboard', {
        report: 'pending',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('proposals');
    });

    it('report:health should return project health metrics', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_dashboard', {
        report: 'health',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('on_track');
    });

    it('report:insights should return actionable insights', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_dashboard', {
        report: 'insights',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('report:leaderboard should return client rankings', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_dashboard', {
        report: 'leaderboard',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('report:analytics should return detailed analytics', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_dashboard', {
        report: 'analytics',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('revenue_trend');
    });
  });

  // =========================================================================
  // ERROR HANDLING
  // =========================================================================
  describe('Error Handling', () => {
    it('should require company_slug for all tools', async () => {
      const result = await handleClientFlowTool(client as any, 'client', { action: 'list' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('company_slug required');
    });

    it('should require uuid for get actions', async () => {
      const result = await handleClientFlowTool(client as any, 'client', {
        action: 'get',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('uuid required');
    });

    it('should require name for client_create', async () => {
      const result = await handleClientFlowTool(client as any, 'client', {
        action: 'create',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('name required');
    });

    it('should require title for proposal_create', async () => {
      const result = await handleClientFlowTool(client as any, 'proposal', {
        action: 'create',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('title required');
    });

    it('should require contact_company_uuid for invoice_create', async () => {
      const result = await handleClientFlowTool(client as any, 'invoice', {
        action: 'create',
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('contact_company_uuid required');
    });

    it('should return error for unknown tool', async () => {
      const result = await handleClientFlowTool(client as any, 'unknown_tool', {
        company_slug: 'test-workspace',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown');
    });
  });

  // =========================================================================
  // CROSS-WORKSPACE TOOL
  // =========================================================================
  describe('clientflow_cross_workspace tool', () => {
    it('report:invoices should return cross-workspace invoices overview', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_cross_workspace', {
        report: 'invoices',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.stats).toBeDefined();
      expect(parsed.stats.total).toBe(15);
      expect(parsed.stats.paid).toBe(7);
      expect(parsed.stats.overdue).toBe(2);
      expect(parsed.workspaces).toBeDefined();
      expect(parsed.workspaces.length).toBe(2);
      expect(parsed.data).toBeDefined();
      expect(parsed.data[0].company).toBeDefined();
      expect(parsed.data[0].company.slug).toBe('workspace-1');
      expect(parsed.meta).toBeDefined();
      expect(parsed.meta.total).toBe(15);
    });

    it('report:invoices should support pagination params', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_cross_workspace', {
        report: 'invoices',
        per_page: 10,
        page: 2,
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.meta.per_page).toBe(10);
      expect(parsed.meta.current_page).toBe(2);
    });

    it('report:proposals should return cross-workspace proposals overview', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_cross_workspace', {
        report: 'proposals',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.stats).toBeDefined();
      expect(parsed.stats.total).toBe(8);
      expect(parsed.stats.approved).toBe(3);
      expect(parsed.stats.pending).toBe(3);
      expect(parsed.workspaces).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(parsed.data[0].name).toBe('Q1 Redesign');
      expect(parsed.data[0].company.slug).toBe('workspace-1');
    });

    it('report:clients should return cross-workspace clients overview', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_cross_workspace', {
        report: 'clients',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.stats).toBeDefined();
      expect(parsed.stats.total).toBe(12);
      expect(parsed.stats.with_invoices).toBe(8);
      expect(parsed.stats.with_overdue).toBe(1);
      expect(parsed.workspaces).toBeDefined();
      expect(parsed.workspaces.length).toBe(2);
      expect(parsed.data).toBeDefined();
      expect(parsed.data[0].invoices_count).toBe(5);
      expect(parsed.data[0].total_paid).toBe(200000);
    });

    it('report:change_requests should return cross-workspace change requests overview', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_cross_workspace', {
        report: 'change_requests',
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.stats).toBeDefined();
      expect(parsed.stats.total).toBe(6);
      expect(parsed.stats.pending).toBe(3);
      expect(parsed.stats.approved_value).toBe(40000);
      expect(parsed.workspaces).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(parsed.data[0].proposal).toBeDefined();
      expect(parsed.data[0].project).toBeDefined();
      expect(parsed.data[0].company.slug).toBe('workspace-1');
    });

    it('should NOT require company_slug for cross-workspace tool', async () => {
      // Cross-workspace tool should work WITHOUT company_slug
      const result = await handleClientFlowTool(client as any, 'clientflow_cross_workspace', {
        report: 'invoices',
        // no company_slug
      });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.stats).toBeDefined();
    });

    it('should return error for unknown cross-workspace report', async () => {
      const result = await handleClientFlowTool(client as any, 'clientflow_cross_workspace', {
        report: 'nonexistent',
      });

      expect(result.isError).toBe(true);
    });
  });
});
