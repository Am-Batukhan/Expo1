import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import Notes from "./components/Notes/NotesScreen";
import AddNote from "./components/Notes/AddNote";
import ViewNote from "./components/Notes/ViewNote";
import { createDrawerNavigator } from "@react-navigation/drawer";
// import "expo-dev-client"

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

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <TouchableOpacity
        style={{
          width: "80%",
          padding: 5,
          borderColor: "red",
          borderWidth: 1,
          borderRadius: 15,
          marginVertical: 10,
        }}
      >
        <Text
          style={{ textAlign: "center", color: "red" }}
          onPress={() => navigation.navigate("NotesScreen")}
        >
          Notes
        </Text>
      </TouchableOpacity>

    </View>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NotesScreen" component={Notes} />
        <Stack.Screen name="AddNote" component={AddNote} />
        <Stack.Screen name="ViewNote" component={ViewNote} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
