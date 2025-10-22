# 🔒 Security Hardening Guide

## Overview
This guide covers security best practices and hardening measures for the GST Invoice SaaS platform.

---

## 1. Authentication & Authorization

### JWT Security
```javascript
// Use strong secret keys
JWT_SECRET=your-super-secret-key-min-32-characters

// Set appropriate expiration
TOKEN_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d

// Implement token rotation
// Refresh tokens should be rotated on each use
```

### Password Security
```javascript
// Use bcrypt with salt rounds >= 12
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Enforce strong password policy
// - Minimum 12 characters
// - Mix of uppercase, lowercase, numbers, special chars
// - No common patterns
```

### Multi-Factor Authentication (MFA)
```javascript
// Implement TOTP (Time-based One-Time Password)
// Use libraries like speakeasy or otplib
// Store backup codes securely
```

---

## 2. Data Protection

### Encryption
```javascript
// Encrypt sensitive data at rest
// Use AES-256 encryption
const crypto = require('crypto');

function encryptData(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Encrypt in transit with TLS 1.2+
// Use HTTPS everywhere
```

### Database Security
```javascript
// Use parameterized queries (Prisma does this by default)
// Never concatenate user input into queries

// Implement row-level security
// Users can only access their organization's data

// Regular backups
// Encrypt backups
// Test restore procedures
```

---

## 3. API Security

### Input Validation
```javascript
// Validate all inputs
// Use Joi or Zod for schema validation
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(12).required(),
});

// Sanitize inputs
// Remove special characters
// Prevent NoSQL injection
```

### Rate Limiting
```javascript
// Implement rate limiting
// API: 100 requests per 15 minutes
// Auth: 5 attempts per 15 minutes
// File upload: 10 MB per request

// Use exponential backoff for retries
```

### CORS Configuration
```javascript
// Restrict CORS to trusted domains
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

---

## 4. Infrastructure Security

### Network Security
```bash
# Use VPC (Virtual Private Cloud)
# Restrict inbound traffic to necessary ports
# - 80 (HTTP)
# - 443 (HTTPS)
# - 22 (SSH, restricted to admin IPs)

# Use security groups/firewall rules
# Implement DDoS protection
```

### SSL/TLS
```bash
# Use TLS 1.2 or higher
# Obtain certificate from Let's Encrypt
# Auto-renew certificates

# Use strong cipher suites
# Disable weak protocols (SSL 3.0, TLS 1.0, 1.1)
```

### Secrets Management
```bash
# Never commit secrets to git
# Use environment variables
# Use AWS Secrets Manager or similar
# Rotate secrets regularly

# Example .env (never commit)
DATABASE_URL=postgresql://...
JWT_SECRET=...
API_KEY=...
```

---

## 5. Monitoring & Logging

### Security Logging
```javascript
// Log all security events
// - Failed login attempts
// - Unauthorized access attempts
// - Data modifications
// - Admin actions

// Use structured logging
// Include timestamp, user, action, result
```

### Monitoring
```bash
# Monitor for suspicious activity
# - Multiple failed login attempts
# - Unusual data access patterns
# - Large data exports
# - API rate limit violations

# Set up alerts
# - Critical errors
# - Security events
# - Performance degradation
```

---

## 6. Compliance

### GDPR Compliance
```javascript
// Implement data export functionality
// Implement data deletion (right to be forgotten)
// Maintain audit trails
// Get explicit consent for data processing
```

### GST Compliance
```javascript
// Maintain audit trails for all transactions
// Implement digital signatures
// Secure e-invoice generation
// Comply with GST regulations
```

---

## 7. Dependency Management

### Regular Updates
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Use npm audit fix
npm audit fix

# Review security advisories
npm audit --audit-level=moderate
```

### Dependency Scanning
```bash
# Use tools like Snyk
# Scan for known vulnerabilities
# Get alerts for new vulnerabilities
```

---

## 8. Code Security

### Secure Coding Practices
```javascript
// Avoid eval() and similar functions
// Use parameterized queries
// Validate and sanitize all inputs
// Use security headers
// Implement CSRF protection
// Use secure session management
```

### Code Review
```bash
# Implement peer code review
# Use static analysis tools
# - ESLint with security plugins
# - SonarQube
# - Snyk Code
```

---

## 9. Incident Response

### Incident Plan
```
1. Detection: Monitor for security events
2. Response: Isolate affected systems
3. Investigation: Determine scope and impact
4. Remediation: Fix vulnerabilities
5. Recovery: Restore normal operations
6. Post-incident: Review and improve
```

### Breach Notification
```
- Notify affected users within 72 hours
- Provide clear information about the breach
- Offer credit monitoring if applicable
- Comply with local regulations
```

---

## 10. Security Checklist

- [ ] All secrets in environment variables
- [ ] HTTPS enabled everywhere
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure password hashing
- [ ] Audit logging enabled
- [ ] Regular backups tested
- [ ] Dependency vulnerabilities scanned
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Error messages don't leak info
- [ ] Sensitive data encrypted
- [ ] Access control implemented
- [ ] Regular security audits
- [ ] Incident response plan

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [GST Security Requirements](https://www.gst.gov.in/)

---

**Last Updated**: 2025-10-22

