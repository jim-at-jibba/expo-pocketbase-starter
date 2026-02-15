import { Model } from "@nozbe/watermelondb";
import { date, field, text, writer } from "@nozbe/watermelondb/decorators";

export default class Note extends Model {
  static table = "notes";

  @text("server_id") serverId!: string;
  @text("title") title!: string;
  @text("content") content!: string | null;
  @field("user_id") userId!: string;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @writer async updateNote(newTitle: string, newContent: string | null) {
    await this.update((note) => {
      (note as Note).title = newTitle;
      (note as Note).content = newContent;
    });
  }
}
