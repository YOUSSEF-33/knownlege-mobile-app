import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance, { fetchUser } from "@/utils/apiServises";
import { router } from "expo-router";

export default function useUser() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | undefined>();
  const [error, setError] = useState("");

  const fetchUserData = useCallback(async (token: string | null) => {
    if (!token) {
      throw new Error("No access token available");
    }
    return await fetchUser(token);
  }, []);

  const handleLogout = useCallback(async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    setUser(undefined);
    router.replace("/login");
  }, []);

  const refetchUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      const userData = await fetchUserData(accessToken);

      console.log("User data retrieved:", userData);
      console.log("access token:", accessToken);
      console.log("refresh :", refreshToken);
      if (userData?.should_reset_password) {
        router.replace("/(routes)/verifyAccount");
      } else {
        setUser(userData);
      }
    } catch (err: any) {
      console.error("Error in useUser:", err.message);
      setError(err.message);
      //await handleLogout();
    } finally {
      setLoading(false);
    }
  }, [fetchUserData, handleLogout]);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  return { loading, user, error, refetchUser, handleLogout };
}
