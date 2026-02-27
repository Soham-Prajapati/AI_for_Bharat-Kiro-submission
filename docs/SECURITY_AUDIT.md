# Security Audit & Recommendations

## Executive Summary

This document provides a security assessment of the Content Intelligence Platform backend and recommendations for hardening before the demo on March 4, 2026.

**Current Security Posture:** 🟡 MODERATE  
**Critical Issues:** 0  
**High Priority:** 3  
**Medium Priority:** 5  
**Low Priority:** 4

---

## OWASP Top 10 Checklist

### 1. Injection ✅ GOOD

**Status:** Protected  
**Current Implementation:**
- Using parameterized queries (no raw SQL)
- AWS SDK handles input sanitization
- No direct shell command execution

**Recommendations:**
- ✅ Continue using AWS SDK methods (no raw queries)
- ✅ Validate all user inputs before processing
- ⚠️ Add input sanitization for file names

```typescript
// Recommended: Sanitize file names
import sanitize from 'sanitize-filename';

const safeFilename = sanitize(req.file.originalname);
const key = `${userId}/${Date.now()}-${safeFilename}`;
```

### 2. Broken Authentication 🟡 NEEDS IMPROVEMENT

**Status:** Basic implementation  
**Current Issues:**
- No JWT expiration validation
- No refresh token mechanism
- No session management
- No password complexity requirements

**Recommendations:**

```typescript
// src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../types/errors';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new AuthenticationError('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired');
    }
    throw new AuthenticationError('Invalid token');
  }
};

// Token generation with expiration
export const generateToken = (userId: string) => {
  return jwt.sign(
    { userId, iat: Date.now() },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
};

// Refresh token mechanism
export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
};
```

**Action Items:**
- [ ] Add JWT expiration (24h for access, 7d for refresh)
- [ ] Implement refresh token endpoint
- [ ] Add password hashing with bcrypt (cost factor 12)
- [ ] Implement account lockout after 5 failed attempts
- [ ] Add 2FA support (optional, if time permits)

### 3. Sensitive Data Exposure 🔴 HIGH PRIORITY

**Status:** Vulnerable  
**Current Issues:**
- Environment variables not validated
- No encryption for data at rest (DynamoDB)
- Logs may contain sensitive data
- Error messages expose internal details

**Recommendations:**

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET: z.string(),
  ALLOWED_ORIGINS: z.string(),
});

export const env = envSchema.parse(process.env);

// Validate on startup
if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}
```

**Data Encryption:**
```typescript
// Enable DynamoDB encryption at rest
const table = new dynamodb.Table(this, 'ContentCache', {
  encryption: dynamodb.TableEncryption.AWS_MANAGED,
  pointInTimeRecovery: true,
});

// Enable S3 encryption
await s3.putObject({
  Bucket: bucket,
  Key: key,
  Body: buffer,
  ServerSideEncryption: 'AES256', // or 'aws:kms' for KMS
});
```

**Sanitize Logs:**
```typescript
// src/utils/logger.ts
const sanitize = (data: any) => {
  const sensitive = ['password', 'token', 'secret', 'apiKey', 'authorization'];
  const sanitized = { ...data };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
};

logger.info('Request received', sanitize(req.body));
```

**Action Items:**
- [ ] Enable DynamoDB encryption at rest
- [ ] Enable S3 server-side encryption
- [ ] Sanitize logs (remove passwords, tokens)
- [ ] Use AWS Secrets Manager for sensitive config
- [ ] Add HTTPS enforcement (redirect HTTP → HTTPS)

### 4. XML External Entities (XXE) ✅ NOT APPLICABLE

**Status:** N/A  
**Reason:** No XML processing in the application

### 5. Broken Access Control 🟡 NEEDS IMPROVEMENT

**Status:** Minimal implementation  
**Current Issues:**
- No role-based access control (RBAC)
- No resource ownership validation
- Users can access any file by ID

**Recommendations:**

```typescript
// src/middleware/authorization.middleware.ts
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError('Insufficient permissions');
    }

    next();
  };
};

// Resource ownership validation
export const checkOwnership = async (req: Request, res: Response, next: NextFunction) => {
  const { fileId } = req.params;
  const userId = req.user.userId;

  const file = await getFileMetadata(fileId);
  
  if (file.userId !== userId && req.user.role !== 'admin') {
    throw new AuthorizationError('You do not own this resource');
  }

  next();
};

