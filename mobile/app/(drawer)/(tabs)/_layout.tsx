import { Tabs } from "expo-router";
import React from "react";
import MenuButton from "../../../components/ui/menu-button";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // ← 隐藏顶部默认导航栏
        headerLeft: () => <MenuButton />,
        tabBarStyle: { display: "none" },
      }}
    />
  );
}
