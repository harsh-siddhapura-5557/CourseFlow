import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";

type NotificationsModule = typeof import("expo-notifications");

let cachedNotifications: NotificationsModule | null | undefined;

/**
 * Android Expo Go (SDK 53+) throws when loading expo-notifications.
 * iOS Expo Go may still support local notifications; dev builds support full API.
 */
function canAttemptNotificationsModule(): boolean {
  if (
    Platform.OS === "android" &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  ) {
    return false;
  }
  return true;
}

function getNotifications(): NotificationsModule | null {
  if (cachedNotifications !== undefined) {
    return cachedNotifications;
  }
  if (!canAttemptNotificationsModule()) {
    cachedNotifications = null;
    if (__DEV__) {
      console.warn(
        "[notifications] Skipped on Android Expo Go — use a development build for push/local notifications.",
      );
    }
    return null;
  }
  try {
    // Lazy require avoids crashing the bundle when the native module is unavailable.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications = require("expo-notifications") as NotificationsModule;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    cachedNotifications = Notifications;
    return Notifications;
  } catch (e) {
    cachedNotifications = null;
    if (__DEV__) {
      console.warn("[notifications] expo-notifications could not load:", e);
    }
    return null;
  }
}

async function scheduleInactivityReminderInternal(): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "We miss you! 📚",
        body: "Come back and continue your courses. Don't let your progress stop!",
        data: { type: "inactivity_reminder" },
      },
      trigger: {
        seconds: 24 * 60 * 60,
        repeats: false,
        type: "timeInterval",
      } as Parameters<
        NotificationsModule["scheduleNotificationAsync"]
      >[0]["trigger"],
    });
  } catch (error) {
    console.error("Failed to schedule inactivity reminder:", error);
  }
}

export const notificationService = {
  requestPermissions: async (): Promise<boolean> => {
    const Notifications = getNotifications();
    if (!Notifications) return false;
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
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
    } catch {
      return false;
    }
  },

  scheduleBookmarkMilestone: async (count: number) => {
    const Notifications = getNotifications();
    if (!Notifications) return;
    try {
      if (count >= 5) {
        const milestoneSent = await AsyncStorage.getItem("milestone_5_sent");
        if (milestoneSent === "true") return;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Course Enthusiast! 🌟",
            body: `Wow! You've bookmarked ${count} courses. Ready to start your learning journey?`,
            data: { type: "bookmark_milestone" },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null,
        });

        await AsyncStorage.setItem("milestone_5_sent", "true");
      }
    } catch (error) {
      console.error("Failed to schedule milestone notification:", error);
    }
  },

  scheduleInactivityReminder: scheduleInactivityReminderInternal,

  trackActivity: async () => {
    await AsyncStorage.setItem("last_activity", new Date().toISOString());
    await scheduleInactivityReminderInternal();
  },
};
