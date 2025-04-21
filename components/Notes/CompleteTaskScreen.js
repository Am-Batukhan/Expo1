//CompleteTaskScreen
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function CompleteTaskScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [completedNotes, setCompletedNotes] = useState([]);

  // Hàm callback khi xóa ghi chú
  const onNoteDeleted = (noteId) => {
    console.log(`Note with ID ${noteId} has been deleted.`);
  };

  // Điều hướng tới màn hình chi tiết ghi chú
  const viewNote = (id) => navigation.navigate("ViewNote", { id });

  // Fetch các ghi chú đã hoàn thành từ cơ sở dữ liệu
  const fetchCompletedNotes = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM notesTable WHERE completed = 1 ORDER BY date DESC");
      const validNotes = result.filter(note => note && note.title);
      setCompletedNotes(validNotes);
    } catch (error) {
      console.error("Error fetching completed notes:", error);
      Alert.alert("Error", "Could not fetch completed notes.");
    }
  };

  useEffect(() => {
    fetchCompletedNotes();
  }, []);

  // Cập nhật trạng thái 'Completed' thành 'Not Completed'
  const undoComplete = async (noteId) => {
    try {
      await db.runAsync("UPDATE notesTable SET completed = 0 WHERE id = ?", [noteId]);

      setCompletedNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));

      Alert.alert("Success", "Note marked as not completed.");
    } catch (error) {
      console.error("Error undoing completion:", error);
      Alert.alert("Error", "Could not undo completion.");
    }
  };

  // Xác nhận xóa ghi chú
  const confirmDelete = (noteId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await db.runAsync("DELETE FROM notesTable WHERE id = ?", [noteId]);

              // Cập nhật lại danh sách ghi chú
              setCompletedNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));

              // Gọi callback sau khi xóa
              onNoteDeleted(noteId);

              Alert.alert("Success", "Note deleted successfully.");
            } catch (error) {
              console.error("Error deleting note:", error);
              Alert.alert("Error", "Could not delete the note.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderCompletedNote = ({ item }) => {
    if (!item || !item.title) return null;

    const priorityColor = {
      High: "#ff4d4d",
      Medium: "#ffa500",
      Low: "#4caf50",
    }[item.priority] || "#4caf50";

    return (
      <TouchableOpacity style={styles.noteCard} onPress={() => viewNote(item.id)}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteDate}>{item.date}</Text>
          <View style={styles.noteMeta}>
            {item.category && <Text style={styles.noteCategory}>{item.category}</Text>}
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>{item.priority || "Low"}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.noteTitle} numberOfLines={1}>{item.title || "Untitled Note"}</Text>
        <Text style={styles.notePreview} numberOfLines={2}>{item.note?.replace(/\n/g, " ") || "No preview available"}</Text>

        <View style={styles.completionSection}>
          <View style={styles.completionButton}>
            <Ionicons name="checkmark-circle" size={24} color="green" />
            <Text style={styles.completionText}>Completed</Text>
          </View>

          {/* Nút Khôi phục (Undo) */}
          <TouchableOpacity style={styles.undoButton} onPress={() => undoComplete(item.id)}>
            <Ionicons name="arrow-undo" size={32} color="blue" />
            <Text style={styles.undoText}>Undo Complete</Text>
          </TouchableOpacity>

          {/* Nút xóa ghi chú */}
          <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.id)}>
            <Ionicons name="trash-outline" size={22} color="red" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={completedNotes}
        renderItem={renderCompletedNote}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  noteCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  noteHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  noteDate: { fontSize: 12, color: "#666", fontStyle: "italic" },
  noteMeta: { flexDirection: "row", alignItems: "center" },
  noteCategory: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    marginRight: 8,
    color: "#333",
  },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  priorityText: { color: "white", fontSize: 12, fontWeight: "bold" },
  notePreview: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  completionSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  completionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  completionText: {
    marginLeft: 6,
    fontSize: 14,
    color: "green",
  },
  undoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 10,
  },
  undoText: {
    fontSize: 12,
    color: "blue",
  },
  deleteButton: {
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 80,
  },
});
