// CalendarScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, ImageBackground } from "react-native";
import { Calendar } from "react-native-calendars";
import { useSQLiteContext } from "expo-sqlite";

export default function CalendarScreen() {
  const db = useSQLiteContext();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM notesTable WHERE reminder IS NOT NULL");
      const formatted = result.map(note => ({
        ...note,
        date: note.reminder.split("T")[0], // ISO to YYYY-MM-DD
      }));
      setEvents(formatted);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleDayPress = (day) => {
    const dayEvents = events.filter(event => event.date === day.dateString);
    if (dayEvents.length > 0) {
      Alert.alert(
        "Ghi chú ngày " + day.dateString,
        dayEvents.map(event => `• ${event.title}`).join("\n")
      );
    } else {
      Alert.alert("Không có ghi chú", "Không có ghi chú trong ngày này.");
    }
  };

  const getMarkedDates = () => {
    const marked = {};
    events.forEach(event => {
      if (!marked[event.date]) {
        marked[event.date] = {
          marked: true,
          dots: [{ color: "blue" }],
        };
      } else {
        marked[event.date].dots.push({ color: "blue" });
      }
    });
    return marked;
  };

  return (
<ImageBackground
  source={require('../../assets/bg.jpg')}
  style={styles.background}
  resizeMode="cover"
>
  <View style={styles.overlay}>
    <Calendar
      markedDates={getMarkedDates()}
      onDayPress={handleDayPress}
      markingType="multi-dot"
    />
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.header}>Ghi chú sắp tới</Text>
      {events.length === 0 ? (
        <Text style={styles.noEventsText}>Không có ghi chú để hiển thị.</Text>
      ) : (
        events.map((event, index) => (
          <View key={index} style={styles.eventContainer}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>🗓 {event.date}</Text>
          </View>
        ))
      )}
    </ScrollView>
  </View>
</ImageBackground>

  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-start',
  },

  overlay: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional: white semi-transparent overlay
  },

  scrollContainer: {
    marginTop: 20,
  },

  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  noEventsText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
  },
  eventContainer: {
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  eventDate: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
});
