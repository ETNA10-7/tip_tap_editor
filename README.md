## 📝 Next.js + TipTap + Convex Demo

A demo project showcasing a rich text editor built with Next.js, TipTap, shadcn/ui, and Convex for real‑time persistence.

#### This project demonstrates how to:
Integrate TipTap into a Next.js app

Style the editor with shadcn/ui components

Save and load editor content using Convex mutations & queries

Round‑trip persistence (type → save → reload → load)

#### 🚀 Features
✨ Next.js app scaffolded with TypeScript

🎨 UI powered by shadcn/ui

🖋️ Rich text editing via TipTap (bold, italic, etc.)

💾 Save & Load buttons wired to Convex backend

🔄 Verified persistence (save → reload → load works)


📁 **Project Structure**

.
├── app/
│   └── page.tsx                     # Renders TipTap editor
│
├── components/
│   ├── rich-text-editor/
│   │   ├── index.tsx                # Main TipTap editor component
│   │   └── menu-bar.tsx             # Toolbar for formatting actions
│   │
│   └── ui/
│       ├── button.tsx               # Reusable button component
│       ├── card.tsx                 # Reusable card component
│       └── notes-grid.tsx           # Grid layout for saved notes
│
├── convex/
│   ├── schema.ts                    # Convex schema
│   ├── mutations.ts                 # Save mutation
│   └── queries.ts                   # Load query
│
└── screenshots/
    └── editor.png                   # Screenshot of working editor



## 🖼️ Screenshot

![TipTap Editor Screenshot](./screenshots/editor.png)


## ⚙️ Setup & Run

### 1. Clone the repo

git clone https://github.com/your-username/tip_tap_editor.git

cd tip_tap_editor

### 2. Install dependencies

npm install

### 3. Run Convex dev server

npx convex dev

(Note: Run this cmd in other terminal)
### 4. Start Next.js app

npm run dev

### 5. Open in browser

Visit: http://localhost:3000
