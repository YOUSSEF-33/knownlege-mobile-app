import React from "react";
import useUser from "@/hooks/auth/useUser";
import { Tabs } from "expo-router";
import { View, Image, StyleSheet } from "react-native";
import useNotifications from "@/hooks/auth/useNotifications"; // Import the custom hook
import { colors } from "../theme";

export default function TabsLayout() {
  const { user } = useUser();
  const hasUnread = useNotifications();

  return (
    <Tabs
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ color }) => {
            let iconName;
            if (route.name === "index") {
              iconName = require("@/assets/icons/HouseSimple.png");
            } else if (route.name === "search/index") {
              iconName = require("@/assets/icons/news.png");
            } else if (route.name === "courses/index") {
              iconName = require("@/assets/icons/BookBookmark.png");
            } else if (route.name === "profile/index") {
              iconName = require("@/assets/icons/User.png");
            }
            return (
              <View style={styles.iconContainer}>
                <Image
                  style={{ width: 25, height: 25, tintColor: color }}
                  source={iconName}
                />
                {route.name === "search/index" && hasUnread && (
                  <View style={styles.redDot} />
                )}
              </View>
            );
          },
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar, // Use tabBarStyle to set the background color
        };
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search/index" />
      <Tabs.Screen name="courses/index" />
      <Tabs.Screen name="profile/index" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    position: "absolute",
    top: 0,
    right: 0,
  },
  tabBar: {
    backgroundColor: colors.bg_color,
  },
});
