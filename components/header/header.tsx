import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, FlatList } from "react-native";
import { Raleway_700Bold, Raleway_600SemiBold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_600SemiBold } from "@expo-google-fonts/nunito";
import { useFonts } from "expo-font";
import useUser from "@/hooks/auth/useUser";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import axiosInstance from "@/utils/apiServises";

interface Notification {
  id: number;
  title: string;
  content: string;
  is_read: number;
}

export default function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  const { user } = useUser();

  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Raleway_600SemiBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

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
    setModalVisible(false);
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
      style={[styles.notificationItem, item.is_read && styles.notificationRead]}
      onPress={() => handleNotificationPress(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        {!item.is_read && <Text style={styles.newTag}>New</Text>}
      </View>
      <Text style={styles.notificationText}>{item.content}</Text>
      <Text style={styles.notificationDate}>
        {new Date(lastUpdateTime).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <Image
            source={
              user?.profile_image?.url
                ? { uri: user.profile_image.url }
                : require("@/assets/icons/User.png")
            }
            style={styles.image}
          />
        </TouchableOpacity>
        <View>
          <Text style={[styles.helloText, { fontFamily: "Raleway_600SemiBold" }]}>
            Hello,
          </Text>
          <Text style={[styles.text, { fontFamily: "Raleway_700Bold" }]}>
            {user?.first_name}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bellButton}
        onPress={() => {
          router.push(`/(tabs)/search`)
        }}
      >
        <View>
          <Feather name="bell" size={26} color={"black"} />
          {notifications.filter((notification) => !notification.is_read).length > 0 && (
            <View style={styles.bellContainer}>
              <Text style={styles.bellText}>
                {notifications.filter((notification) => !notification.is_read).length}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
    width: "90%",
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 45,
    height: 45,
    marginRight: 8,
    borderRadius: 100,
  },
  text: {
    fontSize: 16,
  },
  bellButton: {
    borderWidth: 1,
    borderColor: "#E1E2E5",
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  bellContainer: {
    width: 20,
    height: 20,
    backgroundColor: "#2467EC",
    position: "absolute",
    borderRadius: 50,
    right: -5,
    top: -5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bellText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
  },
  helloText: {
    color: "#7C7C80",
    fontSize: 14,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: "Raleway_700Bold",
  },
  notificationList: {
    width: '100%',
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
  },
  notificationRead: {
    backgroundColor: '#f0f0f0',
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: "Raleway_600SemiBold",
  },
  newTag: {
    backgroundColor: "#3498db",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
  },
  notificationText: {
    fontSize: 14,
    marginTop: 5,
    fontFamily: "Nunito_400Regular",
  },
  notificationDate: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 5,
    fontFamily: "Nunito_400Regular",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2467EC',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: "Raleway_600SemiBold",
  },
});