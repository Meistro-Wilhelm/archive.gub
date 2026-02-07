# CLAUDE.md — AI Assistant Guide for archive.gub

## Project Overview

**archive.gub** is a clearance-level document access website that houses the Güb Files. Users authenticate via a hidden entry point on the home page, then access documents based on their assigned clearance level.

- **Repository:** Meistro-Wilhelm/archive.gub
- **Author:** Meistro-Wilhelm (samuelgborn@gmail.com)
- **Tech Stack:** Node.js, Express, plain HTML/CSS/JS, JSON file storage
- **Font:** Courier Prime (everywhere — no exceptions)

## Repository Structure

```
archive.gub/
├── CLAUDE.md              # This file — AI assistant guide
├── README.md              # Project description
├── package.json           # Node.js project config
├── server.js              # Express server (auth API, document API, routing)
├── .gitignore             # Git ignore rules
├── data/
│   ├── users.json         # GITIGNORED — real credentials (server only)
│   ├── documents.json     # GITIGNORED — real documents (server only)
│   ├── users.example.json       # Template showing expected user format
│   └── documents.example.json   # Template showing expected document format
└── public/
    ├── index.html          # Home page (GÜB-style, hidden auth trigger)
    ├── dashboard.html      # Document list with search and level filtering
    ├── viewer.html         # In-browser document viewer (no download)
    ├── css/
    │   └── style.css       # All styles (light/dark mode, full layout)
    └── js/
        ├── home.js         # Home page logic and auth flow
        ├── dashboard.js    # Document list, search, level filter
        └── viewer.js       # Document rendering, copy/download prevention
```

**Security:** The repo is public but `data/users.json` and `data/documents.json` are gitignored. Real data lives only on the server. The `*.example.json` files show the expected format without exposing real credentials or documents.

## Development Setup

```sh
npm install

# Copy example data files and fill in real values
cp data/users.example.json data/users.json
cp data/documents.example.json data/documents.json

npm start        # Runs on http://localhost:3000
```

## Build & Run Commands

| Command     | Description                  |
|-------------|------------------------------|
| `npm start` | Start the Express server     |
| `npm run dev` | Same as start (no hot reload yet) |

## Clearance Levels

Levels are **strictly hierarchical** (higher can see all below) **except** Level 6.7:

| Level  | Display Name              | Access Rule                                      |
|--------|---------------------------|--------------------------------------------------|
| 3      | Level three (top secret)  | Base level — all authenticated users              |
| 6.7    | Level 6.7                 | **Special** — requires explicit `has67` flag OR Level 18+ |
| 9      | Level 9 (CLASSIFIED)      | Sees Level 3 + 9 docs                            |
| 12     | Level 12 (SECRET)         | Sees Level 3 + 9 + 12 docs                      |
| 18     | Level 18+ (LEVEL OMEGA - TOP SECRET) | Sees everything (including 6.7)           |

**Important:** Capitalization of level names is exact and intentional. Do not change.

The top designation is **LEVEL OMEGA - TOP SECRET**.

## Authentication Flow

1. Home page looks like a normal GÜB website
2. Clicking the **right umlaut dot** of the Ü in "GÜB" opens the auth flow
3. **Step 1:** Enter personal access code (acts as password)
4. **Step 2:** Enter personnel passkey (acts as username)
5. **Step 3:** Select clearance level from dropdown (single level or "all available")
6. Invalid code or passkey → returns to home page silently

Users are stored in `data/users.json`. Each user has: `id`, `name`, `code`, `passkey`, `clearance` (number), `has67` (boolean).

## Document System

- Documents stored in `data/documents.json` with HTML content
- Documents are **view-only** — no download, right-click disabled, copy disabled, Ctrl+S/P blocked
- Documents support embedded images within HTML content
- Sorted by clearance level, grouped with section headers
- Search bar filters by title and summary

## Visual Design

- **Font:** Courier Prime everywhere
- **Light mode (default):** White primary, light cold greys, greyish-purple menu bar, black text
- **Dark mode:** Black primary, lighter blacks for greys, brighter purple menu bar, white text
- **Toggle:** In the menu bar (slide switch between LIGHT/DARK labels)
- **Header:** "ARCHIVE.GUB" in large text with image placeholder to the left (96×144px space)
- **Color variables** are defined as CSS custom properties in `:root` and `[data-theme="dark"]`

## Testing

_No test framework configured yet._

## Linting & Formatting

_No linter or formatter configured yet._

## Code Style & Conventions

- All frontend JS uses vanilla ES6+ (no framework)
- CSS uses custom properties for theming
- Server uses CommonJS (`require`)
- JSON files in `data/` are the sole data store — no database

## Git Workflow

- **Default branch:** `main`
- Write clear, descriptive commit messages
- Keep commits focused on a single change

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-06 | Repository created | Initial project setup |
| 2026-02-07 | Node.js + Express chosen | Simple, no heavy framework needed for ~35 users |
| 2026-02-07 | JSON file storage | No database needed for ~25 docs and ~35 users |
| 2026-02-07 | Hidden auth entry point | Security through obscurity — umlaut dot trigger |
| 2026-02-07 | Courier Prime font | Per project requirements |
| 2026-02-07 | Public repo + backend deploy | Data gitignored, real site runs on Express backend |

## Notes for AI Assistants

- **NEVER commit `data/users.json` or `data/documents.json`** — they contain real credentials and classified content.
- Always read existing files before modifying them.
- Update this CLAUDE.md when adding new tooling, frameworks, or conventions.
- **Do not change clearance level names or capitalization** — they are intentional.
- Default top designation is **LEVEL OMEGA - TOP SECRET**.
- Level 6.7 is special — it is NOT part of the normal hierarchy. Check `has67` flag.
- Documents must never be downloadable. Maintain copy/download prevention.
- The hidden umlaut trigger is intentional — do not make it visible or obvious.
- Keep the Courier Prime font requirement — it applies to ALL text on the site.
