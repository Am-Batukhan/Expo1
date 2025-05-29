import React, { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  BackHandler,
  Alert,
  Platform
} from "react-native";

const HomeScreen = ({ navigation }) => {
  const confirmExit = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn thoát ứng dụng?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Thoát",
          onPress: () => {
            if (Platform.OS === "android") {
              BackHandler.exitApp();
            }
          }
        }
      ],
      { cancelable: true }
    );
  };
  return (
    <ImageBackground 
      source={require('../../assets/bg.jpg')}
      style={styles.background}
    >
      <View style={styles.centeredContainer}>
        <TouchableOpacity
          style={styles.notesButton}
          onPress={() => navigation.navigate("CalendarScreen")}
        >
          <Text style={styles.notesButtonText}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notesButton}
          onPress={() => navigation.navigate("NotesScreen")}
        >
          <Text style={styles.notesButtonText}>Danh sách công việc</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completedButton}
          onPress={() => navigation.navigate("CompleteTaskScreen")}
        >
          <Text style={styles.completedButtonText}>Công việc đã hoàn thành</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completedButton}
          onPress={() => navigation.navigate("Report")}
        >
          <Text style={styles.completedButtonText}>Xem báo cáo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exitButton}
          onPress={confirmExit}
        >
          <Text style={styles.exitButtonText}>Exit</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'flex-start',
  },

  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",  
  },
  notesButton: {
    width: "70%",  
    padding: 15,
    backgroundColor: "#4B5563",
    borderColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 20,
    marginVertical: 10,  
    justifyContent: "center",  
    alignItems: "center",  
  },
  notesButtonText: {
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "bold",
  },
  completedButton: {
    width: "70%",  
    padding: 15,
    backgroundColor: "#4B5563",
    borderColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 20,
    marginVertical: 10,  
    justifyContent: "center",  
    alignItems: "center",  
  },
  completedButtonText: {
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "bold",
  },
  exitButton: {
    width: "70%", 
    padding: 15,
    backgroundColor: "#4B5563",
    borderColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 20,
    marginVertical: 10,  
    justifyContent: "center",  
    alignItems: "center",  
  },
  exitButtonText: {
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default HomeScreen;