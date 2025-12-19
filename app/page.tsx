// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"

// export default function Home() {
//   return (
//     <div>
//       <Button>Click me</Button>
//       <Input/>
//       <Textarea/>
//     </div>
//   )
// }
// "use client";

// import Image from "next/image";
// import { useQuery } from "convex/react";
// import { api } from "../convex/_generated/api";
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"

// import Tiptap from '../components/Tiptap'

// export default function Home() {
//   const tasks = useQuery(api.tasks.get);
//   return (
//     <>
//     <div className="flex min-h-screen flex-col items-center justify-between p-24">
//       {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)}
//     </div>
//     <div>
//     <Button>Click me</Button>
//       <Input/>
//       <Textarea/>
//     </div>
//     <Tiptap />
//     </>
//   );
// }

"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostCard } from "@/components/post-card";
import { ProfileSetupPrompt } from "@/components/profile-setup-prompt";

export default function Home() {
  const posts = useQuery(api.posts.list) ?? [];
  const latest = posts.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Profile Setup Prompt - Shows for authenticated users who haven't set up their profile */}
      <ProfileSetupPrompt />

      <section className="grid gap-8 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-8 py-12 text-white shadow-lg">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            TipTap + Convex + Next.js
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Publish beautiful stories with a clean, Medium-like experience.
          </h1>
          <p className="max-w-3xl text-lg text-slate-200">
            A minimal editor-first blog starter. Write with TipTap, store posts
            in Convex, and ship fast on the Next.js App Router.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/create"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start writing
            </Link>
            <Link
              href="/posts"
              className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Browse posts
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest posts</h2>
          <Link href="/posts" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="text-muted-foreground">
            No posts yet. Be the first to{" "}
            <Link href="/create" className="underline">
              write one
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}



// const notes = useQuery(api.query.getNotes);

//   return (
//     <div className="max-w-3xl mx-auto py-8">
//       <RichTextEditor
//         content={notes?.[0]?.body || ""} // load first note’s content
//         onChange={(c) => console.log(c)}
//       />
//       <ul>
//         {notes?.map((note) => (
//           <li key={note._id}>{note.title}</li>
//         ))}
//       </ul>
//     </div>


// <ul className="list-disc ml-6">
//         {notes?.map((note) => (
//           <li key={note._id}>
//             <strong>{note.title}</strong>
//             <strong>{note.body}</strong>
//           </li>
//         ))}
//       </ul>