/**
 * NoteVault MCP Tools (Consolidated)
 * 
 * Uses Action Handler pattern for clean, extensible code.
 */
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../client/GitScrumClient.js";
import { 
  executeAction, 
  success, 
  required,
  normalizeColor,
  type ActionHandlerMap,
  type ToolResponse
} from "./shared/actionHandler.js";

// ============================================================================
// Tool Registration
// ============================================================================

export function registerNoteTools(): Tool[] {
  return [
    {
      name: "note",
      description: [
        "Notes. Actions: list, get, create, update, share, revisions.",
        "",
        "company_slug is optional (auto-inferred from user).",
        "'get'/'update'/'share'/'revisions' require uuid (from 'list' response).",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["list", "get", "create", "update", "share", "revisions"], 
            description: "Which operation to perform" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier (optional - auto-detected from user if not provided)" 
          },
          uuid: { 
            type: "string", 
            description: "⚠️ ONLY for existing notes! This is the note's database ID. NEVER use for action=create. Use ONLY for: get, update, share, revisions." 
          },
          title: { 
            type: "string", 
            description: "Note title/heading text. Required for action=create." 
          },
          content: { 
            type: "string", 
            description: "The note body text you want to save (Markdown). This is where you put the actual content! Required for action=create." 
          },
          folder_uuid: { 
            type: "string", 
            description: "Folder ID to organize note into (optional)" 
          },
          color: { 
            type: "string", 
            description: "Color code: gray, blue, red, green, yellow, purple, coral, amber, sky, lime (or hex without #)" 
          },
          search: { 
            type: "string", 
            description: "Search term to filter notes (only for list action)" 
          },
        },
        required: ["action"],
      },
      annotations: { title: "Notes", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    {
      name: "note_folder",
      description: [
        "Note folders. Actions: list, create, update, move.",
        "",
        "'move' requires note_uuid (from 'note' tool 'list') and folder_uuid (from 'list' response).",
      ].join("\n"),
      inputSchema: {
        type: "object" as const,
        properties: {
          action: { 
            type: "string", 
            enum: ["list", "create", "update", "move"], 
            description: "Which operation to perform" 
          },
          company_slug: { 
            type: "string", 
            description: "Workspace identifier (always required)" 
          },
          uuid: { 
            type: "string", 
            description: "Existing folder's unique ID. Only for update action." 
          },
          name: { 
            type: "string", 
            description: "Folder name text. Required for create and update." 
          },
          note_uuid: { 
            type: "string", 
            description: "Note ID to move. Required for move action." 
          },
          folder_uuid: { 
            type: "string", 
            description: "Target folder ID to move note into. Omit to unfile note." 
          },
        },
        required: ["action", "company_slug"],
      },
      annotations: { title: "Note Folders", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Types
// ============================================================================

interface NoteArgs {
  action: string;
  company_slug?: string;
  uuid?: string;
  title?: string;
  content?: string;
  folder_uuid?: string;
  color?: string;
  search?: string;
}

interface FolderArgs {
  action: string;
  company_slug: string;
  uuid?: string;
  name?: string;
  note_uuid?: string;
  folder_uuid?: string;
}

// ============================================================================
// Note Action Handlers
// ============================================================================

const noteHandlers: ActionHandlerMap<NoteArgs> = {
  list: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    const notes = await client.getNotes(args.company_slug, {
      folder_uuid: args.folder_uuid,
      color: args.color,
      search: args.search,
    });
    return success(JSON.stringify(notes, null, 2));
  },

  get: async (client, args) => {
    if (!args.uuid) return required("uuid");
    const note = await client.getNote(args.uuid, args.company_slug);
    return success(JSON.stringify(note, null, 2));
  },

  create: async (client, args) => {
    if (!args.company_slug) return required("company_slug");
    const note = await client.createNote({
      title: args.title,
      content: args.content,
      company_slug: args.company_slug,
      folder_uuid: args.folder_uuid,
      color: args.color ? normalizeColor(args.color) : undefined,
    });
    return success(JSON.stringify({ created: true, note }, null, 2));
  },

  update: async (client, args) => {
    if (!args.uuid) return required("uuid");
    const updateData: { title?: string; content?: string; folder_uuid?: string; color?: string } = {};
    if (args.title) updateData.title = args.title;
    if (args.content) updateData.content = args.content;
    if (args.folder_uuid) updateData.folder_uuid = args.folder_uuid;
    if (args.color) updateData.color = normalizeColor(args.color);
    await client.updateNote(args.uuid, updateData);
    return success(JSON.stringify({ updated: true, uuid: args.uuid }, null, 2));
  },

  share: async (client, args) => {
    if (!args.uuid) return required("uuid");
    const note = await client.toggleNoteShare(args.uuid);
    return success(JSON.stringify(note, null, 2));
  },

  revisions: async (client, args) => {
    if (!args.uuid) return required("uuid");
    if (!args.company_slug) return required("company_slug");
    const revisions = await client.getNoteRevisions(args.uuid, args.company_slug);
    return success(JSON.stringify(revisions, null, 2));
  },
};

// ============================================================================
// Folder Action Handlers
// ============================================================================

const folderHandlers: ActionHandlerMap<FolderArgs> = {
  list: async (client, args) => {
    const folders = await client.getNoteFolders(args.company_slug);
    return success(JSON.stringify(folders, null, 2));
  },

  create: async (client, args) => {
    if (!args.name) return required("name");
    const folder = await client.createNoteFolder({ name: args.name, company_slug: args.company_slug });
    return success(JSON.stringify({ created: true, folder }, null, 2));
  },

  update: async (client, args) => {
    if (!args.uuid || !args.name) return required("uuid and name");
    await client.updateNoteFolder(args.uuid, { name: args.name });
    return success(JSON.stringify({ updated: true, uuid: args.uuid }, null, 2));
  },

  move: async (client, args) => {
    if (!args.note_uuid) return required("note_uuid");
    await client.moveNoteToFolder(args.note_uuid, args.folder_uuid || null);
    return success(JSON.stringify({ moved: true, note_uuid: args.note_uuid, folder_uuid: args.folder_uuid || null }, null, 2));
  },
};

// ============================================================================
// Main Handler
// ============================================================================

export async function handleNoteTool(
  client: GitScrumClient,
  name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const action = args.action as string;

  // note_folder always requires company_slug
  if (name === "note_folder") {
    if (!args.company_slug) return required("company_slug");
    return executeAction(folderHandlers, action, client, args);
  }

  // note: validation is done per-action (get only needs uuid)
  return executeAction(noteHandlers, action, client, args);
}
