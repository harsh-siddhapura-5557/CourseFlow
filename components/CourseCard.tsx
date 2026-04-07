import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Course } from "@/types";
import { Heart } from "lucide-react-native";
import { useRouter } from "expo-router";

interface CourseCardProps {
  course: Course;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
}

const CourseCard = ({ course, isBookmarked, onToggleBookmark }: CourseCardProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="bg-card rounded-2xl overflow-hidden mb-4 shadow-sm border border-slate-100"
      activeOpacity={0.9}
      onPress={() => router.push(`/course/${course.id}`)}
    >
      <Image
        source={{ uri: course.image }}
        className="w-full h-48 bg-slate-200"
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          {course.instructor?.picture?.medium && (
            <Image
              source={{ uri: course.instructor.picture.medium }}
              className="w-6 h-6 rounded-full mr-2"
            />
          )}
          <Text className="text-muted text-xs font-medium">
            {course.instructor ? `${course.instructor.name.first} ${course.instructor.name.last}` : "Unknown Instructor"}
          </Text>
        </View>

        <Text className="text-text text-lg font-bold mb-1" numberOfLines={2}>
          {course.title}
        </Text>
        
        <Text className="text-muted text-sm mb-3" numberOfLines={2}>
          {course.description}
        </Text>

        <View className="flex-row items-center justify-between mt-auto">
          <Text className="text-primary font-bold text-lg">${course.price}</Text>
          <TouchableOpacity
            className={`p-2 rounded-full ${isBookmarked ? 'bg-red-50' : 'bg-slate-50'}`}
            onPress={() => onToggleBookmark(course.id)}
          >
            <Heart
              size={20}
              color={isBookmarked ? "#ef4444" : "#94a3b8"}
              fill={isBookmarked ? "#ef4444" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(CourseCard);
