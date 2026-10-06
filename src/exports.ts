/**
 * Public API re-exports for @gitscrum-studio/mcp-server
 *
 * Re-exports core types from @vurb/core and @vurb/oauth
 * so consumers can import directly from this package.
 */

// ── Vurb Core ────────────────────────────────────────────
export { success, error, required } from '@vurb/core';
export type { ToolResponse } from '@vurb/core';

// ── Context ──────────────────────────────────────────────
export { f } from './context.js';
export type { AppContext } from './context.js';

// ── API Client ───────────────────────────────────────────
export { GitScrumClient } from './client/GitScrumClient.js';

// ── Auth ─────────────────────────────────────────────────
export { DeviceAuthenticator } from './auth/DeviceAuthenticator.js';
export { TokenManager } from './auth/TokenManager.js';

// ── Utils ────────────────────────────────────────────────
export { resolveProjectContext, normalizeColor } from './utils/resolveProject.js';
export type { ProjectContext } from './utils/resolveProject.js';
