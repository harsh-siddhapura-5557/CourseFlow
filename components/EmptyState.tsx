import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LucideIcon } from "lucide-react-native";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <View className="flex-1 items-center justify-center py-20 px-10">
    <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-6">
      <Icon size={48} color="#6366f1" opacity={0.5} />
    </View>
    <Text className="text-text text-2xl font-bold mb-2 text-center">{title}</Text>
    <Text className="text-muted text-center text-lg leading-6 mb-8">{description}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity 
        className="bg-primary px-8 py-4 rounded-2xl shadow-lg shadow-indigo-200"
        onPress={onAction}
      >
        <Text className="text-white font-bold text-lg">{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default EmptyState;
