import { Tabs } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "coral",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Entypo name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="signin"
        options={{ title: "Sign In" }}
      />
    </Tabs>
  );
}
