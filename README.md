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



⚙️ Setup & Run
<details> <summary><strong>1️⃣ Clone the repository</strong></summary> <br/>
git clone https://github.com/your-username/tip_tap_editor.git
cd tip_tap_editor

</details>
<details> <summary><strong>2️⃣ Install dependencies</strong></summary> <br/>
npm install

</details>
<details> <summary><strong>3️⃣ Run Convex dev server</strong></summary> <br/>
npx convex dev


⚠️ Run this in a separate terminal

</details>
<details> <summary><strong>4️⃣ Start the Next.js app</strong></summary> <br/>
npm run dev

</details>
<details> <summary><strong>5️⃣ Open in browser</strong></summary> <br/>

👉 http://localhost:3000

</details>
