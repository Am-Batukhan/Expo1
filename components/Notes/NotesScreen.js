//NotesScreen
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";

export default function Notes() {
  return <NoteList />;
}

function NoteList() {
  const db = useSQLiteContext();
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // Hàm lấy tất cả ghi chú với các bộ lọc
  const fetchNotes = async () => {
    const filters = [];
    const params = [];

    let query = "SELECT * FROM notesTable WHERE completed = 0";

    if (selectedCategory) {
      filters.push("category = ?");
      params.push(selectedCategory);
    }

    if (selectedPriority) {
      filters.push("priority = ?");
      params.push(selectedPriority);
    }

    

    if (searchQuery.trim()) {
      filters.push("(title LIKE ? OR note LIKE ?)");
      params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    if (filters.length > 0) {
      query += " AND " + filters.join(" AND ");
    }

    query += " ORDER BY date DESC";

    try {
      const result = await db.getAllAsync(query, params);
      setNotes(result);
    } catch (error) {
      console.error("Error fetching notes:", error);
      Alert.alert("Error", "Could not fetch notes");
    }
  };

  // Hàm lấy danh mục
  const fetchCategories = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM categories ORDER BY name");
      setCategories(result);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Hook useEffect để tải dữ liệu khi màn hình được focus
  useEffect(() => {
    if (isFocused) {
      fetchNotes();
      fetchCategories();
    }
  }, [isFocused, selectedCategory, selectedPriority, searchQuery]);

  // Hàm toggle trạng thái hoàn thành của ghi chú
  const toggleCompletion = async (id, currentStatus) => {
    try {
      // Cập nhật trạng thái hoàn thành của ghi chú
      await db.runAsync("UPDATE notesTable SET completed = ? WHERE id = ?", [!currentStatus, id]);
      
      // Tải lại ghi chú mà không điều hướng
      fetchNotes();
    } catch (error) {
      console.error("Error updating note completion:", error);
      Alert.alert("Error", "Could not update note status");
    }
  };

  // Điều hướng tới màn hình chi tiết ghi chú
  const viewNote = (id) => navigation.navigate("ViewNote", { id });

  // Xóa ghi chú
  const deleteNote = async (id) => {
    try {
      await db.runAsync("DELETE FROM notesTable WHERE id = ?", [id]);
      fetchNotes();
      Alert.alert("Success", "Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      Alert.alert("Error", "Could not delete note");
    }
  };

  // Xác nhận xóa ghi chú
  const confirmDelete = (id) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteNote(id) },
    ]);
  };

  // Render từng item trong danh sách ghi chú
  const renderNoteItem = ({ item }) => {
    const priorityColor = {
      High: "#ff4d4d",
      Medium: "#ffa500",
      Low: "#4caf50",
    }[item.priority] || "#4caf50";
  
    return (
      <TouchableOpacity 
        style={styles.noteCard} 
        onPress={() => viewNote(item.id)}
      >
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
        <Text style={styles.notePreview} numberOfLines={2}>{item.note.replace(/\n/g, " ")}</Text>
  
        <View style={styles.completionSection}>
          <TouchableOpacity
            onPress={() => toggleCompletion(item.id, item.completed)}  // chỉ gọi toggleCompletion mà không có navigation
            style={styles.completionButton}
          >
            <Ionicons
              name={item.completed ? "checkmark-circle" : "checkmark-circle-outline"}
              size={32}
              color={item.completed ? "green" : "#ccc"}
            />
            <Text style={styles.completionText}>
              {item.completed ? "Completed" : "Mark as Completed"}
            </Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={22} color="red" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Hàm refresh lại các bộ lọc
  const handleRefresh = () => {
    setSelectedCategory(null);
    setSelectedPriority(null);
    
    setSearchQuery("");
    fetchNotes();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterSection}>
        <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory} style={styles.picker}>
          <Picker.Item label="All Categories" value={null} />
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
          ))}
        </Picker>

        <Picker selectedValue={selectedPriority} onValueChange={setSelectedPriority} style={styles.picker}>
          <Picker.Item label="All Priorities" value={null} />
          <Picker.Item label="High" value="High" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="Low" value="Low" />
        </Picker>

        
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Ionicons name="refresh-outline" size={25} color="#007AFF" />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>

      {notes.length > 0 ? (
        <FlatList
          data={notes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No notes found</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.categoriesButton]}
          onPress={() => navigation.navigate("CategoryScreen")}
        >
          <Ionicons name="list-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => navigation.navigate("AddNote")}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>

        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 16 },
  filterSection: {
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { height: 50, color: "#333" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 45, color: "#333" },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  refreshText: { marginLeft: 6, color: "#007AFF", fontSize: 14, fontWeight: "500" },
  listContent: { paddingBottom: 80 },
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
  noteTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4, color: "#333" },
  notePreview: { fontSize: 14, color: "#666", lineHeight: 20 },
  deleteButton: { position: "absolute", right: 10, bottom: 10 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: "#999" },
  actionButtons: {
  flexDirection: "row", // hoặc 'row' nếu muốn nằm ngang
  position: "absolute",
  bottom: 20,
  right: 16,
  gap: 12, // khoảng cách giữa các nút
},
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoriesButton: { backgroundColor: "#4caf50" },
  addButton: { backgroundColor: "#007AFF" },
  completionSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  completionButton: { flexDirection: "row", alignItems: "center" },
  completionText: { marginLeft: 6, color: "#333" },
});
