import { Tabs } from "expo-router";
import { Book, Heart, User, LayoutDashboard } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#f8fafc" },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#94a3b8",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <LayoutDashboard color={color} size={size} />
          ),
          headerTitle: "Explore Courses",
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Heart color={color} size={size} />
          ),
          headerTitle: "Saved Courses",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <User color={color} size={size} />
          ),
          headerTitle: "My Profile",
        }}
      />
    </Tabs>
  );
}
