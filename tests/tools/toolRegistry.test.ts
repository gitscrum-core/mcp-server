/**
 * Tool Registry Tests
 * 
 * Tests for the centralized tool registry system.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { 
  registerModule, 
  getAllTools, 
  routeToolCall,
  isToolRegistered,
  getHandler,
  clearRegistry
} from '../../src/tools/shared/toolRegistry.js';
import type { ToolModule } from '../../src/tools/shared/toolRegistry.js';

// Mock handler for testing
const mockHandler = async () => ({
  content: [{ type: 'text' as const, text: 'Mock response' }],
});

// Mock tool definition
const mockTool = {
  name: 'mock_tool',
  description: 'A mock tool for testing',
  inputSchema: {
    type: 'object' as const,
    properties: {
      action: { type: 'string', enum: ['test'] },
    },
    required: ['action'],
  },
};

describe('Tool Registry', () => {
  beforeAll(() => {
    // Clear registry before tests to ensure clean state
    clearRegistry();
  });

  describe('registerModule', () => {
    it('should register a module with tools and handler', () => {
      const module: ToolModule = {
        tools: [mockTool],
        handler: mockHandler,
        handles: ['mock_tool'],
      };

      registerModule(module);

      expect(isToolRegistered('mock_tool')).toBe(true);
    });

    it('should register multiple modules', () => {
      clearRegistry();
      
      const module1: ToolModule = {
        tools: [{ ...mockTool, name: 'tool_a' }],
        handler: mockHandler,
        handles: ['tool_a'],
      };

      const module2: ToolModule = {
        tools: [{ ...mockTool, name: 'tool_b' }],
        handler: mockHandler,
        handles: ['tool_b'],
      };

      registerModule(module1);
      registerModule(module2);

      expect(isToolRegistered('tool_a')).toBe(true);
      expect(isToolRegistered('tool_b')).toBe(true);
    });
  });

  describe('getAllTools', () => {
    it('should return all registered tools', () => {
      clearRegistry();
      
      const module: ToolModule = {
        tools: [
          { ...mockTool, name: 'tool_1' },
          { ...mockTool, name: 'tool_2' },
        ],
        handler: mockHandler,
        handles: ['tool_1', 'tool_2'],
      };

      registerModule(module);

      const tools = getAllTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(2);
      expect(tools.map(t => t.name)).toContain('tool_1');
      expect(tools.map(t => t.name)).toContain('tool_2');
    });

    it('should return empty array when no tools registered', () => {
      clearRegistry();
      const tools = getAllTools();
      expect(tools).toEqual([]);
    });
  });

  describe('isToolRegistered', () => {
    it('should return true for registered tools', () => {
      clearRegistry();
      
      const module: ToolModule = {
        tools: [mockTool],
        handler: mockHandler,
        handles: ['mock_tool'],
      };

      registerModule(module);
      expect(isToolRegistered('mock_tool')).toBe(true);
    });

    it('should return false for unregistered tools', () => {
      expect(isToolRegistered('nonexistent_tool')).toBe(false);
    });
  });

  describe('getHandler', () => {
    it('should return handler for registered tool', () => {
      clearRegistry();
      
      const module: ToolModule = {
        tools: [mockTool],
        handler: mockHandler,
        handles: ['mock_tool'],
      };

      registerModule(module);
      
      const handler = getHandler('mock_tool');
      expect(handler).toBe(mockHandler);
    });

    it('should return undefined for unregistered tool', () => {
      const handler = getHandler('nonexistent_tool');
      expect(handler).toBeUndefined();
    });
  });

  describe('routeToolCall', () => {
    it('should route to correct handler', async () => {
      clearRegistry();
      
      const customHandler = async () => ({
        content: [{ type: 'text' as const, text: 'Custom response' }],
      });

      const module: ToolModule = {
        tools: [mockTool],
        handler: customHandler,
        handles: ['mock_tool'],
      };

      registerModule(module);

      const result = await routeToolCall({} as any, 'mock_tool', { action: 'test' });
      expect(result.content[0].text).toBe('Custom response');
    });

    it('should return error for unknown tool', async () => {
      clearRegistry();
      
      const result = await routeToolCall({} as any, 'unknown_tool', {});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown tool');
    });
  });

  describe('module handles multiple tools', () => {
    it('should route different tool names to same handler', async () => {
      clearRegistry();
      
      let lastCalledWith = '';
      const multiHandler = async (_client: any, name: string) => {
        lastCalledWith = name;
        return { content: [{ type: 'text' as const, text: `Handled: ${name}` }] };
      };

      const module: ToolModule = {
        tools: [
          { ...mockTool, name: 'client' },
          { ...mockTool, name: 'invoice' },
        ],
        handler: multiHandler,
        handles: ['client', 'invoice', 'proposal'],
      };

      registerModule(module);

      await routeToolCall({} as any, 'client', {});
      expect(lastCalledWith).toBe('client');

      await routeToolCall({} as any, 'invoice', {});
      expect(lastCalledWith).toBe('invoice');

      await routeToolCall({} as any, 'proposal', {});
      expect(lastCalledWith).toBe('proposal');
    });
  });
});
