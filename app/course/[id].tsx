import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
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
  ChevronLeft,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { courses, bookmarks, enrolled, toggleBookmark, enrollInCourse } =
    useCourseStore();
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);
  const [imageError, setImageError] = useState(false);

  const course = useMemo(() => {
    return courses.find((c) => c.id.toString() === id);
  }, [courses, id]);

  const isBookmarked = bookmarks.includes(Number(id));
  const isEnrolled = enrolled.includes(Number(id));

  const fallbackImage =
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80";

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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Custom Header with Back Button */}
      <View className="px-6 py-4 flex-row items-center bg-white border-b border-slate-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={Colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <Text className="text-xl font-extrabold text-slate-900">
            Course Details
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
        className="flex-1 bg-[#F8FAFC]"
      >
        <View className="relative">
          {course.image && !imageError ? (
            <Image
              source={{ uri: course.image }}
              className="w-full h-80 bg-slate-200"
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="w-full h-80 bg-indigo-50 items-center justify-center">
              <BookOpen size={80} color={Colors.primary} strokeWidth={1} />
            </View>
          )}
          <View className="absolute inset-0 bg-black/20" />

          <TouchableOpacity
            className="absolute top-6 right-6 bg-white/95 p-3.5 rounded-full shadow-xl active:scale-95"
            onPress={() => toggleBookmark(course.id)}
          >
            <Heart
              size={24}
              color={isBookmarked ? Colors.error : Colors.secondary}
              fill={isBookmarked ? Colors.error : "transparent"}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>

        <View className="p-7 -mt-10 bg-[#F8FAFC] rounded-t-[40px] shadow-2xl">
          <View className="flex-row items-center mb-5">
            <View className="bg-indigo-100/50 px-3.5 py-1.5 rounded-xl border border-indigo-200/50">
              <Text className="text-[#6366f1] font-extrabold text-[9px] uppercase tracking-[1.5px]">
                {course.category}
              </Text>
            </View>
            <View className="flex-row items-center ml-auto bg-white px-2.5 py-1.5 rounded-xl shadow-sm border border-slate-100">
              <Star size={14} color={Colors.warning} fill={Colors.warning} />
              <Text className="text-slate-900 font-bold ml-1 text-xs">
                {course.rating || "4.8"}
              </Text>
              <Text className="text-slate-400 font-bold ml-0.5 text-[10px]">
                ({course.reviewsCount || "1.2k"})
              </Text>
            </View>
          </View>

          <Text className="text-3xl font-extrabold text-slate-900 leading-tight mb-5 tracking-tight">
            {course.title}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center mb-7 bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm"
          >
            <View className="relative">
              {course.instructor?.picture?.medium ? (
                <Image
                  source={{ uri: course.instructor.picture.medium }}
                  className="w-12 h-12 rounded-full border-2 border-slate-50 shadow-sm"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-indigo-500 items-center justify-center border-2 border-slate-50">
                  <Users size={20} color={Colors.white} />
                </View>
              )}
              <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
            </View>

            <View className="ml-3.5 flex-1">
              <Text className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.5px] mb-0.5">
                Instructor
              </Text>
              <Text className="text-slate-900 font-bold text-lg leading-5">
                {course.instructor
                  ? `${course.instructor.name.first} ${course.instructor.name.last}`
                  : "Joseph Evans"}
              </Text>
            </View>

            <View className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <ChevronRight
                size={18}
                color={Colors.primary}
                strokeWidth={2.5}
              />
            </View>
          </TouchableOpacity>

          <View className="flex-row justify-between mb-8 bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
            <View className="items-center flex-1">
              <View className="bg-indigo-50 w-11 h-11 rounded-2xl items-center justify-center mb-2.5">
                <Clock size={20} color={Colors.primary} strokeWidth={2} />
              </View>
              <Text className="text-slate-900 font-bold text-sm">
                {course.duration || "12h 30m"}
              </Text>
              <Text className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.5px]">
                Duration
              </Text>
            </View>

            <View className="w-[1px] h-10 bg-slate-100 self-center" />

            <View className="items-center flex-1">
              <View className="bg-amber-50 w-11 h-11 rounded-2xl items-center justify-center mb-2.5">
                <BookOpen size={20} color={Colors.warning} strokeWidth={2} />
              </View>
              <Text className="text-slate-900 font-bold text-sm">
                {course.lessons || "24"}
              </Text>
              <Text className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.5px]">
                Lessons
              </Text>
            </View>

            <View className="w-[1px] h-10 bg-slate-100 self-center" />

            <View className="items-center flex-1">
              <View className="bg-rose-50 w-11 h-11 rounded-2xl items-center justify-center mb-2.5">
                <Users size={20} color={Colors.error} strokeWidth={2} />
              </View>
              <Text className="text-slate-900 font-bold text-sm">
                {course.students || "15.4k"}
              </Text>
              <Text className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.5px]">
                Students
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">
              About this Course
            </Text>
            <Text className="text-slate-500 text-base leading-6 font-medium">
              {course.description} This comprehensive course will take you from
              zero to hero in {course.category}. Learn the latest industry
              standards and best practices from experienced professionals.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 bg-white px-8 pt-5 pb-8 flex-row items-center border-t border-slate-100 shadow-2xl">
        <View className="mr-8">
          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[1px] mb-1">
            Total Price
          </Text>
          <Text className="text-[#6366f1] text-3xl font-black tracking-tighter">
            ${course.price}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          className={`flex-1 bg-[#6366f1] py-5 rounded-[28px] items-center shadow-xl shadow-indigo-100 ${enrolling ? "opacity-70" : ""}`}
          onPress={handleEnroll}
          disabled={enrolling}
        >
          {enrolling ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-black text-lg tracking-tight">
              {isEnrolled ? "Continue Learning" : "Enroll Now"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
