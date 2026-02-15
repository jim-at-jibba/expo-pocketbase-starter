import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useNotes } from "@/hooks/useNotes";
import { Button } from "@/components/Button";
import { DefaultText } from "@/components/DefaultText";
import { Header } from "@/components/Navigation/Header";
import Note from "@/db/models/Note";

export default function NotesList() {
  const { notes, createNote, deleteNote } = useNotes();
  const [notesList, setNotesList] = useState<Note[]>([]);

  useEffect(() => {
    notes.then(setNotesList);
  }, [notes]);

  const handleCreateNote = async () => {
    await createNote("New Note", "");
    router.push("/(tabs)/notes/new");
  };

  const handleDeleteNote = async (serverId: string) => {
    await deleteNote(serverId);
  };

  const renderItem = ({ item }: { item: Note }) => (
    <Pressable
      style={styles.noteItem}
      onPress={() => router.push(`/notes/${item.serverId}`)}
    >
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        {item.content && (
          <Text style={styles.notePreview} numberOfLines={2}>
            {item.content}
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.outerContainer}>
      <Header title="Notes" />
      <View style={styles.container}>
        <Button label="Create Note" onPress={handleCreateNote} />

        {notesList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <DefaultText text="No notes yet. Create your first note!" />
          </View>
        ) : (
          <FlatList
            data={notesList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
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
  listContent: {
    paddingTop: theme.spacing[3],
  },
  noteItem: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[2],
    borderRadius: theme.borderRadiusSm,
  },
  noteContent: {
    gap: theme.spacing[1],
  },
  noteTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: theme.colors.typography,
  },
  notePreview: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.greyDark,
  },
  emptyContainer: {
    marginTop: theme.spacing[5],
    alignItems: "center",
  },
}));
