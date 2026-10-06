/**
 * InvoicePresenter — View layer for Invoice entities
 */
import { definePresenter, suggest } from '@vurb/core';
import { InvoiceModel, type Invoice } from '../models/InvoiceModel.js';
import { ClientPresenter } from './ClientPresenter.js';

export const InvoicePresenter = definePresenter({
  name: 'Invoice',
  schema: InvoiceModel.schema,
  rules: [
    'CRITICAL: The "total" field is in CENTS. Divide by 100 before displaying.',
    'Display monetary values with proper currency formatting.',
  ],
  embeds: [{ key: 'client', presenter: ClientPresenter }] as any,
  suggestActions: (invoice: Invoice) => [
    ...(invoice.status === 'pending' || invoice.status === 'draft'
      ? [suggest('invoice.update', 'Update invoice status')]
      : []),
    suggest('invoice.get', 'View invoice details'),
  ],
  collectionSuggestions: (invoices: Invoice[]) => [
    invoices.some(i => i.status === 'overdue')
      ? suggest('invoice.list', '⚠️ Some invoices are overdue')
      : null,
  ],
});
