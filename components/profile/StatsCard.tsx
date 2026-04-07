import React from "react";
import { View, Text } from "react-native";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon }) => {
  return (
    <View className="bg-white rounded-[24px] p-3 flex-1 items-center justify-center border border-slate-100 shadow-sm mx-1 min-h-[110px]">
      <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mb-2">
        {icon}
      </View>
      <View className="items-center">
        <Text className="text-xl font-extrabold text-slate-800 mb-0.5">
          {value}
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="text-slate-400 text-[8px] font-black uppercase tracking-[0.5px] text-center"
        >
          {label}
        </Text>
      </View>
    </View>
  );
};
