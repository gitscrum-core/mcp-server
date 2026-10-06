/**
 * ClientModel — Domain Model for Client entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const ClientModel = defineModel('Client', m => {

  m.casts({
    uuid:         m.uuid('Client unique identifier'),
    name:         m.string('Client name'),
    email:        m.string('Email address'),
    phone:        m.string('Phone number'),
    website:      m.string('Website URL'),
    notes:        m.text('Client notes'),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
    client_uuid:  m.uuid('Client unique identifier'),
  });

  m.timestamps();

  m.hidden(['company_slug', 'client_uuid']);

  m.guarded(['uuid', 'created_at', 'updated_at']);

  m.fillable({
    create: ['company_slug', 'name', 'email', 'phone', 'website', 'notes'],
    update: ['company_slug', 'client_uuid', 'name', 'email', 'phone', 'website', 'notes'],
    query:  ['company_slug', 'client_uuid'],
  });

});

export type Client = typeof ClientModel.infer;
