import React, { useCallback, useMemo } from "react";
import { View, FlatList } from "react-native";
import { useCourseStore } from "@/store/useCourseStore";
import CourseCard from "@/components/CourseCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart } from "lucide-react-native";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "expo-router";

export default function BookmarksScreen() {
  const { courses, bookmarks, toggleBookmark } = useCourseStore();
  const router = useRouter();

  const bookmarkedCourses = useMemo(() => {
    return courses.filter((course) => bookmarks.includes(course.id));
  }, [courses, bookmarks]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <CourseCard
        course={item}
        isBookmarked={true}
        onToggleBookmark={toggleBookmark}
      />
    ),
    [toggleBookmark],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <FlatList
        data={bookmarkedCourses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={Heart}
            title="No Bookmarks Yet"
            description="Save your favorite courses here to access them easily later."
            actionLabel="Explore Courses"
            onAction={() => router.push("/(tabs)")}
          />
        }
      />
    </SafeAreaView>
  );
}
