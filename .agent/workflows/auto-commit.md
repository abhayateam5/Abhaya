# 🔄 Auto-Commit Workflow

## Purpose
Automatically commit and push changes to GitHub after completing each development phase.

## When to Use
After completing any of these actions:
- Creating new files
- Modifying existing code
- Completing a phase milestone
- Fixing bugs
- Adding features

## Commands

### Stage All Changes
```bash
git add -A
```

### Check Status
```bash
git status
```

### Commit with Descriptive Message
```bash
git commit -m "feat: [description]"
git commit -m "fix: [description]"
git commit -m "docs: [description]"
git commit -m "refactor: [description]"
```

### Push to GitHub
```bash
git push origin main
```

## Commit Message Format

**Features:**
```
feat: Add SOS trigger system
feat: Implement location tracking
feat: Create police dashboard
```

**Fixes:**
```
fix: Resolve GPS spoofing detection
fix: Correct RLS policy for family links
```

**Documentation:**
```
docs: Update implementation plan
docs: Add database setup guide
```

**Refactoring:**
```
refactor: Optimize location update logic
refactor: Improve SOS confidence scoring
```

## Automated Workflow

After each phase completion:
1. `git add -A`
2. `git commit -m "feat: Complete Phase X - [Phase Name]"`
3. `git push origin main`

## Example Phase Commits

```bash
# Phase 1
git commit -m "feat: Complete Phase 1 - Database setup with 15 tables and RLS policies"

# Phase 2
git commit -m "feat: Complete Phase 2 - Event system and rule engine"

# Phase 6
git commit -m "feat: Complete Phase 6 - Smart SOS system with auto-escalation"
```

## Notes
- Always check `git status` before committing
- Write clear, descriptive commit messages
- Push immediately after commit
- One commit per logical change or phase completion

---

**From now on, all code changes will be automatically pushed to GitHub.**
