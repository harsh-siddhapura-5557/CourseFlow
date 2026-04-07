import React, { memo, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Course } from "@/types";
import { Star, Heart, Users, BookOpen, } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

interface CourseCardProps {
  course: Course;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
}

const CourseCard = ({
  course,
  isBookmarked,
  onToggleBookmark,
}: CourseCardProps) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const fallbackImage =
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80";

  return (
    <TouchableOpacity
      className="bg-card rounded-2xl overflow-hidden mb-4 shadow-sm border border-slate-100"
      activeOpacity={0.9}
      onPress={() => router.push(`/course/${course.id}`)}
    >
      {course.image && !imageError ? (
        <Image
          source={{ uri: course.image }}
          style={{ width: "100%", height: 192 }}
          className="bg-slate-200"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={{ width: "100%", height: 192 }}
          className="bg-indigo-50 items-center justify-center"
        >
          <BookOpen size={48} color={Colors.primary} strokeWidth={1.5} />
        </View>
      )}
      <TouchableOpacity
        onPress={() => onToggleBookmark(course.id)}
        className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-sm"
      >
        <Heart
          size={18}
          color={isBookmarked ? Colors.error : Colors.secondary}
          fill={isBookmarked ? Colors.error : "transparent"}
        />
      </TouchableOpacity>

      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <View className="bg-indigo-50 px-2 py-1 rounded-md">
            <Text className="text-[#6366f1] text-[10px] font-bold uppercase">
              {course.category}
            </Text>
          </View>
          <View className="flex-row items-center ml-auto">
            <Star size={12} color={Colors.warning} fill={Colors.warning} />
            <Text className="text-slate-900 font-bold ml-1 text-xs">
              {course.rating || "4.8"}
            </Text>
          </View>
        </View>

        <Text
          className="text-lg font-bold text-slate-900 mb-1"
          numberOfLines={1}
        >
          {course.title}
        </Text>
        <Text className="text-slate-500 text-xs mb-3" numberOfLines={2}>
          {course.description}
        </Text>

        <View className="flex-row items-center justify-between mt-auto">
          <Text className="text-[#6366f1] text-lg font-black">
            ${course.price}
          </Text>
          <View className="flex-row items-center">
            <Users size={14} color={Colors.secondary} />
            <Text className="text-slate-400 text-[10px] font-bold ml-1">
              {course.students || "1.2k"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CourseCard;
