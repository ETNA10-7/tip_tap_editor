// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
// export default defineSchema({
//    // const now = Date.now();
//   note: defineTable({
//     body: v.string(),      // document title
//     content: v.string(),    // TipTap editor content (can be JSON string)
//     createdAt: "number",  // timestamp
//   }),
// });
export default defineSchema({
    note: defineTable({
      title: v.string(),       // document title
      body: v.string(),    // TipTap editor content (can be JSON string)
      createdAt: v.number(),  // timestamp
    }),
  });

// export default defineSchema({
//     documents: defineTable({
//       id: v.id("documents"),
//       string: v.string(),
//       number: v.number(),
//       boolean: v.boolean(),
//       nestedObject: v.object({
//         property: v.string(),
//       }),
//     }),
//   });