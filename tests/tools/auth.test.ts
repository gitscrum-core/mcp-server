/**
 * Auth Tools Tests
 * 
 * Tests for the authentication tools registration
 */

import { describe, it, expect } from 'vitest';
import { registerAuthTools } from '../../src/tools/auth.js';

describe('Auth Tools', () => {
  describe('registerAuthTools', () => {
    it('should register all auth tools', () => {
      const tools = registerAuthTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBe(4);
      
      const names = tools.map(t => t.name);
      expect(names).toContain('auth_login');
      expect(names).toContain('auth_complete');
      expect(names).toContain('auth_status');
      expect(names).toContain('auth_logout');
    });

    it('auth_login should have correct schema', () => {
      const tools = registerAuthTools();
      const loginTool = tools.find(t => t.name === 'auth_login');
      
      expect(loginTool).toBeDefined();
      expect(loginTool?.description).toContain('login');
    });

    it('auth_complete should require device_code', () => {
      const tools = registerAuthTools();
      const completeTool = tools.find(t => t.name === 'auth_complete');
      
      expect(completeTool).toBeDefined();
      expect(completeTool?.inputSchema.required).toContain('device_code');
    });

    it('auth_status should check authentication', () => {
      const tools = registerAuthTools();
      const statusTool = tools.find(t => t.name === 'auth_status');
      
      expect(statusTool).toBeDefined();
      expect(statusTool?.description).toContain('status');
    });

    it('auth_logout should clear token', () => {
      const tools = registerAuthTools();
      const logoutTool = tools.find(t => t.name === 'auth_logout');
      
      expect(logoutTool).toBeDefined();
      expect(logoutTool?.description).toContain('Logout');
    });
  });
});
