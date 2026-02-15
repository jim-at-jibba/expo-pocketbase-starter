import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "notes",
      columns: [
        { name: "server_id", type: "string", isIndexed: true },
        { name: "title", type: "string" },
        { name: "content", type: "string", isOptional: true },
        { name: "user_id", type: "string", isIndexed: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
  ],
});
