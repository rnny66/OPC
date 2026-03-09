---
name: ocp-phase-docs
description: Use after completing any platform phase to update all documentation — functional docs, technical docs, CLAUDE.md, skills, plans, and MEMORY.md
---

# OPC Phase Documentation Update

## When to Use
- After completing any platform phase (Phase 1, 2, 3, etc.)
- When the user says "update docs", "update documentation", or "we're done with this phase"
- Before moving to the next phase

## Checklist

After completing a phase, update ALL of the following:

### 1. Phase Plan (`docs/plans/phase-N-*.md`)
- Mark all task sections with ✅
- Update title with `✅ COMPLETE`
- Update verification checklist (mark completed items with `[x]`)
- Note any items deferred to later phases

### 2. Functional Documentation (`docs/functional/`)
- **`platform-overview.md`** — Update phase status table, add any new pages/features
- **`database-schema.md`** — Add any new tables, columns, RLS policies, triggers
- **`auth-flow.md`** — Update if auth flows changed or new routes added
- Create new docs if a major new domain was added (e.g., `tournament-flow.md`, `organizer-tools.md`)

### 3. Technical Documentation (`docs/technical/`)
- **`architecture.md`** — Update file tree, add new directories/files, update tech stack if changed
- **`testing.md`** — Update test count, add new test patterns, document new test utilities
- Create new docs if a major new technical concern was added (e.g., `caching.md`, `file-uploads.md`)

### 4. CLAUDE.md (project root)
- Update project structure section with new directories/files
- Add any new conventions or patterns discovered during the phase
- Update test counts
- Add any new environment variables

### 5. Platform Dev Skill (`.claude/skills/ocp-platform-dev/SKILL.md`)
- Update phase status table
- Add new component patterns or conventions
- Update directory structure
- Add new common mistakes discovered

### 6. MEMORY.md (auto-memory)
- Update phase status
- Add new key files
- Add any new known issues or testing patterns
- Update test counts

## How to Execute

1. Read the completed phase plan to know what was built
2. Read each doc file listed above
3. Update each one with the new information
4. Commit all changes in a single commit: `docs: update documentation after Phase N completion`
