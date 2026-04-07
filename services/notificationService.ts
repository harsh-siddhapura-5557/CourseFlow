import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  requestPermissions: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return false;
    }
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6366f1",
      });
    }
    return true;
  },

  scheduleBookmarkMilestone: async (count: number) => {
    if (count === 5) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Course Enthusiast! 🌟",
          body: "You've bookmarked 5 courses. Ready to start your learning journey?",
          data: { type: "bookmark_milestone" },
        },
        trigger: null, // Send immediately
      });
    }
  },

  scheduleInactivityReminder: async () => {
    // Clear existing inactivity notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Schedule new reminder for 24 hours later
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "We miss you! 📚",
        body: "Come back and continue your courses. Don't let your progress stop!",
        data: { type: "inactivity_reminder" },
      },
      trigger: {
        seconds: 24 * 60 * 60, // 24 hours
        repeats: false,
      },
    });
  },

  trackActivity: async () => {
    await AsyncStorage.setItem("last_activity", new Date().toISOString());
    await notificationService.scheduleInactivityReminder();
  }
};
