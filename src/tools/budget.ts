/**
 * Budget — Fluent API + MVA
 *
 * ✅ .fromModel() — zero-boilerplate input from Models
 * ✅ .proxy() — direct API endpoint mapping for risk query
 */

import { f } from '../context.js';
import { BudgetModel } from '../models/BudgetModel.js';

const budget = f.router('budget')
  .describe('Project budget tracking — risk analysis, consumption, burn-down, alerts')
  .tags('analytics', 'finance');

export const budgetRisk = budget.query('projects_at_risk')
  .describe('Get projects at risk of budget overrun')
  .fromModel(BudgetModel, 'query')
  .proxy('budget/projects-at-risk');

export const budgetOverview = budget.query('overview')
  .describe('Budget overview across all projects')
  .fromModel(BudgetModel, 'query')
  .handle(async (input, ctx) => {
    return await ctx.client.getBudgetOverview(input.company_slug);
  });

export const budgetConsumption = budget.query('consumption')
  .describe('Budget consumption breakdown')
  .fromModel(BudgetModel, 'query')
  .handle(async (input, ctx) => {
    return await ctx.client.getBudgetConsumption(input.company_slug);
  });

export const budgetBurnDown = budget.query('burn_down')
  .describe('Budget burn-down chart data')
  .fromModel(BudgetModel, 'query')
  .handle(async (input, ctx) => {
    return await ctx.client.getBudgetBurnDown(input.company_slug);
  });

export const budgetAlerts = budget.query('alerts')
  .describe('Active budget alerts and warnings')
  .fromModel(BudgetModel, 'query')
  .handle(async (input, ctx) => {
    return await ctx.client.getBudgetAlerts(input.company_slug);
  });

export const budgetEvents = budget.query('events')
  .describe('Budget event history')
  .fromModel(BudgetModel, 'query')
  .handle(async (input, ctx) => {
    return await ctx.client.getBudgetEvents(input.company_slug);
  });
