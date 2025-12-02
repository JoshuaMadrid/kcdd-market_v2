# 🤖 GitHub Actions CI/CD Guide

Complete guide to the GitHub Actions workflows for code quality, formatting, and accessibility checks.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Workflows](#workflows)
3. [Local Setup](#local-setup)
4. [GitHub Setup](#github-setup)
5. [Branch Protection Rules](#branch-protection-rules)
6. [Running Checks Locally](#running-checks-locally)
7. [Fixing Common Issues](#fixing-common-issues)
8. [Accessibility Testing](#accessibility-testing)

---

## Overview

This project uses GitHub Actions to ensure code quality and accessibility standards before merging to `main`. All PRs must pass these checks:

✅ **Prettier** - Code formatting  
✅ **ESLint** - Code linting & accessibility rules  
✅ **TypeScript** - Type checking  
✅ **Accessibility (axe)** - ADA compliance testing  
✅ **Build** - Successful build verification  
✅ **Security** - Dependency audits

---

## Workflows

### 1. Frontend CI (`.github/workflows/frontend-ci.yml`)

**Runs on:**
- Pull requests to `main` or `develop`
- Push to `main` or `develop`
- Changes in `frontend-vite/` directory

**Jobs:**

#### Code Quality
- ✅ Prettier formatting check
- ✅ ESLint linting
- ✅ TypeScript type checking

#### Accessibility
- ✅ axe-core automated tests
- ✅ ESLint jsx-a11y rules
- ✅ WCAG 2.1 AA compliance

#### Build
- ✅ Production build verification
- ✅ Artifact upload

### 2. Backend CI (`.github/workflows/backend-ci.yml`)

**Runs on:**
- Pull requests to `main` or `develop`
- Changes in `backend/api/` directory

**Jobs:**

#### Code Quality
- ✅ Prettier formatting check
- ✅ ESLint linting

#### Security
- ✅ npm audit (dependency vulnerabilities)
- ✅ TruffleHog (secret detection)

### 3. PR Checks (`.github/workflows/pr-checks.yml`)

**Runs on:**
- Pull request opened/updated

**Jobs:**
- ✅ PR title format validation
- ✅ Auto-labeling based on files changed
- ✅ PR size labeling
- ✅ Helpful comment with checklist

---

## Local Setup

### Step 1: Install Dependencies

```bash
# Frontend
cd frontend-vite
npm install

# Backend
cd backend/api
npm install
```

### Step 2: Install Git Hooks (Optional)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "🔍 Running pre-commit checks..."

# Frontend checks
cd frontend-vite
echo "📝 Checking formatting..."
npm run format:check || exit 1

echo "🔍 Running linter..."
npm run lint || exit 1

echo "🎯 Type checking..."
npm run type-check || exit 1

echo "✅ All checks passed!"
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

---

## GitHub Setup

### Step 1: Enable GitHub Actions

1. Go to your repository on GitHub
2. Click **Settings** → **Actions** → **General**
3. Under **Actions permissions**, select:
   - ✅ **Allow all actions and reusable workflows**
4. Save changes

### Step 2: Add Repository Secrets (Optional)

For production builds, add these secrets in **Settings → Secrets and variables → Actions**:

```
VITE_CLERK_PUBLISHABLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY
VITE_API_URL
```

**Note:** These are optional. The workflow uses dummy values for CI builds.

---

## Branch Protection Rules

### Recommended Settings

Go to **Settings → Branches → Add rule** for `main`:

#### Branch name pattern
```
main
```

#### Protect matching branches

✅ **Require a pull request before merging**
- Require approvals: **1**
- Dismiss stale PR approvals when new commits are pushed

✅ **Require status checks to pass before merging**
- Require branches to be up to date before merging
- Status checks that are required:
  - `Code Quality & Formatting`
  - `Accessibility (A11y) Checks`
  - `Build Check`
  - `CI Summary`
  - `Code Quality & Formatting` (Backend)
  - `Security Audit`

✅ **Require conversation resolution before merging**

✅ **Do not allow bypassing the above settings**

### How to Set Up

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Set branch name pattern to `main`
4. Check the boxes above
5. Wait for first PR to show available status checks
6. Add them to required checks
7. Save changes

---

## Running Checks Locally

### Before Creating a PR

Always run these commands locally:

#### Frontend

```bash
cd frontend-vite

# Format code
npm run format

# Check formatting (CI will run this)
npm run format:check

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check accessibility rules
npm run lint:a11y

# Type check
npm run type-check

# Build
npm run build

# Run accessibility tests
npm run test:a11y
```

#### Backend

```bash
cd backend/api

# Format code
npm run format

# Check formatting (CI will run this)
npm run format:check

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Quick Check All

Create a script `check-all.sh`:

```bash
#!/bin/bash

echo "🔍 Running all checks..."

# Frontend
cd frontend-vite
npm run format:check && \
npm run lint && \
npm run type-check && \
npm run build && \
echo "✅ Frontend checks passed!"

# Backend
cd ../backend/api
npm run format:check && \
npm run lint && \
echo "✅ Backend checks passed!"

echo "🎉 All checks passed! Ready to create PR."
```

---

## Fixing Common Issues

### ❌ Prettier Formatting Failed

**Error:**
```
Code style issues found in the following files:
  src/App.tsx
```

**Fix:**
```bash
cd frontend-vite
npm run format
git add .
git commit -m "fix: format code"
git push
```

### ❌ ESLint Errors

**Error:**
```
/src/App.tsx
  12:7  error  'user' is defined but never used  @typescript-eslint/no-unused-vars
```

**Fix:**
```bash
# Auto-fix what can be fixed
npm run lint:fix

# Manually fix remaining issues
# Then commit
git add .
git commit -m "fix: resolve linting errors"
git push
```

### ❌ TypeScript Errors

**Error:**
```
src/App.tsx:10:5 - error TS2322: Type 'string' is not assignable to type 'number'.
```

**Fix:**
1. Fix the TypeScript errors in your code
2. Run `npm run type-check` to verify
3. Commit and push

### ❌ Accessibility Violations

**Error:**
```
axe found 3 accessibility violations:
- <img> element does not have alt attribute
```

**Fix:**

1. **Missing alt text:**
   ```tsx
   // Bad
   <img src="/logo.png" />
   
   // Good
   <img src="/logo.png" alt="Company logo" />
   ```

2. **Missing form labels:**
   ```tsx
   // Bad
   <input type="text" />
   
   // Good
   <label htmlFor="name">Name</label>
   <input type="text" id="name" />
   ```

3. **Color contrast:**
   - Use WCAG AA compliant colors
   - Check with: https://webaim.org/resources/contrastchecker/

4. **Keyboard navigation:**
   ```tsx
   // Bad
   <div onClick={handleClick}>Click me</div>
   
   // Good
   <button onClick={handleClick}>Click me</button>
   ```

### ❌ Build Failed

**Error:**
```
Build failed with errors
```

**Fix:**
1. Check the build output for specific errors
2. Fix the issues (usually TypeScript or import errors)
3. Test locally: `npm run build`
4. Commit and push

---

## Accessibility Testing

### Automated Testing (axe-core)

The CI runs automated accessibility tests using axe-core.

**Pages tested:**
- Homepage (`/`)
- Requests (`/requests`)
- About (`/about`)

**To add more pages:**

Edit `frontend-vite/scripts/a11y-test.js`:

```javascript
const PAGES_TO_TEST = [
  '/',
  '/requests',
  '/about',
  '/donor/dashboard',  // Add your page
]
```

### Manual Testing Checklist

Before merging, manually test:

#### Keyboard Navigation
- [ ] All interactive elements accessible with Tab
- [ ] Can navigate menus with arrow keys
- [ ] Can activate buttons/links with Enter/Space
- [ ] Focus indicator visible on all elements
- [ ] No keyboard traps

#### Screen Reader Testing
- [ ] Images have descriptive alt text
- [ ] Form inputs announced correctly
- [ ] ARIA labels read properly
- [ ] Page structure makes sense
- [ ] Error messages announced

Test with:
- **macOS:** VoiceOver (Cmd + F5)
- **Windows:** NVDA (free) or JAWS
- **Chrome:** ChromeVox extension

#### Color Contrast
- [ ] Text readable against background
- [ ] Meet WCAG AA standards (4.5:1 for normal text)
- [ ] Interactive elements distinguishable

Tools:
- https://webaim.org/resources/contrastchecker/
- Chrome DevTools → Lighthouse → Accessibility

#### Forms
- [ ] All inputs have associated labels
- [ ] Error messages clear and helpful
- [ ] Required fields indicated
- [ ] Can submit with keyboard

### Accessibility Resources

- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **WebAIM:** https://webaim.org/
- **A11y Project:** https://www.a11yproject.com/

---

## PR Workflow

### 1. Create Feature Branch

```bash
git checkout -b feat/my-feature
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

Write your code following the style guide.

### 3. Run Local Checks

```bash
npm run format
npm run lint
npm run type-check
npm run build
npm run test:a11y
```

### 4. Commit Changes

Use conventional commits:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "a11y: improve accessibility"
git commit -m "docs: update readme"
```

### 5. Push and Create PR

```bash
git push origin feat/my-feature
```

Then create PR on GitHub.

### 6. Fill Out PR Template

Complete all checklist items in the PR template.

### 7. Wait for CI Checks

GitHub Actions will run all checks automatically.

### 8. Fix Any Issues

If checks fail:
1. Review the error messages
2. Fix issues locally
3. Commit and push
4. CI will run again automatically

### 9. Request Review

Once all checks pass, request a code review.

### 10. Merge

After approval and passing checks, merge the PR!

---

## CI Badge

Add this to your README to show CI status:

```markdown
![Frontend CI](https://github.com/YOUR_ORG/kcdd-market_v2/workflows/Frontend%20CI%20-%20Quality%20Checks/badge.svg)
![Backend CI](https://github.com/YOUR_ORG/kcdd-market_v2/workflows/Backend%20CI%20-%20Quality%20Checks/badge.svg)
```

---

## Troubleshooting CI

### Workflow Not Running

1. Check **Actions** tab is enabled
2. Verify workflow file syntax (YAML)
3. Check file is in `.github/workflows/`
4. Verify branch/path triggers match

### Checks Always Failing

1. Run locally first to debug
2. Check workflow logs in Actions tab
3. Verify dependencies installed correctly
4. Check environment variables (if needed)

### Too Many Notifications

1. Go to **Watch** → **Custom**
2. Uncheck **Workflows**
3. You'll still see PR check results

---

## Best Practices

1. **Run checks locally** before pushing
2. **Fix formatting first** (easiest to resolve)
3. **Test accessibility** during development, not after
4. **Use semantic commit messages**
5. **Keep PRs small** for faster reviews
6. **Write descriptive PR descriptions**
7. **Don't bypass checks** (even if you can)

---

## Quick Reference

### Commands

| Command | Purpose |
|---------|---------|
| `npm run format` | Format code |
| `npm run format:check` | Check formatting |
| `npm run lint` | Run linter |
| `npm run lint:fix` | Auto-fix linting |
| `npm run lint:a11y` | Check accessibility rules |
| `npm run type-check` | TypeScript check |
| `npm run build` | Build project |
| `npm run test:a11y` | Run accessibility tests |

### Commit Prefixes

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `a11y:` | Accessibility improvement |
| `docs:` | Documentation |
| `style:` | Code style/formatting |
| `refactor:` | Code refactoring |
| `perf:` | Performance improvement |
| `test:` | Testing |
| `chore:` | Maintenance |

---

## Support

**Questions?**
- Check workflow logs in Actions tab
- Review this guide
- Ask in PR comments
- Contact team

**Found a bug in CI?**
- Open an issue
- Tag with `ci/cd` label

---

**Version:** 1.0.0  
**Last Updated:** November 17, 2024

