import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useNotes } from "@/hooks/useNotes";
import { Button } from "@/components/Button";
import { Header } from "@/components/Navigation/Header";
import Note from "@/db/models/Note";
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@/contexts/DatabaseContext";

export default function NoteDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { updateNote } = useNotes();
  const database = useDatabase();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      database
        .get("notes")
        .query(Q.where("server_id", id))
        .fetch()
        .then(([n]) => setNote(n));
    } else {
      setTitle("");
      setContent("");
    }
  }, [id, database]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
    }
  }, [note]);

  const handleSave = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await updateNote(id, title, content || null);
      router.back();
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this note?")) return;
    setLoading(true);
    try {
      await updateNote.deleteNote(id);
      router.back();
    } catch (error) {
      console.error("Failed to delete note:", error);
    } finally {
      setLoading(false);
    }
  };

  const isNewNote = id === "new";

  return (
    <View style={styles.outerContainer}>
      <Header title={isNewNote ? "New Note" : "Edit Note"} showBack />
      <ScrollView style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Content"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />
        <View style={styles.buttonContainer}>
          {!isNewNote && (
            <Button
              label="Delete"
              onPress={handleDelete}
              variant="secondary"
              disabled={loading}
            />
          )}
          <Button
            label={loading ? "Saving..." : "Save"}
            onPress={handleSave}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing[4],
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.greyLight,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[3],
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing[3],
    color: theme.colors.typography,
  },
  textArea: {
    height: 200,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: theme.spacing[3],
    marginTop: theme.spacing[2],
  },
}));
