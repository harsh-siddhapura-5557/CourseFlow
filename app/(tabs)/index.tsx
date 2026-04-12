import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  TextInput,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { useCourseStore } from "@/store/useCourseStore";
import CourseCard from "@/components/CourseCard";
import { Search, SlidersHorizontal, BookOpen, X, Check } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import { Colors } from "@/constants/Colors";
import { notificationService } from "@/services/notificationService";
import type { Course } from "@/types";

import { LegendList } from "@legendapp/list";

type SortKey = "default" | "title_asc" | "title_desc" | "price_asc" | "price_desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "default", label: "Default order" },
  { key: "title_asc", label: "Title A → Z" },
  { key: "title_desc", label: "Title Z → A" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
];

function applySort(list: Course[], sortKey: SortKey): Course[] {
  const next = [...list];
  switch (sortKey) {
    case "title_asc":
      return next.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
    case "title_desc":
      return next.sort((a, b) => b.title.localeCompare(a.title, undefined, { sensitivity: "base" }));
    case "price_asc":
      return next.sort((a, b) => a.price - b.price);
    case "price_desc":
      return next.sort((a, b) => b.price - a.price);
    default:
      return next;
  }
}

export default function CoursesScreen() {
  const { courses, bookmarks, loading, error, fetchCourses, toggleBookmark } = useCourseStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchCourses();
    notificationService.trackActivity();
  }, [fetchCourses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCourses();
    } finally {
      setRefreshing(false);
    }
  }, [fetchCourses]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const c of courses) {
      const cat = c.category != null ? String(c.category).trim() : "";
      if (cat) s.add(cat);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const filtersActive = sortKey !== "default" || categoryFilter !== "all";

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = courses.filter((course) => {
      if (!q) return true;
      return (
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        String(course.category || "")
          .toLowerCase()
          .includes(q)
      );
    });
    if (categoryFilter !== "all") {
      list = list.filter((c) => String(c.category) === categoryFilter);
    }
    return applySort(list, sortKey);
  }, [courses, searchQuery, sortKey, categoryFilter]);

  const renderItem = useCallback(
    ({ item }: { item: Course }) => (
      <MemoizedCourseCard
        course={item}
        isBookmarked={bookmarks.includes(item.id)}
        onToggleBookmark={toggleBookmark}
      />
    ),
    [bookmarks, toggleBookmark],
  );

  const listEmpty = useMemo(() => {
    if (!loading && courses.length === 0) {
      return (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description={error || "We could not load the catalog. Check your connection and try again."}
          actionLabel="Try again"
          onAction={() => fetchCourses()}
        />
      );
    }
    return (
      <EmptyState
        icon={Search}
        title="No matches"
        description="Try a different search, reset filters, or clear the search box."
        actionLabel={filtersActive || searchQuery.trim() ? "Reset filters & search" : undefined}
        onAction={
          filtersActive || searchQuery.trim()
            ? () => {
                setSearchQuery("");
                setSortKey("default");
                setCategoryFilter("all");
              }
            : undefined
        }
      />
    );
  }, [
    loading,
    courses.length,
    filteredCourses.length,
    error,
    fetchCourses,
    filtersActive,
    searchQuery,
  ]);

  if (loading && !refreshing && courses.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white" edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="px-5 pt-2 pb-4 bg-white border-b border-slate-50">
        <Text className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Explore Courses</Text>
        {error && courses.length > 0 ? (
          <View className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <Text className="text-sm font-semibold text-amber-900">
              Using cached list — refresh failed. Pull down to retry.
            </Text>
            <Text className="mt-1 text-xs text-amber-800/90">{error}</Text>
          </View>
        ) : null}
        <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 h-12 border border-slate-100 shadow-sm">
          <Search size={18} color={Colors.secondary} strokeWidth={2} />
          <TextInput
            className="flex-1 ml-3 text-slate-900 text-base font-semibold"
            placeholder="Search title, description, category…"
            placeholderTextColor={Colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              height: "100%",
              paddingTop: 0,
              paddingBottom: 0,
              lineHeight: 20,
            }}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="never"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="mr-1 p-1"
              accessibilityLabel="Clear search"
            >
              <X size={18} color={Colors.muted} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterOpen(true)}
            className={`ml-1 h-9 w-9 items-center justify-center rounded-xl border shadow-sm ${
              filtersActive ? "border-primary bg-indigo-50" : "bg-white border-slate-100"
            }`}
            accessibilityLabel="Open filters and sort"
          >
            <SlidersHorizontal size={16} color={Colors.primary} strokeWidth={2} />
            {filtersActive ? <View className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" /> : null}
          </TouchableOpacity>
        </View>
      </View>

      <LegendList
        data={filteredCourses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        extraData={bookmarks}
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
        ListEmptyComponent={listEmpty}
      />

      <Modal
        visible={filterOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterOpen(false)}
      >
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setFilterOpen(false)}>
          <Pressable
            className="max-h-[85%] rounded-t-3xl bg-white px-5 pb-10 pt-4"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-slate-900">Sort & filter</Text>
              <TouchableOpacity onPress={() => setFilterOpen(false)} hitSlop={12}>
                <X size={24} color={Colors.muted} />
              </TouchableOpacity>
            </View>

            <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Sort by</Text>
            <View className="mb-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-1">
              {SORT_OPTIONS.map((opt) => {
                const selected = sortKey === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setSortKey(opt.key)}
                    className={`mb-1 flex-row items-center justify-between rounded-xl px-4 py-3 last:mb-0 ${
                      selected ? "bg-white shadow-sm shadow-slate-200/80" : ""
                    }`}
                  >
                    <Text className={`text-base ${selected ? "font-bold text-slate-900" : "text-slate-600"}`}>
                      {opt.label}
                    </Text>
                    {selected ? <Check size={20} color={Colors.primary} strokeWidth={2.5} /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Category</Text>
            <ScrollView className="max-h-48" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setCategoryFilter("all")}
                className={`mb-2 flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                  categoryFilter === "all" ? "border-primary bg-indigo-50" : "border-slate-100 bg-white"
                }`}
              >
                <Text className="font-semibold text-slate-800">All categories</Text>
                {categoryFilter === "all" ? <Check size={18} color={Colors.primary} /> : null}
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoryFilter(cat)}
                  className={`mb-2 flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                    categoryFilter === cat ? "border-primary bg-indigo-50" : "border-slate-100 bg-white"
                  }`}
                >
                  <Text className="font-medium text-slate-800">{cat}</Text>
                  {categoryFilter === cat ? <Check size={18} color={Colors.primary} /> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              className="mt-6 rounded-2xl bg-primary py-4"
              onPress={() => {
                setSortKey("default");
                setCategoryFilter("all");
              }}
            >
              <Text className="text-center text-lg font-bold text-white">Reset sort & category</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const MemoizedCourseCard = React.memo(CourseCard);
