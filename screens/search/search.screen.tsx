import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import axiosInstance from "@/utils/apiServises";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

interface GalleryItem {
  id: number;
  name: string;
  url: string;
  disk: string;
}

interface Notification {
  id: number;
  title: string;
  content: string;
  gallery: GalleryItem[];
  is_read: number;
}

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axiosInstance.get("v1/student/announcements");
      const sortedNotifications = response.data.data.items.sort(
        (a: Notification, b: Notification) => a.is_read - b.is_read
      );
      setNotifications(sortedNotifications);
      setLastUpdateTime(Date.now());
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const refreshInterval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [fetchNotifications]);

  const handleNotificationPress = async (notificationId: number) => {
    router.push(`/(routes)/announcement/${notificationId}`);
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: 1 }
          : notification
      ).sort((a, b) => a.is_read - b.is_read)
    );
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.is_read && styles.notificationRead
      ]}
      onPress={() => handleNotificationPress(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        {!item.is_read && <Text style={styles.newTag}>New</Text>}
      </View>
      <Text style={styles.notificationText}>
        {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
      </Text>
      <Text style={styles.notificationDate}>
        {new Date(lastUpdateTime).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#E5ECF9", "#F6F7F9"]}
      style={{ flex: 1, paddingTop: 30 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Notifications</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
          refreshing={false}
          onRefresh={fetchNotifications}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 30,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
  },
  notificationRead: {
    backgroundColor: "#fff",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  newTag: {
    backgroundColor: "#3498db",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 12,
  },
  notificationText: {
    fontSize: 14,
    marginTop: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 5,
  },
});