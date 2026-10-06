/**
 * Notes & Note Folders — vurb.ts Showcase
 *
 * ✅ .tags('content') — content management capability
 * ✅ .returns(NotePresenter) — MVA pipeline
 * ✅ .invalidates() — cascades on mutation
 * ✅ .instructions() — AI-first intent guidance
 * ✅ .fromModel() — zero-boilerplate input from Models
 */

import { f } from '../context.js';
import { NotePresenter } from '../presenters/index.js';
import { NoteModel } from '../models/NoteModel.js';
import { NoteFolderModel } from '../models/NoteFolderModel.js';

// ── Note Router ──────────────────────────────────────────

const note = f.router('note')
  .describe('Notes management — create, edit, share, revisions')
  .tags('content');

export const listNotes = note.query('list')
  .describe('List notes in a workspace')
  .fromModel(NoteModel, 'query')
  .returns(NotePresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getNotes(input.company_slug, { folder_uuid: input.folder_uuid });
  });

export const createNote = note.mutation('create')
  .describe('Create a new note')
  .invalidates('note.*')
  .fromModel(NoteModel, 'create')
  .handle(async (input, ctx) => {
    const data = await ctx.client.createNote({
      title: input.title,
      content: input.content,
      company_slug: input.company_slug,
      folder_uuid: input.folder_uuid,
    });
    return { created: true, note: data };
  });

export const updateNote = note.action('update')
  .describe('Update a note')
  .idempotent()
  .invalidates('note.*')
  .withString('uuid', 'Note unique identifier')
  .fromModel(NoteModel, 'update')
  .handle(async (input, ctx) => {
    const data = NoteModel.toApi({
      title: input.title,
      content: input.content,
    });
    await ctx.client.updateNote(input.uuid, data);
    return { updated: true, uuid: input.uuid };
  });

export const shareNote = note.action('share')
  .describe('Toggle note sharing')
  .withString('uuid', 'Note unique identifier')
  .handle(async (input, ctx) => {
    const result = await ctx.client.toggleNoteShare(input.uuid);
    return { toggled: true, result };
  });

export const noteRevisions = note.query('revisions')
  .describe('Get note revision history')
  .fromModel(NoteModel, 'revisions')
  .returns(NotePresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getNoteRevisions(input.uuid, input.company_slug);
  });

export const searchNotes = note.query('search')
  .describe('Search notes')
  .instructions('Use when the user wants to find notes by keyword. Minimum 2 characters required.')
  .fromModel(NoteModel, 'search')
  .returns(NotePresenter)
  .handle(async (input, ctx) => {
    return await ctx.client.getNotes(input.company_slug, { search: input.q });
  });

// ── Note Folder Router ───────────────────────────────────

const noteFolder = f.router('note_folder')
  .describe('Note folder organization')
  .tags('content');

export const listNoteFolders = noteFolder.query('list')
  .describe('List note folders')
  .cached()
  .fromModel(NoteFolderModel, 'query')
  .handle(async (input, ctx) => {
    return await ctx.client.getNoteFolders(input.company_slug);
  });

export const createNoteFolder = noteFolder.mutation('create')
  .describe('Create a note folder')
  .invalidates('note_folder.*')
  .fromModel(NoteFolderModel, 'create')
  .handle(async (input, ctx) => {
    const folder = await ctx.client.createNoteFolder(NoteFolderModel.toApi({
      title: input.title,
      company_slug: input.company_slug,
    }) as { name: string; company_slug: string });
    return { created: true, folder };
  });

export const updateNoteFolder = noteFolder.action('update')
  .describe('Update a note folder')
  .idempotent()
  .invalidates('note_folder.*')
  .withString('uuid', 'Folder unique identifier')
  .withOptionalString('title', 'New folder name')
  .handle(async (input, ctx) => {
    const data = NoteFolderModel.toApi({ title: input.title });
    await ctx.client.updateNoteFolder(input.uuid, data);
    return { updated: true, uuid: input.uuid };
  });

export const moveNoteToFolder = noteFolder.action('move')
  .describe('Move a note to a different folder')
  .withString('uuid', 'Note unique identifier')
  .withOptionalString('folder_uuid', 'Target folder (omit for root)')
  .handle(async (input, ctx) => {
    await ctx.client.moveNoteToFolder(input.uuid, input.folder_uuid ?? null);
    return { moved: true, uuid: input.uuid, folder_uuid: input.folder_uuid ?? 'root' };
  });
