/**
 * NoteModel — Domain Model for Note entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const NoteModel = defineModel('Note', m => {

  m.casts({
    uuid:         m.uuid('Note unique identifier'),
    title:        m.string('Note title'),
    content:      m.text('Note content in markdown'),
    folder_uuid:  m.uuid('Parent folder identifier'),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
    q:            m.string('Search query (min 2 characters)'),
  });

  m.timestamps();

  m.hidden(['company_slug', 'q']);

  m.guarded(['uuid', 'created_at', 'updated_at']);

  m.fillable({
    create:    ['company_slug', 'title', 'content', 'folder_uuid'],
    update:    ['company_slug', 'title', 'content'],
    query:     ['company_slug', 'folder_uuid'],
    search:    ['company_slug', 'q'],
    revisions: ['company_slug', 'uuid'],
  });

});

export type Note = typeof NoteModel.infer;
