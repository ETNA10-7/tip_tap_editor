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


<details>
<summary><strong>📁 Project Structure</strong></summary>

<br/>

```
📦 tip_tap_editor
├── app/
│   └── page.tsx
├── components/
│   ├── rich-text-editor/
│   └── ui/
├── convex/
└── screenshots/
```

</details>




## 🖼️ Screenshot

![TipTap Editor Screenshot](./screenshots/editor.png)



<details>
<summary><strong>⚙️ Setup & Run</strong></summary>

<br/>

### 1. Clone the repo

```bash
git clone https://github.com/your-username/tip_tap_editor.git
cd tip_tap_editor

### 2. Install dependencies
npm install

3. Run Convex dev server
npx convex dev
Note: Run this command in a separate terminal.

4. Start Next.js app
npm run dev

5. Open in browser
Visit: http://localhost:3000


