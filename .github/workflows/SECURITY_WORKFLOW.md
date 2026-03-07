# Security Workflow Documentation

## Overview

This security workflow provides comprehensive automated security scanning for the repository, including dependency vulnerabilities, code security issues, and secret detection.

## Features

### 1. NPM Security Audit
- Scans all npm dependencies for known vulnerabilities
- Checks against the npm security advisory database
- Categorizes vulnerabilities by severity (critical, high, moderate, low)
- **Fails PRs** if critical vulnerabilities are found
- Creates GitHub issues for critical vulnerabilities

### 2. CodeQL Analysis
- Static code analysis for security vulnerabilities
- Detects common security issues like:
  - SQL injection
  - Cross-site scripting (XSS)
  - Path traversal
  - Command injection
  - Insecure cryptography
- Uses extended security queries for comprehensive coverage
- Results available in GitHub Security tab

### 3. Secret Scanning (Gitleaks)
- Scans code for accidentally committed secrets
- Detects:
  - API keys
  - Tokens
  - Passwords
  - Private keys
  - Database credentials
- **Fails PRs** if secrets are detected
- Creates GitHub issues for detected secrets

### 4. Dependency Review (PR only)
- Reviews dependency changes in pull requests
- Checks for:
  - New vulnerabilities introduced
  - License compliance issues
- Fails on critical severity vulnerabilities

## Triggers

The workflow runs on:
- **Schedule**: Daily at 2 AM UTC
- **Pull Requests**: To main, master, or develop branches
- **Push**: To main or master branches
- **Manual**: Via workflow_dispatch

## Configuration

### Required Permissions
```yaml
permissions:
  contents: read
  security-events: write
  issues: write
  pull-requests: write
```

### Gitleaks Configuration
Customize `.gitleaks.toml` to:
- Add allowlist patterns for false positives
- Define custom secret patterns
- Exclude specific paths

### Failure Conditions

The workflow will **fail PRs** if:
- Critical npm vulnerabilities are found
- Secrets are detected in code
- Critical dependencies are introduced (dependency review)

## Issue Creation

Automated issues are created for:
- **Critical NPM vulnerabilities**: Tagged with `security`, `npm-audit`, `critical`
- **Detected secrets**: Tagged with `security`, `secrets`, `critical`

Issues are only created once (checks for existing open issues with same labels).

## Viewing Results

### NPM Audit
- Check workflow logs for detailed vulnerability information
- Download `npm-audit-results` artifact for JSON report
- Run locally: `npm audit`

### CodeQL
- View results in **Security** → **Code scanning alerts**
- Detailed findings with code locations and remediation advice

### Gitleaks
- Download `gitleaks-report` artifact (SARIF format)
- View in workflow logs
- Run locally: `gitleaks detect --source . -v`

## Local Testing

### NPM Audit
```bash
npm audit
npm audit fix  # Auto-fix vulnerabilities
npm audit fix --force  # Fix breaking changes
```

### Gitleaks
```bash
# Install gitleaks
brew install gitleaks  # macOS
# or download from https://github.com/gitleaks/gitleaks/releases

# Run scan
gitleaks detect --source . -v
```

### CodeQL (requires GitHub CLI)
```bash
gh auth login
gh codeql database create --language=javascript
```

## Maintenance

### Regular Tasks
1. Review and close resolved security issues
2. Update allowlist in `.gitleaks.toml` for false positives
3. Keep dependencies updated: `npm update`
4. Review CodeQL findings in Security tab

### Updating the Workflow
- Modify schedule in `on.schedule.cron`
- Adjust failure thresholds in npm-audit step
- Add/remove languages in CodeQL matrix
- Customize issue templates in github-script actions

## Best Practices

1. **Never commit secrets**: Use environment variables or GitHub Secrets
2. **Keep dependencies updated**: Run `npm update` regularly
3. **Review security alerts**: Check GitHub Security tab weekly
4. **Fix critical issues immediately**: Don't let them accumulate
5. **Use .env files**: Add `.env` to `.gitignore`
6. **Rotate exposed credentials**: If secrets are detected, rotate immediately

## Troubleshooting

### False Positives in Gitleaks
Add patterns to `.gitleaks.toml` allowlist:
```toml
[allowlist]
regexes = [
  '''your-false-positive-pattern'''
]
```

### NPM Audit Failures
```bash
# Check specific vulnerability
npm audit --json | jq '.vulnerabilities'

# Fix automatically
npm audit fix

# Update specific package
npm update package-name
```

### CodeQL Timeouts
- Reduce query scope in workflow
- Use `queries: security-only` instead of `security-extended`

## Resources

- [GitHub Security Features](https://docs.github.com/en/code-security)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [NPM Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
