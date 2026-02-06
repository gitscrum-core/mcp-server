/**
 * Authentication Tools
 * 
 * MCP tools for authenticating with GitScrum using Device Code Flow
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GitScrumClient } from "../client/GitScrumClient.js";
import { TokenManager } from "../auth/TokenManager.js";
import { DeviceAuthenticator } from "../auth/DeviceAuthenticator.js";
import { type ToolResponse } from "./shared/actionHandler.js";

interface UserInfo {
  name: string;
  email: string;
  username?: string;
}

/**
 * Register authentication tools
 */
export function registerAuthTools(): Tool[] {
  return [
    {
      name: "auth_login",
      description: "Start login. Returns URL and code for browser authorization.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
      annotations: { title: "Login", readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    {
      name: "auth_complete",
      description: "Complete login after browser authorization.",
      inputSchema: {
        type: "object" as const,
        properties: {
          device_code: {
            type: "string",
            description: "The device_code returned from auth_login (REQUIRED)",
          },
        },
        required: ["device_code"],
      },
      annotations: { title: "Complete Login", readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    {
      name: "auth_status",
      description: "Check authentication status.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
      annotations: { title: "Auth Status", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    {
      name: "auth_logout",
      description: "Logout and clear token.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
      annotations: { title: "Logout", readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    },
  ];
}

// ============================================================================
// Response Helpers (auth-specific, match actionHandler pattern)
// ============================================================================

function authSuccess(data: Record<string, unknown>): ToolResponse {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function authError(data: Record<string, unknown>): ToolResponse {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], isError: true };
}

/**
 * Handle authentication tool calls
 */
export async function handleAuthTool(
  client: GitScrumClient,
  name: string,
  args: Record<string, unknown> = {}
): Promise<ToolResponse> {
  const tokenManager = new TokenManager();
  const authenticator = new DeviceAuthenticator();

  switch (name) {
    case "auth_login": {
      try {
        const deviceInfo = await authenticator.requestDeviceCode();
        tokenManager.savePendingDeviceCode(deviceInfo.device_code, deviceInfo.expires_in);

        return authSuccess({
          status: "pending",
          verification_url: deviceInfo.verification_uri_complete,
          user_code: deviceInfo.user_code,
          expires_in_minutes: Math.round(deviceInfo.expires_in / 60),
          instructions: [
            "Open the verification URL in your browser",
            "Sign in with Google, GitHub, or email",
            "Click Authorize",
            "After authorizing, call auth_complete",
          ],
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);

        let error_type = "unknown";
        if (msg.includes("401") || msg.includes("Unauthorized")) error_type = "unauthorized";
        else if (msg.includes("Unable to connect") || msg.includes("ECONNREFUSED") || msg.includes("Network")) error_type = "network";
        else if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) error_type = "timeout";

        return authError({ error: error_type, message: msg });
      }
    }

    case "auth_complete": {
      let deviceCode = args.device_code as string;
      if (!deviceCode) deviceCode = tokenManager.getPendingDeviceCode() as string;
      if (!deviceCode) {
        return authError({ error: "no_pending_auth", message: "No pending authorization. Run auth_login first." });
      }

      try {
        const tokenResponse = await authenticator.pollForToken(deviceCode);

        if (!tokenResponse) {
          return authSuccess({ status: "authorization_pending", message: "User has not yet authorized. Complete authorization in browser, then retry." });
        }

        tokenManager.clearPendingDeviceCode();
        tokenManager.saveToken(tokenResponse.access_token);
        client.setToken(tokenResponse.access_token);

        try {
          const user = await client.getMe() as UserInfo;
          return authSuccess({ status: "authenticated", user: { name: user.name, email: user.email, username: user.username || null } });
        } catch {
          return authSuccess({ status: "authenticated" });
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);

        if (msg.includes("expired")) {
          return authError({ error: "expired", message: "Authorization code expired. Run auth_login for a new code." });
        }
        if (msg.includes("denied") || msg.includes("access_denied")) {
          return authError({ error: "access_denied", message: "Authorization denied. Run auth_login to try again." });
        }
        return authError({ error: "auth_failed", message: msg });
      }
    }

    case "auth_status": {
      const savedToken = tokenManager.getToken();
      const envToken = process.env.GITSCRUM_TOKEN;

      if (!savedToken && !envToken) {
        return authSuccess({
          authenticated: false,
          options: ["Run auth_login to authenticate via browser", "Set GITSCRUM_TOKEN environment variable"],
        });
      }

      try {
        const user = await client.getMe() as UserInfo;
        return authSuccess({
          authenticated: true,
          user: { name: user.name, email: user.email, username: user.username || null },
          token_source: envToken ? "environment_variable" : "saved_token",
        });
      } catch {
        return authError({
          authenticated: false,
          error: "token_invalid",
          message: "Token expired or invalid. Run auth_login to reconnect.",
        });
      }
    }

    case "auth_logout": {
      try { await client.logout(); } catch { /* ignore */ }
      tokenManager.clearToken();
      return authSuccess({ status: "logged_out" });
    }

    default:
      return authError({ error: "unknown_tool", message: `Unknown auth tool: ${name}` });
  }
}

