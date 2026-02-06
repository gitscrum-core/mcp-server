/**
 * Token Manager
 *
 * Handles secure storage and retrieval of authentication tokens.
 * Tokens are stored in a local file for persistence between sessions.
 * Implements strict permission checking for security.
 *
 * @module @gitscrum-studio/mcp-server/auth
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Manages authentication tokens with secure storage
 */
export class TokenManager {
  private configDir: string;
  private tokenFile: string;
  private pendingAuthFile: string;

  constructor() {
    // Store in user's home directory under .gitscrum
    this.configDir = path.join(os.homedir(), ".gitscrum");
    this.tokenFile = path.join(this.configDir, "mcp-token.json");
    this.pendingAuthFile = path.join(this.configDir, "pending-auth.json");
  }

  /**
   * Ensure the config directory exists with secure permissions
   * @private
   */
  private ensureConfigDir(): void {
    if (!fs.existsSync(this.configDir)) {
      try {
        fs.mkdirSync(this.configDir, { recursive: true, mode: 0o700 });
      } catch (error) {
        console.error("Failed to create configuration directory:", error);
      }
    }
  }

  /**
   * Save token to local secure storage
   *
   * @param token - The authentication token to save
   */
  saveToken(token: string): void {
    try {
      this.ensureConfigDir();

      const data = {
        token,
        savedAt: new Date().toISOString(),
      };

      fs.writeFileSync(this.tokenFile, JSON.stringify(data, null, 2), {
        mode: 0o600, // Only owner can read/write
      });
    } catch (error) {
      console.error("Failed to save token:", error);
      throw new Error("Could not save authentication token to disk");
    }
  }

  /**
   * Get the current authentication token
   * Priorities:
   * 1. Environment variable GITSCRUM_TOKEN
   * 2. Saved token in configuration file
   *
   * @returns The token string or null if not found
   */
  getToken(): string | null {
    // First check environment variable
    if (process.env.GITSCRUM_TOKEN) {
      return process.env.GITSCRUM_TOKEN;
    }

    // Then check saved file
    if (!fs.existsSync(this.tokenFile)) {
      return null;
    }

    try {
      const content = fs.readFileSync(this.tokenFile, "utf-8");
      const data = JSON.parse(content);
      return data.token || null;
    } catch (error) {
      // Silently fail on read errors (file might be corrupted)
      return null;
    }
  }

  /**
   * Clear the saved token from storage
   */
  clearToken(): void {
    try {
      if (fs.existsSync(this.tokenFile)) {
        fs.unlinkSync(this.tokenFile);
      }
    } catch (error) {
      console.error("Failed to clear token:", error);
    }
  }

  /**
   * Check if a valid token is available
   *
   * @returns True if a token exists
   */
  hasToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Save pending device_code for auth flow
   * Called by auth_login, used by auth_complete if device_code not provided
   */
  savePendingDeviceCode(deviceCode: string, expiresIn: number): void {
    try {
      this.ensureConfigDir();
      const data = {
        device_code: deviceCode,
        created_at: Date.now(),
        expires_at: Date.now() + (expiresIn * 1000),
      };
      fs.writeFileSync(this.pendingAuthFile, JSON.stringify(data, null, 2), {
        mode: 0o600,
      });
    } catch (error) {
      console.error("Failed to save pending device code:", error);
    }
  }

  /**
   * Get pending device_code if still valid
   */
  getPendingDeviceCode(): string | null {
    if (!fs.existsSync(this.pendingAuthFile)) {
      return null;
    }
    try {
      const content = fs.readFileSync(this.pendingAuthFile, "utf-8");
      const data = JSON.parse(content);
      // Check if expired
      if (data.expires_at && Date.now() > data.expires_at) {
        this.clearPendingDeviceCode();
        return null;
      }
      return data.device_code || null;
    } catch {
      return null;
    }
  }

  /**
   * Clear pending device_code
   */
  clearPendingDeviceCode(): void {
    try {
      if (fs.existsSync(this.pendingAuthFile)) {
        fs.unlinkSync(this.pendingAuthFile);
      }
    } catch (error) {
      console.error("Failed to clear pending device code:", error);
    }
  }
}
