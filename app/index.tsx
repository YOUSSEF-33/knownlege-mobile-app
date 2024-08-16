import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import useUser from "@/hooks/auth/useUser";
import useTokenRefresh from "@/hooks/auth/refreshToken";
import Loader from "@/components/loader/loader";
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerForPushNotificationsAsync } from "@/utils/apiServises";
import axiosInstance from "@/utils/apiServises";

export default function TabsIndex() {
  useTokenRefresh();
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    const setupNotifications = async () => {
      if (user) {
        const token = await registerForPushNotificationsAsync();
        console.log('Device push token:', token);

        // Optionally send the token to your backend to register this device for notifications
        if (token) {
          await sendTokenToBackend(token);
        }

        // Handle incoming notifications
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification Received:', notification);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification Interaction:', response);
          // Handle the notification response, e.g., navigating to a specific screen
        });

        return () => {
          Notifications.removeNotificationSubscription(notificationListener);
          Notifications.removeNotificationSubscription(responseListener);
        };
      }
    };

    if (!loading) {
      if (user) {
        setupNotifications();
        router.replace("/(tabs)");
      } else {
        router.replace("/(routes)/onboarding");
      }
    }
  }, [loading, user, router]);

  if (loading) {
    // Render a loader or nothing while loading
    return <Loader />;
  }

  return null; // Render nothing while handling the redirection in useEffect
}

const sendTokenToBackend = async (token:any) => {
  // Implement the logic to send the token to your backend server
  try {
    await axiosInstance.post('/v1/notifications/register', {
      token: token,
      platform: Platform.OS,
    });
    console.log('Token sent to backend');
  } catch (error) {
    console.error('Error sending token to backend:', error);
  }
};