// Usage:
router.get('/api/files/:fileId', 
  authenticate, 
  checkOwnership, 
  asyncHandler(async (req, res) => {
    // Route logic
  })
);
```

**Action Items:**
- [ ] Implement RBAC (roles: user, creator, admin)
- [ ] Add resource ownership validation
- [ ] Validate user can only access their own data
- [ ] Add admin-only routes protection
- [ ] Implement API key-based access for integrations

### 6. Security Misconfiguration 🟡 NEEDS IMPROVEMENT

**Status:** Basic security headers  
**Current Issues:**
- Default helmet configuration
- CORS allows all origins in development
- No CSP (Content Security Policy)
- No rate limiting per user

**Recommendations:**

```typescript
// Enhanced helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));

// Strict CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));

// Per-user rate limiting
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const userLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:user:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per user
  keyGenerator: (req) => req.user?.userId || req.ip,
  handler: (req, res) => {
    throw new RateLimitError('Too many requests', 900); // retry after 15 min
  },
});
```

**Action Items:**
- [ ] Configure CSP headers
- [ ] Strict CORS (whitelist specific origins)
- [ ] Per-user rate limiting
- [ ] Disable unnecessary HTTP methods
- [ ] Remove server version headers

### 7. Cross-Site Scripting (XSS) ✅ GOOD

**Status:** Protected  
**Current Implementation:**
- Express automatically escapes JSON responses
- No HTML rendering on backend
- Frontend should handle XSS prevention

**Recommendations:**
- ✅ Continue using JSON responses (no HTML)
- ⚠️ Sanitize user-generated content before storage
- ⚠️ Validate content-type headers

```typescript
// Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
};

// Usage:
const safeTitle = sanitizeInput(req.body.title);
```

### 8. Insecure Deserialization ✅ GOOD

**Status:** Protected  
**Current Implementation:**
- Using JSON.parse (safe)
- No custom deserialization
- No pickle/marshal usage

**Recommendations:**
- ✅ Continue using JSON for data exchange
- ✅ Validate data structure after parsing

### 9. Using Components with Known Vulnerabilities 🟡 NEEDS MONITORING

**Status:** Needs regular audits  
**Current Issues:**
- No automated dependency scanning
- No security update policy

**Recommendations:**

```bash
# Run npm audit regularly
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated

# Use Snyk for continuous monitoring (free tier)
npx snyk test
npx snyk monitor
```

**GitHub Actions for automated scanning:**
```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm audit --audit-level=high
      - run: npx snyk test --severity-threshold=high
```

**Action Items:**
- [ ] Run `npm audit` and fix all high/critical issues
- [ ] Set up GitHub Dependabot
- [ ] Add security scanning to CI/CD
- [ ] Create security update policy
- [ ] Monitor CVE databases for used packages

### 10. Insufficient Logging & Monitoring 🔴 HIGH PRIORITY

**Status:** Basic logging only  
**Current Issues:**
- Console.log only (not persistent)
- No structured logging
- No security event tracking
- No alerting on suspicious activity

**Recommendations:**

```typescript
// src/utils/securityLogger.ts
import winston from 'winston';

export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'security.log',
      level: 'warn',
    }),
  ],
});

// Log security events
export const logSecurityEvent = (event: {
  type: 'AUTH_FAILURE' | 'ACCESS_DENIED' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY';
  userId?: string;
  ip: string;
  details: any;
}) => {
  securityLogger.warn('Security event', {
    ...event,
    timestamp: new Date().toISOString(),
  });

  // Alert on critical events
  if (event.type === 'SUSPICIOUS_ACTIVITY') {
    // Send alert (email, Slack, PagerDuty)
    sendAlert(event);
  }
};

// Usage in middleware:
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Auth logic
  } catch (error) {
    logSecurityEvent({
      type: 'AUTH_FAILURE',
      ip: req.ip,
      details: { path: req.path, error: error.message },
    });
    throw error;
  }
};
```

**Events to Log:**
- Authentication failures
- Authorization failures
- Rate limit exceeded
- File upload attempts
- API errors (500s)
- Unusual access patterns
- Admin actions

**Action Items:**
- [ ] Implement structured logging (Winston)
- [ ] Log all security events
- [ ] Set up CloudWatch Logs
- [ ] Create CloudWatch dashboards
- [ ] Set up alerts for suspicious activity
- [ ] Implement log retention policy (30 days)

---

## Additional Security Measures

### File Upload Security

```typescript
// src/middleware/fileValidation.middleware.ts
import fileType from 'file-type';
import { ValidationError } from '../types/errors';

