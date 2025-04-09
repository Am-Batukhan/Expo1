import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
} from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

export default function ViewNote({ route }) {
  const { id } = route.params;
  return (
    <SQLiteProvider databaseName="SDK52Test.db">
      <EditNote id={id} />
    </SQLiteProvider>
  );
}

export function EditNote({ id }) {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState("Medium");

  useEffect(() => {
    fetchNote();
  }, []);

  const fetchNote = async () => {
    try {
      const result = await db.getFirstAsync(
        "SELECT title, note, priority FROM notesTable WHERE id = ?",
        [id]
      );
      if (result) {
        setTitle(result.title || "");
        setNote(result.note || "");
        setPriority(result.priority || "Medium");
      }
    } catch (error) {
      console.error("Unable to fetch note: ", error);
    }
  };

  const updateNote = async () => {
    await db.runAsync(
      "UPDATE notesTable SET title = ?, note = ?, priority = ? WHERE id = ?",
      [title, note, priority, id]
    );
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
      <Button title="UPDATE NOTE" onPress={updateNote} />
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
