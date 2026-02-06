# Security

This document describes the security model of the GitScrum Studio MCP Server.

## Overview

The GitScrum Studio MCP Server is designed with security as a core principle. It provides a safe way for AI assistants to interact with your GitScrum workspace while protecting against unauthorized access and accidental data loss.

## Security Architecture

The MCP Server implements a multi-layer security model:

1. **MCP Layer**: Rate limiting, secure token storage, restricted operations
2. **API Layer**: Request validation, access control, audit logging
3. **Authentication**: Role-based access control for all operations

## Authentication Security

### Rate Limiting

To prevent brute force attacks, authentication requests are rate-limited with automatic lockout after multiple failed attempts.

### Token Storage

Authentication tokens are stored locally with restricted file permissions, accessible only to the current user.

### Credential Handling

- Credentials are only transmitted during the login request
- After authentication, only the token is used for API requests
- Tokens are never logged or exposed in error messages
- Logout clears all stored credentials locally

## Operation Restrictions

### Read-Only Destructive Operations

The MCP Server follows the **Principle of Least Privilege**:

| Operation | MCP Server | Web Application |
|:----------|:-----------|:----------------|
| CREATE | ✅ Allowed | ✅ Allowed |
| READ | ✅ Allowed | ✅ Allowed |
| UPDATE | ✅ Allowed | ✅ Allowed |
| DELETE | ❌ Blocked | ✅ Allowed |

### Defense in Depth

DELETE operations are blocked at multiple layers:

1. **MCP Layer**: DELETE tools are not available in the MCP Server
2. **API Layer**: The API validates request origins and blocks DELETE operations from MCP clients
3. **Authentication**: Standard role-based access control applies to all operations

## Error Handling

### Secure Error Messages

Error messages are designed to be helpful without exposing sensitive information:

| Status | Information Disclosed | Information Protected |
|:-------|:---------------------|:---------------------|
| 401 | Authentication required | Token details |
| 403 | Permission/plan needed | Internal authorization logic |
| 404 | Resource not found | Whether resource ever existed |
| 422 | Field validation errors | Internal field mappings |
| 500 | Generic server error | Stack traces, internal state |

### No Credential Logging

The MCP Server never logs:
- Passwords
- Authentication tokens
- API keys
- Personal data

## Environment Variables

| Variable | Security Consideration |
|:---------|:-----------------------|
| `GITSCRUM_TOKEN` | If set, takes precedence over stored token. Ensure environment is secure. |
| `GITSCRUM_API_URL` | Only change this for development. Production should use default. |

## HTTPS Only

All API communication uses HTTPS:
- TLS 1.2 minimum
- Certificate validation enforced
- No fallback to HTTP

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it privately:

**Email**: security@gitscrum.com  
**Subject**: `[SECURITY] MCP Server Vulnerability`

Please include:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Your contact information

We will respond within 48 hours and work with you to address the issue.

## Security Checklist

For users of the MCP Server:

- [ ] Use a unique, strong password for GitScrum
- [ ] Do not share your authentication token
- [ ] Keep the MCP Server updated to the latest version
- [ ] Review AI assistant actions before confirming destructive operations
- [ ] Use the web application for DELETE operations
- [ ] Report any suspicious behavior

## Audit Log

All API requests are logged on the server side, including:
- Timestamp
- User ID
- Action performed
- IP address (for security investigations)

This log is available to workspace owners through the GitScrum dashboard.
