import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useCourseStore } from "@/store/useCourseStore";
import CourseCard from "@/components/CourseCard";
import { Search, SlidersHorizontal, BookOpen } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";

export default function CoursesScreen() {
  const { courses, bookmarks, loading, fetchCourses, toggleBookmark } =
    useCourseStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [courses, searchQuery]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <CourseCard
        course={item}
        isBookmarked={bookmarks.includes(item.id)}
        onToggleBookmark={toggleBookmark}
      />
    ),
    [bookmarks, toggleBookmark],
  );

  if (loading && !refreshing && courses.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <View className="px-4 py-4">
        <View className="flex-row items-center bg-card rounded-2xl px-4 py-3 border border-slate-200 shadow-sm">
          <Search size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-text text-base"
            placeholder="Search for courses..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity className="ml-2">
            <SlidersHorizontal size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={BookOpen}
            title="No Courses Found"
            description={
              searchQuery
                ? `No results for "${searchQuery}"`
                : "Stay tuned! We're adding new courses soon."
            }
            actionLabel={searchQuery ? "Clear Search" : "Refresh"}
            onAction={() => (searchQuery ? setSearchQuery("") : fetchCourses())}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
      />
    </SafeAreaView>
  );
}
