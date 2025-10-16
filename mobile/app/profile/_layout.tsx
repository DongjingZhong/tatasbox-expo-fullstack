// All comments in English only.
import { Stack } from "expo-router";
import React from "react";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ← hide native header
      }}
    />
  );
}
