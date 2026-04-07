import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Course, CourseState } from "@/types";
import api from "@/services/api";
import { notificationService } from "@/services/notificationService";

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  bookmarks: [],
  enrolled: [],
  loading: false,
  error: null,

  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch random products for courses
      const coursesRes = await api.get("/public/randomproducts?limit=10");
      const rawCourses = coursesRes.data.data.data;

      // Fetch random users for instructors
      const usersRes = await api.get("/public/randomusers?limit=10");
      const rawInstructors = usersRes.data.data.data;

      const formattedCourses: Course[] = rawCourses.map(
        (product: any, index: number) => {
          return {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            image:
              product.thumbnail || (product.images && product.images[0]) || "",
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
            // Realistic dynamic values based on product ID/Index
            duration: `${Math.floor(Math.random() * 10 + 5)}h ${Math.floor(Math.random() * 59)}m`,
            lessons: Math.floor(Math.random() * 20 + 10),
            students: `${(Math.random() * 20 + 1).toFixed(1)}k`,
            rating: parseFloat((Math.random() * (5.0 - 4.0) + 4.0).toFixed(1)),
            reviewsCount: `${(Math.random() * 5 + 1).toFixed(1)}k`,
          };
        },
      );

      // Load persisted bookmarks and enrolled
      const savedBookmarks = await AsyncStorage.getItem("bookmarks");
      const savedEnrolled = await AsyncStorage.getItem("enrolled");

      set({
        courses: formattedCourses,
        bookmarks: savedBookmarks ? JSON.parse(savedBookmarks) : [],
        enrolled: savedEnrolled ? JSON.parse(savedEnrolled) : [],
        loading: false,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to fetch courses",
      });
    }
  },

  toggleBookmark: async (id: number) => {
    const { bookmarks } = get();
    const isAdding = !bookmarks.includes(id);
    const newBookmarks = isAdding
      ? [...bookmarks, id]
      : bookmarks.filter((bId) => bId !== id);

    await AsyncStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
    set({ bookmarks: newBookmarks });

    if (isAdding && newBookmarks.length >= 5) {
      await notificationService.scheduleBookmarkMilestone(newBookmarks.length);
    }
  },

  enrollInCourse: async (id: number) => {
    const { enrolled } = get();
    if (enrolled.includes(id)) return;

    const newEnrolled = [...enrolled, id];
    await AsyncStorage.setItem("enrolled", JSON.stringify(newEnrolled));
    set({ enrolled: newEnrolled });
    
    // Track activity on enrollment
    await notificationService.trackActivity();
  },

  resetStore: async () => {
    await AsyncStorage.removeItem("bookmarks");
    await AsyncStorage.removeItem("enrolled");
    await AsyncStorage.removeItem("milestone_5_sent");
    set({ bookmarks: [], enrolled: [] });
  },
}));
