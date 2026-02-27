# 📚 Documentation Guide

## Quick Navigation

### 🚀 Start Working
- **`/PROMPTS.md`** - Copy your team prompt and start
- **`docs/TODO.md`** - See all tasks and their status

### 📖 Reference During Work
- **`docs/personas/`** - Expert advisors (Architect, Designer, QA, etc.)
- **`docs/api/`** - API documentation and schemas
- **`docs/deployment/`** - AWS setup and deployment guides
- **`docs/guides/`** - How-to guides for specific features

### 📦 Project Info
- **`docs/PROJECT_PLAN.md`** - Full architecture and plan
- **`docs/CREATOR_MODES.md`** - 3 creator modes explained
- **`docs/PROMPT_ENGINEERING.md`** - 8 polished prompts

### 🗂️ Deprecated (Historical)
- **`docs/team-launchers/`** - Old launcher system (use `/PROMPTS.md` instead)

---

## Workflow

```
1. Open /PROMPTS.md
2. Copy your section (Shubh/Nidhi/Srushti/Lakshmi)
3. Run: kiro-cli chat
4. Paste prompt
5. AI reads TODO.md, finds your [ ] task, marks [/], works
6. Task done → marked [x]
7. Repeat
```

---

## File Organization

```
/
├── PROMPTS.md              ← START HERE (team prompts)
├── README.md               ← Project overview
├── DOCS_GUIDE.md          ← This file
│
├── docs/
│   ├── TODO.md            ← Task tracker
│   ├── PROJECT_PLAN.md    ← Architecture
│   ├── CREATOR_MODES.md   ← AI modes
│   ├── PROMPT_ENGINEERING.md ← AI prompts
│   │
│   ├── personas/          ← Expert advisors
│   │   ├── README.md      ← How to use personas
│   │   ├── ARCHITECT.md
│   │   ├── DESIGNER.md
│   │   └── ...
│   │
│   ├── api/               ← API documentation
│   │   ├── API_REFERENCE.md
│   │   ├── ENDPOINTS.md
│   │   └── SCHEMAS.md
│   │
│   ├── deployment/        ← AWS & deployment
│   │   ├── AWS_SETUP.md
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   └── MONITORING.md
│   │
│   ├── guides/            ← Feature guides
│   │
│   └── team-launchers/    ← DEPRECATED (use /PROMPTS.md)
│
├── src/                   ← Source code
└── frontend/              ← Frontend code
```

---

## When to Use What

| Need | Use |
|------|-----|
| Start working | `/PROMPTS.md` |
| Check tasks | `docs/TODO.md` |
| Expert advice | `docs/personas/` |
| API info | `docs/api/` |
| Deploy help | `docs/deployment/` |
| Understand project | `docs/PROJECT_PLAN.md` |
| AI prompts | `docs/PROMPT_ENGINEERING.md` |
| Creator modes | `docs/CREATOR_MODES.md` |
