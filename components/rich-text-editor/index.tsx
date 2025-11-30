"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useState } from "react";
import MenuBar from "./menu-bar";
import TextAlign from "@tiptap/extension-text";
import Highlight from "@tiptap/extension-highlight";
import { Button } from "../ui/button";
//import { insertNote } from "@/convex/mutation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NotesGrid } from "../notes-grid";

interface RichTextEditorProps {
  title: string,
  content: string;
  onChange: (content: string) => void;
}
export default function RichTextEditor({
  title,
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "min-h-[156px] border rounded-md bg-slate-50 py-2 px-3",
      },
    },
    onUpdate: ({ editor }) => {
      // console.log(editor.getHTML());
      onChange(editor.getHTML());
    },
    immediatelyRender: false, // 👈 fixes SSR hydration error
  });

  const insertNote = useMutation(api.mutation.insertNote);
  const notes = useQuery(api.query.getNotes);
  const deleteNote = useMutation(api.mutation.deleteNote);


  const [showGrid, setShowGrid] = useState(false);

  // const handleSubmit = async () => {
  //   if (!editor) return;
  //   await insertNote({
  //     title, // you can make this dynamic
  //     body: editor.getHTML(), // or JSON: JSON.stringify(editor.getJSON())
  //   });
  //   console.log("Note saved!");
  // };
  const handleSubmit = async () => {
    if (!editor) return;
  
    // hide NotesGrid on submit
    setShowGrid(false);
  
    await insertNote({
      title,
      body: editor.getHTML(),
    });
  
    console.log("Note saved!");
  };

  // const handleLoad = async () => {
  //   if (!editor) return;
  //   await getNotes({
  //     title, // you can make this dynamic
  //     body: editor.getHTML(), // or JSON: JSON.stringify(editor.getJSON())
  //   });
  //   console.log("Gets Content!");
  // };

  const handleLoad = () => {
    setShowGrid(true); // show NotesGrid
  };
  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {/*<Button>Submit</Button>*/}
      <div className="flex gap-4">
  <Button onClick={handleSubmit}>Submit</Button>
  <Button onClick={handleLoad}>Load Content</Button>
  {/*<NotesGrid
        notes={notes}
        onEdit={(note) => {
          setTitle(note.title);
          setPost(note.body);
        }}
        onDelete={(id) => deleteNote({ id })}
      />*/}
</div>
       {/* SHOW NOTES GRID WHEN BUTTON CLICKED */}
       {showGrid && (
        <NotesGrid
          notes={notes}
          onEdit={(note) => {
            // load note into tiptap editor
            if (editor) editor.commands.setContent(note.body);
          }}
          onDelete={(id) => deleteNote({ id })}
        />
      )}
      
    </div>
  );
}