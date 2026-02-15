/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const notes = new Collection({
      type: "base",
      name: "notes",
      listRule: "@request.auth.id = user_id",
      viewRule: "@request.auth.id = user_id",
      createRule: "@request.auth.id = user_id",
      updateRule: "@request.auth.id = user_id",
      deleteRule: "@request.auth.id = user_id",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "content",
          type: "text",
        },
        {
          name: "user_id",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: "_pb_users_auth_",
        },
        {
          name: "created",
          type: "autodate",
          onCreate: true,
          onUpdate: false,
        },
        {
          name: "updated",
          type: "autodate",
          onCreate: true,
          onUpdate: true,
        },
      ],
    });
    app.save(notes);

    const users = app.findCollectionByNameOrId("users");
    users.fields.add(
      new TextField({
        name: "name",
      }),
    );
    app.save(users);
  },
  (app) => {
    const collectionNames = ["notes"];

    for (const name of collectionNames) {
      try {
        const collection = app.findCollectionByNameOrId(name);
        app.delete(collection);
      } catch {
        // ignore missing collection
      }
    }

    try {
      const users = app.findCollectionByNameOrId("users");
      users.fields.removeByName("name");
      app.save(users);
    } catch {
      // ignore if users collection missing
    }
  },
);
