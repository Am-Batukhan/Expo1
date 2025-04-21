// components/Notes/AddNote.js
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

export default function AddNote() {
  return <NoteInput />;
}

export function NoteInput() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Lấy danh mục từ database
  const fetchCategories = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM categories");
      setCategories(result);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addNote = async () => {
    if (!title.trim() || !note.trim()) {
      Alert.alert("Title and note cannot be empty.");
      return;
    }
    const dateString = new Date().toISOString();
    const date = dateString.slice(0, dateString.indexOf("T")).split("-").reverse().join("-");

    try {
      await db.runAsync(
        "INSERT INTO notesTable (date, title, note, priority, category) VALUES (?, ?, ?, ?, ?)",
        [date, title, note, priority, selectedCategory]
      );
      Alert.alert("Note Added");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding note:", error);
      Alert.alert("Error", "Could not add note");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Note Title"
      />
      <TextInput
        style={styles.textInput}
        multiline
        value={note}
        onChangeText={setNote}
        placeholder="Type your notes here..."
        textAlignVertical="top"
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Priority:</Text>
        <Picker
          selectedValue={priority}
          onValueChange={(itemValue) => setPriority(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Low" value="Low" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="High" value="High" />
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Category:</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="No Category" value={null} />
          {categories.map((category) => (
            <Picker.Item key={category.id} label={category.name} value={category.name} />
          ))}
        </Picker>
      </View>
      <Button title="ADD NOTE" onPress={addNote} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  titleInput: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  textInput: {
    flex: 1,
    padding: 20,
    fontSize: 16,
    textAlignVertical: "top",
  },
  pickerContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  label: { fontSize: 16, marginBottom: 4, fontWeight: "500" },
  picker: { backgroundColor: "#eee", borderRadius: 10 },
});
