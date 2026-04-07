import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCourseStore } from "@/store/useCourseStore";
import {
  Heart,
  Star,
  Clock,
  BookOpen,
  ChevronRight,
  PlayCircle,
  Users,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { courses, bookmarks, enrolled, toggleBookmark, enrollInCourse } =
    useCourseStore();
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);

  const course = useMemo(() => {
    return courses.find((c) => c.id.toString() === id);
  }, [courses, id]);

  const isBookmarked = bookmarks.includes(Number(id));
  const isEnrolled = enrolled.includes(Number(id));

  const handleEnroll = async () => {
    if (isEnrolled) {
      router.push({
        pathname: "/webview",
        params: { courseData: JSON.stringify(course) },
      });
      return;
    }

    setEnrolling(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    enrollInCourse(Number(id));
    setEnrolling(false);
    Alert.alert("Success", "You have successfully enrolled in this course!", [
      {
        text: "Start Learning",
        onPress: () =>
          router.push({
            pathname: "/webview",
            params: { courseData: JSON.stringify(course) },
          }),
      },
    ]);
  };

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-text text-xl font-bold mb-4">
          Course not found
        </Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="relative">
          <Image
            source={{ uri: course.image }}
            className="w-full h-64 bg-slate-200"
            resizeMode="cover"
          />
          <TouchableOpacity
            className="absolute top-4 right-4 bg-white/90 p-3 rounded-full shadow-sm"
            onPress={() => toggleBookmark(course.id)}
          >
            <Heart
              size={24}
              color={isBookmarked ? "#ef4444" : "#94a3b8"}
              fill={isBookmarked ? "#ef4444" : "transparent"}
            />
          </TouchableOpacity>
          <TouchableOpacity className="absolute inset-0 items-center justify-center">
            <View className="bg-primary/80 w-16 h-16 rounded-full items-center justify-center">
              <PlayCircle size={32} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="p-6">
          <View className="flex-row items-center mb-4">
            <View className="bg-indigo-50 px-3 py-1 rounded-lg">
              <Text className="text-primary font-bold text-xs uppercase">
                {course.category}
              </Text>
            </View>
            <View className="flex-row items-center ml-auto">
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <Text className="text-text font-bold ml-1">4.8</Text>
              <Text className="text-muted ml-1">(1.2k reviews)</Text>
            </View>
          </View>

          <Text className="text-3xl font-bold text-text mb-4">
            {course.title}
          </Text>

          <View className="flex-row items-center mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {course.instructor?.picture?.medium && (
              <Image
                source={{ uri: course.instructor.picture.medium }}
                className="w-12 h-12 rounded-full mr-3 border-2 border-white"
              />
            )}
            <View>
              <Text className="text-muted text-xs mb-1">Instructor</Text>
              <Text className="text-text font-bold text-lg leading-5">
                {course.instructor
                  ? `${course.instructor.name.first} ${course.instructor.name.last}`
                  : "Unknown"}
              </Text>
            </View>
            <TouchableOpacity className="ml-auto bg-white p-2 rounded-xl shadow-sm border border-slate-100">
              <ChevronRight size={20} color="#6366f1" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mb-8 border-y border-slate-100 py-4">
            <View className="items-center">
              <Clock size={24} color="#64748b" />
              <Text className="text-text font-bold mt-2">12h 30m</Text>
              <Text className="text-muted text-xs">Duration</Text>
            </View>
            <View className="items-center border-x border-slate-100 px-8">
              <BookOpen size={24} color="#64748b" />
              <Text className="text-text font-bold mt-2">24</Text>
              <Text className="text-muted text-xs">Lessons</Text>
            </View>
            <View className="items-center">
              <Users size={24} color="#64748b" />
              <Text className="text-text font-bold mt-2">15.4k</Text>
              <Text className="text-muted text-xs">Students</Text>
            </View>
          </View>

          <Text className="text-xl font-bold text-text mb-3">
            About this Course
          </Text>
          <Text className="text-muted text-lg leading-7 mb-6">
            {course.description} This comprehensive course will take you from
            zero to hero in {course.category}. Learn the latest industry
            standards and best practices from experienced professionals.
          </Text>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white p-6 border-t border-slate-100 flex-row items-center shadow-2xl">
        <View className="flex-1">
          <Text className="text-muted text-sm">Course Price</Text>
          <Text className="text-text text-2xl font-black">${course.price}</Text>
        </View>
        <TouchableOpacity
          className={`flex-[2] bg-primary p-5 rounded-2xl items-center shadow-lg ${enrolling ? "opacity-70" : ""}`}
          onPress={handleEnroll}
          disabled={enrolling}
        >
          {enrolling ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {isEnrolled ? "Continue Learning" : "Enroll Now"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
