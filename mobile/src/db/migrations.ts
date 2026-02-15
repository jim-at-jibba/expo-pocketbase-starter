import { createTable, schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 1,
      steps: [
        createTable({
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
    },
  ],
});
