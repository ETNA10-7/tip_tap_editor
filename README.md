# Mediumish - Next.js + TipTap + Convex

A Medium-like blogging platform with rich text editing, user authentication,
and real-time persistence.

## Features

- Rich text editing via TipTap (headings, bold, italic, lists, highlights)
- User authentication (signup/login with email & password)
- Create, edit, delete posts (with ownership protection)
- Real-time data sync via Convex

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Convex (database + serverless functions)
- **Auth**: Convex Auth with Password provider
- **Editor**: TipTap

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js/npm)
- [Convex account](https://dashboard.convex.dev) (free)

### Setup Steps

```bash
# 1. Clone and install
git clone https://github.com/your-username/tip_tap_editor.git
cd tip_tap_editor
bun install

# 2. Initialize Convex (creates your deployment)
bunx convex dev
# → Log in, create new project, keep this terminal running

# 3. Set up authentication (new terminal)
bunx @convex-dev/auth
# → Accept defaults (http://localhost:3000)

# 4. Start Next.js (new terminal)
bun dev

# 5. Open http://localhost:3000
```

### Terminal Layout

| Terminal | Command            | Purpose                       |
|----------|--------------------|------------------------------ |
| 1        | `bunx convex dev`  | Convex backend (keep running) |
| 2        | `bun dev`          | Next.js frontend              |

---

## Project Structure

```text
├── app/                    # Next.js pages
│   ├── auth/               # Login, signup, settings
│   ├── create/             # New post page
│   ├── post/[id]/          # View/edit post
│   └── posts/              # All posts
├── components/
│   ├── rich-text-editor/   # TipTap editor
│   └── ui/                 # shadcn components
├── convex/                 # Backend functions
│   ├── auth.ts             # Auth config
│   ├── posts.ts            # Post CRUD
│   ├── schema.ts           # Database schema
│   └── users.ts            # User queries
└── hooks/
    └── useAuth.ts          # Auth hook
```

---

## For Collaborators

Each developer needs their own Convex deployment (or share one for team work).

### Option A: Own Deployment (Recommended)

```bash
bun install
bunx convex dev          # Create YOUR project
bunx @convex-dev/auth    # Set up YOUR auth keys
bun dev
```

### Option B: Shared Team Deployment

Ask the project owner to:

1. Add you to the team at [dashboard.convex.dev](https://dashboard.convex.dev)
2. Share the deployment name

Then:

```bash
bun install
bunx convex dev --configure existing   # Select shared project
bunx @convex-dev/auth
bun dev
```
