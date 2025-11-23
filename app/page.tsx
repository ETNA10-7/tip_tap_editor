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
import RichTextEditor from "../components/rich-text-editor";
import { useState } from "react";

export default function Home() {
  const [post, setPost] = useState("");

  const onChange = (content: string) => {
    setPost(content);
    console.log(content);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <RichTextEditor content={post} onChange={onChange} />
    </div>
  );
}