const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'audio/mpeg',
  'audio/wav',
  'text/plain',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const validateFile = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    throw new ValidationError('No file provided');
  }

  // Check file size
  if (req.file.size > MAX_FILE_SIZE) {
    throw new ValidationError('File too large (max 100MB)');
  }

  // Verify MIME type (don't trust client)
  const type = await fileType.fromBuffer(req.file.buffer);
  
  if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
    throw new ValidationError('Invalid file type');
  }

  // Check for malicious content (basic)
  const content = req.file.buffer.toString('utf-8', 0, 1000);
  if (content.includes('<script>') || content.includes('<?php')) {
    throw new ValidationError('Suspicious file content detected');
  }

  next();
};
```

### API Key Management

```typescript
// src/middleware/apiKey.middleware.ts
import crypto from 'crypto';

export const generateApiKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    throw new AuthenticationError('API key required');
  }

  // Hash and compare (don't store plain text keys)
  const hashedKey = crypto
    .createHash('sha256')
    .update(apiKey as string)
    .digest('hex');

  const isValid = await checkApiKey(hashedKey);

  if (!isValid) {
    throw new AuthenticationError('Invalid API key');
  }

  next();
};
```

### Request Signing (for sensitive operations)

```typescript
// src/middleware/signature.middleware.ts
import crypto from 'crypto';

export const verifySignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];

  if (!signature || !timestamp) {
    throw new AuthenticationError('Missing signature or timestamp');
  }

  // Prevent replay attacks (5 minute window)
  const now = Date.now();
  const requestTime = parseInt(timestamp as string);
  if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
    throw new AuthenticationError('Request expired');
  }

  // Verify signature
  const payload = JSON.stringify(req.body) + timestamp;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.API_SECRET!)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new AuthenticationError('Invalid signature');
  }

  next();
};
```

---

## Security Testing Checklist

### Manual Testing

- [ ] Test authentication bypass attempts
- [ ] Test authorization bypass (access other users' data)
- [ ] Test SQL injection in all inputs
- [ ] Test XSS in all text inputs
- [ ] Test file upload with malicious files
- [ ] Test rate limiting (exceed limits)
- [ ] Test CORS with unauthorized origins
- [ ] Test expired/invalid JWT tokens
- [ ] Test large payload attacks (DoS)
- [ ] Test path traversal in file operations

### Automated Testing

```typescript
// src/__tests__/security/auth.test.ts
describe('Authentication Security', () => {
  it('should reject requests without token', async () => {
    const response = await request(app)
      .get('/api/protected')
      .expect(401);

    expect(response.body.error.name).toBe('AuthenticationError');
  });

  it('should reject expired tokens', async () => {
    const expiredToken = generateExpiredToken();
    
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should reject invalid tokens', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});

// src/__tests__/security/authorization.test.ts
describe('Authorization Security', () => {
  it('should prevent access to other users files', async () => {
    const user1Token = generateToken('user1');
    const user2FileId = 'user2/file.mp4';

    const response = await request(app)
      .get(`/api/files/${user2FileId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(403);
  });
});
```

---

## Incident Response Plan

### 1. Detection
- Monitor CloudWatch alarms
- Review security logs daily
- Set up automated alerts

### 2. Response
1. **Identify** the security incident
2. **Contain** the threat (disable compromised accounts, block IPs)
3. **Eradicate** the vulnerability
4. **Recover** services
5. **Document** the incident

### 3. Post-Incident
- Conduct root cause analysis
- Update security measures
- Notify affected users (if required)
- Update incident response plan

---

## Compliance Considerations

### GDPR (if handling EU users)
- [ ] Implement data deletion endpoint
- [ ] Add privacy policy
- [ ] Implement consent management
- [ ] Add data export functionality
- [ ] Encrypt personal data

### Data Retention
- [ ] Define retention policy (e.g., 90 days)
- [ ] Implement automatic data deletion
- [ ] Backup before deletion

---

## Security Budget Allocation

**Total Budget:** $80  
**Recommended Security Spending:** $10-15

| Item | Cost | Priority |
|------|------|----------|
| AWS Secrets Manager | $0.40/secret/month | High |
| CloudWatch Logs | ~$5/month | High |
| SSL Certificate | Free (Let's Encrypt) | High |
| Snyk (free tier) | $0 | Medium |
| OWASP ZAP | Free | Medium |

---

## Quick Wins (Implement Today)

1. **Add JWT expiration** (15 minutes)
2. **Enable S3 encryption** (5 minutes)
3. **Sanitize file names** (10 minutes)
4. **Add input validation** (30 minutes)
5. **Configure strict CORS** (10 minutes)
6. **Run npm audit** (5 minutes)
7. **Add security logging** (20 minutes)

**Total Time:** ~2 hours  
**Impact:** 🔴 HIGH

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)

---

**Last Updated:** 2026-02-27  
**Owner:** Shubh (Backend + AWS Lead)  
**Next Review:** Before demo (March 4, 2026)  
**Status:** 🟡 MODERATE - Needs improvements before production
