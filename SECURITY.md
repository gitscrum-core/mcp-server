# Security Policy

We take security seriously at GitScrum. This document outlines our security practices and how to report vulnerabilities.

---

## 🛡️ Supported Versions

| Version | Supported          |
|---------|-------------------|
| 1.x.x   | ✅ Yes            |
| < 1.0   | ❌ No             |

---

## 🚨 Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

### How to Report

1. **Email**: [security@gitscrum.com](mailto:security@gitscrum.com)
2. **Subject**: `[SECURITY] MCP Server - Brief Description`
3. **Include**:
   - Type of vulnerability
   - Full path to the vulnerable file(s)
   - Step-by-step reproduction instructions
   - Proof-of-concept or exploit code (if available)
   - Potential impact assessment

### What to Expect

| Timeline | Action |
|----------|--------|
| **48 hours** | Acknowledgment of your report |
| **7 days** | Initial assessment and severity classification |
| **30 days** | Fix development and testing |
| **45 days** | Public disclosure (coordinated) |

We will:
- Keep you informed throughout the process
- Credit you in the security advisory (if desired)
- Not take legal action against good-faith researchers

---

## 🔐 Security Features

### Authentication & Token Management

- **Secure Storage**: Tokens are stored locally in `~/.gitscrum/` with restricted permissions (`0600`)
- **No Credential Persistence**: Passwords are never stored; only authentication tokens
- **Token Isolation**: Each user's token is stored separately

### Rate Limiting

Login attempts are rate-limited to prevent brute force attacks:

| Protection | Value |
|------------|-------|
| Maximum attempts | 5 per email address |
| Window duration | 15 minutes |
| Lockout period | 30 minutes |

### API Communication

- All API calls use HTTPS encryption
- Bearer token authentication on every request
- Request source identification via `X-Client-Source` header

### Error Handling

The server provides informative error messages without exposing sensitive information:

| Status | Handling |
|--------|----------|
| `401` | Generic "Authentication failed" message |
| `403` | Permission context without internal details |
| `5xx` | Generic server error without stack traces |

---

## 🛠️ Security Best Practices

### For Users

1. **Protect Your Tokens**
   - Never share your authentication token
   - Don't commit tokens to version control
   - Re-authenticate if you suspect compromise

2. **Environment Variables**
   - Use `GITSCRUM_TOKEN` only in trusted environments
   - Never expose tokens in logs or output
   - Regularly rotate tokens if using environment variables

3. **Network Security**
   - Use the server only on trusted networks
   - Be cautious with custom `GITSCRUM_API_URL` settings

### For Developers

1. **Code Review**
   - All changes require security-focused review
   - Watch for injection vulnerabilities
   - Validate all user inputs

2. **Dependencies**
   - Keep dependencies updated
   - Run `npm audit` regularly
   - Use only well-maintained packages

3. **Testing**
   - Include security test cases
   - Test error handling paths
   - Verify rate limiting works correctly

---

## 📋 Security Checklist

Before contributing code, ensure:

- [ ] No sensitive data in logs or error messages
- [ ] Input validation on all user-provided data
- [ ] Proper error handling without information leakage
- [ ] No hardcoded credentials or secrets
- [ ] Dependencies are up to date and audited

---

## 🔄 Disclosure Policy

We follow responsible disclosure:

1. **Private Reporting**: Issues are reported privately first
2. **Assessment**: Our team evaluates severity and impact
3. **Fix Development**: A patch is developed and tested
4. **Coordinated Disclosure**: Public disclosure after fix is available
5. **CVE Assignment**: Critical vulnerabilities receive CVE identifiers

---

## 📞 Contact

For security concerns:
- **Email**: security@gitscrum.com
- **PGP Key**: Available upon request

For general questions:
- **GitHub Issues**: For non-security bugs
- **Website**: [gitscrum.com](https://gitscrum.com)

---

<p align="center">
  <strong>Thank you for helping keep GitScrum Studio MCP Server secure! 🙏</strong>
</p>
