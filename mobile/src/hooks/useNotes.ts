import { Q } from "@nozbe/watermelondb";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { getPocketBase } from "@/api/pocketbase";
import { upsertRecord, deleteRecordByServerId } from "@/db/sync";

export const useNotes = () => {
  const database = useDatabase();
  const { user } = useAuth();

  const notes = useMemo(() => {
    if (!user) return [];
    return database
      .get("notes")
      .query(Q.where("user_id", user.id))
      .fetch();
  }, [database, user]);

  const createNote = async (title: string, content: string | null) => {
    const pb = await getPocketBase();
    if (!pb || !user) throw new Error("Not authenticated");

    const record = await pb.collection("notes").create({
      title,
      content,
      user_id: user.id,
    });

    await upsertRecord(database, "notes", record);
  };

  const updateNote = async (serverId: string, title: string, content: string | null) => {
    const pb = await getPocketBase();
    if (!pb) throw new Error("Not authenticated");

    const record = await pb.collection("notes").update(serverId, {
      title,
      content,
    });

    await upsertRecord(database, "notes", record);
  };

  const deleteNote = async (serverId: string) => {
    const pb = await getPocketBase();
    if (!pb) throw new Error("Not authenticated");

    await pb.collection("notes").delete(serverId);
    await deleteRecordByServerId(database, "notes", serverId);
  };

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
  };
};
