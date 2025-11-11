# Security Checklist Before Pushing to GitHub

## Pre-Push Verification

### 1. Verify No Secrets in Git History

```bash
# Check that .env is properly ignored
git check-ignore .env

# Search for potential API keys
git log -p | grep -i "sk-" || echo "No API keys found"
git log -p | grep -i "api_key" || echo "No api_key found"

# List all tracked files
git ls-files
```

**Expected**: `.env` should be ignored, no API keys in history, no sensitive files tracked.

### 2. Verify .gitignore is Working

Files that MUST be ignored:
- ✅ `.env` (contains secrets)
- ✅ `.env.local`
- ✅ `*.log` files
- ✅ `node_modules/`
- ✅ `__pycache__/`
- ✅ `.cache/`

Run this to verify:
```bash
# This should output .env, confirming it's ignored
git check-ignore .env .env.local

# This should show NO sensitive files
git ls-files | grep -E "\.env$|api.*key|secret|password" || echo "Clean"
```

### 3. Review .env.example

The `.env.example` file should contain:
- ✅ All environment variable names
- ✅ Example/placeholder values only
- ✅ NO real passwords, API keys, or secrets
- ✅ Comments explaining each variable

### 4. Check for Hardcoded Credentials

```bash
# Search all tracked files for potential secrets
git grep -i "password" | grep -v "PASSWORD:-" | grep -v "your-password-here"
git grep -i "secret" | grep -v "JWT_SECRET:-" | grep -v "your-secret-here"
git grep -E "sk-[a-zA-Z0-9]+" || echo "No API keys found"
```

**Expected**: Only template values or environment variable references.

### 5. Verify Default Passwords are Documented

In README.md, ensure:
- ✅ Default credentials are clearly marked as development-only
- ✅ Production security guidelines are included
- ✅ Password rotation instructions provided

### 6. Check Docker Compose Files

Docker Compose files should use:
- ✅ Environment variable substitution: `${VAR_NAME:-default}`
- ✅ No hardcoded production credentials
- ✅ Default values suitable for development only

## Files Safe to Commit

✅ **Application Code**
- Python files (`.py`)
- TypeScript/JavaScript files (`.ts`, `.tsx`, `.js`)
- Configuration templates
- Docker files
- Documentation

✅ **Configuration Templates**
- `.env.example`
- `docker-compose.yml` (with env var substitution)
- Sample configs

✅ **Documentation**
- README.md
- CONTRIBUTING.md
- Architecture docs
- Setup guides

## Files NEVER to Commit

❌ **Secrets & Credentials**
- `.env` (actual environment file)
- API keys
- SSL certificates
- Database backups
- User data

❌ **Build Artifacts**
- `node_modules/`
- `.next/`
- `__pycache__/`
- `*.pyc`
- Build outputs

❌ **Local Development**
- `.vscode/settings.json` (unless team-shared)
- `.idea/` (IDE config)
- `*.log` files
- `.DS_Store`, `Thumbs.db`

## GitHub Repository Setup

### Before Creating Repository

1. **Review commit history** for any sensitive data:
   ```bash
   git log --all --full-history --oneline | head -20
   ```

2. **Do final search** across all files:
   ```bash
   git ls-files | xargs grep -l "sk-" || echo "Safe"
   ```

### Creating the Repository

1. Create repository on GitHub (public or private)
2. Add remote:
   ```bash
   git remote add origin https://github.com/yourusername/CareerMentor.git
   ```

3. **Final check before push**:
   ```bash
   # Review what will be pushed
   git log --oneline
   git diff origin/main HEAD  # If main branch exists

   # Confirm .env is not tracked
   git ls-files | grep "^\.env$" && echo "ERROR: .env is tracked!" || echo "Safe to push"
   ```

4. Push to GitHub:
   ```bash
   git push -u origin master
   ```

### After Pushing

1. **Verify on GitHub**:
   - Check repository files
   - Confirm `.env` is not present
   - Review README renders correctly
   - Test clone on another machine

2. **Add repository shields** (optional):
   - License badge
   - Build status
   - Docker status

3. **Enable security features**:
   - GitHub security scanning
   - Dependabot alerts
   - Secret scanning (if available)

## What to Do If You Accidentally Commit a Secret

### If Not Pushed Yet
```bash
# Remove from last commit
git reset HEAD~1
# Remove the secret from .env or file
# Stage changes again (excluding secret)
git add .
git commit -m "..."
```

### If Already Pushed
1. **Immediately rotate the secret** (new API key, password, etc.)
2. **Remove from git history**:
   ```bash
   # WARNING: This rewrites history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push (dangerous!)
   git push origin --force --all
   ```
3. **Better approach**: Use BFG Repo Cleaner or GitHub's secret scanning

## Production Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (32+ chars)
- [ ] Use environment-specific `.env` files
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Enable rate limiting
- [ ] Review CORS settings
- [ ] Set up monitoring and alerts
- [ ] Document incident response procedures

## Ongoing Security

- Rotate secrets regularly (every 90 days)
- Keep dependencies updated
- Monitor security advisories
- Review access logs
- Conduct security audits
- Test disaster recovery procedures

## Questions?

If unsure about any file:
1. Check if it contains sensitive data
2. Can it be regenerated from source?
3. Is it needed for others to run the project?

**When in doubt, don't commit it.**
