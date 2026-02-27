# 🚀 Team Launchers - DEPRECATED

## ⚠️ IMPORTANT: This Folder is Outdated

**Individual launcher files have been consolidated into a single file:**

👉 **Use `/PROMPTS.md` in the project root instead**

---

## What Changed?

### Old System (This Folder)
- ❌ 4 separate files (SHUBH_KIRO_LAUNCHER.md, NIDHI_KIRO_LAUNCHER.md, etc.)
- ❌ Hard to maintain consistency
- ❌ Scattered information

### New System (`/PROMPTS.md`)
- ✅ Single file with all 4 team member prompts
- ✅ Easy to copy-paste
- ✅ Consistent format
- ✅ Clear instructions

---

## How to Use the New System

### Step 1: Open `/PROMPTS.md`
```bash
cat PROMPTS.md
```

### Step 2: Find Your Section
- 🎯 SHUBH (Backend + AWS)
- 🎯 NIDHI (AI Intelligence)
- 🎯 SRUSHTI (Frontend + UX)
- 🎯 LAKSHMI (Testing + DevOps)

### Step 3: Copy Your Prompt
Each section has a complete prompt in a code block.

### Step 4: Start Kiro
```bash
kiro-cli chat
```

### Step 5: Paste and Go
Paste your prompt and the AI will:
1. Read `docs/TODO.md`
2. Find your first `[ ]` task
3. Mark it `[/]` (in progress)
4. Complete the task
5. Mark it `[x]` (done)
6. Move to next task

---

## Why This Folder Still Exists

This folder is kept for **historical reference** and contains:
- Old launcher prompts
- Multi-agent system documentation
- Reorganization notes

**For active work, always use `/PROMPTS.md`**

---

## Key Improvements in New System

### 1. Task Status Tracking
```
[ ] = todo (START THIS)
[/] = in progress (SKIP THIS)
[x] = done (SKIP THIS)
```

### 2. Collision Prevention
Multiple people can work in parallel without conflicts by checking `[/]` status.

### 3. Subagent Usage
Prompts now include guidance on when to use subagents for faster work.

### 4. Clear File Ownership
Each person knows exactly which files they own.

---

## Migration Guide

If you were using old launchers:

| Old File | New Location |
|----------|--------------|
| `SHUBH_KIRO_LAUNCHER.md` | `/PROMPTS.md` → SHUBH section |
| `NIDHI_KIRO_LAUNCHER.md` | `/PROMPTS.md` → NIDHI section |
| `SRUSHTI_KIRO_LAUNCHER.md` | `/PROMPTS.md` → SRUSHTI section |
| `LAKSHMI_KIRO_LAUNCHER.md` | `/PROMPTS.md` → LAKSHMI section |

---

## Files in This Folder (Historical)

- `AGENT_PROMPTS.md` - Old agent system
- `MASTER_AGENT_SYSTEM.md` - Old multi-agent design
- `MULTI_AGENT_SUMMARY.md` - Old summary
- `QUICK_START_AGENTS.md` - Old quick start
- `REORGANIZATION_*.md` - Migration notes
- `*_KIRO_LAUNCHER.md` - Old individual launchers
- `WHAT_TO_DO_NOW.md` - Old instructions

**All replaced by `/PROMPTS.md`**

---

## Need Help?

1. **Start work**: Use `/PROMPTS.md`
2. **Check tasks**: See `docs/TODO.md`
3. **Get expert advice**: See `docs/personas/`
4. **API docs**: See `docs/api/`
5. **Deployment**: See `docs/deployment/`
