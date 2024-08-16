import { useState, useEffect } from "react";
import axiosInstance from "@/utils/apiServises";

export default function useNotifications() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("v1/student/announcements");
        const notifications = response.data.data.items;
        const unread = notifications.some((notification:any) => !notification.is_read);
        setHasUnread(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  return hasUnread;
}
