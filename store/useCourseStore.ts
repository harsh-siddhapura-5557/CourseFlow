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
        (product: any, index: number) => ({
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          image: product.image,
          instructor: rawInstructors[index]
            ? {
                id: rawInstructors[index].id,
                name: rawInstructors[index].name,
                picture: rawInstructors[index].picture,
                email: rawInstructors[index].email,
              }
            : undefined,
        }),
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

    if (isAdding && newBookmarks.length === 5) {
      await notificationService.scheduleBookmarkMilestone(5);
    }
  },

  enrollInCourse: async (id: number) => {
    const { enrolled } = get();
    if (enrolled.includes(id)) return;

    const newEnrolled = [...enrolled, id];
    await AsyncStorage.setItem("enrolled", JSON.stringify(newEnrolled));
    set({ enrolled: newEnrolled });
  },
}));
