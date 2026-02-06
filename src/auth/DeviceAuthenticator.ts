/**
 * Device Authorization Flow
 *
 * Implements OAuth 2.0 Device Authorization Grant (RFC 8628)
 * Allows MCP to authenticate users via browser login.
 *
 * Flow:
 * 1. MCP requests device code from API
 * 2. User opens verification URL in browser (contains device_code)
 * 3. User logs in (Google, GitHub, or email/password)
 * 4. User clicks "Authorize" - no manual code entry needed
 * 5. MCP polls for token until authorized
 *
 * @module @gitscrum-studio/mcp-server/auth
 */

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface AuthError {
  error: string;
  error_description?: string;
}

/**
 * Handles Device Authorization Flow for CLI/MCP authentication
 */
export class DeviceAuthenticator {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || process.env.GITSCRUM_API_URL || "https://services.gitscrum.com";
  }

  /**
   * MCP Client ID - must match OAuthClientRegistry on the API
   */
  private static readonly MCP_CLIENT_ID = "9e8d7c6b-5a4f-3e2d-1c0b-a9b8c7d6e5f4";

  /**
   * Start the device authorization flow
   * Returns the device code info that should be shown to the user
   */
  async requestDeviceCode(): Promise<DeviceCodeResponse> {
    const url = `${this.apiUrl}/oauth/device/code`;
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Client-Source": "mcp-server",
        },
        body: JSON.stringify({ client_id: DeviceAuthenticator.MCP_CLIENT_ID }),
      });

      if (!response.ok) {
        const error = await response.json() as AuthError;
        throw new Error(error.error_description || `API error: ${response.status} ${response.statusText}`);
      }

      return response.json() as Promise<DeviceCodeResponse>;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(`Network error: Unable to connect to ${url}. Is the API server running?`);
      }
      throw error;
    }
  }

  /**
   * Poll for the access token
   * Should be called repeatedly until success or error (other than pending)
   */
  async pollForToken(deviceCode: string): Promise<TokenResponse | null> {
    const response = await fetch(`${this.apiUrl}/oauth/device/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Client-Source": "mcp-server",
      },
      body: JSON.stringify({
        device_code: deviceCode,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
    });

    if (!response.ok) {
      const error = await response.json() as AuthError;
      
      // These are expected while waiting for user authorization
      if (error.error === "authorization_pending") {
        return null; // Keep polling
      }
      
      if (error.error === "slow_down") {
        return null; // Keep polling, but slower
      }
      
      // These are terminal errors
      throw new Error(error.error_description || error.error);
    }

    return response.json() as Promise<TokenResponse>;
  }
}
