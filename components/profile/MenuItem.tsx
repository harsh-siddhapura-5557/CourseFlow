import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { ChevronRight } from "lucide-react-native";

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  value?: string | number;
  onPress?: () => void;
  isLast?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({ 
  icon, 
  title, 
  value, 
  onPress, 
  isLast 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.6}
      className={`flex-row items-center p-5 ${!isLast ? 'border-b border-slate-50' : ''}`}
    >
      <View className="w-11 h-11 bg-indigo-50 rounded-2xl items-center justify-center mr-4">
        {icon}
      </View>
      <Text className="flex-1 text-slate-800 font-bold text-lg">{title}</Text>
      {value !== undefined && (
        <Text className="text-slate-500 mr-2 font-bold text-base">{value}</Text>
      )}
      <ChevronRight size={18} color="#CBD5E1" strokeWidth={3} />
    </TouchableOpacity>
  );
};
