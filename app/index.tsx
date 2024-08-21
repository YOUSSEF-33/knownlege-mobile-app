import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import useUser from "@/hooks/auth/useUser";
import useTokenRefresh from "@/hooks/auth/refreshToken";
import Loader from "@/components/loader/loader";
import { registerForPushNotificationsAsync } from "@/utils/notifications";

export default function TabsIndex() {
  useTokenRefresh();
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    const initializeApp = async () => {
      if (!loading) {
        if (user) {
          // Register the device for push notifications after login
          await registerForPushNotificationsAsync();
          router.replace("/(tabs)");
        } else {
          router.replace("/(routes)/onboarding");
        }
      }
    };

    initializeApp();
  }, [loading, user, router]);

  if (loading) {
    // Render a loader or nothing while loading
    return <Loader />;
  }

  return null; // Render nothing while handling the redirection in useEffect
}
