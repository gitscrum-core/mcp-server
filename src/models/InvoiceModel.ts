/**
 * InvoiceModel — Domain Model for Invoice entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const InvoiceModel = defineModel('Invoice', m => {

  m.casts({
    uuid:         m.uuid('Invoice unique identifier'),
    status:       m.string('Invoice status'),
    due_date:     m.date('Due date').alias('payment_due_at'),
    total:        m.number('Total amount in cents — divide by 100 for display'),
    tax_rate:     m.number('Tax rate percentage'),
    notes:        m.text('Invoice notes').alias('extra_notes'),
    client:       m.object('Associated client', {
      uuid:  m.uuid(),
      name:  m.string(),
      email: m.string(),
    }),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
    invoice_uuid: m.uuid('Invoice to update'),
    client_uuid:  m.uuid('Client to invoice').alias('contact_company_uuid'),
  });

  m.timestamps();

  m.hidden(['company_slug', 'invoice_uuid', 'client_uuid']);

  m.guarded(['uuid', 'total', 'client', 'created_at', 'updated_at']);

  m.fillable({
    create: ['company_slug', 'client_uuid', 'due_date', 'notes', 'tax_rate'],
    update: ['company_slug', 'invoice_uuid', 'status', 'due_date', 'notes'],
    query:  ['company_slug', 'client_uuid', 'status'],
    get:    ['company_slug', 'invoice_uuid'],
  });

});

export type Invoice = typeof InvoiceModel.infer;
