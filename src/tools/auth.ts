/**
 * Authentication Tool — Device Flow via @vurb/oauth
 *
 * Replaces manual auth tool registration with `createAuthTool()`.
 * Actions: login, complete, status, logout
 */

// @ts-expect-error — @vurb/oauth is resolved at runtime from the monorepo
import { createAuthTool } from '@vurb/oauth';
import type { AppContext } from '../context.js';

export const authTool = createAuthTool<AppContext>({
  clientId: '9e8d7c6b-5a4f-3e2d-1c0b-a9b8c7d6e5f4',
  authorizationEndpoint: 'https://services.gitscrum.com/oauth/device/code',
  tokenEndpoint: 'https://services.gitscrum.com/oauth/device/token',
  headers: { 'X-Client-Source': 'mcp-server' },
  tokenManager: { configDir: '.gitscrum', envVar: 'GITSCRUM_TOKEN' },
  onAuthenticated: (token: string, ctx: AppContext) => ctx.client.setToken(token),
  onLogout: async (ctx: AppContext) => {
    try { await ctx.client.logout(); } catch { /* ignore */ }
  },
  getUser: async (ctx: AppContext) => {
    const user = await ctx.client.getMe() as { name: string; email: string; username?: string };
    return { name: user.name, email: user.email, username: user.username };
  },
});
