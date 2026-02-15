import { Tabs } from "expo-router";
import { FileText, House, Settings } from "lucide-react-native";
import { useEffect } from "react";
import CustomTabBar from "@/components/CustomTabBar";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtime } from "@/hooks/useRealtime";
import { useSync } from "@/hooks/useSync";

export default function TabsLayout() {
  const { refresh, user } = useAuth();

  useEffect(() => {
    if (!user) {
      refresh();
    }
  }, [user, refresh]);

  useSync();
  useRealtime();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarLabel: "Notes",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
