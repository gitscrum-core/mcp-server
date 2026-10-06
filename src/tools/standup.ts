/**
 * Standup Reports — Fluent API + MVA
 *
 * ✅ .fromModel() — zero-boilerplate input from Models
 * ✅ .proxy() — direct API endpoint mapping
 */

import { f } from '../context.js';
import { StandupModel } from '../models/StandupModel.js';

const standup = f.router('standup')
  .describe('Daily standup and team status reports')
  .tags('analytics');

export const standupSummary = standup.query('summary')
  .describe('Daily standup summary')
  .stale()
  .fromModel(StandupModel, 'query')
  .proxy('companies/standup/summary');

export const standupCompleted = standup.query('completed')
  .describe('Tasks completed since last standup')
  .stale()
  .fromModel(StandupModel, 'completed')
  .proxy('companies/standup/completed-yesterday');

export const standupBlockers = standup.query('blockers')
  .describe('Active blockers for standup discussion')
  .stale()
  .fromModel(StandupModel, 'query')
  .proxy('companies/standup/blockers');

export const standupTeam = standup.query('team')
  .describe('Team member status snapshot')
  .stale()
  .fromModel(StandupModel, 'query')
  .proxy('companies/standup/team-status');

export const standupStuck = standup.query('stuck')
  .describe('Tasks that have been stuck — no progress for too long')
  .stale()
  .fromModel(StandupModel, 'query')
  .proxy('companies/standup/stuck-tasks');

export const standupDigest = standup.query('digest')
  .describe('Full standup digest with completed, blockers, and stuck items')
  .stale()
  .fromModel(StandupModel, 'query')
  .proxy('companies/standup/weekly-digest');

export const standupContributors = standup.query('contributors')
  .describe('Most active contributors')
  .fromModel(StandupModel, 'query')
  .proxy('companies/standup/contributors');
