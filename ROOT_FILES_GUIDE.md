# 📁 Root Directory Files Guide

Quick reference for what's in the root directory and why.

## 📄 Files That Should Stay in Root

### Essential Files

**README.md** - ⭐ Main project documentation
- First thing people see on GitHub
- Project overview and quick start
- Links to all documentation
- **KEEP IN ROOT**

**setup-vite.sh** - 🤖 Setup script
- Automated environment setup
- Run from root directory
- **KEEP IN ROOT**

**.gitignore** - 🔒 Git ignore rules
- Controls what Git tracks
- Standard Git file
- **KEEP IN ROOT**

**.vercelignore** - 🚀 Vercel deployment ignore
- Controls what deploys to Vercel
- Only needed in root
- **KEEP IN ROOT**

### Configuration Files (Hidden)

**.github/** - 🤖 CI/CD workflows
- GitHub Actions
- PR templates
- Issue templates
- **KEEP IN ROOT**

**package.json** (if exists) - 📦 Root dependencies
- Workspace configuration
- Scripts that run across project
- **KEEP IN ROOT**

---

## 📚 Files That Belong in `docs/`

### Documentation Files (.md)

All documentation belongs in `docs/` folder:
- ✅ Guides and tutorials
- ✅ Setup instructions
- ✅ Deployment guides
- ✅ Architecture docs
- ✅ API documentation
- ✅ Migration guides
- ✅ Changelogs (optional)

**Example:**
```
docs/
├── README.md                  # Documentation hub
├── QUICK_START_VITE.md       # Setup guide
├── SETUP_GUIDE.md            # Complete setup
├── DEPLOYMENT_CHECKLIST.md   # Deployment
└── ...
```

---

## 📦 Files That Belong in `archive/`

### Old/Deprecated Files

Files from previous versions:
- ✅ Old documentation
- ✅ Deprecated code
- ✅ Previous implementation
- ✅ Legacy scripts
- ✅ Outdated standards

**Example:**
```
archive/
├── old-frontend/             # Next.js v2
├── old-docs/                 # v2 documentation
│   ├── README_v2.md
│   ├── START.md
│   ├── SHADCN_STANDARDS.md
│   └── setup_v2.sh
└── README.md                 # Archive guide
```

---

## 🗂️ Current Root Directory

```
kcdd-market_v2/
├── 📁 docs/                   # All documentation
├── 📁 frontend-vite/          # Active frontend
├── 📁 backend/                # Backend + API
├── 📁 .github/                # CI/CD workflows
├── 📁 archive/                # Old files (in .gitignore)
│
├── 📄 README.md               # ⭐ Main project docs (KEEP)
├── 📄 ROOT_FILES_GUIDE.md     # This file (optional)
├── 🔧 setup-vite.sh           # Setup script (KEEP)
├── 🔒 .gitignore              # Git ignore (KEEP)
├── 🚀 .vercelignore           # Vercel ignore (KEEP)
└── 📦 package.json            # Root config (if exists)
```

---

## ✅ Checklist: Where Does This File Go?

### Is it a .md file?

**Is it the main README?**
- ✅ YES → Keep in root as `README.md`
- ❌ NO → Continue...

**Is it documentation/guide?**
- ✅ YES → Move to `docs/`
- ❌ NO → Continue...

**Is it old/deprecated?**
- ✅ YES → Move to `archive/old-docs/`
- ❌ NO → Keep in root (rare case)

### Is it a script file?

**Is it the main setup script?**
- ✅ YES → Keep in root (e.g., `setup-vite.sh`)
- ❌ NO → Continue...

**Is it old/deprecated?**
- ✅ YES → Move to `archive/old-docs/`
- ❌ NO → Consider moving to `scripts/` folder

### Is it a config file?

**Is it a standard config file?**
- `.gitignore`, `.vercelignore`, `package.json`, etc.
- ✅ YES → Keep in root
- ❌ NO → Continue...

**Is it project-specific documentation?**
- ✅ YES → Move to `docs/`
- ❌ NO → Keep in root

---

## 📝 Quick Decision Tree

```
New file → Where does it go?

Is it README.md?
└─ YES → Root ✅

Is it a config file (.gitignore, package.json, etc.)?
└─ YES → Root ✅

Is it the main setup script?
└─ YES → Root ✅

Is it documentation (.md)?
└─ YES → docs/ 📚

Is it old/deprecated?
└─ YES → archive/ 📦

Is it code?
└─ YES → Appropriate code folder (frontend-vite/, backend/, etc.)

Still unsure?
└─ docs/ is usually safe for .md files 📚
```

---

## 🎯 Goals for Root Directory

### Keep Root Clean
- Only essential files
- Easy to understand at a glance
- No clutter

### Make It Obvious
- README.md is the entry point
- Clear what each file does
- Logical organization

### Follow Standards
- README.md in root (GitHub standard)
- .gitignore in root (Git standard)
- Config files in root (standard practice)
- Docs in docs/ (best practice)

---

## 📊 Before vs After

### Before (Messy)
```
kcdd-market_v2/
├── README.md
├── QUICK_START_VITE.md          ❌ Should be in docs/
├── SETUP_GUIDE.md               ❌ Should be in docs/
├── MIGRATION_GUIDE.md           ❌ Should be in docs/
├── SHADCN_STANDARDS.md          ❌ Old file, archive
├── START.md                     ❌ Old file, archive
├── VERCEL_DEPLOYMENT.md         ❌ Should be in docs/
├── DEPLOYMENT_CHECKLIST.md      ❌ Should be in docs/
├── ... (10+ more .md files)     ❌ Cluttered!
├── frontend/                    ❌ Old version
├── frontend-vite/               ✅ Active
└── backend/                     ✅ Active
```

### After (Clean)
```
kcdd-market_v2/
├── docs/                        ✅ All documentation
├── frontend-vite/               ✅ Active frontend
├── backend/                     ✅ Active backend
├── .github/                     ✅ CI/CD
├── archive/                     ✅ Old files (gitignored)
│
├── README.md                    ✅ Main docs
├── ROOT_FILES_GUIDE.md          ✅ This guide (optional)
├── setup-vite.sh                ✅ Setup script
├── .gitignore                   ✅ Git config
└── .vercelignore                ✅ Vercel config
```

Much cleaner! 🎉

---

## 💡 Best Practices

### 1. README.md Always in Root
- First thing people see
- GitHub displays it automatically
- Standard practice everywhere

### 2. Documentation in docs/
- All guides and documentation
- Easy to find
- Professional organization

### 3. Code in Named Folders
- frontend-vite/ for frontend
- backend/ for backend
- Clear purpose

### 4. Old Files in archive/
- Don't delete (yet)
- Keep for reference
- In .gitignore (won't commit)

### 5. Config Files in Root
- .gitignore, .vercelignore, package.json
- Standard locations
- Tools expect them there

---

## ❓ FAQ

### Q: Can I have a CHANGELOG.md in root?

**A:** Either location works:
- Root: If it's very important and you want it prominent
- docs/: If it's just documentation

**Recommendation:** `docs/CHANGELOG.md` for cleaner root

### Q: What about LICENSE?

**A:** Keep in root
- Standard location
- GitHub displays it automatically
- Required by many licenses

### Q: Can I have a CONTRIBUTING.md?

**A:** Either location:
- Root: GitHub recognizes it for contributors
- docs/: For cleaner root

**Recommendation:** Root if you want GitHub to show it automatically

### Q: What about TODO.md or NOTES.md?

**A:** 
- Personal notes: Don't commit (add to .gitignore)
- Project tasks: Use GitHub Issues instead
- If you must: Put in `docs/`

### Q: Should package.json be in root?

**A:** YES, always
- npm/yarn expect it there
- Standard location for Node projects
- Keep in root

---

## 🔍 How to Check Your Root

```bash
# See what's in root
ls -la

# Too many files?
ls -1 *.md | wc -l

# Should be: 1-2 .md files (README.md and optionally this guide)
```

---

## 🎯 Summary

### ✅ Always in Root
- README.md (main documentation)
- Setup scripts (setup-vite.sh)
- Config files (.gitignore, .vercelignore)
- LICENSE (if exists)
- package.json (if workspace)

### 📚 Always in docs/
- All guides and documentation
- Setup instructions
- Deployment guides
- Architecture docs
- Migration guides

### 📦 Always in archive/
- Old files
- Deprecated documentation
- Legacy code
- Previous versions

---

**Goal: Keep root clean with only essential files!** ✨

---

**Version:** 1.0.0  
**Last Updated:** November 17, 2024

