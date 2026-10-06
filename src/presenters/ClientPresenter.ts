/**
 * ClientPresenter — View layer for Client entities
 */
import { definePresenter, suggest } from '@vurb/core';
import { ClientModel, type Client } from '../models/ClientModel.js';

export const ClientPresenter = definePresenter({
  name: 'Client',
  schema: ClientModel.schema,
  rules: ['Redact email and phone in non-admin contexts.'],
  suggestActions: (client: Client) => [
    suggest('client.stats', `View ${client.name}'s statistics`),
    suggest('invoice.list', 'View client invoices'),
    suggest('proposal.list', 'View client proposals'),
  ],
});
