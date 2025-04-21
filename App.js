//App
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SQLiteProvider } from "expo-sqlite";
import { createDrawerNavigator } from "@react-navigation/drawer";

// Import các màn hình
import HomeScreen from "./components/HomeScreen";
import Notes from "./components/Notes/NotesScreen";
import AddNote from "./components/Notes/AddNote";
import ViewNote from "./components/Notes/ViewNote";
import CategoryScreen from "./components/Category/CategoryScreen";
import CompleteTaskScreen from "./components/Notes/CompleteTaskScreen";

// Khởi tạo stack navigator
const Stack = createNativeStackNavigator();

const Drawer = createDrawerNavigator();

//Drawer Navigator for QR Code Screens
function QRCodeDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="QRCodeScanner"
      screenOptions={{
        drawerStyle: { backgroundColor: "white", width: 240 },
        drawerLabelStyle: { fontSize: 16 },
        drawerActiveBackgroundColor: "black",
        drawerActiveTintColor: "white",
        headerShown: true,
      }}
    >
      <Drawer.Screen name="Scan Code" component={QRCodeScanner} />
      <Drawer.Screen name="Scan Image" component={ScanImage} />
      {/* <Drawer.Screen name="ScanResult" component={ScanResult}/> */}
      <Drawer.Screen name="History" component={History} />
      <Drawer.Screen name="Create QR Code" component={QRCodeGenerator} />
    </Drawer.Navigator>
  );
}

// Hàm khởi tạo cơ sở dữ liệu
const initializeDB = async (db) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS notesTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        note TEXT NOT NULL,
        priority TEXT,
        category TEXT,
        completed INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT '#6200ee'
      );
    `);
    console.log("DB initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

export default function App() {
  return (
    <SQLiteProvider databaseName="SDK52Test.db" onInit={initializeDB}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="NotesScreen" component={Notes} />
          <Stack.Screen name="AddNote" component={AddNote} />
          <Stack.Screen name="ViewNote" component={ViewNote} />
          <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
          <Stack.Screen name="CompleteTaskScreen" component={CompleteTaskScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}


