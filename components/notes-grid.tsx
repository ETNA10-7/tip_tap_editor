// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// //import { generateHTML } from "@tiptap/html";
// import StarterKit from "@tiptap/starter-kit";

// export function NotesGrid({ notes, onEdit, onDelete }) {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
//       {notes.map((note) => {
//         const html = generateHTML(note.content, [StarterKit]);

//         return (
//           <Card
//             key={note._id}
//             className="shadow-sm hover:shadow-md transition border border-gray-200 dark:border-gray-700 
//                        bg-white dark:bg-gray-900"
//           >
//             <CardHeader>
//               <CardTitle className="text-lg font-bold dark:text-white">
//                 {note.title}
//               </CardTitle>
//             </CardHeader>

//             <CardContent>
//               <div
//                 className="prose prose-sm dark:prose-invert max-w-none"
//                 dangerouslySetInnerHTML={{ __html: html }}
//               />

//               <div className="flex justify-end gap-3 mt-4">
//                 <button
//                   onClick={() => onEdit(note)}
//                   className="text-blue-600 hover:underline dark:text-blue-400"
//                 >
//                   Edit
//                 </button>

//                 <button
//                   onClick={() => onDelete(note._id)}
//                   className="text-red-600 hover:underline dark:text-red-400"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </CardContent>
//           </Card>
//         );
//       })}
//     </div>
//   );
// }


import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Note = {
  _id: string;
  title: string;
  body: string; // HTML string stored in Convex
};

type NotesGridProps = {
  notes: Note[] | undefined;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
};

export function NotesGrid({ notes = [], onEdit, onDelete }: NotesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {notes.map((note) => (
        <Card
          key={note._id}
          className="shadow-sm hover:shadow-md transition border border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-900 rounded-xl"
        >
          <CardHeader>
            <CardTitle className="text-lg font-bold dark:text-white">
              {note.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Render HTML from the database */}
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: note.body }}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => onEdit(note)}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(note._id)}
                className="text-red-600 hover:underline dark:text-red-400"
              >
                Delete
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
