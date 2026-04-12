import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as SecureStore from "expo-secure-store";
import { Course, CourseState } from "@/types";
import api from "@/services/api";
import { notificationService } from "@/services/notificationService";
import { ASYNC_STORAGE_KEYS, SECURE_STORE_KEYS } from "@/constants/storageKeys";
import {
  fetchRemoteUserProgress,
  mergeIdLists,
  pushRemoteUserProgress,
} from "@/services/userProgressRemote";
import { logger } from "@/utils/logger";

/** FreeAPI public endpoints often wrap arrays as `body.data.data` */
function extractList(apiBody: unknown): any[] {
  if (!apiBody || typeof apiBody !== "object") return [];
  const L1 = (apiBody as { data?: unknown }).data;
  if (Array.isArray(L1)) return L1;
  if (L1 && typeof L1 === "object") {
    const L2 = (L1 as { data?: unknown }).data;
    if (Array.isArray(L2)) return L2;
  }
  return [];
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  bookmarks: [],
  enrolled: [],
  loading: false,
  error: null,

  mergeRemoteProgressAfterLogin: async () => {
    const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
    if (!token) return;

    try {
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        logger.warn("CourseStore", "mergeRemoteProgressAfterLogin skipped (offline)");
        return;
      }

      const localRawB = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.BOOKMARKS);
      const localRawE = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ENROLLED);
      const localB: number[] = localRawB ? JSON.parse(localRawB) : [];
      const localE: number[] = localRawE ? JSON.parse(localRawE) : [];

      const remote = await fetchRemoteUserProgress();
      const bookmarks = mergeIdLists(localB, remote.bookmarks);
      const enrolled = mergeIdLists(localE, remote.enrolled);

      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.ENROLLED, JSON.stringify(enrolled));
      set({ bookmarks, enrolled });

      await pushRemoteUserProgress({ bookmarks, enrolled });
      logger.info("CourseStore", "Progress merged and pushed to server");
    } catch (e: unknown) {
      logger.warn("CourseStore", "mergeRemoteProgressAfterLogin failed", {
        message: (e as Error).message,
      });
    }
  },

  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const coursesRes = await api.get("/public/randomproducts?limit=10");
      const rawCourses = extractList(coursesRes.data);

      const usersRes = await api.get("/public/randomusers?limit=10");
      const rawInstructors = extractList(usersRes.data);

      if (!rawCourses.length) {
        set({
          courses: [],
          loading: false,
          error: "No courses returned from the API.",
        });
        logger.warn("CourseStore", "fetchCourses: empty product list");
        return;
      }

      const formattedCourses: Course[] = rawCourses.map((product: any, index: number) => {
        return {
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          image: product.thumbnail || (product.images && product.images[0]) || "",
          instructor: rawInstructors[index]
            ? {
                id: rawInstructors[index].id,
                name: rawInstructors[index].name,
                picture: {
                  medium: rawInstructors[index].picture?.medium || "",
                },
                email: rawInstructors[index].email,
              }
            : undefined,
          duration: `${Math.floor(Math.random() * 10 + 5)}h ${Math.floor(Math.random() * 59)}m`,
          lessons: Math.floor(Math.random() * 20 + 10),
          students: `${(Math.random() * 20 + 1).toFixed(1)}k`,
          rating: parseFloat((Math.random() * (5.0 - 4.0) + 4.0).toFixed(1)),
          reviewsCount: `${(Math.random() * 5 + 1).toFixed(1)}k`,
        };
      });

      const savedBookmarks = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.BOOKMARKS);
      const savedEnrolled = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ENROLLED);

      set({
        courses: formattedCourses,
        bookmarks: savedBookmarks ? JSON.parse(savedBookmarks) : [],
        enrolled: savedEnrolled ? JSON.parse(savedEnrolled) : [],
        loading: false,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch courses";
      set({ loading: false, error: msg });
      logger.error("CourseStore", "fetchCourses failed", { message: msg });
    }
  },

  toggleBookmark: async (id: number) => {
    const { bookmarks, enrolled } = get();
    const isAdding = !bookmarks.includes(id);
    const newBookmarks = isAdding
      ? [...bookmarks, id]
      : bookmarks.filter((bId) => bId !== id);

    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.BOOKMARKS, JSON.stringify(newBookmarks));
    set({ bookmarks: newBookmarks });

    const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
    const net = await NetInfo.fetch();
    if (token && net.isConnected) {
      try {
        await pushRemoteUserProgress({ bookmarks: newBookmarks, enrolled });
      } catch (e: unknown) {
        logger.warn("CourseStore", "toggleBookmark remote push failed", {
          message: (e as Error).message,
        });
      }
    }

    if (isAdding && newBookmarks.length >= 5) {
      await notificationService.scheduleBookmarkMilestone(newBookmarks.length);
    }
  },

  enrollInCourse: async (id: number) => {
    const { enrolled, bookmarks } = get();
    if (enrolled.includes(id)) return;

    const newEnrolled = [...enrolled, id];
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.ENROLLED, JSON.stringify(newEnrolled));
    set({ enrolled: newEnrolled });

    const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
    const net = await NetInfo.fetch();
    if (token && net.isConnected) {
      try {
        await pushRemoteUserProgress({ bookmarks, enrolled: newEnrolled });
      } catch (e: unknown) {
        logger.warn("CourseStore", "enrollInCourse remote push failed", {
          message: (e as Error).message,
        });
      }
    }

    await notificationService.trackActivity();
  },

  resetStore: async () => {
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.BOOKMARKS);
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.ENROLLED);
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.MILESTONE_5_SENT);
    set({ bookmarks: [], enrolled: [] });
  },
}));
