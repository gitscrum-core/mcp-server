/**
 * NotePresenter — View layer for Note entities
 */
import { definePresenter, suggest } from '@vurb/core';
import { NoteModel } from '../models/NoteModel.js';

export const NotePresenter = definePresenter({
  name: 'Note',
  schema: NoteModel.schema,
  suggestActions: () => [
    suggest('note.update', 'Edit note'),
    suggest('note.share', 'Share note'),
    suggest('note.revisions', 'View revision history'),
  ],
});
