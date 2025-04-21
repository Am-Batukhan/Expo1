import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, BackHandler } from "react-native";

function HomeScreen({ navigation }) {
  useEffect(() => {
    const backAction = () => {
      // Khi nhấn nút back từ HomeScreen, ngừng hành động mặc định
      return true;  // Ngừng hành động quay lại mặc định
    };

    // Áp dụng backAction khi ở HomeScreen
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    // Dọn dẹp sự kiện khi không còn ở màn hình này
    return () => {
      backHandler.remove();
    };
  }, []);

  const confirmExit = () => {
    Alert.alert(
      "Exit App",
      "Are you sure you want to exit?",
      [
        {
          text: "Cancel",
          onPress: () => null,  // Do nothing when cancel is pressed
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => BackHandler.exitApp(),  // Exit the app
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.centeredContainer}>
      <TouchableOpacity
        style={styles.notesButton}
        onPress={() => navigation.navigate("NotesScreen")}
      >
        <Text style={styles.notesButtonText}>Notes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.completedButton}
        onPress={() => navigation.navigate("CompleteTaskScreen")}
      >
        <Text style={styles.completedButtonText}>Completed Tasks</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.exitButton}
        onPress={confirmExit}  // Hiển thị thông báo xác nhận khi nhấn Exit
      >
        <Text style={styles.exitButtonText}>Exit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notesButton: {
    width: "80%",
    padding: 15,
    backgroundColor: "#99FF99",
    borderColor: "#6200ee",
    borderWidth: 3,
    borderRadius: 20,
    marginVertical: 15,
  },
  notesButtonText: {
    textAlign: "center",
    color: "#6200ee",
    fontWeight: "bold",
  },
  completedButton: {
    width: "80%",
    padding: 15,
    backgroundColor: "#66FFFF",
    borderColor: "red",
    borderWidth: 3,
    borderRadius: 20,
    marginVertical: 15,
  },
  completedButtonText: {
    textAlign: "center",
    color: "red",
    fontWeight: "bold",
  },
  exitButton: {
    width: "80%",
    padding: 15,
    backgroundColor: "#FF6666",
    borderColor: "darkred",
    borderWidth: 3,
    borderRadius: 20,
    marginVertical: 15,
  },
  exitButtonText: {
    textAlign: "center",
    color: "darkred",
    fontWeight: "bold",
  },
});

export default HomeScreen;
