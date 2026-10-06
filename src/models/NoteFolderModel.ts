/**
 * NoteFolderModel — Domain Model for Note Folder entities
 *
 * @module
 */

import { defineModel } from '@vurb/core';

export const NoteFolderModel = defineModel('NoteFolder', m => {

  m.casts({
    uuid:         m.uuid('Folder unique identifier'),
    title:        m.string('Folder name').alias('name'),
    parent_uuid:  m.uuid('Parent folder for nesting'),

    // ── Input-only fields ────────────────────────
    company_slug: m.string('Workspace identifier'),
  });

  m.hidden(['company_slug']);

  m.guarded(['uuid']);

  m.fillable({
    query:  ['company_slug'],
    create: ['company_slug', 'title', 'parent_uuid'],
  });

});

export type NoteFolder = typeof NoteFolderModel.infer;
