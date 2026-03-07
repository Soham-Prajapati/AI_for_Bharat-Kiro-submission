# GitHub Workflows Documentation

This repository uses GitHub Actions for automated CI/CD and security scanning. This guide covers setup, configuration, and troubleshooting.

## Table of Contents

- [Workflows Overview](#workflows-overview)
- [Required GitHub Secrets](#required-github-secrets)
- [Branch Protection Rules](#branch-protection-rules)
- [Manual Deployments](#manual-deployments)
- [Troubleshooting](#troubleshooting)
- [Monitoring and Alerts](#monitoring-and-alerts)

---

## Workflows Overview

### 1. CI Workflow (`ci.yml`)

**Triggers:** Push and pull requests to `main` and `develop` branches

**Purpose:** Ensures code quality through linting and testing

**Jobs:**
- **Lint**: Runs ESLint to check code style and catch potential errors
- **Test & Coverage**: Executes test suite with coverage reporting
  - Enforces 80% minimum coverage threshold
  - Uploads coverage reports as artifacts (retained for 30 days)
  - Fails if coverage drops below threshold

**Artifacts:**
- `coverage-report`: Full HTML coverage report
- `coverage-summary`: JSON summary for programmatic access

### 2. CD Workflow (`deploy.yml`)

**Triggers:** 
- Push to `main` branch (automatic)
- Manual trigger via `workflow_dispatch`

**Purpose:** Builds Docker images and deploys to production

**Jobs:**

1. **Wait for CI**: Ensures CI passes before deployment
2. **Build and Push**: 
   - Builds Docker image with multi-platform support
   - Pushes to Docker Hub and AWS ECR
   - Tags: `latest`, `{branch}-{sha}`, `{timestamp}`
   - Uses layer caching for faster builds
3. **Deploy to AWS EC2**:
   - SSH deployment to EC2 instance
   - Zero-downtime deployment with automatic rollback
   - Health checks with 30 retry attempts
   - Keeps last 3 backup containers for quick rollback
4. **Notify**: Sends deployment status via Slack, email, and GitHub

**Rollback Strategy:**
- Automatic rollback on health check failure
- Restores previous container from backup
- Verifies rollback with additional health check

### 3. Security Workflow (`security.yml`)

**Triggers:**
- Daily at 2 AM UTC (scheduled)
- Pull requests to `main`, `master`, `develop`
- Push to `main`, `master`
- Manual trigger via `workflow_dispatch`

**Purpose:** Identifies security vulnerabilities and secrets

**Jobs:**

1. **NPM Audit**: 
   - Scans dependencies for known vulnerabilities
   - Fails on critical vulnerabilities
   - Warns on high-severity issues
   - Auto-creates GitHub issues for critical findings

2. **CodeQL Analysis**:
   - Static code analysis for security issues
   - Uses extended security queries
   - Results viewable in Security tab

3. **Secret Scanning (Gitleaks)**:
   - Scans entire git history for leaked secrets
   - Detects API keys, passwords, tokens
   - Creates issues when secrets found

4. **Dependency Review** (PR only):
   - Reviews new dependencies in pull requests
   - Blocks GPL-3.0 and AGPL-3.0 licenses
   - Fails on critical vulnerabilities

---

## Required GitHub Secrets

Configure these secrets in **Settings → Secrets and variables → Actions**

### Docker Registry (Required for Deployment)

| Secret | Description | Example |
|--------|-------------|---------|
| `DOCKER_USERNAME` | Docker Hub username | `mycompany` |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_xxxxx` |

**Setup:**
1. Go to [Docker Hub](https://hub.docker.com)
2. Account Settings → Security → New Access Token
3. Copy token and add to GitHub secrets

### AWS Credentials (Required for Deployment)

| Secret | Description | Example |
|--------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_ACCOUNT_ID` | AWS account ID | `123456789012` |

**Setup:**
1. Create IAM user with ECR permissions: `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:PutImage`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`
2. Generate access key in IAM console
3. Add credentials to GitHub secrets

### EC2 Deployment (Required for Deployment)

| Secret | Description | Example |
|--------|-------------|---------|
| `EC2_HOST` | EC2 instance public IP or hostname | `ec2-12-34-56-78.compute-1.amazonaws.com` |
| `EC2_USER` | SSH username | `ubuntu` or `ec2-user` |
| `EC2_SSH_KEY` | Private SSH key for EC2 access | `-----BEGIN RSA PRIVATE KEY-----\n...` |
| `APP_URL` | Production application URL | `https://app.example.com` |

**Setup:**
1. Generate SSH key pair: `ssh-keygen -t rsa -b 4096 -f deploy_key`
2. Add public key to EC2 instance: `~/.ssh/authorized_keys`
3. Copy private key content to `EC2_SSH_KEY` secret (include header/footer)
4. Ensure EC2 security group allows SSH (port 22) from GitHub Actions IPs

### Notifications (Optional)

| Secret | Description | Example |
|--------|-------------|---------|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL | `https://hooks.slack.com/services/T00/B00/xxx` |
| `NOTIFICATION_EMAIL` | Email for deployment notifications | `team@example.com` |
| `SMTP_SERVER` | SMTP server address | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USERNAME` | SMTP username | `notifications@example.com` |
| `SMTP_PASSWORD` | SMTP password or app password | `app-specific-password` |

**Slack Setup:**
1. Go to your Slack workspace
2. Create new app or use existing
3. Enable Incoming Webhooks
4. Create webhook for desired channel
5. Copy webhook URL to GitHub secret

**Email Setup (Gmail example):**
1. Enable 2FA on Google account
2. Generate app-specific password
3. Use `smtp.gmail.com:587` with app password

### Security Scanning (Optional)

| Secret | Description | Example |
|--------|-------------|---------|
| `GITLEAKS_LICENSE` | Gitleaks Pro license key (optional) | `xxx-xxx-xxx` |

---

## Branch Protection Rules

Configure in **Settings → Branches → Add branch protection rule**

### For `main` branch:

```
Branch name pattern: main

☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☑ Require review from Code Owners

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  Required status checks:
    - Lint
    - Test & Coverage
    - NPM Security Audit
    - CodeQL Security Analysis
    - Secret Scanning with Gitleaks

☑ Require conversation resolution before merging

☑ Require signed commits (recommended)

☑ Require linear history (recommended)

☑ Do not allow bypassing the above settings
  Exceptions: (none or specific admin users only)

☑ Restrict who can push to matching branches
  Allowed: (none - force PRs for everyone)
```

### For `develop` branch:

```
Branch name pattern: develop

☑ Require a pull request before merging
  ☑ Require approvals: 1

☑ Require status checks to pass before merging
  Required status checks:
    - Lint
    - Test & Coverage

☑ Require conversation resolution before merging
```

### Additional Recommendations:

1. **Enable branch protection for release branches**: `release/*`
2. **Require CODEOWNERS file**: Create `.github/CODEOWNERS` to auto-assign reviewers
3. **Enable "Automatically delete head branches"**: Settings → General → Pull Requests

---

## Manual Deployments

### Trigger Manual Deployment

1. **Via GitHub UI:**
   - Go to **Actions** tab
   - Select **CD - Deploy to Production** workflow
   - Click **Run workflow** button
   - Select branch (usually `main`)
   - Click **Run workflow**

2. **Via GitHub CLI:**
   ```bash
   gh workflow run deploy.yml --ref main
   ```

3. **Via API:**
   ```bash
   curl -X POST \
     -H "Accept: application/vnd.github+json" \
     -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
     https://api.github.com/repos/OWNER/REPO/actions/workflows/deploy.yml/dispatches \
     -d '{"ref":"main"}'
   ```

### Monitor Deployment Progress

1. **GitHub Actions UI:**
   - Go to **Actions** tab
   - Click on running workflow
   - View real-time logs for each job

2. **GitHub CLI:**
   ```bash
   # List recent runs
   gh run list --workflow=deploy.yml
   
   # Watch specific run
   gh run watch RUN_ID
   
   # View logs
   gh run view RUN_ID --log
   ```

### Manual Rollback

If automatic rollback fails or you need to rollback to a specific version:

```bash
# SSH into EC2 instance
ssh -i ~/.ssh/deploy_key ec2-user@YOUR_EC2_HOST

# List available backup containers
docker ps -a --filter "name=app-backup-"

# Stop current container
docker stop app
docker rm app

# Restore specific backup
docker rename app-backup-TIMESTAMP app
docker start app

# Or deploy specific image version
docker pull YOUR_DOCKER_IMAGE:TAG
docker run -d --name app --restart unless-stopped -p 80:3000 -e NODE_ENV=production YOUR_DOCKER_IMAGE:TAG

# Verify
curl http://localhost/health
```

---

## Troubleshooting

### CI Workflow Issues

#### Problem: Tests failing locally but passing in CI (or vice versa)

**Solutions:**
- Ensure Node.js versions match (check `.nvmrc` or workflow file)
- Run `npm ci` instead of `npm install` to match CI behavior
- Check for environment-specific issues (timezone, file paths)
- Review test logs in Actions artifacts

#### Problem: Coverage threshold not met

**Solutions:**
```bash
# Generate coverage report locally
npm test -- --coverage

# View detailed report
open coverage/lcov-report/index.html

# Identify uncovered lines and add tests
```

#### Problem: Linting errors

**Solutions:**
```bash
# Run linter locally
npm run lint

# Auto-fix issues
npm run lint -- --fix

# Check specific files
npm run lint -- src/path/to/file.ts
```

### Deployment Workflow Issues

#### Problem: Docker build fails

**Solutions:**
- Check Dockerfile syntax
- Verify all dependencies are in `package.json`
- Review build logs in Actions tab
- Test build locally:
  ```bash
  docker build -t test-image .
  docker run -p 3000:3000 test-image
  ```

#### Problem: SSH connection to EC2 fails

**Solutions:**
- Verify EC2 instance is running
- Check security group allows SSH from GitHub Actions IPs
- Validate SSH key format (must include `-----BEGIN RSA PRIVATE KEY-----`)
- Test SSH connection manually:
  ```bash
  ssh -i deploy_key ec2-user@YOUR_EC2_HOST
  ```
- Check EC2 instance has Docker installed and running

#### Problem: Health check fails after deployment

**Solutions:**
- Check application logs:
  ```bash
  ssh ec2-user@YOUR_EC2_HOST
  docker logs app
  ```
- Verify environment variables are set correctly
- Check if port 3000 is exposed and mapped correctly
- Test health endpoint manually:
  ```bash
  curl http://YOUR_EC2_HOST/health
  ```
- Review application startup time (may need to increase health check timeout)

#### Problem: Deployment stuck on "Wait for CI"

**Solutions:**
- Check if CI workflow completed successfully
- Verify CI workflow name matches exactly: `CI`
- Check GitHub Actions status page for outages
- Cancel and re-run deployment workflow

### Security Workflow Issues

#### Problem: NPM audit fails with critical vulnerabilities

**Solutions:**
```bash
# View vulnerabilities
npm audit

# Attempt automatic fix
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force

# Update specific package
npm update package-name

# If no fix available, check for alternative packages or accept risk
```

#### Problem: CodeQL analysis times out

**Solutions:**
- CodeQL can be slow on large codebases
- Increase timeout in workflow (default is 360 minutes)
- Exclude generated files or large dependencies
- Run analysis on schedule instead of every PR

#### Problem: Gitleaks false positives

**Solutions:**
- Create `.gitleaksignore` file:
  ```
  # Ignore specific findings
  path/to/file.js:1234567890abcdef
  
  # Ignore entire files
  test/fixtures/fake-secrets.json
  ```
- Update Gitleaks configuration to exclude test files
- Ensure test data doesn't contain real secrets

#### Problem: Dependency review blocks PR

**Solutions:**
- Review flagged dependencies in PR checks
- Update to patched versions
- If license issue, find alternative package
- Document exception if risk is acceptable

### General Debugging Tips

1. **Enable debug logging:**
   - Add secret `ACTIONS_STEP_DEBUG` = `true`
   - Add secret `ACTIONS_RUNNER_DEBUG` = `true`
   - Re-run workflow to see verbose logs

2. **Download artifacts:**
   - Go to workflow run → Artifacts section
   - Download logs, coverage reports, or scan results
   - Analyze locally for detailed debugging

3. **Test workflow changes:**
   - Create feature branch
   - Modify workflow file
   - Push and observe results
   - Merge only after validation

4. **Check GitHub Actions status:**
   - Visit [GitHub Status](https://www.githubstatus.com/)
   - Check for ongoing incidents affecting Actions

---

## Monitoring and Alerts

### GitHub Actions Monitoring

#### Built-in Monitoring

1. **Actions Dashboard:**
   - Go to **Actions** tab
   - View workflow runs, success rates, and duration
   - Filter by workflow, branch, or status

2. **Workflow Insights:**
   - Actions → Select workflow → Click "..." → View insights
   - See success rate, run duration trends
   - Identify performance bottlenecks

3. **Email Notifications:**
   - Settings → Notifications → Actions
   - Configure email alerts for workflow failures

#### Deployment Status

- **GitHub Deployments:** View in **Environments** section
- **Deployment History:** Track all production deployments with timestamps
- **Environment URL:** Quick link to production application

### Application Monitoring

#### Health Checks

The deployment workflow includes automated health checks:
- 30 retry attempts with 10-second intervals
- Checks `/health` endpoint for 200 status
- Automatic rollback on failure

**Implement health endpoint in your application:**
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION
  });
});
```

#### Recommended Monitoring Tools

1. **Application Performance Monitoring (APM):**
   - New Relic, Datadog, or Sentry
   - Track errors, performance, and user experience
   - Set up alerts for error rate spikes

2. **Infrastructure Monitoring:**
   - AWS CloudWatch for EC2 metrics
   - Monitor CPU, memory, disk usage
   - Set alarms for resource exhaustion

3. **Uptime Monitoring:**
   - UptimeRobot, Pingdom, or StatusCake
   - Monitor application availability
   - Alert on downtime

### Alert Configuration

#### Slack Alerts

Deployment workflow sends Slack notifications with:
- Deployment status (success/failure)
- Commit information
- Author and workflow run link
- Environment details

**Customize Slack alerts:**
- Edit `notify` job in `deploy.yml`
- Modify payload structure
- Add custom fields or mentions

#### Email Alerts

Configure SMTP secrets to receive email notifications:
- Deployment success/failure
- Commit details and author
- Direct link to workflow run

#### GitHub Issues

Security workflow auto-creates issues for:
- Critical NPM vulnerabilities
- Leaked secrets detected by Gitleaks

**Issue labels:**
- `security`: All security-related issues
- `npm-audit`: NPM vulnerability findings
- `secrets`: Leaked secrets
- `critical`: High-priority issues

### Custom Monitoring Setup

#### Add Custom Metrics

Extend workflows to track custom metrics:

```yaml
- name: Track deployment metrics
  run: |
    # Send metrics to your monitoring service
    curl -X POST https://your-metrics-service.com/api/metrics \
      -H "Authorization: Bearer ${{ secrets.METRICS_API_KEY }}" \
      -d '{
        "metric": "deployment",
        "value": 1,
        "tags": {
          "status": "success",
          "environment": "production",
          "commit": "${{ github.sha }}"
        }
      }'
```

#### Integrate with External Services

Add steps to notify external services:
- PagerDuty for incident management
- Jira for automatic ticket creation
- Datadog for deployment tracking

### Security Monitoring

#### GitHub Security Tab

- **Dependabot Alerts:** Automatic vulnerability detection
- **Code Scanning:** CodeQL findings
- **Secret Scanning:** Leaked credentials (if enabled)

**Enable Dependabot:**
1. Settings → Security & analysis
2. Enable Dependabot alerts and security updates
3. Configure `.github/dependabot.yml`:
   ```yaml
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 10
   ```

#### Security Scanning Schedule

- **Daily scans:** 2 AM UTC (configurable in `security.yml`)
- **PR scans:** Automatic on pull requests
- **Manual scans:** Trigger via Actions tab

### Performance Monitoring

#### Workflow Performance

Track workflow execution times:
- CI typically: 2-5 minutes
- Deployment: 5-10 minutes
- Security scans: 5-15 minutes

**Optimize slow workflows:**
- Use caching for dependencies
- Parallelize independent jobs
- Reduce test execution time
- Use self-hosted runners for faster builds

#### Deployment Metrics

Monitor key deployment metrics:
- **Deployment frequency:** How often you deploy
- **Lead time:** Time from commit to production
- **Mean time to recovery (MTTR):** Time to recover from failures
- **Change failure rate:** Percentage of deployments causing issues

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)

## Support

For workflow issues or questions:
1. Check this documentation first
2. Review workflow logs in Actions tab
3. Search existing GitHub issues
4. Create new issue with `workflow` label
5. Contact DevOps team

---

**Last Updated:** 2024
**Maintained By:** DevOps Team
