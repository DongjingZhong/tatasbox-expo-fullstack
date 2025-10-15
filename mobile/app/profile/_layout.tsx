import { Stack } from "expo-router";
import React from "react";
import MenuButton from "../../components/ui/menu-button"; // 或 "@/components/ui/menu-button"（取决于你的路径别名）

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: "Tatasbox",
        headerLeft: () => <MenuButton />,
      }}
    />
  );
}
