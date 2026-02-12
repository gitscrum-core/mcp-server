/**
 * Capabilities Resource Tests
 *
 * Verifies the gitscrum://mcp/manifest generation:
 * - Iterates all registered tools
 * - Extracts action/report enums as operations
 * - Includes annotations per tool
 * - Produces a stable, diffable JSON manifest
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  getAllTools,
  clearRegistry,
} from "../../src/tools/shared/toolRegistry.js";
import { initializeToolModules } from "../../src/tools/shared/initModules.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

// ============================================================================
// Helper: replicate the manifest generation logic from index.ts
// ============================================================================

interface CapabilityEntry {
  description: string;
  dispatch_key?: string;
  operations?: string[];
  annotations: Record<string, unknown>;
}

function buildCapabilitiesManifest(tools: Tool[]): Record<string, CapabilityEntry> {
  const toolMap: Record<string, CapabilityEntry> = {};

  for (const tool of tools) {
    const schema = tool.inputSchema as {
      properties?: Record<string, { type?: string; enum?: string[] }>;
    };
    const props = schema?.properties || {};

    const actionEnum = props.action?.enum || props.report?.enum || null;
    const dispatchKey = props.action?.enum
      ? "action"
      : props.report?.enum
        ? "report"
        : null;

    toolMap[tool.name] = {
      description: (tool.description || "").split("\n")[0],
      ...(dispatchKey && { dispatch_key: dispatchKey }),
      ...(actionEnum && { operations: actionEnum }),
      annotations: (tool.annotations || {}) as Record<string, unknown>,
    };
  }

  return toolMap;
}

// ============================================================================
// Tests
// ============================================================================

describe("Capabilities Resource", () => {
  let manifest: Record<string, CapabilityEntry>;

  beforeAll(() => {
    clearRegistry();
    initializeToolModules();
    manifest = buildCapabilitiesManifest(getAllTools());
  });

  it("should include all registered tools", () => {
    const tools = getAllTools();
    const manifestKeys = Object.keys(manifest);
    expect(manifestKeys.length).toBe(tools.length);
    for (const tool of tools) {
      expect(manifest[tool.name]).toBeDefined();
    }
  });

  it("should extract action enums for action-based tools", () => {
    // task uses action dispatch
    const task = manifest["task"];
    expect(task).toBeDefined();
    expect(task.dispatch_key).toBe("action");
    expect(task.operations).toContain("my");
    expect(task.operations).toContain("create");
    expect(task.operations).toContain("update");
  });

  it("should extract report enums for report-based tools", () => {
    // clientflow_dashboard uses report dispatch
    const dashboard = manifest["clientflow_dashboard"];
    expect(dashboard).toBeDefined();
    expect(dashboard.dispatch_key).toBe("report");
    expect(dashboard.operations).toContain("overview");
    expect(dashboard.operations).toContain("revenue");
  });

  it("should handle tools without action/report enums", () => {
    // auth_login has no action or report enum
    const authLogin = manifest["auth_login"];
    expect(authLogin).toBeDefined();
    expect(authLogin.dispatch_key).toBeUndefined();
    expect(authLogin.operations).toBeUndefined();
  });

  it("should include annotations for every tool", () => {
    for (const [, entry] of Object.entries(manifest)) {
      expect(entry.annotations).toBeDefined();
      expect(typeof entry.annotations).toBe("object");
    }
  });

  it("should include correct annotations for invoice tool", () => {
    const invoice = manifest["invoice"];
    expect(invoice).toBeDefined();
    expect(invoice.annotations).toHaveProperty("readOnlyHint", false);
    expect(invoice.annotations).toHaveProperty("destructiveHint", false);
  });

  it("should mark read-only tools correctly", () => {
    const budget = manifest["budget"];
    expect(budget).toBeDefined();
    expect(budget.annotations).toHaveProperty("readOnlyHint", true);
  });

  it("should include all invoice operations", () => {
    const invoice = manifest["invoice"];
    expect(invoice.operations).toEqual(
      expect.arrayContaining([
        "list",
        "get",
        "stats",
        "create",
        "update",
        "issue",
        "send",
        "mark_paid",
      ])
    );
  });

  it("should include first line of description for each tool", () => {
    for (const [name, entry] of Object.entries(manifest)) {
      expect(entry.description).toBeDefined();
      expect(entry.description.length).toBeGreaterThan(0);
      // Description should be single line (first line only)
      expect(entry.description).not.toContain("\n");
    }
  });

  it("should distinguish action vs report dispatch keys correctly", () => {
    // Tools using 'action'
    const actionTools = ["task", "sprint", "invoice", "client", "proposal", "budget"];
    for (const name of actionTools) {
      if (manifest[name]) {
        expect(manifest[name].dispatch_key).toBe("action");
      }
    }

    // Tools using 'report'
    const reportTools = ["analytics", "clientflow_dashboard", "clientflow_cross_workspace"];
    for (const name of reportTools) {
      if (manifest[name]) {
        expect(manifest[name].dispatch_key).toBe("report");
      }
    }
  });
});
