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
import { Colors } from "@/constants/Colors";
import { notificationService } from "@/services/notificationService";

import { LegendList } from "@legendapp/list";

export default function CoursesScreen() {
  const { courses, bookmarks, loading, fetchCourses, toggleBookmark } =
    useCourseStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCourses();
    notificationService.trackActivity();
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
      <MemoizedCourseCard
        course={item}
        isBookmarked={bookmarks.includes(item.id)}
        onToggleBookmark={toggleBookmark}
      />
    ),
    [bookmarks, toggleBookmark],
  );

  if (loading && !refreshing && courses.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <View className="px-5 py-4 bg-white">
        <Text className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
          Explore Courses
        </Text>
        <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 h-12 border border-slate-100 shadow-sm">
          <Search size={18} color={Colors.secondary} strokeWidth={2} />
          <TextInput
            className="flex-1 ml-3 text-slate-900 text-base font-semibold"
            placeholder="Search courses..."
            placeholderTextColor={Colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              height: "100%",
              paddingTop: 0,
              paddingBottom: 0,
              lineHeight: 20,
            }}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            className="ml-2 h-8 w-8 items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm"
          >
            <SlidersHorizontal
              size={16}
              color={Colors.primary}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </View>

      <LegendList
        data={filteredCourses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        recycleItems={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={BookOpen}
            title="No Courses Found"
            description="Try searching for something else or browse all categories."
          />
        }
      />
    </SafeAreaView>
  );
}

const MemoizedCourseCard = React.memo(CourseCard);
