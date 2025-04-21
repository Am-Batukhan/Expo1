//AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Notes from "./components/Notes/NotesScreen";
import CompleteTaskScreen from "./components/Notes/CompleteTaskScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="NotesScreen" component={Notes} />
      <Stack.Screen name="CompleteTaskScreen" component={CompleteTaskScreen} />
    </Stack.Navigator>
  );
}
