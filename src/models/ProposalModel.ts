/**
 * ProposalModel — Domain Model for Proposal entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const ProposalModel = defineModel('Proposal', m => {

  m.casts({
    uuid:          m.uuid('Proposal unique identifier'),
    title:         m.string('Proposal title'),
    content:       m.text('Proposal content in markdown').alias('description'),
    status:        m.string('Proposal status'),

    // ── Input-only fields ────────────────────────
    company_slug:  m.string('Workspace identifier'),
    proposal_uuid: m.uuid('Proposal to update'),
    client_uuid:   m.uuid('Client for proposal'),
  });

  m.timestamps();

  m.hidden(['company_slug', 'proposal_uuid', 'client_uuid']);

  m.guarded(['uuid', 'created_at', 'updated_at']);

  m.fillable({
    create: ['company_slug', 'client_uuid', 'title', 'content'],
    update: ['company_slug', 'proposal_uuid', 'title', 'content', 'status'],
    query:  ['company_slug', 'client_uuid', 'status'],
    get:    ['company_slug', 'proposal_uuid'],
  });

});

export type Proposal = typeof ProposalModel.infer;
