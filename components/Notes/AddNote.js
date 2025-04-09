import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
} from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const initializeDB = async (db) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS notesTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        note TEXT NOT NULL,
        priority TEXT
      );
    `);

    try {
      await db.execAsync(`ALTER TABLE notesTable ADD COLUMN priority TEXT;`);
    } catch (err) {}

    console.log("DB connected");
  } catch (error) {
    console.log("Error in connecting DB", error);
  }
};

export default function AddNote() {
  return (
    <SQLiteProvider databaseName="SDK52Test.db" onInit={initializeDB}>
      <NoteInput />
    </SQLiteProvider>
  );
}

export function NoteInput() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState("Medium");

  const addNote = async () => {
    if (!title.trim() || !note.trim()) {
      Alert.alert("Title and note cannot be empty.");
      return;
    }

    const dateString = new Date().toISOString();
    const date = dateString.slice(0, dateString.indexOf("T")).split("-").reverse().join("-");

    await db.runAsync(
      "INSERT INTO notesTable (date, title, note, priority) VALUES (?, ?, ?, ?)",
      [date, title, note, priority]
    );

    Alert.alert("Note Added");
    navigation.replace("NotesScreen");
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
      <Button title="ADD NOTE" onPress={addNote} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
  pickerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "500",
  },
  picker: {
    backgroundColor: "#eee",
    borderRadius: 10,
  },
});
