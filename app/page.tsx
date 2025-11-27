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
import { useMutation, useQuery } from "convex/react";
import RichTextEditor from "../components/rich-text-editor";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { NotesGrid } from "@/components/notes-grid";

export default function Home() {
  const [post, setPost] = useState("");
  const [title, setTitle] = useState("");
  const notes = useQuery(api.query.getNotes);
  const deleteNote = useMutation(api.mutation.deleteNote
  );
  const onChange = (content: string) => {
    setPost(content);
    console.log(content);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Load the first note’s body into the editor if available */}
      <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Enter note title"
      className="border px-2 py-1 rounded"
    />
      <RichTextEditor title={title} content={notes?.[0]?.body || post} onChange={onChange} />

      <NotesGrid
        notes={notes}
        onEdit={(note) => {
          setTitle(note.title);
          setPost(note.body);
        }}
        onDelete={(id) => deleteNote({ id })}
      />

      
      
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