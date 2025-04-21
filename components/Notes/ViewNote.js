//ViewNote
import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, ActivityIndicator
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";

function ViewNote() {
  const db = useSQLiteContext();
  const route = useRoute();
  const navigation = useNavigation();

  // ✅ Gán mặc định nếu không có
  const { id, onNoteDeleted = () => {} } = route.params;

  const [note, setNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedPriority, setEditedPriority] = useState("Low");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchNote();
    fetchCategories();
  }, []);

  const fetchNote = async () => {
    try {
      const result = await db.getFirstAsync("SELECT * FROM notesTable WHERE id = ?", [id]);

      // ✅ Nếu không tìm thấy note
      if (!result) {
        Alert.alert("Note not found", "This note may have been deleted.");
        navigation.goBack();
        return;
      }

      setNote(result);
      setEditedTitle(result.title);
      setEditedContent(result.note);
      setEditedCategory(result.category);
      setEditedPriority(result.priority || "Low");
    } catch (error) {
      console.error("Error fetching note:", error);
      Alert.alert("Error", "Could not load note");
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await db.getAllAsync("SELECT name FROM categories");
      setCategories(result.map((item) => item.name));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const updateNote = async () => {
    try {
      await db.runAsync(
        "UPDATE notesTable SET title = ?, note = ?, category = ?, priority = ? WHERE id = ?",
        [editedTitle, editedContent, editedCategory, editedPriority, id]
      );
      setIsEditing(false);
      fetchNote();
      Alert.alert("Success", "Note updated successfully");
    } catch (error) {
      console.error("Error updating note:", error);
      Alert.alert("Error", "Could not update note");
    }
  };

  const deleteNote = async () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await db.runAsync("DELETE FROM notesTable WHERE id = ?", [id]);
            onNoteDeleted(id); // ✅ an toàn vì luôn có mặc định
            navigation.goBack();
            Alert.alert("Success", "Note deleted successfully");
          } catch (error) {
            console.error("Error deleting note:", error);
            Alert.alert("Error", "Could not delete note");
          }
        },
      },
    ]);
  };

  // ✅ Tránh lỗi khi note chưa có
  if (!note) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading note...</Text>
      </View>
    );
  }

  const priorityColor = {
    High: "#ff4d4d",
    Medium: "#ffa500",
    Low: "#4caf50",
  }[note.priority] || "#4caf50";

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header: Back + Delete */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={32} color="#6200ee" />
          </TouchableOpacity>

          {!isEditing && (
            <TouchableOpacity onPress={deleteNote}>
              <Ionicons name="trash-outline" size={32} color="red" />
            </TouchableOpacity>
          )}
        </View>

        {/* Meta info */}
        <View style={styles.metaContainer}>
          <Text style={styles.dateText}>{note.date}</Text>
          <View style={styles.tagsContainer}>
            {note.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{note.category}</Text>
              </View>
            )}
            <View style={[styles.priorityTag, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>{note.priority || "Low"}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        {isEditing ? (
          <>
            <TextInput
              style={styles.editTitle}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Note title"
            />
            <TextInput
              style={styles.editContent}
              multiline
              value={editedContent}
              onChangeText={setEditedContent}
              placeholder="Note content"
            />

            {/* Category Picker */}
            <Text style={styles.label}>Category:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={editedCategory}
                onValueChange={(value) => setEditedCategory(value)}
              >
                <Picker.Item label="No Category" value={null} />
                {categories.map((cat) => (
                  <Picker.Item label={cat} value={cat} key={cat} />
                ))}
              </Picker>
            </View>

            {/* Priority Picker */}
            <Text style={styles.label}>Priority:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={editedPriority}
                onValueChange={(value) => setEditedPriority(value)}
              >
                <Picker.Item label="Low" value="Low" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="High" value="High" />
              </Picker>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>{note.title}</Text>
            <Text style={styles.content}>{note.note}</Text>
          </>
        )}
      </ScrollView>

      {/* Nút Edit */}
      {!isEditing && (
        <TouchableOpacity
          style={[styles.floatingButton, styles.editButton]}
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="create-outline" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Nút Save */}
      {isEditing && (
        <TouchableOpacity
          style={[styles.floatingButton, styles.saveButton]}
          onPress={updateNote}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      )}

      {/* Nút Cancel */}
      {isEditing && (
        <TouchableOpacity
          style={[styles.floatingButton, styles.cancelButton]}
          onPress={() => setIsEditing(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    zIndex: 2,
    elevation: 2,
  },
  editButton: {
    right: 20,
    backgroundColor: "#6200ee",
  },
  saveButton: {
    right: 20,
    backgroundColor: "#6200ee",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    left: 20,
    backgroundColor: "#e0e0e0",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  tagsContainer: {
    flexDirection: "row",
  },
  categoryTag: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: "#333",
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  editTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    color: "#333",
  },
  editContent: {
    fontSize: 16,
    lineHeight: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    minHeight: 200,
    color: "#444",
    textAlignVertical: "top",
  },
  label: {
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
});

export default ViewNote;
